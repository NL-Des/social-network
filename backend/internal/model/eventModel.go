package model

type GroupEvent struct {
	ID            int    `json:"id"`
	GroupID       int    `json:"groupId"`
	CreatorID     int    `json:"creatorId"`
	CreatorName   string `json:"creatorName"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	EventDatetime string `json:"eventDatetime"`
	CreatedAt     string `json:"createdAt"`
	Coming        int    `json:"coming"`
	Unsure        int    `json:"unsure"`
	Uninterested  int    `json:"uninterested"`
	UserResponse  string `json:"userResponse"`
}

type CreateEventRequest struct {
	Title         string `json:"title"`
	Description   string `json:"description"`
	EventDatetime string `json:"eventDatetime"`
}
