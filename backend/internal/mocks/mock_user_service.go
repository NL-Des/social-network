package mocks

import (
	"social-network/backend/internal/model"

	"github.com/stretchr/testify/mock"
)

type MockUserService struct {
	mock.Mock
}

func (m *MockUserService) Register(userData model.RegisterUser) error {
	args := m.Called(userData)
	return args.Error(0)
}

func (m *MockUserService) Login(email, password string) (model.LoginUser, error) {
	args := m.Called(email, password)
	return args.Get(0).(model.LoginUser), args.Error(1)
}

func (m *MockUserService) GetProfile(id int) (model.MeResponse, error) {
	args := m.Called(id)
	return args.Get(0).(model.MeResponse), args.Error(1)
}

func (m *MockUserService) GetFullProfile(id int) (model.FullProfile, error) {
	args := m.Called(id)
	return args.Get(0).(model.FullProfile), args.Error(1)
}
