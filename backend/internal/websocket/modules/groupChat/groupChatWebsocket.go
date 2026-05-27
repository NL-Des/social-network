package groupChatWebsocket

import (
	"log"
	"social-network/backend/internal/model"
	"social-network/backend/internal/websocket"
)

// GroupChatService est l'interface à implémenter côté service métier.
type GroupChatService interface {
	CreateNewGroupMessage(msg model.GroupMessage) error

	// GetMemberIDs retourne la liste des userID membres du groupe.
	// Le handler en a besoin pour diffuser à tous les membres connectés.
	GetMemberIDs(groupID int64) ([]int64, error)
}

// GroupChatHandler relie le Hub WS et le service métier.
type GroupChatHandler struct {
	Hub     *websocket.Hub
	Service GroupChatService
}

// Constructeur
func NewGroupChatHandler(hub *websocket.Hub, svc GroupChatService) *GroupChatHandler {
	return &GroupChatHandler{
		Hub:     hub,
		Service: svc,
	}
}

// Handle est appelé par le router WS quand un message de type "group_message" arrive.
// Il persiste le message, récupère la liste des membres du groupe,
// puis diffuse en temps réel à chacun d'eux.
func (h *GroupChatHandler) Handle(sender *websocket.Client, payload model.GroupMessage) {
	// 1. On force l'expéditeur à être le client connecté (sécurité)
	payload.SenderID = sender.UserID

	// 2. Persistance
	if err := h.Service.CreateNewGroupMessage(payload); err != nil {
		log.Printf("[groupChat] erreur persistance: %v", err)
		h.Hub.BroadcastToUser(sender.UserID, websocket.MessageWs{
			Type: "group_message_error",
			Data: "Erreur lors de l'envoi du message.",
		})
		return
	}

	// 3. Récupération des membres du groupe
	memberIDs, err := h.Service.GetMemberIDs(payload.GroupID)
	if err != nil {
		log.Printf("[groupChat] erreur récupération membres: %v", err)
		return
	}

	// 4. Diffusion à tous les membres connectés (delta : le message complet)
	// BroadcastToUser ne fait rien si le membre n'est pas connecté, c'est safe.
	wsMsg := websocket.MessageWs{
		Type: "group_message",
		Data: payload,
	}
	for _, memberID := range memberIDs {
		h.Hub.BroadcastToUser(memberID, wsMsg)
	}
}
