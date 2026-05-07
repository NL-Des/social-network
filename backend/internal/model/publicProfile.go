package model

type PublicProfile struct {
	ID          int    `json:"id"`
	Pseudo      string `json:"pseudo"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DateOfBirth string `json:"DateOfBirth"`
	AboutMe     string `json:"aboutMe"`
	Avatar      string `json:"avatar"`
	IsPrivate   bool   `json:"isPrivate"`

	Followers []Follower  `json:"followers"`
	Following []Following `json:"following"`
	Posts     []AllPosts  `json:"posts"`

	// indique si l’utilisateur connecté est propriétaire du profil
	CanEdit bool `json:"canEdit"`
}

type Follower struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
}

type Following struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
}

type AllPosts struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}
