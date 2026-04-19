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
