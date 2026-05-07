package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"social-network/backend/internal/service"

	"github.com/gorilla/mux"
)

type ProfilHandler struct {
	ProfilService *service.ProfilService
}

func NewProfilHandler(s *service.ProfilService) *ProfilHandler {
	return &ProfilHandler{ProfilService: s}
}

func (h *ProfilHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	/* // POUR TEST
	fakeUser := map[string]interface{}{
		"id":   123,
		"name": "Test User",
		"bio":  "Ceci est un faux utilisateur pour test",
	}

	json.NewEncoder(w).Encode(fakeUser) */

	// Validation du header X-User-ID
	viewerHeader := r.Header.Get("X-User-ID")
	if viewerHeader == "" {
		http.Error(w, "missing X-User-ID header", http.StatusUnauthorized)
		return
	}

	// Récupération de l’ID du viewer depuis les headers
	viewerID, err := strconv.Atoi(viewerHeader)
	if err != nil {
		http.Error(w, "invalid X-User-ID header", http.StatusBadRequest)
		return
	}

	// Récupération de l'ID dans l'URL via Mux
	vars := mux.Vars(r)
	profileID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	// Appel au service métier
	profile, err := h.ProfilService.GetProfile(viewerID, profileID)
	if err != nil {

		switch err {
		case service.ErrUserNotFound:
			http.Error(w, err.Error(), http.StatusNotFound)
		case service.ErrProfilePrivate:
			http.Error(w, err.Error(), http.StatusForbidden)
		default:
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}

		return
	}

	// Réponse JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)

}
