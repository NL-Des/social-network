package handlers

import (
	"net/http"
	appErrors "social-network/backend/internal/errors"
	"social-network/backend/internal/service"
)

type LogoutHandler struct {
	SessionService *service.SessionService
}

func NewLogoutHandler(ss *service.SessionService) *LogoutHandler {
	return &LogoutHandler{SessionService: ss}
}

func (h *LogoutHandler) HandleLogout(w http.ResponseWriter, r *http.Request) error {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return nil
	}

	cookie, err := r.Cookie("session_token")
	if err == nil {
		// Tentative de suppression en base de données
		err = h.SessionService.DeleteSession(cookie.Value)
		if err != nil {
			return appErrors.New(
				appErrors.CodeInternal,
				"Impossible de fermer la session côté serveur",
				err,
			)
		}
	}

	// On ne supprime le cookie du navigateur QUE si la DB a validé (ou s'il n'y avait pas de cookie)
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"success":true}`))
	return nil
}
