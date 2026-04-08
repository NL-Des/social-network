package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func DbOrchestration() (*sql.DB, error) {
	var db *sql.DB
	var err error
	// Les variables qui suivent seront à remplir avec les futures données du .env.
	// pathDB := "./backend/internal/database/database.sql"
	pathCreateDB := "./backend/internal/database/001_createtable.sql"
	login := "myuser"
	password := "mypassword"
	nameDatabase := "mydatabase"
	sslmode := "disable"

	// Vérification des chemins BDD et de créations de tables.
	resultPathCreateDB := pathToTheFileToCreateTheTables(pathCreateDB)
	resultPathDB := doesTheDBExist(login, password, nameDatabase, sslmode)

	if resultPathCreateDB && resultPathDB {
		log.Println("DB already existing.")
		log.Println("Initialisation of DB")
		db = connexionToTheDB(login, password, nameDatabase, sslmode)
		log.Println("Connection to the DB")
		verficationConnexion(db)
		log.Println("DB launch")
	} else if resultPathCreateDB && resultPathDB == false {
		log.Println("DB doesn't exist.")
		log.Println("Creating DB.")
		db = connexionToTheDB(login, password, nameDatabase, sslmode)
		createDB(pathCreateDB, db)
		log.Println("Initialisation of DB")
		verficationConnexion(db)
		log.Println("Connection to the DB")
		log.Println("DB launch")
	}
	return db, err
}

// Vérification, si le chemin vers le fichier de création des tables est bon.
func pathToTheFileToCreateTheTables(pathCreateDB string) bool {
	testIfFileToCreateDBExist, err := os.Stat(pathCreateDB)
	if err != nil {
		// Vérification, si le fichier de création de la BDD existe.
		if testIfFileToCreateDBExist == nil {
			log.Println("Error with variable testIfFileToCreateDBExist, file to create db doesn't exist")
		}
		log.Fatalln("Error with variable testIfDBExist for the file to create tables(001_createtable.sql) : ", err)
	}
	return true
}

// Vérification, si la BDD existe.
func doesTheDBExist(login string, password string, nameDatabase string, sslmode string) bool {
	// Tentative de connexion.
	connexionString := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=%s", login, password, nameDatabase, sslmode)
	db, err := sql.Open("postgres", connexionString)
	if err != nil {
		return false
	}
	defer db.Close()
	// Si la connexion est détectée, on vérifie que la BDD est réellement accessible ou non dysfonctionnelle.
	err = db.Ping()
	if err != nil {
		return false
	}
	return true
}

// Création de la BDD.
func createDB(pathCreateDB string, db *sql.DB) {
	// Lecture et chargement des tables dans createDB.
	DBCreation, err := os.ReadFile(pathCreateDB)
	if err != nil {
		log.Fatalln("Error with variable createDB for reading the file to create the DB : ", err)
	}

	// Création de la BDD.
	_, err = db.Exec(string(DBCreation))
	if err != nil {
		log.Fatalln("Error during creation of the DB : ", err)
	}
}

// AvecPostreSQL, il faut envoyer un login pour pouvoir y accèder.
// Ici, sql.Open, va vérifier si nos arguments de connections sont valides.
func connexionToTheDB(login string, password string, nameDatabase string, sslmode string) *sql.DB {
	// Construction de la chaîne de constructions.
	connexionString := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=%s", login, password, nameDatabase, sslmode)
	db, err := sql.Open("postgres", connexionString)
	if err != nil {
		log.Fatalln("Error opening to the DB :", err)
	}
	return db
}

// Vérification, si nous sommes bien connectés à la BDD.
func verficationConnexion(db *sql.DB) {
	if err := db.Ping(); err != nil {
		log.Fatalln("Error connecting to the DB : ", err)
	}
}
