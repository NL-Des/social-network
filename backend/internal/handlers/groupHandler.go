package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
	ws "social-network/backend/internal/websocket"
)

type GroupHandler struct {
	GroupService     *service.GroupService
	ChatGroupService *service.ChatGroupService
	UserService      *service.UserService
	NotifService     *service.NotificationService
	Hub              *ws.Hub
}

func NewGroupHandler(gs *service.GroupService, cgs *service.ChatGroupService, us *service.UserService, ns *service.NotificationService, hub *ws.Hub) *GroupHandler {
	return &GroupHandler{GroupService: gs, ChatGroupService: cgs, UserService: us, NotifService: ns, Hub: hub}
}

// addToChatGroup ajoute userID au chat de groupe associé à groupID, s'il existe.
func (h *GroupHandler) addToChatGroup(groupID, userID int64) {
	chatGroupID, err := h.GroupService.GetChatGroupID(groupID)
	if err != nil || chatGroupID == 0 {
		return
	}
	if err := h.ChatGroupService.AddChatGroupMember(chatGroupID, userID); err != nil {
		log.Printf("addToChatGroup: %v", err)
	}
}

// removeFromChatGroup retire userID du chat de groupe associé à groupID, s'il existe.
func (h *GroupHandler) removeFromChatGroup(groupID, userID int64) {
	chatGroupID, err := h.GroupService.GetChatGroupID(groupID)
	if err != nil || chatGroupID == 0 {
		return
	}
	if err := h.ChatGroupService.LeaveChatGroup(chatGroupID, userID); err != nil {
		log.Printf("removeFromChatGroup: %v", err)
	}
}

// HandleGroups gère GET /group-chat (liste) et POST /group-chat (création)
func (h *GroupHandler) HandleGroups(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
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
			http.Error(w, "Données invalides", http.StatusBadRequest)
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
		if chatGroupID, err := h.ChatGroupService.CreateChatGroup(title, int64(userID), body.MemberIDs); err != nil {
			log.Printf("HandleGroups: création du chat de groupe échouée: %v", err)
		} else if err := h.GroupService.SetChatGroupID(groupID, chatGroupID); err != nil {
			log.Printf("HandleGroups: liaison du chat de groupe échouée: %v", err)
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
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
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

	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}
	if err := h.GroupService.LeaveGroup(groupID, int64(userID)); err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}
	h.removeFromChatGroup(groupID, int64(userID))
	w.WriteHeader(http.StatusNoContent)
}

// HandleGroupPosts gère GET /group-chat/{id}/posts et POST /group-chat/{id}/posts
func (h *GroupHandler) HandleGroupPosts(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
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
		const maxMemory = 2 << 20
		if err := r.ParseMultipartForm(maxMemory); err != nil && err != http.ErrNotMultipart {
			http.Error(w, "Données invalides", http.StatusBadRequest)
			return
		}
		content := strings.TrimSpace(r.FormValue("content"))
		if content == "" {
			http.Error(w, "contenu requis", http.StatusBadRequest)
			return
		}
		title := strings.TrimSpace(r.FormValue("title"))
		if title == "" {
			runes := []rune(content)
			if len(runes) > 60 {
				title = string(runes[:60]) + "…"
			} else {
				title = content
			}
		}
		image, err := saveUploadedImage(r, "image", "posts", userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := h.GroupService.CreateGroupPost(groupID, int64(userID), title, content, image); err != nil {
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
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	postID, err := strconv.ParseInt(mux.Vars(r)["postId"], 10, 64)
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
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	postID, err := strconv.ParseInt(mux.Vars(r)["postId"], 10, 64)
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
		const maxMemory = 2 << 20
		if err := r.ParseMultipartForm(maxMemory); err != nil && err != http.ErrNotMultipart {
			http.Error(w, "Données invalides", http.StatusBadRequest)
			return
		}
		content := strings.TrimSpace(r.FormValue("content"))
		if content == "" {
			http.Error(w, "contenu requis", http.StatusBadRequest)
			return
		}
		image, err := saveUploadedImage(r, "image", "comments", userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := h.GroupService.AddGroupComment(postID, int64(userID), content, image); err != nil {
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
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	commentID, err := strconv.ParseInt(mux.Vars(r)["commentId"], 10, 64)
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
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
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
			http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
			return
		}
		// Tout membre du groupe peut inviter ; l'invité doit ensuite accepter (statut 'invited').
		if err := h.GroupService.InviteUserToGroup(groupID, body.UserID, int64(userID)); err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		go h.sendGroupAddedNotif(groupID, int64(userID), body.UserID)
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleGroupChatID gère GET /group-chat/{id}/chat-id (id du chat de groupe associé)
func (h *GroupHandler) HandleGroupChatID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}
	isMember, err := h.GroupService.IsGroupMember(groupID, int64(userID))
	if err != nil || !isMember {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}
	chatGroupID, err := h.GroupService.GetChatGroupID(groupID)
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int64{"chat_group_id": chatGroupID})
}

// HandleInviteResponse gère PUT (accepter) et DELETE (refuser) /group-chat/{id}/invite
func (h *GroupHandler) HandleInviteResponse(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPut:
		if err := h.GroupService.AcceptGroupInvite(groupID, int64(userID)); err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		h.addToChatGroup(groupID, int64(userID))
		if memberIDs, err := h.GroupService.GetGroupMemberIDs(groupID); err == nil {
			event := ws.MessageWs{Type: "group_member_added", Data: map[string]int64{"group_id": groupID}}
			for _, mid := range memberIDs {
				h.Hub.BroadcastToUser(mid, event)
			}
		}
		go h.sendGroupMemberJoinedNotif(groupID, int64(userID))
		w.WriteHeader(http.StatusNoContent)

	case http.MethodDelete:
		if err := h.GroupService.DeclineGroupInvite(groupID, int64(userID)); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleGroupPostLike gère POST/DELETE /group-chat/{id}/posts/{postId}/like
func (h *GroupHandler) HandleGroupPostLike(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}

	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	postID, err := strconv.ParseInt(mux.Vars(r)["postId"], 10, 64)
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
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}
	targetID, err := strconv.ParseInt(mux.Vars(r)["userId"], 10, 64)
	if err != nil {
		http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
		return
	}
	if err := h.GroupService.RemoveGroupMember(groupID, targetID, int64(requesterID)); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}
	h.removeFromChatGroup(groupID, targetID)
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
		GroupID:   groupID,
		GroupName: title,
	}); err != nil {
		log.Printf("sendGroupAddedNotif: %v", err)
	}
}

// sendGroupMemberJoinedNotif notifie les membres existants (hors le nouvel arrivant) qu'un membre a rejoint le groupe.
func (h *GroupHandler) sendGroupMemberJoinedNotif(groupID, newMemberID int64) {
	newMember, err := h.UserService.GetProfile(int(newMemberID))
	if err != nil {
		return
	}
	title, err := h.GroupService.GetGroupTitle(groupID)
	if err != nil {
		return
	}
	memberIDs, err := h.GroupService.GetGroupMemberIDs(groupID)
	if err != nil {
		return
	}
	for _, mid := range memberIDs {
		if mid == newMemberID {
			continue
		}
		if err := h.NotifService.Notify(mid, model.NotifGroupMemberJoined, model.NotificationPayload{
			ActorID:   newMemberID,
			ActorName: newMember.Username,
			GroupID:   groupID,
			GroupName: title,
		}); err != nil {
			log.Printf("sendGroupMemberJoinedNotif: %v", err)
		}
	}
}

// HandleDeleteGroup gère DELETE /group-chat/{id}
func (h *GroupHandler) HandleDeleteGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id invalide", http.StatusBadRequest)
		return
	}
	chatGroupID, _ := h.GroupService.GetChatGroupID(groupID)
	if err := h.GroupService.DeleteGroup(groupID, int64(userID)); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}
	if chatGroupID != 0 {
		if err := h.ChatGroupService.DeleteChatGroup(chatGroupID); err != nil {
			log.Printf("HandleDeleteGroup: suppression du chat de groupe échouée: %v", err)
		}
	}
	w.WriteHeader(http.StatusNoContent)
}

// HandleTransferAdmin gère PUT /group-chat/{id}/transfer-admin
func (h *GroupHandler) HandleTransferAdmin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id invalide", http.StatusBadRequest)
		return
	}
	var body struct {
		UserID int64 `json:"user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.UserID == 0 {
		http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
		return
	}
	if err := h.GroupService.TransferAdmin(groupID, int64(userID), body.UserID); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// HandleAllGroups gère GET /groups (tous les groupes avec statut de l'utilisateur)
func (h *GroupHandler) HandleAllGroups(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	groups, err := h.GroupService.GetAllGroups(int64(userID))
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

// HandleJoinRequest gère POST /group-chat/{id}/join (demande) et DELETE (annulation)
func (h *GroupHandler) HandleJoinRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPost:
		isMember, err := h.GroupService.IsGroupMember(groupID, int64(userID))
		if err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		if isMember {
			http.Error(w, "déjà membre", http.StatusConflict)
			return
		}
		if err := h.GroupService.CreateJoinRequest(groupID, int64(userID)); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		go h.sendJoinRequestNotif(groupID, int64(userID))
		w.WriteHeader(http.StatusNoContent)

	case http.MethodDelete:
		if err := h.GroupService.CancelJoinRequest(groupID, int64(userID)); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleJoinRequests gère GET /group-chat/{id}/join-requests (admin : liste des demandes)
func (h *GroupHandler) HandleJoinRequests(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}
	creatorID, err := h.GroupService.GetGroupCreatorID(groupID)
	if err != nil || creatorID != int64(userID) {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	reqs, err := h.GroupService.GetJoinRequests(groupID)
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reqs)
}

// HandleJoinRequestAction gère PUT /group-chat/{id}/join-requests/{userId} (approuver)
// et DELETE /group-chat/{id}/join-requests/{userId} (rejeter)
func (h *GroupHandler) HandleJoinRequestAction(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Non authentifié", http.StatusUnauthorized)
		return
	}
	groupID, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}
	targetID, err := strconv.ParseInt(mux.Vars(r)["userId"], 10, 64)
	if err != nil {
		http.Error(w, "Identifiant utilisateur invalide", http.StatusBadRequest)
		return
	}
	creatorID, err := h.GroupService.GetGroupCreatorID(groupID)
	if err != nil || creatorID != int64(userID) {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}

	switch r.Method {
	case http.MethodPut:
		if err := h.GroupService.ApproveJoinRequest(groupID, targetID); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		h.addToChatGroup(groupID, targetID)
		go h.sendJoinRequestAcceptedNotif(groupID, int64(userID), targetID)
		go h.sendGroupMemberJoinedNotif(groupID, targetID)
		if memberIDs, err := h.GroupService.GetGroupMemberIDs(groupID); err == nil {
			event := ws.MessageWs{Type: "group_member_added", Data: map[string]int64{"group_id": groupID}}
			for _, mid := range memberIDs {
				h.Hub.BroadcastToUser(mid, event)
			}
		}
		w.WriteHeader(http.StatusNoContent)

	case http.MethodDelete:
		if err := h.GroupService.RejectJoinRequest(groupID, targetID); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

func (h *GroupHandler) sendJoinRequestNotif(groupID, requesterID int64) {
	creatorID, err := h.GroupService.GetGroupCreatorID(groupID)
	if err != nil {
		return
	}
	actor, err := h.UserService.GetProfile(int(requesterID))
	if err != nil {
		return
	}
	title, err := h.GroupService.GetGroupTitle(groupID)
	if err != nil {
		return
	}
	if err := h.NotifService.Notify(creatorID, model.NotifGroupJoinRequest, model.NotificationPayload{
		ActorName: actor.Username,
		GroupName: title,
	}); err != nil {
		log.Printf("sendJoinRequestNotif: %v", err)
	}
}

func (h *GroupHandler) sendJoinRequestAcceptedNotif(groupID, actorID, targetID int64) {
	actor, err := h.UserService.GetProfile(int(actorID))
	if err != nil {
		return
	}
	title, err := h.GroupService.GetGroupTitle(groupID)
	if err != nil {
		return
	}
	if err := h.NotifService.Notify(targetID, model.NotifGroupRequestAccepted, model.NotificationPayload{
		ActorName: actor.Username,
		GroupName: title,
	}); err != nil {
		log.Printf("sendJoinRequestAcceptedNotif: %v", err)
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
