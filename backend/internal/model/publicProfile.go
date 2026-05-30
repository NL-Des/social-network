package model

type PublicProfile struct {
	ID           int    `json:"id"`
	Pseudo       string `json:"pseudo"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	DateOfBirth  string `json:"dateOfBirth"`
	AboutMe      string `json:"aboutMe"`
	Avatar       string `json:"avatar"`
	IsPrivate    bool   `json:"isPrivate"`
	IsAccessible bool   `json:"isAccessible"`

	Followers []Follower  `json:"followers"`
	Following []Following `json:"following"`
	Posts     []AllPosts  `json:"posts"`

	CanEdit      bool   `json:"canEdit"`
	IsFollowing  bool   `json:"isFollowing"`
	FollowStatus string `json:"followStatus"`
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
