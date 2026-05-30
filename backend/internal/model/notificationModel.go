package model

type NotifKind string

const (
	NotifFollow               NotifKind = "follow"
	NotifFollowRequest        NotifKind = "follow_request"
	NotifGroupInvite          NotifKind = "group_invite"
	NotifNewPostInGroup       NotifKind = "notif_new_post_in_group"
	NotifNewComment           NotifKind = "notif_new_comment"
	NotifGroupJoinRequest     NotifKind = "notif_group_join_request"
	NotifGroupRequestAccepted NotifKind = "notif_group_request_accepted"
	NotifBannedFromGroup      NotifKind = "notif_banned_from_group"
	NotifPostLike             NotifKind = "post_like"
	NotifUnfollow             NotifKind = "unfollow"
)

type NotificationPayload struct {
	ActorID   int64  `json:"actor_id,omitempty"`
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
