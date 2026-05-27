package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"social-network/backend/internal/service"
)

type MessageHandler struct {
	MessageService *service.MessageService
}

func NewMessageHandler(ms *service.MessageService) *MessageHandler {
	return &MessageHandler{MessageService: ms}
}

func (h *MessageHandler) HandleConversations(w http.ResponseWriter, r *http.Request) {
	currentUserID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	partners, err := h.MessageService.GetConversationPartners(int64(currentUserID))
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(partners)
}

func (h *MessageHandler) HandleMessages(w http.ResponseWriter, r *http.Request) {
	currentUserID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	withStr := r.URL.Query().Get("with")
	if withStr == "" {
		http.Error(w, "paramètre 'with' manquant", http.StatusBadRequest)
		return
	}

	withID, err := strconv.ParseInt(withStr, 10, 64)
	if err != nil {
		http.Error(w, "paramètre 'with' invalide", http.StatusBadRequest)
		return
	}

	messages, err := h.MessageService.GetMessagesBetween(int64(currentUserID), withID)
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
