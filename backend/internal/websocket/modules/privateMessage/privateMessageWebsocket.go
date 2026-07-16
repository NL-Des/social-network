package privateMessage

import (
	"log"
	"time"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
	"social-network/backend/internal/websocket"
)

// PrivateMessageService est l'interface à implémenter côté service métier.
// Le handler WS ne connaît que ce contrat, pas la BDD.
type PrivateMessageService interface {
	CreateNewMessage(msg model.PrivateMessage) error
}

// PrivateMessageHandler relie le Hub WS et le service métier.
type PrivateMessageHandler struct {
	Hub          *websocket.Hub
	Service      PrivateMessageService
	UserService  *service.UserService
	NotifService *service.NotificationService
}

// Constructeur
func NewPrivateMessageHandler(hub *websocket.Hub, svc PrivateMessageService, us *service.UserService, ns *service.NotificationService) *PrivateMessageHandler {
	return &PrivateMessageHandler{
		Hub:          hub,
		Service:      svc,
		UserService:  us,
		NotifService: ns,
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
		h.Hub.BroadcastToUser(sender.UserID, websocket.MessageWs{
			Type: "private_message_error",
			Data: err.Error(),
		})
		return
	}

	// Horodatage du message après persistance, avant diffusion
	payload.SentAt = time.Now()

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

	// 5. Notification pour le destinataire
	go func() {
		actor, err := h.UserService.GetProfile(int(sender.UserID))
		if err != nil {
			return
		}
		if err := h.NotifService.Notify(payload.ReceiverID, model.NotifNewMessage, model.NotificationPayload{
			ActorID:   sender.UserID,
			ActorName: actor.Username,
		}); err != nil {
			log.Printf("[privateMessage] erreur notif: %v", err)
		}
	}()
}
