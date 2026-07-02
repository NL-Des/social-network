package repository

import (
	"database/sql"
	"strings"

	"social-network/backend/internal/model"
)

type FollowRepository struct {
	db *sql.DB
}

func NewFollowRepository(db *sql.DB) *FollowRepository {
	return &FollowRepository{db: db}
}

func (r *FollowRepository) IsPrivateProfile(userID int) (bool, error) {
	var isPrivate bool
	err := r.db.QueryRow(`SELECT isprivate FROM users WHERE id = $1`, userID).Scan(&isPrivate)
	return isPrivate, err
}

func (r *FollowRepository) GetFollowStatus(followerID, followingID int) (string, error) {
	var status string
	err := r.db.QueryRow(`
		SELECT status FROM followers
		WHERE followerid = $1 AND followingid = $2
	`, followerID, followingID).Scan(&status)
	if err == sql.ErrNoRows {
		return "", nil
	}
	return status, err
}

func (r *FollowRepository) GetPendingRequests(userID int) ([]model.UserListItem, error) {
	rows, err := r.db.Query(`
		SELECT u.id, u.firstname, u.lastname
		FROM followers f
		JOIN users u ON u.id = f.followerid
		WHERE f.followingid = $1 AND f.status = 'pending'
		ORDER BY u.firstname, u.lastname
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []model.UserListItem
	for rows.Next() {
		var item model.UserListItem
		var firstname, lastname string
		if err := rows.Scan(&item.ID, &firstname, &lastname); err != nil {
			return nil, err
		}
		item.Name = firstname
		if len(lastname) > 0 {
			item.Name += " " + strings.ToUpper(string([]rune(lastname)[0]))
		}
		if len(firstname) > 0 {
			item.Initials += strings.ToUpper(string([]rune(firstname)[0]))
		}
		if len(lastname) > 0 {
			item.Initials += strings.ToUpper(string([]rune(lastname)[0]))
		}
		users = append(users, item)
	}
	return users, rows.Err()
}

func (r *FollowRepository) AcceptFollowRequest(followerID, followingID int) error {
	_, err := r.db.Exec(`
		UPDATE followers SET status = 'accepted'
		WHERE followerid = $1 AND followingid = $2
	`, followerID, followingID)
	return err
}

func (r *FollowRepository) RejectFollowRequest(followerID, followingID int) error {
	_, err := r.db.Exec(`
		DELETE FROM followers
		WHERE followerid = $1 AND followingid = $2
	`, followerID, followingID)
	return err
}

// Follow insère la relation et retourne le statut résultant ("accepted" ou "pending").
func (r *FollowRepository) Follow(followerID, followingID int) (string, error) {
	isPrivate, err := r.IsPrivateProfile(followingID)
	if err != nil {
		return "", err
	}
	status := "accepted"
	if isPrivate {
		status = "pending"
	}
	_, err = r.db.Exec(`
		INSERT INTO followers (followerID, followingID, status)
		VALUES ($1, $2, $3)
		ON CONFLICT DO NOTHING
	`, followerID, followingID, status)
	return status, err
}

func (r *FollowRepository) Unfollow(followerID, followingID int) error {
	_, err := r.db.Exec(`
		DELETE FROM followers
		WHERE followerID = $1 AND followingID = $2
	`, followerID, followingID)
	return err
}

func (r *FollowRepository) RemoveFollower(followerID, userID int) error {
	_, err := r.db.Exec(`
        DELETE FROM followers
        WHERE followerID = $1 AND followingID = $2
    `, followerID, userID)
	return err
}
