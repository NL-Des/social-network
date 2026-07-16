-- +migrate Up
CREATE TABLE IF NOT EXISTS chat_group_members (
    chat_group_id INTEGER NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
    userid        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joinedat      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chat_group_id, userid)
);

CREATE INDEX IF NOT EXISTS idx_chat_group_members_chat_group_id ON chat_group_members(chat_group_id);
CREATE INDEX IF NOT EXISTS idx_chat_group_members_userid ON chat_group_members(userid);

-- +migrate Down
DROP TABLE IF EXISTS chat_group_members;
