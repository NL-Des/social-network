package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

func DbOrchestrationDev() (*sql.DB, error) {
	// Configuration (À mettre dans un .env plus tard)
	host := "localhost" // Ou "postgres-db" si Go tourne aussi dans Docker
	port := 5432
	user := "myuser"
	password := "mypassword"
	dbname := "mydatabase"
	sslmode := "disable"

	// 1. Construction de la chaîne de connexion (DSN)
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	// 2. Ouverture de la connexion
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("impossible d'ouvrir la connexion : %v", err)
	}

	// 3. Tentative de connexion avec "Retry"
	// Parfois Go démarre plus vite que le conteneur Postgres
	log.Println("Tentative de connexion à la base de données...")

	for i := 0; i < 5; i++ {
		err = db.Ping()
		if err == nil {
			log.Println("✅ Connexion à la DB réussie !")
			return db, nil
		}
		log.Printf("⏳ Attente de la DB... essai %d/5", i+1)
		time.Sleep(2 * time.Second)
	}

	return nil, fmt.Errorf("la DB n'a pas répondu après plusieurs essais : %v", err)
}
