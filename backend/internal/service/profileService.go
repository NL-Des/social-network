package service

import (
	"errors"
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type ProfilService struct {
	ProfilRepo *repository.ProfilRepository
}

func NewProfilService(repo *repository.ProfilRepository) *ProfilService {
	return &ProfilService{ProfilRepo: repo}
}

func (s *ProfilService) GetProfile(viewerID, profileID int) (*model.PublicProfile, error) {

	user, err := s.ProfilRepo.GetUserByID(profileID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	isOwner := viewerID == profileID

	// Si ce n'est pas son profil et que le compte est privé : interdit
	if !isOwner && user.IsPrivate {
		return nil, errors.New("profile is private")
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
