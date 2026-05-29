package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

type PostAndCommentsHandler struct {
	UserService    *service.UserService
	SessionService *service.SessionService
	PostService    *service.PostAndCommentsService
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

	// Récupération des données de l'utilisateur connecté via le contexte (injecté par authMiddleware)
	userIDInt, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	userID := strconv.Itoa(userIDInt)

	// Gestion des commentaires (ajout ou modification)
	if mode == "newcomment" || mode == "editcomment" {
		h.CommentHandler(w, r, content, mode, userID)
	}

	// Gestion des posts (ajout ou modification)
	if mode == "editpost" || mode == "newpost" {
		postData := model.Post{
			Title:   title,
			Content: content,
			Privacy: privacy,
			Tags:    tagList,
		}

		h.PostHandler(w, r, postData, mode, userID)
	}
}

func (h *PostAndCommentsHandler) handleGetPosts(w http.ResponseWriter, r *http.Request) {
	userIDInt, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
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

	posts, err := h.PostService.GetAllPosts(userIDInt)
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
	if err != nil {
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
		if err != nil {
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
		if err != nil {
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

// HandleLike gère POST /posts/{id}/like (like/dislike) et DELETE /posts/{id}/like (unlike)
func (h *PostAndCommentsHandler) HandleLike(w http.ResponseWriter, r *http.Request) {
	userIDInt, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	postID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "ID de post invalide", http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodDelete {
		if err := h.PostService.UnlikePost(postID, userIDInt); err != nil {
			http.Error(w, "Erreur lors de la suppression du like", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// POST : body JSON { "type": "like" | "dislike" }
	var body struct {
		Type string `json:"type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Body invalide", http.StatusBadRequest)
		return
	}
	if body.Type != "like" && body.Type != "dislike" {
		http.Error(w, "Type invalide (like ou dislike attendu)", http.StatusBadRequest)
		return
	}

	if err := h.PostService.LikePost(postID, userIDInt, body.Type); err != nil {
		http.Error(w, "Erreur lors de l'ajout du like", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
