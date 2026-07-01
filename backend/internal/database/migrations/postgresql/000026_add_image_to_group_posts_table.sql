-- +migrate Up
ALTER TABLE group_posts
    ADD COLUMN image TEXT;

-- +migrate Down
ALTER TABLE group_posts
    DROP COLUMN image;
