package repository

import (
	"database/sql"
	"strings"
	"time"

	"social-network/backend/internal/model"
)

type ConversationPartner struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Initials string `json:"initials"`
}

type MessageRepo struct {
	db *sql.DB
}

func NewMessageRepo(db *sql.DB) *MessageRepo {
	return &MessageRepo{db: db}
}

func (r *MessageRepo) CreateMessage(senderID, receiverID int64, content string) error {
	_, err := r.db.Exec(`
		INSERT INTO messages (senderid, receiverid, content)
		VALUES ($1, $2, $3)
	`, senderID, receiverID, content)
	return err
}

func (r *MessageRepo) GetMessagesBetween(userID1, userID2 int64) ([]model.PrivateMessage, error) {
	rows, err := r.db.Query(`
		SELECT id, senderid, receiverid, content, createdat
		FROM messages
		WHERE (senderid = $1 AND receiverid = $2)
		   OR (senderid = $2 AND receiverid = $1)
		ORDER BY createdat ASC
	`, userID1, userID2)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	messages := make([]model.PrivateMessage, 0)
	for rows.Next() {
		var msg model.PrivateMessage
		var createdAt time.Time
		if err := rows.Scan(&msg.ID, &msg.SenderID, &msg.ReceiverID, &msg.Body, &createdAt); err != nil {
			return nil, err
		}
		msg.SentAt = createdAt
		messages = append(messages, msg)
	}
	return messages, rows.Err()
}

func (r *MessageRepo) GetConversationPartners(userID int64) ([]ConversationPartner, error) {
	rows, err := r.db.Query(`
		SELECT DISTINCT
			u.id,
			u.firstname,
			u.lastname,
			COALESCE(u.pseudo, '')
		FROM messages m
		JOIN users u ON u.id = CASE
			WHEN m.senderid = $1 THEN m.receiverid
			ELSE m.senderid
		END
		WHERE m.senderid = $1 OR m.receiverid = $1
		ORDER BY u.firstname, u.lastname
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	partners := make([]ConversationPartner, 0)
	for rows.Next() {
		var p ConversationPartner
		var firstname, lastname, pseudo string
		if err := rows.Scan(&p.ID, &firstname, &lastname, &pseudo); err != nil {
			return nil, err
		}
		if len(pseudo) > 0 {
			p.Name = pseudo
			p.Initials = strings.ToUpper(string([]rune(pseudo)[:min(2, len([]rune(pseudo)))]))
		} else {
			p.Name = firstname
			if len(lastname) > 0 {
				p.Name += " " + strings.ToUpper(string([]rune(lastname)[0]))
			}
			if len(firstname) > 0 {
				p.Initials += strings.ToUpper(string([]rune(firstname)[0]))
			}
			if len(lastname) > 0 {
				p.Initials += strings.ToUpper(string([]rune(lastname)[0]))
			}
		}
		partners = append(partners, p)
	}
	return partners, rows.Err()
}
