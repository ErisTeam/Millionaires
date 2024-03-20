package main

import (
	"database/sql"
	"fmt"
	"log"
	"millionairesServer/protobufMessages"
	"os"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	_ "github.com/mattn/go-sqlite3"
	"google.golang.org/protobuf/proto"
)

//go:generate protoc --go_out=./ ../proto/*.proto  --proto_path=../proto/

func routeFmt(pref string, str string) string { return fmt.Sprintf("`%s` --- %s", pref, str) }

var loggerInfo = log.New(os.Stdout, "[INFO]: ", log.Ldate|log.Ltime)
var loggerWarn = log.New(os.Stdout, "[\033[33mWARNING\033[0m]: ", log.Ldate|log.Ltime)
var loggerError = log.New(os.Stdout, "[\033[31mERROR\033[0m]: ", log.Ldate|log.Ltime)

// Logs the message and sends it as a (for now string, later protobuf)
// with the specified status code.
func c_error(c *fiber.Ctx, message string, status_code int) error {
	loggerError.Println(message)

	errorResponse := protobufMessages.MillionairesError{Message: message, Where: "Wouldn't you like to know? UwU"}
	out, err := proto.Marshal(&errorResponse)

	if err != nil {
		loggerError.Printf("Unable to encode `MillionairesError` response as bytes. Reason: `%s`", err)
		return fiber.ErrInternalServerError
	}

	return c.Status(status_code).Send(out)

}

func NewQuestionResponse(question *protobufMessages.Question, answers []*protobufMessages.Answer) protobufMessages.GetQuestionResponse {
	var parsed_answers []*protobufMessages.Answer

	for _, answer := range answers {
		parsed_answers = append(parsed_answers, &protobufMessages.Answer{Id: answer.Id, QuestionId: answer.QuestionId, Answer: answer.Answer})
	}

	return protobufMessages.GetQuestionResponse{Question: question, Answers: parsed_answers}
}

func createDbConnection() *sql.DB {
	var db, err = sql.Open("sqlite3", "./millionaires.db")
	if err != nil {
		panic(err)
	}
	db.SetMaxOpenConns(9)
	db.SetMaxIdleConns(3)
	return db
}

func main() {

	fmt.Println("Starting...")

	var clientManager = WebSocketClientManager{dbConnection: createDbConnection(), clients: make(ClientMapType)}

	app := fiber.New()

	app.Use(cors.New(cors.ConfigDefault))

	app.Use(func(c *fiber.Ctx) error {
		c.Locals("clientManager", &clientManager)
		return c.Next()
	})

	app.Static("/", "./../client/dist")

	app.Use(func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		var db = createDbConnection()
		defer db.Close()
		c.Locals("db", db)
		return c.Next()
	})

	app.Post("/startRun", startRunRoute)
	app.Get("/getRuns", getRunsRoute)
	app.Post("/endRun", endRunRoute)
	app.Post("/useLifeline", useLifelineRoute)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Welcome to millionaires!")
	})

	// Gets a random question of a specified difficulty
	app.Post("/answerQuestion", answerQuestionRoute)

	app.Get("/ws/", websocket.New(WebsocketRun))

	log.Fatal(app.Listen(":9090"))
}
