-- +migrate Up
CREATE TABLE IF NOT EXISTS group_chats (
    ID        SERIAL PRIMARY KEY,
    groupID   INTEGER NOT NULL REFERENCES groups(ID) ON DELETE CASCADE,
    senderID  INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    content   TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 8000),
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_chats_groupID
    ON group_chats(groupID);

CREATE INDEX IF NOT EXISTS idx_group_chats_senderID
    ON group_chats(senderID);

-- +migrate Down
DROP TABLE IF EXISTS group_chats;