package mocks

import (
	"social-network/backend/internal/model"

	"github.com/stretchr/testify/mock"
)

type MockUserRepo struct {
	mock.Mock
}

func (m *MockUserRepo) GetFullProfileByID(id int) (model.FullProfile, error) {
	args := m.Called(id)
	return args.Get(0).(model.FullProfile), args.Error(1)
}

func (m *MockUserRepo) GetProfileByID(id int) (model.MeResponse, error) {
	args := m.Called(id)
	return args.Get(0).(model.MeResponse), args.Error(1)
}

func (m *MockUserRepo) GetUserbyID(id int) (model.User, error) {
	args := m.Called(id)
	return args.Get(0).(model.User), args.Error(1)
}

func (m *MockUserRepo) GetUserCredsbyEmail(email string) (model.LoginUser, error) {
	args := m.Called(email)
	return args.Get(0).(model.LoginUser), args.Error(1)
}

func (m *MockUserRepo) UserExists(email, username string) (bool, string, error) {
	args := m.Called(email, username)
	return args.Bool(0), args.String(1), args.Error(2)
}

func (m *MockUserRepo) SaveUser(user model.RegisterUser) error {
	args := m.Called(user)
	return args.Error(0)
}
