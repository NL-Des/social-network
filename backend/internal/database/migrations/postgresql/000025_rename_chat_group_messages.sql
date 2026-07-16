-- +migrate Up
ALTER TABLE IF EXISTS group_chats RENAME TO chat_group_messages;

-- +migrate Down
ALTER TABLE IF EXISTS chat_group_messages RENAME TO group_chats;
