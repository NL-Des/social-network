-- +migrate Up
ALTER TABLE group_event_responses ADD CONSTRAINT uq_event_response UNIQUE (eventid, userid);

-- +migrate Down
ALTER TABLE group_event_responses DROP CONSTRAINT IF EXISTS uq_event_response;
