CREATE TABLE IF NOT EXISTS messages (
    ID         SERIAL PRIMARY KEY,
    senderID   INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    receiverID INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    content    TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 8000),
    createdat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_senderID
    ON messages(senderID);

CREATE INDEX IF NOT EXISTS idx_messages_receiverID
    ON messages(receiverID);