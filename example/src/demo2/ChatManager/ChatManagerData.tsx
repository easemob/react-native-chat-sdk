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

export const metaData = new Map<string, ApiParams>([
  [
    MN.login,
    {
      methodName: MN.login,
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
  ],
  [
    MN.loginWithAgoraToken,
    {
      methodName: MN.loginWithAgoraToken,
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
  ],
  [
    MN.sendMessage,
    {
      methodName: MN.sendMessage,
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
  ],
  [
    MN.resendMessage,
    {
      methodName: MN.resendMessage,
      params: [
        {
          paramName: 'message',
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    MN.sendMessageReadAck,
    {
      methodName: MN.sendMessageReadAck,
      params: [
        {
          paramName: 'message',
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    MN.sendGroupMessageReadAck,
    {
      methodName: MN.sendGroupMessageReadAck,
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
          paramDefaultValue: { content: 'test' },
        },
      ],
    },
  ],
]);

export const statelessData: StatelessChatMessage = {
  sendMessage: {},
  resendMessage: {},
  sendMessageReadAck: {},
};

export const stateData: StateChatMessage = {
  login: {
    userName:
      metaData.get(MN.login)!.params[0].paramValue ??
      metaData.get(MN.login)!.params[0].paramDefaultValue,
    pwdOrToken:
      metaData.get(MN.login)!.params[1].paramValue ??
      metaData.get(MN.login)!.params[1].paramDefaultValue,
    isPassword:
      metaData.get(MN.login)!.params[2].paramValue ??
      metaData.get(MN.login)!.params[2].paramDefaultValue,
  },
  loginWithAgoraToken: {
    userName:
      metaData.get(MN.loginWithAgoraToken)!.params[0].paramValue ??
      metaData.get(MN.loginWithAgoraToken)!.params[0].paramDefaultValue,
    agoraToken:
      metaData.get(MN.loginWithAgoraToken)!.params[1].paramValue ??
      metaData.get(MN.loginWithAgoraToken)!.params[1].paramDefaultValue,
  },
  sendMessage: {
    targetId:
      metaData.get(MN.sendMessage)!.params[0].paramValue ??
      metaData.get(MN.sendMessage)!.params[0].paramDefaultValue,
    targetType:
      metaData.get(MN.sendMessage)!.params[1].paramValue ??
      metaData.get(MN.sendMessage)!.params[1].paramDefaultValue,
    content: undefined,
    messageType:
      metaData.get(MN.sendMessage)!.params[3].paramValue ??
      metaData.get(MN.sendMessage)!.params[3].paramDefaultValue,
  },
  sendGroupMessageReadAck: {
    msgId:
      metaData.get(MN.sendGroupMessageReadAck)!.params[0].paramValue ??
      metaData.get(MN.sendGroupMessageReadAck)!.params[0].paramDefaultValue,
    groupId:
      metaData.get(MN.sendGroupMessageReadAck)!.params[1].paramValue ??
      metaData.get(MN.sendGroupMessageReadAck)!.params[1].paramDefaultValue,
    opt:
      metaData.get(MN.sendGroupMessageReadAck)!.params[2].paramValue ??
      metaData.get(MN.sendGroupMessageReadAck)!.params[2].paramDefaultValue,
  },
  sendResult: '',
  recvResult: '',
  exceptResult: '',
};
