package errors

import "fmt"

// 1. Définition des codes internes indépendants de HTTP
const (
	CodeNotFound     = "NOT_FOUND"
	CodeForbidden    = "FORBIDDEN"
	CodeInvalidInput = "INVALID_INPUT"
	CodeInternal     = "INTERNAL"
)

// 2. Structure pour stocker les erreurs de validation de formulaires
type ValidationErrorDetail struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// 3. Notre structure d'erreur globale
type AppError struct {
	Code    string                  `json:"code"`
	Message string                  `json:"message"`
	Err     error                   `json:"-"` // Masqué dans le JSON envoyé au Front
	Errors  []ValidationErrorDetail `json:"errors,omitempty"`
}

// Implémentation de l'interface native 'error' de Go
func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// Permet d'utiliser errors.Unwrap, errors.Is, errors.As
func (e *AppError) Unwrap() error {
	return e.Err
}

// 4. Les constructeurs (Helpers) pour instancier nos erreurs
func New(code, message string, err error) *AppError {
	return &AppError{Code: code, Message: message, Err: err}
}

func NewValidation(message string, details []ValidationErrorDetail) *AppError {
	return &AppError{Code: CodeInvalidInput, Message: message, Errors: details}
}
