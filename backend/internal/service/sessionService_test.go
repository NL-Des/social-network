package service_test

import (
	"errors"
	"testing"

	"social-network/backend/internal/mocks"
	"social-network/backend/internal/service"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestCreateSession_NewSession(t *testing.T) {
	repo := new(mocks.MockSessionRepo)
	svc := service.NewSessionService(repo)

	repo.On("SessionExists", 1).Return("", false, nil)
	repo.On("CreateSession",
		mock.AnythingOfType("string"),
		1,
		mock.Anything,
		mock.Anything,
	).Return(nil)

	token, err := svc.CreateSession(1)

	require.NoError(t, err)
	assert.NotEmpty(t, token)
	repo.AssertExpectations(t)
}

func TestCreateSession_ExistingSession(t *testing.T) {
	repo := new(mocks.MockSessionRepo)
	svc := service.NewSessionService(repo)

	repo.On("SessionExists", 1).Return("existing-token", true, nil)

	token, err := svc.CreateSession(1)

	require.NoError(t, err)
	assert.Equal(t, "existing-token", token)
	repo.AssertNotCalled(t, "CreateSession")
	repo.AssertExpectations(t)
}

func TestCreateSession_RepoError(t *testing.T) {
	repo := new(mocks.MockSessionRepo)
	svc := service.NewSessionService(repo)

	repo.On("SessionExists", 99).Return("", false, errors.New("db error"))

	_, err := svc.CreateSession(99)

	assert.Error(t, err)
	repo.AssertExpectations(t)
}

func TestGetUserID_Success(t *testing.T) {
	repo := new(mocks.MockSessionRepo)
	svc := service.NewSessionService(repo)

	repo.On("GetSession", "valid-token").Return(42, nil)

	userID, err := svc.GetUserID("valid-token")

	require.NoError(t, err)
	assert.Equal(t, 42, userID)
	repo.AssertExpectations(t)
}

func TestGetUserID_InvalidToken(t *testing.T) {
	repo := new(mocks.MockSessionRepo)
	svc := service.NewSessionService(repo)

	repo.On("GetSession", "bad-token").Return(0, errors.New("session expirée"))

	_, err := svc.GetUserID("bad-token")

	assert.EqualError(t, err, "session expirée")
	repo.AssertExpectations(t)
}

func TestDeleteSession_Success(t *testing.T) {
	repo := new(mocks.MockSessionRepo)
	svc := service.NewSessionService(repo)

	repo.On("DeleteSession", "token-abc").Return(nil)

	err := svc.DeleteSession("token-abc")

	require.NoError(t, err)
	repo.AssertExpectations(t)
}
