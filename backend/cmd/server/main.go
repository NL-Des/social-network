package main

import (
	"log"
	"net/http"

	"social-network/backend/internal/database"
	"social-network/backend/internal/handlers"
	"social-network/backend/internal/middleware"
	"social-network/backend/internal/repository"
	"social-network/backend/internal/router"
	"social-network/backend/internal/service"
	ws "social-network/backend/internal/websocket"
	groupChat "social-network/backend/internal/websocket/modules/groupChat"
	"social-network/backend/internal/websocket/modules/privateMessage"
)

func main() {
	db, err := database.DbOrchestration()
	if err != nil {
		log.Println("Error with DB", err)
	}
	if db != nil {
		var tableCount int
		if err = db.QueryRow("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'").Scan(&tableCount); err == nil {
			log.Printf("La base de données contient actuellement %d tables.", tableCount)
		}
	}

	// ── Repositories ─────────────────────────────────────────────────────────
	userRepo      := repository.NewUserRepo(db)
	sessionRepo   := repository.NewSessionRepo(db)
	profilRepo    := repository.NewProfilRepository(db)
	followRepo    := repository.NewFollowRepository(db)
	messageRepo   := repository.NewMessageRepo(db)
	groupRepo     := repository.NewGroupRepo(db)
	chatGroupRepo := repository.NewChatGroupRepo(db)
	postRepo      := repository.NewPostRepo(db)
	tagRepo       := repository.NewTagRepo(db)
	commentRepo   := repository.NewCommentRepo(db)
	notifRepo     := repository.NewNotificationRepository(db)
	eventRepo     := repository.NewEventRepository(db)

	// ── WebSocket hub ─────────────────────────────────────────────────────────
	hub := ws.NewHub()
	go hub.Run()

	// ── Services ──────────────────────────────────────────────────────────────
	userService      := service.NewUserService(userRepo)
	sessionService   := service.NewSessionService(sessionRepo)
	profilService    := service.NewProfilService(profilRepo)
	followService    := service.NewFollowService(followRepo)
	messageService   := service.NewMessageService(messageRepo, followRepo)
	groupService     := service.NewGroupService(groupRepo)
	chatGroupService := service.NewChatGroupService(chatGroupRepo)
	postService      := service.NewPostAndCommentsService(postRepo, tagRepo, commentRepo)
	notifService     := service.NewNotificationService(notifRepo, hub)
	eventService     := service.NewEventService(eventRepo, groupRepo, notifService)

	// ── Handlers ──────────────────────────────────────────────────────────────
	auth := middleware.NewAuthMiddleware(sessionService)

	r := router.NewRouter(router.Deps{
		Auth:      auth,
		Session:   sessionService,
		Hub:       hub,
		Login:     handlers.NewLoginHandler(userService, sessionService),
		Register:  handlers.NewRegisterHandler(userService),
		Logout:    handlers.NewLogoutHandler(sessionService),
		Users:     handlers.NewUsersHandler(userService),
		Profil:    handlers.NewProfilHandler(profilService),
		Follow:    handlers.NewFollowHandler(followService, userService, notifService),
		Message:   handlers.NewMessageHandler(messageService),
		Group:     handlers.NewGroupHandler(groupService, chatGroupService, userService, notifService, hub),
		ChatGroup: handlers.NewChatGroupHandler(chatGroupService, userService, notifService, hub),
		Post:      handlers.NewPostAndCommentsHandler(userService, sessionService, postService, notifService, hub),
		Notif:     handlers.NewNotificationHandler(notifService),
		Event:     handlers.NewEventHandler(eventService),
		PmHandler: privateMessage.NewPrivateMessageHandler(hub, messageService, userService, notifService),
		GcHandler: groupChat.NewGroupChatHandler(hub, chatGroupService),
	})

	log.Fatal(http.ListenAndServe(":5090", r))
}
