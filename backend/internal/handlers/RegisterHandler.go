package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"social-network/backend/internal/model"

	"golang.org/x/crypto/bcrypt"
)

// * Commande pour tester la handler sans front *
// curl -X POST http://localhost:5090/register \
// -H "Content-Type: application/json" \
// -d '{"name": "lad", "firstName": "val", "birthday": "01/01/01"; "email": "email@email.com", "password": "password", "confirmPassword": "password", "userName": "vallad", "description": "", "profilePicture": ""}'

// LoginHandler récupère les données de l'inscription et les traites
func (h *Handler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// permet aux deux serveurs de communiquer sans que le navigateur les bloque
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	fmt.Println("Reqiête à /registerHandler")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var user model.RegisterUser
	// On autorise par exemple 10 Mo de données
	const maxMemory = 10 << 20 // 10 * 1024 * 1024
	err := r.ParseMultipartForm(maxMemory)
	if err != nil {
		http.Error(w, "Impossible d'analyser le formulaire", http.StatusBadRequest)
		return
	}

	user.Name = r.FormValue("name")
	user.FirstName = r.FormValue("firstName")
	user.Birthday = r.FormValue("birthday")
	user.Email = r.FormValue("email")
	user.Password = r.FormValue("password")
	user.ConfirmPassword = r.FormValue("confirmPassword")
	user.UserName = r.FormValue("userName")
	user.Description = r.FormValue("description")
	user.ProfilePicture = r.FormValue("profilePicture")
	user.IsPrivate = true

	err = validUserData(user)
	if err != nil {
		fmt.Print(err)

		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	exists, err := userExists(user.Email, h.DB)
	if exists || err != nil {
		fmt.Print(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		fmt.Print(err)
		http.Error(w, "unable to hash the password", http.StatusInternalServerError)
		return
	}
	user.Password = hashedPassword

	err = saveUser(user, h.DB)
	if err != nil {
		fmt.Print(err)
		http.Error(w, "unable to save user into db", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"user":    user,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode((response))

}

func validUserData(user model.RegisterUser) error {
	if user.Email == "" || user.Password == "" {
		return errors.New("empty email or password")
	}

	if user.Password != user.ConfirmPassword {
		return errors.New("different passwords")
	}
	return nil
}

func userExists(email string, db *sql.DB) (bool, error) {
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

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func saveUser(user model.RegisterUser, db *sql.DB) error {
	_, err := db.Exec("INSERT INTO users (email, password, firstname, lastname, dateofbirth, isprivate, avatar, pseudo, aboutme), VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
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
