package service

import (
	"fmt"
	"log"

	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type EventService struct {
	eventRepo    *repository.EventRepository
	groupRepo    *repository.GroupRepo
	notifService *NotificationService
}

func NewEventService(er *repository.EventRepository, gr *repository.GroupRepo, ns *NotificationService) *EventService {
	return &EventService{eventRepo: er, groupRepo: gr, notifService: ns}
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
	ev, err := s.eventRepo.CreateEvent(groupID, creatorID, req)
	if err != nil {
		return nil, err
	}
	go s.notifyGroupEventCreated(int64(groupID), int64(creatorID), ev)
	return ev, nil
}

func (s *EventService) notifyGroupEventCreated(groupID, creatorID int64, ev *model.GroupEvent) {
	title, err := s.groupRepo.GetGroupTitle(groupID)
	if err != nil {
		return
	}
	memberIDs, err := s.groupRepo.GetGroupMemberIDs(groupID)
	if err != nil {
		return
	}
	for _, mid := range memberIDs {
		if mid == creatorID {
			continue
		}
		if err := s.notifService.Notify(mid, model.NotifGroupEventCreated, model.NotificationPayload{
			ActorID:    creatorID,
			ActorName:  ev.CreatorName,
			GroupID:    groupID,
			GroupName:  title,
			EventTitle: ev.Title,
		}); err != nil {
			log.Printf("notifyGroupEventCreated: %v", err)
		}
	}
}

func (s *EventService) DeleteEvent(eventID, userID int) error {
	return s.eventRepo.DeleteEvent(eventID, userID)
}

func (s *EventService) RespondToEvent(eventID, userID int, response string) error {
	return s.eventRepo.RespondToEvent(eventID, userID, response)
}
