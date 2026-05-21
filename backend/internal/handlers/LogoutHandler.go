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

func (h *LogoutHandler) HandleLogout(w http.ResponseWriter, r *http.Request) error {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return nil
	}

	cookie, err := r.Cookie("session_token")
	if err == nil {
		_ = h.SessionService.DeleteSession(cookie.Value)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]bool{"success": true})
	return nil
}
