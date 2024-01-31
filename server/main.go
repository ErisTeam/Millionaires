package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	_ "github.com/mattn/go-sqlite3"
)

type Question struct {
    Id int
    Question string
    Difficulty int
    Impressions int
}

func main() {
    fmt.Println("Starting...")

    // Open connection with the database
    var db, err = sql.Open("sqlite3", "./millionaires.db")
	if err != nil { log.Fatal(err) }
	defer db.Close()

    //sqlStmt := `
    //    CREATE TABLE questions (id integer NOT NULL PRIMARY KEY, question text);
    //    DELETE FROM questions;
	//`

	//_, err = db.Exec(sqlStmt)
	//if err != nil {
	//	log.Printf("%q: %s\n", err, sqlStmt)
	//	return
	//}

	//tx, err := db.Begin()
	//if err != nil { log.Fatal(err) }
	//stmt, err := tx.Prepare("INSERT INTO questions (id, question) VALUES (?, ?)")
	//if err != nil { log.Fatal(err) }
	//defer stmt.Close()
	//for i := 0; i < 100; i++ {
	//	_, err = stmt.Exec(i, "Gami is a...")
	//	if err != nil {
	//		log.Fatal(err)
	//	}
	//}
	//err = tx.Commit()
	//if err != nil { log.Fatal(err) }

    app := fiber.New()

    app.Get("/", func (c *fiber.Ctx) error {
        return c.SendString("Welcome to millionaires!")
    })

    // Gets all questions (as a test)
    app.Get("/questions", func (c *fiber.Ctx) error {
        // Make a query to the database
        rows, err := db.Query("SELECT * FROM questions")
        if err != nil { log.Fatal(err) }
        defer rows.Close()

        // Get all the rows of the query
        var questions[] Question = make([]Question, 0)
        for rows.Next() {
            var question Question

            // Assign values to the `Question` struct
            err = rows.Scan(&question.Id, &question.Question, &question.Difficulty, &question.Impressions)

            if err != nil { log.Fatal(err) }

            // Append current question to the slice
            questions = append(questions, question)
        }

        err = rows.Err()
        if err != nil { log.Fatal(err) }

        return c.JSON(questions)
    })

    log.Fatal(app.Listen(":3000"))
}
