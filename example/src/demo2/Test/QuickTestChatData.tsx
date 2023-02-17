import {
  ChatMessageType,
  ChatMessageChatType,
  ChatConversationType,
} from 'react-native-chat-sdk';
import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';
import { ChatManagerCache } from './ChatManagerCache';

export const MN = {
  sendMessage: 'sendMessage',
  resendMessage: 'resendMessage',
  sendMessageReadAck: 'sendMessageReadAck',
  sendGroupMessageReadAck: 'sendGroupMessageReadAck',
  sendConversationReadAck: 'sendConversationReadAck',
  recallMessage: 'recallMessage',
  getMessage: 'getMessage',
  markAllConversationsAsRead: 'markAllConversationsAsRead',
  getUnreadCount: 'getUnreadCount',
  updateMessage: 'updateMessage',
  importMessages: 'importMessages',
  downloadAttachment: 'downloadAttachment',
  downloadThumbnail: 'downloadThumbnail',
  fetchHistoryMessages: 'fetchHistoryMessages',
  searchMsgFromDB: 'searchMsgFromDB',
  fetchGroupAcks: 'fetchGroupAcks',
  removeConversationFromServer: 'removeConversationFromServer',
  getConversation: 'getConversation',
  getAllConversations: 'getAllConversations',
  fetchAllConversations: 'fetchAllConversations',
  deleteConversation: 'deleteConversation',
  getLatestMessage: 'getLatestMessage',
  getLastReceivedMessage: 'getLastReceivedMessage',
  getConversationUnreadCount: 'getConversationUnreadCount',
  markMessageAsRead: 'markMessageAsRead',
  markAllMessagesAsRead: 'markAllMessagesAsRead',
  updateConversationMessage: 'updateConversationMessage',
  deleteMessage: 'deleteMessage',
  deleteAllMessages: 'deleteAllMessages',
  getMessagesWithMsgType: 'getMessagesWithMsgType',
  getMessages: 'getMessages',
  getMessagesWithKeyword: 'getMessagesWithKeyword',
  getMessageWithTimestamp: 'getMessageWithTimestamp',
  translateMessage: 'translateMessage',
  fetchSupportLanguages: 'fetchSupportLanguages',
  addReaction: 'addReaction',
  removeReaction: 'removeReaction',
  fetchReactionList: 'fetchReactionList',
  fetchReactionDetail: 'fetchReactionDetail',
  reportMessage: 'reportMessage',
  getReactionList: 'getReactionList',
  groupAckCount: 'groupAckCount',
  createChatThread: 'createChatThread',
  joinChatThread: 'joinChatThread',
  leaveChatThread: 'leaveChatThread',
  destroyChatThread: 'destroyChatThread',
  updateChatThreadName: 'updateChatThreadName',
  removeMemberWithChatThread: 'removeMemberWithChatThread',
  fetchMembersWithChatThreadFromServer: 'fetchMembersWithChatThreadFromServer',
  fetchJoinedChatThreadFromServer: 'fetchJoinedChatThreadFromServer',
  fetchJoinedChatThreadWithParentFromServer:
    'fetchJoinedChatThreadWithParentFromServer',
  fetchChatThreadWithParentFromServer: 'fetchChatThreadWithParentFromServer',
  fetchLastMessageWithChatThread: 'fetchLastMessageWithChatThread',
  fetchChatThreadFromServer: 'fetchChatThreadFromServer',
  getMessageThread: 'getMessageThread',
  setConversationExtension: 'setConversationExtension',
  insertMessage: 'insertMessage',
  deleteMessagesBeforeTimestamp: 'deleteMessagesBeforeTimestamp',
  getThreadConversation: 'getThreadConversation',
  fetchConversationsFromServerWithPage: 'fetchConversationsFromServerWithPage',
  removeMessagesFromServerWithMsgIds: 'removeMessagesFromServerWithMsgIds',
  removeMessagesFromServerWithTimestamp:
    'removeMessagesFromServerWithTimestamp',
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
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'targetType',
          paramType: 'number',
          paramDefaultValue: ChatMessageChatType.PeerChat,
        },
        {
          paramName: 'content',
          paramType: 'string',
          paramDefaultValue: Date.now().toString(),
        },
        {
          paramName: 'messageType',
          paramType: 'string',
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
          paramType: 'json',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().createTextMessage(),
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
          paramType: 'json',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().getLastRecvMessage(),
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
          paramDefaultValue: '1003229966910883832',
        },
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '179992049811458',
        },
        {
          paramName: 'opt',
          paramType: 'json',
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
          paramDefaultValue: datasheet.accounts[2].id,
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
          paramDefaultValue: '1003235378737449004',
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
          paramDefaultValue: '1112266640122185168',
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
    MN.getUnreadCount,
    {
      methodName: MN.getUnreadCount,
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
          paramType: 'json',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().getLastSendMessage(),
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
          paramType: 'json',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().getLastSendMessage(),
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
          paramType: 'json',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().getLastRecvMessage(),
        },
        {
          paramName: 'callback', // 创建新的回调接收
          paramType: 'object',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().createCallback(),
          domType: 'download',
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
          paramType: 'json',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().getLastRecvMessage(),
        },
        {
          paramName: 'callback', // 创建新的回调接收
          paramType: 'object',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().createCallback(),
          domType: 'download',
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
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'chatType',
          paramType: 'number',
          paramDefaultValue: ChatConversationType.PeerChat,
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
          paramDefaultValue: 'r',
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
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'direction',
          paramType: 'number',
          paramDefaultValue: 1,
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
          paramDefaultValue: '1003592625892100148',
        },
        {
          paramName: 'startAckId',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
        },
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '179992049811458',
        },
      ],
    },
  ],
  [
    MN.removeConversationFromServer,
    {
      methodName: MN.removeConversationFromServer,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
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
          domType: 'select',
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
          paramDefaultValue: datasheet.accounts[2].id,
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
          domType: 'select',
        },
      ],
    },
  ],
  [
    MN.getAllConversations,
    {
      methodName: MN.getAllConversations,
      params: [],
    },
  ],
  [
    MN.fetchAllConversations,
    {
      methodName: MN.fetchAllConversations,
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
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'withMessage',
          paramType: 'boolean',
          paramDefaultValue: true,
          domType: 'select',
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
          paramDefaultValue: datasheet.accounts[2].id,
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
          paramDefaultValue: datasheet.accounts[2].id,
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
    MN.getConversationUnreadCount,
    {
      methodName: MN.getConversationUnreadCount,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
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
          paramDefaultValue: datasheet.accounts[2].id,
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
          paramDefaultValue: datasheet.accounts[2].id,
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
    MN.updateConversationMessage,
    {
      methodName: MN.updateConversationMessage,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msg',
          paramType: 'json',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().getLastSendMessage(),
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
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '1111837470724457888',
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
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: ChatConversationType.PeerChat,
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
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msgType',
          paramType: 'string',
          paramDefaultValue: ChatMessageType.TXT,
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
          paramDefaultValue: datasheet.accounts[0].id,
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
          paramDefaultValue: datasheet.accounts[2].id,
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
          paramDefaultValue: '1003607445513177152',
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
          paramDefaultValue: datasheet.accounts[2].id,
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
          paramDefaultValue: datasheet.accounts[0].id,
        },
      ],
    },
  ],
  [
    MN.getMessageWithTimestamp,
    {
      methodName: MN.getMessageWithTimestamp,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'startTime',
          paramType: 'number',
          paramDefaultValue: 1651233202699,
        },
        {
          paramName: 'endTime',
          paramType: 'number',
          paramDefaultValue: 1651234714623,
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
  [
    MN.translateMessage,
    {
      methodName: MN.translateMessage,
      params: [
        {
          paramName: 'msg',
          paramType: 'json',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().getLastSendMessage(),
        },
        {
          paramName: 'languages',
          paramType: 'json',
          paramDefaultValue: ['yue', 'en', 'fr', 'de', 'ca'],
        },
      ],
    },
  ],
  [
    MN.fetchSupportLanguages,
    {
      methodName: MN.fetchSupportLanguages,
      params: [],
    },
  ],
  [
    MN.addReaction,
    {
      methodName: MN.addReaction,
      params: [
        {
          paramName: 'reaction',
          paramType: 'string',
          paramDefaultValue: 'reaction1',
        },
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '1017652723916474936',
        },
      ],
    },
  ],
  [
    MN.removeReaction,
    {
      methodName: MN.removeReaction,
      params: [
        {
          paramName: 'reaction',
          paramType: 'string',
          paramDefaultValue: 'reaction1',
        },
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '1017560360250509880',
        },
      ],
    },
  ],
  [
    MN.fetchReactionList,
    {
      methodName: MN.fetchReactionList,
      params: [
        {
          paramName: 'msgIds',
          paramType: 'json',
          paramDefaultValue: ['1017652723916474936'],
        },
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '183504266657793',
        },
        {
          paramName: 'chatType',
          paramType: 'number',
          paramDefaultValue: ChatMessageChatType.GroupChat,
        },
      ],
    },
  ],
  [
    MN.fetchReactionDetail,
    {
      methodName: MN.fetchReactionDetail,
      params: [
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '1017220072558561848',
        },
        {
          paramName: 'reaction',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
        },
      ],
    },
  ],
  [
    MN.reportMessage,
    {
      methodName: MN.reportMessage,
      params: [
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '1017220072558561848',
        },
        {
          paramName: 'tag',
          paramType: 'string',
          paramDefaultValue: 'reaction',
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: '',
        },
      ],
    },
  ],
  [
    MN.getReactionList,
    {
      methodName: MN.getReactionList,
      params: [
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '1017220072558561848',
        },
      ],
    },
  ],
  [
    MN.groupAckCount,
    {
      methodName: MN.groupAckCount,
      params: [
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '10172200725585618481',
        },
      ],
    },
  ],
  [
    MN.createChatThread,
    {
      methodName: MN.createChatThread,
      params: [
        {
          paramName: 'threadName',
          paramType: 'string',
          paramDefaultValue: 'name',
        },
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '1019115514598787640',
        },
        {
          paramName: 'parentId',
          paramType: 'string',
          paramDefaultValue: '183958105030657',
        },
      ],
    },
  ],
  [
    MN.joinChatThread,
    {
      methodName: MN.joinChatThread,
      params: [
        {
          paramName: 'chatThreadId',
          paramType: 'string',
          paramDefaultValue: '184230147588097',
        },
      ],
    },
  ],
  [
    MN.leaveChatThread,
    {
      methodName: MN.leaveChatThread,
      params: [
        {
          paramName: 'chatThreadId',
          paramType: 'string',
          paramDefaultValue: '184230147588097',
        },
      ],
    },
  ],
  [
    MN.destroyChatThread,
    {
      methodName: MN.destroyChatThread,
      params: [
        {
          paramName: 'chatThreadId',
          paramType: 'string',
          paramDefaultValue: '184230147588097',
        },
      ],
    },
  ],
  [
    MN.updateChatThreadName,
    {
      methodName: MN.updateChatThreadName,
      params: [
        {
          paramName: 'chatThreadId',
          paramType: 'string',
          paramDefaultValue: '184230147588097',
        },
        {
          paramName: 'newName',
          paramType: 'string',
          paramDefaultValue: 'newName',
        },
      ],
    },
  ],
  [
    MN.removeMemberWithChatThread,
    {
      methodName: MN.removeMemberWithChatThread,
      params: [
        {
          paramName: 'chatThreadId',
          paramType: 'string',
          paramDefaultValue: '184230147588097',
        },
        {
          paramName: 'memberId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
        },
      ],
    },
  ],
  [
    MN.fetchMembersWithChatThreadFromServer,
    {
      methodName: MN.fetchMembersWithChatThreadFromServer,
      params: [
        {
          paramName: 'chatThreadId',
          paramType: 'string',
          paramDefaultValue: '184230147588097',
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
        },
      ],
    },
  ],
  [
    MN.fetchJoinedChatThreadFromServer,
    {
      methodName: MN.fetchJoinedChatThreadFromServer,
      params: [
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
        },
      ],
    },
  ],
  [
    MN.fetchJoinedChatThreadWithParentFromServer,
    {
      methodName: MN.fetchJoinedChatThreadWithParentFromServer,
      params: [
        {
          paramName: 'parentId',
          paramType: 'string',
          paramDefaultValue: '183958105030657',
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
        },
      ],
    },
  ],
  [
    MN.fetchChatThreadWithParentFromServer,
    {
      methodName: MN.fetchChatThreadWithParentFromServer,
      params: [
        {
          paramName: 'parentId',
          paramType: 'string',
          paramDefaultValue: '183958105030657',
        },
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
        },
      ],
    },
  ],
  [
    MN.fetchLastMessageWithChatThread,
    {
      methodName: MN.fetchLastMessageWithChatThread,
      params: [
        {
          paramName: 'chatThreadIds',
          paramType: 'json',
          paramDefaultValue: ['184230147588097'],
        },
      ],
    },
  ],
  [
    MN.fetchChatThreadFromServer,
    {
      methodName: MN.fetchChatThreadFromServer,
      params: [
        {
          paramName: 'chatThreadId',
          paramType: 'string',
          paramDefaultValue: '184230147588097',
        },
      ],
    },
  ],
  [
    MN.getMessageThread,
    {
      methodName: MN.getMessageThread,
      params: [
        {
          paramName: 'msgId',
          paramType: 'string',
          paramDefaultValue: '1020169139521587768',
        },
      ],
    },
  ],
  [
    MN.setConversationExtension,
    {
      methodName: MN.setConversationExtension,
      params: [
        {
          paramName: 'convId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
          domType: 'input',
        },
        {
          paramName: 'ext',
          paramType: 'json',
          paramDefaultValue: { key: 'value' },
          domType: 'input',
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
          paramName: 'msg',
          paramType: 'json',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().createTextMessage(),
        },
      ],
    },
  ],
  [
    MN.deleteMessagesBeforeTimestamp,
    {
      methodName: MN.deleteMessagesBeforeTimestamp,
      params: [
        {
          paramName: 'timestamp', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'number',
          paramDefaultValue: 16765345578360,
        },
      ],
    },
  ],
  [
    MN.getThreadConversation,
    {
      methodName: MN.getThreadConversation,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'createIfNeed',
          paramType: 'boolean',
          paramDefaultValue: true,
          domType: 'select',
        },
      ],
    },
  ],
  [
    MN.fetchConversationsFromServerWithPage,
    {
      methodName: MN.fetchConversationsFromServerWithPage,
      params: [
        {
          paramName: 'pageSize', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'number',
          paramDefaultValue: 10,
        },
        {
          paramName: 'pageNum', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'number',
          paramDefaultValue: 1,
        },
      ],
    },
  ],
  [
    MN.removeMessagesFromServerWithMsgIds,
    {
      methodName: MN.removeMessagesFromServerWithMsgIds,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'msgIds',
          paramType: 'json',
          paramDefaultValue: ['1109957101259588964'],
        },
      ],
    },
  ],
  [
    MN.removeMessagesFromServerWithTimestamp,
    {
      methodName: MN.removeMessagesFromServerWithTimestamp,
      params: [
        {
          paramName: 'convId', // 使用发送成功或者失败的数据测试，依赖sendMessage
          paramType: 'string',
          paramDefaultValue: '206054790070283',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 1,
        },
        {
          paramName: 'timestamp',
          paramType: 'number',
          paramDefaultValue: 1675997166172,
        },
      ],
    },
  ],
]);
