package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/backend/internal/service"
)

type MeHandler struct {
	userService *service.UserService
}

func NewMeHandler(us *service.UserService) *MeHandler {
	return &MeHandler{userService: us}
}

func (h *MeHandler) HandleMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	profile, err := h.userService.GetProfile(userID)
	if err != nil {
		http.Error(w, "Utilisateur introuvable", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func (h *MeHandler) HandleProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	profile, err := h.userService.GetProfile(userID)
	if err != nil {
		http.Error(w, "Utilisateur introuvable", http.StatusNotFound)
		return
	}

	response := map[string]interface{}{
		"user":      profile,
		"following": []interface{}{},
		"followers": []interface{}{},
		"events":    []interface{}{},
		"groups":    []interface{}{},
		"allUsers":  []interface{}{},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
