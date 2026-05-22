package privateMessage

import (
	"log"
	"social-network/backend/internal/model"
	"social-network/backend/internal/websocket"
)

// PrivateMessageService est l'interface à implémenter côté service métier.
// Le handler WS ne connaît que ce contrat, pas la BDD.
type PrivateMessageService interface {
	CreateNewMessage(msg model.PrivateMessage) error
}

// PrivateMessageHandler relie le Hub WS et le service métier.
type PrivateMessageHandler struct {
	Hub     *websocket.Hub
	Service PrivateMessageService
}

// Constructeur
func NewPrivateMessageHandler(hub *websocket.Hub, svc PrivateMessageService) *PrivateMessageHandler {
	return &PrivateMessageHandler{
		Hub:     hub,
		Service: svc,
	}
}

// Handle est appelé par le router WS quand un message de type "private_message" arrive.
// Il persiste le message via le service, puis le diffuse en temps réel au destinataire.
func (h *PrivateMessageHandler) Handle(sender *websocket.Client, payload model.PrivateMessage) {
	// 1. On force l'expéditeur à être le client connecté (sécurité)
	payload.SenderID = sender.UserID

	// 2. Persistance via le service métier
	if err := h.Service.CreateNewMessage(payload); err != nil {
		log.Printf("[privateMessage] erreur persistance: %v", err)
		// On notifie l'expéditeur de l'échec
		h.Hub.BroadcastToUser(sender.UserID, websocket.MessageWs{
			Type: "private_message_error",
			Data: "Erreur lors de l'envoi du message.",
		})
		return
	}

	// 3. Diffusion au destinataire (delta : le message complet)
	h.Hub.BroadcastToUser(payload.ReceiverID, websocket.MessageWs{
		Type: "private_message",
		Data: payload,
	})

	// 4. Echo à l'expéditeur pour confirmer l'envoi
	// (utile si l'utilisateur a plusieurs onglets ouverts)
	h.Hub.BroadcastToUser(sender.UserID, websocket.MessageWs{
		Type: "private_message_sent",
		Data: payload,
	})
}
