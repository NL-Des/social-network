package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"social-network/backend/internal/model"
	"social-network/backend/internal/service"

	"github.com/gorilla/mux"
)

type FollowHandler struct {
	FollowService *service.FollowService
	UserService   *service.UserService
	NotifService  *service.NotificationService
}

func NewFollowHandler(s *service.FollowService, us *service.UserService, ns *service.NotificationService) *FollowHandler {
	return &FollowHandler{FollowService: s, UserService: us, NotifService: ns}
}

// POST /users/{id}/follow
func (h *FollowHandler) Follow(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	targetID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
		return
	}

	if viewerID == targetID {
		http.Error(w, "Vous ne pouvez pas vous suivre vous-même.", http.StatusBadRequest)
		return
	}

	status, err := h.FollowService.Follow(viewerID, targetID)
	if err != nil {
		http.Error(w, "Erreur serveur, veuillez réessayer.", http.StatusInternalServerError)
		return
	}

	go func() {
		actor, err := h.UserService.GetProfile(viewerID)
		if err != nil {
			return
		}
		kind := model.NotifFollow
		if status == "pending" {
			kind = model.NotifFollowRequest
		}
		if err := h.NotifService.Notify(int64(targetID), kind, model.NotificationPayload{
			ActorID:   int64(viewerID),
			ActorName: actor.Username,
		}); err != nil {
			log.Printf("follow notif: %v", err)
		}
	}()

	w.WriteHeader(http.StatusNoContent)
}

// DELETE /users/{id}/follow
func (h *FollowHandler) Unfollow(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	targetID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
		return
	}

	if err := h.FollowService.Unfollow(viewerID, targetID); err != nil {
		http.Error(w, "Erreur serveur, veuillez réessayer.", http.StatusInternalServerError)
		return
	}

	go func() {
		actor, err := h.UserService.GetProfile(viewerID)
		if err != nil {
			return
		}
		if err := h.NotifService.Notify(int64(targetID), model.NotifUnfollow, model.NotificationPayload{
			ActorID:   int64(viewerID),
			ActorName: actor.Username,
		}); err != nil {
			log.Printf("unfollow notif: %v", err)
		}
	}()

	w.WriteHeader(http.StatusNoContent)
}

// DELETE /me/followers/{id}
func (h *FollowHandler) RemoveFollower(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	followerID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
		return
	}

	if err := h.FollowService.Unfollow(followerID, viewerID); err != nil {
		http.Error(w, "Erreur serveur, veuillez réessayer.", http.StatusInternalServerError)
		return
	}

	go func() {
		owner, err := h.UserService.GetProfile(viewerID)
		if err != nil {
			return
		}
		if err := h.NotifService.Notify(int64(followerID), model.NotifRemovedFollower, model.NotificationPayload{
			ActorID:   int64(viewerID),
			ActorName: owner.Username,
		}); err != nil {
			log.Printf("remove follower notif: %v", err)
		}
	}()

	w.WriteHeader(http.StatusNoContent)
}

// GET /users/{id}/follow/status
func (h *FollowHandler) GetFollowStatus(w http.ResponseWriter, r *http.Request) {
	viewerID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	targetID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
		return
	}

	status, err := h.FollowService.GetFollowStatus(viewerID, targetID)
	if err != nil {
		http.Error(w, "Erreur serveur, veuillez réessayer.", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": status})
}

// GET /me/follow/requests
func (h *FollowHandler) GetPendingRequests(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	users, err := h.FollowService.GetPendingRequests(userID)
	if err != nil {
		http.Error(w, "Erreur serveur, veuillez réessayer.", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// PATCH /users/{id}/follow/accept
func (h *FollowHandler) AcceptFollowRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	requesterID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
		return
	}

	if err := h.FollowService.AcceptFollowRequest(requesterID, userID); err != nil {
		http.Error(w, "Erreur serveur, veuillez réessayer.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DELETE /users/{id}/follow/reject
func (h *FollowHandler) RejectFollowRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	requesterID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
		return
	}

	if err := h.FollowService.RejectFollowRequest(requesterID, userID); err != nil {
		http.Error(w, "Erreur serveur, veuillez réessayer.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
