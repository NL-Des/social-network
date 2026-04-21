package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
)

type LoginHandler struct {
	UserService *service.UserService
}

func NewLoginHandler(us *service.UserService) *LoginHandler {
	return &LoginHandler{UserService: us}
}

func (lh *LoginHandler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Requête à LoginHandler")
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

	user, err := lh.UserService.Login(credentials.Email, credentials.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}

	// -- A insérer : Générer session et renvoyer cookie --
	_ = user

	response := map[string]interface{}{
		"success": true,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode((response))

}
