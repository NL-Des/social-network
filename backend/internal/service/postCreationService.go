package service

import (
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type PostCreationService struct {
	postRepo *repository.PostRepo
	tagRepo *repository.TagRepo
}

func NewPostCreationService(pr *repository.PostRepo, tr *repository.TagRepo) *PostCreationService {
	return &PostCreationService{postRepo: pr, tagRepo: tr}
}

func (s *PostCreationService) CreateNewPost(authorID string, postData model.Post) error {
	err := s.postRepo.CreateNewPost(authorID, postData)
	if err != nil {
		return err
	}
	
	postID, err := s.postRepo.GetPostIDFromContent(authorID, postData.Content)
	if err != nil {
		return err
	}

	err = s.tagRepo.AddPostTags(postID, postData.Tags)
	if err != nil {
		return err
	}

	return nil
}