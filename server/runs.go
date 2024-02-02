package main

import (
	"millionairesServer/protobufMessages"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

// Routes related to runs

func startRun(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")
	var request = &protobufMessages.StartRunRequest{}

	if err := proto.Unmarshal(ctx.Body(), request); err != nil {
		return c_error(ctx, err.Error(), fiber.ErrBadRequest.Code)
	}
	var response = protobufMessages.StartRunResponse{}
	response.RunId = 900
	var out, err = proto.Marshal(&response)
	if err != nil {
		logger.Fatalln(err)
	}
	println(out)
	return ctx.Status(http.StatusOK).Send(out)
}
