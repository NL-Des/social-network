CREATE TABLE IF NOT EXISTS users (
    ID          SERIAL PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE CHECK (email LIKE '%@%'),
    password    TEXT NOT NULL CHECK (length(password) >= 8),
    firstname   TEXT NOT NULL,
    lastname    TEXT NOT NULL,
    dateofbirth DATE NOT NULL CHECK (dateofbirth <= CURRENT_DATE - INTERVAL '13 years'),
    isprivate   BOOLEAN NOT NULL,
    avatar      TEXT,
    pseudo      TEXT UNIQUE CHECK (pseudo IS NULL OR (length(trim(pseudo)) >= 3 AND length(pseudo) <= 30)),
    aboutme     TEXT
);