package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	appErrors "social-network/backend/internal/errors"
	"social-network/backend/internal/service"
)

type GroupHandler struct {
	GroupService *service.GroupService
}

func NewGroupHandler(gs *service.GroupService) *GroupHandler {
	return &GroupHandler{GroupService: gs}
}

// HandleGroups gère GET /group-chat (liste) et POST /group-chat (création)
func (h *GroupHandler) HandleGroups(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		return appErrors.New(appErrors.CodeUnauthorized, "Accès refusé : utilisateur non authentifié", nil)
	}

	switch r.Method {
	case http.MethodGet:
		groups, err := h.GroupService.GetUserGroups(int64(userID))
		if err != nil {
			return err
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
			return appErrors.New(appErrors.CodeInvalidInput, "Structure ou corps JSON invalide", err)
		}
		title := strings.TrimSpace(body.Title)
		if title == "" {
			return appErrors.New(appErrors.CodeInvalidInput, "Titre requis", nil)

		}
		desc := strings.TrimSpace(body.Description)
		if desc == "" {
			desc = "Groupe de discussion"
		}

		groupID, err := h.GroupService.CreateGroup(title, desc, int64(userID), body.MemberIDs)
		if err != nil {
			return err
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]int64{"id": groupID})

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
	return nil
}

// HandleLeaveGroup gère DELETE /group-chat/{id}/leave
func (h *GroupHandler) HandleLeaveGroup(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		return appErrors.New(appErrors.CodeUnauthorized, "Accès refusé : utilisateur non authentifié", nil)
	}
	if r.Method != http.MethodDelete {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return nil
	}
	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		return appErrors.New(appErrors.CodeInvalidInput, "Identifiant de groupe malformé", err)
	}
	if err := h.GroupService.LeaveGroup(groupID, int64(userID)); err != nil {
		return err
	}
	w.WriteHeader(http.StatusNoContent)
	return nil
}

// HandleGroupMessages gère GET /group-chat/{id}/messages
func (h *GroupHandler) HandleGroupMessages(w http.ResponseWriter, r *http.Request) error {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		return appErrors.New(appErrors.CodeUnauthorized, "Accès refusé : utilisateur non authentifié", nil)
	}

	groupID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		return appErrors.New(appErrors.CodeInvalidInput, "Identifiant de groupe malformé", err)
	}

	isMember, err := h.GroupService.IsGroupMember(groupID, int64(userID))
	if err != nil || !isMember {
		return err
	}

	messages, err := h.GroupService.GetGroupMessages(groupID)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
	return nil
}
