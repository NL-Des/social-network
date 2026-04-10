package repository

import (
	"database/sql"

	"golang.org/x/crypto/bcrypt"
)

// CheckCredentials vérifie si le username et le mot de passe sont corrects
func CheckCredentials(db *sql.DB, login string, password string) (bool, int, error) {
	var userID int
	var hashedPassword string

	// On récupère le mot de passe hashé depuis la base
	err := db.QueryRow("SELECT id, password FROM users WHERE username = ? OR email = ?", login, login).Scan(&userID, &hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, 0, nil // utilisateur non trouvé
		}
		return false, 0, err // utilisateur non trouvé ou erreur DB
	}

	// On compare le mot de passe fourni avec le hash
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return false, 0, nil // mot de passe incorrect
	}

	return true, userID, nil // identifiants corrects
}
