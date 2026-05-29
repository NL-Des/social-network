package service

import (
	"fmt"

	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type EventService struct {
	eventRepo *repository.EventRepository
	groupRepo *repository.GroupRepo
}

func NewEventService(er *repository.EventRepository, gr *repository.GroupRepo) *EventService {
	return &EventService{eventRepo: er, groupRepo: gr}
}

func (s *EventService) GetGroupEvents(groupID, viewerID int) ([]model.GroupEvent, error) {
	isMember, err := s.groupRepo.IsGroupMember(int64(groupID), int64(viewerID))
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, fmt.Errorf("accès non autorisé")
	}
	return s.eventRepo.GetGroupEvents(groupID, viewerID)
}

func (s *EventService) CreateEvent(groupID, creatorID int, req model.CreateEventRequest) (*model.GroupEvent, error) {
	isMember, err := s.groupRepo.IsGroupMember(int64(groupID), int64(creatorID))
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, fmt.Errorf("accès non autorisé")
	}
	return s.eventRepo.CreateEvent(groupID, creatorID, req)
}

func (s *EventService) DeleteEvent(eventID, userID int) error {
	return s.eventRepo.DeleteEvent(eventID, userID)
}

func (s *EventService) RespondToEvent(eventID, userID int, response string) error {
	return s.eventRepo.RespondToEvent(eventID, userID, response)
}
