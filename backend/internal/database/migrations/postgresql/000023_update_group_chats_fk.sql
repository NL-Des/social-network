-- +migrate Up
-- Recrée group_chats avec FK vers chat_groups au lieu de groups
DROP TABLE IF EXISTS group_chats;

CREATE TABLE IF NOT EXISTS group_chats (
    id            SERIAL PRIMARY KEY,
    chat_group_id INTEGER NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
    senderid      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content       TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 8000),
    createdat     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_chats_chat_group_id ON group_chats(chat_group_id);
CREATE INDEX IF NOT EXISTS idx_group_chats_senderid ON group_chats(senderid);

-- +migrate Down
DROP TABLE IF EXISTS group_chats;
