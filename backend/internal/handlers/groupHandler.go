package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"social-network/backend/internal/service"
)

type GroupHandler struct {
	GroupService *service.GroupService
	UserService  *service.UserService
}

func NewGroupHandler(gs *service.GroupService, us *service.UserService) *GroupHandler {
	return &GroupHandler{GroupService: gs, UserService: us}
}

// HandleGroups gère GET /group-chat (liste) et POST /group-chat (création)
func (h *GroupHandler) HandleGroups(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case http.MethodGet:
		groups, err := h.GroupService.GetUserGroups(int64(userID))
		if err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(groups)

	case http.MethodPost:
		var body struct {
			Title       string  `json:"title"`
			Description string  `json:"description"`
			MemberIDs   []int64 `json:"member_ids"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "payload invalide", http.StatusBadRequest)
			return
		}
		title := strings.TrimSpace(body.Title)
		if title == "" {
			http.Error(w, "titre requis", http.StatusBadRequest)
			return
		}
		desc := strings.TrimSpace(body.Description)
		if desc == "" {
			desc = "Groupe de discussion"
		}

		groupID, err := h.GroupService.CreateGroup(title, desc, int64(userID), body.MemberIDs)
		if err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]int64{"id": groupID})

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleLeaveGroup gère DELETE /group-chat/{id}/leave
func (h *GroupHandler) HandleLeaveGroup(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	if r.Method != http.MethodDelete {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var body struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || strings.TrimSpace(body.Password) == "" {
		http.Error(w, "mot de passe requis", http.StatusBadRequest)
		return
	}
	if err := h.UserService.CheckPassword(userID, body.Password); err != nil {
		http.Error(w, "mot de passe incorrect", http.StatusForbidden)
		return
	}

	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}
	if err := h.GroupService.LeaveGroup(groupID, int64(userID)); err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// HandleGroupMessages gère GET /group-chat/{id}/messages
func (h *GroupHandler) HandleGroupMessages(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	isMember, err := h.GroupService.IsGroupMember(groupID, int64(userID))
	if err != nil || !isMember {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}

	messages, err := h.GroupService.GetGroupMessages(groupID)
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// HandleGroupPosts gère GET /group-chat/{id}/posts et POST /group-chat/{id}/posts
func (h *GroupHandler) HandleGroupPosts(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	isMember, err := h.GroupService.IsGroupMember(groupID, int64(userID))
	if err != nil || !isMember {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}

	switch r.Method {
	case http.MethodGet:
		posts, err := h.GroupService.GetGroupPosts(groupID)
		if err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)

	case http.MethodPost:
		var body struct {
			Title   string `json:"title"`
			Content string `json:"content"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "payload invalide", http.StatusBadRequest)
			return
		}
		content := strings.TrimSpace(body.Content)
		if content == "" {
			http.Error(w, "contenu requis", http.StatusBadRequest)
			return
		}
		title := strings.TrimSpace(body.Title)
		if title == "" {
			runes := []rune(content)
			if len(runes) > 60 {
				title = string(runes[:60]) + "…"
			} else {
				title = content
			}
		}
		if err := h.GroupService.CreateGroupPost(groupID, int64(userID), title, content); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleGroupPostDetail gère GET /group-chat/{id}/posts/{postId} et DELETE /group-chat/{id}/posts/{postId}
func (h *GroupHandler) HandleGroupPostDetail(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	postID, err := strconv.ParseInt(r.PathValue("postId"), 10, 64)
	if err != nil {
		http.Error(w, "id de post invalide", http.StatusBadRequest)
		return
	}

	isMember, err := h.GroupService.IsGroupMember(groupID, int64(userID))
	if err != nil || !isMember {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}

	switch r.Method {
	case http.MethodGet:
		post, err := h.GroupService.GetGroupPostByID(groupID, postID)
		if err != nil {
			http.Error(w, "post introuvable", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)

	case http.MethodDelete:
		if err := h.GroupService.DeleteGroupPost(postID, int64(userID)); err != nil {
			http.Error(w, "non autorisé ou post introuvable", http.StatusForbidden)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleGroupPostComments gère GET /group-chat/{id}/posts/{postId}/comments et POST
func (h *GroupHandler) HandleGroupPostComments(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	postID, err := strconv.ParseInt(r.PathValue("postId"), 10, 64)
	if err != nil {
		http.Error(w, "id de post invalide", http.StatusBadRequest)
		return
	}

	isMember, err := h.GroupService.IsGroupMember(groupID, int64(userID))
	if err != nil || !isMember {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}

	switch r.Method {
	case http.MethodGet:
		comments, err := h.GroupService.GetGroupComments(postID)
		if err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(comments)

	case http.MethodPost:
		var body struct {
			Content string `json:"content"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "payload invalide", http.StatusBadRequest)
			return
		}
		content := strings.TrimSpace(body.Content)
		if content == "" {
			http.Error(w, "contenu requis", http.StatusBadRequest)
			return
		}
		if err := h.GroupService.AddGroupComment(postID, int64(userID), content); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleGroupCommentDelete gère DELETE /group-chat/{id}/posts/{postId}/comments/{commentId}
func (h *GroupHandler) HandleGroupCommentDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	commentID, err := strconv.ParseInt(r.PathValue("commentId"), 10, 64)
	if err != nil {
		http.Error(w, "id de commentaire invalide", http.StatusBadRequest)
		return
	}

	isMember, err := h.GroupService.IsGroupMember(groupID, int64(userID))
	if err != nil || !isMember {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}

	if err := h.GroupService.DeleteGroupComment(commentID, int64(userID)); err != nil {
		http.Error(w, "non autorisé ou commentaire introuvable", http.StatusForbidden)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// HandleGroupMembers gère GET /group-chat/{id}/members
func (h *GroupHandler) HandleGroupMembers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	isMember, err := h.GroupService.IsGroupMember(groupID, int64(userID))
	if err != nil || !isMember {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}

	members, err := h.GroupService.GetGroupMembers(int(groupID))
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(members)
}
