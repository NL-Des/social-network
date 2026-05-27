package service_test

import (
	"errors"
	"testing"

	"social-network/backend/internal/mocks"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

// --- Register ---

func TestRegister_Success(t *testing.T) {
	repo := new(mocks.MockUserRepo)
	svc := service.NewUserService(repo)

	user := model.RegisterUser{
		Email:           "test@example.com",
		Password:        "password123",
		ConfirmPassword: "password123",
		FirstName:       "John",
		Name:            "Doe",
	}

	repo.On("UserExists", "test@example.com", "John.Doe").Return(false, "", nil)
	repo.On("SaveUser", mock.MatchedBy(func(u model.RegisterUser) bool {
		return u.Email == "test@example.com" && u.Username == "John.Doe" && u.Password != "password123"
	})).Return(nil)

	err := svc.Register(user)

	require.NoError(t, err)
	repo.AssertExpectations(t)
}

func TestRegister_EmptyEmail(t *testing.T) {
	repo := new(mocks.MockUserRepo)
	svc := service.NewUserService(repo)

	user := model.RegisterUser{
		Email:    "",
		Password: "password123",
	}

	err := svc.Register(user)

	assert.EqualError(t, err, "email ou mot de passe vide")
	repo.AssertNotCalled(t, "UserExists")
}

func TestRegister_PasswordMismatch(t *testing.T) {
	repo := new(mocks.MockUserRepo)
	svc := service.NewUserService(repo)

	user := model.RegisterUser{
		Email:           "test@example.com",
		Password:        "password123",
		ConfirmPassword: "different",
	}

	err := svc.Register(user)

	assert.EqualError(t, err, "les mots de passe ne sont pas identiques")
	repo.AssertNotCalled(t, "UserExists")
}

func TestRegister_EmailAlreadyExists(t *testing.T) {
	repo := new(mocks.MockUserRepo)
	svc := service.NewUserService(repo)

	user := model.RegisterUser{
		Email:           "existing@example.com",
		Password:        "pass123",
		ConfirmPassword: "pass123",
		Username:        "janedoe",
	}

	repo.On("UserExists", "existing@example.com", "janedoe").Return(true, "email", nil)

	err := svc.Register(user)

	assert.EqualError(t, err, "email déjà utilisé")
	repo.AssertExpectations(t)
}

func TestRegister_UsernameAlreadyExists(t *testing.T) {
	repo := new(mocks.MockUserRepo)
	svc := service.NewUserService(repo)

	user := model.RegisterUser{
		Email:           "new@example.com",
		Password:        "pass123",
		ConfirmPassword: "pass123",
		Username:        "taken",
	}

	repo.On("UserExists", "new@example.com", "taken").Return(true, "username", nil)

	err := svc.Register(user)

	assert.EqualError(t, err, "username déjà utilisé")
	repo.AssertExpectations(t)
}

// --- Login ---

func TestLogin_Success(t *testing.T) {
	repo := new(mocks.MockUserRepo)
	svc := service.NewUserService(repo)

	hashed, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	repo.On("GetUserCredsbyEmail", "test@example.com").Return(
		model.LoginUser{ID: 1, Email: "test@example.com", Password: string(hashed)},
		nil,
	)

	user, err := svc.Login("test@example.com", "password123")

	require.NoError(t, err)
	assert.Equal(t, 1, user.ID)
	repo.AssertExpectations(t)
}

func TestLogin_EmailNotFound(t *testing.T) {
	repo := new(mocks.MockUserRepo)
	svc := service.NewUserService(repo)

	repo.On("GetUserCredsbyEmail", "unknown@example.com").Return(
		model.LoginUser{},
		errors.New("Email inconnu"),
	)

	_, err := svc.Login("unknown@example.com", "password")

	assert.EqualError(t, err, "Email inconnu")
	repo.AssertExpectations(t)
}

func TestLogin_WrongPassword(t *testing.T) {
	repo := new(mocks.MockUserRepo)
	svc := service.NewUserService(repo)

	hashed, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), bcrypt.DefaultCost)
	repo.On("GetUserCredsbyEmail", "test@example.com").Return(
		model.LoginUser{ID: 1, Email: "test@example.com", Password: string(hashed)},
		nil,
	)

	_, err := svc.Login("test@example.com", "wrongpassword")

	assert.EqualError(t, err, "mot de passe incorrect")
	repo.AssertExpectations(t)
}
