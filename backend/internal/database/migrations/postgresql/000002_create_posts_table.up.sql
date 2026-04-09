CREATE TABLE IF NOT EXISTS posts (
    ID         SERIAL PRIMARY KEY,
    authorID   INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    title      TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 120),
    content    TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 10000),
    privacy    TEXT NOT NULL CHECK (privacy IN ('public', 'friends', 'private')),
    createdat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_authorID
    ON posts(authorID);