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
        WHERE f.followingID = $1
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followers []model.Follower
	for rows.Next() {
		var f model.Follower
		rows.Scan(&f.ID, &f.Username)
		followers = append(followers, f)
	}

	return followers, nil
}

// Following
func (r *ProfilRepository) GetFollowing(userID int) ([]model.Following, error) {
	rows, err := r.db.Query(`
        SELECT u.ID, u.pseudo
        FROM followers f
        JOIN users u ON u.ID = f.followingID
        WHERE f.followerID = $1
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var following []model.Following
	for rows.Next() {
		var f model.Following
		rows.Scan(&f.ID, &f.Username)
		following = append(following, f)
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

	var posts []model.AllPosts
	for rows.Next() {
		var p model.AllPosts
		rows.Scan(&p.ID, &p.Title, &p.Content)
		posts = append(posts, p)
	}

	return posts, nil
}
