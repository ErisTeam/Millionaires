package main

import (
	"database/sql"
	"fmt"
	"log"
	"millionairesServer/protobufMessages"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

func getQuestionFromDB(c *fiber.Ctx, difficulty int) (protobufMessages.GetQuestionResponse, error) {
	log.Println("Difficulty: ", difficulty)
	var db = c.Locals("db").(*sql.DB)
	println(db.Ping())
	// Insert the values
	random_question_row, err := db.Query("SELECT * FROM questions WHERE questions.difficulty = ? ORDER BY RANDOM() LIMIT 1;", difficulty)
	if err != nil {
		return protobufMessages.GetQuestionResponse{}, err
	}
    defer random_question_row.Close()

	// Execute the query
	row_result := random_question_row.Next()
	if row_result == false {
		err = random_question_row.Err()
		if err != nil {
			return protobufMessages.GetQuestionResponse{}, err
		} else {
			return protobufMessages.GetQuestionResponse{}, fmt.Errorf("Error while fetching SQL row result: `No rows returned`")
		}
	}

	// Insert row values into a struct
	var random_question protobufMessages.Question
	err = random_question_row.Scan(&random_question.Id, &random_question.Question, &random_question.Difficulty, &random_question.Impressions)
	if err != nil {
		return protobufMessages.GetQuestionResponse{}, err
	}

	// Insert the values
	answer_rows, err := db.Query("SELECT answers.id, answers.answer FROM answers JOIN questions ON answers.question_id = questions.id WHERE questions.id == ? ORDER BY RANDOM();", random_question.Id)
	if err != nil {
		return protobufMessages.GetQuestionResponse{}, err
	}
    defer answer_rows.Close()

	// Execute the query and save the result as an array of `Answer` structs
	var answers []*protobufMessages.Answer
	for i := 0; answer_rows.Next() && i < 4; i++ {
		// Insert row values into a struct
		answer := &protobufMessages.Answer{}
		err = answer_rows.Scan(&answer.Id, &answer.Answer)
		answers = append(answers, answer)
		if err != nil {
			return protobufMessages.GetQuestionResponse{}, err
		}
	}

	err = answer_rows.Err()
	if err != nil {
		return protobufMessages.GetQuestionResponse{}, err
	}
	output := NewQuestionResponse(&random_question, answers)
	return output, nil

}

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

	output, err := getQuestionFromDB(c, difficulty)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while getting a random question: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	proto_out, err := proto.Marshal(&output)
	if err != nil {
		log.Fatalln(err)
	}
	log.Printf("Succesfully processed a request for a random question of `difficulty` = `%d`", difficulty)
	return c.Status(http.StatusOK).Send(proto_out)
}

func answerQuestion(c *fiber.Ctx) error {
	request := protobufMessages.AnswerQuestionRequest{}
	err := proto.Unmarshal(c.Body(), &request)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while parsing request body: `%s`", err), fiber.ErrBadRequest.Code)
	}

	db := c.Locals("db").(*sql.DB)
	row, err := db.Query("SELECT answers.id, answers.question_id, answers.answer, answers.is_correct, answers.chosen, questions.difficulty FROM answers JOIN questions ON answers.question_id = questions.id WHERE answers.id = ?", request.Id)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while querying SQL statement: `%s`", err), fiber.ErrInternalServerError.Code)
	}
    defer row.Close()

	var answer protobufMessages.Answer
	if row.Next() {
		err = row.Scan(&answer.Id, &answer.QuestionId, &answer.Answer, &answer.IsCorrect, &answer.Chosen, &answer.Difficulty)
		if err != nil {
			return c_error(c, fmt.Sprintf("Error while getting values from the SQL row result: `%s`", err), fiber.ErrInternalServerError.Code)
		}
	}

	update, err := db.Exec("UPDATE answers SET chosen = ((SELECT answers.chosen FROM answers WHERE id = ?)+1) WHERE id = ?", request.Id, request.Id)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while incrementing analytics: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	affected, err := update.RowsAffected()
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while getting affected rows: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	if affected == 0 {
		return c_error(c, "Error while updating analytics: `No rows affected`", fiber.ErrInternalServerError.Code)
	}

	if *answer.IsCorrect && (*answer.Difficulty < int32(12)) {
		output, err := getQuestionFromDB(c, int(*answer.Difficulty)+1)
		if err != nil {
			return c_error(c, fmt.Sprintf("Error while getting a random question: `%s`", err), fiber.ErrInternalServerError.Code)
		}

		if err != nil {
			log.Fatalln(err)
		}
		response := protobufMessages.AnswerQuestionResponse{
			IsCorrect:    true,
			NextQuestion: &output,
		}
		proto_out, err := proto.Marshal(&response)
		if err != nil {
			log.Fatalln(err)
		}
		return c.Status(http.StatusOK).Send(proto_out)

		//TODO: Send the next question
	}
	if *answer.IsCorrect {
		response := protobufMessages.AnswerQuestionResponse{
			IsCorrect: true,
		}
		proto_out, err := proto.Marshal(&response)
		if err != nil {
			log.Fatalln(err)
		}

		return c.Status(http.StatusOK).Send(proto_out)
	}
	response := protobufMessages.AnswerQuestionResponse{
		IsCorrect: false,
	}
	proto_out, err := proto.Marshal(&response)
	if err != nil {
		log.Fatalln(err)
	}

	return c.Status(http.StatusOK).Send(proto_out)

}
