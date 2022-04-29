import type { ApiParams } from '../__internal__/DataTypes';

const getGroupWithId = 'getGroupWithId';
const getJoinedGroups = 'getJoinedGroups';
const fetchJoinedGroupsFromServer = 'fetchJoinedGroupsFromServer';
const fetchPublicGroupsFromServer = 'fetchPublicGroupsFromServer';
const createGroup = 'createGroup';
const fetchGroupInfoFromServer = 'fetchGroupInfoFromServer';
const fetchMemberListFromServer = 'fetchMemberListFromServer';
const fetchBlockListFromServer = 'fetchBlockListFromServer';
const fetchMuteListFromServer = 'fetchMuteListFromServer';
const fetchWhiteListFromServer = 'fetchWhiteListFromServer';
const isMemberInWhiteListFromServer = 'isMemberInWhiteListFromServer';
const fetchGroupFileListFromServer = 'fetchGroupFileListFromServer';
const fetchAnnouncementFromServer = 'fetchAnnouncementFromServer';
const addMembers = 'addMembers';
const inviterUser = 'inviterUser';
const removeMembers = 'removeMembers';
const blockMembers = 'blockMembers';
const unblockMembers = 'unblockMembers';
const changeGroupName = 'changeGroupName';
const changeGroupDescription = 'changeGroupDescription';
const leaveGroup = 'leaveGroup';
const destroyGroup = 'destroyGroup';
const blockGroup = 'blockGroup';
const unblockGroup = 'unblockGroup';
const changeOwner = 'changeOwner';
const addAdmin = 'addAdmin';
const removeAdmin = 'removeAdmin';
const muteMembers = 'muteMembers';
const unMuteMembers = 'unMuteMembers';
const muteAllMembers = 'muteAllMembers';
const unMuteAllMembers = 'unMuteAllMembers';
const addWhiteList = 'addWhiteList';
const removeWhiteList = 'removeWhiteList';
const uploadGroupSharedFile = 'uploadGroupSharedFile';
const downloadGroupSharedFile = 'downloadGroupSharedFile';
const removeGroupSharedFile = 'removeGroupSharedFile';
const updateGroupAnnouncement = 'updateGroupAnnouncement';
const updateGroupExtension = 'updateGroupExtension';
const joinPublicGroup = 'joinPublicGroup';
const requestToJoinPublicGroup = 'requestToJoinPublicGroup';
const acceptJoinApplication = 'acceptJoinApplication';
const declineJoinApplication = 'declineJoinApplication';
const acceptInvitation = 'acceptInvitation';
const declineInvitation = 'declineInvitation';

/**
 * 本地使用不导出
 */
export const MN = {
  getGroupWithId,
  getJoinedGroups,
  fetchJoinedGroupsFromServer,
  fetchPublicGroupsFromServer,
  createGroup,
  fetchGroupInfoFromServer,
  fetchMemberListFromServer,
  fetchBlockListFromServer,
  fetchMuteListFromServer,
  fetchWhiteListFromServer,
  isMemberInWhiteListFromServer,
  fetchGroupFileListFromServer,
  fetchAnnouncementFromServer,
  addMembers,
  inviterUser,
  removeMembers,
  blockMembers,
  unblockMembers,
  changeGroupName,
  changeGroupDescription,
  leaveGroup,
  destroyGroup,
  blockGroup,
  unblockGroup,
  changeOwner,
  addAdmin,
  removeAdmin,
  muteMembers,
  unMuteMembers,
  muteAllMembers,
  unMuteAllMembers,
  addWhiteList,
  removeWhiteList,
  uploadGroupSharedFile,
  downloadGroupSharedFile,
  removeGroupSharedFile,
  updateGroupAnnouncement,
  updateGroupExtension,
  joinPublicGroup,
  requestToJoinPublicGroup,
  acceptJoinApplication,
  declineJoinApplication,
  acceptInvitation,
  declineInvitation,
};

export const metaDataList = new Map<string, ApiParams>([
  [
    MN.getGroupWithId,
    {
      methodName: MN.getGroupWithId,
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
    MN.getJoinedGroups,
    {
      methodName: MN.getJoinedGroups,
      params: [],
    },
  ],
  [
    MN.fetchJoinedGroupsFromServer,
    {
      methodName: MN.fetchJoinedGroupsFromServer,
      params: [
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 1,
        },
        {
          paramName: 'pageNum',
          paramType: 'number',
          paramDefaultValue: 10,
        },
      ],
    },
  ],
  [
    MN.fetchPublicGroupsFromServer,
    {
      methodName: MN.fetchPublicGroupsFromServer,
      params: [
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 1,
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
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
          paramName: 'options',
          paramType: 'object',
          paramDefaultValue: {
            style: 0,
            maxCount: 200,
            inviteNeedConfirm: false,
            ext: '',
          },
        },
      ],
    },
  ],
  [
    MN.fetchGroupInfoFromServer,
    {
      methodName: MN.fetchGroupInfoFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180089992052737',
        },
      ],
    },
  ],
  [
    MN.fetchMemberListFromServer,
    {
      methodName: MN.fetchMemberListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 1,
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
        },
      ],
    },
  ],
  [
    MN.fetchBlockListFromServer,
    {
      methodName: MN.fetchBlockListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 10,
        },
        {
          paramName: 'pageNum',
          paramType: 'number',
          paramDefaultValue: 1,
        },
      ],
    },
  ],
  [
    MN.fetchMuteListFromServer,
    {
      methodName: MN.fetchMuteListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 10,
        },
        {
          paramName: 'pageNum',
          paramType: 'number',
          paramDefaultValue: 1,
        },
      ],
    },
  ],
  [
    MN.fetchWhiteListFromServer,
    {
      methodName: MN.fetchWhiteListFromServer,
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
    MN.isMemberInWhiteListFromServer,
    {
      methodName: MN.isMemberInWhiteListFromServer,
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
    MN.fetchGroupFileListFromServer,
    {
      methodName: MN.fetchGroupFileListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 10,
        },
        {
          paramName: 'pageNum',
          paramType: 'number',
          paramDefaultValue: 1,
        },
      ],
    },
  ],
  [
    MN.addMembers,
    {
      methodName: MN.addMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['som'],
        },
        {
          paramName: 'welcome',
          paramType: 'string',
          paramDefaultValue: 'welcome',
        },
      ],
    },
  ],
  [
    MN.inviterUser,
    {
      methodName: MN.inviterUser,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['som'],
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'welcome',
        },
      ],
    },
  ],
  [
    MN.removeMembers,
    {
      methodName: MN.removeMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['som', 'ljn'],
        },
      ],
    },
  ],
  [
    MN.blockMembers,
    {
      methodName: MN.blockMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['som'],
        },
      ],
    },
  ],
  [
    MN.unblockMembers,
    {
      methodName: MN.unblockMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['som'],
        },
      ],
    },
  ],
  [
    MN.changeGroupName,
    {
      methodName: MN.changeGroupName,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'name',
          paramType: 'string',
          paramDefaultValue: 'newName',
        },
      ],
    },
  ],
  [
    MN.changeGroupDescription,
    {
      methodName: MN.changeGroupDescription,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'desc',
          paramType: 'string',
          paramDefaultValue: 'new description',
        },
      ],
    },
  ],
  [
    MN.leaveGroup,
    {
      methodName: MN.leaveGroup,
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
    MN.blockGroup,
    {
      methodName: MN.blockGroup,
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
    MN.unblockGroup,
    {
      methodName: MN.unblockGroup,
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
    MN.changeOwner,
    {
      methodName: MN.changeOwner,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'newOwner',
          paramType: 'string',
          paramDefaultValue: 'asterisk005',
        },
      ],
    },
  ],
  [
    MN.addAdmin,
    {
      methodName: MN.addAdmin,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'memberId',
          paramType: 'string',
          paramDefaultValue: 'asterisk005',
        },
      ],
    },
  ],
  [
    MN.removeAdmin,
    {
      methodName: MN.removeAdmin,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'memberId',
          paramType: 'string',
          paramDefaultValue: 'asterisk005',
        },
      ],
    },
  ],
  [
    MN.muteMembers,
    {
      methodName: MN.muteMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk005'],
        },
        {
          paramName: 'duration',
          paramType: 'number',
          paramDefaultValue: 1000,
        },
      ],
    },
  ],
  [
    MN.unMuteMembers,
    {
      methodName: MN.unMuteMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk005'],
        },
      ],
    },
  ],
  [
    MN.muteAllMembers,
    {
      methodName: MN.muteAllMembers,
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
    MN.unMuteAllMembers,
    {
      methodName: MN.unMuteAllMembers,
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
    MN.addWhiteList,
    {
      methodName: MN.addWhiteList,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk005'],
        },
      ],
    },
  ],
  [
    MN.removeWhiteList,
    {
      methodName: MN.removeWhiteList,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk005'],
        },
      ],
    },
  ],
  [
    MN.uploadGroupSharedFile,
    {
      methodName: MN.uploadGroupSharedFile,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'filePath',
          paramType: 'string',
          paramDefaultValue: '',
        },
      ],
    },
  ],
  [
    MN.downloadGroupSharedFile,
    {
      methodName: MN.downloadGroupSharedFile,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'fileId',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'savePath',
          paramType: 'string',
          paramDefaultValue: '',
        },
      ],
    },
  ],
  [
    MN.removeGroupSharedFile,
    {
      methodName: MN.removeGroupSharedFile,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'fileId',
          paramType: 'string',
          paramDefaultValue: '',
        },
      ],
    },
  ],
  [
    MN.updateGroupAnnouncement,
    {
      methodName: MN.updateGroupAnnouncement,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'announcement',
          paramType: 'string',
          paramDefaultValue: 'new announcement',
        },
      ],
    },
  ],
  [
    MN.updateGroupExtension,
    {
      methodName: MN.updateGroupExtension,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'extension',
          paramType: 'string',
          paramDefaultValue: 'new extension',
        },
      ],
    },
  ],
  [
    MN.joinPublicGroup,
    {
      methodName: MN.joinPublicGroup,
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
    MN.requestToJoinPublicGroup,
    {
      methodName: MN.requestToJoinPublicGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'join in',
        },
      ],
    },
  ],
  [
    MN.acceptJoinApplication,
    {
      methodName: MN.acceptJoinApplication,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: '',
        },
      ],
    },
  ],
  [
    MN.declineJoinApplication,
    {
      methodName: MN.declineJoinApplication,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'reason',
        },
      ],
    },
  ],
  [
    MN.acceptInvitation,
    {
      methodName: MN.acceptInvitation,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'inviter',
          paramType: 'string',
          paramDefaultValue: '',
        },
      ],
    },
  ],
  [
    MN.declineInvitation,
    {
      methodName: MN.declineInvitation,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180001518452737',
        },
        {
          paramName: 'inviter',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'reason',
        },
      ],
    },
  ],
]);
