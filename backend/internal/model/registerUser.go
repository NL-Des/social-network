package model

type RegisterUser struct {
	Name            string `json:"name"`
	FirstName       string `json:"firstName"`
	Birthday        string `json:"birthday"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
	UserName        string `json:"userName"`
	Description     string `json:"description"`
	ProfilePicture  string `json:"profilePicture"`
	IsPrivate       bool   `json:"isprivate"`
}
