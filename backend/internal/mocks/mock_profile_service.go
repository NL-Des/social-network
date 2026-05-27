package mocks

import (
	"social-network/backend/internal/model"

	"github.com/stretchr/testify/mock"
)

type MockProfileService struct {
	mock.Mock
}

func (m *MockProfileService) GetProfile(id int) (model.MeResponse, error) {
	args := m.Called(id)
	return args.Get(0).(model.MeResponse), args.Error(1)
}

func (m *MockProfileService) GetFullProfile(id int) (model.FullProfile, error) {
	args := m.Called(id)
	return args.Get(0).(model.FullProfile), args.Error(1)
}
