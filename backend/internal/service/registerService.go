package service

import (
	"database/sql"
	"errors"
	"social-network/backend/internal/model"

	"golang.org/x/crypto/bcrypt"
)

func ValidUserData(user model.RegisterUser) error {
	if user.Email == "" || user.Password == "" {
		return errors.New("empty email or password")
	}

	if user.Password != user.ConfirmPassword {
		return errors.New("different passwords")
	}
	return nil
}

func UserExists(email string, db *sql.DB) (bool, error) {
	var id int

	err := db.QueryRow("SELECT id FROM users WHERE email=$1", email).Scan(&id)

	if err == sql.ErrNoRows {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, errors.New("email already registered")
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

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
		user.UserName,
		user.Description,
	)

	return err
}
