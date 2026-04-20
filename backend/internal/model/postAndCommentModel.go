package model

type Post struct {
	ID int
	Author User
	Title string
	Content string
	Tags []string
	Privacy string
	CreatedAt string
	UpdatedAt string
	Comments []Comment
}

type Comment struct {
	ID int
	PostID int
	Content string
	Author User
	CreatedAt string
	UpdatedAt string
}