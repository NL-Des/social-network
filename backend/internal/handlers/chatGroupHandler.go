package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"social-network/backend/internal/service"
	ws "social-network/backend/internal/websocket"
)

type ChatGroupHandler struct {
	Service *service.ChatGroupService
	Hub     *ws.Hub
}

func NewChatGroupHandler(s *service.ChatGroupService, hub *ws.Hub) *ChatGroupHandler {
	return &ChatGroupHandler{Service: s, Hub: hub}
}

// HandleChatGroups gère GET/POST /chat-groups
func (h *ChatGroupHandler) HandleChatGroups(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case http.MethodGet:
		groups, err := h.Service.GetUserChatGroups(int64(userID))
		if err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(groups)

	case http.MethodPost:
		var body struct {
			Title     string  `json:"title"`
			MemberIDs []int64 `json:"member_ids"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "payload invalide", http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(body.Title) == "" {
			http.Error(w, "titre requis", http.StatusBadRequest)
			return
		}
		id, err := h.Service.CreateChatGroup(strings.TrimSpace(body.Title), int64(userID), body.MemberIDs)
		if err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]int64{"id": id})

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleChatGroupMessages gère GET /chat-groups/{id}/messages
func (h *ChatGroupHandler) HandleChatGroupMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id invalide", http.StatusBadRequest)
		return
	}
	ok2, err := h.Service.IsChatGroupMember(id, int64(userID))
	if err != nil || !ok2 {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}
	msgs, err := h.Service.GetChatGroupMessages(id)
	if err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msgs)
}

// HandleChatGroupMembers gère GET/POST /chat-groups/{id}/members
func (h *ChatGroupHandler) HandleChatGroupMembers(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id invalide", http.StatusBadRequest)
		return
	}
	isMember, err := h.Service.IsChatGroupMember(id, int64(userID))
	if err != nil || !isMember {
		http.Error(w, "accès non autorisé", http.StatusForbidden)
		return
	}

	switch r.Method {
	case http.MethodGet:
		members, err := h.Service.GetChatGroupMembers(id)
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
		if err := h.Service.AddChatGroupMember(id, body.UserID); err != nil {
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		if memberIDs, err := h.Service.GetMemberIDs(id); err == nil {
			event := ws.MessageWs{Type: "group_member_added", Data: map[string]int64{"group_id": id}}
			for _, mid := range memberIDs {
				h.Hub.BroadcastToUser(mid, event)
			}
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// HandleChatGroupMemberRemove gère DELETE /chat-groups/{id}/members/{userId}
func (h *ChatGroupHandler) HandleChatGroupMemberRemove(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	requesterID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id invalide", http.StatusBadRequest)
		return
	}
	targetID, err := strconv.ParseInt(r.PathValue("userId"), 10, 64)
	if err != nil {
		http.Error(w, "userId invalide", http.StatusBadRequest)
		return
	}
	if err := h.Service.RemoveChatGroupMember(id, targetID, int64(requesterID)); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// HandleLeaveChatGroup gère DELETE /chat-groups/{id}/leave
func (h *ChatGroupHandler) HandleLeaveChatGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		http.Error(w, "id invalide", http.StatusBadRequest)
		return
	}
	if err := h.Service.LeaveChatGroup(id, int64(userID)); err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
