package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/backend/internal/model"
)

// RoginHandler récupère les données de l'inscription et les traites
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
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

	// 1. Vérifier que l'utilisateur n'est pas déjà enregistré
	//	requête à la db et regarder s'il y a un match => exists == true
	// if user exists : message d'erreur inviter le user à se login (voire redirection vers la page de login)
	// response = success : false, error : err
	// print err dans le terminal

	// 2. Hasher le password

	// 3. Enregistrer le user dans la db
	// requête db
	// if err != nil => response = success : false, error : err
	// print err dans le terminal

	response := map[string]interface{}{
		"success": true,
		"user":    user,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode((response))

}
