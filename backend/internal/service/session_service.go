package service

import "social-network/backend/internal/repository"

func (s *AuthService) CreateSession(userID int) (string, error) {
	return repository.CreateSession(s.DB, userID)
}

func (s *AuthService) GetActiveSessionToken(userID int) string {
	return repository.GetActiveSessionToken(s.DB, userID)
}
