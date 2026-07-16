-- +migrate Up
CREATE TABLE IF NOT EXISTS chat_groups (
    id        SERIAL PRIMARY KEY,
    title     TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 80),
    creatorid INTEGER REFERENCES users(id) ON DELETE SET NULL,
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- +migrate Down
DROP TABLE IF EXISTS chat_groups CASCADE;
