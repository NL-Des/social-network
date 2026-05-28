package handlers

import (
	"net/http"
	"strconv"

	"social-network/backend/internal/service"

	"github.com/gorilla/mux"
)

type FollowHandler struct {
	FollowService *service.FollowService
}

func NewFollowHandler(s *service.FollowService) *FollowHandler {
	return &FollowHandler{FollowService: s}
}

// POST /users/{id}/follow
func (h *FollowHandler) Follow(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	targetID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	if viewerID == targetID {
		http.Error(w, "cannot follow yourself", http.StatusBadRequest)
		return
	}

	if err := h.FollowService.Follow(viewerID, targetID); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DELETE /users/{id}/follow
func (h *FollowHandler) Unfollow(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	targetID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	if err := h.FollowService.Unfollow(viewerID, targetID); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
