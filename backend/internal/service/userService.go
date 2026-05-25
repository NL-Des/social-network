package service

import (
	"errors"
	appErrors "social-network/backend/internal/errors"
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo *repository.UserRepo
}

func NewUserService(ur *repository.UserRepo) *UserService {
	return &UserService{userRepo: ur}
}

// REGISTER

func (s *UserService) Register(userData model.RegisterUser) error {
	// 1. validation des données reçues
	user, err := s.validateUserData(userData)
	if err != nil {
		return err
	}

	// 2. vérification user existe déjà
	exists, field, err := s.userRepo.UserExists(user.Email, user.Username)
	if err != nil {
		return err
	}
	if exists {
		if field == "email" {
			// On utilise CodeInvalidInput (ou un CodeConflict si tu préfères) pour bloquer proprement le front
			return appErrors.New(appErrors.CodeInvalidInput, "cet email est déjà utilisé par un autre compte", nil)
		}
		if field == "username" {
			return appErrors.New(appErrors.CodeInvalidInput, "ce nom d'utilisateur est déjà pris", nil)
		}
	}

	// 3. hash du mot de passe
	hashedPassword, err := s.hashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	// 4. sauvegarde en db
	return s.userRepo.SaveUser(user)
}

// Vérification || Email et passeword non vides.
// Password et confirmPassword identiques.

func (s *UserService) validateUserData(user model.RegisterUser) (model.RegisterUser, error) {
	if user.Email == "" || user.Password == "" {
		return model.RegisterUser{}, appErrors.New(appErrors.CodeInvalidInput, "l'email et le mot de passe ne peuvent pas être vides", nil)
	}

	if user.Password != user.ConfirmPassword {
		return model.RegisterUser{}, appErrors.New(appErrors.CodeInvalidInput, "les mots de passe saisis ne sont pas identiques", nil)
	}

	// 💡 NOUVELLE VÉRIFICATION : Sécurité du mot de passe
	var hasUpper, hasDigit bool

	// 1. Vérification de la longueur minimale
	if len(user.Password) < 8 {
		return model.RegisterUser{}, appErrors.New(appErrors.CodeInvalidInput, "le mot de passe doit contenir au moins 8 caractères", nil)
	}

	// 2. On parcourt chaque caractère pour valider les critères requis
	for _, char := range user.Password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsDigit(char):
			hasDigit = true
		}
	}

	// 3. Validation des flags de sécurité
	if !hasUpper {
		return model.RegisterUser{}, appErrors.New(appErrors.CodeInvalidInput, "le mot de passe doit contenir au moins une lettre majuscule", nil)
	}
	if !hasDigit {
		return model.RegisterUser{}, appErrors.New(appErrors.CodeInvalidInput, "le mot de passe doit contenir au moins un chiffre", nil)
	}

	// Fin de la vérification de sécurité

	validUser := user

	if user.Username == "" {
		username := user.FirstName + "." + user.Name
		validUser.Username = username
	}
	return validUser, nil
}

func (s *UserService) hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// PROFILE

func (s *UserService) GetProfile(id int) (model.MeResponse, error) {
	return s.userRepo.GetProfileByID(id)
}

func (s *UserService) GetFullProfile(id int) (model.FullProfile, error) {
	return s.userRepo.GetFullProfileByID(id)
}

// LOGIN

func (s *UserService) Login(email, password string) (model.LoginUser, error) {
	// Récupération des credentials enregistrés
	user, err := s.userRepo.GetUserCredsbyEmail(email)
	if err != nil {
		// Si le repo a renvoyé CodeNotFound (email inconnu), on intercepte pour ne pas donner d'indice aux hackers
		var appErr *appErrors.AppError
		if errors.As(err, &appErr) && appErr.Code == appErrors.CodeNotFound {
			return model.LoginUser{}, appErrors.New(appErrors.CodeUnauthorized, "identifiants incorrects", nil)
		}
		return model.LoginUser{}, err
	}

	// Comparaison des mots de passe hashés
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		// Le mot de passe est faux -> 401 Unauthorized uniforme
		return model.LoginUser{}, appErrors.New(appErrors.CodeUnauthorized, "identifiants incorrects", nil)
	}

	return user, nil
}
