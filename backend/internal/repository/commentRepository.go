package repository

import (
	"database/sql"
	"time"
)

type CommentRepo struct {
	db *sql.DB
}

func NewCommentRepo(db *sql.DB) *CommentRepo{
	return &CommentRepo{db: db}
}

/*
* Création d'un nouveau commentaire dans la base de données
* Paramètres : ID du post, ID de l'auteur contenu du commentaire

*/
func (r *CommentRepo) CreateNewComment(postID int, authorID, content string) error {
	_, err := r.db.Exec(
		`INSERT INTO comments (authorID, content)
		VALUES (?, ?)
		WHERE postID = ?
		`, authorID, content, postID)

		return err
}

/*
* Mise à jour d'un commentaire dans la base de données après modification par l'utilisateur
* Paramètres : ID du commentaire, contenu
*/
func (r *CommentRepo) UpdateExistingComment(commentID int, content string) error {
	updateTime := time.Now()

	_, err := r.db.Exec(
		`UPDATE comments SET content = ?, updatedat = ?
		WHERE ID = ?
		`, content, updateTime, commentID)

	return err
}

/*
* Suppression d'un commentaire de la base de données par l'utilisateur ou par un modérateur
* Paramètres : ID du Comment
*/
func (r *CommentRepo) DeleteExistingComment(commentID int) error {
		_, err := r.db.Exec(`
		DELETE FROM comments
		WHERE ID = ?
		`, commentID)

		return err
}