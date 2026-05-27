package service

import (
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type MessageService struct {
	repo *repository.MessageRepo
}

func NewMessageService(repo *repository.MessageRepo) *MessageService {
	return &MessageService{repo: repo}
}

// CreateNewMessage implements the PrivateMessageService interface used by the WS handler.
func (s *MessageService) CreateNewMessage(msg model.PrivateMessage) error {
	return s.repo.CreateMessage(msg.SenderID, msg.ReceiverID, msg.Body)
}

func (s *MessageService) GetMessagesBetween(userID1, userID2 int64) ([]model.PrivateMessage, error) {
	return s.repo.GetMessagesBetween(userID1, userID2)
}

func (s *MessageService) GetConversationPartners(userID int64) ([]repository.ConversationPartner, error) {
	return s.repo.GetConversationPartners(userID)
}
