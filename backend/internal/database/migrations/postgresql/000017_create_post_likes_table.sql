-- +migrate Up
CREATE TABLE IF NOT EXISTS post_likes (
    post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('like', 'dislike')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- +migrate Down
DROP TABLE IF EXISTS post_likes;
