package handlers

import (
	"encoding/json"
	"net/http"

	appErrors "social-network/backend/internal/errors"
	"social-network/backend/internal/service"
)

type MeHandler struct {
	profileService *service.ProfileService
}

func NewMeHandler(ps *service.ProfileService) *MeHandler {
	return &MeHandler{profileService: ps}
}

func (h *MeHandler) HandleMe(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		return appErrors.New(appErrors.CodeUnauthorized, "Accès refusé : session introuvable", nil)
	}

	profile, err := h.profileService.GetProfile(userID)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(profile)
	return nil
}

func (h *MeHandler) HandleProfile(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		return appErrors.New(appErrors.CodeUnauthorized, "Accès refusé : session introuvable", nil)
	}

	profile, err := h.profileService.GetFullProfile(userID)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(profile)
	return nil
}
