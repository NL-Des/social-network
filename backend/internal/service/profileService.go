package service

import (
	"database/sql"
	"errors"
	"log"
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

var (
	ErrUserNotFound = errors.New("Utilisateur introuvable")
)

type ProfilService struct {
	ProfilRepo *repository.ProfilRepository
}

func NewProfilService(repo *repository.ProfilRepository) *ProfilService {
	return &ProfilService{ProfilRepo: repo}
}

func (s *ProfilService) GetProfile(viewerID, profileID int) (*model.PublicProfile, error) {

	user, err := s.ProfilRepo.GetUserByID(profileID)
	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	isOwner := viewerID == profileID

	// Profil privé et pas le propriétaire
	if !isOwner && user.IsPrivate {
		followStatus, err := s.ProfilRepo.GetFollowStatus(viewerID, profileID)
		if err != nil {
			return nil, err
		}

		// Pas encore accepté : infos minimales seulement
		if followStatus != "accepted" {
			return &model.PublicProfile{
				ID:           user.ID,
				Pseudo:       user.Username,
				FirstName:    user.FirstName,
				LastName:     user.Name,
				Avatar:       user.ProfilePicture,
				IsPrivate:    true,
				IsAccessible: false,
				FollowStatus: followStatus,
			}, nil
		}
	}

	// Profil accessible : construction complète
	profile := &model.PublicProfile{
		ID:           user.ID,
		Pseudo:       user.Username,
		LastName:     user.Name,
		FirstName:    user.FirstName,
		DateOfBirth:  user.Birthday,
		AboutMe:      user.Description,
		Avatar:       user.ProfilePicture,
		IsPrivate:    user.IsPrivate,
		IsAccessible: true,
		CanEdit:      isOwner,
	}
	if isOwner {
		profile.Email = user.Email
	}

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

	posts, err := s.ProfilRepo.GetPosts(profileID, viewerID)
	if err != nil {
		log.Printf("GetPosts(%d): %v", profileID, err)
		posts = []model.AllPosts{}
	}
	profile.Posts = posts

	if !isOwner {
		isFollower, err := s.ProfilRepo.IsFollower(viewerID, profileID)
		if err != nil {
			log.Printf("IsFollower(%d, %d): %v", viewerID, profileID, err)
		}
		profile.IsFollowing = isFollower
		profile.FollowStatus = "accepted"
	}

	return profile, nil
}

func (s *ProfilService) UpdateVisibility(userID int, isPrivate bool) error {
	return s.ProfilRepo.UpdateVisibility(userID, isPrivate)
}

func (s *ProfilService) GetUserPosts(userID int, viewerID int) ([]model.AllPosts, error) {
	return s.ProfilRepo.GetPosts(userID, viewerID)
}

func (s *ProfilService) UpdateProfile(userID int, firstName, lastName, pseudo, aboutMe string) error {
	return s.ProfilRepo.UpdateProfile(userID, firstName, lastName, pseudo, aboutMe)
}

func (s *ProfilService) UpdateAvatar(userID int, avatarPath string) error {
	return s.ProfilRepo.UpdateAvatar(userID, avatarPath)
}
