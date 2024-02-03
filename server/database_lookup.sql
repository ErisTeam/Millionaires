--- Select all questions
SELECT * FROM questions;

--- Select all answers
SELECT * FROM answers;

--- Select all runs
SELECT * FROM runs;

--- Select all run_questions
SELECT * FROM run_questions;

--- Select all questions for a given difficulty
SELECT * FROM questions WHERE questions.difficulty = 2;

--- Select a random question for a given difficulty
SELECT * FROM questions WHERE questions.difficulty = 2 ORDER BY RANDOM() LIMIT 1;

--- Select answers for a given question in a random order
SELECT answers.* FROM answers JOIN questions ON answers.question_id = questions.id WHERE questions.id == 0 ORDER BY RANDOM();

--- Select all run_questions for a given run
SELECT * FROM runs WHERE runs.id = 0;
--SELECT run_questions.* FROM run_questions JOIN runs ON run_questions.run_id = runs.id WHERE runs.id == 0;
SELECT run_questions.*, questions.* FROM run_questions JOIN runs ON run_questions.run_id = runs.id JOIN questions ON run_questions.question_id = questions.id WHERE runs.id == 0 ORDER BY questions.difficulty ASC;
