package service

import (
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type ChatGroupService struct {
	repo *repository.ChatGroupRepo
}

func NewChatGroupService(repo *repository.ChatGroupRepo) *ChatGroupService {
	return &ChatGroupService{repo: repo}
}

func (s *ChatGroupService) CreateChatGroup(title string, creatorID int64, memberIDs []int64) (int64, error) {
	return s.repo.CreateChatGroup(title, creatorID, memberIDs)
}

func (s *ChatGroupService) GetUserChatGroups(userID int64) ([]repository.ChatGroupInfo, error) {
	return s.repo.GetUserChatGroups(userID)
}

// Implements GroupChatService interface (WS)
func (s *ChatGroupService) CreateNewGroupMessage(msg model.GroupMessage) error {
	return s.repo.CreateChatGroupMessage(msg.GroupID, msg.SenderID, msg.Body)
}

// Implements GroupChatService interface (WS)
func (s *ChatGroupService) GetMemberIDs(groupID int64) ([]int64, error) {
	return s.repo.GetChatGroupMemberIDs(groupID)
}

func (s *ChatGroupService) IsChatGroupMember(chatGroupID, userID int64) (bool, error) {
	return s.repo.IsChatGroupMember(chatGroupID, userID)
}

func (s *ChatGroupService) GetChatGroupMessages(chatGroupID int64) ([]model.GroupMessage, error) {
	return s.repo.GetChatGroupMessages(chatGroupID)
}

func (s *ChatGroupService) GetChatGroupMembers(chatGroupID int64) ([]repository.GroupMember, error) {
	return s.repo.GetChatGroupMembers(chatGroupID)
}

func (s *ChatGroupService) GetChatGroupTitle(chatGroupID int64) (string, error) {
	return s.repo.GetChatGroupTitle(chatGroupID)
}

func (s *ChatGroupService) AddChatGroupMember(chatGroupID, userID int64) error {
	return s.repo.AddChatGroupMember(chatGroupID, userID)
}

func (s *ChatGroupService) LeaveChatGroup(chatGroupID, userID int64) error {
	return s.repo.LeaveChatGroup(chatGroupID, userID)
}

func (s *ChatGroupService) RemoveChatGroupMember(chatGroupID, targetID, requesterID int64) error {
	return s.repo.RemoveChatGroupMember(chatGroupID, targetID, requesterID)
}

func (s *ChatGroupService) DeleteChatGroup(chatGroupID int64) error {
	return s.repo.DeleteChatGroup(chatGroupID)
}
