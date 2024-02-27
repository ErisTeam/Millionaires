package main

import (
	"database/sql"
	"fmt"
	"log"
	"millionairesServer/protobufMessages"
	"net/http"
	"strconv"

	//"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

// Returns a random question with answers (id and text only) of a specified difficulty
func getRandomQuestion(c *fiber.Ctx, difficulty int) (protobufMessages.GetQuestionResponse, error) {
	var db = c.Locals("db").(*sql.DB)
	random_question_row, err := db.Query("SELECT questions.id, questions.question, questions.difficulty, questions.impressions FROM questions WHERE questions.difficulty = ? ORDER BY RANDOM() LIMIT 1;", difficulty)
	if err != nil {
		return protobufMessages.GetQuestionResponse{}, err
	}
	defer random_question_row.Close()

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

// Inserts a `run_question` into the database
func assignQuestionToRun(ctx *fiber.Ctx, runId Snowflake, questionId int32) error {
	var db = ctx.Locals("db").(*sql.DB)

	_, err := db.Exec("INSERT INTO run_questions (run_id, question_id) VALUES (?, ?);", runId.RawSnowflake, questionId)
	return err
}

func answerQuestion(c *fiber.Ctx) error {
	db := c.Locals("db").(*sql.DB)

	// Get the time of the request
	requestTime := time.Now()

	// Get request body
	request := protobufMessages.AnswerQuestionRequest{}
	err := proto.Unmarshal(c.Body(), &request)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while parsing request body: `%s`", err), fiber.ErrBadRequest.Code)
	}

	// Parse run id
	runIdAsInt, err := strconv.Atoi(request.RunId)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while parsing run_id: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	runId := snowflakeFromInt(int64(runIdAsInt))

	// Get current `run_question`
	runQuestionRow := db.QueryRow("SELECT run_questions.id, run_questions.answer_id, run_questions.answered_at FROM run_questions JOIN runs ON run_questions.run_id = runs.snowflake_id WHERE run_questions.run_id = ? AND run_questions.question_id = (SELECT answers.question_id FROM answers WHERE answers.id = ?);", runId.RawSnowflake, request.AnswerId)
	var runQuestionId int
	var runQuestionAnswerId sql.NullInt64
	var runQuestionAnsweredAt sql.NullTime
	err = runQuestionRow.Scan(&runQuestionId, &runQuestionAnswerId, &runQuestionAnsweredAt)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while getting current run_question info: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	// Check if the question is not already answered
	if runQuestionAnswerId.Valid || runQuestionAnsweredAt.Valid {
		return c_error(c, "The last asked question was already answered", fiber.ErrBadRequest.Code)
	}

	// Update the answer of the `run_questions` table
	_, err = db.Exec("UPDATE run_questions SET answer_id = ?, answered_at = ? WHERE run_questions.id = ?;", request.AnswerId, requestTime, runQuestionId)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while updating current run_question: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	// Get the answer from answer_id
	row, err := db.Query("SELECT answers.id, answers.question_id, answers.answer, answers.is_correct, answers.chosen, questions.difficulty FROM answers JOIN questions ON answers.question_id = questions.id WHERE answers.id = ?", request.AnswerId)
	if err != nil {
		return c_error(c, fmt.Sprintf("Error while querying SQL statement: `%s`", err), fiber.ErrInternalServerError.Code)
	}
	defer row.Close()

	// Parse the answer
	var answer protobufMessages.Answer
	if row.Next() {
		err = row.Scan(&answer.Id, &answer.QuestionId, &answer.Answer, &answer.IsCorrect, &answer.Chosen, &answer.Difficulty)
		if err != nil {
			return c_error(c, fmt.Sprintf("Error while getting values from the SQL row result: `%s`", err), fiber.ErrInternalServerError.Code)
		}
	}
	row.Close()

	// Increment the answers `chosen` count
	update, err := db.Exec("UPDATE answers SET chosen = ((SELECT answers.chosen FROM answers WHERE id = ?)+1) WHERE id = ?", request.AnswerId, request.AnswerId)
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

	response := protobufMessages.AnswerQuestionResponse{IsCorrect: false}
	if *answer.IsCorrect {
		response.IsCorrect = true

		// Get the next question if the quiz is still going
		if *answer.Difficulty < int32(12) {
			question, err := getRandomQuestion(c, int(*answer.Difficulty)+1)
			if err != nil {
				return c_error(c, fmt.Sprintf("Error while getting a random question: `%s`", err), fiber.ErrInternalServerError.Code)
			}

			err = assignQuestionToRun(c, runId, question.Question.Id)
			if err != nil {
				return c_error(c, fmt.Sprintf("Unable to assign the question to the run with id `%d`: `%s`", runId.RawSnowflake, err), fiber.ErrInternalServerError.Code)
			}

			response.NextQuestion = &question
		}
	}

	if response.IsCorrect == false || response.NextQuestion == nil {
		stopRun(c, runId)
	}

	proto_out, err := proto.Marshal(&response)
	if err != nil {
		log.Fatalln(err)
	}

	return c.Status(http.StatusOK).Send(proto_out)

}
