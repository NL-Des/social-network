package service

import (
	"errors"
	"social-network/backend/internal/model"

	"golang.org/x/crypto/bcrypt"
)

// Vérification || Email et passeword non vides.
// Password et confirmPassword identiques.
func ValidUserData(user model.RegisterUser) error {
	if user.Email == "" || user.Password == "" {
		return errors.New("empty email or password")
	}

	if user.Password != user.ConfirmPassword {
		return errors.New("different passwords")
	}
	return nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}
