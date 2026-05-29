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

func NewPostRepo(db *sql.DB) *PostRepo {
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
* Récupère tous les posts visibles par viewerID, avec filtrage privacy et compteurs likes/dislikes.
* Paramètres : viewerID (utilisateur connecté)
*/
func (r *PostRepo) GetAllPosts(viewerID int) ([]model.Post, error) {
	rows, err := r.db.Query(`
	SELECT p.id, p.authorid, p.title, p.content, p.privacy, p.createdat, p.updatedat,
	       u.username, u.avatar,
	       COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags,
	       COALESCE((SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.type = 'like'), 0) AS likes,
	       COALESCE((SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.type = 'dislike'), 0) AS dislikes,
	       COALESCE((SELECT pl.type FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1), '') AS user_like
	FROM posts p
	JOIN users u ON p.authorid = u.id
	LEFT JOIN post_tag pt ON pt.postid = p.id
	LEFT JOIN tag t ON t.id = pt.tagid
	WHERE
	    p.privacy = 'public'
	    OR p.authorid = $1
	    OR (p.privacy = 'almost-private' AND EXISTS (
	        SELECT 1 FROM followers f
	        WHERE f.followerid = $1 AND f.followingid = p.authorid AND f.status = 'accepted'
	    ))
	GROUP BY p.id, p.authorid, u.username, u.avatar
	ORDER BY p.createdat DESC
	`, viewerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []model.Post
	for rows.Next() {
		post := model.Post{}
		if err := rows.Scan(
			&post.ID, &post.AuthorID, &post.Title, &post.Content, &post.Privacy,
			&post.CreatedAt, &post.UpdatedAt,
			&post.Author.Username, &post.Author.ProfilePicture,
			pq.Array(&post.Tags),
			&post.Likes, &post.Dislikes, &post.UserLike,
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

/*
* Ajoute ou met à jour un like/dislike sur un post.
* Paramètres : postID, userID, likeType ("like" ou "dislike")
*/
func (r *PostRepo) AddLike(postID, userID int, likeType string) error {
	_, err := r.db.Exec(`
	INSERT INTO post_likes (post_id, user_id, type)
	VALUES ($1, $2, $3)
	ON CONFLICT (post_id, user_id) DO UPDATE SET type = $3
	`, postID, userID, likeType)
	return err
}

/*
* Supprime un like/dislike sur un post.
* Paramètres : postID, userID
*/
func (r *PostRepo) RemoveLike(postID, userID int) error {
	_, err := r.db.Exec(`
	DELETE FROM post_likes
	WHERE post_id = $1 AND user_id = $2
	`, postID, userID)
	return err
}

/*
* Retourne les compteurs de likes et dislikes pour un post.
* Paramètres : postID
*/
func (r *PostRepo) GetLikeCounts(postID int) (likes int, dislikes int, err error) {
	rows, err := r.db.Query(`
	SELECT type, COUNT(*) FROM post_likes
	WHERE post_id = $1
	GROUP BY type
	`, postID)
	if err != nil {
		return 0, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var likeType string
		var count int
		if err := rows.Scan(&likeType, &count); err != nil {
			return 0, 0, err
		}
		if likeType == "like" {
			likes = count
		} else if likeType == "dislike" {
			dislikes = count
		}
	}
	return likes, dislikes, rows.Err()
}

/*
* Retourne le vote de l'utilisateur pour un post ("like", "dislike", ou "").
* Paramètres : postID, userID
*/
func (r *PostRepo) GetUserLike(postID, userID int) (string, error) {
	var likeType string
	err := r.db.QueryRow(`
	SELECT type FROM post_likes
	WHERE post_id = $1 AND user_id = $2
	`, postID, userID).Scan(&likeType)
	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return likeType, nil
}
