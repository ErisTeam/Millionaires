--- Select all ...
SELECT * FROM players;
SELECT * FROM questions;
SELECT * FROM answers;
SELECT * FROM runs;
SELECT * FROM run_questions;
SELECT * FROM run_lifelines;

--- Select all questions for a given difficulty
SELECT * FROM questions WHERE questions.difficulty = 2;

--- Select a random question for a given difficulty
SELECT * FROM questions WHERE questions.difficulty = 2 ORDER BY RANDOM() LIMIT 1;

--- Select answers for a given question in a random order
SELECT answers.* FROM answers JOIN questions ON answers.question_id = questions.id WHERE questions.id == 0 ORDER BY RANDOM();

--- Select all run_questions for a given run
SELECT * FROM runs WHERE runs.id = 0;
--SELECT run_questions.* FROM run_questions JOIN runs ON run_questions.run_id = runs.id WHERE runs.id == 0;
SELECT run_questions.*, questions.* FROM run_questions JOIN runs ON run_questions.run_id = runs.snowflake_id JOIN questions ON run_questions.question_id = questions.id WHERE runs.snowflake_id == 0 ORDER BY questions.difficulty ASC;

--- Get question_id from answers.id
SELECT answers.question_id FROM answers WHERE answers.id = 5;

--- Select current run lifeline
SELECT runs.used_lifelines FROM runs WHERE runs.snowflake_id = 0;

--- Get run_question from answer_id and run_id
SELECT run_questions.* FROM run_questions JOIN runs ON run_questions.run_id = runs.id WHERE run_questions.run_id = 145256729320357914 AND run_questions.question_id = (SELECT answers.question_id FROM answers WHERE answers.id = 4);

--- Get lifeline by run_id
SELECT runs.used_lifelines FROM runs WHERE runs.snowflake_id = 1;

--- Update lifeline of a run
UPDATE runs SET used_lifelines = (used_lifelines + 1) WHERE runs.snowflake_id = 1;

--- 50/50 by the run id (returns IDs to eliminate)
SELECT answers.id FROM answers WHERE answers.question_id = (SELECT run_questions.question_id FROM run_questions WHERE run_questions.run_id = 150871546290765834 AND run_questions.answered_at IS NULL ORDER BY run_questions.run_id DESC LIMIT 1) AND answers.is_correct = FALSE ORDER BY RANDOM() LIMIT 2;
