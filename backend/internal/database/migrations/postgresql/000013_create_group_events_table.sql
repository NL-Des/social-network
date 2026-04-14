-- +migrate Up
CREATE TABLE IF NOT EXISTS group_events (
    ID            SERIAL PRIMARY KEY,
    groupID       INTEGER NOT NULL REFERENCES groups(ID) ON DELETE CASCADE,
    creatorID     INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    title         TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 80),
    description   TEXT NOT NULL CHECK (length(trim(description)) > 0 AND length(description) <= 2000),
    eventdatetime TIMESTAMPTZ NOT NULL CHECK (eventdatetime >= NOW()),
    createdat     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_events_groupID
    ON group_events(groupID);

-- +migrate Down
DROP TABLE IF EXISTS group_events;
