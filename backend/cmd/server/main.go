package main

import (
	"fmt"
	"log"
	"net/http"
	"social-network/backend/internal/database"
	"social-network/backend/internal/handlers"
	"social-network/backend/internal/middleware"
	"social-network/backend/internal/repository"
	"social-network/backend/internal/service"
	ws "social-network/backend/internal/websocket"
)

func main() {

	// Gestion serveur.
	// db, err := database.DbOrchestrationDev()
	db, err := database.DbOrchestration()
	if err != nil {
		log.Println("Error with DB", err)
	}
	// Test de confirmation de la connection avec la BDD, en comptant le nombre de tables.
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

	// **
	// Déclarations temporaires dans le main pour test - Creéation de login et register Handlers
	userRepo := repository.NewUserRepo(db)
	sessionRepo := repository.NewSessionRepo(db)
	userService := service.NewUserService(userRepo)
	sessionService := service.NewSessionService(sessionRepo)
	profileService := service.NewProfileService(userService)
	logoutHandler := handlers.NewLogoutHandler(sessionService)
	registerHandler := handlers.NewRegisterHandler(userService)
	loginHandler := handlers.NewLoginHandler(userService, sessionService)
	meHandler := handlers.NewMeHandler(profileService)
	usersHandler := handlers.NewUsersHandler(userService)
	authMiddleware := middleware.NewAuthMiddleware(sessionService)
	// **

	// WebSocket hub
	hub := ws.NewHub()
	go hub.Run()

	// creation du mux
	mux := http.NewServeMux()
	// Route principale
	mux.HandleFunc("/", handlers.HomeHandler)
	mux.HandleFunc("/auth/login", loginHandler.LoginHandler)
	mux.HandleFunc("/auth/register", registerHandler.RegisterHandler)
	mux.HandleFunc("/auth/logout", logoutHandler.HandleLogout)

	// Routes protégées
	mux.HandleFunc("/user/me", authMiddleware.RequireAuth(meHandler.HandleMe))
	mux.HandleFunc("/users", authMiddleware.RequireAuth(usersHandler.HandleUsers))
	mux.HandleFunc("/user/profile", authMiddleware.RequireAuth(meHandler.HandleProfile))
	mux.HandleFunc("/test", authMiddleware.RequireAuth(handlers.TestAuthHandler))
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

		userID, err := sessionService.GetUserID(token)
		if err != nil {
			http.Error(w, "Session invalide", http.StatusUnauthorized)
			return
		}

		ws.ServeWs(hub, w, r, int64(userID))
	})

	// Démarrer le serveur
	fmt.Println("Démarrage sur http://localhost:5090")
	// log fatal permet d'envoyer le message d'erreur avant de fermer le programme avec un fmt.print classique pas d'arret du programme
	log.Fatal(http.ListenAndServe(":5090", mux))
}
