package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
)

type RegisterHandler struct {
	UserService *service.UserService
}

type RegisterResponse struct {
	Sucess bool `json:"success"`
}

func NewRegisterHandler(us *service.UserService) *RegisterHandler {
	return &RegisterHandler{UserService: us}
}
func (rh *RegisterHandler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// permet aux deux serveurs de communiquer sans que le navigateur les bloque
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	fmt.Println("Requête à /registerHandler")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var user model.RegisterUser
	// On autorise par exemple 10 Mo de données
	const maxMemory = 50 << 20 // 20 * 1024 * 1024
	err := r.ParseMultipartForm(maxMemory)
	if err != nil {
		http.Error(w, "Impossible d'analyser le formulaire", http.StatusBadRequest)
		return
	}

	// Récupération du fichier image
	file, header, err := r.FormFile("profilePicture")
	if err != nil && err != http.ErrMissingFile {
		http.Error(w, "Erreur lecture image", http.StatusBadRequest)
		fmt.Println("Erreur de lecture de l'image avatar")
		return
	}
	if file != nil {
		// r.FormFile() ouvre un flux de lecture vers le fichier uploadé temporaire. Si pas fermé le flux reste ouvert jusqu'a la fin du programme
		defer file.Close()

		// Lire le contenu du fichier
		fileBytes, err := io.ReadAll(file)
		if err != nil {
			http.Error(w, "Erreur lecture fichier", http.StatusInternalServerError)
			fmt.Println("Erreur de lecture du fichier avatar")
			return
		}

		// Sauvegarder sur disque
		const UploadDir = "../public/images/profil/"
		savePath := UploadDir + header.Filename
		// os.WriteFile ecrit dans le dossier uploads qui est a la racine du dossier ou est lancer le run
		err = os.WriteFile(savePath, fileBytes, 0644)
		if err != nil {
			http.Error(w, "Erreur sauvegarde fichier", http.StatusInternalServerError)
			fmt.Println("Erreur de sauvegarde de l'avatar")
			return
		}
		user.ProfilePicture = "/images/profil/" + header.Filename
	}

	user.Name = r.FormValue("name")
	user.FirstName = r.FormValue("firstName")
	user.Birthday = r.FormValue("birthday")
	user.Email = r.FormValue("email")
	user.Password = r.FormValue("password")
	user.ConfirmPassword = r.FormValue("confirmPassword")
	user.Username = r.FormValue("userName")
	user.Description = r.FormValue("description")
	/* 	user.ProfilePicture = r.FormValue("profilePicture") */
	user.IsPrivate = true

	err = rh.UserService.Register(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := RegisterResponse{
		Sucess: true,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode((response))

}
