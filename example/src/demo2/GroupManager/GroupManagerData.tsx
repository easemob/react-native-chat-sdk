import type { StateGroupMessage } from './GroupManagerItem';
import type { ApiParams } from '../__internal__/DataTypes';
import RNFS from 'react-native-fs';

export const GROUPMN = {
  createGroup: 'createGroup',
  addMembers: 'addMembers',
  removeMembers: 'removeMembers',
  inviterUser: 'inviterUser',
  acceptInvitation: 'acceptInvitation',
  declineInvitation: 'declineInvitation',
  getGroupWithId: 'getGroupWithId',
  getJoinedGroups: 'getJoinedGroups',
  fetchJoinedGroupsFromServer: 'fetchJoinedGroupsFromServer',
  fetchGroupInfoFromServer: 'fetchGroupInfoFromServer',
  fetchMemberListFromServer: 'fetchMemberListFromServer',
  fetchMuteListFromServer: 'fetchMuteListFromServer',
  fetchWhiteListFromServer: 'fetchWhiteListFromServer',
  fetchGroupFileListFromServer: 'fetchGroupFileListFromServer',
  isMemberInWhiteListFromServer: 'isMemberInWhiteListFromServer',
  fetchAnnouncementFromServer: 'fetchAnnouncementFromServer',
  blockMembers: 'blockMembers',
  unblockMembers: 'unblockMembers',
  fetchBlockListFromServer: 'fetchBlockListFromServer',
  changeGroupName: 'changeGroupName',
  changeGroupDescription: 'changeGroupDescription',
  fetchPublicGroupsFromServer: 'fetchPublicGroupsFromServer',
  leaveGroup: 'leaveGroup',
  joinPublicGroup: 'joinPublicGroup',
  requestToJoinPublicGroup: 'requestToJoinPublicGroup',
  destroyGroup: 'destroyGroup',
  blockGroup: 'blockGroup',
  unblockGroup: 'unblockGroup',
  changeOwner: 'changeOwner',
  addAdmin: 'addAdmin',
  removeAdmin: 'removeAdmin',
  muteMembers: 'muteMembers',
  unMuteMembers: 'unMuteMembers',
  muteAllMembers: 'muteAllMembers',
  unMuteAllMembers: 'unMuteAllMembers',
  addWhiteList: 'addWhiteList',
  removeWhiteList: 'removeWhiteList',
  uploadGroupSharedFile: 'uploadGroupSharedFile',
  downloadGroupSharedFile: 'downloadGroupSharedFile',
  removeGroupSharedFile: 'removeGroupSharedFile',
  updateGroupAnnouncement: 'updateGroupAnnouncement',
  updateGroupExtension: 'updateGroupExtension',
  acceptJoinApplication: 'acceptJoinApplication',
  declineJoinApplication: 'declineJoinApplication',
};

export const metaData = new Map<string, ApiParams>([
  [
    GROUPMN.createGroup,
    {
      methodName: GROUPMN.createGroup,
      params: [
        {
          paramName: 'groupName',
          paramType: 'string',
          paramDefaultValue: 'WY-group',
        },
        {
          paramName: 'desc',
          paramType: 'string',
          paramDefaultValue: 'a test group',
        },
        {
          paramName: 'inviteMembers',
          paramType: 'object',
          paramDefaultValue: ['asterisk010'],
        },
        {
          paramName: 'inviteReason',
          paramType: 'string',
          paramDefaultValue: 'Join the group',
        },
        {
          paramName: 'options',
          paramType: 'object',
          paramDefaultValue: {
            style: 3,
            maxCount: 200,
            inviteNeedConfirm: false,
            ext: '{}',
          },
        },
      ],
    },
  ],
  [
    GROUPMN.addMembers,
    {
      methodName: GROUPMN.addMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
        },
        {
          paramName: 'welcome',
          paramType: 'string',
          paramDefaultValue: 'welcome!',
        },
      ],
    },
  ],
  [
    GROUPMN.removeMembers,
    {
      methodName: GROUPMN.removeMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
        },
      ],
    },
  ],
  [
    GROUPMN.inviterUser,
    {
      methodName: GROUPMN.inviterUser,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'Please join the group',
        },
      ],
    },
  ],
  [
    GROUPMN.acceptInvitation,
    {
      methodName: GROUPMN.acceptInvitation,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'inviter',
          paramType: 'string',
          paramDefaultValue: 'asterisk008',
        },
      ],
    },
  ],
  [
    GROUPMN.declineInvitation,
    {
      methodName: GROUPMN.declineInvitation,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'inviter',
          paramType: 'string',
          paramDefaultValue: 'asterisk008',
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: "Sorry, I don't want to join this group",
        },
      ],
    },
  ],
  [
    GROUPMN.getGroupWithId,
    {
      methodName: GROUPMN.getGroupWithId,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
      ],
    },
  ],
  [
    GROUPMN.getJoinedGroups,
    {
      methodName: GROUPMN.getJoinedGroups,
      params: [],
    },
  ],
  [
    GROUPMN.fetchJoinedGroupsFromServer,
    {
      methodName: GROUPMN.fetchJoinedGroupsFromServer,
      params: [
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
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
    GROUPMN.fetchPublicGroupsFromServer,
    {
      methodName: GROUPMN.fetchPublicGroupsFromServer,
      params: [
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 5,
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
    GROUPMN.fetchGroupInfoFromServer,
    {
      methodName: GROUPMN.fetchGroupInfoFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
      ],
    },
  ],
  [
    GROUPMN.fetchMemberListFromServer,
    {
      methodName: GROUPMN.fetchMemberListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 10,
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
    GROUPMN.fetchMuteListFromServer,
    {
      methodName: GROUPMN.fetchMuteListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
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
    GROUPMN.fetchWhiteListFromServer,
    {
      methodName: GROUPMN.fetchWhiteListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
      ],
    },
  ],
  [
    GROUPMN.fetchGroupFileListFromServer,
    {
      methodName: GROUPMN.fetchGroupFileListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '181816204001281',
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
    GROUPMN.isMemberInWhiteListFromServer,
    {
      methodName: GROUPMN.isMemberInWhiteListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
      ],
    },
  ],
  [
    GROUPMN.fetchAnnouncementFromServer,
    {
      methodName: GROUPMN.fetchAnnouncementFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
      ],
    },
  ],
  [
    GROUPMN.blockMembers,
    {
      methodName: GROUPMN.blockMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
        },
      ],
    },
  ],
  [
    GROUPMN.unblockMembers,
    {
      methodName: GROUPMN.unblockMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
        },
      ],
    },
  ],
  [
    GROUPMN.fetchBlockListFromServer,
    {
      methodName: GROUPMN.fetchBlockListFromServer,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
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
    GROUPMN.changeGroupName,
    {
      methodName: GROUPMN.changeGroupName,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'name',
          paramType: 'string',
          paramDefaultValue: 'Modified name',
        },
      ],
    },
  ],
  [
    GROUPMN.changeGroupDescription,
    {
      methodName: GROUPMN.changeGroupDescription,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'desc',
          paramType: 'string',
          paramDefaultValue: 'Modified description text',
        },
      ],
    },
  ],
  [
    GROUPMN.joinPublicGroup,
    {
      methodName: GROUPMN.joinPublicGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '179992049811458',
        },
      ],
    },
  ],
  [
    GROUPMN.leaveGroup,
    {
      methodName: GROUPMN.leaveGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '179992049811458',
        },
      ],
    },
  ],
  [
    GROUPMN.requestToJoinPublicGroup,
    {
      methodName: GROUPMN.requestToJoinPublicGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '179992049811458',
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'join the group!',
        },
      ],
    },
  ],
  [
    GROUPMN.destroyGroup,
    {
      methodName: GROUPMN.destroyGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '179992049811458',
        },
      ],
    },
  ],
  [
    GROUPMN.blockGroup,
    {
      methodName: GROUPMN.blockGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '181891273654273',
        },
      ],
    },
  ],
  [
    GROUPMN.unblockGroup,
    {
      methodName: GROUPMN.unblockGroup,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '181891273654273',
        },
      ],
    },
  ],
  [
    GROUPMN.changeOwner,
    {
      methodName: GROUPMN.changeOwner,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180094490443777',
        },
        {
          paramName: 'newOwner',
          paramType: 'string',
          paramDefaultValue: 'asterisk010',
        },
      ],
    },
  ],
  [
    GROUPMN.addAdmin,
    {
      methodName: GROUPMN.addAdmin,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180094490443777',
        },
        {
          paramName: 'memberId',
          paramType: 'string',
          paramDefaultValue: 'asterisk010',
        },
      ],
    },
  ],
  [
    GROUPMN.removeAdmin,
    {
      methodName: GROUPMN.removeAdmin,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180094490443777',
        },
        {
          paramName: 'memberId',
          paramType: 'string',
          paramDefaultValue: 'asterisk010',
        },
      ],
    },
  ],
  [
    GROUPMN.muteMembers,
    {
      methodName: GROUPMN.muteMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk010'],
        },
        {
          paramName: 'duration',
          paramType: 'number',
          paramDefaultValue: 3600000,
        },
      ],
    },
  ],
  [
    GROUPMN.unMuteMembers,
    {
      methodName: GROUPMN.unMuteMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk010'],
        },
      ],
    },
  ],
  [
    GROUPMN.muteAllMembers,
    {
      methodName: GROUPMN.muteAllMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
      ],
    },
  ],
  [
    GROUPMN.unMuteAllMembers,
    {
      methodName: GROUPMN.unMuteAllMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
      ],
    },
  ],
  [
    GROUPMN.addWhiteList,
    {
      methodName: GROUPMN.addWhiteList,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk010'],
        },
      ],
    },
  ],
  [
    GROUPMN.removeWhiteList,
    {
      methodName: GROUPMN.removeWhiteList,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk010'],
        },
      ],
    },
  ],
  [
    GROUPMN.uploadGroupSharedFile,
    {
      methodName: GROUPMN.uploadGroupSharedFile,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '181816204001281',
        },
        {
          paramName: 'filePath',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'callback',
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    GROUPMN.updateGroupAnnouncement,
    {
      methodName: GROUPMN.updateGroupAnnouncement,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'announcement',
          paramType: 'string',
          paramDefaultValue: 'tips',
        },
      ],
    },
  ],
  [
    GROUPMN.updateGroupExtension,
    {
      methodName: GROUPMN.updateGroupExtension,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'extension',
          paramType: 'string',
          paramDefaultValue: '',
        },
      ],
    },
  ],
  [
    GROUPMN.acceptJoinApplication,
    {
      methodName: GROUPMN.acceptJoinApplication,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: 'asterisk010',
        },
      ],
    },
  ],
  [
    GROUPMN.declineJoinApplication,
    {
      methodName: GROUPMN.declineJoinApplication,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: 'asterisk010',
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'no',
        },
      ],
    },
  ],
  [
    GROUPMN.downloadGroupSharedFile,
    {
      methodName: GROUPMN.downloadGroupSharedFile,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '181816204001281',
        },
        {
          paramName: 'fileId',
          paramType: 'string',
          paramDefaultValue: '7f3e6970-d5e0-11ec-9419-65ea58d8b217',
        },
        {
          paramName: 'savePath',
          paramType: 'string',
          paramDefaultValue:
            RNFS.TemporaryDirectoryPath + '/easemob/easemob.file',
        },
        {
          paramName: 'callback',
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    GROUPMN.removeGroupSharedFile,
    {
      methodName: GROUPMN.removeGroupSharedFile,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '180073968762881',
        },
        {
          paramName: 'fileId',
          paramType: 'string',
          paramDefaultValue: 'c3c8a200-d0d5-11ec-bb65-e747eaecfeca',
        },
      ],
    },
  ],
]);

let formatData: any = {};
for (let key of metaData.keys()) {
  let eachMethodParams: any = {};
  metaData.get(key)?.params.forEach((item) => {
    eachMethodParams[item.paramName] = item.paramDefaultValue;
  });
  formatData[key] = eachMethodParams;
}
export const stateData: StateGroupMessage = Object.assign({}, formatData, {
  sendResult: '',
  cbResult: '',
  recvResult: '',
  exceptResult: '',
});
