import type { ApiParams } from '../__internal__/DataTypes';

const getAllGroups = 'getAllGroups';
const getGroup = 'getGroup';
const createGroup = 'createGroup';
const asyncCreateGroup = 'asyncCreateGroup';
const loadAllGroups = 'loadAllGroups';
const destroyGroup = 'destroyGroup';
const asyncDestroyGroup = 'asyncDestroyGroup';
const addUsersToGroup = 'addUsersToGroup';
const asyncAddUsersToGroup = 'asyncAddUsersToGroup';
const removeUserFromGroup = 'removeUserFromGroup';
const asyncRemoveUserFromGroup = 'asyncRemoveUserFromGroup';
const removeUsersFromGroup = 'removeUsersFromGroup';
const asyncRemoveUsersFromGroup = 'asyncRemoveUsersFromGroup';
const leaveGroup = 'leaveGroup';
const asyncLeaveGroup = 'asyncLeaveGroup';
const getGroupFromServer = 'getGroupFromServer';
const asyncGetGroupFromServer = 'asyncGetGroupFromServer';
const getJoinedGroupsFromServer = 'getJoinedGroupsFromServer';
const asyncGetJoinedGroupsFromServer = 'asyncGetJoinedGroupsFromServer';
const getPublicGroupsFromServer = 'getPublicGroupsFromServer';
const asyncGetPublicGroupsFromServer = 'asyncGetPublicGroupsFromServer';
const joinGroup = 'joinGroup';
const asyncJoinGroup = 'asyncJoinGroup';
const changeGroupName = 'changeGroupName';
const asyncChangeGroupName = 'asyncChangeGroupName';
const changeGroupDescription = 'changeGroupDescription';
const asyncChangeGroupDescription = 'asyncChangeGroupDescription';
const acceptInvitation = 'acceptInvitation';
const asyncAcceptInvitation = 'asyncAcceptInvitation';
const declineInvitation = 'declineInvitation';
const asyncDeclineInvitation = 'asyncDeclineInvitation';
const acceptApplication = 'acceptApplication';
const asyncAcceptApplication = 'asyncAcceptApplication';
const declineApplication = 'declineApplication';
const asyncDeclineApplication = 'asyncDeclineApplication';
const inviteUser = 'inviteUser';
const asyncInviteUser = 'asyncInviteUser';
const applyJoinToGroup = 'applyJoinToGroup';
const asyncApplyJoinToGroup = 'asyncApplyJoinToGroup';
const blockGroupMessage = 'blockGroupMessage';
const asyncBlockGroupMessage = 'asyncBlockGroupMessage';
const unblockGroupMessage = 'unblockGroupMessage';
const asyncUnblockGroupMessage = 'asyncUnblockGroupMessage';
const blockUser = 'blockUser';
const asyncBlockUser = 'asyncBlockUser';
const blockUsers = 'blockUsers';
const asyncBlockUsers = 'asyncBlockUsers';
const unblockUser = 'unblockUser';
const asyncUnblockUser = 'asyncUnblockUser';
const unblockUsers = 'unblockUsers';
const asyncUnblockUsers = 'asyncUnblockUsers';
const getBlockedUsers = 'getBlockedUsers';
const asyncGetBlockedUsers = 'asyncGetBlockedUsers';
const fetchGroupMembers = 'fetchGroupMembers';
const asyncFetchGroupMembers = 'asyncFetchGroupMembers';
const changeOwner = 'changeOwner';
const asyncChangeOwner = 'asyncChangeOwner';
const addGroupAdmin = 'addGroupAdmin';
const asyncAddGroupAdmin = 'asyncAddGroupAdmin';
const removeGroupAdmin = 'removeGroupAdmin';
const asyncRemoveGroupAdmin = 'asyncRemoveGroupAdmin';
const muteGroupMembers = 'muteGroupMembers';
const asyncMuteGroupMembers = 'asyncMuteGroupMembers';
const unMuteGroupMembers = 'unMuteGroupMembers';
const asyncUnMuteGroupMembers = 'asyncUnMuteGroupMembers';
const fetchGroupMuteList = 'fetchGroupMuteList';
const asyncFetchGroupMuteList = 'asyncFetchGroupMuteList';
const fetchGroupBlackList = 'fetchGroupBlackList';
const asyncFetchGroupBlackList = 'asyncFetchGroupBlackList';
const addToGroupWhiteList = 'addToGroupWhiteList';
const removeFromGroupWhiteList = 'removeFromGroupWhiteList';
const checkIfInGroupWhiteList = 'checkIfInGroupWhiteList';
const fetchGroupWhiteList = 'fetchGroupWhiteList';
const muteAllMembers = 'muteAllMembers';
const unmuteAllMembers = 'unmuteAllMembers';
const updateGroupAnnouncement = 'updateGroupAnnouncement';
const asyncUpdateGroupAnnouncement = 'asyncUpdateGroupAnnouncement';
const fetchGroupAnnouncement = 'fetchGroupAnnouncement';
const asyncFetchGroupAnnouncement = 'asyncFetchGroupAnnouncement';
const uploadGroupSharedFile = 'uploadGroupSharedFile';
const asyncUploadGroupSharedFile = 'asyncUploadGroupSharedFile';
const fetchGroupSharedFileList = 'fetchGroupSharedFileList';
const asyncFetchGroupSharedFileList = 'asyncFetchGroupSharedFileList';
const deleteGroupSharedFile = 'deleteGroupSharedFile';
const asyncDeleteGroupSharedFile = 'asyncDeleteGroupSharedFile';
const downloadGroupSharedFile = 'downloadGroupSharedFile';
const asyncDownloadGroupSharedFile = 'asyncDownloadGroupSharedFile';
const updateGroupExtension = 'updateGroupExtension';
/**
 * 本地使用不导出
 */
export const MN = {
  getAllGroups,
  getGroup,
  createGroup,
  asyncCreateGroup,
  loadAllGroups,
  destroyGroup,
  asyncDestroyGroup,
  addUsersToGroup,
  asyncAddUsersToGroup,
  removeUserFromGroup,
  asyncRemoveUserFromGroup,
  removeUsersFromGroup,
  asyncRemoveUsersFromGroup,
  leaveGroup,
  asyncLeaveGroup,
  getGroupFromServer,
  asyncGetGroupFromServer,
  getJoinedGroupsFromServer,
  asyncGetJoinedGroupsFromServer,
  getPublicGroupsFromServer,
  asyncGetPublicGroupsFromServer,
  joinGroup,
  asyncJoinGroup,
  changeGroupName,
  asyncChangeGroupName,
  changeGroupDescription,
  asyncChangeGroupDescription,
  acceptInvitation,
  asyncAcceptInvitation,
  declineInvitation,
  asyncDeclineInvitation,
  acceptApplication,
  asyncAcceptApplication,
  declineApplication,
  asyncDeclineApplication,
  inviteUser,
  asyncInviteUser,
  applyJoinToGroup,
  asyncApplyJoinToGroup,
  blockGroupMessage,
  asyncBlockGroupMessage,
  unblockGroupMessage,
  asyncUnblockGroupMessage,
  blockUser,
  asyncBlockUser,
  blockUsers,
  asyncBlockUsers,
  unblockUser,
  asyncUnblockUser,
  unblockUsers,
  asyncUnblockUsers,
  getBlockedUsers,
  asyncGetBlockedUsers,
  fetchGroupMembers,
  asyncFetchGroupMembers,
  changeOwner,
  asyncChangeOwner,
  addGroupAdmin,
  asyncAddGroupAdmin,
  removeGroupAdmin,
  asyncRemoveGroupAdmin,
  muteGroupMembers,
  asyncMuteGroupMembers,
  unMuteGroupMembers,
  asyncUnMuteGroupMembers,
  fetchGroupMuteList,
  asyncFetchGroupMuteList,
  fetchGroupBlackList,
  asyncFetchGroupBlackList,
  addToGroupWhiteList,
  removeFromGroupWhiteList,
  checkIfInGroupWhiteList,
  fetchGroupWhiteList,
  muteAllMembers,
  unmuteAllMembers,
  updateGroupAnnouncement,
  asyncUpdateGroupAnnouncement,
  fetchGroupAnnouncement,
  asyncFetchGroupAnnouncement,
  uploadGroupSharedFile,
  asyncUploadGroupSharedFile,
  fetchGroupSharedFileList,
  asyncFetchGroupSharedFileList,
  deleteGroupSharedFile,
  asyncDeleteGroupSharedFile,
  downloadGroupSharedFile,
  asyncDownloadGroupSharedFile,
  updateGroupExtension,
};

export const metaDataList = new Map<string, ApiParams>([
  [
    MN.getAllGroups,
    {
      methodName: MN.getAllGroups,
      params: [],
    },
  ],
  [
    MN.getGroup,
    {
      methodName: MN.getGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
      ],
    },
  ],
  [
    MN.createGroup,
    {
      methodName: MN.createGroup,
      params: [
        {
          paramName: 'groupName',
          paramType: 'string',
          paramDefaultValue: '测试-110',
        },
        {
          paramName: 'desc',
          paramType: 'string',
          paramDefaultValue: 'This is a test group',
        },
        {
          paramName: 'allMembers',
          paramType: 'object',
          paramDefaultValue: ['test', 'som', 'ljn'],
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'hello',
        },
        {
          paramName: 'option',
          paramType: 'object',
          paramDefaultValue: {
            style: 0,
            maxUsers: 200,
            inviteNeedConfirm: false,
          },
        },
      ],
    },
  ],
  [
    MN.asyncCreateGroup,
    {
      methodName: MN.asyncCreateGroup,
      params: [
        {
          paramName: 'groupName',
          paramType: 'string',
          paramDefaultValue: '测试-110',
        },
        {
          paramName: 'desc',
          paramType: 'string',
          paramDefaultValue: 'This is a test group',
        },
        {
          paramName: 'allMembers',
          paramType: 'object',
          paramDefaultValue: ['test', 'som', 'ljn'],
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'hello',
        },
        {
          paramName: 'option',
          paramType: 'object',
          paramDefaultValue: {
            style: 0,
            maxUsers: 200,
            inviteNeedConfirm: false,
          },
        },
      ],
    },
  ],
  [
    MN.loadAllGroups,
    {
      methodName: MN.loadAllGroups,
      params: [],
    },
  ],
  [
    MN.destroyGroup,
    {
      methodName: MN.destroyGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
      ],
    },
  ],
  [
    MN.asyncDestroyGroup,
    {
      methodName: MN.asyncDestroyGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
      ],
    },
  ],
  [
    MN.addUsersToGroup,
    {
      methodName: MN.addUsersToGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
            paramName: 'newmembers',
            paramType: 'object',
            paramDefaultValue: ['som', 'ljn'],
          },
      ],
    },
  ],
]);
