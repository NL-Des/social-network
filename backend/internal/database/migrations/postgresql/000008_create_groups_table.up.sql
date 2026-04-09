CREATE TABLE IF NOT EXISTS groups (
    ID          SERIAL PRIMARY KEY,
    creatorID   INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    leaderID    INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    title       TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 80),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0 AND length(description) <= 1500),
    createdat   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);