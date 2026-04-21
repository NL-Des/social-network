package repository

import (
	"database/sql"
	"errors"
	"social-network/backend/internal/model"
)

// *** SELECT ***

func GetUserbyID(id int, db *sql.DB) (model.User, error) {
	var user model.User

	err := db.QueryRow(`
		SELECT id, name, firstName, birthday, email, username, description, profilePicture, isprivate
		FROM users
		WHERE id = $1
	`, id).Scan(
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
		return model.User{}, err
	}
	return user, nil
}
func GetUserCredsbyEmail(email string, db *sql.DB) (model.LoginUser, error) {
	var user model.LoginUser

	err := db.QueryRow(`
		SELECT id, email, password
		FROM users
		WHERE email = $1
	`, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
	)

	if err == sql.ErrNoRows {
		return model.LoginUser{}, errors.New("Email inconnu")
	}

	if err != nil {
		return model.LoginUser{}, err
	}
	return user, nil
}

func UserExists(email, username string, db *sql.DB) (bool, string, error) {
	var existingEmail, existingUsername string

	err := db.QueryRow(`
		SELECT email, pseudo
		FROM users
		WHERE email = $1 OR pseudo = $2
	`, email, username).Scan(&existingEmail, &existingUsername)

	if err == sql.ErrNoRows {
		return false, "", nil
	}

	if err != nil {
		return false, "", err
	}

	if existingEmail == email {
		return true, "email", nil
	}

	if existingUsername == username {
		return true, "username", nil
	}

	return false, "", nil
}

// *** INSERT ***

func SaveUser(user model.RegisterUser, db *sql.DB) error {
	_, err := db.Exec(`
		INSERT INTO users (
			email,
			password,
			firstname,
			lastname,
			dateofbirth,
			isprivate,
			avatar,
			pseudo,
			aboutme
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`,
		user.Email,
		user.Password,
		user.FirstName,
		user.Name,
		user.Birthday,
		user.IsPrivate,
		user.ProfilePicture,
		user.Username,
		user.Description,
	)

	return err
}
