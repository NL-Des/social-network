-- +migrate Up
CREATE TABLE IF NOT EXISTS followers (
    followerID  INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    followingID INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    PRIMARY KEY (followerID, followingID)
);

CREATE INDEX IF NOT EXISTS idx_followers_followerID
    ON followers(followerID);

CREATE INDEX IF NOT EXISTS idx_followers_followingID
    ON followers(followingID);

-- +migrate Down
DROP TABLE IF EXISTS followers;
