package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"social-network/backend/internal/model"
)

type GroupInfo struct {
	ID        int64   `json:"id"`
	Title     string  `json:"title"`
	Initials  string  `json:"initials"`
	MemberIDs []int64 `json:"member_ids"`
	CreatorID int64   `json:"creator_id"`
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

func (r *GroupRepo) GetGroupTitle(groupID int64) (string, error) {
	var title string
	err := r.db.QueryRow(`SELECT title FROM groups WHERE id = $1`, groupID).Scan(&title)
	return title, err
}

func (r *GroupRepo) GetUserGroups(userID int64) ([]GroupInfo, error) {
	rows, err := r.db.Query(`
		SELECT g.id, g.title, g.creatorid
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
		if err := rows.Scan(&g.ID, &g.Title, &g.CreatorID); err != nil {
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

func (r *GroupRepo) GetGroupPosts(groupID, viewerID int64) ([]model.GroupPost, error) {
	rows, err := r.db.Query(`
		SELECT gp.id, gp.title, gp.content, gp.createdat,
		       COALESCE(u.pseudo, ''), COALESCE(u.avatar, ''),
		       COALESCE((SELECT COUNT(*) FROM group_post_likes l WHERE l.group_post_id = gp.id AND l."type" = 'like'), 0),
		       COALESCE((SELECT COUNT(*) FROM group_post_likes l WHERE l.group_post_id = gp.id AND l."type" = 'dislike'), 0),
		       COALESCE((SELECT l."type" FROM group_post_likes l WHERE l.group_post_id = gp.id AND l.user_id = $2), '')
		FROM group_posts gp
		JOIN users u ON gp.authorid = u.id
		WHERE gp.groupid = $1
		ORDER BY gp.createdat DESC
	`, groupID, viewerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	posts := make([]model.GroupPost, 0)
	for rows.Next() {
		var p model.GroupPost
		var createdAt time.Time
		if err := rows.Scan(&p.ID, &p.Title, &p.Content, &createdAt, &p.Author.Username, &p.Author.ProfilePicture, &p.Likes, &p.Dislikes, &p.UserLike); err != nil {
			return nil, err
		}
		p.CreatedAt = createdAt.Format(time.RFC3339)
		posts = append(posts, p)
	}
	return posts, rows.Err()
}

func (r *GroupRepo) AddGroupLike(groupPostID, userID int64, likeType string) error {
	_, err := r.db.Exec(`DELETE FROM group_post_likes WHERE group_post_id = $1 AND user_id = $2`, groupPostID, userID)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(`INSERT INTO group_post_likes (group_post_id, user_id, "type") VALUES ($1, $2, $3)`, groupPostID, userID, likeType)
	return err
}

func (r *GroupRepo) RemoveGroupLike(groupPostID, userID int64) error {
	_, err := r.db.Exec(`DELETE FROM group_post_likes WHERE group_post_id = $1 AND user_id = $2`, groupPostID, userID)
	return err
}

func (r *GroupRepo) GetGroupPostAuthorID(groupPostID int64) (int64, error) {
	var authorID int64
	err := r.db.QueryRow(`SELECT authorid FROM group_posts WHERE id = $1`, groupPostID).Scan(&authorID)
	return authorID, err
}

func (r *GroupRepo) GetGroupLikeCounts(groupPostID int64) (likes int, dislikes int, err error) {
	rows, err := r.db.Query(`
		SELECT "type", COUNT(*) FROM group_post_likes
		WHERE group_post_id = $1
		GROUP BY "type"
	`, groupPostID)
	if err != nil {
		return 0, 0, err
	}
	defer rows.Close()
	for rows.Next() {
		var t string
		var count int
		if err := rows.Scan(&t, &count); err != nil {
			continue
		}
		if t == "like" {
			likes = count
		} else {
			dislikes = count
		}
	}
	return likes, dislikes, rows.Err()
}

func (r *GroupRepo) CreateGroupPost(groupID, authorID int64, title, content string) error {
	_, err := r.db.Exec(`
		INSERT INTO group_posts (groupid, authorid, title, content)
		VALUES ($1, $2, $3, $4)
	`, groupID, authorID, title, content)
	return err
}

func (r *GroupRepo) GetGroupPostByID(groupID, postID, viewerID int64) (model.GroupPost, error) {
	var p model.GroupPost
	var createdAt time.Time
	err := r.db.QueryRow(`
		SELECT gp.id, gp.title, gp.content, gp.createdat,
		       COALESCE(u.pseudo, ''), COALESCE(u.avatar, ''),
		       COALESCE((SELECT COUNT(*) FROM group_post_likes l WHERE l.group_post_id = gp.id AND l."type" = 'like'), 0),
		       COALESCE((SELECT COUNT(*) FROM group_post_likes l WHERE l.group_post_id = gp.id AND l."type" = 'dislike'), 0),
		       COALESCE((SELECT l."type" FROM group_post_likes l WHERE l.group_post_id = gp.id AND l.user_id = $3), '')
		FROM group_posts gp
		JOIN users u ON gp.authorid = u.id
		WHERE gp.id = $1 AND gp.groupid = $2
	`, postID, groupID, viewerID).Scan(&p.ID, &p.Title, &p.Content, &createdAt, &p.Author.Username, &p.Author.ProfilePicture, &p.Likes, &p.Dislikes, &p.UserLike)
	if err != nil {
		return model.GroupPost{}, err
	}
	p.CreatedAt = createdAt.Format(time.RFC3339)
	return p, nil
}

func (r *GroupRepo) DeleteGroupPost(postID, authorID int64) error {
	result, err := r.db.Exec(`
		DELETE FROM group_posts WHERE id = $1 AND authorid = $2
	`, postID, authorID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("non autorisé ou post introuvable")
	}
	return nil
}

func (r *GroupRepo) GetGroupComments(postID int64) ([]model.GroupComment, error) {
	rows, err := r.db.Query(`
		SELECT gc.id, gc.content, gc.createdat,
		       u.pseudo, COALESCE(u.avatar, '')
		FROM group_comments gc
		JOIN users u ON gc.authorid = u.id
		WHERE gc.postid = $1
		ORDER BY gc.createdat ASC
	`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := make([]model.GroupComment, 0)
	for rows.Next() {
		var c model.GroupComment
		var createdAt time.Time
		if err := rows.Scan(&c.ID, &c.Content, &createdAt, &c.Author.Username, &c.Author.ProfilePicture); err != nil {
			return nil, err
		}
		c.CreatedAt = createdAt.Format(time.RFC3339)
		comments = append(comments, c)
	}
	return comments, rows.Err()
}

func (r *GroupRepo) AddGroupComment(postID, authorID int64, content string) error {
	_, err := r.db.Exec(`
		INSERT INTO group_comments (postid, authorid, content)
		VALUES ($1, $2, $3)
	`, postID, authorID, content)
	return err
}

func (r *GroupRepo) DeleteGroupComment(commentID, authorID int64) error {
	result, err := r.db.Exec(`
		DELETE FROM group_comments WHERE id = $1 AND authorid = $2
	`, commentID, authorID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("non autorisé ou commentaire introuvable")
	}
	return nil
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

func (r *GroupRepo) RemoveGroupMember(groupID, targetUserID, requestingUserID int64) error {
	var creatorID int64
	err := r.db.QueryRow(`SELECT creatorid FROM groups WHERE id = $1`, groupID).Scan(&creatorID)
	if err != nil {
		return err
	}
	if creatorID != requestingUserID {
		return fmt.Errorf("non autorisé")
	}
	if targetUserID == requestingUserID {
		return fmt.Errorf("le créateur ne peut pas se retirer lui-même")
	}
	_, err = r.db.Exec(`DELETE FROM group_members WHERE groupid = $1 AND userid = $2`, groupID, targetUserID)
	return err
}

func (r *GroupRepo) AddGroupMember(groupID, userID, invitedByID int64) error {
	_, err := r.db.Exec(`
		INSERT INTO group_members (groupid, userid, invitedby, status)
		VALUES ($1, $2, $3, 'member')
		ON CONFLICT DO NOTHING
	`, groupID, userID, invitedByID)
	return err
}

type GroupMember struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Initials  string `json:"initials"`
	IsCreator bool   `json:"isCreator"`
}

func (r *GroupRepo) GetGroupMembers(groupID int) ([]GroupMember, error) {
	rows, err := r.db.Query(`
		SELECT u.id,
		       u.firstname,
		       u.lastname,
		       CASE WHEN g.creatorid = u.id THEN true ELSE false END AS is_creator
		FROM group_members gm
		JOIN users u ON u.id = gm.userid
		JOIN groups g ON g.id = gm.groupid
		WHERE gm.groupid = $1 AND gm.status = 'member'
		ORDER BY is_creator DESC, u.firstname, u.lastname
	`, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := make([]GroupMember, 0)
	for rows.Next() {
		var m GroupMember
		var firstname, lastname string
		if err := rows.Scan(&m.ID, &firstname, &lastname, &m.IsCreator); err != nil {
			return nil, err
		}
		m.Name = firstname
		if len(lastname) > 0 {
			m.Name += " " + lastname
		}
		if len(firstname) > 0 {
			m.Initials += strings.ToUpper(string([]rune(firstname)[0]))
		}
		if len(lastname) > 0 {
			m.Initials += strings.ToUpper(string([]rune(lastname)[0]))
		}
		members = append(members, m)
	}
	return members, rows.Err()
}
