package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/backend/internal/service"
)

type UsersHandler struct {
	UserService *service.UserService
}

func NewUsersHandler(us *service.UserService) *UsersHandler {
	return &UsersHandler{UserService: us}
}

func (h *UsersHandler) HandleUsers(w http.ResponseWriter, r *http.Request) {
	currentUserID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	users, err := h.UserService.GetAllUsers(currentUserID)
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
