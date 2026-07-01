-- +migrate Up
ALTER TABLE posts
    ADD COLUMN image TEXT;

-- +migrate Down
ALTER TABLE posts
    DROP COLUMN image;
