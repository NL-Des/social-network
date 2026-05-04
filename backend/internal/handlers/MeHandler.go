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
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	profile, err := h.userService.GetProfile(userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}
