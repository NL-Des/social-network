package repository

import (
	"database/sql"
	"html/template"
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
func (r *PostRepo) CreateNewPost(authorID, title, content, privacy string) error {
	title = template.HTMLEscapeString(strings.TrimSpace(title))
	
	_, err := r.db.Exec(
		`INSERT INTO posts (authorID, title, content, privacy)
		VALUES (?, ?, ?, ?)
		`, authorID, title, content, privacy)

		return err
}

/*
* Mise à jour d'un post dans la base de données après modification par l'utilisateur
* Paramètres : ID du poste, titre et contenu, niveau de confidentialité
*/
func (r *PostRepo) UpdateExistingPost(postID int, title, content, privacy string) error {
	title = template.HTMLEscapeString(strings.TrimSpace(title))
	updateTime := time.Now()

	_, err := r.db.Exec(
		`UPDATE posts SET title = ?, content = ?, privacy = ?, updatedat = ?
		WHERE ID = ?
		`, title, content, privacy, updateTime, postID)

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