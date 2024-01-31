--- Show all questions
SELECT * FROM questions;

--- Show all answers
SELECT * FROM answers;

--- Show all runs
SELECT * FROM runs;

--- Show all run_questions
SELECT * FROM run_questions;

--- Show all answers for a given question
SELECT * FROM questions WHERE questions.id == 0;
SELECT answers.* FROM answers JOIN questions ON answers.question_id = questions.id WHERE questions.id == 0;

--- Show all run_questions for a given run
SELECT * FROM runs WHERE runs.id = 0;
--SELECT run_questions.* FROM run_questions JOIN runs ON run_questions.run_id = runs.id WHERE runs.id == 0;
SELECT run_questions.*, questions.* FROM run_questions JOIN runs ON run_questions.run_id = runs.id JOIN questions ON run_questions.question_id = questions.id WHERE runs.id == 0 ORDER BY questions.difficulty ASC;
