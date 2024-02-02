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

// Routes related to runs

func startRun(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")
	var db = ctx.Locals("db").(*sql.DB)
	var request = &protobufMessages.StartRunRequest{}

	if err := proto.Unmarshal(ctx.Body(), request); err != nil {
		return c_error(ctx, err.Error(), fiber.ErrBadRequest.Code)
	}

	logger.Printf("Creating a run for a user with the name `%s`", request.Name)

	snowflake := newSnowflake(SF_RUN)

	var response = protobufMessages.StartRunResponse{}
	response.SnowflakeId = snowflake.ID
	out, err := proto.Marshal(&response)

	run_stmt, err := db.Prepare("INSERT INTO runs (snowflake_id, name, used_lifelines) VALUES (?, ?, 0);")
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Unable to start the run: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	_, err = run_stmt.Exec(snowflake, request.Name)

	if err != nil {
		return c_error(ctx, fmt.Sprintf("Unable to start the run: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	logger.Printf("Succesfully created a run for a user with the name `%s` of id `%d`", request.Name, snowflake.ID)
	return ctx.Status(http.StatusOK).Send(out)
}

func getRuns(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")
	var db = ctx.Locals("db").(*sql.DB)

	logger.Println("Getting runs...")

	run_rows, err := db.Query("SELECT snowflake_id, name, used_lifelines, ended FROM runs")
	if err != nil {
		c_error(ctx, fmt.Sprintf("Unable to get runs: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	var response = protobufMessages.GetRunsResponse{}
	for run_rows.Next() {
		run := protobufMessages.Run{}
		run_rows.Scan(&run.SnowflakeId, &run.Name, &run.UsedLifelines, &run.Ended)
		response.Runs = append(response.Runs, &run)
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
	var db = ctx.Locals("db").(*sql.DB)

	var request = &protobufMessages.EndRunRequest{}

	if err := proto.Unmarshal(ctx.Body(), request); err != nil {
		return c_error(ctx, err.Error(), fiber.ErrBadRequest.Code)
	}

	snowflake, err := strconv.ParseInt(request.SnowflakeId, 10, 64)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Error while converting id from string to int: `%s`", err.Error()), fiber.ErrBadRequest.Code)
	}

	logger.Printf("Ending a run with id `%d`\n", snowflake)

	_, err = db.Exec("UPDATE runs SET ended = true WHERE snowflake_id == ?", snowflake)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Error while trying to update the runs' state: `%s`", err.Error()), fiber.ErrBadRequest.Code)
	}

	logger.Printf("Run with id `%d` successfully ended\n", snowflake)

	var out []byte
	return ctx.Status(http.StatusOK).Send(out)
}
