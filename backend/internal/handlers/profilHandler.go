package handlers

import (
	"encoding/json"
	"log"
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

// /profile/{id}
func (h *ProfilHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Récupération de l'ID dans l'URL via Mux
	vars := mux.Vars(r)
	profileID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	// POUR TEST
	/* fakeUser := map[string]interface{}{
		"id":        profileID,
		"pseudo":    "TestUser",
		"bio":       "Ceci est un faux utilisateur pour test",
		"followers": []string{"Alice", "Bob"},
		"following": []string{"Charlie"},
		"posts":     []string{"Post 1", "Post 2"},
		"canEdit":   viewerID == profileID,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fakeUser)
	return */

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
	if err := json.NewEncoder(w).Encode(profile); err != nil {
		log.Printf("encode profile: %v", err)
	}

}

// /me
func (h *ProfilHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// viewerID == profileID
	profile, err := h.ProfilService.GetProfile(viewerID, viewerID)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(profile); err != nil {
		log.Printf("encode profile: %v", err)
	}
}
