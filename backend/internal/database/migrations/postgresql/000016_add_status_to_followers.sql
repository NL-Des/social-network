-- +migrate Up
ALTER TABLE followers
    ADD COLUMN status TEXT NOT NULL DEFAULT 'accepted'
        CHECK (status IN ('pending', 'accepted'));

-- +migrate Down
ALTER TABLE followers
    DROP COLUMN status;