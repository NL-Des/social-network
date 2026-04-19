package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/backend/internal/model"
)

// LoginHandler récupère les données de connexion et les traites
func (h *Handler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	// permet aux deux serveurs de communiquer sans que le navigateur les bloque
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var credentials model.LoginUser

	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		http.Error(w, "Erreur de lecture du JSON", http.StatusBadRequest)
		return
	}

	var savedUser model.LoginUser
	// Chercher user en db
	savedUser, err = GetUserbyEmail(credentials.Email, h.DB)
	if err != nil {
		http.Error(w, "Unable to get user from db", http.StatusInternalServerError)
		return
	}

	//Comparer passwords
	response := map[string]interface{}{
		"success": true,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode((response))

	fmt.Printf("Credentials récupéré : %s, %s\n", credentials.Email, credentials.Password)
}

func GetUserbyEmail(email string, db *sql.DB) (model.LoginUser, error) {
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

	if err != nil {
		return model.LoginUser{}, err
	}
	return user, nil
}

func IsValidPassword(password, savedPasseword string) bool {
	if password != savedPasseword {
		return false
	}

	return true
}
