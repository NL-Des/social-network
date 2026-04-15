package repository

import (
	"database/sql"
	"html/template"
	"social-network/backend/internal/model"
	"strings"
	"time"
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
func (r *PostRepo) CreateNewPost(authorID string, postData model.Post) error {
	postData.Title = template.HTMLEscapeString(strings.TrimSpace(postData.Title))
	
	_, err := r.db.Exec(
		`INSERT INTO posts (authorID, title, content, privacy)
		VALUES (?, ?, ?, ?)
		`, authorID, postData.Title, postData.Content, postData.Privacy)

		return err
}

/*
* Mise à jour d'un post dans la base de données après modification par l'utilisateur
* Paramètres : ID du poste, titre et contenu, niveau de confidentialité
*/
func (r *PostRepo) UpdateExistingPost(postData model.Post) error {
	postData.Title = template.HTMLEscapeString(strings.TrimSpace(postData.Title))
	updateTime := time.Now()

	_, err := r.db.Exec(
		`UPDATE posts SET title = ?, content = ?, privacy = ?, updatedat = ?
		WHERE ID = ?
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
		WHERE ID = ?
		`, postID)

		return err
}

/*
* Récupère l'ID d'un post à partir du contenu du message
* Paramètres : ID de l'auteur du post et contenu du message
*/
func (r *PostRepo) GetPostIDFromContent(authorID, content string) (int, error) {
	row := r.db.QueryRow(`
	SELECT ID
	FROM posts
	WHERE content = ?, authorID = ?
	`, content, authorID)

	postID := 0

	err := row.Scan(&postID)
	if err != nil || postID == 0 {
		return 0, err
	}

	return postID, nil
}

/*
* Récupère l'ID de l'auteur d'un post particulier
* Paramètres : ID du post
*/
func (r *PostRepo) GetPostAuthorID(postID int) (string, error) {
	row := r.db.QueryRow(`
	SELECT authorID
	FROM posts
	WHERE ID = ?
	`, postID)

	authorID := ""

	err := row.Scan(&authorID)
	if err != nil || authorID == "" {
		return "", err
	}

	return authorID, nil
}