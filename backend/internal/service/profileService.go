package service

import (
	"errors"
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

var (
	ErrUserNotFound   = errors.New("user not found")
	ErrProfilePrivate = errors.New("profile is private")
)

type ProfilService struct {
	ProfilRepo *repository.ProfilRepository
}

func NewProfilService(repo *repository.ProfilRepository) *ProfilService {
	return &ProfilService{ProfilRepo: repo}
}

// Retourne un profil public en tenant compte de l'utilisateur qui le consulte :
// Si l'utilisateur consulte son propre profil : accès complet
// Si le profil est privé et que l'utilisateur n’est pas le propriétaire : accès restreint
func (s *ProfilService) GetProfile(viewerID, profileID int) (*model.PublicProfile, error) {

	// Récupération de l'utilisateur cible
	user, err := s.ProfilRepo.GetUserByID(profileID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	isOwner := viewerID == profileID

	// Si ce n'est pas son profil et que le compte est privé : interdit
	if !isOwner && user.IsPrivate {
		return nil, ErrProfilePrivate
	}

	// Construction du profil
	profile := &model.PublicProfile{
		ID:          user.ID,
		Pseudo:      user.Username,
		LastName:    user.Name,
		FirstName:   user.FirstName,
		DateOfBirth: user.Birthday,
		AboutMe:     user.Description,
		Avatar:      user.ProfilePicture,
		Followers:   []model.Follower{},
		Following:   []model.Following{},
		Posts:       []model.AllPosts{},
		CanEdit:     isOwner,
	}

	return profile, nil
}
