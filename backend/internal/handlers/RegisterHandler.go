package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"

	appErrors "social-network/backend/internal/errors"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
)

type RegisterHandler struct {
	UserService *service.UserService
}

func NewRegisterHandler(us *service.UserService) *RegisterHandler {
	return &RegisterHandler{UserService: us}
}

func (rh *RegisterHandler) RegisterHandler(w http.ResponseWriter, r *http.Request) error {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return nil
	}

	var user model.RegisterUser

	// Traitement multipart (si présent)
	err := r.ParseMultipartForm(10 << 20)
	if err == nil {
		file, header, fileErr := r.FormFile("profilePicture")
		if fileErr == nil {
			defer file.Close()
			fileBytes, readErr := io.ReadAll(file)
			if readErr != nil {
				return appErrors.New(appErrors.CodeInternal, "Erreur lors de la lecture de l'avatar", readErr)
			}

			const UploadDir = "../public/images/profil/"
			savePath := UploadDir + header.Filename
			writeErr := os.WriteFile(savePath, fileBytes, 0644)
			if writeErr != nil {
				return appErrors.New(appErrors.CodeInternal, "Erreur de stockage physique de l'avatar", writeErr)
			}
			user.ProfilePicture = savePath
		}

		user.Name = r.FormValue("name")
		user.FirstName = r.FormValue("firstName")
		user.Birthday = r.FormValue("birthday")
		user.Email = r.FormValue("email")
		user.Password = r.FormValue("password")
		user.ConfirmPassword = r.FormValue("confirmPassword")
		user.Username = r.FormValue("userName")
		user.Description = r.FormValue("description")
	} else {
		// Alternative si c'est du JSON brut sans fichier
		if decodeErr := json.NewDecoder(r.Body).Decode(&user); decodeErr != nil {
			return appErrors.New(appErrors.CodeInvalidInput, "JSON invalide", decodeErr)
		}
	}

	// Appel du service (renvoie des AppError typées de validation ou de conflit)
	err = rh.UserService.Register(user)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]bool{"success": true})
	return nil
}
