package model

import "time"

type GroupMessage struct {
	ID       int64     `json:"id"`
	GroupID  int64     `json:"group_id"`
	SenderID int64     `json:"sender_id"`
	Body     string    `json:"body"`
	SentAt   time.Time `json:"sent_at"`
}