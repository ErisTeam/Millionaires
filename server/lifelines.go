package main

import (
	//"database/sql"
	"database/sql"
	"fmt"
	"math"
	"math/rand"
	"millionairesServer/protobufMessages"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

type Lifeline int

var Weights = [][]int{
	{8, 2, 1, 1},

	{80, 10, 5, 5},

	{75, 10, 5, 5},

	{70, 10, 5, 5},

	{45, 23, 22, 15},

	{34, 25, 25, 16},
}

const (
	LlUnknown    Lifeline = -1
	LlFiftyFifty Lifeline = 1
	LlFriendCall Lifeline = 2
	LlAudience   Lifeline = 4
)

func lifelineAsString(lifeline Lifeline) string {
	switch lifeline {
	case LlFiftyFifty:
		{
			return "FiftyFifty"
		}
	case LlFriendCall:
		{
			return "FriendCall"
		}
	case LlAudience:
		{
			return "Audience"
		}
	}
	return "UNKNOWN"
}

func useLifelineRoute(ctx *fiber.Ctx) error {
	request := protobufMessages.UseLifelineRequest{}
	err := proto.Unmarshal(ctx.Body(), &request)
	if err != nil {
		return c_error(ctx, routeFmt("useLifeline", fmt.Sprintf("Unable to unmarshal request. Reason: `%s`", err)), fiber.ErrInternalServerError.Code)
	}

	loggerInfo.Print(routeFmt("useLifeline", fmt.Sprint("Visited with the following data { ", &request, " }")))

	var db = ctx.Locals("db").(*sql.DB)

	// Parse run id
	runIdAsInt, err := strconv.Atoi(request.RunSnowflakeId)
	if err != nil {
		return c_error(ctx, routeFmt("useLifeline", fmt.Sprintf("Unable to parse runId `%s`. Reason: `%s`", request.RunSnowflakeId, err)), fiber.ErrInternalServerError.Code)
	}

	runId := snowflakeFromInt(int64(runIdAsInt))

	lifelinesStatus := 0
	lifelinesStatusRow := db.QueryRow("SELECT COALESCE((SELECT run_lifelines.used_lifelines FROM run_lifelines JOIN run_questions ON run_lifelines.run_question_id = run_questions.id WHERE run_questions.run_id = ? ORDER BY run_lifelines.used_lifelines DESC LIMIT 1), 0);", runId.RawSnowflake)

	err = lifelinesStatusRow.Scan(&lifelinesStatus)
	if err != nil {
		return c_error(ctx, routeFmt("useLifeline", fmt.Sprintf("Unable to get used lifelines of a run with id `%d`. Reason: `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
	}

	var runQuestionIdInt int
	runQuestionIdRow := db.QueryRow("SELECT run_questions.id FROM run_questions WHERE run_questions.run_id = ? ORDER BY run_questions.question_num DESC LIMIT 1;", runId.RawSnowflake)
	err = runQuestionIdRow.Scan(&runQuestionIdInt)
	if err != nil {
		return c_error(ctx, routeFmt("useLifeline", fmt.Sprintf("Unable to get current run question ID of a run with ID `%d`. Reason: `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
	}

	response := protobufMessages.UseLifelineResponse{}
	lifeline := LlUnknown
	wasLifelineUsed := true

	switch request.Lifeline {
	case protobufMessages.Lifeline_fiftyFifty:
		{
			lifeline = LlFiftyFifty
			wasLifelineUsed = (lifelinesStatus & int(lifeline)) == int(lifeline)
			discarded_answers := []*protobufMessages.Answer{}

			if !wasLifelineUsed {
				discarded_answers_sql, err := db.Query("SELECT answers.id FROM answers WHERE answers.question_id = (SELECT run_questions.question_id FROM run_questions WHERE run_questions.run_id = ? AND run_questions.answered_at IS NULL ORDER BY run_questions.run_id DESC LIMIT 1) AND answers.is_correct = FALSE ORDER BY RANDOM() LIMIT 2;", runId.RawSnowflake)
				if err != nil {
					return c_error(ctx, routeFmt("useLifeline", fmt.Sprintf("Unable to get current run question ID of a run with ID `%d`. Reason: `%s`", runId.RawSnowflake, err)), fiber.ErrInternalServerError.Code)
				}
				defer discarded_answers_sql.Close()

				for discarded_answers_sql.Next() {
					discarded_answer := protobufMessages.Answer{}
					discarded_answers_sql.Scan(&discarded_answer.Id)
					discarded_answers = append(discarded_answers, &discarded_answer)
				}
				discarded_answers_sql.Close()
			}

			response.Payload = &protobufMessages.UseLifelineResponse_FiftyFifty{
				FiftyFifty: &protobufMessages.FiftyFiftyResponse{
					Answers: discarded_answers,
				},
			}

			break
		}
	case protobufMessages.Lifeline_friendCall:
		{
			lifeline = LlFriendCall
			wasLifelineUsed = (lifelinesStatus & int(lifeline)) == int(lifeline)
			if !wasLifelineUsed {
				var clientManager = ctx.Locals("clientManager").(*WebSocketClientManager)
				var conn = clientManager.clients[runId]
				if conn == nil {
					return c_error(ctx, fmt.Sprintf("Unable to use lifeline: `%s`", "No client found"), fiber.ErrInternalServerError.Code)
				}
				err := clientManager.StartCall(runId)
				if err != nil {
					return c_error(ctx, fmt.Sprintf("Unable to use lifeline: `%s`", err), fiber.ErrInternalServerError.Code)
				}
			}
		}
	case protobufMessages.Lifeline_audience:
		{
			lifeline = LlAudience
			wasLifelineUsed = (lifelinesStatus & int(lifeline)) == int(lifeline)
			answers := []*protobufMessages.AudienceResponseItem{}
			difficulty := 0
			if !wasLifelineUsed {
				answersSQL, err := db.Query("SELECT answers.id, questions.difficulty FROM answers JOIN questions ON answers.question_id = questions.id WHERE answers.question_id = ( SELECT run_questions.question_id FROM run_questions WHERE run_questions.run_id = ? AND run_questions.answered_at IS NULL ORDER BY run_questions.run_id DESC LIMIT 1) ORDER BY answers.is_correct DESC, RANDOM() LIMIT 4;", runId.RawSnowflake)
				if err != nil {
					c_error(ctx, fmt.Sprintf("Unable to complete 50/50: `%s`", err), fiber.ErrInternalServerError.Code)
				}
				defer answersSQL.Close()

				for answersSQL.Next() {
					answer := int64(0)
					answersSQL.Scan(&answer, &difficulty)
					answers = append(answers, &protobufMessages.AudienceResponseItem{Id: strconv.FormatInt(answer, 10)})
				}
				percentages := []int32{0, 0, 0, 0}

				maxNumber := Weights[difficulty][0] + Weights[difficulty][1] + Weights[difficulty][2] + Weights[difficulty][3]

				for i := 0; i < 250; i++ {
					randomNumber := rand.Intn(maxNumber)
					if randomNumber > maxNumber-Weights[difficulty][0] {
						percentages[0]++
					} else if randomNumber > maxNumber-Weights[difficulty][0]-Weights[difficulty][1] {
						percentages[1]++
					} else if randomNumber > maxNumber-Weights[difficulty][0]-Weights[difficulty][1]-Weights[difficulty][2] {
						percentages[2]++
					} else if randomNumber > maxNumber-Weights[difficulty][0]-Weights[difficulty][1]-Weights[difficulty][2]-Weights[difficulty][3] {
						percentages[3]++
					}

				}

				for i := 0; i < 4; i++ {

					answers[i].Percentage = int32(math.Round((float64(percentages[i]) / 250.0) * 100.0))

				}

				answersSQL.Close()
			}

			response.Payload = &protobufMessages.UseLifelineResponse_Audience{
				Audience: &protobufMessages.AudienceResponse{
					Answers: answers,
				},
			}

			break
		}
	}

	out, err := proto.Marshal(&response)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Unable to use lifeline: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	if lifeline == LlUnknown {
		loggerInfo.Printf("A lifeline of type `%s` was detected for a run with id `%d`", lifelineAsString(lifeline), runId.RawSnowflake)
		return ctx.Status(http.StatusBadRequest).Send(out)
	} else {
		if wasLifelineUsed {
			loggerInfo.Printf("A lifeline of type `%s` was succesfully proccessed for a run with id `%d` (Rejected)", lifelineAsString(lifeline), runId.RawSnowflake)
		} else {
			_, err = db.Exec("INSERT INTO run_lifelines (id, run_question_id, used_lifelines) VALUES (NULL, ?, ?);", runQuestionIdInt, lifelinesStatus+int(lifeline))
			if err != nil {
				return c_error(ctx, fmt.Sprintf("Error while trying to update the runs' state: `%s`", err.Error()), fiber.ErrBadRequest.Code)
			}

			loggerInfo.Printf("A lifeline of type `%s` was succesfully proccessed for a run with id `%d` (Accepted)", lifelineAsString(lifeline), runId.RawSnowflake)
		}
	}

	return ctx.Status(http.StatusOK).Send(out)
}
