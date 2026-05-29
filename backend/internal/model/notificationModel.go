package model

type NotifKind string

const (
	NotifFollowRequest        NotifKind = "follow_request"
	NotifGroupInvite          NotifKind = "group_invite"
	NotifNewPostInGroup       NotifKind = "notif_new_post_in_group"
	NotifNewComment           NotifKind = "notif_new_comment"
	NotifGroupJoinRequest     NotifKind = "notif_group_join_request"
	NotifGroupRequestAccepted NotifKind = "notif_group_request_accepted"
	NotifBannedFromGroup      NotifKind = "notif_banned_from_group"
)

type NotificationPayload struct {
	ActorName string `json:"actor_name,omitempty"`
	GroupName string `json:"group_name,omitempty"`
	PostTitle string `json:"post_title,omitempty"`
	CreatedAt string `json:"created_at,omitempty"`
}

type Notification struct {
	ID         int64               `json:"id"`
	ReceiverID int64               `json:"receiver_id"`
	Kind       NotifKind           `json:"kind"`
	Payload    NotificationPayload `json:"payload"`
	Read       bool                `json:"read"`
	CreatedAt  string              `json:"created_at"`
}
