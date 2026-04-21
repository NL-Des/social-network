package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
	"social-network/backend/internal/service"
)

// TEST avec curl
// curl -X POST http://localhost:5090/auth/login \
//   -H "Content-Type: application/json" \
//   -d '{"email":"email@email.com","password":"password"}'

// LoginHandler récupère les données de connexion et les traites
func (h *Handler) LoginHandler(w http.ResponseWriter, r *http.Request) {
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

	var savedUser model.LoginUser

	savedUser, err = repository.GetUserCredsbyEmail(credentials.Email, h.DB)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if !service.IsValidPassword(credentials.Password, savedUser.Password) {
		http.Error(w, "Mot de passe incorrect", http.StatusBadRequest)
		return
	}

	// -- A insérer : Générer session et renvoyer cookie --

	response := map[string]interface{}{
		"success": true,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode((response))

}
