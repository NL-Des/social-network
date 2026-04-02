package main

import (
	"fmt"
	"log"
	"net/http"
	"social-network/backend/internal/database"
	"social-network/backend/internal/handlers"
)

func main() {

	// Gestion serveur.
	db, err := database.DbOrchestration()
	if err != nil {
		log.Println("Error with DB")
	}
	if db != nil {
		log.Println("Test")
	}

	// creation du mux
	mux := http.NewServeMux()
	// Route principale
	mux.HandleFunc("/", handlers.HomeHandler)

	// Démarrer le serveur
	fmt.Println("Démarrage sur http://localhost:5090")
	// log fatal permet d'envoyer le message d'erreur avant de fermer le programme avec un fmt.print classique pas d'arret du programme
	log.Fatal(http.ListenAndServe(":5090", mux))
}
