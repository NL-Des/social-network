package service

import "social-network/backend/internal/model"

type ProfileService struct {
	userService *UserService
}

func NewProfileService(us *UserService) *ProfileService {
	return &ProfileService{userService: us}
}

func (s *ProfileService) GetProfile(id int) (model.MeResponse, error) {
	return s.userService.GetProfile(id)
}
