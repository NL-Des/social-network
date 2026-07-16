package handlers_test

import (
	"bytes"
	"errors"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"social-network/backend/internal/handlers"
	"social-network/backend/internal/mocks"
	"social-network/backend/internal/model"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func buildRegisterForm(t *testing.T, fields map[string]string) (*bytes.Buffer, string) {
	t.Helper()
	body := &bytes.Buffer{}
	w := multipart.NewWriter(body)
	for k, v := range fields {
		w.WriteField(k, v)
	}
	w.Close()
	return body, w.FormDataContentType()
}

func TestRegisterHandler_Success(t *testing.T) {
	userSvc := new(mocks.MockUserService)
	h := handlers.NewRegisterHandler(userSvc)

	userSvc.On("Register", mock.MatchedBy(func(u model.RegisterUser) bool {
		return u.Email == "new@test.com" &&
			u.Password == "pass123" &&
			u.FirstName == "Alice" &&
			u.Name == "Smith"
	})).Return(nil)

	body, contentType := buildRegisterForm(t, map[string]string{
		"email":           "new@test.com",
		"password":        "pass123",
		"confirmPassword": "pass123",
		"firstName":       "Alice",
		"name":            "Smith",
		"birthday":        "1995-06-15",
	})

	req := httptest.NewRequest(http.MethodPost, "/auth/register", body)
	req.Header.Set("Content-Type", contentType)
	w := httptest.NewRecorder()

	h.RegisterHandler(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	userSvc.AssertExpectations(t)
}

func TestRegisterHandler_ServiceError(t *testing.T) {
	userSvc := new(mocks.MockUserService)
	h := handlers.NewRegisterHandler(userSvc)

	userSvc.On("Register", mock.Anything).Return(errors.New("email déjà utilisé"))

	body, contentType := buildRegisterForm(t, map[string]string{
		"email":           "existing@test.com",
		"password":        "pass123",
		"confirmPassword": "pass123",
	})

	req := httptest.NewRequest(http.MethodPost, "/auth/register", body)
	req.Header.Set("Content-Type", contentType)
	w := httptest.NewRecorder()

	h.RegisterHandler(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	userSvc.AssertExpectations(t)
}

func TestRegisterHandler_WrongMethod(t *testing.T) {
	userSvc := new(mocks.MockUserService)
	h := handlers.NewRegisterHandler(userSvc)

	req := httptest.NewRequest(http.MethodGet, "/auth/register", nil)
	w := httptest.NewRecorder()

	h.RegisterHandler(w, req)

	assert.Equal(t, http.StatusMethodNotAllowed, w.Code)
	userSvc.AssertNotCalled(t, "Register")
}
