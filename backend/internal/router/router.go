package router

import (
	"database/sql"
	"net/http"

	"social-network/backend/internal/handlers"
	"social-network/backend/internal/repository"
	"social-network/backend/internal/service"

	"github.com/gorilla/mux"
)

func NewRouter(serverMux *http.ServeMux, db *sql.DB) http.Handler {

	// Routeur principal PRO (Gorilla Mux)
	router := mux.NewRouter()

	// --- PROFIL : architecture propre (repo → service → handler) ---
	profilRepo := repository.NewProfilRepository(db)
	profilService := service.NewProfilService(profilRepo)
	profilHandler := handlers.NewProfilHandler(profilService)

	// Route dynamique PRO
	router.HandleFunc("/users/{id}/profile", profilHandler.GetProfile).Methods("GET")

	// Routes statiques (ServeMux de tes collègues)
	router.PathPrefix("/").Handler(serverMux)

	return router
}
