package repository

import (
	"database/sql"
	"fmt"
	"time"

	"social-network/backend/internal/model"
)

type EventRepository struct {
	db *sql.DB
}

func NewEventRepository(db *sql.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) GetGroupEvents(groupID, viewerID int) ([]model.GroupEvent, error) {
	rows, err := r.db.Query(`
		SELECT
			e.id,
			e.groupid,
			e.creatorid,
			COALESCE(u.pseudo, u.firstname || ' ' || u.lastname),
			e.title,
			e.description,
			e.eventdatetime,
			e.createdat,
			COUNT(CASE WHEN er.response = 'coming'       THEN 1 END) AS coming,
			COUNT(CASE WHEN er.response = 'unsure'       THEN 1 END) AS unsure,
			COUNT(CASE WHEN er.response = 'uninterested' THEN 1 END) AS uninterested,
			COALESCE(
				(SELECT ger.response FROM social_group_event_responses ger
				 WHERE ger.eventid = e.id AND ger.userid = $2 LIMIT 1),
				''
			) AS user_response
		FROM social_group_events e
		JOIN users u ON u.id = e.creatorid
		LEFT JOIN social_group_event_responses er ON er.eventid = e.id
		WHERE e.groupid = $1
		GROUP BY e.id, u.pseudo, u.firstname, u.lastname
		ORDER BY e.eventdatetime ASC
	`, groupID, viewerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := make([]model.GroupEvent, 0)
	for rows.Next() {
		var ev model.GroupEvent
		var eventDatetime, createdAt time.Time
		if err := rows.Scan(
			&ev.ID, &ev.GroupID, &ev.CreatorID, &ev.CreatorName,
			&ev.Title, &ev.Description, &eventDatetime, &createdAt,
			&ev.Coming, &ev.Unsure, &ev.Uninterested, &ev.UserResponse,
		); err != nil {
			return nil, err
		}
		ev.EventDatetime = eventDatetime.Format(time.RFC3339)
		ev.CreatedAt = createdAt.Format(time.RFC3339)
		events = append(events, ev)
	}
	return events, rows.Err()
}

func (r *EventRepository) CreateEvent(groupID, creatorID int, req model.CreateEventRequest) (*model.GroupEvent, error) {
	var ev model.GroupEvent
	var eventDatetime, createdAt time.Time

	err := r.db.QueryRow(`
		INSERT INTO social_group_events (groupid, creatorid, title, description, eventdatetime)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, groupid, creatorid, title, description, eventdatetime, createdat
	`, groupID, creatorID, req.Title, req.Description, req.EventDatetime).Scan(
		&ev.ID, &ev.GroupID, &ev.CreatorID,
		&ev.Title, &ev.Description, &eventDatetime, &createdAt,
	)
	if err != nil {
		return nil, err
	}
	ev.EventDatetime = eventDatetime.Format(time.RFC3339)
	ev.CreatedAt = createdAt.Format(time.RFC3339)

	var creatorName string
	err = r.db.QueryRow(`
		SELECT COALESCE(pseudo, firstname || ' ' || lastname) FROM users WHERE id = $1
	`, creatorID).Scan(&creatorName)
	if err != nil {
		ev.CreatorName = ""
	} else {
		ev.CreatorName = creatorName
	}

	return &ev, nil
}

func (r *EventRepository) DeleteEvent(eventID, userID int) error {
	result, err := r.db.Exec(`
		DELETE FROM social_group_events WHERE id = $1 AND creatorid = $2
	`, eventID, userID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("non autorisé ou événement introuvable")
	}
	return nil
}

func (r *EventRepository) RespondToEvent(eventID, userID int, response string) error {
	_, err := r.db.Exec(`
		INSERT INTO social_group_event_responses (eventid, userid, response)
		VALUES ($1, $2, $3)
		ON CONFLICT ON CONSTRAINT uq_event_response
		DO UPDATE SET response = $3, respondedat = CURRENT_TIMESTAMP
	`, eventID, userID, response)
	return err
}
