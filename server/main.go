package main

import (
	"database/sql"
	"fmt"
	"log"
	"millionairesServer/protobufMessages"
	"os"

	"github.com/gofiber/fiber/v2"
	_ "github.com/mattn/go-sqlite3"
	"google.golang.org/protobuf/proto"
)

//go:generate

var logger = log.New(os.Stdout, "[INFO]: ", log.Ldate|log.Ltime)

type Question struct {
	Id          int
	Question    string
	Difficulty  int
	Impressions int
}

func startRun(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")
	var request = &protobufMessages.StartRunRequest{}

	if err := proto.Unmarshal(ctx.Body(), request); err != nil {

		log.Fatalln(err)
	}
	var response = protobufMessages.StartRunResponse{}
	response.RunId = 900
	var out, err = proto.Marshal(&response)
	if err != nil {
		log.Fatalln(err)
	}
	println(out)
	return ctx.Status(200).Send(out)
}

func main() {
	fmt.Println("Starting...")

	// Open connection with the database
	var db, err = sql.Open("sqlite3", "./millionaires.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("db", db)
		return c.Next()
	})

	app.Post("/startRun", startRun)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Welcome to millionaires!")
	})

	// Gets all questions (as a test)
	app.Get("/questions", func(c *fiber.Ctx) error {
		// Make a query to the database
		rows, err := db.Query("SELECT * FROM questions")
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

		// Get all the rows of the query
		var questions []Question = make([]Question, 0)
		for rows.Next() {
			var question Question

			// Assign values to the `Question` struct
			err = rows.Scan(&question.Id, &question.Question, &question.Difficulty, &question.Impressions)

			if err != nil {
				log.Fatal(err)
			}

			// Append current question to the slice
			questions = append(questions, question)
		}

		err = rows.Err()
		if err != nil {
			log.Fatal(err)
		}

		return c.JSON(questions)
	})

	log.Fatal(app.Listen(":3000"))
}
