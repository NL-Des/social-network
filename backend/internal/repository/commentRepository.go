package repository

import (
	"database/sql"
	"social-network/backend/internal/model"
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

/*
* Récupère l'ID de l'auteur d'un commentaire
* Paramètres : ID du post
*/
func (r *CommentRepo) GetCommentAuthorID(commentID int) (string, error) {
	row := r.db.QueryRow(`
	SELECT authorID
	FROM comments
	WHERE ID = ?
	`, commentID)

	authorID := ""

	err := row.Scan(&authorID)
	if err != nil || authorID == "" {
		return "", err
	}

	return authorID, nil
}

func (r *CommentRepo) GetCommentsFromPostID(postID int) ([]model.Comment, error) {
	rows, err := r.db.Query(
		`SELECT c.ID, c.content, c.createdat, c.updatedat, u.username, u.avatar
		FROM comments c
		JOIN users u ON c.authorID = u.ID
		WHERE postID = ?
		`,postID)
		if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments = []model.Comment{}
	for rows.Next() {
		comment := model.Comment{}
		if err := rows.Scan(&comment.ID, &comment.Content, &comment.CreatedAt, &comment.Author.Username, &comment.Author.Avatar); err != nil {
			return nil, err
		}
		
		comments = append(comments, comment)
	}

	if err := rows.Err(); err != nil {
    return nil, err
}
   
    return comments, nil
}