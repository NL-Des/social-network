package repository

import (
	"database/sql"
	"errors"
	appErrors "social-network/backend/internal/errors"
)

type TagRepo struct {
	db *sql.DB
}

func NewTagRepo(db *sql.DB) *TagRepo {
	return &TagRepo{db: db}
}

/*
* Ajoute les tags du post dans la table post_tag de la base de données
* Paramètres : ID du post créé, liste des tags entrées par l'utilisateur
* Appelle : GetTagID (pour récupérer l'ID du tag) et CreateNewTag (si le tag n'existe pas déjà)
 */
func (r *TagRepo) AddPostTags(postID int, TagList []string) error {
	for _, tagName := range TagList {
		tagID, err := r.GetTagID(tagName)

		if err != nil {
			var appErr *appErrors.AppError

			if errors.As(err, &appErr) && appErr.Code == appErrors.CodeNotFound {
				// C'est le cas attendu : le tag n'existe pas encore.
				// On ne retourne pas d'erreur, on va simplement le créer juste après.
				err = nil
			} else {
				// C'est une vraie erreur technique (perte de connexion DB, etc.)
				return err
			}
		}

		if tagID == 0 {
			err := r.CreateNewTag(tagName)
			if err != nil {
				return err
			}
			tagID, err = r.GetTagID(tagName)
			if err != nil {
				return err
			}
		}

		_, err = r.db.Exec(`
		INSERT INTO post_tag (postID, TagID)
		VALUES (?, ?)
		`, postID, tagID)

		if err != nil {
			return appErrors.New(appErrors.CodeInternal, "association post-tag impossible", err)
		}

	}

	return nil
}

/*
* Récupère l'ID d'un tag à partir de son nom
* Paramètres : Texte du tag entré par l'utilisateur
 */
func (r *TagRepo) GetTagID(tagName string) (int, error) {
	row := r.db.QueryRow(`
	SELECT ID
	FROM tag
	WHERE name = ?
	`, tagName)

	tagID := 0

	err := row.Scan(&tagID)
	if err != nil || tagID == 0 {
		if errors.Is(err, sql.ErrNoRows) {
			// On renvoie un CodeNotFound explicite, géré par la boucle du dessus
			return 0, appErrors.New(appErrors.CodeNotFound, "tag inexistant", err)
		}
		return 0, appErrors.New(appErrors.CodeInternal, "erreur de lecture du tag", err)
	}

	return tagID, nil
}

/*
* Ajoute un nouveau tag dans la base de données
* Paramètres : Texte du tag entré par l'utilisateur
 */
func (r *TagRepo) CreateNewTag(tagName string) error {
	_, err := r.db.Exec(
		`INSERT INTO tag (name)
		VALUES (?)
		`, tagName)

	if err != nil {
		return appErrors.New(appErrors.CodeInternal, "création du tag impossible", err)
	}
	return nil
}

/*
* Supprime tous les tags d'un post
* Paramètres : ID du post
 */
func (r *TagRepo) DeletePostTags(postID int) error {
	_, err := r.db.Exec(`
	DELETE FROM tag
	WHERE postID = ?
	`, postID)

	if err != nil {
		return appErrors.New(appErrors.CodeInternal, "impossible de vider les tags du post", err)
	}
	return nil
}
