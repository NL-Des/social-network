package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/backend/internal/service"
)

type MeHandler struct {
	profileService *service.ProfileService
}

func NewMeHandler(ps *service.ProfileService) *MeHandler {
	return &MeHandler{profileService: ps}
}

func (h *MeHandler) HandleMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	profile, err := h.profileService.GetProfile(userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}
