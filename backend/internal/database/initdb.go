package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	migrate "github.com/rubenv/sql-migrate"
)

func DbOrchestration() (*sql.DB, error) {
	// Paramètres de connexions, à mettre dans le .env une fois le développement fini.
	host := "localhost"
	port := 5432
	user := "myuser"
	password := "mypassword"
	dbname := "mydatabase"
	sslmode := "disable"

	// Concaténation des informations de connexions.
	stringOfConnection := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	// Envoi des informations de connexions à la BDD.
	db, err := sql.Open("postgres", stringOfConnection)
	if err != nil {
		log.Fatalln("Error connexion to BDD : %w", err)
	}

	// Tentative de connexion à la BDD.
	err = db.Ping()
	// Si la tentative de connexion ne fonctionne pas, cela veut dire que la BDD n'existe pas.
	// Le conteneur Docker contient une BDD postgre préconfigurée, c'est à elle que nous allons
	// tenter de nous connecter pour ensuite créer notre propre base de donnée. Il semblerait que
	// soit une obligation dans le processus de création.
	if err != nil {
		log.Println("La base de données n'existe pas. Création de la BDD en cours...")
		// Création de la BDD.
		createDatabaseIfNotExists(user, password, host, port, dbname)
		// Reconnexion après construction de la BDD.
		db, _ = sql.Open("postgres", stringOfConnection)
	}

	// Lancement des migrations, même si la BDD existait déjà.
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

// Fonction pour appliquer les migrations via le package sql-migrate.
func applyMigrations(db *sql.DB) (int, error) {
	migrations := &migrate.FileMigrationSource{
		Dir: "internal/database/migrations/postgresql",
	}

	// migrate.Up appliquera uniquement les fichiers .sql qui n'ont pas encore été exécutés
	return migrate.Exec(db, "postgres", migrations, migrate.Up)
}

// Si la BDD n'existe pas, création.
func createDatabaseIfNotExists(user, password, host string, port int, dbname string) {
	// Connexion à la BDD pour pouvoir la créer.
	stringOfConnectionToPostgreDb := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=postgres sslmode=disable", host, port, user, password)
	db, err := sql.Open("postgres", stringOfConnectionToPostgreDb)
	if err != nil {
		log.Fatalln("Impossible to connect to the DB during the processus of creation of the DB : %w", err)
	}
	defer db.Close()

	// Création de la BDD.
	_, err = db.Exec(fmt.Sprintf("Creation of Database with the following name : %s", dbname))
	if err != nil {
		log.Fatalln("Impossible to create DB : %w", err)
	}
}
