package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"social-network/backend/internal/model"
	"social-network/backend/internal/service"

	"github.com/gorilla/mux"
)

type NotificationHandler struct {
	service *service.NotificationService
}

func NewNotificationHandler(s *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: s}
}

// GET /notifications
func (h *NotificationHandler) HandleNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	notifs, err := h.service.GetByUser(int64(userID))
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}

	if notifs == nil {
		notifs = []model.Notification{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifs)
}

// PATCH /notifications/read
func (h *NotificationHandler) HandleMarkAllRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if err := h.service.MarkAllRead(int64(userID)); err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// PATCH /notifications/{id}/read
func (h *NotificationHandler) HandleMarkRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	notifID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "id invalide", http.StatusBadRequest)
		return
	}

	if err := h.service.MarkRead(notifID, int64(userID)); err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
