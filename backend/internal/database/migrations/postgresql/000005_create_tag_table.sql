-- +migrate Up
CREATE TABLE IF NOT EXISTS tag (
    ID   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- +migrate Down
DROP TABLE IF EXISTS tag;