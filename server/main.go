package main

import (
	"database/sql"
	"fmt"
	"log"
	"millionairesServer/protobufMessages"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	_ "github.com/mattn/go-sqlite3"
)

//go:generate protoc --go_out=./ ../proto/*.proto  --proto_path=../proto/

var logger = log.New(os.Stdout, "[INFO]: ", log.Ldate|log.Ltime)

// Logs the message and sends it as a (for now string, later protobuf)
// with the specified status code.
func c_error(c *fiber.Ctx, message string, status_code int) error {
	logger.Println(message)
	return c.Status(status_code).SendString(message)

}

func NewQuestionResponse(question *protobufMessages.Question, answers []*protobufMessages.Answer) *protobufMessages.GetQuestionResponse {
	var parsed_answers []*protobufMessages.Answer

	for _, answer := range answers {
		parsed_answers = append(parsed_answers, &protobufMessages.Answer{Id: answer.Id, QuestionId: answer.QuestionId, Answer: answer.Answer})
	}

	return &protobufMessages.GetQuestionResponse{Question: question, Answers: parsed_answers}
}

func main() {
	fmt.Println("Starting...")

	// Open connection with the database

	// defer db.Close()

	app := fiber.New()

	app.Use(cors.New(cors.ConfigDefault))

	app.Use(func(c *fiber.Ctx) error {
		var db, err = sql.Open("sqlite3", "./millionaires.db")
		if err != nil {
			panic(err)
		}
		c.Locals("db", db)
		return c.Next()
	})

	app.Post("/startRun", startRun)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Welcome to millionaires!")
	})

	// Gets a random question of a specified difficulty
	// TODO: Phrase error messages better
	app.Get("/question", getQuestion)

	log.Fatal(app.Listen(":9090"))
}
