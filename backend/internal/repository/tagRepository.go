package repository

import "database/sql"

type TagRepo struct {
	db *sql.DB
}

func NewTagRepo(db *sql.DB) *TagRepo{
	return &TagRepo{db: db}
}

/*
* Ajoute les tags du post dans la table post_tag de la base de données
* Paramètres : ID du post créé, liste des tags entrées par l'utilisateur
* Appelle : GetTagID (pour récupérer l'ID du tag) et CreateNewTag (si le tag n'existe pas déjà)
*/
func (r *TagRepo) AddPostTags(postID int, TagList []string) error {
	for _, tagName := range TagList {
		err, tagID := r.GetTagID(tagName)

	// Si le tag n'a pas été trouvé, crée le tag dans la BDD puis récupère son ID
		if err != nil || tagID == 0 {
			err := r.CreateNewTag(tagName)
			if err != nil {
				return err
			}
			_, tagID = r.GetTagID(tagName)
		}

		_, err = r.db.Exec(`
		INSERT INTO post_tag (postID, TagID)
		VALUES (?, ?)
		`, postID, tagID)

		if err != nil {
			return  err
		}
		
	}

	return nil
}

/*
* Récupère l'ID d'un tag à partir de son nom
* Paramètres : Texte du tag entré par l'utilisateur
*/
func (r *TagRepo) GetTagID(tagName string) (error, int) {
	row := r.db.QueryRow(`
	SELECT ID
	FROM tag
	WHERE name = ?
	`, tagName)


	tagID := 0

	err := row.Scan(&tagID)
	if err != nil || tagID == 0 {
		return err, 0
	}

	return nil, tagID
}

/*
* Ajoute un nouveau tag dans la base de données 
* Paramètres : Texte du tag entré par l'utilisateur
*/
func (r *TagRepo) CreateNewTag(tagName string) error {
	_, err := r.db.Exec(
		`INSERT INTO tags (name)
		VALUES (?)
		`, tagName)

		return err
}