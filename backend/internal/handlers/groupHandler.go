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
}

func NewGroupHandler(gs *service.GroupService) *GroupHandler {
	return &GroupHandler{GroupService: gs}
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
