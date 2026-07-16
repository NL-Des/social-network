-- +migrate Up
CREATE TABLE IF NOT EXISTS notifications (
    id          SERIAL PRIMARY KEY,
    receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind        VARCHAR(50) NOT NULL,
    payload     JSONB,
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_receiver ON notifications(receiver_id);

-- +migrate Down
DROP TABLE IF EXISTS notifications;
