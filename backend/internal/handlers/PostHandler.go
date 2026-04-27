package handlers

import (
	"net/http"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
	"strconv"
	"strings"
)

type PostHandler struct {
	UserService    *service.UserService
	SessionService *service.SessionService
	PostService *service.PostAndCommentsService
}

func NewPostHandler(us *service.UserService, ss *service.SessionService, ps *service.PostAndCommentsService) *PostHandler {
	return &PostHandler{UserService: us, SessionService: ss, PostService: ps}
}

func (h *PostHandler) PostHandler(w http.ResponseWriter, r *http.Request) {
	mode := r.FormValue("mode")
	title := r.FormValue("title")
	content := r.FormValue("content")
	privacy := r.FormValue("privacy")
	tags := r.FormValue("tags")


	var tagList []string

	if len(tags) != 0 {
		tagList = strings.Split(tags, " ")
	}

	
	cookie, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Erreur de récupération du cookie", http.StatusInternalServerError)
		return
	}
	userID, err := h.SessionService.GetUserID(cookie.Value)

	if err != nil {
		http.Error(w, "Erreur de récupération de session", http.StatusInternalServerError)
		return
	}
	ID := 0

	if mode == "edit" {
		ID, err = strconv.Atoi(r.FormValue("postID"))
		if err !=nil {
			http.Error(w, "Erreur de récupération de l'ID de post", http.StatusInternalServerError)
			return
		}
	}
	
	postData := model.Post{
		ID: ID,
		Title: title,
		Content:content,
		Privacy:privacy,
		Tags: tagList,
	}

	if mode == "edit" {
		err := h.PostService.EditPost(userID, postData)
		if err.Error() == "utilisateur non autorisé" {
			http.Error(w, "Tentative d'édition d'un post par un utilisateur non autorisé", http.StatusUnauthorized)
			return
		} else if err != nil {
			http.Error(w, "Erreur dans la modification du post", http.StatusInternalServerError)
			return
		}
	} else if mode == "newpost" {
		err := h.PostService.CreateNewPost(userID, postData)
		if err != nil {
			http.Error(w, "Erreur dans la création du post", http.StatusInternalServerError)
			return
		}
	}
}