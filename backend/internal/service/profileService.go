package service

import (
	"database/sql"
	"errors"
	"log"
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
	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	isOwner := viewerID == profileID

	// Si ce n'est pas son profil et que le compte est privé : interdit
	if !isOwner && user.IsPrivate {
		isFollower, err := s.ProfilRepo.IsFollower(viewerID, profileID)
		if err != nil {
			return nil, err
		}
		if !isFollower {
			return nil, ErrProfilePrivate
		}
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
		IsPrivate:   user.IsPrivate,
		CanEdit:     isOwner,
	}

	// Followers / Following / Posts
	followers, err := s.ProfilRepo.GetFollowers(profileID)
	if err != nil {
		log.Printf("GetFollowers(%d): %v", profileID, err)
		followers = []model.Follower{}
	}
	profile.Followers = followers

	following, err := s.ProfilRepo.GetFollowing(profileID)
	if err != nil {
		log.Printf("GetFollowing(%d): %v", profileID, err)
		following = []model.Following{}
	}
	profile.Following = following

	posts, err := s.ProfilRepo.GetPosts(profileID)
	if err != nil {
		log.Printf("GetPosts(%d): %v", profileID, err)
		posts = []model.AllPosts{}
	}
	profile.Posts = posts

	return profile, nil
}
