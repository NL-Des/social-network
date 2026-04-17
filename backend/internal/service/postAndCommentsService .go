package service

import (
	"fmt"
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type PostAndCommentsService struct {
	postRepo *repository.PostRepo
	tagRepo *repository.TagRepo
	commentRepo *repository.CommentRepo
}

func NewPostAndCommentsService(pr *repository.PostRepo, tr *repository.TagRepo, cr *repository.CommentRepo) *PostAndCommentsService {
	return &PostAndCommentsService{postRepo: pr, tagRepo: tr, commentRepo: cr}
}

/*
* Gère toutes les fonctions pour la création d'un nouveau post 
* 1. Ajout du post dans la base de données puis récupération de son ID
* 2. Ajout des tags liés au post dans la base de données
* Paramètres : ID du posteur et postData (titre, contenu, confidentialité, tags)
*/
func (s *PostAndCommentsService) CreateNewPost(authorID string, postData model.Post) error {
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

/*
* Gère la fonction d'ajout de commentaire sur un post
* Paramètres : ID du commentaire, ID du posteur
*/
func (s *PostAndCommentsService) AddCommentOnPost(postID int, authorID string, content string) error {
	return s.commentRepo.CreateNewComment(postID, authorID, content)
}

/*
* Gère la suppression d'un post par l'utilisateur ou par un administrateur du site
* Paramètres : ID du post, mode admin/user 
*/
func (s *PostAndCommentsService) DeletePost(postID int, mode string) error {
	err := s.postRepo.DeleteExistingPost(postID)
	if err != nil {
		return err
	}

	if mode == "admin" {
		authorID, err := s.postRepo.GetPostAuthorID(postID)
		if err != nil {
			return err
		}
		fmt.Print(authorID)
		// Envoie d'une notification à l'utilisateur authorID
	}

	return nil
}

/*
* Gère la suppression d'un commentaire par l'utilisateur ou par un administrateur du site
* Paramètres : ID du post, mode admin/user 
*/
func (s *PostAndCommentsService) DeleteComment(commentID int, mode string) error {
	err := s.commentRepo.DeleteExistingComment(commentID)
	if err != nil {
		return err
	}

	if mode == "admin" {
		authorID, err := s.commentRepo.GetCommentAuthorID(commentID)
		if err != nil {
			return err
		}
		fmt.Print(authorID)
		// Envoie d'une notification à l'utilisateur authorID
	}

	return nil
}

/*
* Gère la modification d'un post 
* 1. Met à jour content, title et privacy
* 2. Vérifie si des tags ont été ajoutés et les ajoute si c'est le cas
* Paramètres : model.Post complet 
*/
func (s *PostAndCommentsService) EditPost(postData model.Post) error {
	err := s.postRepo.UpdateExistingPost(postData)
	if err != nil {
		return err
	}

	s.tagRepo.DeletePostTags(postData.ID)
	s.tagRepo.AddPostTags(postData.ID, postData.Tags)

	return nil
}

/*
* Gère la modification d'un commentaire
* Paramètres : ID du commentaire, nouveau contenu du commentaire
*/ 
func (s *PostAndCommentsService) EditComment(commentID int, content string) error {
	return s.commentRepo.UpdateExistingComment(commentID, content)
}

/*
* Gère la récupération d'un post et de ses commentaires pour l'afficher
* Paramètres : ID du post
*/
func (s *PostAndCommentsService) DisplayPostAndComments(postID int) (model.Post, error) {
	post, err := s.postRepo.GetPostFromID(postID)
	if err != nil {
		return model.Post{}, err
	}
	post.Comments, err = s.commentRepo.GetCommentsFromPostID(postID)
	if err != nil {
		return model.Post{}, err
	}

	return post, nil

}