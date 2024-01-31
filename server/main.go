package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/gofiber/fiber/v2"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
    fmt.Println("Starting...")

    // Open connection with the database
    var db, err = sql.Open("sqlite3", "./millionaires.db")
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

    sqlStmt := `
        CREATE TABLE questions (id integer NOT NULL PRIMARY KEY, question text);
        DELETE FROM questions;
	`

	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Printf("%q: %s\n", err, sqlStmt)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	stmt, err := tx.Prepare("INSERT INTO questions (id, question) VALUES (?, ?)")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()
	for i := 0; i < 100; i++ {
		_, err = stmt.Exec(i, "Gami is a...")
		if err != nil {
			log.Fatal(err)
		}
	}
	err = tx.Commit()
	if err != nil {
		log.Fatal(err)
	}

	rows, err := db.Query("SELECT id, question FROM questions")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	for rows.Next() {
		var id int
		var name string
		err = rows.Scan(&id, &name)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(id, name)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

    log.Println("Done")

    //app := fiber.New()

    //app.Get("/", func (c *fiber.Ctx) error {
    //    return c.SendString("Hello, World!")
    //})

    //log.Fatal(app.Listen(":3000"))
}
