package mocks

import "github.com/stretchr/testify/mock"

type MockSessionService struct {
	mock.Mock
}

func (m *MockSessionService) CreateSession(userID int) (string, error) {
	args := m.Called(userID)
	return args.String(0), args.Error(1)
}

func (m *MockSessionService) GetUserID(token string) (int, error) {
	args := m.Called(token)
	return args.Int(0), args.Error(1)
}

func (m *MockSessionService) DeleteSession(token string) error {
	args := m.Called(token)
	return args.Error(0)
}
