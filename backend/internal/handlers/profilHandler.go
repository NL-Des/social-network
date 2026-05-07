package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"social-network/backend/internal/service"
)

type ProfilHandler struct {
	ProfilService *service.ProfilService
}

func NewProfilHandler(s *service.ProfilService) *ProfilHandler {
	return &ProfilHandler{ProfilService: s}
}

func (h *ProfilHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path // ex: /users/12/profile
	parts := strings.Split(path, "/")

	// On attend exactement : ["", "users", "{id}", "profile"]
	if len(parts) != 4 || parts[3] != "profile" {
		http.NotFound(w, r)
		return
	}

	profileID, err := strconv.Atoi(parts[2])
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	viewerID, _ := strconv.Atoi(r.Header.Get("X-User-ID"))

	profile, err := h.ProfilService.GetProfile(viewerID, profileID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}
