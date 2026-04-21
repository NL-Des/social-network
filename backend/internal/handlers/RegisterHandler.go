package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
)

type RegisterHandler struct {
	UserService *service.UserService
}

func NewRegisterHandler(us *service.UserService) *RegisterHandler {
	return &RegisterHandler{UserService: us}
}
func (rh *RegisterHandler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// permet aux deux serveurs de communiquer sans que le navigateur les bloque
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	fmt.Println("Requête à /registerHandler")

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
	user.Username = r.FormValue("username")
	user.Description = r.FormValue("description")
	user.ProfilePicture = r.FormValue("profilePicture")
	user.IsPrivate = true

	err = rh.UserService.Register(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"success": true,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode((response))

}
