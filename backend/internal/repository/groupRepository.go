package repository

import (
	"database/sql"
	"strings"
	"time"

	"social-network/backend/internal/model"
)

type GroupInfo struct {
	ID        int64   `json:"id"`
	Title     string  `json:"title"`
	Initials  string  `json:"initials"`
	MemberIDs []int64 `json:"member_ids"`
}

type GroupRepo struct {
	db *sql.DB
}

func NewGroupRepo(db *sql.DB) *GroupRepo {
	return &GroupRepo{db: db}
}

func (r *GroupRepo) CreateGroup(title, description string, creatorID int64, memberIDs []int64) (int64, error) {
	var groupID int64
	err := r.db.QueryRow(`
		INSERT INTO groups (creatorid, leaderid, title, description)
		VALUES ($1, $1, $2, $3)
		RETURNING id
	`, creatorID, title, description).Scan(&groupID)
	if err != nil {
		return 0, err
	}

	// Insère le créateur comme membre
	if _, err = r.db.Exec(`
		INSERT INTO group_members (groupid, userid, invitedby, status)
		VALUES ($1, $2, $2, 'member')
		ON CONFLICT DO NOTHING
	`, groupID, creatorID); err != nil {
		return 0, err
	}

	// Insère les autres membres
	for _, uid := range memberIDs {
		if uid == creatorID {
			continue
		}
		if _, err = r.db.Exec(`
			INSERT INTO group_members (groupid, userid, invitedby, status)
			VALUES ($1, $2, $3, 'member')
			ON CONFLICT DO NOTHING
		`, groupID, uid, creatorID); err != nil {
			return 0, err
		}
	}

	return groupID, nil
}

func (r *GroupRepo) GetUserGroups(userID int64) ([]GroupInfo, error) {
	rows, err := r.db.Query(`
		SELECT g.id, g.title
		FROM groups g
		JOIN group_members gm ON gm.groupid = g.id
		WHERE gm.userid = $1 AND gm.status = 'member'
		ORDER BY g.createdat DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	groups := make([]GroupInfo, 0)
	for rows.Next() {
		var g GroupInfo
		if err := rows.Scan(&g.ID, &g.Title); err != nil {
			return nil, err
		}
		words := strings.Fields(g.Title)
		for i, w := range words {
			if i >= 2 {
				break
			}
			if len(w) > 0 {
				g.Initials += strings.ToUpper(string([]rune(w)[0]))
			}
		}
		if g.Initials == "" {
			g.Initials = "G"
		}
		// Récupère les membres du groupe
		memberIDs, err := r.GetGroupMemberIDs(g.ID)
		if err == nil {
			g.MemberIDs = memberIDs
		}
		groups = append(groups, g)
	}
	return groups, rows.Err()
}

func (r *GroupRepo) GetGroupMemberIDs(groupID int64) ([]int64, error) {
	rows, err := r.db.Query(`
		SELECT userid FROM group_members
		WHERE groupid = $1 AND status = 'member'
	`, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]int64, 0)
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

func (r *GroupRepo) LeaveGroup(groupID, userID int64) error {
	_, err := r.db.Exec(`
		DELETE FROM group_members
		WHERE groupid = $1 AND userid = $2
	`, groupID, userID)
	return err
}

func (r *GroupRepo) IsGroupMember(groupID, userID int64) (bool, error) {
	var count int
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM group_members
		WHERE groupid = $1 AND userid = $2 AND status = 'member'
	`, groupID, userID).Scan(&count)
	return count > 0, err
}

func (r *GroupRepo) CreateGroupMessage(groupID, senderID int64, content string) error {
	_, err := r.db.Exec(`
		INSERT INTO group_chats (groupid, senderid, content)
		VALUES ($1, $2, $3)
	`, groupID, senderID, content)
	return err
}

func (r *GroupRepo) GetGroupMessages(groupID int64) ([]model.GroupMessage, error) {
	rows, err := r.db.Query(`
		SELECT id, groupid, senderid, content, createdat
		FROM group_chats
		WHERE groupid = $1
		ORDER BY createdat ASC
	`, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	messages := make([]model.GroupMessage, 0)
	for rows.Next() {
		var msg model.GroupMessage
		var createdAt time.Time
		if err := rows.Scan(&msg.ID, &msg.GroupID, &msg.SenderID, &msg.Body, &createdAt); err != nil {
			return nil, err
		}
		msg.SentAt = createdAt
		messages = append(messages, msg)
	}
	return messages, rows.Err()
}
