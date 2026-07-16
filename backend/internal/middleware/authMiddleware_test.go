package middleware_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"social-network/backend/internal/middleware"
	"social-network/backend/internal/mocks"

	"github.com/stretchr/testify/assert"
)

func TestRequireAuth_ValidSession(t *testing.T) {
	sessionSvc := new(mocks.MockSessionService)
	m := middleware.NewAuthMiddleware(sessionSvc)

	sessionSvc.On("GetUserID", "valid-token").Return(42, nil)

	nextCalled := false
	var ctxUserID int
	next := func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		ctxUserID, _ = r.Context().Value("userID").(int)
	}

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.AddCookie(&http.Cookie{Name: "session_token", Value: "valid-token"})
	w := httptest.NewRecorder()

	m.RequireAuth(next)(w, req)

	assert.True(t, nextCalled)
	assert.Equal(t, 42, ctxUserID)
	sessionSvc.AssertExpectations(t)
}

func TestRequireAuth_NoCookie(t *testing.T) {
	sessionSvc := new(mocks.MockSessionService)
	m := middleware.NewAuthMiddleware(sessionSvc)

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()

	nextCalled := false
	m.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
	})(w, req)

	assert.False(t, nextCalled)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	sessionSvc.AssertNotCalled(t, "GetUserID")
}

func TestRequireAuth_InvalidSession(t *testing.T) {
	sessionSvc := new(mocks.MockSessionService)
	m := middleware.NewAuthMiddleware(sessionSvc)

	sessionSvc.On("GetUserID", "expired-token").Return(0, errors.New("session expirée"))

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.AddCookie(&http.Cookie{Name: "session_token", Value: "expired-token"})
	w := httptest.NewRecorder()

	nextCalled := false
	m.RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
	})(w, req)

	assert.False(t, nextCalled)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	sessionSvc.AssertExpectations(t)
}
