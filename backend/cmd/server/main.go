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
	authMiddleware := middleware.NewAuthMiddleware(sessionService)
	// **

	// creation du mux
	mux := http.NewServeMux()
	// Route principale
	mux.HandleFunc("/", handlers.HomeHandler)
	// Intégration du middleware ErrorHandler autour des handlers adaptés
	mux.HandleFunc("/auth/login", middleware.ErrorHandler(loginHandler.LoginHandler))
	mux.HandleFunc("/auth/register", middleware.ErrorHandler(registerHandler.RegisterHandler))
	mux.HandleFunc("/auth/logout", middleware.ErrorHandler(logoutHandler.HandleLogout))

	// Routes protégées : L'ErrorHandler englobe le package complet (Auth + Handler)
	mux.HandleFunc("/user/me", middleware.ErrorHandler(authMiddleware.RequireAuth(meHandler.HandleMe)))
	mux.HandleFunc("/user/profile", middleware.ErrorHandler(authMiddleware.RequireAuth(meHandler.HandleProfile)))
	mux.HandleFunc("/test", middleware.ErrorHandler(authMiddleware.RequireAuth(handlers.TestAuthHandler)))

	// Démarrer le serveur
	fmt.Println("Démarrage sur http://localhost:5090")
	// log fatal permet d'envoyer le message d'erreur avant de fermer le programme avec un fmt.print classique pas d'arret du programme
	log.Fatal(http.ListenAndServe(":5090", mux))
}
