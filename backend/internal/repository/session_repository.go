package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

func CreateSession(db *sql.DB, userID int) (string, error) {
	token := uuid.NewString()
	now := time.Now()
	expireAt := now.Add(24 * time.Hour)

	_, err := db.Exec(
		"INSERT INTO session (UserID, Token, CreatedAt, ExpiresAt) VALUES (?, ?, ?, ?)",
		userID, token, now, expireAt,
	)
	if err != nil {
		return "", err
	}

	return token, nil
}

func CleanExpiredSessions(db *sql.DB) error {
	_, err := db.Exec("DELETE FROM session WHERE ExpiresAt < CURRENT_TIMESTAMP")
	if err != nil {
		return err
	}

	_, err = db.Exec("UPDATE users SET userOnline = 0 WHERE id NOT IN (SELECT UserID FROM session)")
	return err
}

func GetActiveSessionToken(db *sql.DB, userID int) string {
	var token string
	err := db.QueryRow(
		"SELECT token FROM session WHERE userID = ? AND ExpiresAt > CURRENT_TIMESTAMP",
		userID,
	).Scan(&token)

	if err != nil {
		return ""
	}

	return token
}
