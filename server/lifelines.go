package main

import (
	//"database/sql"
	"database/sql"
	"fmt"
	"millionairesServer/protobufMessages"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/protobuf/proto"
)

type Lifeline int
const (
    LlUnknown Lifeline = -1
    LlFiftyFifty Lifeline = 1
    LlFriendCall Lifeline = 2
    LlAudience Lifeline = 4
)

func lifelineAsString(lifeline Lifeline) string {
    switch (lifeline) {
        case LlFiftyFifty: { return "FiftyFifty" }
        case LlFriendCall: { return "FriendCall" }
        case LlAudience: { return "Audience" }
    }
    return "UNKNOWN"
}

func useLifeline(ctx *fiber.Ctx) error {
	request := protobufMessages.UseLifelineRequest{}
	err := proto.Unmarshal(ctx.Body(), &request)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Error while parsing request body of a lifeline request: `%s`", err), fiber.ErrBadRequest.Code)
	}

	var db = ctx.Locals("db").(*sql.DB)

	// Parse run id
	runIdAsInt, err := strconv.Atoi(request.RunSnowflakeId)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Error while parsing run_id: `%s`", err), fiber.ErrInternalServerError.Code)
	}

	runId := snowflakeFromInt(int64(runIdAsInt))

    lifelines_stats := 0
    lifelines_stats_sql, err := db.Query("SELECT runs.used_lifelines FROM runs WHERE runs.snowflake_id = ?;", runId.RawSnowflake)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Error while getting used lifelines of a run with id `%d`: `%s`", runId.RawSnowflake, err), fiber.ErrInternalServerError.Code)
	}

    lifelines_stats_sql.Next()
    lifelines_stats_sql.Scan(&lifelines_stats)
    lifelines_stats_sql.Close()

    logger.Printf("Using a lifeline for a run with id `%d`", runId.RawSnowflake)

    response := protobufMessages.UseLifelineResponse{}
    lifeline := LlUnknown
    wasLifelineUsed := true
    switch(request.Lifeline) {
        case protobufMessages.Lifeline_FiftyFifty: {
            lifeline = LlFiftyFifty
            wasLifelineUsed = (lifelines_stats & int(lifeline)) == int(lifeline)
            discarded_answers := []*protobufMessages.Answer{}

            if (!wasLifelineUsed) {
                discarded_answers_sql, err := db.Query("SELECT answers.id FROM answers WHERE answers.question_id = (SELECT run_questions.question_id FROM run_questions WHERE run_questions.run_id = ? AND run_questions.answered_at IS NULL ORDER BY run_questions.run_id DESC LIMIT 1) AND answers.is_correct = FALSE ORDER BY RANDOM() LIMIT 2;", runId.RawSnowflake)
                if err != nil {
                    c_error(ctx, fmt.Sprintf("Unable to complete 50/50: `%s`", err), fiber.ErrInternalServerError.Code)
                }
                defer discarded_answers_sql.Close()

                for discarded_answers_sql.Next() {
                    discarded_answer := protobufMessages.Answer{}
                    discarded_answers_sql.Scan(&discarded_answer.Id)
                    discarded_answers = append(discarded_answers, &discarded_answer)
                }
            }

            response.Payload = &protobufMessages.UseLifelineResponse_FiftyFifty{
                FiftyFifty: &protobufMessages.FiftyFiftyResponse {
                    Accepted: !wasLifelineUsed,
                    Answers: discarded_answers,
                },
            }

            break;
        }
        case protobufMessages.Lifeline_FriendCall: {
            lifeline = LlFriendCall
        }
        case protobufMessages.Lifeline_Audience: {
            lifeline = LlAudience
        }
    }

	out, err := proto.Marshal(&response)
	if err != nil {
		return c_error(ctx, fmt.Sprintf("Unable to use lifeline: `%s`", err), fiber.ErrInternalServerError.Code)
	}

    if (lifeline == LlUnknown) {
        logger.Printf("A lifeline of type `%s` was detected for a run with id `%d`", lifelineAsString(lifeline), runId.RawSnowflake)
        return ctx.Status(http.StatusBadRequest).Send(out)
    } else {
        if (wasLifelineUsed) {
            logger.Printf("A lifeline of type `%s` was succesfully proccessed for a run with id `%d` (Rejected)", lifelineAsString(lifeline), runId.RawSnowflake)
        } else {
            _, err = db.Exec("UPDATE runs SET used_lifelines = (used_lifelines + ?) WHERE runs.snowflake_id = ?;", int(lifeline), runId.RawSnowflake)
            if err != nil {
                return c_error(ctx, fmt.Sprintf("Error while trying to update the runs' state: `%s`", err.Error()), fiber.ErrBadRequest.Code)
            }

            logger.Printf("A lifeline of type `%s` was succesfully proccessed for a run with id `%d` (Accepted)", lifelineAsString(lifeline), runId.RawSnowflake)
        }
    }

	return ctx.Status(http.StatusOK).Send(out)
}
