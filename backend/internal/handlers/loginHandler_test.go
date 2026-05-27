package handlers_test

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"social-network/backend/internal/handlers"
	"social-network/backend/internal/mocks"
	"social-network/backend/internal/model"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLoginHandler_Success(t *testing.T) {
	userSvc := new(mocks.MockUserService)
	sessionSvc := new(mocks.MockSessionService)
	h := handlers.NewLoginHandler(userSvc, sessionSvc)

	userSvc.On("Login", "test@test.com", "password123").Return(
		model.LoginUser{ID: 1, Email: "test@test.com"},
		nil,
	)
	sessionSvc.On("CreateSession", 1).Return("session-token-abc", nil)

	body := strings.NewReader(`{"email":"test@test.com","password":"password123"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/login", body)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.LoginHandler(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.Equal(t, true, resp["sucess"])

	cookies := w.Result().Cookies()
	require.Len(t, cookies, 1)
	assert.Equal(t, "session_token", cookies[0].Name)
	assert.Equal(t, "session-token-abc", cookies[0].Value)

	userSvc.AssertExpectations(t)
	sessionSvc.AssertExpectations(t)
}

func TestLoginHandler_InvalidCredentials(t *testing.T) {
	userSvc := new(mocks.MockUserService)
	sessionSvc := new(mocks.MockSessionService)
	h := handlers.NewLoginHandler(userSvc, sessionSvc)

	userSvc.On("Login", "wrong@test.com", "badpass").Return(
		model.LoginUser{},
		errors.New("mot de passe incorrect"),
	)

	body := strings.NewReader(`{"email":"wrong@test.com","password":"badpass"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/login", body)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.LoginHandler(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	sessionSvc.AssertNotCalled(t, "CreateSession")
	userSvc.AssertExpectations(t)
}

func TestLoginHandler_WrongMethod(t *testing.T) {
	userSvc := new(mocks.MockUserService)
	sessionSvc := new(mocks.MockSessionService)
	h := handlers.NewLoginHandler(userSvc, sessionSvc)

	req := httptest.NewRequest(http.MethodGet, "/auth/login", nil)
	w := httptest.NewRecorder()

	h.LoginHandler(w, req)

	assert.Equal(t, http.StatusMethodNotAllowed, w.Code)
	userSvc.AssertNotCalled(t, "Login")
}

func TestLoginHandler_InvalidJSON(t *testing.T) {
	userSvc := new(mocks.MockUserService)
	sessionSvc := new(mocks.MockSessionService)
	h := handlers.NewLoginHandler(userSvc, sessionSvc)

	body := strings.NewReader(`not-json`)
	req := httptest.NewRequest(http.MethodPost, "/auth/login", body)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.LoginHandler(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	userSvc.AssertNotCalled(t, "Login")
}
