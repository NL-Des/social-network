package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
	ws "social-network/backend/internal/websocket"
)

type GroupHandler struct {
	GroupService *service.GroupService
	UserService  *service.UserService
	NotifService *service.NotificationService
	Hub          *ws.Hub
}

func NewGroupHandler(gs *service.GroupService, us *service.UserService, ns *service.NotificationService, hub *ws.Hub) *GroupHandler {
	return &GroupHandler{GroupService: gs, UserService: us, NotifService: ns, Hub: hub}
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
		posts, err := h.GroupService.GetGroupPosts(groupID, int64(userID))
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
		post, err := h.GroupService.GetGroupPostByID(groupID, postID, int64(userID))
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

// HandleGroupMembers gère GET et POST /group-chat/{id}/members
func (h *GroupHandler) HandleGroupMembers(w http.ResponseWriter, r *http.Request) {
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
		members, err := h.GroupService.GetGroupMembers(int(groupID))
		if err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(members)

	case http.MethodPost:
		var body struct {
			UserID int64 `json:"user_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.UserID == 0 {
			http.Error(w, "user_id invalide", http.StatusBadRequest)
			return
		}
		if err := h.GroupService.AddGroupMember(groupID, body.UserID, int64(userID)); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		// Notifie tous les membres (y compris le nouveau) pour qu'ils rechargent la liste
		if memberIDs, err := h.GroupService.GetMemberIDs(groupID); err == nil {
			event := ws.MessageWs{Type: "group_member_added", Data: map[string]int64{"group_id": groupID}}
			for _, mid := range memberIDs {
				h.Hub.BroadcastToUser(mid, event)
			}
		}
		go h.sendGroupAddedNotif(groupID, int64(userID), body.UserID)
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleGroupPostLike gère POST/DELETE /group-chat/{id}/posts/{postId}/like
func (h *GroupHandler) HandleGroupPostLike(w http.ResponseWriter, r *http.Request) {
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

	if r.Method == http.MethodDelete {
		if err := h.GroupService.RemoveGroupLike(postID, int64(userID)); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		go h.broadcastGroupLikeUpdate(postID, userID)
		w.WriteHeader(http.StatusNoContent)
		return
	}

	var body struct {
		Type string `json:"type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || (body.Type != "like" && body.Type != "dislike") {
		http.Error(w, "type invalide", http.StatusBadRequest)
		return
	}

	if err := h.GroupService.AddGroupLike(postID, int64(userID), body.Type); err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}
	go h.broadcastGroupLikeUpdate(postID, userID)
	go h.sendGroupLikeNotif(postID, userID)
	w.WriteHeader(http.StatusNoContent)
}

func (h *GroupHandler) sendGroupLikeNotif(groupPostID int64, likerUserID int) {
	authorID, err := h.GroupService.GetGroupPostAuthorID(groupPostID)
	if err != nil || authorID == int64(likerUserID) {
		return
	}
	actor, err := h.UserService.GetProfile(likerUserID)
	if err != nil {
		log.Printf("sendGroupLikeNotif: GetProfile(%d) err=%v", likerUserID, err)
		return
	}
	if err := h.NotifService.Notify(authorID, model.NotifPostLike, model.NotificationPayload{
		ActorName: actor.Username,
	}); err != nil {
		log.Printf("sendGroupLikeNotif: Notify err=%v", err)
	}
}

func (h *GroupHandler) broadcastGroupLikeUpdate(groupPostID int64, excludeUserID int) {
	if h.Hub == nil {
		return
	}
	likes, dislikes, err := h.GroupService.GetGroupLikeCounts(groupPostID)
	if err != nil {
		log.Printf("broadcastGroupLikeUpdate: GetGroupLikeCounts(%d) err=%v", groupPostID, err)
		return
	}
	h.Hub.BroadcastToAll(ws.MessageWs{
		Type: "group_post_like_update",
		Data: map[string]interface{}{
			"post_id":  groupPostID,
			"likes":    likes,
			"dislikes": dislikes,
		},
	}, int64(excludeUserID))
}


// HandleRemoveMember gère DELETE /group-chat/{id}/members/{userId}
func (h *GroupHandler) HandleRemoveMember(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	requesterID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}
	targetID, err := strconv.ParseInt(r.PathValue("userId"), 10, 64)
	if err != nil {
		http.Error(w, "id utilisateur invalide", http.StatusBadRequest)
		return
	}
	if err := h.GroupService.RemoveGroupMember(groupID, targetID, int64(requesterID)); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}
	go h.sendGroupRemovedNotif(groupID, int64(requesterID), targetID)
	w.WriteHeader(http.StatusNoContent)
}

func (h *GroupHandler) sendGroupAddedNotif(groupID, actorID, targetID int64) {
	actor, err := h.UserService.GetProfile(int(actorID))
	if err != nil {
		return
	}
	title, err := h.GroupService.GetGroupTitle(groupID)
	if err != nil {
		return
	}
	if err := h.NotifService.Notify(targetID, model.NotifGroupInvite, model.NotificationPayload{
		ActorName: actor.Username,
		GroupName: title,
	}); err != nil {
		log.Printf("sendGroupAddedNotif: %v", err)
	}
}

func (h *GroupHandler) sendGroupRemovedNotif(groupID, actorID, targetID int64) {
	actor, err := h.UserService.GetProfile(int(actorID))
	if err != nil {
		return
	}
	title, err := h.GroupService.GetGroupTitle(groupID)
	if err != nil {
		return
	}
	if err := h.NotifService.Notify(targetID, model.NotifBannedFromGroup, model.NotificationPayload{
		ActorName: actor.Username,
		GroupName: title,
	}); err != nil {
		log.Printf("sendGroupRemovedNotif: %v", err)
	}
}
