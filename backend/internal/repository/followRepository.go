package repository

import "database/sql"

type FollowRepository struct {
	db *sql.DB
}

func NewFollowRepository(db *sql.DB) *FollowRepository {
	return &FollowRepository{db: db}
}

func (r *FollowRepository) Follow(followerID, followingID int) error {
	_, err := r.db.Exec(`
		INSERT INTO followers (followerID, followingID, status)
		VALUES ($1, $2, 'accepted')
		ON CONFLICT DO NOTHING
	`, followerID, followingID)
	return err
}

func (r *FollowRepository) Unfollow(followerID, followingID int) error {
	_, err := r.db.Exec(`
		DELETE FROM followers
		WHERE followerID = $1 AND followingID = $2
	`, followerID, followingID)
	return err
}
