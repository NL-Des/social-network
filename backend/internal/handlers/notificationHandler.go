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

// GET /notifications  DELETE /notifications
func (h *NotificationHandler) HandleNotifications(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case http.MethodGet:
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

	case http.MethodDelete:
		if err := h.service.DeleteAll(int64(userID)); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
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

// DELETE /notifications/{id}
// DELETE /notifications
func (h *NotificationHandler) HandleDeleteAll(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	if err := h.service.DeleteAll(int64(userID)); err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *NotificationHandler) HandleDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
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

	if err := h.service.Delete(notifID, int64(userID)); err != nil {
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
