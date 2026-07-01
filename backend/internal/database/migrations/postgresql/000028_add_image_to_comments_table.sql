-- +migrate Up
ALTER TABLE comments
    ADD COLUMN image TEXT;

-- +migrate Down
ALTER TABLE comments
    DROP COLUMN image;
