package main

import (
	"database/sql"
	"fmt"
	"millionairesServer/protobufMessages"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

const DEFAULT_TRIES_LEFT = 3

// Inserts a player into the database and returns its' id.
func createPlayer(ctx *fiber.Ctx, name string) (*Snowflake, error) {
	var db = ctx.Locals("db").(*sql.DB)

	logger.Printf("Creating a player with name `%s`.", name)

	playerId := newSnowflake(SF_PLAYER)
	_, err := db.Exec("INSERT INTO players (snowflake_id, name, tries_left) VALUES (?, ?, ?);", playerId.RawSnowflake, name, DEFAULT_TRIES_LEFT)
	if err != nil {
		return nil, err
	}

	logger.Printf("Player with name `%s` successfully created! (`%d`)", name, playerId.RawSnowflake)

	return &playerId, nil
}

// If a player with the specified ID doesn't exsit, the error will be `sql.ErrNoRows`
func getPlayerTriesLeft(ctx *fiber.Ctx, playerId Snowflake) (int, error) {
	var db = ctx.Locals("db").(*sql.DB)

	logger.Printf("Getting the number of tries left for a player with id `%d`.", playerId.RawSnowflake)

	triesLeftRow := db.QueryRow("SELECT players.tries_left FROM players WHERE players.snowflake_id = ?;", playerId.RawSnowflake)

    var triesLeft int
    err := triesLeftRow.Scan(&triesLeft)

	if err == sql.ErrNoRows {
        logger.Printf("Player with id `%d` doesn't exist!", playerId.RawSnowflake)
	}
    if err != nil {
		return 0, err
    }

	logger.Printf("Player with id `%d` has `%d` tries left!", playerId.RawSnowflake, triesLeft)

	return triesLeft, nil
}

func doesPlayerExist(ctx *fiber.Ctx, name string) (bool, *Snowflake, error) {
	var db = ctx.Locals("db").(*sql.DB)

	logger.Printf("Checking if a player with name `%s` exists.", name)

	playerIdRow := db.QueryRow("SELECT players.snowflake_id FROM players WHERE players.name = ?;", name)

    var playerIdNum int64
    err := playerIdRow.Scan(&playerIdNum)

	if err == sql.ErrNoRows {
        logger.Printf("Player with name `%s` doesn't exist!", name)
		return false, nil, nil
	} else if err != nil {
		return false, nil, err
    }

    playerId := snowflakeFromInt(playerIdNum)
    logger.Printf("Player with name `%s` already exists! (`%d`)", name, playerId.RawSnowflake)

	return true, &playerId, nil
}

// Inserts a run into the database and returns its' id.
// If a player doesn't exist, returns `sql.ErrNoRows`
// If the snowflake and the error are `nil`, it means that the player has no more tries left
func createRun(ctx *fiber.Ctx, playerId Snowflake) (*Snowflake, error) {
	var db = ctx.Locals("db").(*sql.DB)

	logger.Printf("Creating a run for a player with id `%d`.", playerId.RawSnowflake)

    // Check if the player has still tries left
    triesLeft, err := getPlayerTriesLeft(ctx, playerId)
    if err != nil {
        return nil, err
    }

    if triesLeft <= 0 {
        logger.Printf("Player with id `%d` has no more tries left, abandoning run creation.", playerId.RawSnowflake)
        return nil, nil
    }

	runId := newSnowflake(SF_RUN)
	_, err = db.Exec("INSERT INTO runs (snowflake_id, player_id, ended) VALUES (?, ?, false); UPDATE players SET tries_left = (tries_left - 1) WHERE snowflake_id = ?;", runId.RawSnowflake, playerId.RawSnowflake, playerId.RawSnowflake)
	if err != nil {
		return nil, err
	}

	logger.Printf("A run for a player with id `%d` successfully created! (`%d`)", playerId.RawSnowflake, runId.RawSnowflake)

	return &runId, nil
}

// Updates the run in the database and returns whether it was actually updated (it might have already been ended before).
func endRun(ctx *fiber.Ctx, runId Snowflake) (bool, error) {
	var db = ctx.Locals("db").(*sql.DB)

	logger.Printf("Ending a run with id `%d`.", runId.RawSnowflake)

	update, err := db.Exec("UPDATE runs SET ended = true WHERE snowflake_id == ? AND ended <> true", runId.RawSnowflake)
	if err != nil {
		return false, c_error(ctx, fmt.Sprintf("Error while trying to update the runs' state: `%s`", err.Error()), fiber.ErrBadRequest.Code)
	}

	affected, err := update.RowsAffected()
	if err != nil {
		return false, c_error(ctx, fmt.Sprintf("Error while retriving affected rows: `%s`", err.Error()), fiber.ErrBadRequest.Code)
	}

	if affected > 0 {
		logger.Printf("Run with id `%d` successfully ended!", runId.RawSnowflake)
	} else {
		logger.Printf("Run with id `%d` already ended.", runId.RawSnowflake)
	}

	return (affected > 0), nil
}

func startRunRoute(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")

	// Parse request body
	var request = &protobufMessages.StartRunRequest{}
	if err := proto.Unmarshal(ctx.Body(), request); err != nil {
		return c_error(ctx, err.Error(), fiber.ErrBadRequest.Code)
	}

    logger.Print("`startRun` route visited with the following data { ", request, " }")

    playerExist, playerId, err := doesPlayerExist(ctx, request.Name)

    if (!playerExist) {
        playerId, err = createPlayer(ctx, request.Name)
        if err != nil {
            return c_error(ctx, fmt.Sprintf("Unable to create a new player with the name `%s`. Reason: `%s`", request.Name, err), fiber.ErrInternalServerError.Code)
        }
    }

	runId, err := createRun(ctx, *playerId)

    // Player has no tries left
    // TODO: Send an appropariate response
    if runId == nil && err == nil {
        return nil
    }

	if err != nil {
        return c_error(ctx, fmt.Sprintf("Unable to start a new run with id `%d`. Reason: `%s`", runId.RawSnowflake, err), fiber.ErrInternalServerError.Code)
	}

	question, err := getRandomQuestion(ctx, 0)
	if err != nil {
        return c_error(ctx, fmt.Sprintf("Unable to get the first question for a run with id `%d`. Reason: `%s`", runId.RawSnowflake, err), fiber.ErrInternalServerError.Code)
	}

	err = assignQuestionToRun(ctx, *runId, snowflakeFromInt(int64(question.Question.Id)))
	if err != nil {
        return c_error(ctx, fmt.Sprintf("Unable to assign the first question for a run with id `%d`. Reason: `%s`", runId.RawSnowflake, err), fiber.ErrInternalServerError.Code)
	}

	var response = protobufMessages.StartRunResponse{}
	response.RunId = strconv.FormatInt(runId.RawSnowflake, 10)
	response.Question = question
	out, err := proto.Marshal(&response)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Unable to encode response as bytes: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	logger.Printf("Succesfully started a run with id `%d` for a user with id `%d`.", runId.RawSnowflake, playerId.RawSnowflake)
	return ctx.Status(http.StatusOK).Send(out)
}

func getRunsRoute(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")
	var db = ctx.Locals("db").(*sql.DB)

	logger.Println("Getting runs.")

	run_rows, err := db.Query("SELECT r.snowflake_id AS run_id, p.name AS player_name, rl.used_lifelines AS last_used_lifeline, rq.question_num = 11 AND a.is_correct = TRUE AS won FROM runs r JOIN players p ON r.player_id = p.snowflake_id JOIN run_questions rq ON r.snowflake_id = rq.run_id LEFT JOIN run_lifelines rl ON rq.id = rl.run_question_id LEFT JOIN answers a ON rq.answer_id = a.id WHERE r.ended = TRUE AND rq.id IN ( SELECT MAX(id) FROM run_questions GROUP BY run_id);")
	if err != nil {
        c_error(ctx, fmt.Sprintf("Unable to get runs. Reason: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	var response = protobufMessages.GetRunsResponse{}
	for run_rows.Next() {
		run := protobufMessages.EndedRunStat{}
        var usedLifelines sql.NullInt64
		run_rows.Scan(&run.RunId, &run.Name, &usedLifelines, &run.Won)
        if !usedLifelines.Valid {
            run.UsedLifelines = 0
        } else {
            run.UsedLifelines = int32(usedLifelines.Int64)
        }
        response.Runs = append(response.Runs, &run)
	}
	defer run_rows.Close()
    run_rows.Close()

	out, err := proto.Marshal(&response)
	if err != nil {
        c_error(ctx, fmt.Sprintf("Runs got, unable to encode response as bytes. Reason: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	logger.Println("Successfuly got runs.")

	return ctx.Status(http.StatusOK).Send(out)
}

func endRunRoute(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")

	var request = &protobufMessages.EndRunRequest{}

	if err := proto.Unmarshal(ctx.Body(), request); err != nil {
		return c_error(ctx, err.Error(), fiber.ErrBadRequest.Code)
	}

	// Parse run id
	runIdAsInt, err := strconv.Atoi(request.RunId)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Error while parsing run_id: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	runId := snowflakeFromInt(int64(runIdAsInt))

	affected, err := endRun(ctx, runId)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Error while ending the run with id `%d`: `%s`", runId.RawSnowflake, err), fiber.ErrInternalServerError.Code)
	}

	var response protobufMessages.EndRunResponse
	response.RunAffected = affected

	out, err := proto.Marshal(&response)
	if err != nil {
		c_error(ctx, fmt.Sprintf("Run ended, unable to encode response as bytes: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	return ctx.Status(http.StatusOK).Send(out)
}
