package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"social-network/backend/internal/model"
)

type ChatGroupRepo struct {
	db *sql.DB
}

func NewChatGroupRepo(db *sql.DB) *ChatGroupRepo {
	return &ChatGroupRepo{db: db}
}

type ChatGroupInfo struct {
	ID       int64  `json:"id"`
	Title    string `json:"title"`
	Initials string `json:"initials"`
}

func initials(title string) string {
	words := strings.Fields(title)
	result := ""
	for i, w := range words {
		if i >= 2 {
			break
		}
		if len(w) > 0 {
			result += strings.ToUpper(string([]rune(w)[0]))
		}
	}
	if result == "" {
		return "G"
	}
	return result
}

func (r *ChatGroupRepo) CreateChatGroup(title string, creatorID int64, memberIDs []int64) (int64, error) {
	var id int64
	err := r.db.QueryRow(`
		INSERT INTO chat_groups (title, creatorid)
		VALUES ($1, $2)
		RETURNING id
	`, title, creatorID).Scan(&id)
	if err != nil {
		return 0, err
	}

	if _, err = r.db.Exec(`
		INSERT INTO chat_group_members (chat_group_id, userid)
		VALUES ($1, $2) ON CONFLICT DO NOTHING
	`, id, creatorID); err != nil {
		return 0, err
	}

	for _, uid := range memberIDs {
		if uid == creatorID {
			continue
		}
		r.db.Exec(`
			INSERT INTO chat_group_members (chat_group_id, userid)
			VALUES ($1, $2) ON CONFLICT DO NOTHING
		`, id, uid)
	}
	return id, nil
}

func (r *ChatGroupRepo) GetUserChatGroups(userID int64) ([]ChatGroupInfo, error) {
	rows, err := r.db.Query(`
		SELECT cg.id, cg.title
		FROM chat_groups cg
		JOIN chat_group_members cgm ON cgm.chat_group_id = cg.id
		WHERE cgm.userid = $1
		ORDER BY cg.createdat DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	groups := make([]ChatGroupInfo, 0)
	for rows.Next() {
		var g ChatGroupInfo
		if err := rows.Scan(&g.ID, &g.Title); err != nil {
			return nil, err
		}
		g.Initials = initials(g.Title)
		groups = append(groups, g)
	}
	return groups, rows.Err()
}

func (r *ChatGroupRepo) IsChatGroupMember(chatGroupID, userID int64) (bool, error) {
	var count int
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM chat_group_members
		WHERE chat_group_id = $1 AND userid = $2
	`, chatGroupID, userID).Scan(&count)
	return count > 0, err
}

func (r *ChatGroupRepo) GetChatGroupMemberIDs(chatGroupID int64) ([]int64, error) {
	rows, err := r.db.Query(`
		SELECT userid FROM chat_group_members WHERE chat_group_id = $1
	`, chatGroupID)
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

func (r *ChatGroupRepo) CreateChatGroupMessage(chatGroupID, senderID int64, content string) error {
	_, err := r.db.Exec(`
		INSERT INTO group_chats (chat_group_id, senderid, content)
		VALUES ($1, $2, $3)
	`, chatGroupID, senderID, content)
	return err
}

func (r *ChatGroupRepo) GetChatGroupMessages(chatGroupID int64) ([]model.GroupMessage, error) {
	rows, err := r.db.Query(`
		SELECT id, chat_group_id, senderid, content, createdat
		FROM group_chats
		WHERE chat_group_id = $1
		ORDER BY createdat ASC
	`, chatGroupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	msgs := make([]model.GroupMessage, 0)
	for rows.Next() {
		var m model.GroupMessage
		var t time.Time
		if err := rows.Scan(&m.ID, &m.GroupID, &m.SenderID, &m.Body, &t); err != nil {
			return nil, err
		}
		m.SentAt = t
		msgs = append(msgs, m)
	}
	return msgs, rows.Err()
}

func (r *ChatGroupRepo) GetChatGroupMembers(chatGroupID int64) ([]GroupMember, error) {
	rows, err := r.db.Query(`
		SELECT u.id, u.firstname, u.lastname,
		       CASE WHEN cg.creatorid = u.id THEN true ELSE false END
		FROM chat_group_members cgm
		JOIN users u ON u.id = cgm.userid
		JOIN chat_groups cg ON cg.id = cgm.chat_group_id
		WHERE cgm.chat_group_id = $1
		ORDER BY u.firstname, u.lastname
	`, chatGroupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := make([]GroupMember, 0)
	for rows.Next() {
		var m GroupMember
		var fn, ln string
		if err := rows.Scan(&m.ID, &fn, &ln, &m.IsCreator); err != nil {
			return nil, err
		}
		m.Name = fn
		if len(ln) > 0 {
			m.Name += " " + ln
		}
		if len(fn) > 0 {
			m.Initials += strings.ToUpper(string([]rune(fn)[0]))
		}
		if len(ln) > 0 {
			m.Initials += strings.ToUpper(string([]rune(ln)[0]))
		}
		members = append(members, m)
	}
	return members, rows.Err()
}

func (r *ChatGroupRepo) GetChatGroupTitle(chatGroupID int64) (string, error) {
	var title string
	err := r.db.QueryRow(`SELECT title FROM chat_groups WHERE id = $1`, chatGroupID).Scan(&title)
	return title, err
}

func (r *ChatGroupRepo) AddChatGroupMember(chatGroupID, userID int64) error {
	_, err := r.db.Exec(`
		INSERT INTO chat_group_members (chat_group_id, userid)
		VALUES ($1, $2) ON CONFLICT DO NOTHING
	`, chatGroupID, userID)
	return err
}

func (r *ChatGroupRepo) LeaveChatGroup(chatGroupID, userID int64) error {
	_, err := r.db.Exec(`
		DELETE FROM chat_group_members WHERE chat_group_id = $1 AND userid = $2
	`, chatGroupID, userID)
	return err
}

func (r *ChatGroupRepo) RemoveChatGroupMember(chatGroupID, targetID, requesterID int64) error {
	var creatorID int64
	if err := r.db.QueryRow(`SELECT creatorid FROM chat_groups WHERE id = $1`, chatGroupID).Scan(&creatorID); err != nil {
		return err
	}
	if creatorID != requesterID {
		return fmt.Errorf("non autorisé")
	}
	_, err := r.db.Exec(`
		DELETE FROM chat_group_members WHERE chat_group_id = $1 AND userid = $2
	`, chatGroupID, targetID)
	return err
}
