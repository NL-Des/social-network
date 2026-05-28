package repository

import (
	"database/sql"
	"html/template"
	"social-network/backend/internal/model"
	"strings"
	"time"

	"github.com/lib/pq"
)

type PostRepo struct {
	db *sql.DB
}

func NewPostRepo(db *sql.DB) *PostRepo{
	return &PostRepo{db: db}
}

/*
* Création d'un nouveau post dans la base de données
* Paramètres : ID du posteur, titre (optionnel) et contenu du post, niveau de confidentialité
*/
func (r *PostRepo) CreateNewPost(authorID string, postData model.Post) (int, error) {
	postData.Title = template.HTMLEscapeString(strings.TrimSpace(postData.Title))
	var postID int
	
	query := `
        INSERT INTO posts (authorID, title, content, privacy)
        VALUES ($1, $2, $3, $4)
        RETURNING id`

	err := r.db.QueryRow(query, authorID, postData.Title, postData.Content, postData.Privacy).Scan(&postID)

    if err != nil {
        return 0, err
    }

    return postID, nil
}

/*
* Mise à jour d'un post dans la base de données après modification par l'utilisateur
* Paramètres : ID du poste, titre et contenu, niveau de confidentialité
*/
func (r *PostRepo) UpdateExistingPost(postData model.Post) error {
	postData.Title = template.HTMLEscapeString(strings.TrimSpace(postData.Title))
	updateTime := time.Now()

	_, err := r.db.Exec(
		`UPDATE posts SET title = $1, content = $2, privacy = $3, updatedat = $4
		WHERE ID = $5
		`, postData.Title, postData.Content, postData.Privacy, updateTime, postData.ID)

	return err
}

/*
* Suppression d'un post de la base de données par l'utilisateur ou par un modérateur
* Paramètres : ID du post
*/
func (r *PostRepo) DeleteExistingPost(postID int) error {
		_, err := r.db.Exec(`
		DELETE FROM posts
		WHERE ID = $1
		`, postID)

		return err
}


/*
* Récupère l'ID de l'auteur d'un post particulier
* Paramètres : ID du post
*/
func (r *PostRepo) GetPostAuthorID(postID int) (string, error) {
	row := r.db.QueryRow(`
	SELECT authorID
	FROM posts
	WHERE ID = $1
	`, postID)

	authorID := ""

	err := row.Scan(&authorID)
	if err != nil || authorID == "" {
		return "", err
	}

	return authorID, nil
}

/*
* Récupère un post dans la base de données à partir de son ID
* Paramètres : ID du post
* Renvoie : un post (titre, contenu, confidentialité, date) et les informations de son auteur (pseudo et avatar)
*/
func (r *PostRepo) GetAllPosts() ([]model.Post, error) {
	rows, err := r.db.Query(`
	SELECT p.ID, p.title, p.content, p.privacy, p.createdat, p.updatedat,
	       u.username, u.avatar,
	       COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
	FROM posts p
	JOIN users u ON p.authorID = u.ID
	LEFT JOIN post_tag pt ON pt.postID = p.ID
	LEFT JOIN tag t ON t.ID = pt.tagID
	GROUP BY p.ID, u.username, u.avatar
	ORDER BY p.createdat DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []model.Post
	for rows.Next() {
		post := model.Post{}
		if err := rows.Scan(
			&post.ID, &post.Title, &post.Content, &post.Privacy,
			&post.CreatedAt, &post.UpdatedAt,
			&post.Author.Username, &post.Author.ProfilePicture,
			pq.Array(&post.Tags),
		); err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *PostRepo) GetPostFromID(postID int) (model.Post, error) {
	row := r.db.QueryRow(`
	SELECT p.ID, p.title, p.content, u.username, u.avatar, p.privacy, p.createdat, p.updatedat
	FROM posts p
	JOIN users u ON p.authorID = u.ID
	WHERE p.ID = $1
	`, postID)

	post := model.Post{}

	err := row.Scan(&post.ID, &post.Title, &post.Content, &post.Author.Username, &post.Author.ProfilePicture, &post.Privacy, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return model.Post{}, err
	}

	return post, nil
} 