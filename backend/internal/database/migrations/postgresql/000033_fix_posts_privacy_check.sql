-- +migrate Up
ALTER TABLE posts DROP CONSTRAINT posts_privacy_check;
ALTER TABLE posts ADD CONSTRAINT posts_privacy_check
    CHECK (privacy IN ('public', 'almost-private', 'private'));

-- +migrate Down
ALTER TABLE posts DROP CONSTRAINT posts_privacy_check;
ALTER TABLE posts ADD CONSTRAINT posts_privacy_check
    CHECK (privacy IN ('public', 'friends', 'private'));
