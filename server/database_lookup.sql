--- Select all ...
SELECT * FROM players;
SELECT * FROM questions;
SELECT * FROM answers;
SELECT * FROM runs;
SELECT * FROM run_questions;
SELECT * FROM run_lifelines;

--- Create a player
INSERT INTO players (snowflake_id, name, tries_left) VALUES (?, ?, ?);

--- Check if a player with a given name exists and return their ID
SELECT players.snowflake_id FROM players WHERE players.name = ?;

--- Get players' tries left
SELECT players.tries_left FROM players WHERE players.snowflake_id = ?;

--- Create a run for a player with the specified ID and decrement their number of tries left
INSERT INTO runs (snowflake_id, player_id, ended) VALUES (?, ?, false); UPDATE players SET tries_left = (tries_left - 1) WHERE snowflake_id = ?;

--- Get a random question for a given difficulty
SELECT questions.* FROM questions WHERE questions.difficulty = ? ORDER BY RANDOM() LIMIT 1;

--- Get answers (id, answer) for a givens question ID
SELECT answers.id, answers.answer FROM answers JOIN questions ON answers.question_id = questions.id WHERE questions.id = ?;

--- Get the last question_num for a given run ID (if the run has no run_questions, returns 0)
SELECT COALESCE((SELECT run_questions.question_num FROM run_questions JOIN runs ON runs.snowflake_id = run_questions.run_id WHERE runs.snowflake_id = ? ORDER BY run_questions.question_num DESC LIMIT 1), 0);

--- Create a new run_question
INSERT INTO run_questions (id, run_id, question_id, answer_id, answered_at, question_num) VALUES (NULL, ?, ?, NULL, NULL, (SELECT COALESCE((SELECT run_questions.question_num FROM run_questions JOIN runs ON runs.snowflake_id = run_questions.run_id WHERE runs.snowflake_id = ? ORDER BY run_questions.question_num DESC LIMIT 1)+1, 0)));

--- Get current run_question for a given run ID
SELECT run_questions.* FROM run_questions WHERE run_questions.run_id = ? ORDER BY run_questions.question_num DESC LIMIT 1;

--- Check if the given answer ID is an answer for a given question ID
SELECT COALESCE((SELECT TRUE FROM answers JOIN questions ON questions.id = answers.question_id WHERE answers.id = ? AND questions.id = ?), FALSE) AS is_answer_relevant;

--- Check if the given answer ID is a correct answer for a given question ID
SELECT COALESCE((SELECT TRUE FROM answers JOIN questions ON questions.id = answers.question_id WHERE answers.id = ? AND questions.id = ? AND answers.is_correct = TRUE), FALSE) AS is_answer_correct;

--- Check both of the above
SELECT COALESCE((SELECT TRUE FROM answers JOIN questions ON questions.id = answers.question_id WHERE answers.id = ? AND questions.id = ?), FALSE) AS is_answer_relevant, COALESCE((SELECT TRUE FROM answers JOIN questions ON questions.id = answers.question_id WHERE answers.id = ? AND questions.id = ? AND answers.is_correct = TRUE), FALSE) AS is_answer_correct;

--- Get status of used lifelines in a run
SELECT COALESCE((SELECT run_lifelines.used_lifelines FROM run_lifelines JOIN run_questions ON run_lifelines.run_question_id = run_questions.id WHERE run_questions.run_id = 0 ORDER BY run_lifelines.used_lifelines DESC LIMIT 1), 0);

--- Get relevant info about runs that have ended
SELECT r.snowflake_id AS run_id, p.name AS player_name, rl.used_lifelines AS last_used_lifeline, rq.question_num = 11 AND a.is_correct = TRUE AS won FROM runs r JOIN players p ON r.player_id = p.snowflake_id JOIN run_questions rq ON r.snowflake_id = rq.run_id LEFT JOIN run_lifelines rl ON rq.id = rl.run_question_id LEFT JOIN answers a ON rq.answer_id = a.id WHERE r.ended = TRUE AND rq.id IN ( SELECT MAX(id) FROM run_questions GROUP BY run_id);

--- Use a lifeline
INSERT INTO run_lifelines (id, run_question_id, used_lifelines) VALUES (NULL, ?, ?);

--- Select answers for a given question in a random order
SELECT answers.* FROM answers JOIN questions ON answers.question_id = questions.id WHERE questions.id == 0 ORDER BY RANDOM();

--- 50/50 by the run id (returns IDs to eliminate)
SELECT answers.id FROM answers WHERE answers.question_id = (SELECT run_questions.question_id FROM run_questions WHERE run_questions.run_id = ? AND run_questions.answered_at IS NULL ORDER BY run_questions.run_id DESC LIMIT 1) AND answers.is_correct = FALSE ORDER BY RANDOM() LIMIT 2;

--- Get a random question of a specified difficulty that hasn't been seen yet by the player
SELECT q.* FROM questions q WHERE q.id NOT IN (SELECT rq.question_id FROM run_questions rq JOIN runs r ON rq.run_id = r.snowflake_id WHERE r.player_id = (SELECT player_id FROM runs WHERE snowflake_id = ?)) AND q.difficulty = ? ORDER BY RANDOM() LIMIT 1;

--- Get a random question of a specified difficulty that hasn't been seen yet in the current run
SELECT q.* FROM questions q WHERE q.id NOT IN (SELECT rq.question_id FROM run_questions rq WHERE rq.run_id = ?) AND q.difficulty = ? ORDER BY RANDOM() LIMIT 1;




---
SELECT rq.id, rq.question_num, rq.answered_at, (SELECT questions.difficulty FROM questions WHERE rq.question_id = questions.id) AS difficulty, (SELECT answers.is_correct FROM answers WHERE answers.id = rq.answer_id) AS is_correct FROM run_questions rq WHERE rq.run_id = 0 ORDER BY rq.question_num ASC;

SELECT rq.question_num, (SELECT answers.is_correct FROM answers WHERE rq.answer_id = answers.id) AS is_correct FROM run_questions rq JOIN runs ON runs.snowflake_id = rq.run_id WHERE runs.snowflake_id = 0 ORDER BY rq.question_num DESC LIMIT 1;

