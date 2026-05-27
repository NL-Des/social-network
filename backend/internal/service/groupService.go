package service

import (
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type GroupService struct {
	repo *repository.GroupRepo
}

func NewGroupService(repo *repository.GroupRepo) *GroupService {
	return &GroupService{repo: repo}
}

func (s *GroupService) CreateGroup(title, description string, creatorID int64, memberIDs []int64) (int64, error) {
	return s.repo.CreateGroup(title, description, creatorID, memberIDs)
}

func (s *GroupService) GetUserGroups(userID int64) ([]repository.GroupInfo, error) {
	return s.repo.GetUserGroups(userID)
}

// CreateNewGroupMessage implémente GroupChatService (interface WS)
func (s *GroupService) CreateNewGroupMessage(msg model.GroupMessage) error {
	return s.repo.CreateGroupMessage(msg.GroupID, msg.SenderID, msg.Body)
}

// GetMemberIDs implémente GroupChatService (interface WS)
func (s *GroupService) GetMemberIDs(groupID int64) ([]int64, error) {
	return s.repo.GetGroupMemberIDs(groupID)
}

func (s *GroupService) GetGroupMessages(groupID int64) ([]model.GroupMessage, error) {
	return s.repo.GetGroupMessages(groupID)
}

func (s *GroupService) IsGroupMember(groupID, userID int64) (bool, error) {
	return s.repo.IsGroupMember(groupID, userID)
}
