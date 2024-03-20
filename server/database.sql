-- 3, 3, 2, 2, 1, 1
-- 0, 1, 2, 3, 4, 5

--- Create and populate the `players` table
CREATE TABLE IF NOT EXISTS players (
    snowflake_id INTEGER UNIQUE NOT NULL primary key,
    name VARCHAR(255),
    tries_left INTEGER
);

--- Create and populate the `questions` table
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER UNIQUE NOT NULL primary key,
    question TEXT,
    difficulty INTEGER,
    impressions INTEGER
);


--- Create and populate the `answers` table
CREATE TABLE IF NOT EXISTS answers (
    id INTEGER UNIQUE NOT NULL primary key,
    question_id INTEGER,
    answer TEXT,
    is_correct BOOLEAN,
    chosen INTEGER,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);


--- Create and populate the `runs` table
CREATE TABLE IF NOT EXISTS runs (
    snowflake_id INTEGER UNIQUE NOT NULL primary key,
    player_id INTEGER NOT NULL,
    ended BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

--- Create and populate the `run_questions` table
CREATE TABLE IF NOT EXISTS run_questions (
    id INTEGER UNIQUE NOT NULL primary key,
    run_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_id INTEGER DEFAULT NULL,
    answered_at TIMESTAMP DEFAULT NULL,
    question_num INTEGER NOT NULL,
    FOREIGN KEY (run_id) REFERENCES runs(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (answer_id) REFERENCES answers(id)
);

--- Create and populate the `run_lifelines` table
CREATE TABLE IF NOT EXISTS run_lifelines (
    id INTEGER UNIQUE NOT NULL primary key,
    run_question_id INTEGER NOT NULL,
    used_lifelines INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (run_question_id) REFERENCES run_question(id)
);

CREATE TABLE IF NOT EXISTS feedback(
    id INTEGER UNIQUE NOT NULL PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    run_id INTEGER NOT NULL,
    message VARCHAR(255) NOT NULL,
);