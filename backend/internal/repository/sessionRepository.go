package repository

import (
	"database/sql"
	"errors"
	appErrors "social-network/backend/internal/errors"
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

	if err != nil {
		return appErrors.New(appErrors.CodeInternal, "erreur lors de la persistance de la session", err)
	}
	return nil
}

func (r *SessionRepo) GetSession(token string) (int, error) {
	var userID int
	var expires time.Time

	err := r.db.QueryRow(`
		SELECT userID, expiresat
		FROM session
		WHERE token = $1
	`, token).Scan(&userID, &expires)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, appErrors.New(appErrors.CodeNotFound, "aucune session active trouvée pour ce token", err)
		}
		return 0, appErrors.New(appErrors.CodeInternal, "erreur de lecture de la session", err)
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
	WHERE userID = $1
	`, userID).Scan(&token)

	if err == sql.ErrNoRows {
		return "", false, nil
	}

	if err != nil {
		return "", false, appErrors.New(appErrors.CodeInternal, "erreur de vérification d'existence de la session", err)
	}

	return token, true, nil
}

func (r *SessionRepo) DeleteSession(token string) error {
	_, err := r.db.Exec(`
		DELETE FROM session
		WHERE token = $1
	`, token)
	if err != nil {
		return appErrors.New(appErrors.CodeInternal, "erreur lors de la suppression de la session", err)
	}
	return nil
}
