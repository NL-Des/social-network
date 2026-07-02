package service

import (
	"fmt"

	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type MessageService struct {
	repo       *repository.MessageRepo
	followRepo *repository.FollowRepository
}

func NewMessageService(repo *repository.MessageRepo, followRepo *repository.FollowRepository) *MessageService {
	return &MessageService{repo: repo, followRepo: followRepo}
}

// CreateNewMessage implements the PrivateMessageService interface used by the WS handler.
func (s *MessageService) CreateNewMessage(msg model.PrivateMessage) error {
	senderFollowsReceiver, err := s.followRepo.GetFollowStatus(int(msg.SenderID), int(msg.ReceiverID))
	if err != nil {
		return err
	}
	receiverFollowsSender, err := s.followRepo.GetFollowStatus(int(msg.ReceiverID), int(msg.SenderID))
	if err != nil {
		return err
	}
	if senderFollowsReceiver != "accepted" || receiverFollowsSender != "accepted" {
		return fmt.Errorf("vous devez vous suivre mutuellement pour envoyer un message")
	}
	return s.repo.CreateMessage(msg.SenderID, msg.ReceiverID, msg.Body)
}

func (s *MessageService) GetMessagesBetween(userID1, userID2 int64) ([]model.PrivateMessage, error) {
	return s.repo.GetMessagesBetween(userID1, userID2)
}

func (s *MessageService) GetConversationPartners(userID int64) ([]repository.ConversationPartner, error) {
	return s.repo.GetConversationPartners(userID)
}
