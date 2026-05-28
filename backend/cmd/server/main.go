package main

import (
	"fmt"
	"log"
	"net/http"
	"social-network/backend/internal/database"
	"social-network/backend/internal/handlers"
	"social-network/backend/internal/middleware"
	"social-network/backend/internal/repository"
	"social-network/backend/internal/router"
	"social-network/backend/internal/service"
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
	profileRepo := repository.NewProfilRepository(db)
	profileService := service.NewProfilService(profileRepo)
	profileHandler := handlers.NewProfilHandler(profileService)
	logoutHandler := handlers.NewLogoutHandler(sessionService)
	registerHandler := handlers.NewRegisterHandler(userService)
	loginHandler := handlers.NewLoginHandler(userService, sessionService)
	authMiddleware := middleware.NewAuthMiddleware(sessionService)
	followRepo := repository.NewFollowRepository(db)
	followService := service.NewFollowService(followRepo)
	followHandler := handlers.NewFollowHandler(followService)
	// **

	// creation du mux
	mux := http.NewServeMux()
	// Route principale
	mux.HandleFunc("/", handlers.HomeHandler)
	mux.HandleFunc("/auth/login", loginHandler.LoginHandler)
	mux.HandleFunc("/auth/register", registerHandler.RegisterHandler)
	mux.HandleFunc("/auth/logout", logoutHandler.HandleLogout)

	// Routes protégées
	mux.HandleFunc("/test", authMiddleware.RequireAuth(handlers.TestAuthHandler))

	r := router.NewRouter(mux, profileHandler, followHandler, authMiddleware)

	// Démarrer le serveur
	fmt.Println("Démarrage sur http://localhost:3000")
	// log fatal permet d'envoyer le message d'erreur avant de fermer le programme avec un fmt.print classique pas d'arret du programme
	log.Fatal(http.ListenAndServe(":5090", r))
}
