package repository

import (
	"database/sql"
	"errors"
	"strings"
	"time"

	appErrors "social-network/backend/internal/errors"
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
		return 0, appErrors.New(appErrors.CodeInternal, "erreur lors de la création du groupe en base de données", err)
	}

	// Insère le créateur comme membre
	if _, err = r.db.Exec(`
		INSERT INTO group_members (groupid, userid, invitedby, status)
		VALUES ($1, $2, $2, 'member')
		ON CONFLICT DO NOTHING
	`, groupID, creatorID); err != nil {
		return 0, appErrors.New(appErrors.CodeInternal, "erreur lors de l'ajout du créateur aux membres du groupe", err)
	}

	// Insère les autres membres invités
	for _, id := range memberIDs {
		if _, err = r.db.Exec(`
			INSERT INTO group_members (groupid, userid, invitedby, status)
			VALUES ($1, $2, $3, 'member')
			ON CONFLICT DO NOTHING
		`, groupID, id, creatorID); err != nil {
			return 0, appErrors.New(appErrors.CodeInternal, "erreur lors de l'invitation des membres au groupe", err)
		}
	}

	return groupID, nil
}

func (r *GroupRepo) GetUserGroups(userID int64) ([]GroupInfo, error) {
	rows, err := r.db.Query(`
		SELECT g.id, g.title
		FROM groups g
		JOIN group_members gm ON g.id = gm.groupid
		WHERE gm.userid = $1 AND gm.status = 'member'
	`, userID)
	if err != nil {
		return nil, appErrors.New(appErrors.CodeInternal, "erreur lors de la récupération des groupes de l'utilisateur", err)
	}
	defer rows.Close()

	var groups []GroupInfo
	for rows.Next() {
		var g GroupInfo
		if err := rows.Scan(&g.ID, &g.Title); err != nil {
			return nil, appErrors.New(appErrors.CodeInternal, "erreur lors de la lecture des informations de groupe", err)
		}

		// Extraction des initiales
		words := strings.Fields(g.Title)
		if len(words) > 0 {
			g.Initials = string([]rune(words[0])[0:1])
			if len(words) > 1 {
				g.Initials += string([]rune(words[1])[0:1])
			}
		}
		g.Initials = strings.ToUpper(g.Initials)

		// Récupération des IDs des membres associés
		memberIDs, err := r.GetGroupMemberIDs(g.ID)
		if err != nil {
			return nil, err // Laisse circuler l'appError générée par GetGroupMemberIDs
		}
		g.MemberIDs = memberIDs

		groups = append(groups, g)
	}

	if err = rows.Err(); err != nil {
		return nil, appErrors.New(appErrors.CodeInternal, "erreur lors du parcours des lignes de groupes", err)
	}

	return groups, nil
}

func (r *GroupRepo) GetGroupMemberIDs(groupID int64) ([]int64, error) {
	rows, err := r.db.Query(`
		SELECT userid FROM group_members
		WHERE groupid = $1 AND status = 'member'
	`, groupID)
	if err != nil {
		return nil, appErrors.New(appErrors.CodeInternal, "erreur lors de la récupération des IDs des membres", err)
	}
	defer rows.Close()

	var ids []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, appErrors.New(appErrors.CodeInternal, "erreur lors de la lecture de l'ID membre", err)
		}
		ids = append(ids, id)
	}

	if err = rows.Err(); err != nil {
		return nil, appErrors.New(appErrors.CodeInternal, "erreur lors du parcours des membres", err)
	}
	return ids, nil
}

func (r *GroupRepo) LeaveGroup(groupID, userID int64) error {
	res, err := r.db.Exec(`
		DELETE FROM group_members
		WHERE groupid = $1 AND userid = $2
	`, groupID, userID)
	if err != nil {
		return appErrors.New(appErrors.CodeInternal, "erreur lors de la tentative de quitter le groupe", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err == nil && rowsAffected == 0 {
		return appErrors.New(appErrors.CodeNotFound, "l'utilisateur n'est pas membre de ce groupe ou le groupe n'existe pas", nil)
	}

	return nil
}

func (r *GroupRepo) IsGroupMember(groupID, userID int64) (bool, error) {
	var count int
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM group_members
		WHERE groupid = $1 AND userid = $2 AND status = 'member'
	`, groupID, userID).Scan(&count)
	if err != nil {
		return false, appErrors.New(appErrors.CodeInternal, "erreur de vérification d'appartenance au groupe", err)
	}
	return count > 0, nil
}

func (r *GroupRepo) CreateGroupMessage(groupID, senderID int64, content string) error {
	_, err := r.db.Exec(`
		INSERT INTO group_chats (groupid, senderid, content)
		VALUES ($1, $2, $3)
	`, groupID, senderID, content)
	if err != nil {
		return appErrors.New(appErrors.CodeInternal, "erreur lors de l'enregistrement du message de groupe", err)
	}
	return nil
}

func (r *GroupRepo) GetGroupMessages(groupID int64) ([]model.GroupMessage, error) {
	rows, err := r.db.Query(`
		SELECT id, groupid, senderid, content, createdat
		FROM group_chats
		WHERE groupid = $1
		ORDER BY createdat ASC
	`, groupID)
	if err != nil {
		return nil, appErrors.New(appErrors.CodeInternal, "erreur lors de la récupération de l'historique des messages", err)
	}
	defer rows.Close()

	var messages []model.GroupMessage
	for rows.Next() {
		var msg model.GroupMessage
		var createdAt time.Time
		if err := rows.Scan(&msg.ID, &msg.GroupID, &msg.SenderID, &msg.Body, &createdAt); err != nil {
			return nil, appErrors.New(appErrors.CodeInternal, "erreur lors du décodage du message de groupe", err)
		}
		msg.SentAt = createdAt
		messages = append(messages, msg)
	}

	if err = rows.Err(); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, appErrors.New(appErrors.CodeNotFound, "aucun message trouvé pour ce groupe", err)
		}
		return nil, appErrors.New(appErrors.CodeInternal, "erreur lors du parcours des messages", err)
	}

	return messages, nil
}
