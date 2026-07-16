-- +migrate Up
CREATE TABLE IF NOT EXISTS group_members (
    groupID   INTEGER NOT NULL REFERENCES groups(ID) ON DELETE CASCADE,
    userID    INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    invitedby INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    status    TEXT NOT NULL CHECK (status IN ('invited', 'pending', 'member')),
    joinedat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (groupID, userID)
);

CREATE INDEX IF NOT EXISTS idx_group_members_groupID
    ON group_members(groupID);

CREATE INDEX IF NOT EXISTS idx_group_members_userID
    ON group_members(userID);

-- +migrate Down
DROP TABLE IF EXISTS group_members;
