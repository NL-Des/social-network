package service

import "social-network/backend/internal/model"

type ChatServiceInterface interface {
    CreateNewMessage(msg model.Message) error
}
