package main

import (
	//"database/sql"
	//"fmt"
	//"log"
	//"millionairesServer/protobufMessages"
	//"net/http"
	//"strconv"

	//"github.com/gofiber/fiber/v2"
	//"google.golang.org/protobuf/proto"
)

const (
    FiftyFifty = 1;
    FriendCall = 2;
    Audience = 4;
)

//func useLifeline(c *fiber.Ctx) error {
//	request := protobufMessages.UseLifeLineRequest{}
//	err := proto.Unmarshal(c.Body(), &request)
//	if err != nil {
//		return c_error(c, fmt.Sprintf("Error while parsing request body: `%s`", err), fiber.ErrBadRequest.Code)
//	}
//
//	var db = c.Locals("db").(*sql.DB)
//
//
//}
