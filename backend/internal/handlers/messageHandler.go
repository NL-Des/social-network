package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	appErrors "social-network/backend/internal/errors"
	"social-network/backend/internal/service"
)

type MessageHandler struct {
	MessageService *service.MessageService
}

func NewMessageHandler(ms *service.MessageService) *MessageHandler {
	return &MessageHandler{MessageService: ms}
}

func (h *MessageHandler) HandleConversations(w http.ResponseWriter, r *http.Request) error {
	currentUserID, ok := r.Context().Value("userID").(int)
	if !ok {
		return appErrors.New(appErrors.CodeUnauthorized, "Accès refusé : utilisateur non authentifié", nil)
	}

	partners, err := h.MessageService.GetConversationPartners(int64(currentUserID))
	if err != nil {
		return err // Laisse circuler l'erreur déjà formatée venant du service/repository
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(partners)
}

func (h *MessageHandler) HandleMessages(w http.ResponseWriter, r *http.Request) error {
	currentUserID, ok := r.Context().Value("userID").(int)
	if !ok {
		return appErrors.New(appErrors.CodeUnauthorized, "Accès refusé : utilisateur non authentifié", nil)
	}

	withStr := r.URL.Query().Get("with")
	if withStr == "" {
		return appErrors.New(appErrors.CodeInvalidInput, "Paramètre 'with' manquant", nil)
	}

	withID, err := strconv.ParseInt(withStr, 10, 64)
	if err != nil {
		return appErrors.New(appErrors.CodeInvalidInput, "Paramètre 'with' invalide", err)
	}

	messages, err := h.MessageService.GetMessagesBetween(int64(currentUserID), withID)
	if err != nil {
		return err // Laisse circuler l'erreur déjà formatée venant du service/repository
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(messages)
}
