import type { StateChatRoomMessage } from './ChatRoomManagerItem';
import type { ApiParams } from '../__internal__/DataTypes';

export const CHATROOMMN = {
  createChatRoom: 'createChatRoom',
  fetchPublicChatRoomsFromServer: 'fetchPublicChatRoomsFromServer',
  fetchChatRoomInfoFromServer: 'fetchChatRoomInfoFromServer',
  joinChatRoom: 'joinChatRoom',
  leaveChatRoom: 'leaveChatRoom',
  fetchChatRoomMembers: 'fetchChatRoomMembers',
  getChatRoom: 'getChatRoom',
  changeChatRoomSubject: 'changeChatRoomSubject',
  changeChatRoomDescription: 'changeChatRoomDescription',
  changeChatRoomOwner: 'changeChatRoomOwner',
  updateChatRoomAnnouncement: 'updateChatRoomAnnouncement',
  fetchChatRoomAnnouncement: 'fetchChatRoomAnnouncement',
  addChatRoomAdmin: 'addChatRoomAdmin',
  removeChatRoomAdmin: 'removeChatRoomAdmin',
  removeChatRoomMembers: 'removeChatRoomMembers',
  isMemberInChatRoomWhiteListFromServer:
    'isMemberInChatRoomWhiteListFromServer',
  addMembersToChatRoomWhiteList: 'addMembersToChatRoomWhiteList',
  removeMembersFromChatRoomWhiteList: 'removeMembersFromChatRoomWhiteList',
  fetchChatRoomWhiteListFromServer: 'fetchChatRoomWhiteListFromServer',
  blockChatRoomMembers: 'blockChatRoomMembers',
  unBlockChatRoomMembers: 'unBlockChatRoomMembers',
  fetchChatRoomBlockList: 'fetchChatRoomBlockList',
  muteChatRoomMembers: 'muteChatRoomMembers',
  unMuteChatRoomMembers: 'unMuteChatRoomMembers',
  muteAllChatRoomMembers: 'muteAllChatRoomMembers',
  unMuteAllChatRoomMembers: 'unMuteAllChatRoomMembers',
  fetchChatRoomMuteList: 'fetchChatRoomMuteList',
  destroyChatRoom: 'destroyChatRoom',
};

export const metaData = new Map<string, ApiParams>([
  [
    CHATROOMMN.createChatRoom,
    {
      methodName: CHATROOMMN.createChatRoom,
      params: [
        {
          paramName: 'subject',
          paramType: 'string',
          paramDefaultValue: 'testChatroom',
          domType: 'input',
        },
        {
          paramName: 'desc',
          paramType: 'string',
          paramDefaultValue: 'a test group',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008', 'asterisk010'],
          domType: 'input',
        },
        {
          paramName: 'welcomeMsg',
          paramType: 'string',
          paramDefaultValue: 'Welcome to join',
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
    CHATROOMMN.fetchPublicChatRoomsFromServer,
    {
      methodName: CHATROOMMN.fetchPublicChatRoomsFromServer,
      params: [
        {
          paramName: 'pageNum',
          paramType: 'number',
          paramDefaultValue: 1,
          domType: 'input',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.fetchChatRoomInfoFromServer,
    {
      methodName: CHATROOMMN.fetchChatRoomInfoFromServer,
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
    CHATROOMMN.joinChatRoom,
    {
      methodName: CHATROOMMN.joinChatRoom,
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
    CHATROOMMN.leaveChatRoom,
    {
      methodName: CHATROOMMN.leaveChatRoom,
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
    CHATROOMMN.fetchChatRoomMembers,
    {
      methodName: CHATROOMMN.fetchChatRoomMembers,
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
          paramDefaultValue: 20,
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.getChatRoom,
    {
      methodName: CHATROOMMN.getChatRoom,
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
    CHATROOMMN.changeChatRoomSubject,
    {
      methodName: CHATROOMMN.changeChatRoomSubject,
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
          paramDefaultValue: 'newChatRoom~~~',
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.changeChatRoomDescription,
    {
      methodName: CHATROOMMN.changeChatRoomDescription,
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
          paramDefaultValue: 'newdescription~~~!!!!!!!!',
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.changeChatRoomOwner,
    {
      methodName: CHATROOMMN.changeChatRoomOwner,
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
          paramDefaultValue: 'asterisk009',
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.isMemberInChatRoomWhiteListFromServer,
    {
      methodName: CHATROOMMN.isMemberInChatRoomWhiteListFromServer,
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
    CHATROOMMN.updateChatRoomAnnouncement,
    {
      methodName: CHATROOMMN.updateChatRoomAnnouncement,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'announcement',
          paramType: 'string',
          paramDefaultValue: 'welcome',
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.fetchChatRoomAnnouncement,
    {
      methodName: CHATROOMMN.fetchChatRoomAnnouncement,
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
    CHATROOMMN.addChatRoomAdmin,
    {
      methodName: CHATROOMMN.addChatRoomAdmin,
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
          paramDefaultValue: 'asterisk008',
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.removeChatRoomAdmin,
    {
      methodName: CHATROOMMN.removeChatRoomAdmin,
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
          paramDefaultValue: 'asterisk008',
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.removeChatRoomMembers,
    {
      methodName: CHATROOMMN.removeChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk010'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.addMembersToChatRoomWhiteList,
    {
      methodName: CHATROOMMN.addMembersToChatRoomWhiteList,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.removeMembersFromChatRoomWhiteList,
    {
      methodName: CHATROOMMN.removeMembersFromChatRoomWhiteList,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.fetchChatRoomWhiteListFromServer,
    {
      methodName: CHATROOMMN.fetchChatRoomWhiteListFromServer,
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
    CHATROOMMN.blockChatRoomMembers,
    {
      methodName: CHATROOMMN.blockChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.unBlockChatRoomMembers,
    {
      methodName: CHATROOMMN.unBlockChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.fetchChatRoomBlockList,
    {
      methodName: CHATROOMMN.fetchChatRoomBlockList,
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
          paramDefaultValue: 20,
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.muteChatRoomMembers,
    {
      methodName: CHATROOMMN.muteChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'muteMembers',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
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
    CHATROOMMN.unMuteChatRoomMembers,
    {
      methodName: CHATROOMMN.unMuteChatRoomMembers,
      params: [
        {
          paramName: 'roomId',
          paramType: 'string',
          paramDefaultValue: '180456077197313',
          domType: 'input',
        },
        {
          paramName: 'unMuteMembers',
          paramType: 'object',
          paramDefaultValue: ['asterisk008'],
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.muteAllChatRoomMembers,
    {
      methodName: CHATROOMMN.muteAllChatRoomMembers,
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
    CHATROOMMN.unMuteAllChatRoomMembers,
    {
      methodName: CHATROOMMN.unMuteAllChatRoomMembers,
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
    CHATROOMMN.fetchChatRoomMuteList,
    {
      methodName: CHATROOMMN.fetchChatRoomMuteList,
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
          paramDefaultValue: 20,
          domType: 'input',
        },
      ],
    },
  ],
  [
    CHATROOMMN.destroyChatRoom,
    {
      methodName: CHATROOMMN.destroyChatRoom,
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

let formatData: any = {};
for (let key of metaData.keys()) {
  let eachMethodParams: any = {};
  metaData.get(key)?.params.forEach((item) => {
    eachMethodParams[item.paramName] = item.paramDefaultValue;
  });
  formatData[key] = eachMethodParams;
}
export const stateData: StateChatRoomMessage = Object.assign({}, formatData, {
  sendResult: '',
  recvResult: '',
  exceptResult: '',
});
