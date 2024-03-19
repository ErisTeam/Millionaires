--- Separated this query, as it causes an error for SQLS because there is "case" in it... wow
-- INSERT INTO answers (id, question_id, answer, is_correct, chosen) VALUES
-- (739, 477, "Pascal case", true, 0),
-- (341, 477, "Camel case", false, 0),
-- (558, 477, "Kebab Case", false, 0),
-- (769, 477, "Snake case", false, 0);
SELECT answers.id,
	questions.difficulty
FROM answers
	JOIN questions ON answers.question_id = questions.id
WHERE answers.question_id = (
		SELECT run_questions.question_id
		FROM run_questions
		WHERE run_questions.run_id = ?
			AND run_questions.answered_at IS NULL
		ORDER BY run_questions.run_id DESC
		LIMIT 1
	)
ORDER BY answers.is_correct DESC,
	RANDOM()
LIMIT 4