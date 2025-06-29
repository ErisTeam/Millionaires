package main

import (
	"database/sql"
	"fmt"
	"millionairesServer/protobufMessages"
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

func difficultyScaling(questionNum int) int {
	switch {
	case questionNum < 3:
		return 0
	case questionNum < 6:
		return 1
	case questionNum < 8:
		return 2
	case questionNum < 10:
		return 3
	case questionNum < 11:
		return 4
	case questionNum < 12:
		return 5
	}
	return -1
}

// Returns a random question with answers (id and text only) of a specified difficulty, that hasn't yet been seen by a player with the specified ID.
// Difficulty ranges from <0,5>
func getRandomQuestion(c *fiber.Ctx, runId Snowflake, difficulty int) (*protobufMessages.GetQuestionResponse, error) {
	var db = c.Locals("db").(*sql.DB)

	loggerInfo.Printf("Getting a random question of difficulty `%d`.", difficulty)

	randomQuestionRow := db.QueryRow("SELECT q.* FROM questions q WHERE q.id NOT IN (SELECT rq.question_id FROM run_questions rq JOIN runs r ON rq.run_id = r.snowflake_id WHERE r.player_id = (SELECT player_id FROM runs WHERE snowflake_id = ?)) AND q.difficulty = ? ORDER BY RANDOM() LIMIT 1;", runId.RawSnowflake, difficulty)
	var randomQuestion protobufMessages.Question
	err := randomQuestionRow.Scan(&randomQuestion.Id, &randomQuestion.Question, &randomQuestion.Difficulty, &randomQuestion.Impressions)

    // Fallback if the player has seen all questions, could be done with a query but who cares
    if err == sql.ErrNoRows {
        loggerInfo.Printf("Player of a run with ID `%d` has seen all questions of difficulty `%d`. Fetching a question not present in the current run.", runId.RawSnowflake, difficulty)
        randomQuestionRow := db.QueryRow("SELECT q.* FROM questions q WHERE q.id NOT IN (SELECT rq.question_id FROM run_questions rq WHERE rq.run_id = ?) AND q.difficulty = ? ORDER BY RANDOM() LIMIT 1;", runId.RawSnowflake, difficulty)
        err = randomQuestionRow.Scan(&randomQuestion.Id, &randomQuestion.Question, &randomQuestion.Difficulty, &randomQuestion.Impressions)

        if err == sql.ErrNoRows {
            loggerWarn.Printf("No question could be found with a difficulty of `%d`.", difficulty)
        }
    }

	if err != nil {
        loggerWarn.Printf("Unable to fetch a random question of difficulty `%d` for a run with ID `%d`.", difficulty, runId.RawSnowflake)
		return nil, err
	}

	answerRows, err := db.Query("SELECT answers.id, answers.answer FROM answers JOIN questions ON answers.question_id = questions.id WHERE questions.id = ?;", randomQuestion.Id)
	if err != nil {
        loggerWarn.Printf("Unable to fetch answers for a question with ID `%d`.", randomQuestion.Id)
		return nil, err
	}
	defer answerRows.Close()

	var answers []*protobufMessages.Answer
	for i := 0; answerRows.Next() && i < 4; i++ {
		answer := &protobufMessages.Answer{}
		err = answerRows.Scan(&answer.Id, &answer.Answer)
		if err != nil {
			return nil, err
		}
		answers = append(answers, answer)
	}
	answerRows.Close()

	output := NewQuestionResponse(&randomQuestion, answers)
	loggerInfo.Printf("Successfully fetched a random question for a run with ID `%d`. (`%d`)", randomQuestion.Id, runId.RawSnowflake)
	return &output, nil
}

// Inserts a `run_question` into the database
// WARNING! Doesn't check if the run has ended
func assignQuestionToRun(ctx *fiber.Ctx, runId Snowflake, questionId Snowflake) error {
	var db = ctx.Locals("db").(*sql.DB)

    loggerInfo.Printf("Assigning a question of ID `%d` to a run with ID `%d`.", questionId.RawSnowflake, runId.RawSnowflake)

	_, err := db.Exec("INSERT INTO run_questions (id, run_id, question_id, answer_id, answered_at, question_num) VALUES (NULL, ?, ?, NULL, NULL, (SELECT COALESCE((SELECT run_questions.question_num FROM run_questions JOIN runs ON runs.snowflake_id = run_questions.run_id WHERE runs.snowflake_id = ? ORDER BY run_questions.question_num DESC LIMIT 1)+1, 0)));", runId.RawSnowflake, questionId.RawSnowflake, runId.RawSnowflake)

    if err != nil {
        loggerWarn.Printf("Unable to assing a question of ID `%d` to a run with ID `%d`. Reason: `%s`", questionId.RawSnowflake, runId.RawSnowflake, err)
        return err
    }

    loggerInfo.Printf("Successfully assigned a question of ID `%d` to a run with ID `%d`.", questionId.RawSnowflake, runId.RawSnowflake)
	return nil
}

func answerQuestionRoute(c *fiber.Ctx) error {
	db := c.Locals("db").(*sql.DB)

	// Get the time of the request
	requestTime := time.Now()

	// Get request body
	request := protobufMessages.AnswerQuestionRequest{}
	err := proto.Unmarshal(c.Body(), &request)
	if err != nil {
		return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to unmarshal request. Reason: `%s`", err)), fiber.ErrInternalServerError.Code)
	}

    loggerInfo.Print(routeFmt("answerQuestion", fmt.Sprint("Visited with the following data { ", &request, " }")))

	// Parse run id
	runIdAsInt, err := strconv.Atoi(request.RunId)
	if err != nil {
		return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to parse runId `%s`. Reason: `%s`", request.RunId, err)), fiber.ErrInternalServerError.Code)
	}

	runId := snowflakeFromInt(int64(runIdAsInt))

	// Get current `run_question`
	runQuestionRow := db.QueryRow("SELECT run_questions.id, run_questions.question_id, run_questions.answer_id, run_questions.answered_at, run_questions.question_num FROM run_questions WHERE run_questions.run_id = ? ORDER BY run_questions.question_num DESC LIMIT 1;", runId.RawSnowflake, runId.RawSnowflake)
	var runQuestionId int
	var runQuestionQuestionId int
	var runQuestionAnswerId sql.NullInt64
	var runQuestionAnsweredAt sql.NullTime
	var runQuestionNum int
	err = runQuestionRow.Scan(&runQuestionId, &runQuestionQuestionId, &runQuestionAnswerId, &runQuestionAnsweredAt, &runQuestionNum)
	if err != nil {
		return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to get the current run question for a run with ID `%d`. Reason: `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
	}

	// Check if the question is not already answered
	if runQuestionAnswerId.Valid || runQuestionAnsweredAt.Valid {
		return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Run question with ID `%d` was already answered.", runQuestionId)), fiber.ErrInternalServerError.Code)
	}

    loggerInfo.Printf(routeFmt("answerQuestion", fmt.Sprintf("Player of a run with id `%d` answered the question with ID `%d` with an answer of ID `%d`.", runId.RawSnowflake, runQuestionQuestionId, request.AnswerId)))

	// Check if the answer is relevant to the question and is correct
	answerCorrectnesRow := db.QueryRow("SELECT COALESCE((SELECT TRUE FROM answers JOIN questions ON questions.id = answers.question_id WHERE answers.id = ? AND questions.id = ?), FALSE) AS is_answer_relevant, COALESCE((SELECT TRUE FROM answers JOIN questions ON questions.id = answers.question_id WHERE answers.id = ? AND questions.id = ? AND answers.is_correct = TRUE), FALSE) AS is_answer_correct;", request.AnswerId, runQuestionQuestionId, request.AnswerId, runQuestionQuestionId)

	var isAnswerRelevant bool
	var isAnswerCorrect bool
	err = answerCorrectnesRow.Scan(&isAnswerRelevant, &isAnswerCorrect)
	if err != nil {
        return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to check whether the answer was correct or relevant to the question. (runId: `%d`, questionId: `%d`, playerAnswerId: `%d`)", runId.RawSnowflake, runQuestionId, request.AnswerId)), fiber.ErrInternalServerError.Code)
	}

	// An answer to a totally different question
	if !isAnswerRelevant {
        return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Answer of ID `%d` made in a run with ID `%d` is irrelevant to a question of ID `%d`.", request.AnswerId, runId.RawSnowflake, runQuestionId)), fiber.ErrBadRequest.Code)
	}

	// Update the answer of the `run_questions` table
	_, err = db.Exec("UPDATE run_questions SET answer_id = ?, answered_at = ? WHERE run_questions.id = ?;", request.AnswerId, requestTime, runQuestionId)
	if err != nil {
        return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to update the answer for a run question with ID `%d`.", runQuestionId)), fiber.ErrInternalServerError.Code)
	}

	// Increment the answers `chosen` count
	update, err := db.Exec("UPDATE answers SET chosen = ((SELECT answers.chosen FROM answers WHERE id = ?)+1) WHERE id = ?", request.AnswerId, request.AnswerId)
	if err != nil {
        return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to increment the chosen answer count with ID `%d`. Reason: `%s`", request.AnswerId, err)), fiber.ErrInternalServerError.Code)
	}

	affected, err := update.RowsAffected()
	if err != nil {
        loggerWarn.Print(routeFmt("answerQuestion", fmt.Sprintf("Unable to check if the row of the chosen answer count with ID `%d` was affected.", request.AnswerId)))
	}

	if affected == 0 {
        return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to increment the chosen answer count with ID `%d`. (At least that's what the affected rows count says)", request.AnswerId)), fiber.ErrInternalServerError.Code)
	}

	response := protobufMessages.AnswerQuestionResponse{IsCorrect: isAnswerCorrect}

	if isAnswerCorrect {
		// Get the next question if the quiz is still going
		if runQuestionNum+1 < 12 {
			question, err := getRandomQuestion(c, runId, difficultyScaling(runQuestionNum+1))
			if err != nil {
                return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to fetch the next question for a run with ID `%d`. Reason: `%s`.", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
			}

			err = assignQuestionToRun(c, runId, snowflakeFromInt(int64(question.Question.Id)))
			if err != nil {
                return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to assign the question to a run with id `%d`. Reason: `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
			}

			response.NextQuestion = question
		} else {
			_, err = db.Exec("UPDATE runs SET ended = true WHERE runs.snowflake_id = ?;", runId.RawSnowflake)
			if err != nil {
                return c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to end a run with id `%d`. Reason `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
			}
		}
	}

	if response.IsCorrect == false {
		endRun(c, runId)
	}

	proto_out, err := proto.Marshal(&response)
	if err != nil {
		c_error(c, routeFmt("answerQuestion", fmt.Sprintf("Unable to encode response as bytes. Reason: `%s`", err)), fiber.ErrInternalServerError.Code)
	}

    loggerInfo.Print(routeFmt("answerQuestion", fmt.Sprintf("Answering a question of ID `%d` with an answer of ID `%d` in a run with ID `%d` was successfull.", runQuestionQuestionId, request.AnswerId, runId.RawSnowflake)))
	return c.Status(http.StatusOK).Send(proto_out)
}
