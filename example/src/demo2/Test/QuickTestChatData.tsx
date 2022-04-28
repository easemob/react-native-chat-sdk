import { ChatMessageType, ChatMessageChatType } from 'react-native-chat-sdk';
import type { ApiParams } from '../__internal__/DataTypes';

const sendMessage = 'sendMessage';
const resendMessage = 'resendMessage';
const sendMessageReadAck = 'sendMessageReadAck';
const sendGroupMessageReadAck = 'sendGroupMessageReadAck';
const sendConversationReadAck = 'sendConversationReadAck';
const recallMessage = 'recallMessage';
const getMessage = 'getMessage';
const markAllConversationsAsRead = 'markAllConversationsAsRead';
const getUnreadMessageCount = 'getUnreadMessageCount';
const updateMessage = 'updateMessage';
const importMessages = 'importMessages';
const downloadAttachment = 'downloadAttachment';
const downloadThumbnail = 'downloadThumbnail';
const fetchHistoryMessages = 'fetchHistoryMessages';
const searchMsgFromDB = 'searchMsgFromDB';
const fetchGroupAcks = 'fetchGroupAcks';
const deleteRemoteConversation = 'deleteRemoteConversation';
const getConversation = 'getConversation';
const loadAllConversations = 'loadAllConversations';
const getConversationsFromServer = 'getConversationsFromServer';
const deleteConversation = 'deleteConversation';
const getLatestMessage = 'getLatestMessage';
const getLastReceivedMessage = 'getLastReceivedMessage';
const unreadCount = 'unreadCount';
const markMessageAsRead = 'markMessageAsRead';
const markAllMessagesAsRead = 'markAllMessagesAsRead';
const insertMessage = 'insertMessage';
const appendMessage = 'appendMessage';
const updateConversationMessage = 'updateConversationMessage';
const deleteMessage = 'deleteMessage';
const deleteAllMessages = 'deleteAllMessages';
const getMessageById = 'getMessageById';
const getMessagesWithMsgType = 'getMessagesWithMsgType';
const getMessages = 'getMessages';
const getMessagesWithKeyword = 'getMessagesWithKeyword';
const getMessagesFromTime = 'getMessagesFromTime';

/**
 * 本地使用不导出
 */
export const MN = {
  sendMessage,
  resendMessage,
  sendMessageReadAck,
  sendGroupMessageReadAck,
  sendConversationReadAck,
  recallMessage,
  getMessage,
  markAllConversationsAsRead,
  getUnreadMessageCount,
  updateMessage,
  importMessages,
  downloadAttachment,
  downloadThumbnail,
  fetchHistoryMessages,
  searchMsgFromDB,
  fetchGroupAcks,
  deleteRemoteConversation,
  getConversation,
  loadAllConversations,
  getConversationsFromServer,
  deleteConversation,
  getLatestMessage,
  getLastReceivedMessage,
  unreadCount,
  markMessageAsRead,
  markAllMessagesAsRead,
  insertMessage,
  appendMessage,
  updateConversationMessage,
  deleteMessage,
  deleteAllMessages,
  getMessageById,
  getMessagesWithMsgType,
  getMessages,
  getMessagesWithKeyword,
  getMessagesFromTime,
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
          paramName: 'message', // 使用发送成功或者失败的数据测试，依赖sendMessage
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
          paramName: 'message', // 使用发送成功或者失败的数据测试，依赖sendMessage
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
          paramName: 'msgId', // 使用发送成功或者失败的数据测试，依赖sendMessage
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
  [
    MN.sendConversationReadAck,
    {
      methodName: MN.sendConversationReadAck,
      params: [
        {
          paramName: 'convId',
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
      ],
    },
  ],
  [
    MN.recallMessage,
    {
      methodName: MN.recallMessage,
      params: [
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
      ],
    },
  ],
  [
    MN.getMessage,
    {
      methodName: MN.getMessage,
      params: [
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
      ],
    },
  ],
  [
    MN.markAllConversationsAsRead,
    {
      methodName: MN.markAllConversationsAsRead,
      params: [],
    },
  ],
  [
    MN.getUnreadMessageCount,
    {
      methodName: MN.getUnreadMessageCount,
      params: [],
    },
  ],
  [
    MN.updateMessage,
    {
      methodName: MN.updateMessage,
      params: [
        {
          paramName: 'message', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    MN.importMessages,
    {
      methodName: MN.importMessages,
      params: [
        {
          paramName: 'message', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    MN.downloadAttachment,
    {
      methodName: MN.downloadAttachment,
      params: [
        {
          paramName: 'message', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'object',
          paramDefaultValue: {},
        },
        {
          paramName: 'callback', // 创建新的回调接收
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    MN.downloadThumbnail,
    {
      methodName: MN.downloadThumbnail,
      params: [
        {
          paramName: 'message', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'object',
          paramDefaultValue: {},
        },
        {
          paramName: 'callback', // 创建新的回调接收
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    MN.fetchHistoryMessages,
    {
      methodName: MN.fetchHistoryMessages,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'chatType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
        },
        {
          paramName: 'startMsgId',
          paramType: 'string',
          paramDefaultValue: '',
        },
      ],
    },
  ],
  [
    MN.searchMsgFromDB,
    {
      methodName: MN.searchMsgFromDB,
      params: [
        {
          paramName: 'keywords', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: '666',
        },
        {
          paramName: 'timestamp',
          paramType: 'number',
          paramDefaultValue: -1,
        },
        {
          paramName: 'maxCount',
          paramType: 'number',
          paramDefaultValue: 20,
        },
        {
          paramName: 'from',
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'direction',
          paramType: 'number',
          paramDefaultValue: 0,
        },
      ],
    },
  ],
  [
    MN.fetchGroupAcks,
    {
      methodName: MN.fetchGroupAcks,
      params: [
        {
          paramName: 'msgId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: '666',
        },
        {
          paramName: 'startAckId',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 0,
        },
      ],
    },
  ],
  [
    MN.deleteRemoteConversation,
    {
      methodName: MN.deleteRemoteConversation,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'isDeleteMessage',
          paramType: 'boolean',
          paramDefaultValue: true,
        },
      ],
    },
  ],
  [
    MN.getConversation,
    {
      methodName: MN.getConversation,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'createIfNeed',
          paramType: 'boolean',
          paramDefaultValue: true,
        },
      ],
    },
  ],
  [
    MN.loadAllConversations,
    {
      methodName: MN.loadAllConversations,
      params: [],
    },
  ],
  [
    MN.getConversationsFromServer,
    {
      methodName: MN.getConversationsFromServer,
      params: [],
    },
  ],
  [
    MN.deleteConversation,
    {
      methodName: MN.deleteConversation,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'withMessage',
          paramType: 'boolean',
          paramDefaultValue: true,
        },
      ],
    },
  ],
  [
    MN.getLatestMessage,
    {
      methodName: MN.getLatestMessage,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
      ],
    },
  ],
  [
    MN.getLastReceivedMessage,
    {
      methodName: MN.getLastReceivedMessage,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
      ],
    },
  ],
  [
    MN.unreadCount,
    {
      methodName: MN.unreadCount,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
      ],
    },
  ],
  [
    MN.markMessageAsRead,
    {
      methodName: MN.markMessageAsRead,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '0',
        },
      ],
    },
  ],
  [
    MN.markAllMessagesAsRead,
    {
      methodName: MN.markAllMessagesAsRead,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
      ],
    },
  ],
  [
    MN.insertMessage,
    {
      methodName: MN.insertMessage,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msg',
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    MN.appendMessage,
    {
      methodName: MN.appendMessage,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msg',
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    MN.updateConversationMessage,
    {
      methodName: MN.updateConversationMessage,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msg',
          paramType: 'object',
          paramDefaultValue: {},
        },
      ],
    },
  ],
  [
    MN.deleteMessage,
    {
      methodName: MN.deleteMessage,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msgId',
          paramType: 'object',
          paramDefaultValue: '0',
        },
      ],
    },
  ],
  [
    MN.deleteAllMessages,
    {
      methodName: MN.deleteAllMessages,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
      ],
    },
  ],
  [
    MN.getMessageById,
    {
      methodName: MN.getMessageById,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '0',
        },
      ],
    },
  ],
  [
    MN.getMessagesWithMsgType,
    {
      methodName: MN.getMessagesWithMsgType,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msgType',
          paramType: 'string',
          paramDefaultValue: 'txt',
        },
        {
          paramName: 'direction',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'timestamp',
          paramType: 'number',
          paramDefaultValue: -1,
        },
        {
          paramName: 'count',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'sender',
          paramType: 'string',
          paramDefaultValue: 'asteriskhx1',
        },
      ],
    },
  ],
  [
    MN.getMessages,
    {
      methodName: MN.getMessages,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'direction',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'startMsgId',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'loadCount',
          paramType: 'number',
          paramDefaultValue: 20,
        },
      ],
    },
  ],
  [
    MN.getMessagesWithKeyword,
    {
      methodName: MN.getMessagesWithKeyword,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'keywords',
          paramType: 'string',
          paramDefaultValue: '0',
        },
        {
          paramName: 'direction',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'timestamp',
          paramType: 'number',
          paramDefaultValue: -1,
        },
        {
          paramName: 'count',
          paramType: 'number',
          paramDefaultValue: 20,
        },
        {
          paramName: 'sender',
          paramType: 'string',
          paramDefaultValue: 'asteriskhx1',
        },
      ],
    },
  ],
  [
    MN.getMessagesFromTime,
    {
      methodName: MN.getMessagesFromTime,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: 'asteriskhx2',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'startTime',
          paramType: 'number',
          paramDefaultValue: 100,
        },
        {
          paramName: 'endTime',
          paramType: 'number',
          paramDefaultValue: 200,
        },
        {
          paramName: 'direction',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'count',
          paramType: 'number',
          paramDefaultValue: 20,
        },
      ],
    },
  ],
]);
