package service

import (
	"social-network/backend/internal/repository"
	"time"

	"github.com/google/uuid"
)

type SessionService struct {
	sessionRepo *repository.SessionRepo
}

func NewSessionService(sr *repository.SessionRepo) *SessionService {
	return &SessionService{sessionRepo: sr}
}

func (s *SessionService) CreateSession(userID int) (string, error) {

	var token string
	var expiresAt time.Time
	var createdAt time.Time

	token, exists, err := s.sessionRepo.SessionExists(userID)

	if err != nil {
		return "", err
	}

	if !exists {
		token = generateSessionToken()
		expiresAt = time.Now().Add(24 * time.Hour)
		createdAt = time.Now()

		err = s.sessionRepo.CreateSession(token, userID, createdAt, expiresAt)
		if err != nil {
			return "", err
		}

	}

	return token, nil
}

func generateSessionToken() string {
	return uuid.NewString()
}

func (s *SessionService) GetUserID(token string) (int, error) {
	return s.sessionRepo.GetSession(token)
}

func (s *SessionService) DeleteSession(toekn string) error {
	return s.sessionRepo.DeleteSession(toekn)
}
