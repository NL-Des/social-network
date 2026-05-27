package model

type NotifKind string

const (
	NotifNewPostInGroup       NotifKind = "notif_new_post_in_group"
	NotifNewComment           NotifKind = "notif_new_comment"
	NotifGroupJoinRequest     NotifKind = "notif_group_join_request"
	NotifGroupRequestAccepted NotifKind = "notif_group_request_accepted"
	NotifBannedFromGroup      NotifKind = "notif_banned_from_group"
)

// NotificationPayload contient les données affichées dans la notification.
// Tous les champs sont optionnels selon le type de notification.
type NotificationPayload struct {
	PostTitle string    `json:"post_title,omitempty"`
	ActorName string    `json:"actor_name,omitempty"`
	GroupName string    `json:"group_name,omitempty"`
	CreatedAt string `json:"created_at,omitempty"`
}

type Notification struct {
	ID         int64               `json:"id"`
	ReceiverID int64               `json:"receiver_id"`
	Kind       NotifKind           `json:"kind"`
	Payload    NotificationPayload `json:"payload"`
	CreatedAt  string           `json:"created_at"`
	Read       bool                `json:"read"`
}