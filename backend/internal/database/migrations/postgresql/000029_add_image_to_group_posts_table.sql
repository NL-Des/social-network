-- +migrate Up
ALTER TABLE social_group_posts
    ADD COLUMN image TEXT;

-- +migrate Down
ALTER TABLE social_group_posts
    DROP COLUMN image;
