package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	appErrors "social-network/backend/internal/errors"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
	"time"
)

type LoginHandler struct {
	UserService    *service.UserService
	SessionService *service.SessionService
}

type LoginResponse struct {
	Success bool `json:"sucess"`
}

func NewLoginHandler(us *service.UserService, ss *service.SessionService) *LoginHandler {
	return &LoginHandler{UserService: us, SessionService: ss}
}

func (lh *LoginHandler) LoginHandler(w http.ResponseWriter, r *http.Request) error {
	fmt.Println("Requête à LoginHandler")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return nil
	}

	var credentials model.LoginUser
	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		return appErrors.New(appErrors.CodeInvalidInput, "Erreur de lecture du corps JSON", err)
	}

	//-- Vérifier credentials à la tentative de connexion --
	user, err := lh.UserService.Login(credentials.Email, credentials.Password)
	if err != nil {
		return err
	}

	//-- Générer session et créer cookie --
	token, err := lh.SessionService.CreateSession(user.ID)
	if err != nil {
		return err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().Add(24 * time.Hour),
	})

	response := LoginResponse{
		Success: true,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode((response))

	return nil
}
