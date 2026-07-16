package service

import (
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
	ws "social-network/backend/internal/websocket"
)

type NotificationService struct {
	repo *repository.NotificationRepository
	hub  *ws.Hub
}

func NewNotificationService(repo *repository.NotificationRepository, hub *ws.Hub) *NotificationService {
	return &NotificationService{repo: repo, hub: hub}
}

func (s *NotificationService) Notify(receiverID int64, kind model.NotifKind, payload model.NotificationPayload) error {
	if err := s.repo.Save(receiverID, kind, payload); err != nil {
		return err
	}
	s.hub.BroadcastToUser(receiverID, ws.MessageWs{
		Type: "notification",
		Data: map[string]interface{}{
			"kind":    string(kind),
			"payload": payload,
		},
	})
	return nil
}

func (s *NotificationService) GetByUser(userID int64) ([]model.Notification, error) {
	return s.repo.GetByUser(userID)
}

func (s *NotificationService) MarkRead(notifID, userID int64) error {
	return s.repo.MarkRead(notifID, userID)
}

func (s *NotificationService) MarkAllRead(userID int64) error {
	return s.repo.MarkAllRead(userID)
}

func (s *NotificationService) Delete(notifID, userID int64) error {
	return s.repo.Delete(notifID, userID)
}

func (s *NotificationService) DeleteAll(userID int64) error {
	return s.repo.DeleteAll(userID)
}
