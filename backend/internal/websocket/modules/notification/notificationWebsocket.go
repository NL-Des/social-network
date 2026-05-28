package notification

import (
	"log"
	"social-network/backend/internal/model"
	"social-network/backend/internal/websocket"
)

// NotificationService est l'interface à implémenter côté service métier.
type NotificationService interface {
	CreateNotification(notif model.Notification) error
}

// NotificationHandler relie le Hub WS et le service métier.
// Contrairement aux chats, les notifications sont émises par le serveur,
// pas déclenchées par un message WS entrant d'un client.
// Ce handler est donc appelé directement depuis d'autres services
// (ex: quand un post est créé, quand un commentaire arrive, etc.)
type NotificationHandler struct {
	Hub     *websocket.Hub
	Service NotificationService
}

// Constructeur
func NewNotificationHandler(hub *websocket.Hub, svc NotificationService) *NotificationHandler {
	return &NotificationHandler{
		Hub:     hub,
		Service: svc,
	}
}

// Notify persiste une notification et la pousse en temps réel au destinataire.
// À appeler depuis les autres services métier (post, commentaire, groupe...).
func (h *NotificationHandler) Notify(notif model.Notification) {
	// 1. Persistance (pour le re-fetch côté historique des notifs)
	if err := h.Service.CreateNotification(notif); err != nil {
		log.Printf("[notification] erreur persistance: %v", err)
		return
	}

	// 2. Push temps réel au destinataire (delta : la notif complète)
	h.Hub.BroadcastToUser(notif.ReceiverID, websocket.MessageWs{
		Type: string(notif.Kind),
		Data: notif,
	})
}

// Les helpers ci-dessous évitent aux autres services de construire
// manuellement le model.Notification à chaque fois.

// NotifyNewPostInGroup notifie tous les membres d'un groupe qu'un nouveau post a été créé.
// memberIDs doit exclure l'auteur du post.
func (h *NotificationHandler) NotifyNewPostInGroup(post model.Post, memberIDs []int64) {
	for _, memberID := range memberIDs {
		h.Notify(model.Notification{
			ReceiverID: memberID,
			Kind:       model.NotifNewPostInGroup,
			Payload: model.NotificationPayload{
				PostTitle:       post.Title,
				ActorName:       post.Author.Username,
				CreatedAt:       post.CreatedAt,
			},
		})
	}
}

// NotifyNewComment notifie le créateur d'un post, et les participants,
// qu'un nouveau commentaire a été posté.
// recipientIDs doit exclure l'auteur du commentaire.
func (h *NotificationHandler) NotifyNewComment(comment model.Comment, recipientIDs []int64) {
	for _, recipientID := range recipientIDs {
		h.Notify(model.Notification{
			ReceiverID: recipientID,
			Kind:       model.NotifNewComment,
			Payload: model.NotificationPayload{
				ActorName:       comment.Author.Username,
				CreatedAt:       comment.CreatedAt,
			},
		})
	}
}

// NotifyGroupJoinRequest notifie le créateur d'un groupe qu'une demande d'accès a été faite.
func (h *NotificationHandler) NotifyGroupJoinRequest(groupCreatorID int64, applicantName string) {
	h.Notify(model.Notification{
		ReceiverID: groupCreatorID,
		Kind:       model.NotifGroupJoinRequest,
		Payload: model.NotificationPayload{
			ActorName: applicantName,
		},
	})
}

// NotifyGroupRequestAccepted notifie un utilisateur que sa demande a été acceptée.
func (h *NotificationHandler) NotifyGroupRequestAccepted(userID int64, groupName string) {
	h.Notify(model.Notification{
		ReceiverID: userID,
		Kind:       model.NotifGroupRequestAccepted,
		Payload: model.NotificationPayload{
			GroupName: groupName,
		},
	})
}

// NotifyBannedFromGroup notifie un utilisateur qu'il a été banni d'un groupe.
func (h *NotificationHandler) NotifyBannedFromGroup(userID int64, groupName string) {
	h.Notify(model.Notification{
		ReceiverID: userID,
		Kind:       model.NotifBannedFromGroup,
		Payload: model.NotificationPayload{
			GroupName: groupName,
		},
	})
}
