import {
  ChatMessageType,
  ChatMessageChatType,
  ChatMessage,
  ChatMessageStatusCallback,
  ChatError,
} from 'react-native-chat-sdk';
import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';
import type { StateChatMessage, StatelessChatMessage } from './ChatManagerItem';

export const MN = {
  sendMessage: 'sendMessage',
  resendMessage: 'resendMessage',
  sendMessageReadAck: 'sendMessageReadAck',
  sendGroupMessageReadAck: 'sendGroupMessageReadAck',
  sendConversationReadAck: 'sendConversationReadAck',
  recallMessage: 'recallMessage',
  getMessage: 'getMessage',
  markAllConversationsAsRead: 'markAllConversationsAsRead',
  getUnreadMessageCount: 'getUnreadMessageCount',
  updateMessage: 'updateMessage',
  importMessages: 'importMessages',
  downloadAttachment: 'downloadAttachment',
  downloadThumbnail: 'downloadThumbnail',
  fetchHistoryMessages: 'fetchHistoryMessages',
  searchMsgFromDB: 'searchMsgFromDB',
  fetchGroupAcks: 'fetchGroupAcks',
  deleteRemoteConversation: 'deleteRemoteConversation',
  getConversation: 'getConversation',
  loadAllConversations: 'loadAllConversations',
  getConversationsFromServer: 'getConversationsFromServer',
  deleteConversation: 'deleteConversation',
  getLatestMessage: 'getLatestMessage',
  getLastReceivedMessage: 'getLastReceivedMessage',
  unreadCount: 'unreadCount',
  markMessageAsRead: 'markMessageAsRead',
  markAllMessagesAsRead: 'markAllMessagesAsRead',
  insertMessage: 'insertMessage',
  appendMessage: 'appendMessage',
  updateConversationMessage: 'updateConversationMessage',
  deleteMessage: 'deleteMessage',
  deleteAllMessages: 'deleteAllMessages',
  getMessageById: 'getMessageById',
  getMessagesWithMsgType: 'getMessagesWithMsgType',
  getMessages: 'getMessages',
  getMessagesWithKeyword: 'getMessagesWithKeyword',
  getMessagesFromTime: 'getMessagesFromTime',
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
          paramType: 'object',
          paramDefaultValue: ChatMessageChatType.PeerChat,
        },
        {
          paramName: 'content',
          paramType: 'object',
          paramDefaultValue: Date.now().toString(),
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
          paramType: 'object',
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
          paramDefaultValue: '165122593166911045',
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
          paramType: 'object',
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
          paramType: 'object',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().getLastRecvMessage(),
        },
        {
          paramName: 'callback', // 创建新的回调接收
          paramType: 'object',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().createCallback(),
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
          paramValue: () => ChatManagerCache.getInstance().getLastRecvMessage(),
        },
        {
          paramName: 'callback', // 创建新的回调接收
          paramType: 'object',
          paramDefaultValue: {},
          paramValue: () => ChatManagerCache.getInstance().createCallback(),
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
    MN.deleteRemoteConversation,
    {
      methodName: MN.deleteRemoteConversation,
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
    MN.unreadCount,
    {
      methodName: MN.unreadCount,
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
    MN.insertMessage,
    {
      methodName: MN.insertMessage,
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
          paramType: 'object',
          paramDefaultValue: {},
          // paramValue: () => ChatManagerCache.getInstance().getLastSendMessage(),
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
          paramDefaultValue: datasheet.accounts[2].id,
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
          paramValue: () => ChatManagerCache.getInstance().getLastSendMessage(),
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
          paramType: 'object',
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
          paramType: 'object',
          paramDefaultValue: '1003599319195977800',
          paramValue: () => ChatManagerCache.getInstance().getLastRecvMessage(),
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
          paramDefaultValue: '1003598147630401664',
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
    MN.getMessagesFromTime,
    {
      methodName: MN.getMessagesFromTime,
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
]);

let formatData: any = {};
for (let key of metaDataList.keys()) {
  let eachMethodParams: any = {};
  metaDataList.get(key)?.params.forEach((item) => {
    eachMethodParams[item.paramName] = item.paramDefaultValue;
  });
  formatData[key] = eachMethodParams;
}
export const stateDataValue: StateChatMessage = Object.assign({}, formatData, {
  sendResult: '',
  recvResult: '',
  exceptResult: '',
  cb_result: '',
});

export const statelessDataValue: StatelessChatMessage = {
  sendMessage: {},
  resendMessage: {},
  sendMessageReadAck: {},
};

export interface ChatMessageCacheListener {
  onProgress(localMsgId: string, progress: number): void;
  onError(localMsgId: string, error: ChatError): void;
  onSuccess(message: ChatMessage): void;
}

export class ChatManagerCache {
  protected TAG = 'ChatManagerCache';
  private static _instance: ChatManagerCache;
  public static getInstance(): ChatManagerCache {
    if (
      ChatManagerCache._instance === null ||
      ChatManagerCache._instance === undefined
    ) {
      ChatManagerCache._instance = new ChatManagerCache();
    }
    return ChatManagerCache._instance;
  }

  sendMessageList: Array<ChatMessage>;
  recvMessageList: Array<ChatMessage>;
  listener: ChatMessageCacheListener;
  callbackList: Set<ChatMessageStatusCallback>;

  constructor() {
    this.sendMessageList = [];
    this.recvMessageList = [];
    this.callbackList = new Set();
    this.listener = new (class implements ChatMessageCacheListener {
      that: ChatManagerCache;
      constructor(parent: ChatManagerCache) {
        this.that = parent;
      }
      onProgress(localMsgId: string, progress: number): void {
        this.that.callbackList.forEach((value: ChatMessageStatusCallback) => {
          value.onProgress(localMsgId, progress);
        });
      }
      onError(localMsgId: string, error: ChatError): void {
        this.that.callbackList.forEach((value: ChatMessageStatusCallback) => {
          value.onError(localMsgId, error);
        });
      }
      onSuccess(message: ChatMessage): void {
        this.that.callbackList.forEach((value: ChatMessageStatusCallback) => {
          value.onSuccess(message);
        });
      }
    })(this);
  }

  public addListener(listener: ChatMessageStatusCallback): void {
    this.callbackList.add(listener);
  }
  public removeListener(listener: ChatMessageStatusCallback): void {
    this.callbackList.delete(listener);
  }
  public removeAllListener(): void {
    this.callbackList.clear();
  }

  public getLastSendMessage(
    type: ChatMessageChatType = ChatMessageChatType.PeerChat
  ): ChatMessage {
    let ret: ChatMessage;
    if (this.sendMessageList.length > 0) {
      ret = this.sendMessageList[this.sendMessageList.length - 1];
    }
    if (type === ChatMessageChatType.PeerChat) {
      ret = this.createTextMessage();
    } else {
      ret = this.createGroupTextMessage();
    }
    return ret;
  }
  public addSendMessage(msg: ChatMessage): void {
    this.sendMessageList.push(msg);
  }
  public getLastRecvMessage(
    type: ChatMessageChatType = ChatMessageChatType.PeerChat
  ): ChatMessage {
    if (this.recvMessageList.length > 0) {
      const msg = this.recvMessageList[this.recvMessageList.length - 1];
      return msg;
    }
    if (type === ChatMessageChatType.PeerChat) {
      return this.createTextMessage();
    } else {
      return this.createGroupTextMessage();
    }
  }
  public addRecvMessage(msg: ChatMessage): void {
    this.recvMessageList.push(msg);
  }

  public createTextMessage(): ChatMessage {
    const targetId = metaDataList.get(MN.sendMessage)?.params[0]
      .paramDefaultValue;
    const targetType: ChatMessageChatType = metaDataList.get(MN.sendMessage)
      ?.params[1].paramDefaultValue;
    const content: string = Date.now().toString();
    const msg = ChatMessage.createTextMessage(targetId, content, targetType);
    return msg;
  }

  public createGroupTextMessage(): ChatMessage {
    const targetId = '179992049811458';
    const targetType: ChatMessageChatType = ChatMessageChatType.GroupChat;
    const content: string = Date.now().toString();
    const msg = ChatMessage.createTextMessage(targetId, content, targetType);
    msg.needGroupAck = true;
    return msg;
  }

  public createCallback(): ChatMessageStatusCallback {
    const ret = new (class implements ChatMessageStatusCallback {
      that: ChatManagerCache;
      constructor(parent: ChatManagerCache) {
        this.that = parent;
      }
      onProgress(localMsgId: string, progress: number): void {
        console.log(`${this.that.TAG}: onProgress: `, localMsgId, progress);
        this.that.listener.onProgress(localMsgId, progress);
      }
      onError(localMsgId: string, error: ChatError): void {
        console.log(`${this.that.TAG}: onError: `, localMsgId, error);
        this.that.listener.onError(localMsgId, error);
      }
      onSuccess(message: ChatMessage): void {
        console.log(`${this.that.TAG}: onSuccess: `, message);
        this.that.listener.onSuccess(message);
      }
    })(this);
    return ret;
  }
}
