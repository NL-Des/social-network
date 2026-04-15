package model

type Post struct {
	ID int
	Title string
	Content string
	Tags []string
	Privacy string
}