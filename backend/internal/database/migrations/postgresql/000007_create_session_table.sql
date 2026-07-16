-- +migrate Up
CREATE TABLE IF NOT EXISTS session (
    ID        SERIAL PRIMARY KEY,
    userID    INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    token     TEXT NOT NULL UNIQUE,
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expiresat TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_userID
    ON session(userID);

-- +migrate Down
DROP TABLE IF EXISTS session;