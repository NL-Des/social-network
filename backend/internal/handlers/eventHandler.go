package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"social-network/backend/internal/model"
	"social-network/backend/internal/service"
)

type EventHandler struct {
	service *service.EventService
}

func NewEventHandler(s *service.EventService) *EventHandler {
	return &EventHandler{service: s}
}

func (h *EventHandler) HandleGroupEvents(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "id de groupe invalide", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		events, err := h.service.GetGroupEvents(groupID, userID)
		if err != nil {
			if err.Error() == "accès non autorisé" {
				http.Error(w, "accès non autorisé", http.StatusForbidden)
				return
			}
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(events)

	case http.MethodPost:
		var req model.CreateEventRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "payload invalide", http.StatusBadRequest)
			return
		}
		if req.Title == "" || req.Description == "" || req.EventDatetime == "" {
			http.Error(w, "titre, description et date requis", http.StatusBadRequest)
			return
		}
		ev, err := h.service.CreateEvent(groupID, userID, req)
		if err != nil {
			if err.Error() == "accès non autorisé" {
				http.Error(w, "accès non autorisé", http.StatusForbidden)
				return
			}
			http.Error(w, "erreur serveur", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(ev)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

func (h *EventHandler) HandleGroupEventDetail(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	_ = userID

	vars := mux.Vars(r)
	eventID, err := strconv.Atoi(vars["eventId"])
	if err != nil {
		http.Error(w, "id d'événement invalide", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodDelete:
		if err := h.service.DeleteEvent(eventID, userID); err != nil {
			http.Error(w, "non autorisé ou événement introuvable", http.StatusForbidden)
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

func (h *EventHandler) HandleEventResponse(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	eventID, err := strconv.Atoi(vars["eventId"])
	if err != nil {
		http.Error(w, "id d'événement invalide", http.StatusBadRequest)
		return
	}

	var body struct {
		Response string `json:"response"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "payload invalide", http.StatusBadRequest)
		return
	}

	switch body.Response {
	case "coming", "unsure", "uninterested":
	default:
		http.Error(w, "réponse invalide : doit être coming, unsure ou uninterested", http.StatusBadRequest)
		return
	}

	if err := h.service.RespondToEvent(eventID, userID, body.Response); err != nil {
		http.Error(w, "erreur serveur", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
