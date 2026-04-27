package service

import "social-network/backend/internal/repository"

type ChatService struct {
	// userRepo *repository.UserRepository,
	messageRepo *repository.MessageRepo
}