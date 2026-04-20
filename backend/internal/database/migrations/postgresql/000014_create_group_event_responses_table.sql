-- +migrate Up
CREATE TABLE IF NOT EXISTS group_event_responses (
    ID          SERIAL PRIMARY KEY,
    eventID     INTEGER NOT NULL REFERENCES group_events(ID) ON DELETE CASCADE,
    userID      INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    response    TEXT NOT NULL CHECK (response IN ('coming', 'unsure', 'uninterested')),
    respondedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_event_responses_eventID
    ON group_event_responses(eventID);

CREATE INDEX IF NOT EXISTS idx_group_event_responses_userID
    ON group_event_responses(userID);

-- +migrate Down
DROP TABLE IF EXISTS group_event_responses;
