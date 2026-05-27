package handlers

import (
	"encoding/json"
	"net/http"
	appErrors "social-network/backend/internal/errors"
	"social-network/backend/internal/service"
)

type UsersHandler struct {
	UserService *service.UserService
}

func NewUsersHandler(us *service.UserService) *UsersHandler {
	return &UsersHandler{UserService: us}
}

func (h *UsersHandler) HandleUsers(w http.ResponseWriter, r *http.Request) error {
	currentUserID, ok := r.Context().Value("userID").(int)
	if !ok {
		return appErrors.New(appErrors.CodeUnauthorized, "Accès refusé : utilisateur non authentifié", nil)
	}

	users, err := h.UserService.GetAllUsers(currentUserID)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
	return nil
}
