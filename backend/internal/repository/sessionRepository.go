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

func (r *SessionRepo) CreateSession(sessionID string, userID int, expiresAt time.Time) error {
	_, err := r.db.Exec(`
		INSERT INTO session (id, user_id, expires_at)
		VALUES ($1, $2, $3)
	`, sessionID, userID, expiresAt)

	return err
}

func (r *SessionRepo) GetSession(token string) (int, error) {
	var userID int
	var expires time.Time

	err := r.db.QueryRow(`
		SELECT user_id, expires_at
		FROM session
		WHERE token = $1
	`, token).Scan(&userID, &expires)

	if err != nil {
		return 0, err
	}

	if time.Now().After(expires) {
		r.db.Exec(`DELETE FROM session WHERE token = $1`, token)
		return 0, errors.New("session expirée")
	}

	return userID, nil
}

func (r *SessionRepo) SessionExists(userID int) (string, bool, error) {
	var token string

	err := r.db.QueryRow(`
	SELECT token
	FROM session
	WHERE user_id = $1
	`, userID).Scan(&token)

	if err == sql.ErrNoRows {
		return "", false, nil
	}

	if err != nil {
		return "", false, err
	}

	return token, true, nil
}
