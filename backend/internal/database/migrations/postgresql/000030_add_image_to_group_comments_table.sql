-- +migrate Up
ALTER TABLE social_group_comments
    ADD COLUMN image TEXT;

-- +migrate Down
ALTER TABLE social_group_comments
    DROP COLUMN image;
