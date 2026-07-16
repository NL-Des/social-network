package handlers_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"social-network/backend/internal/handlers"
	"social-network/backend/internal/mocks"
	"social-network/backend/internal/model"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHandleMe_Success(t *testing.T) {
	profileSvc := new(mocks.MockProfileService)
	h := handlers.NewMeHandler(profileSvc)

	expected := model.MeResponse{
		Name:      "John D",
		Username:  "johndoe",
		Followers: 5,
		Initials:  "JD",
	}
	profileSvc.On("GetProfile", 1).Return(expected, nil)

	req := httptest.NewRequest(http.MethodGet, "/user/me", nil)
	req = req.WithContext(context.WithValue(req.Context(), "userID", 1))
	w := httptest.NewRecorder()

	h.HandleMe(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var got model.MeResponse
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &got))
	assert.Equal(t, expected, got)
	profileSvc.AssertExpectations(t)
}

func TestHandleMe_Unauthorized(t *testing.T) {
	profileSvc := new(mocks.MockProfileService)
	h := handlers.NewMeHandler(profileSvc)

	req := httptest.NewRequest(http.MethodGet, "/user/me", nil)
	w := httptest.NewRecorder()

	h.HandleMe(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	profileSvc.AssertNotCalled(t, "GetProfile")
}

func TestHandleMe_UserNotFound(t *testing.T) {
	profileSvc := new(mocks.MockProfileService)
	h := handlers.NewMeHandler(profileSvc)

	profileSvc.On("GetProfile", 99).Return(model.MeResponse{}, errors.New("not found"))

	req := httptest.NewRequest(http.MethodGet, "/user/me", nil)
	req = req.WithContext(context.WithValue(req.Context(), "userID", 99))
	w := httptest.NewRecorder()

	h.HandleMe(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	profileSvc.AssertExpectations(t)
}

func TestHandleProfile_Success(t *testing.T) {
	profileSvc := new(mocks.MockProfileService)
	h := handlers.NewMeHandler(profileSvc)

	expected := model.FullProfile{
		FirstName:      "John",
		LastName:       "Doe",
		Username:       "johndoe",
		Email:          "john@test.com",
		BirthDate:      "1990-01-01",
		FollowersCount: 10,
		Initials:       "JD",
		Visibility:     "public",
	}
	profileSvc.On("GetFullProfile", 1).Return(expected, nil)

	req := httptest.NewRequest(http.MethodGet, "/user/profile", nil)
	req = req.WithContext(context.WithValue(req.Context(), "userID", 1))
	w := httptest.NewRecorder()

	h.HandleProfile(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &resp))
	assert.Contains(t, resp, "user")
	assert.Contains(t, resp, "followers")
	profileSvc.AssertExpectations(t)
}
