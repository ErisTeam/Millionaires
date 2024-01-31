--- Create and populate the `questions` table
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER UNIQUE NOT NULL primary key,
    question TEXT,
    difficulty INTEGER,
    impressions INTEGER
);

INSERT INTO questions (
    id,
    question,
    difficulty,
    impressions
) VALUES
( 0, "Na którym systemie liczbowym operuje komputer?", 2, 12 ),
( 1, "Ile bitów(b) ma MegaBajt(MB)?", 2, 18 ),
( 2, "Jaki kolor reprezentuje litera B w RGB?", 1, 15 );



--- Create and populate the `answers` table
CREATE TABLE IF NOT EXISTS answers (
    id INTEGER UNIQUE NOT NULL primary key,
    question_id INTEGER,
    answer TEXT,
    is_correct BOOLEAN,
    chosen INTEGER,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

INSERT INTO answers (
    id,
    question_id,
    answer,
    is_correct,
    chosen
) VALUES
( 0, 0, "Dwójkowym", true, 10),
( 1, 0, "Trójkowym", false, 0),
( 2, 0, "Ósemkowym", false, 1),
( 3, 0, "Szesnastkowym", false, 1),
( 4, 1, "1024", true, 10 ),
( 5, 1, "1000", false, 7 ),
( 6, 1, "4096", false, 1 ),
( 7, 1, "8000", false, 0 ),
( 8, 2, "Niebieski", true, 13),
( 9, 2, "Czerwony", true, 1),
( 10, 2, "Zielony", true, 0),
( 11, 2, "Czarny", true, 1);



--- Create and populate the `runs` table
CREATE TABLE IF NOT EXISTS runs (
    id INTEGER UNIQUE NOT NULL primary key,
    name VARCHAR(255),
    started_at TIMESTAMP,
    used_lifelines INTEGER
);

INSERT INTO runs (
    id,
    name,
    started_at,
    used_lifelines
) VALUES
( 0, "BoyKisser :3", "2024-05-28T15:36:56.200", 0 ),
( 1, "Joe", "2024-05-28T15:36:56.200", 7);



--- Create and populate the `run_questions` table
CREATE TABLE IF NOT EXISTS run_questions (
    id INTEGER UNIQUE NOT NULL primary key,
    run_id INTEGER,
    question_id INTEGER,
    answer_id INTEGER,
    answered_at TIMESTAMP,
    lifelines_used INTEGER,
    FOREIGN KEY (run_id) REFERENCES runs(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (answer_id) REFERENCES answers(id)
);

INSERT INTO run_questions (
    id,
    run_id,
    question_id,
    answer_id,
    answered_at,
    lifelines_used
) VALUES
( 0, 0, 2, 8, "2024-05-28T15:36:56.200", 0 ),
( 1, 0, 1, 4, "2024-05-28T15:36:56.200", 0 );
