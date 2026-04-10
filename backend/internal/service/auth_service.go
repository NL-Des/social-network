package service

import (
	"database/sql"
	"social-network/backend/internal/repository"
)

type AuthService struct {
	DB *sql.DB
}

func (s *AuthService) CheckCredentials(login, password string) (bool, int, error) {
	return repository.CheckCredentials(s.DB, login, password)
}
