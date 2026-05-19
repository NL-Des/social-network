package router

import (
	"net/http"

	"social-network/backend/internal/handlers"
	"social-network/backend/internal/middleware"

	"github.com/gorilla/mux"
)

func NewRouter(serverMux *http.ServeMux, profilHandler *handlers.ProfilHandler, auth *middleware.AuthMiddleware) http.Handler {

	router := mux.NewRouter()

	// Routes profil
	router.Handle("/users/{id}/profile",
		auth.RequireAuth(http.HandlerFunc(profilHandler.GetProfile)),
	).Methods("GET")

	router.Handle("/me/profile",
		auth.RequireAuth(http.HandlerFunc(profilHandler.GetMyProfile)),
	).Methods("GET")

	// Toutes les autres routes : ServeMux
	router.PathPrefix("/").Handler(serverMux)

	return router
}
