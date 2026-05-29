package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"

	_ "github.com/lib/pq"
	migrate "github.com/rubenv/sql-migrate"
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func DbOrchestration() (*sql.DB, error) {
	host := getEnv("DB_HOST", "localhost")
	portStr := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "myuser")
	password := getEnv("DB_PASSWORD", "mypassword")
	dbname := getEnv("DB_NAME", "mydatabase")
	sslmode := "disable"

	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 5432
	}

	stringOfConnection := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	db, err := sql.Open("postgres", stringOfConnection)
	if err != nil {
		log.Fatalln("Error connexion to BDD : %w", err)
	}

	err = db.Ping()
	if err != nil {
		log.Println("La base de données n'existe pas. Création de la BDD en cours...")
		createDatabaseIfNotExists(user, password, host, port, dbname)
		db, _ = sql.Open("postgres", stringOfConnection)
	}

	log.Println("Vérification et application des migrations...")
	n, err := applyMigrations(db)
	if err != nil {
		log.Fatalln("Error migration : %w", err)
	}

	if n > 0 {
		log.Printf("Succès : %d nouvelles migrations appliquées.", n)
	} else {
		log.Println("Base de données déjà à jour, aucunes modifications appliquées.")
	}

	return db, err
}

func applyMigrations(db *sql.DB) (int, error) {
	migrations := &migrate.FileMigrationSource{
		Dir: "internal/database/migrations/postgresql",
	}

	return migrate.Exec(db, "postgres", migrations, migrate.Up)
}

func createDatabaseIfNotExists(user, password, host string, port int, dbname string) {
	stringOfConnectionToPostgreDb := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=postgres sslmode=disable", host, port, user, password)
	db, err := sql.Open("postgres", stringOfConnectionToPostgreDb)
	if err != nil {
		log.Fatalln("Impossible to connect to the DB during the processus of creation of the DB : %w", err)
	}
	defer db.Close()

	_, err = db.Exec(fmt.Sprintf("CREATE DATABASE %s", dbname))
	if err != nil {
		log.Fatalln("Impossible to create DB : %w", err)
	}
}
