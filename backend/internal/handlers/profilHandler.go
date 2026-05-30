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

func (h *ProfilHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	profileID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	profile, err := h.ProfilService.GetProfile(viewerID, profileID)
	if err != nil {
		switch err {
		case service.ErrUserNotFound:
			http.Error(w, err.Error(), http.StatusNotFound)
		default:
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

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

// GET /users/{id}/posts — retourne les posts publics d'un utilisateur
func (h *ProfilHandler) GetUserPosts(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	posts, err := h.ProfilService.GetUserPosts(userID)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(posts); err != nil {
		log.Printf("encode user posts: %v", err)
	}
}

func (h *ProfilHandler) UpdateVisibility(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Lecture du body JSON
	var body struct {
		IsPrivate bool `json:"isPrivate"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	if err := h.ProfilService.UpdateVisibility(viewerID, body.IsPrivate); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// PUT /me/profile
func (h *ProfilHandler) UpdateMyProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var body struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Pseudo    string `json:"pseudo"`
		AboutMe   string `json:"aboutMe"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	if err := h.ProfilService.UpdateProfile(userID, body.FirstName, body.LastName, body.Pseudo, body.AboutMe); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
