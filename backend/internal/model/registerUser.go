package model

type RegisterUser struct {
	Name            string `json:"name"`
	FirstName       string `json:"firstName"`
	Birthday        string `json:"birthday"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
<<<<<<< HEAD
	UserName        string `json:"userName"`
=======
	Username        string `json:"username"`
>>>>>>> cfe20a422743d7de26a5941ec0b120d3c0ef2dcf
	Description     string `json:"description"`
	ProfilePicture  string `json:"profilePicture"`
	IsPrivate       bool   `json:"isprivate"`
}
