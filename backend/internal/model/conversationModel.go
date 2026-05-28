package model

type Conversation struct {
	UserOne  *User
	UserTwo  *User
	Messages *[]Message
}