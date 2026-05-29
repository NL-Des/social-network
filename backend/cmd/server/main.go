package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"social-network/backend/internal/database"
	"social-network/backend/internal/handlers"
	"social-network/backend/internal/middleware"
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
	"social-network/backend/internal/router"
	"social-network/backend/internal/service"
	ws "social-network/backend/internal/websocket"
	groupChat "social-network/backend/internal/websocket/modules/groupChat"
	"social-network/backend/internal/websocket/modules/privateMessage"
	"strconv"
)

func main() {

	db, err := database.DbOrchestration()
	if err != nil {
		log.Println("Error with DB", err)
	}
	if db != nil {
		log.Println("Test")
		var tableCount int
		err = db.QueryRow("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'").Scan(&tableCount)
		if err != nil {
			log.Println("Erreur lors du comptage des tables :", err)
		} else {
			log.Printf("La base de données contient actuellement %d tables.", tableCount)
		}
	}

	// Repositories
	userRepo := repository.NewUserRepo(db)
	sessionRepo := repository.NewSessionRepo(db)
	profilRepo := repository.NewProfilRepository(db)
	followRepo := repository.NewFollowRepository(db)
	messageRepo := repository.NewMessageRepo(db)
	groupRepo := repository.NewGroupRepo(db)
	postRepo := repository.NewPostRepo(db)
	tagRepo := repository.NewTagRepo(db)
	commentRepo := repository.NewCommentRepo(db)
	notifRepo := repository.NewNotificationRepository(db)
	eventRepo := repository.NewEventRepository(db)

	// WebSocket hub (créé avant notifService qui en dépend)
	hub := ws.NewHub()
	go hub.Run()

	// Services
	userService := service.NewUserService(userRepo)
	sessionService := service.NewSessionService(sessionRepo)
	profilService := service.NewProfilService(profilRepo)
	followService := service.NewFollowService(followRepo)
	messageService := service.NewMessageService(messageRepo)
	groupService := service.NewGroupService(groupRepo)
	postService := service.NewPostAndCommentsService(postRepo, tagRepo, commentRepo)
	notifService := service.NewNotificationService(notifRepo, hub)
	eventService := service.NewEventService(eventRepo, groupRepo)

	// Handlers
	authMiddleware := middleware.NewAuthMiddleware(sessionService)
	logoutHandler := handlers.NewLogoutHandler(sessionService)
	registerHandler := handlers.NewRegisterHandler(userService)
	loginHandler := handlers.NewLoginHandler(userService, sessionService)
	usersHandler := handlers.NewUsersHandler(userService)
	profilHandler := handlers.NewProfilHandler(profilService)
	followHandler := handlers.NewFollowHandler(followService, userService, notifService)
	messageHandler := handlers.NewMessageHandler(messageService)
	groupHandler := handlers.NewGroupHandler(groupService, userService, notifService, hub)
	postHandler := handlers.NewPostAndCommentsHandler(userService, sessionService, postService, notifService, hub)
	notifHandler := handlers.NewNotificationHandler(notifService)
	eventHandler := handlers.NewEventHandler(eventService)

	pmHandler := privateMessage.NewPrivateMessageHandler(hub, messageService)
	gcHandler := groupChat.NewGroupChatHandler(hub, groupService)
	hub.OnMessage = func(c *ws.Client, raw []byte) {
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
			pmHandler.Handle(c, pm)
		case "group_message":
			var gm model.GroupMessage
			if err := json.Unmarshal(envelope.Data, &gm); err != nil {
				return
			}
			gcHandler.Handle(c, gm)
		}
	}

	// ServeMux pour les routes classiques
	mux := http.NewServeMux()
	mux.HandleFunc("/", handlers.HomeHandler)
	mux.HandleFunc("/auth/login", loginHandler.LoginHandler)
	mux.HandleFunc("/auth/register", registerHandler.RegisterHandler)
	mux.HandleFunc("/auth/logout", logoutHandler.HandleLogout)

	mux.HandleFunc("/users", authMiddleware.RequireAuth(usersHandler.HandleUsers))
	mux.HandleFunc("/conversations", authMiddleware.RequireAuth(messageHandler.HandleConversations))
	mux.HandleFunc("/messages", authMiddleware.RequireAuth(messageHandler.HandleMessages))
	mux.HandleFunc("/group-chat", authMiddleware.RequireAuth(groupHandler.HandleGroups))
	mux.HandleFunc("/group-chat/{id}/messages", authMiddleware.RequireAuth(groupHandler.HandleGroupMessages))
	mux.HandleFunc("/group-chat/{id}/leave", authMiddleware.RequireAuth(groupHandler.HandleLeaveGroup))
	mux.HandleFunc("/group-chat/{id}/posts", authMiddleware.RequireAuth(groupHandler.HandleGroupPosts))
	mux.HandleFunc("/group-chat/{id}/posts/{postId}", authMiddleware.RequireAuth(groupHandler.HandleGroupPostDetail))
	mux.HandleFunc("/group-chat/{id}/posts/{postId}/like", authMiddleware.RequireAuth(groupHandler.HandleGroupPostLike))
	mux.HandleFunc("/group-chat/{id}/posts/{postId}/comments", authMiddleware.RequireAuth(groupHandler.HandleGroupPostComments))
	mux.HandleFunc("/group-chat/{id}/posts/{postId}/comments/{commentId}", authMiddleware.RequireAuth(groupHandler.HandleGroupCommentDelete))
	mux.HandleFunc("/test", authMiddleware.RequireAuth(handlers.TestAuthHandler))
	mux.HandleFunc("/posts", authMiddleware.RequireAuth(postHandler.PostAndCommentsHandler))
	mux.HandleFunc("/group-chat/{id}/members", authMiddleware.RequireAuth(groupHandler.HandleGroupMembers))
	mux.HandleFunc("/notifications", authMiddleware.RequireAuth(notifHandler.HandleNotifications))
	mux.HandleFunc("/notifications/read", authMiddleware.RequireAuth(notifHandler.HandleMarkAllRead))
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
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

		userIDStr, err := sessionService.GetUserID(token)
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
	})

	r := router.NewRouter(mux, profilHandler, followHandler, postHandler, notifHandler, eventHandler, authMiddleware)

	fmt.Println("Démarrage sur http://localhost:5090")
	log.Fatal(http.ListenAndServe(":5090", r))
}
