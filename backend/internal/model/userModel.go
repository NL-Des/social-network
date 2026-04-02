package model

import (
	"time"
)

type User struct {
	ID int
	Email string
	Firstname string
	Lastname string
	DateOfBirth time.Time
	IsPrivate bool
	Avatar string
	Pseudo string
	AboutMe string
}