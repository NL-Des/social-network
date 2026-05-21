package middleware

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	appErrors "social-network/backend/internal/errors"
)

// AppHandler est notre signature personnalisée permettant aux handlers de propager l'erreur
type AppHandler func(w http.ResponseWriter, r *http.Request) error

// ErrorHandler intercepte les erreurs et centralise les en-têtes CORS
func ErrorHandler(next AppHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Gestion universelle du CORS
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Exécution du handler
		err := next(w, r)
		if err != nil {
			// Log système côté serveur pour le debugging
			log.Printf("[ERROR] %s %s -> %v", r.Method, r.URL.Path, err)

			w.Header().Set("Content-Type", "application/json")

			// Détection d'une erreur personnalisée AppError
			var appErr *appErrors.AppError
			if errors.As(err, &appErr) {
				// Traduction du code interne métier en code HTTP Standard
				statusCode := http.StatusInternalServerError
				switch appErr.Code {
				case appErrors.CodeInvalidInput:
					statusCode = http.StatusBadRequest
				case appErrors.CodeUnauthorized:
					statusCode = http.StatusUnauthorized
				case appErrors.CodeForbidden:
					statusCode = http.StatusForbidden
				case appErrors.CodeNotFound:
					statusCode = http.StatusNotFound
				case appErrors.CodeInternal:
					statusCode = http.StatusInternalServerError
				}

				w.WriteHeader(statusCode)
				_ = json.NewEncoder(w).Encode(appErr)
				return
			}

			// Gestion des erreurs natives Go (ex: sql.ErrNoRows non capturé)
			if errors.Is(err, sql.ErrNoRows) {
				w.WriteHeader(http.StatusNotFound)
				_ = json.NewEncoder(w).Encode(map[string]string{
					"code":    appErrors.CodeNotFound,
					"message": "La ressource demandée est introuvable.",
				})
				return
			}

			// Erreur brute inattendue (Sécurité : on masque la technique au client front)
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"code":    appErrors.CodeInternal,
				"message": "Une erreur interne du serveur est survenue.",
			})
		}
	}
}
