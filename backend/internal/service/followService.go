package service

import "social-network/backend/internal/repository"

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
