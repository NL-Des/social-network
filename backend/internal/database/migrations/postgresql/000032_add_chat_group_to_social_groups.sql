-- +migrate Up
ALTER TABLE social_groups ADD COLUMN chat_group_id INTEGER REFERENCES group_chats(id) ON DELETE SET NULL;

-- +migrate Down
ALTER TABLE social_groups DROP COLUMN IF EXISTS chat_group_id;
