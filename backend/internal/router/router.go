package router

import (
	"net/http"

	"social-network/backend/internal/handlers"
	"social-network/backend/internal/middleware"

	"github.com/gorilla/mux"
)

func NewRouter(serverMux *http.ServeMux, profilHandler *handlers.ProfilHandler, followHandler *handlers.FollowHandler, postHandler *handlers.PostAndCommentsHandler, notifHandler *handlers.NotificationHandler, auth *middleware.AuthMiddleware) http.Handler {

	router := mux.NewRouter()

	// Routes profil
	router.Handle("/users/{id}/profile",
		auth.RequireAuth(http.HandlerFunc(profilHandler.GetProfile)),
	).Methods("GET")

	router.Handle("/me/profile",
		auth.RequireAuth(http.HandlerFunc(profilHandler.GetMyProfile)),
	).Methods("GET")

	router.Handle("/me/profile",
		auth.RequireAuth(http.HandlerFunc(profilHandler.UpdateMyProfile)),
	).Methods("PUT")

	router.Handle("/me/profile/visibility",
		auth.RequireAuth(http.HandlerFunc(profilHandler.UpdateVisibility)),
	).Methods("PATCH")

	// Routes follow
	router.Handle("/users/{id}/follow",
		auth.RequireAuth(http.HandlerFunc(followHandler.Follow)),
	).Methods("POST")

	router.Handle("/users/{id}/follow",
		auth.RequireAuth(http.HandlerFunc(followHandler.Unfollow)),
	).Methods("DELETE")

	router.Handle("/users/{id}/follow/status",
		auth.RequireAuth(http.HandlerFunc(followHandler.GetFollowStatus)),
	).Methods("GET")

	router.Handle("/me/follow/requests",
		auth.RequireAuth(http.HandlerFunc(followHandler.GetPendingRequests)),
	).Methods("GET")

	router.Handle("/users/{id}/follow/accept",
		auth.RequireAuth(http.HandlerFunc(followHandler.AcceptFollowRequest)),
	).Methods("PATCH")

	router.Handle("/users/{id}/follow/reject",
		auth.RequireAuth(http.HandlerFunc(followHandler.RejectFollowRequest)),
	).Methods("DELETE")

	// Posts d'un utilisateur
	router.Handle("/users/{id}/posts",
		auth.RequireAuth(http.HandlerFunc(profilHandler.GetUserPosts)),
	).Methods("GET")

	// Like / Unlike sur un post
	router.Handle("/posts/{id}/like",
		auth.RequireAuth(http.HandlerFunc(postHandler.HandleLike)),
	).Methods("POST", "DELETE")

	// Notification par ID
	router.Handle("/notifications/{id}/read",
		auth.RequireAuth(http.HandlerFunc(notifHandler.HandleMarkRead)),
	).Methods("PATCH")

	// Toutes les autres routes : ServeMux
	router.PathPrefix("/").Handler(serverMux)

	return router
}
