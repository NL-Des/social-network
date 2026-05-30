package repository

import (
	"database/sql"
	"encoding/json"
	"social-network/backend/internal/model"
)

type NotificationRepository struct {
	db *sql.DB
}

func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Save(receiverID int64, kind model.NotifKind, payload model.NotificationPayload) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(
		`INSERT INTO notifications (receiver_id, kind, payload) VALUES ($1, $2, $3)`,
		receiverID, string(kind), data,
	)
	return err
}

func (r *NotificationRepository) GetByUser(userID int64) ([]model.Notification, error) {
	rows, err := r.db.Query(
		`SELECT id, receiver_id, kind, payload, read, created_at
		 FROM notifications
		 WHERE receiver_id = $1
		 ORDER BY created_at DESC
		 LIMIT 50`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifs []model.Notification
	for rows.Next() {
		var n model.Notification
		var rawPayload []byte
		if err := rows.Scan(&n.ID, &n.ReceiverID, &n.Kind, &rawPayload, &n.Read, &n.CreatedAt); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(rawPayload, &n.Payload); err != nil {
			return nil, err
		}
		notifs = append(notifs, n)
	}
	return notifs, rows.Err()
}

func (r *NotificationRepository) MarkRead(notifID, userID int64) error {
	_, err := r.db.Exec(
		`UPDATE notifications SET read = true WHERE id = $1 AND receiver_id = $2`,
		notifID, userID,
	)
	return err
}

func (r *NotificationRepository) MarkAllRead(userID int64) error {
	_, err := r.db.Exec(
		`UPDATE notifications SET read = true WHERE receiver_id = $1`,
		userID,
	)
	return err
}

func (r *NotificationRepository) Delete(notifID, userID int64) error {
	_, err := r.db.Exec(
		`DELETE FROM notifications WHERE id = $1 AND receiver_id = $2`,
		notifID, userID,
	)
	return err
}

func (r *NotificationRepository) DeleteAll(userID int64) error {
	_, err := r.db.Exec(
		`DELETE FROM notifications WHERE receiver_id = $1`,
		userID,
	)
	return err
}
