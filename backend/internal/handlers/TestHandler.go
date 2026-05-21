package handlers

import (
	"encoding/json"
	"net/http"

	appErrors "social-network/backend/internal/errors"
)

// TestAuthHandler respecte désormais la signature func(w, r) error
func TestAuthHandler(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		// On retourne une AppError interceptée proprement en JSON par le middleware
		return appErrors.New(
			appErrors.CodeInternal,
			"Impossible de récupérer l'identifiant utilisateur depuis la session",
			nil,
		)
	}

	response := map[string]interface{}{
		"message": "Accès autorisé",
		"userID":  userID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)

	return nil // Tout s'est bien passé
}
