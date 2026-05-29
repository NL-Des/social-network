package router

import (
	"net/http"

	"social-network/backend/internal/handlers"
	"social-network/backend/internal/middleware"

	"github.com/gorilla/mux"
)

func NewRouter(serverMux *http.ServeMux, profilHandler *handlers.ProfilHandler, followHandler *handlers.FollowHandler, auth *middleware.AuthMiddleware) http.Handler {
	router := mux.NewRouter()

	router.Handle("/users/{id}/profile",
		auth.RequireAuth(http.HandlerFunc(profilHandler.GetProfile)),
	).Methods("GET")

	router.Handle("/me/profile",
		auth.RequireAuth(http.HandlerFunc(profilHandler.GetMyProfile)),
	).Methods("GET")

	router.Handle("/me/profile/visibility",
		auth.RequireAuth(http.HandlerFunc(profilHandler.UpdateVisibility)),
	).Methods("PATCH")

	router.Handle("/users/{id}/follow",
		auth.RequireAuth(http.HandlerFunc(followHandler.Follow)),
	).Methods("POST")

	router.Handle("/users/{id}/follow",
		auth.RequireAuth(http.HandlerFunc(followHandler.Unfollow)),
	).Methods("DELETE")

	// Toutes les autres routes : ServeMux
	router.PathPrefix("/").Handler(serverMux)

	return router
}
