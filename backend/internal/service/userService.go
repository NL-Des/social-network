package service

import (
	"errors"
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo *repository.UserRepo
}

func NewUserService(ur *repository.UserRepo) *UserService {
	return &UserService{userRepo: ur}
}

// REGISTER

func (s *UserService) Register(user model.RegisterUser) error {
	// 1. validation des données reçues
	if err := s.validateUserData(user); err != nil {
		return err
	}

	// 2. vérification user existe déjà
	exists, field, err := s.userRepo.UserExists(user.Email, user.Username)
	if err != nil {
		return err
	}
	if exists {
		if field == "email" {
			return errors.New("email already used")
		}
		if field == "username" {
			return errors.New("username already used")
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
func (s *UserService) validateUserData(user model.RegisterUser) error {
	if user.Email == "" || user.Password == "" {
		return errors.New("empty email or password")
	}

	if user.Password != user.ConfirmPassword {
		return errors.New("different passwords")
	}
	return nil
}

func (s *UserService) hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
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
		return model.LoginUser{}, errors.New("invalid password")
	}

	return user, nil
}
