--- Count of how many times a question was shown
SELECT
    q.difficulty,
    q.question,
    COUNT(q.question) AS seen
FROM
    answers ans
    JOIN questions q ON q.id = ans.question_id
WHERE
    ans.chosen > 0
GROUP BY
    question_id
ORDER BY
    q.difficulty ASC,
    seen DESC;

--- Answers to questions during the whole game for each player with their answer and the correct one
SELECT
    r.snowflake_id,
    p.name, 
    q.question,
    (SELECT answers.answer FROM answers WHERE answers.id = rq.answer_id) AS their_answer,
    (SELECT answers.answer FROM answers WHERE answers.is_correct = true AND answers.question_id = q.id) AS correct_answer
FROM
    runs r
    JOIN players p ON p.snowflake_id = r.player_id 
    JOIN run_questions rq ON rq.run_id = r.snowflake_id
    JOIN answers a ON a.question_id = rq.question_id
    JOIN questions q ON  q.id = rq.question_id
GROUP BY 
    p.name, q.question
ORDER BY
    p.name,
    r.snowflake_id,
    rq.question_num;

--- Answers to questions made by a single player in all the runs (sorted by run ID)
SELECT
    r.snowflake_id,
    p.name, 
    q.question,
    (SELECT answers.answer FROM answers WHERE answers.id = rq.answer_id) AS their_answer,
    (SELECT answers.answer FROM answers WHERE answers.is_correct = true AND answers.question_id = q.id) AS correct_answer
FROM
    runs r
    JOIN players p ON p.snowflake_id = r.player_id 
    JOIN run_questions rq ON rq.run_id = r.snowflake_id
    JOIN answers ca ON ca.question_id = rq.question_id
    JOIN questions q ON  q.id = rq.question_id
WHERE
    p.snowflake_id = 152477343351308363
GROUP BY 
    p.name, q.question
ORDER BY
    r.snowflake_id,
    rq.question_num;

--- Count of correct and incorrect answers made by a player during the whole game
SELECT
    p.name,
    COUNT((SELECT 1 WHERE a.is_correct = TRUE AND a.id = rq.answer_id)) AS correct_answers,
    COUNT((SELECT 1 WHERE a.is_correct = FALSE AND a.id = rq.answer_id)) AS wrong_answers,
    COUNT((SELECT 1 WHERE a.id = rq.answer_id)) AS total_answers
FROM
    runs r
    JOIN players p ON p.snowflake_id = r.player_id 
    JOIN run_questions rq ON rq.run_id = r.snowflake_id
    JOIN answers a ON a.question_id = rq.question_id
    JOIN questions q ON  q.id = rq.question_id
GROUP BY 
    p.name
ORDER BY
    correct_answers DESC,
    total_answers DESC;


--- Sum of all the scores each player has made during the game
SELECT
    p.name,
    SUM(r.score) total_score
FROM
    runs r
    JOIN players p ON p.snowflake_id = r.player_id 
GROUP BY 
    p.name
ORDER BY
    total_score DESC;
