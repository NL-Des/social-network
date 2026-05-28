package repository

import (
	"database/sql"
	"errors"
	"time"
)

type SessionRepo struct {
	db *sql.DB
}

func NewSessionRepo(db *sql.DB) *SessionRepo {
	return &SessionRepo{db: db}
}

func (r *SessionRepo) CreateSession(token string, userID int, createdAt time.Time, expiresAt time.Time) error {
	_, err := r.db.Exec(`
		INSERT INTO session (token, userID, createdat, expiresat)
		VALUES ($1, $2, $3, $4)
	`, token, userID, createdAt, expiresAt)

	return err
}

func (r *SessionRepo) GetSession(token string) (string, error) {
	var userID string
	var expires time.Time

	err := r.db.QueryRow(`
		SELECT userID, expiresat
		FROM session
		WHERE token = $1
	`, token).Scan(&userID, &expires)

	if err != nil {
		return "", err
	}

	if time.Now().After(expires) {
		r.db.Exec(`DELETE FROM session WHERE token = $1`, token)
		return "", errors.New("session expirée")
	}

	return userID, nil
}

func (r *SessionRepo) SessionExists(userID int) (string, bool, error) {
	var token string

	err := r.db.QueryRow(`
	SELECT token
	FROM session
	WHERE userID = $1 AND expiresat > NOW()
	`, userID).Scan(&token)

	if err == sql.ErrNoRows {
		return "", false, nil
	}

	if err != nil {
		return "", false, err
	}

	return token, true, nil
}

func (r *SessionRepo) DeleteSession(token string) error {
	_, err := r.db.Exec(`
		DELETE FROM session
		WHERE token = $1
	`, token)
	return err
}
