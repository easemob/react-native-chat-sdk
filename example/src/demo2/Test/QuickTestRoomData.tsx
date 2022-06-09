import type { ApiParams } from '../__internal__/DataTypes';

export const MN = {
  joinChatRoom: 'joinChatRoom',
  leaveChatRoom: 'leaveChatRoom',
  fetchPublicChatRoomsFromServer: 'fetchPublicChatRoomsFromServer',
  fetchChatRoomInfoFromServer: 'fetchChatRoomInfoFromServer',
  getChatRoomWithId: 'getChatRoomWithId',
  getAllChatRooms: 'getAllChatRooms',
  createChatRoom: 'createChatRoom',
  destroyChatRoom: 'destroyChatRoom',
  changeChatRoomSubject: 'changeChatRoomSubject',
  changeChatRoomDescription: 'changeChatRoomDescription',
  fetchChatRoomMembers: 'fetchChatRoomMembers',
  muteChatRoomMembers: 'muteChatRoomMembers',
  unMuteChatRoomMembers: 'unMuteChatRoomMembers',
  changeOwner: 'changeOwner',
  addChatRoomAdmin: 'addChatRoomAdmin',
  removeChatRoomAdmin: 'removeChatRoomAdmin',
  fetchChatRoomMuteList: 'fetchChatRoomMuteList',
  removeChatRoomMembers: 'removeChatRoomMembers',
  blockChatRoomMembers: 'blockChatRoomMembers',
  unBlockChatRoomMembers: 'unBlockChatRoomMembers',
  fetchChatRoomBlockList: 'fetchChatRoomBlockList',
  updateChatRoomAnnouncement: 'updateChatRoomAnnouncement',
  fetchChatRoomAnnouncement: 'fetchChatRoomAnnouncement',
  fetchChatRoomWhiteListFromServer: 'fetchChatRoomWhiteListFromServer',
  isMemberInChatRoomWhiteList: 'isMemberInChatRoomWhiteList',
  addMembersToChatRoomWhiteList: 'addMembersToChatRoomWhiteList',
  removeMembersFromChatRoomWhiteList: 'removeMembersFromChatRoomWhiteList',
  muteAllChatRoomMembers: 'muteAllChatRoomMembers',
  unMuteAllChatRoomMembers: 'unMuteAllChatRoomMembers',
};

export const metaDataList = new Map<string, ApiParams>([
  [
    MN.joinChatRoom,
    {
      methodName: MN.joinChatRoom,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '181871406284801',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.leaveChatRoom,
    {
      methodName: MN.leaveChatRoom,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchPublicChatRoomsFromServer,
    {
      methodName: MN.fetchPublicChatRoomsFromServer,
      params: [
        {
          paramName: 'aPageNum',
          paramType: 'number',
          paramDefaultValue: 1,
          domType: 'input',
        },
        {
          paramName: 'aPageSize',
          paramType: 'number',
          paramDefaultValue: 200,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchChatRoomInfoFromServer,
    {
      methodName: MN.fetchChatRoomInfoFromServer,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.getChatRoomWithId,
    {
      methodName: MN.getChatRoomWithId,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.getAllChatRooms,
    {
      methodName: MN.getAllChatRooms,
      params: [],
    },
  ],
  [
    MN.createChatRoom,
    {
      methodName: MN.createChatRoom,
      params: [
        {
          paramName: 'subject',
          paramType: 'string',
          paramDefaultValue: 'haha',
          domType: 'input',
        },
        {
          paramName: 'desc',
          paramType: 'string',
          paramDefaultValue: 'hahaha',
          domType: 'input',
        },
        {
          paramName: 'welcomeMsg',
          paramType: 'string',
          paramDefaultValue: 'hahahaha',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'json',
          paramDefaultValue: ['bye', 'nat'],
          domType: 'input',
        },
        {
          paramName: 'maxCount',
          paramType: 'number',
          paramDefaultValue: 300,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.destroyChatRoom,
    {
      methodName: MN.destroyChatRoom,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180169240281089',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.changeChatRoomSubject,
    {
      methodName: MN.changeChatRoomSubject,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'subject',
          paramType: 'string',
          paramDefaultValue: 'choose you',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.changeChatRoomDescription,
    {
      methodName: MN.changeChatRoomDescription,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'description',
          paramType: 'string',
          paramDefaultValue: 'o,o',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchChatRoomMembers,
    {
      methodName: MN.fetchChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
          domType: 'input',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 200,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.muteChatRoomMembers,
    {
      methodName: MN.muteChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'muteMembers',
          paramType: 'json',
          paramDefaultValue: ['asterisk002', 'asterisk003'],
          domType: 'input',
        },
        {
          paramName: 'duration',
          paramType: 'number',
          paramDefaultValue: -1,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.unMuteChatRoomMembers,
    {
      methodName: MN.unMuteChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'unMuteMembers',
          paramType: 'json',
          paramDefaultValue: ['bye', 'nat'],
          domType: 'input',
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
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'newOwner',
          paramType: 'string',
          paramDefaultValue: 'asterisk003',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.addChatRoomAdmin,
    {
      methodName: MN.addChatRoomAdmin,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'admin',
          paramType: 'string',
          paramDefaultValue: 'asterisk004',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.removeChatRoomAdmin,
    {
      methodName: MN.removeChatRoomAdmin,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'admin',
          paramType: 'string',
          paramDefaultValue: 'asterisk004',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchChatRoomMuteList,
    {
      methodName: MN.fetchChatRoomMuteList,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '181871406284801',
          domType: 'input',
        },
        {
          paramName: 'pageNum',
          paramType: 'number',
          paramDefaultValue: 1,
          domType: 'input',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 200,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.removeChatRoomMembers,
    {
      methodName: MN.removeChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'json',
          paramDefaultValue: ['nat'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.blockChatRoomMembers,
    {
      methodName: MN.blockChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'json',
          paramDefaultValue: ['asterisk004'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.unBlockChatRoomMembers,
    {
      methodName: MN.unBlockChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'json',
          paramDefaultValue: ['asterisk004'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchChatRoomBlockList,
    {
      methodName: MN.fetchChatRoomBlockList,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'pageNum',
          paramType: 'number',
          paramDefaultValue: 1,
          domType: 'input',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 200,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.updateChatRoomAnnouncement,
    {
      methodName: MN.updateChatRoomAnnouncement,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'anouncement',
          paramType: 'string',
          paramDefaultValue: 'hahaAnnouncement',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchChatRoomAnnouncement,
    {
      methodName: MN.fetchChatRoomAnnouncement,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchChatRoomWhiteListFromServer,
    {
      methodName: MN.fetchChatRoomWhiteListFromServer,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.isMemberInChatRoomWhiteList,
    {
      methodName: MN.isMemberInChatRoomWhiteList,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.addMembersToChatRoomWhiteList,
    {
      methodName: MN.addMembersToChatRoomWhiteList,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'anouncement',
          paramType: 'json',
          paramDefaultValue: ['asterisk002'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.removeMembersFromChatRoomWhiteList,
    {
      methodName: MN.removeMembersFromChatRoomWhiteList,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'anouncement',
          paramType: 'json',
          paramDefaultValue: ['asterisk002'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.muteAllChatRoomMembers,
    {
      methodName: MN.muteAllChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.unMuteAllChatRoomMembers,
    {
      methodName: MN.unMuteAllChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
      ],
    },
  ],
]);
