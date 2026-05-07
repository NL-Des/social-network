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
