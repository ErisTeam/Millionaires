--- Separated this query, as it causes an error for SQLS because there is "case" in it... wow
INSERT INTO answers (id, question_id, answer, is_correct, chosen) VALUES
(739, 477, "Pascal case", true, 0),
(341, 477, "Camel case", false, 0),
(558, 477, "Kebab Case", false, 0),
(769, 477, "Snake case", false, 0);
