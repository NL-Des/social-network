package service

import "social-network/backend/internal/model"

type UserServiceInterface interface {
	Register(userData model.RegisterUser) error
	Login(email, password string) (model.LoginUser, error)
	GetProfile(id int) (model.MeResponse, error)
	GetFullProfile(id int) (model.FullProfile, error)
}

type SessionServiceInterface interface {
	CreateSession(userID int) (string, error)
	GetUserID(token string) (int, error)
	DeleteSession(token string) error
}

type ProfileServiceInterface interface {
	GetProfile(id int) (model.MeResponse, error)
	GetFullProfile(id int) (model.FullProfile, error)
}
