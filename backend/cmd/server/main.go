package main

import (
	"fmt"
	"log"
	"net/http"
	"social-network/backend/internal/database"
	"social-network/backend/internal/handlers"
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
	// Déclarations temporaires pour test - Creéation de login et register Handlers
	userRepo := repository.NewUserRepo(db)
	userService := service.NewUserService(userRepo)
	registerHandler := handlers.NewRegisterHandler(userService)
	loginHandler := handlers.NewLoginHandler(userService)
	// **

	// creation du mux
	mux := http.NewServeMux()
	// Route principale
	mux.HandleFunc("/", handlers.HomeHandler)
	mux.HandleFunc("/auth/login", loginHandler.LoginHandler)
	mux.HandleFunc("/auth/register", registerHandler.RegisterHandler)

	// Démarrer le serveur
	fmt.Println("Démarrage sur http://localhost:5090")
	// log fatal permet d'envoyer le message d'erreur avant de fermer le programme avec un fmt.print classique pas d'arret du programme
	log.Fatal(http.ListenAndServe(":5090", mux))
}
