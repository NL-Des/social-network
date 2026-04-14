-- +migrate Up
CREATE TABLE IF NOT EXISTS group_posts (
    ID        SERIAL PRIMARY KEY,
    groupID   INTEGER NOT NULL REFERENCES groups(ID) ON DELETE CASCADE,
    authorID  INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    title     TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 120),
    content   TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 10000),
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_posts_groupID
    ON group_posts(groupID);

CREATE INDEX IF NOT EXISTS idx_group_posts_authorID
    ON group_posts(authorID);

-- +migrate Down
DROP TABLE IF EXISTS group_posts;
