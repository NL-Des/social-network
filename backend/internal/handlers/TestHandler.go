package handlers

import (
	"encoding/json"
	"net/http"
)

func TestAuthHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Impossible de récupérer userID", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Accès autorisé",
		"userID":  userID,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
