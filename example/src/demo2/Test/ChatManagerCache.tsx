import {
  ChatMessage,
  ChatMessageStatusCallback,
  ChatError,
  ChatMessageChatType,
} from 'react-native-chat-sdk';
import { datasheet } from '../__default__/Datasheet';
import { metaDataList, MN } from './QuickTestChatData';

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
    id: string = datasheet.accounts[2].id,
    type: ChatMessageChatType = ChatMessageChatType.PeerChat
  ): ChatMessage {
    let ret: ChatMessage;
    if (this.sendMessageList.length > 0) {
      ret = this.sendMessageList[this.sendMessageList.length - 1];
    } else {
      ret = this.createTestMessage(id, Date.now().toString(), type);
    }
    return ret;
  }
  public addSendMessage(msg: ChatMessage): void {
    this.sendMessageList.push(msg);
  }
  public getLastRecvMessage(
    id: string = datasheet.accounts[2].id,
    type: ChatMessageChatType = ChatMessageChatType.PeerChat
  ): ChatMessage {
    let ret: ChatMessage;
    if (this.recvMessageList.length > 0) {
      ret = this.recvMessageList[this.recvMessageList.length - 1];
    } else {
      ret = this.createTestMessage(id, Date.now().toString(), type);
    }
    return ret;
  }
  public addRecvMessage(msg: ChatMessage): void {
    this.recvMessageList.push(msg);
  }

  public createTestMessage(
    id: string,
    context: string,
    type: ChatMessageChatType,
    testType: number = 1 // 1.普通消息 2.翻译消息 3.thread消息
  ): ChatMessage {
    let ret: ChatMessage;
    if (testType === 2) {
      ret = this.createTextMessageWithTranslate(id, '中国人的礼物', type, [
        'en',
        'fr',
      ]);
    } else if (testType === 3) {
      ret = this.createTextMessageWithThread(id, context, type, true);
    } else {
      ret = this.createTextMessageWithParams(id, context, type);
    }
    return ret;
  }

  public createTextMessage(): ChatMessage {
    const targetId = metaDataList.get(MN.sendMessage)?.params[0]
      .paramDefaultValue;
    const targetType: ChatMessageChatType = metaDataList.get(MN.sendMessage)
      ?.params[1].paramDefaultValue;
    const content: string = Date.now().toString();
    return this.createTextMessageWithParams(targetId, content, targetType);
  }
  public createTextMessageWithParams(
    targetId: string,
    content: string,
    targetType: ChatMessageChatType
  ): ChatMessage {
    const msg = ChatMessage.createTextMessage(targetId, content, targetType);
    return msg;
  }

  public createTextMessageWithTranslate(
    targetId: string,
    content: string,
    targetType: ChatMessageChatType,
    languages: Array<string>
  ): ChatMessage {
    const ext = {
      targetLanguages: languages,
    };
    const msg = ChatMessage.createTextMessage(
      targetId,
      content,
      targetType,
      ext
    );
    return msg;
  }

  public createTextMessageWithThread(
    targetId: string,
    content: string,
    targetType: ChatMessageChatType,
    isChatThread: boolean
  ): ChatMessage {
    const ext = {
      isChatThread: isChatThread,
    };
    const msg = ChatMessage.createTextMessage(
      targetId,
      content,
      targetType,
      ext
    );
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
