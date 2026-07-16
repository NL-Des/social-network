-- +migrate Up
CREATE TABLE IF NOT EXISTS group_comments (
    ID        SERIAL PRIMARY KEY,
    postID    INTEGER NOT NULL REFERENCES group_posts(ID) ON DELETE CASCADE,
    authorID  INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    content   TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 2000),
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_comments_postID
    ON group_comments(postID);

CREATE INDEX IF NOT EXISTS idx_group_comments_authorID
    ON group_comments(authorID);

-- +migrate Down
DROP TABLE IF EXISTS group_comments;