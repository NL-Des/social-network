package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
	"strconv"
	"strings"
)

type PostAndCommentsHandler struct {
	UserService    *service.UserService
	SessionService *service.SessionService
	PostService *service.PostAndCommentsService
}

func NewPostAndCommentsHandler(us *service.UserService, ss *service.SessionService, ps *service.PostAndCommentsService) *PostAndCommentsHandler {
	return &PostAndCommentsHandler{UserService: us, SessionService: ss, PostService: ps}
}

func (h *PostAndCommentsHandler) PostAndCommentsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		h.handleGetPosts(w, r)
		return
	}

	mode := r.FormValue("mode")
	title := r.FormValue("title")
	content := r.FormValue("content")
	privacy := r.FormValue("privacy")

	// Récupération des tags. Pour l'instant, le séparateur est un espace
	tags := r.FormValue("tags")
	var tagList []string
	if len(tags) != 0 {
		tagList = strings.Fields(tags)
	}

	// Récupération des données de l'utilisateur connecté
	cookie, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Aucun cookie trouvé", http.StatusUnauthorized)
		return
	}
	userID, err := h.SessionService.GetUserID(cookie.Value)

	if err != nil {
		http.Error(w, "Erreur de récupération de session", http.StatusInternalServerError)
		return
	}


	// Gestion des commentaires (ajout ou modification)
	if mode == "newcomment" || mode == "editcomment" {
		h.CommentHandler(w, r, content, mode, userID)
	}
	
	// Gestion des posts (ajout ou modification)
	if mode == "editpost" || mode == "newpost" {
		postData := model.Post {
			Title: title,
			Content:content,
			Privacy:privacy,
			Tags: tagList,
		}
	
	h.PostHandler(w, r, postData, mode, userID)
	}
}

func (h *PostAndCommentsHandler) handleGetPosts(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	userID, err := h.SessionService.GetUserID(cookie.Value)
	if err != nil || userID == "" {
		http.Error(w, "Session invalide", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	idStr := r.URL.Query().Get("id")
	if idStr != "" {
		postID, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "ID invalide", http.StatusBadRequest)
			return
		}
		post, err := h.PostService.DisplayPostAndComments(postID)
		if err != nil {
			http.Error(w, "Post introuvable", http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(post)
		return
	}

	posts, err := h.PostService.GetAllPosts()
	if err != nil {
		http.Error(w, "Erreur de récupération des posts", http.StatusInternalServerError)
		return
	}
	if posts == nil {
		posts = []model.Post{}
	}
	json.NewEncoder(w).Encode(posts)
}

func (h *PostAndCommentsHandler) CommentHandler(w http.ResponseWriter, r *http.Request, content, mode, userID string) {
	postID, err := strconv.Atoi(r.FormValue("postID"))
		if err !=nil {
			http.Error(w, "Erreur de récupération de l'ID de post", http.StatusInternalServerError)
			return
		}

	if mode == "newcomment" {
			err := h.PostService.AddCommentOnPost(postID, userID, content)
			if err != nil {
			http.Error(w, "Erreur dans l'ajout de commentaire", http.StatusInternalServerError)
		
		}
		return 
	} else if mode == "editcomment" {
		commentID, err := strconv.Atoi(r.FormValue("commentID"))
		if err !=nil {
			http.Error(w, "Erreur de récupération de l'ID de commentaire", http.StatusInternalServerError)
			return
		}
		err = h.PostService.EditComment(userID, commentID, content)
		if err != nil {
			http.Error(w, "Erreur dans la modification du commentaire", http.StatusInternalServerError)
		}
		return 
	}
}

func (h *PostAndCommentsHandler) PostHandler(w http.ResponseWriter, r *http.Request, postData model.Post, mode, userID string) {
	if mode == "editpost" {
		var err error
		postData.ID, err = strconv.Atoi(r.FormValue("postID"))
		if err !=nil {
			http.Error(w, "Erreur de récupération de l'ID de post", http.StatusInternalServerError)
			return
		}

		err = h.PostService.EditPost(userID, postData)
		if err != nil {
			if err.Error() == "utilisateur non autorisé" {
				http.Error(w, "Tentative d'édition d'un post par un utilisateur non autorisé", http.StatusUnauthorized)
				return
			}
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