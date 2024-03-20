package main

import (
	"database/sql"
	"fmt"
	"millionairesServer/protobufMessages"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

var POINTS_FOR_LIFELINES = 70
var POINTS_FOR_QUESTION = 100
var POINTS_FOR_QUESTION_DIFFICULTY = 20
var POINTS_FOR_TIME = 60
var POINTS_TIME_FUNCTION_HALF = 20

var POINTS_FOR_WIN = 300

type CalculationRunQuestion struct {
    RunQuestionId Snowflake
    QuestionNum int
    Difficulty int
    AnsweredAt time.Time
    AnsweredCorrectly bool
}

/// For each lifeline that was not used the player gets +70 points
/// For each question answered correctly the player gets +100 points and +20 points multiplied by the difficulty of the question
/// Additional points for time (Less time spent on answering gives more points)
/// Additional +300 points on win
func calculateRunScore(ctx *fiber.Ctx, runId Snowflake) (int, error) {
	var db = ctx.Locals("db").(*sql.DB)
    var points = 0

    // Get used lifelines
    lifelinesRow := db.QueryRow("SELECT COALESCE((SELECT run_lifelines.used_lifelines FROM run_lifelines JOIN run_questions ON run_lifelines.run_question_id = run_questions.id WHERE run_questions.run_id = ? ORDER BY run_lifelines.used_lifelines DESC LIMIT 1), 0);", runId.RawSnowflake)
    var usedLifelines int
    err := lifelinesRow.Scan(&usedLifelines)
	if err != nil {
        loggerWarn.Printf("Unable to fetch used lifelines for a run with ID `%d`. Reason: `%s`", runId.RawSnowflake, err)
        return 0, err
	}

    // Get run questions
    runQuestionRows, err := db.Query("SELECT rq.id, rq.question_num, rq.answered_at, (SELECT questions.difficulty FROM questions WHERE rq.question_id = questions.id) AS difficulty, (SELECT answers.is_correct FROM answers WHERE answers.id = rq.answer_id) AS is_correct FROM run_questions rq WHERE rq.run_id = ? ORDER BY rq.question_num ASC;", runId.RawSnowflake)
	if err != nil {
        loggerWarn.Printf("Unable to fetch run questions for a run with ID `%d`. Reason: `%s`", runId.RawSnowflake, err)
        return 0, err
	}
    defer runQuestionRows.Close()
    
    var runQuestions []CalculationRunQuestion
    for runQuestionRows.Next() {
        var runQuestionId int64
        var runQuestion CalculationRunQuestion
        runQuestionRows.Scan(&runQuestionId, &runQuestion.QuestionNum, &runQuestion.AnsweredAt, &runQuestion.Difficulty, &runQuestion.AnsweredCorrectly)
        runQuestion.RunQuestionId = snowflakeFromInt(runQuestionId)
        runQuestions = append(runQuestions, runQuestion)
    }
    runQuestionRows.Close()
    if runQuestionRows.Err() != nil {
        loggerWarn.Printf("Unable to scan fetched run questions for a run with ID `%d`. Reason: `%s`", runId.RawSnowflake, err)
        return 0, err
    }

    // Calculate points for lifelines that were not used
    var lifelinesList = [3]int{int(LlFiftyFifty), int(LlFriendCall), int(LlAudience)}
    for i:=0; i<3; i++ {
        if ((usedLifelines & lifelinesList[i]) == 0) {
            loggerInfo.Printf("Calculating score for a run of ID `%d`. (+%d not using a lifeline with num `%d`) (`%d`)", runId.RawSnowflake, POINTS_FOR_LIFELINES, lifelinesList[i], usedLifelines)
            points += POINTS_FOR_LIFELINES
        }
    }

    // Calculate points for correctly answered questions and their difficulty
    for i:=0; i<len(runQuestions); i++ {
        if runQuestions[i].AnsweredCorrectly {
            var timeTaken float64
            if (i == 0) {
                timeTaken = float64(runQuestions[i].AnsweredAt.Unix() - (snowflakeIntToTimestamp(runId.RawSnowflake)/1000))
            } else {
                timeTaken = float64(runQuestions[i].AnsweredAt.Unix() - runQuestions[i-1].AnsweredAt.Unix())
            }

            var timePoints = 0
            if !(timeTaken > 35) {
                timePoints = int(float64(POINTS_FOR_TIME) * ((timeTaken + float64(POINTS_TIME_FUNCTION_HALF)*2) / (timeTaken + float64(POINTS_TIME_FUNCTION_HALF)) - 1))
            } 

            loggerInfo.Printf("Calculating score for a run of ID `%d`. (+%d correctly answered question, +%d question difficulty, +%d time)", runId.RawSnowflake, POINTS_FOR_QUESTION, (POINTS_FOR_QUESTION_DIFFICULTY * (runQuestions[i].Difficulty+1)), timePoints)
            points += POINTS_FOR_QUESTION + (POINTS_FOR_QUESTION_DIFFICULTY * (runQuestions[i].Difficulty+1)) + timePoints
        }
    }

    // Points for winning a run
    if runQuestions[len(runQuestions)-1].QuestionNum == 11 && runQuestions[len(runQuestions)-1].AnsweredCorrectly {
        loggerInfo.Printf("Calculating score for a run of ID `%d`. (+%d win)", runId.RawSnowflake, POINTS_FOR_WIN)
        points += POINTS_FOR_WIN
    }

    loggerInfo.Printf("Calculated score for a run of ID `%d` to be `%d`. (`%d`)", runId.RawSnowflake, points, usedLifelines)
    return points, nil
}

//Routes related to statistics
func getRunScoreRoute(ctx *fiber.Ctx) error {
	ctx.Set("Content-Type", "application/vnd.google.protobuf")

	var request = &protobufMessages.GetRunScoreRequest{}
	if err := proto.Unmarshal(ctx.Body(), request); err != nil {
        return c_error(ctx, routeFmt("getRunScore", fmt.Sprintf("Unable to unmarshal request. Reason: `%s`", err.Error())), fiber.ErrInternalServerError.Code)
	}

    loggerInfo.Print(routeFmt("getRunScore", fmt.Sprint("Visited with the following data { ", request, " }")))

	// Parse run id
	runIdAsInt, err := strconv.Atoi(request.RunSnowflakeId)
	if err != nil {
        return c_error(ctx, routeFmt("getRunScore", fmt.Sprintf("Unable to parse RunId `%s`. Reason: `%s`", request.RunSnowflakeId, err)), fiber.ErrInternalServerError.Code)
	}
	runId := snowflakeFromInt(int64(runIdAsInt))

    score, err := calculateRunScore(ctx, runId)

	var response protobufMessages.GetRunScoreResponse
    response.Points = int32(score)
	out, err := proto.Marshal(&response)
	if err != nil {
		c_error(ctx, routeFmt("getRunScore", fmt.Sprintf("Unable to encode response as bytes. Reason: `%s`", err)), fiber.ErrInternalServerError.Code)
	}

	loggerInfo.Println(routeFmt("getRunScore", fmt.Sprintf("Succesfully got score for a run with id `%d`.", runId.RawSnowflake)))
	return ctx.Status(fiber.StatusOK).Send(out)
}
