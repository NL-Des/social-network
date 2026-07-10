package service

import (
	"errors"
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
	"strings"
	"time"

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
			return errors.New("email déjà utilisé")
		}
		if field == "username" {
			return errors.New("username déjà utilisé")
		}
	}

	// 3. Vérification de la date et mise en forme pour la BDD.
	date, err := time.Parse("02/01/2006", user.Birthday)
	if err != nil {
		return errors.New("date invalide, veuillez entrer le format suivant : jour/mois/année")
	}
	user.Birthday = date.Format("2006-01-02")

	// 4. hash du mot de passe
	hashedPassword, err := s.hashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	// 5. sauvegarde en db
	return s.userRepo.SaveUser(user)
}

// Vérification || Email et passeword non vides.
// Password et confirmPassword identiques.
func (s *UserService) validateUserData(user model.RegisterUser) (model.RegisterUser, error) {
	if user.Email == "" || user.Password == "" {
		err := errors.New("email ou mot de passe vide")
		return model.RegisterUser{}, err
	}

	if user.Password != user.ConfirmPassword {
		err := errors.New("les mots de passe ne sont pas identiques")
		return model.RegisterUser{}, err
	}

	validUser := user
	validUser.Username = strings.TrimSpace(user.Username)

	if validUser.Username == "" {
		validUser.Username = strings.TrimSpace(user.FirstName + "." + user.Name)
	}

	// Doit rester cohérent avec la contrainte SQL users_pseudo_check
	// (length(trim(pseudo)) >= 3 AND length(pseudo) <= 30).
	runes := []rune(validUser.Username)
	if len(runes) < 3 {
		return model.RegisterUser{}, errors.New("le pseudo doit contenir au moins 3 caractères")
	}
	if len(runes) > 30 {
		validUser.Username = string(runes[:30])
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

// USERS LIST

func (s *UserService) GetAllUsers(currentUserID int) ([]model.UserListItem, error) {
	return s.userRepo.GetAllUsers(currentUserID)
}

// LOGIN

func (s *UserService) Login(email, password string) (model.LoginUser, error) {
	// Récupération des credentials enregistrés
	user, err := s.userRepo.GetUserCredsbyEmail(email)
	if err != nil {
		return model.LoginUser{}, err
	}

	// Comparaison des mots de passe hashés
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return model.LoginUser{}, errors.New("mot de passe incorrect")
	}

	return user, nil
}

func (s *UserService) CheckPassword(userID int, password string) error {
	hash, err := s.userRepo.GetPasswordHashByID(userID)
	if err != nil {
		return errors.New("utilisateur introuvable")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err != nil {
		return errors.New("mot de passe incorrect")
	}
	return nil
}
