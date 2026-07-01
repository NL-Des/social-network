-- +migrate Up
ALTER TABLE IF EXISTS chat_groups          RENAME TO group_chats;
ALTER TABLE IF EXISTS chat_group_members   RENAME TO group_chat_members;
ALTER TABLE IF EXISTS chat_group_messages  RENAME TO group_chat_messages;

-- +migrate Down
ALTER TABLE IF EXISTS group_chats          RENAME TO chat_groups;
ALTER TABLE IF EXISTS group_chat_members   RENAME TO chat_group_members;
ALTER TABLE IF EXISTS group_chat_messages  RENAME TO chat_group_messages;
