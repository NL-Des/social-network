-- +migrate Up
CREATE TABLE IF NOT EXISTS post_allowed_viewers (
    post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

-- +migrate Down
DROP TABLE IF EXISTS post_allowed_viewers;
