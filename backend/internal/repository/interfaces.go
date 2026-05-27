package repository

import (
	"social-network/backend/internal/model"
	"time"
)

type UserRepoInterface interface {
	GetFullProfileByID(id int) (model.FullProfile, error)
	GetProfileByID(id int) (model.MeResponse, error)
	GetUserbyID(id int) (model.User, error)
	GetUserCredsbyEmail(email string) (model.LoginUser, error)
	UserExists(email, username string) (bool, string, error)
	SaveUser(user model.RegisterUser) error
}

type SessionRepoInterface interface {
	CreateSession(token string, userID int, createdAt, expiresAt time.Time) error
	GetSession(token string) (int, error)
	SessionExists(userID int) (string, bool, error)
	DeleteSession(token string) error
}
