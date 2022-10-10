import {
  ChatCircleChannelRank,
  ChatCircleChannelType,
} from 'react-native-chat-circle-sdk';
import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';

export const MN = {
  createServer: 'createServer',
  destroyServer: 'destroyServer',
  updateServer: 'updateServer',
  joinServer: 'joinServer',
  leaveServer: 'leaveServer',
  removeUserFromServer: 'removeUserFromServer',
  inviteUserToServer: 'inviteUserToServer',
  acceptServerInvitation: 'acceptServerInvitation',
  declineServerInvitation: 'declineServerInvitation',
  addTagsToServer: 'addTagsToServer',
  removeTagsFromServer: 'removeTagsFromServer',
  fetchServerTags: 'fetchServerTags',
  addModeratorToServer: 'addModeratorToServer',
  removeModeratorFromServer: 'removeModeratorFromServer',
  fetchSelfServerRole: 'fetchSelfServerRole',
  fetchJoinedServers: 'fetchJoinedServers',
  fetchServerDetail: 'fetchServerDetail',
  fetchServersWithKeyword: 'fetchServersWithKeyword',
  fetchServerMembers: 'fetchServerMembers',
  checkSelfInServer: 'checkSelfInServer',
  createChannel: 'createChannel',
  destroyChannel: 'destroyChannel',
  updateChannel: 'updateChannel',
  joinChannel: 'joinChannel',
  leaveChannel: 'leaveChannel',
  removeUserFromChannel: 'removeUserFromChannel',
  inviteUserToChannel: 'inviteUserToChannel',
  acceptChannelInvitation: 'acceptChannelInvitation',
  declineChannelInvitation: 'declineChannelInvitation',
  muteUserInChannel: 'muteUserInChannel',
  unmuteUserInChannel: 'unmuteUserInChannel',
  fetchChannelDetail: 'fetchChannelDetail',
  fetchPublicChannelInServer: 'fetchPublicChannelInServer',
  fetchChannelMembers: 'fetchChannelMembers',
  fetchVisiblePrivateChannelInServer: 'fetchVisiblePrivateChannelInServer',
  checkSelfIsInChannel: 'checkSelfIsInChannel',
  fetchChannelMuteUsers: 'fetchChannelMuteUsers',
};

export const metaDataList = new Map<string, ApiParams>([
  [
    MN.createServer,
    {
      methodName: MN.createServer,
      params: [
        {
          paramName: 'serverName',
          paramType: 'string',
          paramDefaultValue: 'foo',
          domType: 'input',
        },
        {
          paramName: 'serverIcon',
          paramType: 'string',
          paramDefaultValue: 'url',
          domType: 'input',
        },
        {
          paramName: 'serverDescription',
          paramType: 'string',
          paramDefaultValue: 'desc',
          domType: 'input',
        },
        {
          paramName: 'serverExtension',
          paramType: 'string',
          paramDefaultValue: JSON.stringify({ key: 'value' }),
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.destroyServer,
    {
      methodName: MN.destroyServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1C3sfOmiJWMGBQUc1QyJFSV1Zqo',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.updateServer,
    {
      methodName: MN.updateServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'serverName',
          paramType: 'string',
          paramDefaultValue: 'new_name',
          domType: 'input',
        },
        {
          paramName: 'serverIcon',
          paramType: 'string',
          paramDefaultValue: 'new_url',
          domType: 'input',
        },
        {
          paramName: 'serverDescription',
          paramType: 'string',
          paramDefaultValue: 'desc',
          domType: 'input',
        },
        {
          paramName: 'serverExtension',
          paramType: 'string',
          paramDefaultValue: JSON.stringify({ key: 'new_value' }),
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.joinServer,
    {
      methodName: MN.joinServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.leaveServer,
    {
      methodName: MN.leaveServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.removeUserFromServer,
    {
      methodName: MN.removeUserFromServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'userId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.inviteUserToServer,
    {
      methodName: MN.inviteUserToServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'userId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
        {
          paramName: 'welcome',
          paramType: 'string',
          paramDefaultValue: 'welcome',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.acceptServerInvitation,
    {
      methodName: MN.acceptServerInvitation,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'inviter',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[0].id,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.declineServerInvitation,
    {
      methodName: MN.declineServerInvitation,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'inviter',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[0].id,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.addTagsToServer,
    {
      methodName: MN.addTagsToServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'serverTags',
          paramType: 'json',
          paramDefaultValue: ['tag3', 'tag4'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.removeTagsFromServer,
    {
      methodName: MN.removeTagsFromServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'serverTagIds',
          paramType: 'json',
          paramDefaultValue: ['40', '41'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchServerTags,
    {
      methodName: MN.fetchServerTags,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.addModeratorToServer,
    {
      methodName: MN.addModeratorToServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'userId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.removeModeratorFromServer,
    {
      methodName: MN.removeModeratorFromServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'userId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchSelfServerRole,
    {
      methodName: MN.fetchSelfServerRole,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchJoinedServers,
    {
      methodName: MN.fetchJoinedServers,
      params: [
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
          domType: 'input',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 10,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchServerDetail,
    {
      methodName: MN.fetchServerDetail,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchServersWithKeyword,
    {
      methodName: MN.fetchServersWithKeyword,
      params: [
        {
          paramName: 'keyword',
          paramType: 'string',
          paramDefaultValue: 'tag1',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchServerMembers,
    {
      methodName: MN.fetchServerMembers,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
          domType: 'input',
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.checkSelfInServer,
    {
      methodName: MN.checkSelfInServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.createChannel,
    {
      methodName: MN.createChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelName',
          paramType: 'string',
          paramDefaultValue: 'name',
          domType: 'input',
        },
        {
          paramName: 'channelDescription',
          paramType: 'string',
          paramDefaultValue: 'desc',
          domType: 'input',
        },
        {
          paramName: 'channelExtension',
          paramType: 'json',
          paramDefaultValue: JSON.stringify({ key: 'value' }),
          domType: 'input',
        },
        {
          paramName: 'channelRank',
          paramType: 'number',
          paramDefaultValue: ChatCircleChannelRank.R2000 as number,
          domType: 'input',
        },
        {
          paramName: 'channelType',
          paramType: 'number',
          paramDefaultValue: ChatCircleChannelType.Private as number,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.destroyChannel,
    {
      methodName: MN.destroyChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192586151165955',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.updateChannel,
    {
      methodName: MN.updateChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
        {
          paramName: 'channelName',
          paramType: 'string',
          paramDefaultValue: 'new_name',
          domType: 'input',
        },
        {
          paramName: 'channelDescription',
          paramType: 'string',
          paramDefaultValue: 'new_desc',
          domType: 'input',
        },
        {
          paramName: 'channelExtension',
          paramType: 'json',
          paramDefaultValue: JSON.stringify({ key: 'new_value' }),
          domType: 'input',
        },
        {
          paramName: 'channelRank',
          paramType: 'number',
          paramDefaultValue: ChatCircleChannelRank.R2000 as number,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.joinChannel,
    {
      methodName: MN.joinChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.leaveChannel,
    {
      methodName: MN.leaveChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.removeUserFromChannel,
    {
      methodName: MN.removeUserFromChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
        {
          paramName: 'userId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.inviteUserToChannel,
    {
      methodName: MN.inviteUserToChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
        {
          paramName: 'userId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
        {
          paramName: 'welcome',
          paramType: 'string',
          paramDefaultValue: 'welcome to channel',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.acceptChannelInvitation,
    {
      methodName: MN.acceptChannelInvitation,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
        {
          paramName: 'inviter',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[0].id,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.declineChannelInvitation,
    {
      methodName: MN.declineChannelInvitation,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
        {
          paramName: 'inviter',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[0].id,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.muteUserInChannel,
    {
      methodName: MN.muteUserInChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
        {
          paramName: 'userId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
        {
          paramName: 'duration',
          paramType: 'number',
          paramDefaultValue: 300000000,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.unmuteUserInChannel,
    {
      methodName: MN.unmuteUserInChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
        {
          paramName: 'userId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchChannelDetail,
    {
      methodName: MN.fetchChannelDetail,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchPublicChannelInServer,
    {
      methodName: MN.fetchPublicChannelInServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
          domType: 'input',
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchChannelMembers,
    {
      methodName: MN.fetchChannelMembers,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
          domType: 'input',
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchVisiblePrivateChannelInServer,
    {
      methodName: MN.fetchVisiblePrivateChannelInServer,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
          domType: 'input',
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.checkSelfIsInChannel,
    {
      methodName: MN.checkSelfIsInChannel,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchChannelMuteUsers,
    {
      methodName: MN.fetchChannelMuteUsers,
      params: [
        {
          paramName: 'serverId',
          paramType: 'string',
          paramDefaultValue: '1BplfD0QriJIWQtxEhP2AFXwESd',
          domType: 'input',
        },
        {
          paramName: 'channelId',
          paramType: 'string',
          paramDefaultValue: '192200645345281',
          domType: 'input',
        },
      ],
    },
  ],
]);
