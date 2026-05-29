package service

import (
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type FollowService struct {
	FollowRepo *repository.FollowRepository
}

func NewFollowService(repo *repository.FollowRepository) *FollowService {
	return &FollowService{FollowRepo: repo}
}

func (s *FollowService) Follow(followerID, followingID int) error {
	return s.FollowRepo.Follow(followerID, followingID)
}

func (s *FollowService) Unfollow(followerID, followingID int) error {
	return s.FollowRepo.Unfollow(followerID, followingID)
}

func (s *FollowService) GetFollowStatus(followerID, followingID int) (string, error) {
	return s.FollowRepo.GetFollowStatus(followerID, followingID)
}

func (s *FollowService) GetPendingRequests(userID int) ([]model.UserListItem, error) {
	return s.FollowRepo.GetPendingRequests(userID)
}

func (s *FollowService) AcceptFollowRequest(followerID, followingID int) error {
	return s.FollowRepo.AcceptFollowRequest(followerID, followingID)
}

func (s *FollowService) RejectFollowRequest(followerID, followingID int) error {
	return s.FollowRepo.RejectFollowRequest(followerID, followingID)
}
