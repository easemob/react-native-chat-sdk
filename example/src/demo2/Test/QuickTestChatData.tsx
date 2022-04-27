import { ChatMessageType, ChatMessageChatType } from 'react-native-chat-sdk';
import type { ApiParams } from '../__internal__/DataTypes';

const sendMessage = 'sendMessage';
const resendMessage = 'resendMessage';
const sendMessageReadAck = 'sendMessageReadAck';
const sendGroupMessageReadAck = 'sendGroupMessageReadAck';

/**
 * 本地使用不导出
 */
export const MN = {
  sendMessage,
  resendMessage,
  sendMessageReadAck,
  sendGroupMessageReadAck,
};

export const metaDataList = new Map<string, ApiParams>([
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
