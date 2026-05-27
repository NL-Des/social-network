package mocks

import (
	"time"

	"github.com/stretchr/testify/mock"
)

type MockSessionRepo struct {
	mock.Mock
}

func (m *MockSessionRepo) CreateSession(token string, userID int, createdAt, expiresAt time.Time) error {
	args := m.Called(token, userID, createdAt, expiresAt)
	return args.Error(0)
}

func (m *MockSessionRepo) GetSession(token string) (int, error) {
	args := m.Called(token)
	return args.Int(0), args.Error(1)
}

func (m *MockSessionRepo) SessionExists(userID int) (string, bool, error) {
	args := m.Called(userID)
	return args.String(0), args.Bool(1), args.Error(2)
}

func (m *MockSessionRepo) DeleteSession(token string) error {
	args := m.Called(token)
	return args.Error(0)
}
