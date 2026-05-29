-- +migrate Up
CREATE TABLE IF NOT EXISTS group_post_likes (
    group_post_id INT NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "type"        VARCHAR(10) NOT NULL CHECK ("type" IN ('like', 'dislike')),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_post_id, user_id)
);

-- +migrate Down
DROP TABLE IF EXISTS group_post_likes;
