package middleware

import (
	"context"
	"net/http"
	appErrors "social-network/backend/internal/errors"
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
func (m *AuthMiddleware) RequireAuth(next AppHandler) AppHandler {
	return func(w http.ResponseWriter, r *http.Request) error {
		cookie, err := r.Cookie("session_token")
		if err != nil {
			// Au lieu de faire un http.Error brut, on retourne notre AppError !
			return appErrors.New(appErrors.CodeUnauthorized, "Accès refusé : session introuvable ou expirée", err)
		}

		userID, err := m.SessionService.GetUserID(cookie.Value)
		if err != nil {
			return appErrors.New(appErrors.CodeUnauthorized, "Session invalide ou expirée", err)
		}

		ctx := context.WithValue(r.Context(), "userID", userID)
		next(w, r.WithContext(ctx))

		return nil
	}
}
