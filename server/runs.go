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

// Inserts a `run` into the database and returns its' id
func createRun(ctx *fiber.Ctx, name string) (*Snowflake, error) {
	var db = ctx.Locals("db").(*sql.DB)

    logger.Println("Creating a run")

	runId := newSnowflake(SF_RUN)

    _, err := db.Exec("INSERT INTO runs (id, name) VALUES (?, ?);", runId.ID, name)
	if err != nil {
		return nil, err
	}

    return &runId, nil
}

// Updates the `run` in the database to 
func stopRun(ctx *fiber.Ctx, runId Snowflake) (bool, error) {
	var db = ctx.Locals("db").(*sql.DB)

    logger.Printf("Stopping the run with id `%d`\n", runId.ID)

    update, err := db.Exec("UPDATE runs SET ended = true WHERE id == ? AND ended <> true", runId.ID)
	if err != nil {
		return false, c_error(ctx, fmt.Sprintf("Error while trying to update the runs' state: `%s`", err.Error()), fiber.ErrBadRequest.Code)
	}

    affected, err := update.RowsAffected()
    if err != nil {
		return false, c_error(ctx, fmt.Sprintf("Error while retriving affected rows: `%s`", err.Error()), fiber.ErrBadRequest.Code)
    }

    return (affected > 1), nil
}

func startRun(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")

    // Parse request body
	var request = &protobufMessages.StartRunRequest{}
	if err := proto.Unmarshal(ctx.Body(), request); err != nil {
		return c_error(ctx, err.Error(), fiber.ErrBadRequest.Code)
	}

	logger.Printf("Creating a run for a user with the name `%s`", request.Name)

    runId, err := createRun(ctx, request.Name)
    if err != nil {
		return c_error(ctx, fmt.Sprintf("Unable to start the run. %s", err), fiber.ErrInternalServerError.Code)
    }

    question, err := getRandomQuestion(ctx, 1)
    if err != nil {
        return c_error(ctx, fmt.Sprintf("Unable to get the first question to the run with id `%d`: `%s`", runId.ID, err), fiber.ErrInternalServerError.Code)
    }

    err = assignQuestionToRun(ctx, *runId, question.Question.Id)
    if err != nil {
        return c_error(ctx, fmt.Sprintf("Unable to assign the first question to the run with id `%d`: `%s`", runId.ID, err), fiber.ErrInternalServerError.Code)
    }

    // Parse the response
	var response = protobufMessages.StartRunResponse{}
	response.RunId = strconv.FormatInt(runId.ID, 10)
    response.Question = &question
	out, err := proto.Marshal(&response)

	logger.Printf("Succesfully created a run for a user with the name `%s` of id `%d`", request.Name, runId.ID)
	return ctx.Status(http.StatusOK).Send(out)
}

func getRuns(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")
	var db = ctx.Locals("db").(*sql.DB)

	logger.Println("Getting runs...")

	run_rows, err := db.Query("SELECT id, name, used_lifelines, ended FROM runs")
	if err != nil {
		c_error(ctx, fmt.Sprintf("Unable to get runs: `%s`", err), fiber.ErrInternalServerError.Code)
	}
    defer run_rows.Close()

	var response = protobufMessages.GetRunsResponse{}
	for run_rows.Next() {
		run := protobufMessages.Run{}
		run_rows.Scan(&run.Id, &run.Name, &run.UsedLifelines, &run.Ended)
        if (run.Ended) {
            response.Runs = append(response.Runs, &run)
        }
	}

	out, err := proto.Marshal(&response)
	if err != nil {
		c_error(ctx, fmt.Sprintf("Unable to get runs: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	logger.Println("Successfuly got runs")

	return ctx.Status(http.StatusOK).Send(out)
}

func endRun(ctx *fiber.Ctx) error {
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

	logger.Printf("Ending a run with id `%d`\n", runId.ID)

    affected, err := stopRun(ctx, runId)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Error while ending the run with id `%d`: `%s`", runId.ID, err), fiber.ErrInternalServerError.Code)
	}

    var response protobufMessages.EndRunResponse
    response.RunAffected = affected
    if affected == false {
        logger.Printf("Run with id `%d` already ended\n", runId.ID)
    } else {
        logger.Printf("Run with id `%d` successfully ended\n", runId.ID)
    }

	out, err := proto.Marshal(&response)
	if err != nil {
		c_error(ctx, fmt.Sprintf("Run ended, unable to encode response as bytes: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	return ctx.Status(http.StatusOK).Send(out)
}
