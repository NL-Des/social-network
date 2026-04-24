package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/backend/internal/service"
)

type LogoutHandler struct {
	SessionService *service.SessionService
}

func NewLogoutHandler(ss *service.SessionService) *LogoutHandler {
	return &LogoutHandler{SessionService: ss}
}

func (h *LogoutHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("session_token")
	if err == nil {
		//suppression côté db
		h.SessionService.DeleteSession(cookie.Value)
	}

	// envoi d'un cookie vide pour suppression côté client
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{
		"success": true,
	})
}
