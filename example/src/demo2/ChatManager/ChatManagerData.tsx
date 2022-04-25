import { ChatMessageType, ChatMessageChatType } from 'react-native-chat-sdk';
import type { StateChatMessage, StatelessChatMessage } from './ChatManagerItem';
import type { ApiParams } from '../__internal__/DataTypes';

const login = 'login';
const loginWithAgoraToken = 'loginWithAgoraToken';
const sendMessage = 'sendMessage';
const resendMessage = 'resendMessage';
const sendMessageReadAck = 'sendMessageReadAck';
const sendGroupMessageReadAck = 'sendGroupMessageReadAck';

export const MN = {
  login,
  loginWithAgoraToken,
  sendMessage,
  resendMessage,
  sendMessageReadAck,
  sendGroupMessageReadAck,
};

export const metaData: ApiParams[] = [
  {
    methodName: MN.login, //0
    params: [
      {
        paramName: 'userName',
        paramType: 'string',
        paramDefaultValue: 'asteriskhx1',
      },
      {
        paramName: 'pwdOrToken',
        paramType: 'string',
        paramDefaultValue: 'qwer',
      },
      {
        paramName: 'isPassword',
        paramType: 'boolean',
        paramDefaultValue: true,
      },
    ],
  },
  {
    methodName: MN.loginWithAgoraToken, //1
    params: [
      {
        paramName: 'userName',
        paramType: 'string',
        paramDefaultValue: 'asteriskhx1',
      },
      {
        paramName: 'agoraToken',
        paramType: 'string',
        paramDefaultValue: 'qwer',
      },
    ],
  },
  {
    methodName: MN.sendMessage, //2
    params: [
      {
        paramName: 'targetId',
        paramType: 'string',
        paramDefaultValue: 'asteriskhx2',
      },
      {
        paramName: 'targetType',
        paramType: 'object',
        paramDefaultValue: ChatMessageChatType.PeerChat,
      },
      {
        paramName: 'content',
        paramType: 'object',
        paramDefaultValue: {},
      },
      {
        paramName: 'messageType',
        paramType: 'object',
        paramDefaultValue: ChatMessageType.TXT,
      },
    ],
  },
  {
    methodName: MN.resendMessage, //3
    params: [
      {
        paramName: 'message',
        paramType: 'object',
        paramDefaultValue: {},
      },
    ],
  },
  {
    methodName: MN.sendMessageReadAck, //4
    params: [
      {
        paramName: 'message',
        paramType: 'object',
        paramDefaultValue: {},
      },
    ],
  },
  {
    methodName: MN.sendGroupMessageReadAck, //5
    params: [
      {
        paramName: 'msgId',
        paramType: 'string',
        paramDefaultValue: '9',
      },
      {
        paramName: 'groupId',
        paramType: 'string',
        paramDefaultValue: '9',
      },
      {
        paramName: 'opt',
        paramType: 'object',
        paramDefaultValue: {},
      },
    ],
  },
];

export const statelessData: StatelessChatMessage = {
  sendMessage: {},
  resendMessage: {},
  sendMessageReadAck: {},
};

export const stateData: StateChatMessage = {
  // 0
  login: {
    userName:
      metaData[0].params[0].paramValue ??
      metaData[0].params[0].paramDefaultValue,
    pwdOrToken:
      metaData[0].params[1].paramValue ??
      metaData[0].params[1].paramDefaultValue,
    isPassword:
      metaData[0].params[2].paramValue ??
      metaData[0].params[2].paramDefaultValue,
  },
  // 1
  loginWithAgoraToken: {
    userName:
      metaData[1].params[0].paramValue ??
      metaData[1].params[0].paramDefaultValue,
    agoraToken:
      metaData[1].params[1].paramValue ??
      metaData[1].params[1].paramDefaultValue,
  },
  // 2
  sendMessage: {
    targetId:
      metaData[2].params[0].paramValue ??
      metaData[2].params[0].paramDefaultValue,
    targetType:
      metaData[2].params[1].paramValue ??
      metaData[2].params[1].paramDefaultValue,
    content: undefined,
    messageType:
      metaData[2].params[3].paramValue ??
      metaData[2].params[3].paramDefaultValue,
  },
  // 3
  // resendMessage: {
  //   message:
  //     metaData[3].params[0].paramValue ??
  //     metaData[3].params[0].paramDefaultValue,
  // },
  // 4
  // sendMessageReadAck: {
  //   message:
  //     metaData[4].params[0].paramValue ??
  //     metaData[4].params[0].paramDefaultValue,
  // },
  // 5
  sendGroupMessageReadAck: {
    msgId:
      metaData[5].params[0].paramValue ??
      metaData[5].params[0].paramDefaultValue,
    groupId:
      metaData[5].params[1].paramValue ??
      metaData[5].params[2].paramDefaultValue,
  },
  sendResult: '',
  recvResult: '',
  exceptResult: '',
};
