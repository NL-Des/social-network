package model

import "time"

type GroupMessage struct {
	ID       int64     `json:"id"`
	GroupID  int64     `json:"group_id"`
	SenderID int64     `json:"sender_id"`
	Body     string    `json:"body"`
	SentAt   time.Time `json:"sent_at"`
}

type GroupPost struct {
	ID        int    `json:"id"`
	Author    User   `json:"author"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
	Likes     int    `json:"likes"`
	Dislikes  int    `json:"dislikes"`
	UserLike  string `json:"userLike"`
}

type GroupComment struct {
	ID        int    `json:"id"`
	Author    User   `json:"author"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
}