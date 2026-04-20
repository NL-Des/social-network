package model

type User struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	FirstName      string `json:"firstName"`
	Birthday       string `json:"birthday"`
	Email          string `json:"email"`
	UserName       string `json:"userName"`
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
