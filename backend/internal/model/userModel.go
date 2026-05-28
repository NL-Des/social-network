package model

type FullProfile struct {
	FirstName      string `json:"firstName"`
	LastName       string `json:"lastName"`
	Username       string `json:"username"`
	Email          string `json:"email"`
	BirthDate      string `json:"birthDate"`
	FollowersCount int    `json:"followersCount"`
	Initials       string `json:"initials"`
	Visibility     string `json:"visibility"`
}

type MeResponse struct {
	Name      string `json:"name"`
	Username  string `json:"username"`
	Followers int    `json:"followers"`
	Initials  string `json:"initials"`
}

type UserListItem struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Initials  string `json:"initials"`
	Following bool   `json:"following"`
}

type User struct {
	ID             string    `json:"id"`
	Name           string `json:"name"`
	FirstName      string `json:"firstName"`
	Birthday       string `json:"birthday"`
	Email          string `json:"email"`
	Username       string `json:"username"`
	Description    string `json:"description"`
	ProfilePicture string `json:"profilePicture"`
	IsPrivate      bool   `json:"isprivate"`
}

/* Sauvegarde pour prévenir un nettoyage trop profond de fonctionnalités potentiellement encore en développement.
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
*/
