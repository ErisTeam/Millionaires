package main

import (
	"database/sql"
	"fmt"
	"log"
	"millionairesServer/protobufMessages"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	_ "github.com/mattn/go-sqlite3"
	"google.golang.org/protobuf/proto"
)

//go:generate

var logger = log.New(os.Stdout, "[INFO]: ", log.Ldate|log.Ltime)
// Logs the message and sends it as a (for now string, later protobuf)
// with the specified status code.
func c_error(c *fiber.Ctx, message string, status_code int) error {
    log.Printf(message)
    c.SendStatus(status_code)
    return c.SendString(message)
}

// Later change to protobuf
type QuestionResponseAnswer struct {
    Id int
    Answer string
}

type QuestionResponse struct {
    Id int
    Question string
    Answers [4]QuestionResponseAnswer
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

func NewQuestionResponse(question Question, answers [4]Answer) QuestionResponse {
    var parsed_answers [4]QuestionResponseAnswer

    for i, answer := range answers {
        parsed_answers[i] = QuestionResponseAnswer {
            Id: answer.Id,
            Answer: answer.Answer,
        }
    }

    return QuestionResponse {
        Id: question.Id,
        Question: question.Question,
        Answers: parsed_answers,
    }
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

    // Gets a random question of a specified difficulty
    // TODO: Phrase error messages better
    app.Get("/question", func (c *fiber.Ctx) error {
        // Get difficulty from URI query param
        queryString := c.Queries()
        if queryString["difficulty"] == "" {
            return c_error(c, "Error while getting `difficulty`: `Value not specified for the route`", fiber.ErrBadRequest.Code)
        }

        // Convert difficulty to int
        difficulty, err := strconv.Atoi(queryString["difficulty"])
        if err != nil {
            return c_error(c, fmt.Sprintf("Error while parsing `difficulty`: `%s`", queryString["difficulty"]), fiber.ErrBadRequest.Code)
        }

        if difficulty < 1 || difficulty > 12 {
            return c_error(c, fmt.Sprintf("Error: `difficulty`: `%d` must be between <1,12>", difficulty), fiber.ErrBadRequest.Code)
        }

        log.Printf("Sending a random question of `difficulty` = `%d`", difficulty)

        // Prepare SQL for retriving a random question
        random_question_stmt, err := db.Prepare("SELECT * FROM questions WHERE questions.difficulty = ? ORDER BY RANDOM() LIMIT 1;")
        defer random_question_stmt.Close()
        if err != nil {
            return c_error(c, fmt.Sprintf("Error while preparing SQL statement: `%s`", err), fiber.ErrInternalServerError.Code)
        }

        // Insert the values
        random_question_row, err := random_question_stmt.Query(difficulty)
        if err != nil {
            return c_error(c, fmt.Sprintf("Error while querying SQL statement: `%s`", err), fiber.ErrInternalServerError.Code)
        }

        // Execute the query
        row_result := random_question_row.Next()
        if row_result == false {
            err = random_question_row.Err()
            if err != nil {
                return c_error(c, fmt.Sprintf("Error while fetching SQL row result: `%s`", err), fiber.ErrInternalServerError.Code)
            } else {
                return c_error(c, fmt.Sprintf("Error while fetching SQL row result: `No results for difficulty of %d`", difficulty), fiber.ErrInternalServerError.Code)
            }
        }

        // Insert row values into a struct
        var random_question Question
        err = random_question_row.Scan(&random_question.Id, &random_question.Question, &random_question.Difficulty, &random_question.Impressions)
        if err != nil {
            return c_error(c, fmt.Sprintf("Error while getting values from the SQL row result: `%s`", err), fiber.ErrInternalServerError.Code)
        }

        // TODO: Querying answers
        // Prepare SQL for retriving answers to a question
        answers_stmt, err := db.Prepare("SELECT answers.* FROM answers JOIN questions ON answers.question_id = questions.id WHERE questions.id == ? ORDER BY RANDOM();")
        defer answers_stmt.Close()
        if err != nil {
            return c_error(c, fmt.Sprintf("Error while preparing SQL statement: `%s`", err), fiber.ErrInternalServerError.Code)
        }

        // Insert the values
        answer_rows, err := answers_stmt.Query(random_question.Id)
        if err != nil {
            return c_error(c, fmt.Sprintf("Error while querying SQL statement: `%s`", err), fiber.ErrInternalServerError.Code)
        }

        // TODO: Handle a case when there are less 4 answers
        // Execute the query and save the result as an array of `Answer` structs
        var answers [4]Answer
        for i := 0; answer_rows.Next() && i < 4; i++ {
            // Insert row values into a struct
            err = answer_rows.Scan(&answers[i].Id, &answers[i].Question_id, &answers[i].Answer, &answers[i].Is_correct, &answers[i].Chosen)
            if err != nil {
                return c_error(c, fmt.Sprintf("Error while getting values from the SQL row result: `%s`", err), fiber.ErrInternalServerError.Code)
            }
        }

        err = answer_rows.Err()
        if err != nil {
            return c_error(c, fmt.Sprintf("Error while fetching SQL row result: `%s`", err), fiber.ErrInternalServerError.Code)
        }

        log.Printf("Succesfully processed a request for a random question of `difficulty` = `%d`", difficulty)
        return c.JSON(NewQuestionResponse(random_question, answers))
    })

    log.Fatal(app.Listen(":3000"))
}
