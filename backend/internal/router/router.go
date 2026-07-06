package router

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"social-network/backend/internal/handlers"
	"social-network/backend/internal/middleware"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
	ws "social-network/backend/internal/websocket"
	groupChat "social-network/backend/internal/websocket/modules/groupChat"
	"social-network/backend/internal/websocket/modules/privateMessage"
)

type Deps struct {
	Auth         *middleware.AuthMiddleware
	Session      *service.SessionService
	Hub          *ws.Hub
	Login        *handlers.LoginHandler
	Register     *handlers.RegisterHandler
	Logout       *handlers.LogoutHandler
	Users        *handlers.UsersHandler
	Profil       *handlers.ProfilHandler
	Follow       *handlers.FollowHandler
	Message      *handlers.MessageHandler
	Group        *handlers.GroupHandler
	ChatGroup    *handlers.ChatGroupHandler
	Post         *handlers.PostAndCommentsHandler
	Notif        *handlers.NotificationHandler
	Event        *handlers.EventHandler
	PmHandler    *privateMessage.PrivateMessageHandler
	GcHandler    *groupChat.GroupChatHandler
}

func NewRouter(d Deps) http.Handler {
	r := mux.NewRouter()

	// ── WebSocket ────────────────────────────────────────────────────────────
	r.HandleFunc("/ws", wsHandler(d.Hub, d.Session)).Methods("GET")

	// ── Auth ─────────────────────────────────────────────────────────────────
	r.HandleFunc("/", handlers.HomeHandler).Methods("GET")
	r.HandleFunc("/auth/login", d.Login.LoginHandler).Methods("POST")
	r.HandleFunc("/auth/register", d.Register.RegisterHandler).Methods("POST")
	r.HandleFunc("/auth/logout", d.Logout.HandleLogout).Methods("POST")

	// ── Users / Profil ───────────────────────────────────────────────────────
	r.Handle("/users", d.Auth.RequireAuth(d.Users.HandleUsers)).Methods("GET")
	r.Handle("/users/{id}/profile", d.Auth.RequireAuth(http.HandlerFunc(d.Profil.GetProfile))).Methods("GET")
	r.Handle("/users/{id}/posts", d.Auth.RequireAuth(http.HandlerFunc(d.Profil.GetUserPosts))).Methods("GET")
	r.Handle("/me/profile", d.Auth.RequireAuth(http.HandlerFunc(d.Profil.GetMyProfile))).Methods("GET")
	r.Handle("/me/profile", d.Auth.RequireAuth(http.HandlerFunc(d.Profil.UpdateMyProfile))).Methods("PUT")
	r.Handle("/me/profile/visibility", d.Auth.RequireAuth(http.HandlerFunc(d.Profil.UpdateVisibility))).Methods("PATCH")

	// ── Follow ───────────────────────────────────────────────────────────────
	r.Handle("/users/{id}/follow", d.Auth.RequireAuth(http.HandlerFunc(d.Follow.Follow))).Methods("POST")
	r.Handle("/users/{id}/follow", d.Auth.RequireAuth(http.HandlerFunc(d.Follow.Unfollow))).Methods("DELETE")
	r.Handle("/users/{id}/follow/status", d.Auth.RequireAuth(http.HandlerFunc(d.Follow.GetFollowStatus))).Methods("GET")
	r.Handle("/users/{id}/follow/accept", d.Auth.RequireAuth(http.HandlerFunc(d.Follow.AcceptFollowRequest))).Methods("PATCH")
	r.Handle("/users/{id}/follow/reject", d.Auth.RequireAuth(http.HandlerFunc(d.Follow.RejectFollowRequest))).Methods("DELETE")
	r.Handle("/me/follow/requests", d.Auth.RequireAuth(http.HandlerFunc(d.Follow.GetPendingRequests))).Methods("GET")

	// ── Messages privés ──────────────────────────────────────────────────────
	r.Handle("/conversations", d.Auth.RequireAuth(d.Message.HandleConversations)).Methods("GET")
	r.Handle("/messages", d.Auth.RequireAuth(d.Message.HandleMessages)).Methods("GET")

	// ── Posts publics ────────────────────────────────────────────────────────
	r.Handle("/posts", d.Auth.RequireAuth(d.Post.PostAndCommentsHandler)).Methods("GET", "POST")
	r.Handle("/posts/{id}/like", d.Auth.RequireAuth(http.HandlerFunc(d.Post.HandleLike))).Methods("POST", "DELETE")

	// ── Notifications ────────────────────────────────────────────────────────
	r.Handle("/notifications", d.Auth.RequireAuth(d.Notif.HandleNotifications)).Methods("GET")
	r.Handle("/notifications", d.Auth.RequireAuth(d.Notif.HandleDeleteAll)).Methods("DELETE")
	r.Handle("/notifications/read", d.Auth.RequireAuth(d.Notif.HandleMarkAllRead)).Methods("PUT")
	r.Handle("/notifications/{id}/read", d.Auth.RequireAuth(http.HandlerFunc(d.Notif.HandleMarkRead))).Methods("PATCH")
	r.Handle("/notifications/{id}", d.Auth.RequireAuth(http.HandlerFunc(d.Notif.HandleDelete))).Methods("DELETE")

	// ── Groupes classiques ───────────────────────────────────────────────────
	r.Handle("/groups", d.Auth.RequireAuth(d.Group.HandleAllGroups)).Methods("GET")
	r.Handle("/group-chat", d.Auth.RequireAuth(d.Group.HandleGroups)).Methods("GET", "POST")
	r.Handle("/group-chat/{id}/leave", d.Auth.RequireAuth(d.Group.HandleLeaveGroup)).Methods("DELETE")
	r.Handle("/group-chat/{id}/delete", d.Auth.RequireAuth(d.Group.HandleDeleteGroup)).Methods("DELETE")
	r.Handle("/group-chat/{id}/transfer-admin", d.Auth.RequireAuth(d.Group.HandleTransferAdmin)).Methods("PUT")
	r.Handle("/group-chat/{id}/members", d.Auth.RequireAuth(d.Group.HandleGroupMembers)).Methods("GET", "POST")
	r.Handle("/group-chat/{id}/chat-id", d.Auth.RequireAuth(d.Group.HandleGroupChatID)).Methods("GET")
	r.Handle("/group-chat/{id}/invite", d.Auth.RequireAuth(d.Group.HandleInviteResponse)).Methods("PUT", "DELETE")
	r.Handle("/group-chat/{id}/members/{userId}", d.Auth.RequireAuth(d.Group.HandleRemoveMember)).Methods("DELETE")
	r.Handle("/group-chat/{id}/join", d.Auth.RequireAuth(d.Group.HandleJoinRequest)).Methods("POST", "DELETE")
	r.Handle("/group-chat/{id}/join-requests", d.Auth.RequireAuth(d.Group.HandleJoinRequests)).Methods("GET")
	r.Handle("/group-chat/{id}/join-requests/{userId}", d.Auth.RequireAuth(d.Group.HandleJoinRequestAction)).Methods("PUT", "DELETE")
	r.Handle("/group-chat/{id}/posts", d.Auth.RequireAuth(d.Group.HandleGroupPosts)).Methods("GET", "POST")
	r.Handle("/group-chat/{id}/posts/{postId}", d.Auth.RequireAuth(d.Group.HandleGroupPostDetail)).Methods("GET", "DELETE")
	r.Handle("/group-chat/{id}/posts/{postId}/like", d.Auth.RequireAuth(d.Group.HandleGroupPostLike)).Methods("POST", "DELETE")
	r.Handle("/group-chat/{id}/posts/{postId}/comments", d.Auth.RequireAuth(d.Group.HandleGroupPostComments)).Methods("GET", "POST")
	r.Handle("/group-chat/{id}/posts/{postId}/comments/{commentId}", d.Auth.RequireAuth(d.Group.HandleGroupCommentDelete)).Methods("DELETE")
	r.Handle("/group-chat/{id}/events", d.Auth.RequireAuth(http.HandlerFunc(d.Event.HandleGroupEvents))).Methods("GET", "POST")
	r.Handle("/group-chat/{id}/events/{eventId}", d.Auth.RequireAuth(http.HandlerFunc(d.Event.HandleGroupEventDetail))).Methods("DELETE")
	r.Handle("/group-chat/{id}/events/{eventId}/respond", d.Auth.RequireAuth(http.HandlerFunc(d.Event.HandleEventResponse))).Methods("POST")

	// ── Groupes de discussion (chat) ─────────────────────────────────────────
	r.Handle("/chat-groups", d.Auth.RequireAuth(d.ChatGroup.HandleChatGroups)).Methods("GET", "POST")
	r.Handle("/chat-groups/{id}/messages", d.Auth.RequireAuth(d.ChatGroup.HandleChatGroupMessages)).Methods("GET")
	r.Handle("/chat-groups/{id}/members", d.Auth.RequireAuth(d.ChatGroup.HandleChatGroupMembers)).Methods("GET", "POST")
	r.Handle("/chat-groups/{id}/members/{userId}", d.Auth.RequireAuth(d.ChatGroup.HandleChatGroupMemberRemove)).Methods("DELETE")
	r.Handle("/chat-groups/{id}/leave", d.Auth.RequireAuth(d.ChatGroup.HandleLeaveChatGroup)).Methods("DELETE")

	// ── Divers ───────────────────────────────────────────────────────────────
	r.Handle("/test", d.Auth.RequireAuth(handlers.TestAuthHandler)).Methods("GET")

	// ── WS message routing ───────────────────────────────────────────────────
	d.Hub.OnMessage = func(c *ws.Client, raw []byte) {
		var envelope struct {
			Type string          `json:"type"`
			Data json.RawMessage `json:"data"`
		}
		if err := json.Unmarshal(raw, &envelope); err != nil {
			return
		}
		switch envelope.Type {
		case "private_message":
			var pm model.PrivateMessage
			if err := json.Unmarshal(envelope.Data, &pm); err != nil {
				return
			}
			d.PmHandler.Handle(c, pm)
		case "group_message":
			var gm model.GroupMessage
			if err := json.Unmarshal(envelope.Data, &gm); err != nil {
				return
			}
			d.GcHandler.Handle(c, gm)
		}
	}

	fmt.Println("Démarrage sur http://localhost:5090")
	return r
}

func wsHandler(hub *ws.Hub, sessionSvc *service.SessionService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		token := r.URL.Query().Get("token")
		if token == "" {
			if cookie, err := r.Cookie("session_token"); err == nil {
				token = cookie.Value
			}
		}
		if token == "" {
			http.Error(w, "Non authentifié", http.StatusUnauthorized)
			return
		}
		userIDStr, err := sessionSvc.GetUserID(token)
		if err != nil {
			http.Error(w, "Session invalide", http.StatusUnauthorized)
			return
		}
		userIDInt, err := strconv.ParseInt(userIDStr, 10, 64)
		if err != nil {
			http.Error(w, "Session invalide", http.StatusUnauthorized)
			return
		}
		ws.ServeWs(hub, w, r, userIDInt)
	}
}
