package middleware

import (
	"context"
	"net/http"
	"social-network/backend/internal/service"
)

type AuthMiddleware struct {
	SessionService *service.SessionService
}

func NewAuthMiddleware(ss *service.SessionService) *AuthMiddleware {
	return &AuthMiddleware{SessionService: ss}
}

// Middleware d'authentification.
// Récupère le cookie, vérifie l'existence/validité d'une session et renvoie userID dans le contexte.
// Pour l'instant, bloque la requête si non authentifié, modifiable facilement.
func (m *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_id")
		if err != nil {
			http.Error(w, "Non authentifié", http.StatusUnauthorized)
			return
		}

		userID, err := m.SessionService.GetUserID(cookie.Value)
		if err != nil {
			http.Error(w, "Session invalide", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "userID", userID)
		next(w, r.WithContext(ctx))
	}
}
