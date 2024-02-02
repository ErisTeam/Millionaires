package main

import (
	"database/sql"
	"fmt"
	"log"
	"millionairesServer/protobufMessages"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

// Routes related to questions and answers
func getQuestion(c *fiber.Ctx) error {
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

	var db = c.Locals("db").(*sql.DB)
	println(db.Ping())

	// Prepare SQL for retriving a random question
	random_question_stmt, err := db.Prepare("SELECT * FROM questions WHERE questions.difficulty = ? ORDER BY RANDOM() LIMIT 1;")
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
	var random_question protobufMessages.Question
	err = random_question_row.Scan(&random_question.Id, &random_question.Question, &random_question.Difficulty, &random_question.Impressions)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while getting values from the SQL row result: `%s`", err), fiber.ErrInternalServerError.Code)
	}
	// random_question_stmt.Close()

	// TODO: Querying answers
	// Prepare SQL for retriving answers to a question
	answers_stmt, err := db.Prepare("SELECT answers.* FROM answers JOIN questions ON answers.question_id = questions.id WHERE questions.id == ? ORDER BY RANDOM();")
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while preparing SQL statement: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	// Insert the values
	answer_rows, err := answers_stmt.Query(random_question.Id)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while querying SQL statement: `%s`", err), fiber.ErrInternalServerError.Code)
	}
	// answers_stmt.Close()

	// Execute the query and save the result as an array of `Answer` structs
	var answers []*protobufMessages.Answer
	for i := 0; answer_rows.Next() && i < 4; i++ {
		// Insert row values into a struct
		answer := &protobufMessages.Answer{}
		err = answer_rows.Scan(&answer.Id, &answer.QuestionId, &answer.Answer, &answer.IsCorrect, &answer.Chosen)
		answers = append(answers, answer)
		if err != nil {
			return c_error(c, fmt.Sprintf("Error while getting values from the SQL row result: `%s`", err), fiber.ErrInternalServerError.Code)
		}
	}

	err = answer_rows.Err()
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while fetching SQL row result: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	log.Printf("Succesfully processed a request for a random question of `difficulty` = `%d`", difficulty)

	proto_out, err := proto.Marshal(NewQuestionResponse(&random_question, answers))
	if err != nil {
		log.Fatalln(err)
	}
	return c.Send(proto_out)
}
