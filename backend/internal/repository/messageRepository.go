package repository

import (
	"database/sql"
	"social-network/backend/internal/model"
)

type MessageRepo struct {
	db *sql.DB
}

func NewMessageRepo(db *sql.DB) *MessageRepo{
	return &MessageRepo{db: db}
}

func (r *MessageRepo) CreateNewMessage(msg model.Message) error {
	_, err := r.db.Exec(
		`INSERT INTO messages (SenderID, ReceiverID, Content)
		VALUES (?, ?, ?, ?, ?)
		`, msg.SenderID, msg.ReceiverID, msg.Content)

	return err
}