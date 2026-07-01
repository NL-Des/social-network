package service

import (
	"social-network/backend/internal/model"
	"social-network/backend/internal/repository"
)

type GroupService struct {
	repo *repository.GroupRepo
}

func NewGroupService(repo *repository.GroupRepo) *GroupService {
	return &GroupService{repo: repo}
}

func (s *GroupService) CreateGroup(title, description string, creatorID int64, memberIDs []int64) (int64, error) {
	return s.repo.CreateGroup(title, description, creatorID, memberIDs)
}

func (s *GroupService) GetUserGroups(userID int64) ([]repository.GroupInfo, error) {
	return s.repo.GetUserGroups(userID)
}


func (s *GroupService) IsGroupMember(groupID, userID int64) (bool, error) {
	return s.repo.IsGroupMember(groupID, userID)
}

func (s *GroupService) GetGroupMemberIDs(groupID int64) ([]int64, error) {
	return s.repo.GetGroupMemberIDs(groupID)
}

func (s *GroupService) LeaveGroup(groupID, userID int64) error {
	return s.repo.LeaveGroup(groupID, userID)
}

func (s *GroupService) GetGroupPosts(groupID, viewerID int64) ([]model.GroupPost, error) {
	return s.repo.GetGroupPosts(groupID, viewerID)
}

func (s *GroupService) CreateGroupPost(groupID, authorID int64, title, content, image string) error {
	return s.repo.CreateGroupPost(groupID, authorID, title, content, image)
}

func (s *GroupService) GetGroupPostByID(groupID, postID, viewerID int64) (model.GroupPost, error) {
	return s.repo.GetGroupPostByID(groupID, postID, viewerID)
}

func (s *GroupService) AddGroupLike(groupPostID, userID int64, likeType string) error {
	return s.repo.AddGroupLike(groupPostID, userID, likeType)
}

func (s *GroupService) RemoveGroupLike(groupPostID, userID int64) error {
	return s.repo.RemoveGroupLike(groupPostID, userID)
}

func (s *GroupService) GetGroupLikeCounts(groupPostID int64) (int, int, error) {
	return s.repo.GetGroupLikeCounts(groupPostID)
}

func (s *GroupService) GetGroupPostAuthorID(groupPostID int64) (int64, error) {
	return s.repo.GetGroupPostAuthorID(groupPostID)
}

func (s *GroupService) DeleteGroupPost(postID, authorID int64) error {
	return s.repo.DeleteGroupPost(postID, authorID)
}

func (s *GroupService) GetGroupComments(postID int64) ([]model.GroupComment, error) {
	return s.repo.GetGroupComments(postID)
}

func (s *GroupService) AddGroupComment(postID, authorID int64, content, image string) error {
	return s.repo.AddGroupComment(postID, authorID, content, image)
}

func (s *GroupService) DeleteGroupComment(commentID, authorID int64) error {
	return s.repo.DeleteGroupComment(commentID, authorID)
}

func (s *GroupService) GetGroupMembers(groupID int) ([]repository.GroupMember, error) {
	return s.repo.GetGroupMembers(groupID)
}

func (s *GroupService) AddGroupMember(groupID, userID, invitedByID int64) error {
	return s.repo.AddGroupMember(groupID, userID, invitedByID)
}

func (s *GroupService) RemoveGroupMember(groupID, targetUserID, requestingUserID int64) error {
	return s.repo.RemoveGroupMember(groupID, targetUserID, requestingUserID)
}

func (s *GroupService) GetGroupTitle(groupID int64) (string, error) {
	return s.repo.GetGroupTitle(groupID)
}

func (s *GroupService) GetAllGroups(userID int64) ([]repository.GroupInfoWithStatus, error) {
	return s.repo.GetAllGroups(userID)
}

func (s *GroupService) CreateJoinRequest(groupID, userID int64) error {
	return s.repo.CreateJoinRequest(groupID, userID)
}

func (s *GroupService) CancelJoinRequest(groupID, userID int64) error {
	return s.repo.CancelJoinRequest(groupID, userID)
}

func (s *GroupService) GetJoinRequests(groupID int64) ([]repository.JoinRequest, error) {
	return s.repo.GetJoinRequests(groupID)
}

func (s *GroupService) ApproveJoinRequest(groupID, userID int64) error {
	return s.repo.ApproveJoinRequest(groupID, userID)
}

func (s *GroupService) RejectJoinRequest(groupID, userID int64) error {
	return s.repo.RejectJoinRequest(groupID, userID)
}

func (s *GroupService) InviteUserToGroup(groupID, targetUserID, inviterID int64) error {
	return s.repo.InviteUserToGroup(groupID, targetUserID, inviterID)
}

func (s *GroupService) AcceptGroupInvite(groupID, userID int64) error {
	return s.repo.AcceptGroupInvite(groupID, userID)
}

func (s *GroupService) DeclineGroupInvite(groupID, userID int64) error {
	return s.repo.DeclineGroupInvite(groupID, userID)
}

func (s *GroupService) GetGroupCreatorID(groupID int64) (int64, error) {
	return s.repo.GetGroupCreatorID(groupID)
}

func (s *GroupService) TransferAdmin(groupID, currentAdminID, newAdminID int64) error {
	return s.repo.TransferAdmin(groupID, currentAdminID, newAdminID)
}

func (s *GroupService) DeleteGroup(groupID, userID int64) error {
	return s.repo.DeleteGroup(groupID, userID)
}
