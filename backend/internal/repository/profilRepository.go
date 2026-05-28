package repository

import (
	"database/sql"
	"social-network/backend/internal/model"
)

type ProfilRepository struct {
	db *sql.DB
}

func NewProfilRepository(db *sql.DB) *ProfilRepository {
	return &ProfilRepository{db: db}
}

// récupère un utilisateur complet depuis la base de données en fonction de son ID
func (r *ProfilRepository) GetUserByID(id int) (*model.User, error) {
	query := `
        SELECT ID, lastname, firstname, dateofbirth, email, pseudo, aboutme, avatar, isprivate
        FROM users
        WHERE id = $1
    `

	user := model.User{}
	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Name,
		&user.FirstName,
		&user.Birthday,
		&user.Email,
		&user.Username,
		&user.Description,
		&user.ProfilePicture,
		&user.IsPrivate,
	)
	if err == sql.ErrNoRows {
		return nil, sql.ErrNoRows // utilisateur vraiment introuvable
	}
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Followers
func (r *ProfilRepository) GetFollowers(userID int) ([]model.Follower, error) {
	rows, err := r.db.Query(`
        SELECT u.ID, u.pseudo
        FROM followers f
        JOIN users u ON u.ID = f.followerID
        WHERE f.followingID = $1 AND f.status = 'accepted'
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	followers := make([]model.Follower, 0)
	for rows.Next() {
		var f model.Follower
		if err := rows.Scan(&f.ID, &f.Username); err != nil {
			return nil, err
		}
		followers = append(followers, f)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return followers, nil
}

// Following
func (r *ProfilRepository) GetFollowing(userID int) ([]model.Following, error) {
	rows, err := r.db.Query(`
        SELECT u.ID, u.pseudo
        FROM followers f
        JOIN users u ON u.ID = f.followingID
        WHERE f.followerID = $1 AND f.status = 'accepted'
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	following := make([]model.Following, 0)
	for rows.Next() {
		var f model.Following
		if err := rows.Scan(&f.ID, &f.Username); err != nil {
			return nil, err
		}
		following = append(following, f)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return following, nil
}

// Posts
func (r *ProfilRepository) GetPosts(userID int) ([]model.AllPosts, error) {
	rows, err := r.db.Query(`
        SELECT ID, title, content
        FROM posts
        WHERE authorID = $1
        ORDER BY createdat DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	posts := make([]model.AllPosts, 0)
	for rows.Next() {
		var p model.AllPosts
		if err := rows.Scan(&p.ID, &p.Title, &p.Content); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *ProfilRepository) IsFollower(viewerID, profileID int) (bool, error) {
	var exists bool
	err := r.db.QueryRow(`
        SELECT EXISTS (
            SELECT 1 FROM followers
            WHERE followerID = $1 AND followingID = $2 AND status = 'accepted'
        )
    `, viewerID, profileID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (r *ProfilRepository) UpdateVisibility(userID int, isPrivate bool) error {
	_, err := r.db.Exec(`
        UPDATE users
        SET isprivate = $1
        WHERE id = $2
    `, isPrivate, userID)
	return err
}
