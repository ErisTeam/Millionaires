package main

import (
	"database/sql"
	"errors"
	"fmt"
	"millionairesServer/protobufMessages"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

var ErrNoMoreTries = errors.New("Player has no more tries left")
var ERROR_NAME_EMPTY = errors.New("Name can't be empty.")
var ERROR_NAME_TOO_SHORT = errors.New("Name can't be less than 3 characters wide.")
var ERROR_NAME_TOO_LONG = errors.New("Name can't be more than 255 characters wide.")
var ERROR_ENDRUN_UPDATE = errors.New("Unable to update `ended` status of a run.")
var ERROR_ENDRUN_AFFECTED = errors.New("Unable to check whether `ended` status of a run was affected.")

const DEFAULT_TRIES_LEFT = 3

// Inserts a player into the database and returns its' id.
func createPlayer(ctx *fiber.Ctx, name string) (*Snowflake, error) {
	var db = ctx.Locals("db").(*sql.DB)

	loggerInfo.Printf("Creating a player with name `%s`.", name)

	playerId := newSnowflake(SF_PLAYER)
	_, err := db.Exec("INSERT INTO players (snowflake_id, name, tries_left) VALUES (?, ?, ?);", playerId.RawSnowflake, name, DEFAULT_TRIES_LEFT)
	if err != nil {
		loggerWarn.Printf("Unable to create a player with name `%s`. Reason: `%s`", name, err)
		return nil, err
	}

	loggerInfo.Printf("Player with name `%s` successfully created! (`%d`)", name, playerId.RawSnowflake)

	return &playerId, nil
}

// If a player with the specified ID doesn't exsit, the error will be `sql.ErrNoRows`
func getPlayerTriesLeft(ctx *fiber.Ctx, playerId Snowflake) (int, error) {
	var db = ctx.Locals("db").(*sql.DB)

	loggerInfo.Printf("Getting the number of tries left for a player with id `%d`.", playerId.RawSnowflake)

	triesLeftRow := db.QueryRow("SELECT players.tries_left FROM players WHERE players.snowflake_id = ?;", playerId.RawSnowflake)

	var triesLeft int
	err := triesLeftRow.Scan(&triesLeft)

	if err == sql.ErrNoRows {
		loggerInfo.Printf("Player with id `%d` doesn't exist!", playerId.RawSnowflake)
	}
	if err != nil {
		loggerWarn.Printf("Unable to get tries left of a player with ID `%d`. Reason: `%s`", playerId.RawSnowflake, err)
		return 0, err
	}

	loggerInfo.Printf("Player with id `%d` has `%d` tries left!", playerId.RawSnowflake, triesLeft)
	return triesLeft, nil
}

func doesPlayerExist(ctx *fiber.Ctx, name string) (bool, *Snowflake, error) {
	var db = ctx.Locals("db").(*sql.DB)

	loggerInfo.Printf("Checking if a player with name `%s` exists.", name)

	playerIdRow := db.QueryRow("SELECT players.snowflake_id FROM players WHERE players.name = ?;", name)

	var playerIdNum int64
	err := playerIdRow.Scan(&playerIdNum)

	if err == sql.ErrNoRows {
		loggerInfo.Printf("Player with name `%s` doesn't exist!", name)
		return false, nil, nil
	} else if err != nil {
		loggerWarn.Printf("Unable to check if a player with name `%s` exists. Reason: `%s`", name, err)
		return false, nil, err
	}

	playerId := snowflakeFromInt(playerIdNum)
	loggerInfo.Printf("Player with name `%s` already exists! (`%d`)", name, playerId.RawSnowflake)
	return true, &playerId, nil
}

// Inserts a run into the database and returns its' id.
// If a player doesn't exist, returns `sql.ErrNoRows`
// If the snowflake and the error are `nil`, it means that the player has no more tries left
func createRun(ctx *fiber.Ctx, playerId Snowflake) (*Snowflake, error) {
	var db = ctx.Locals("db").(*sql.DB)

	loggerInfo.Printf("Creating a run for a player with id `%d`.", playerId.RawSnowflake)

	// Check if the player has still tries left
	triesLeft, err := getPlayerTriesLeft(ctx, playerId)
	if err != nil {
		return nil, err
	}

	if triesLeft <= 0 {
		loggerInfo.Printf("Player with id `%d` has no more tries left, abandoning run creation.", playerId.RawSnowflake)
		return nil, ErrNoMoreTries
	}

	runId := newSnowflake(SF_RUN)
	_, err = db.Exec("INSERT INTO runs (snowflake_id, player_id, ended) VALUES (?, ?, false); UPDATE players SET tries_left = (tries_left - 1) WHERE snowflake_id = ?;", runId.RawSnowflake, playerId.RawSnowflake, playerId.RawSnowflake)
	if err != nil {
		loggerWarn.Printf("Unable to create a run for player with ID `%d`. Reason: `%s`", playerId.RawSnowflake, err)
		return nil, err
	}

	loggerInfo.Printf("A run for a player with id `%d` successfully created! (`%d`)", playerId.RawSnowflake, runId.RawSnowflake)
	return &runId, nil
}

// Updates the run in the database and returns whether it was actually updated (it might have already been ended before).
func endRun(ctx *fiber.Ctx, runId Snowflake) (bool, error) {
	var db = ctx.Locals("db").(*sql.DB)

	loggerInfo.Printf("Ending a run with id `%d`.", runId.RawSnowflake)

	update, err := db.Exec("UPDATE runs SET ended = true WHERE snowflake_id == ? AND ended <> true", runId.RawSnowflake)
	if err != nil {
		loggerWarn.Printf("Unable to update `ended` status of a run with ID `%d`. Reason: `%s`", runId.RawSnowflake, err)
		return false, ERROR_ENDRUN_UPDATE
	}

	affected, err := update.RowsAffected()
	if err != nil {
		loggerWarn.Printf("Unable to check whether `ended` status of a run with ID `%d` was affected. Reason: `%s`", runId.RawSnowflake, err)
		return false, ERROR_ENDRUN_AFFECTED
	}

	if affected > 0 {
		loggerInfo.Printf("Run with id `%d` successfully ended!", runId.RawSnowflake)
	} else {
		loggerInfo.Printf("Run with id `%d` already ended.", runId.RawSnowflake)
	}

	return (affected > 0), nil
}

func startRunRoute(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")

	// Parse request body
	var request = &protobufMessages.StartRunRequest{}
	if err := proto.Unmarshal(ctx.Body(), request); err != nil {
		return c_error(ctx, routeFmt("startRun", fmt.Sprintf("Unable to unmarshal request. Reason: `%s`", err.Error())), fiber.ErrInternalServerError.Code)
	}

	loggerInfo.Print(routeFmt("startRun", fmt.Sprint("Visited with the following data { ", request, " }")))

	// Handle `request.Name`
	nameLen := len(request.Name)
	var err error
	switch {
	case nameLen == 0:
		{
			err = ERROR_NAME_EMPTY
			break
		}
	case nameLen < 3:
		{
			err = ERROR_NAME_TOO_SHORT
			break
		}
	case nameLen > 255:
		{
			err = ERROR_NAME_TOO_LONG
			break
		}
	default:
		break // Gut
	}

	if err != nil {
		return c_error(ctx, routeFmt("startRun", err.Error()), fiber.ErrBadRequest.Code)
	}

	playerExist, playerId, err := doesPlayerExist(ctx, request.Name)
	if err != nil {
		return c_error(ctx, routeFmt("startRun", fmt.Sprintf("Unable to check if a player with name `%s` exists. Reason: `%s`", request.Name, err)), fiber.ErrInternalServerError.Code)
	}

	if !playerExist {
		playerId, err = createPlayer(ctx, request.Name)
		if err != nil {
			return c_error(ctx, routeFmt("startRun", fmt.Sprintf("Unable to create a new player with the name `%s`. Reason: `%s`", request.Name, err)), fiber.ErrInternalServerError.Code)
		}
	}

	runId, err := createRun(ctx, *playerId)

	// Player has no tries left
	if errors.Is(err, ErrNoMoreTries) {
		return c_error(ctx, routeFmt("startRun", fmt.Sprintf("Player with ID `%d` has no more tries left.", playerId.RawSnowflake)), fiber.ErrBadRequest.Code)
	}

	if err != nil {
		return c_error(ctx, routeFmt("startRun", fmt.Sprintf("Unable to start a new run with id `%d`. Reason: `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
	}

	question, err := getRandomQuestion(ctx, *runId, 0)
	if err != nil {
		return c_error(ctx, routeFmt("startRun", fmt.Sprintf("Unable to get the first question for a run with id `%d`. Reason: `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
	}

	err = assignQuestionToRun(ctx, *runId, snowflakeFromInt(int64(question.Question.Id)))
	if err != nil {
		return c_error(ctx, routeFmt("startRun", fmt.Sprintf("Unable to assign the first question for a run with id `%d`. Reason: `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
	}

	var response = protobufMessages.StartRunResponse{}
	response.RunId = strconv.FormatInt(runId.RawSnowflake, 10)
	response.Question = question
	out, err := proto.Marshal(&response)
	if err != nil {
		return c_error(ctx, routeFmt("startRun", fmt.Sprintf("Unable to encode response as bytes. Reason: `%s`", err)), fiber.ErrInternalServerError.Code)
	}

	loggerInfo.Println(routeFmt("startRun", fmt.Sprintf("Succesfully started a run with id `%d` for a user with id `%d`.", runId.RawSnowflake, playerId.RawSnowflake)))
	return ctx.Status(http.StatusOK).Send(out)
}

func getRunsRoute(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")
	var db = ctx.Locals("db").(*sql.DB)

	loggerInfo.Println(routeFmt("getRuns", "Visited."))

	run_rows, err := db.Query("SELECT r.snowflake_id AS run_id, p.name AS player_name, rl.used_lifelines AS last_used_lifeline, rq.question_num = 11 AND a.is_correct = TRUE AS won FROM runs r JOIN players p ON r.player_id = p.snowflake_id JOIN run_questions rq ON r.snowflake_id = rq.run_id LEFT JOIN run_lifelines rl ON rq.id = rl.run_question_id LEFT JOIN answers a ON rq.answer_id = a.id WHERE r.ended = TRUE AND rq.id IN ( SELECT MAX(id) FROM run_questions GROUP BY run_id);")
	if err != nil {
		return c_error(ctx, routeFmt("getRuns", fmt.Sprintf("Unable to get runs. Reason: `%s`", err)), fiber.ErrInternalServerError.Code)
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

	out, err := proto.Marshal(&response)
	if err != nil {
		return c_error(ctx, routeFmt("getRuns", fmt.Sprintf("Unable to encode response as bytes. Reason: `%s`", err)), fiber.ErrInternalServerError.Code)
	}

	loggerInfo.Println(routeFmt("startRun", "Successfuly got runs."))
	return ctx.Status(http.StatusOK).Send(out)
}

func endRunRoute(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")

	var request = &protobufMessages.EndRunRequest{}

	if err := proto.Unmarshal(ctx.Body(), request); err != nil {
		return c_error(ctx, routeFmt("endRun", fmt.Sprintf("Unable to unmarshal request. Reason: `%s`", err.Error())), fiber.ErrInternalServerError.Code)
	}

	loggerInfo.Print(routeFmt("endRun", fmt.Sprint("Visited with the following data { ", request, " }")))

	// Parse run id
	runIdAsInt, err := strconv.Atoi(request.RunId)
	if err != nil {
		return c_error(ctx, routeFmt("endRun", fmt.Sprintf("Unable to parse RunId `%s`. Reason: `%s`", request.RunId, err)), fiber.ErrInternalServerError.Code)
	}
	runId := snowflakeFromInt(int64(runIdAsInt))

	affected, err := endRun(ctx, runId)
	if err != nil {
		return c_error(ctx, routeFmt("endRun", fmt.Sprintf("Unable to end run with id `%d`. Reason: `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
	}

	var response protobufMessages.EndRunResponse
	response.RunAffected = affected

	out, err := proto.Marshal(&response)
	if err != nil {
		c_error(ctx, routeFmt("endRun", fmt.Sprintf("Unable to encode response as bytes. Reason: `%s`", err)), fiber.ErrInternalServerError.Code)
	}

	loggerInfo.Println(routeFmt("endRun", fmt.Sprintf("Succesfully ended a run with id `%d`.", runId.RawSnowflake)))
	return ctx.Status(http.StatusOK).Send(out)
}

func sendFeedbackRoute(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")

	var db = ctx.Locals("db").(*sql.DB)
	request := protobufMessages.SendFeedback{}
	err := proto.Unmarshal(ctx.Body(), &request)
	if err != nil {
		c_error(ctx, routeFmt("sendFeedback", "Wrong request data"), fiber.ErrTeapot.Code)
	}

	row, err := db.Query("INSERT INTO feedback (player_id,message,run_id) VALUES ((SELECT player_id FROM players JOIN runs on runs.player_id = players.snowflake_id WHERE runs.snowflake_id = ?),?,?)", request.RunId, request.Message, request.RunId)
	if err != nil {
		c_error(ctx, routeFmt("sendFeedback", "Failed to insert data"), fiber.ErrTeapot.Code)
	}
	defer row.Close()

	return ctx.Status(http.StatusOK).Send(nil)
}
