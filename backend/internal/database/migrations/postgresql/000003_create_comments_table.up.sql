CREATE TABLE IF NOT EXISTS comments (
    ID         SERIAL PRIMARY KEY,
    postID     INTEGER NOT NULL REFERENCES posts(ID) ON DELETE CASCADE,
    authorID   INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    content    TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 2000),
    createdat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_postID
    ON comments(postID);

CREATE INDEX IF NOT EXISTS idx_comments_authorID
    ON comments(authorID);