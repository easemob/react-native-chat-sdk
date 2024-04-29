import type { NativeEventEmitter } from 'react-native';

import { BaseManager } from './__internal__/Base';
import {
  MTackConversationRead,
  MTackGroupMessageRead,
  MTackMessageRead,
  MTaddReaction,
  MTaddRemoteAndLocalConversationsMark,
  MTasyncFetchGroupAcks,
  MTclearAllMessages,
  MTcreateChatThread,
  MTdeleteAllMessageAndConversation,
  MTdeleteConversation,
  MTdeleteMessagesBeforeTimestamp,
  MTdeleteMessagesWithTs,
  MTdeleteRemoteAndLocalConversationsMark,
  MTdeleteRemoteConversation,
  MTdestroyChatThread,
  MTdownloadAndParseCombineMessage,
  MTdownloadAttachment,
  MTdownloadAttachmentInCombine,
  MTdownloadThumbnail,
  MTdownloadThumbnailInCombine,
  MTfetchChatThreadDetail,
  MTfetchChatThreadMember,
  MTfetchChatThreadsWithParentId,
  MTfetchConversationsByOptions,
  MTfetchConversationsFromServerWithPage,
  MTfetchHistoryMessages,
  MTfetchHistoryMessagesByOptions,
  MTfetchJoinedChatThreads,
  MTfetchJoinedChatThreadsWithParentId,
  MTfetchLastMessageWithChatThreads,
  MTfetchPinnedMessages,
  MTfetchReactionDetail,
  MTfetchReactionList,
  MTfetchSupportLanguages,
  MTgetConversation,
  MTgetConversationsFromServer,
  MTgetConversationsFromServerWithCursor,
  MTgetLatestMessage,
  MTgetLatestMessageFromOthers,
  MTgetMessage,
  MTgetMessageThread,
  MTgetMsgCount,
  MTgetPinInfo,
  MTgetPinnedConversationsFromServerWithCursor,
  MTgetReactionList,
  MTgetThreadConversation,
  MTgetUnreadMessageCount,
  MTgetUnreadMsgCount,
  MTgroupAckCount,
  MTimportMessages,
  MTinsertMessage,
  MTjoinChatThread,
  MTleaveChatThread,
  MTloadAllConversations,
  MTloadMsgWithKeywords,
  MTloadMsgWithMsgType,
  MTloadMsgWithStartId,
  MTloadMsgWithTime,
  MTmarkAllChatMsgAsRead,
  MTmarkAllMessagesAsRead,
  MTmarkMessageAsRead,
  MTmessageReactionDidChange,
  MTmodifyMessage,
  MTonChatThreadCreated,
  MTonChatThreadDestroyed,
  MTonChatThreadUpdated,
  MTonChatThreadUserRemoved,
  MTonCmdMessagesReceived,
  MTonConversationHasRead,
  MTonConversationUpdate,
  MTonGroupMessageRead,
  MTonMessageContentChanged,
  MTonMessagePinChanged,
  MTonMessagesDelivered,
  MTonMessagesRead,
  MTonMessagesRecalled,
  MTonMessagesReceived,
  MTonReadAckForGroupMessageUpdated,
  MTpinConversation,
  MTpinMessage,
  MTpinnedMessages,
  MTrecallMessage,
  MTremoveMemberFromChatThread,
  MTremoveMessage,
  MTremoveMessagesFromServerWithMsgIds,
  MTremoveMessagesFromServerWithTs,
  MTremoveReaction,
  MTreportMessage,
  MTresendMessage,
  MTsearchChatMsgFromDB,
  MTsendMessage,
  MTsyncConversationExt,
  MTtranslateMessage,
  MTunpinMessage,
  MTupdateChatMessage,
  MTupdateChatThreadSubject,
  MTupdateConversationMessage,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import { ChatClient } from './ChatClient';
import type { ChatMessageEventListener } from './ChatEvents';
import { chatlog } from './common/ChatConst';
import {
  ChatConversation,
  ChatConversationFetchOptions,
  ChatConversationMarkType,
  ChatConversationType,
  ChatSearchDirection,
} from './common/ChatConversation';
import { ChatCursorResult } from './common/ChatCursorResult';
import { ChatError } from './common/ChatError';
import { ChatGroupMessageAck } from './common/ChatGroup';
import {
  ChatFetchMessageOptions,
  ChatMessage,
  ChatMessageBody,
  ChatMessageChatType,
  ChatMessagePinInfo,
  ChatMessageSearchScope,
  ChatMessageStatus,
  ChatMessageStatusCallback,
  ChatMessageType,
} from './common/ChatMessage';
import {
  ChatMessageReaction,
  ChatMessageReactionEvent,
  ChatReactionOperation,
} from './common/ChatMessageReaction';
import {
  ChatMessageThread,
  ChatMessageThreadEvent,
} from './common/ChatMessageThread';
import { ChatTranslateLanguage } from './common/ChatTranslateLanguage';

/**
 * 聊天管理类，该类负责收发消息、管理会话（加载，删除等）、下载消息附件等。
 *
 * 发送文文本消息示例如下：
 *
 *  ```typescript
 *  let msg = ChatMessage.createTextMessage(
 *    'asteriskhx2',
 *    Date.now().toString(),
 *    ChatMessageChatType.PeerChat
 *  );
 *  let callback = new (class s implements ChatMessageStatusCallback {
 *    onProgress(progress: number): void {
 *      chatlog.log('ConnectScreen.sendMessage.onProgress ', progress);
 *    }
 *    onError(error: ChatError): void {
 *      chatlog.log('ConnectScreen.sendMessage.onError ', error);
 *    }
 *    onSuccess(): void {
 *      chatlog.log('ConnectScreen.sendMessage.onSuccess');
 *    }
 *    onReadAck(): void {
 *      chatlog.log('ConnectScreen.sendMessage.onReadAck');
 *    }
 *    onDeliveryAck(): void {
 *      chatlog.log('ConnectScreen.sendMessage.onDeliveryAck');
 *    }
 *    onStatusChanged(status: ChatMessageStatus): void {
 *      chatlog.log('ConnectScreen.sendMessage.onStatusChanged ', status);
 *    }
 *  })();
 *  ChatClient.getInstance()
 *    .chatManager.sendMessage(msg, callback)
 *    .then((nmsg: ChatMessage) => {
 *      chatlog.log(`${msg}, ${nmsg}`);
 *    })
 *    .catch();
 *  ```
 */
export class ChatManager extends BaseManager {
  static TAG = 'ChatManager';

  private _messageListeners: Set<ChatMessageEventListener>;

  constructor() {
    super();
    this._messageListeners = new Set<ChatMessageEventListener>();
  }

  public setNativeListener(event: NativeEventEmitter) {
    chatlog.log(`${ChatManager.TAG}: setNativeListener: `);
    this._eventEmitter = event;
    event.removeAllListeners(MTonMessagesReceived);
    event.addListener(MTonMessagesReceived, this.onMessagesReceived.bind(this));
    event.removeAllListeners(MTonCmdMessagesReceived);
    event.addListener(
      MTonCmdMessagesReceived,
      this.onCmdMessagesReceived.bind(this)
    );
    event.removeAllListeners(MTonMessagesRead);
    event.addListener(MTonMessagesRead, this.onMessagesRead.bind(this));
    event.removeAllListeners(MTonGroupMessageRead);
    event.addListener(MTonGroupMessageRead, this.onGroupMessageRead.bind(this));
    event.removeAllListeners(MTonMessagesDelivered);
    event.addListener(
      MTonMessagesDelivered,
      this.onMessagesDelivered.bind(this)
    );
    event.removeAllListeners(MTonMessagesRecalled);
    event.addListener(MTonMessagesRecalled, this.onMessagesRecalled.bind(this));
    event.removeAllListeners(MTonConversationUpdate);
    event.addListener(
      MTonConversationUpdate,
      this.onConversationsUpdate.bind(this)
    );
    event.removeAllListeners(MTonConversationHasRead);
    event.addListener(
      MTonConversationHasRead,
      this.onConversationHasRead.bind(this)
    );
    event.removeAllListeners(MTonReadAckForGroupMessageUpdated);
    event.addListener(
      MTonReadAckForGroupMessageUpdated,
      this.onReadAckForGroupMessageUpdated.bind(this)
    );
    event.removeAllListeners(MTmessageReactionDidChange);
    event.addListener(
      MTmessageReactionDidChange,
      this.onMessageReactionDidChange.bind(this)
    );

    event.removeAllListeners(MTonChatThreadCreated);
    event.addListener(
      MTonChatThreadCreated,
      this.onChatMessageThreadCreated.bind(this)
    );
    event.removeAllListeners(MTonChatThreadUpdated);
    event.addListener(
      MTonChatThreadUpdated,
      this.onChatMessageThreadUpdated.bind(this)
    );
    event.removeAllListeners(MTonChatThreadDestroyed);
    event.addListener(
      MTonChatThreadDestroyed,
      this.onChatMessageThreadDestroyed.bind(this)
    );
    event.removeAllListeners(MTonChatThreadUserRemoved);
    event.addListener(
      MTonChatThreadUserRemoved,
      this.onChatMessageThreadUserRemoved.bind(this)
    );
    event.removeAllListeners(MTonMessageContentChanged);
    event.addListener(
      MTonMessageContentChanged,
      this.onMessageContentChanged.bind(this)
    );
    event.removeAllListeners(MTonMessagePinChanged);
    event.addListener(
      MTonMessagePinChanged,
      this.onMessagePinChanged.bind(this)
    );
  }

  private filterUnsupportedMessage(messages: ChatMessage[]): ChatMessage[] {
    return messages.filter((message: ChatMessage) => {
      return message.body.type !== ('unknown' as ChatMessageType);
    });
  }

  private createReceiveMessage(messages: any[]): ChatMessage[] {
    let list: Array<ChatMessage> = [];
    messages.forEach((message: any) => {
      let m = ChatMessage.createReceiveMessage(message);
      list.push(m);
    });
    return this.filterUnsupportedMessage(list);
  }

  private onMessagesReceived(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesReceived: `, messages);
    if (this._messageListeners.size === 0) {
      return;
    }
    let list: Array<ChatMessage> = this.createReceiveMessage(messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onMessagesReceived?.(list);
    });
  }
  private onCmdMessagesReceived(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onCmdMessagesReceived: `, messages);
    if (this._messageListeners.size === 0) {
      return;
    }
    let list: Array<ChatMessage> = this.createReceiveMessage(messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onCmdMessagesReceived?.(list);
    });
  }
  private onMessagesRead(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesRead: `, messages);
    if (this._messageListeners.size === 0) {
      return;
    }
    let list: Array<ChatMessage> = this.createReceiveMessage(messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onMessagesRead?.(list);
    });
  }
  private onGroupMessageRead(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onGroupMessageRead: `, messages);
    if (this._messageListeners.size === 0) {
      return;
    }
    let list: Array<ChatGroupMessageAck> = [];
    messages.forEach((message: any) => {
      let m = new ChatGroupMessageAck(message);
      list.push(m);
    });
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onGroupMessageRead?.(messages);
    });
  }
  private onMessagesDelivered(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesDelivered: `, messages);
    if (this._messageListeners.size === 0) {
      return;
    }
    let list: Array<ChatMessage> = this.createReceiveMessage(messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onMessagesDelivered?.(list);
    });
  }
  private onMessagesRecalled(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesRecalled: `, messages);
    if (this._messageListeners.size === 0) {
      return;
    }
    let list: Array<ChatMessage> = this.createReceiveMessage(messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onMessagesRecalled?.(list);
    });
  }
  private onConversationsUpdate(): void {
    chatlog.log(`${ChatManager.TAG}: onConversationsUpdate: `);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onConversationsUpdate?.();
    });
  }
  private onConversationHasRead(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onConversationHasRead: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let from = params?.from;
      let to = params?.to;
      listener.onConversationRead?.(from, to);
    });
  }

  private onReadAckForGroupMessageUpdated(params: any): void {
    chatlog.log(
      `${ChatManager.TAG}: onReadAckForGroupMessageUpdated: `,
      params
    );
  }

  private onMessageReactionDidChange(params: any): void {
    chatlog.log(
      `${ChatManager.TAG}: onMessageReactionDidChange: `,
      JSON.stringify(params)
    );
    if (this._messageListeners.size === 0) {
      return;
    }
    const list: Array<ChatMessageReactionEvent> = [];
    Object.entries(params).forEach((v: [string, any]) => {
      const convId = v[1].conversationId;
      const msgId = v[1].messageId;
      const ll: Array<ChatMessageReaction> = [];
      Object.entries(v[1].reactions).forEach((vv: [string, any]) => {
        ll.push(new ChatMessageReaction(vv[1]));
      });
      const o: Array<ChatReactionOperation> = [];
      Object.entries(v[1].operations).forEach((vv: [string, any]) => {
        o.push(ChatReactionOperation.fromNative(vv[1]));
      });
      list.push(
        new ChatMessageReactionEvent({
          convId: convId,
          msgId: msgId,
          reactions: ll,
          operations: o,
        })
      );
    });
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onMessageReactionDidChange?.(list);
    });
  }

  private onChatMessageThreadCreated(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onChatMessageThreadCreated: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onChatMessageThreadCreated?.(new ChatMessageThreadEvent(params));
    });
  }

  private onChatMessageThreadUpdated(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onChatMessageThreadUpdated: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onChatMessageThreadUpdated?.(new ChatMessageThreadEvent(params));
    });
  }

  private onChatMessageThreadDestroyed(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onChatMessageThreadDestroyed: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onChatMessageThreadDestroyed?.(
        new ChatMessageThreadEvent(params)
      );
    });
  }

  private onChatMessageThreadUserRemoved(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onChatMessageThreadUserRemoved: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onChatMessageThreadUserRemoved?.(
        new ChatMessageThreadEvent(params)
      );
    });
  }

  private onMessageContentChanged(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onMessageContentChanged: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onMessageContentChanged?.(
        ChatMessage.createReceiveMessage(params.message),
        params.lastModifyOperatorId,
        params.lastModifyTime
      );
    });
  }

  private onMessagePinChanged(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onMessagePinChanged: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onMessagePinChanged?.({
        messageId: params.messageId,
        convId: params.conversationId,
        pinOperation: params.pinOperation,
        pinInfo: new ChatMessagePinInfo(params.pinInfo),
      });
    });
  }

  private static handleSendMessageCallback(
    self: ChatManager,
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): void {
    ChatManager.handleMessageCallback(MTsendMessage, self, message, callback);
  }

  private static handleResendMessageCallback(
    self: ChatManager,
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): void {
    ChatManager.handleMessageCallback(MTresendMessage, self, message, callback);
  }

  private static handleDownloadAttachmentCallback(
    self: ChatManager,
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): void {
    ChatManager.handleMessageCallback(
      MTdownloadAttachment,
      self,
      message,
      callback
    );
  }

  private static handleDownloadThumbnailCallback(
    self: ChatManager,
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): void {
    ChatManager.handleMessageCallback(
      MTdownloadThumbnail,
      self,
      message,
      callback
    );
  }

  private static handleDownloadFileCallback(
    self: ChatManager,
    message: ChatMessage,
    method: string,
    callback?: ChatMessageStatusCallback
  ): void {
    ChatManager.handleMessageCallback(method, self, message, callback);
  }

  /**
   * 添加消息监听器。
   *
   * @param listener 要添加的消息监听器。
   */
  public addMessageListener(listener: ChatMessageEventListener): void {
    chatlog.log(`${ChatManager.TAG}: addMessageListener: `);
    this._messageListeners.add(listener);
  }

  /**
   * 移除消息监听器。
   *
   * @param listener 要移除的消息监听器。
   */
  public removeMessageListener(listener: ChatMessageEventListener): void {
    chatlog.log(`${ChatManager.TAG}: removeMessageListener: `);
    this._messageListeners.delete(listener);
  }

  /**
   * 移除所有消息监听器。
   */
  public removeAllMessageListener(): void {
    chatlog.log(`${ChatManager.TAG}: removeAllMessageListener: `);
    this._messageListeners.clear();
  }

  /**
   * 发送一条消息。
   *
   * **注意**
   *
   * - 如果是语音，图片类等有附件的消息，SDK 会自动上传附件。
   * - 可以通过 {@link ChatOptions} 设置是否上传到聊天服务器。
   *
   * @param message 要发送的消息，必填。
   * @param callback 消息状态监听器。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async sendMessage(
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: sendMessage: ${message.msgId}, ${message.localTime}`,
      message
    );
    message.status = ChatMessageStatus.PROGRESS;
    ChatManager.handleSendMessageCallback(this, message, callback);
    let r: any = await Native._callMethod(MTsendMessage, {
      [MTsendMessage]: message,
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 重发消息。
   *
   * @param message 需要重发的消息。
   * @param callback 消息状态监听器。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async resendMessage(
    message: ChatMessage,
    callback: ChatMessageStatusCallback
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: resendMessage: ${message.msgId}, ${message.localTime}`,
      message
    );
    if (
      message.msgId !== message.localMsgId &&
      message.status === ChatMessageStatus.SUCCESS
    ) {
      callback.onError(
        message.localMsgId,
        new ChatError({ code: 1, description: 'The message had send success' })
      );
      return;
    }
    message.status = ChatMessageStatus.PROGRESS;
    ChatManager.handleResendMessageCallback(this, message, callback);
    let r: any = await Native._callMethod(MTresendMessage, {
      [MTsendMessage]: message,
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 发送消息的已读回执。
   *
   * 该方法只针对单聊会话。
   *
   * **注意**
   *
   * 该方法只有在 {@link ChatOptions.requireAck} 为 `true` 时才生效。
   *
   * 若发送群消息已读回执，详见 {@link sendGroupMessageReadAck}。
   *
   * 推荐进入会话页面时调用 {@link sendConversationReadAck}，其他情况下调用该方法以减少调用频率。
   *
   * @param message 需要发送已读回执的消息。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async sendMessageReadAck(message: ChatMessage): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: sendMessageReadAck: ${message.msgId}, ${message.localTime}`,
      message
    );
    let r: any = await Native._callMethod(MTackMessageRead, {
      [MTackMessageRead]: {
        to: message.from,
        msg_id: message.msgId,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 发送群消息已读回执。
   *
   * **Warning**
   *
   * - 该方法只有在 {@link ChatOptions.requireAck} 和 {@link ChatMessage.needGroupAck} 设置为 `true` 时才会生效。
   * - 该方法仅对群组消息有效。发送单聊消息已读回执，详见 {@link sendMessageReadAck}；发送会话已读回执，详见 {@link sendConversationReadAck}。
   *
   * @param msgId 消息 ID。
   * @param groupId 群组 ID。
   * @param opt 扩展信息。用户通过定义关键字指定动作或命令。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async sendGroupMessageReadAck(
    msgId: string,
    groupId: string,
    opt?: { content: string }
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: sendGroupMessageReadAck: ${msgId}, ${groupId}`
    );
    let s = opt?.content
      ? {
          msg_id: msgId,
          group_id: groupId,
          content: opt?.content,
        }
      : {
          msg_id: msgId,
          group_id: groupId,
        };
    let r: any = await Native._callMethod(MTackGroupMessageRead, {
      [MTackGroupMessageRead]: s,
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 发送会话的已读回执。
   *
   * **注意**
   *
   * - 该方法仅适用于单聊会话。
   *
   * - 该方法通知服务器将此会话未读数设置为 `0`，消息发送方（包含多端多设备）将会收到 {@link ChatMessageEventListener.onConversationRead} 回调。
   *
   * @param convId 会话 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async sendConversationReadAck(convId: string): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: sendConversationReadAck: ${convId}`);
    let r: any = await Native._callMethod(MTackConversationRead, {
      [MTackConversationRead]: {
        convId: convId,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 撤回发送成功的消息。
   *
   * @param msgId 消息 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async recallMessage(msgId: string): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: recallMessage: ${msgId}`);
    let r: any = await Native._callMethod(MTrecallMessage, {
      [MTrecallMessage]: {
        msg_id: msgId,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 从本地数据库获取指定 ID 的消息对象。
   *
   * @param msgId 消息 ID。
   * @returns 获取的消息对象。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getMessage(msgId: string): Promise<ChatMessage | undefined> {
    chatlog.log(`${ChatManager.TAG}: getMessage: ${msgId}`);
    let r: any = await Native._callMethod(MTgetMessage, {
      [MTgetMessage]: {
        msg_id: msgId,
      },
    });
    Native.checkErrorFromResult(r);
    const rr = r?.[MTgetMessage];
    if (rr) {
      return new ChatMessage(rr);
    }
    return undefined;
  }

  /**
   * 将所有的会话都设成已读。
   *
   * 该方法仅对本地会话有效。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async markAllConversationsAsRead(): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: markAllConversationsAsRead: `);
    let r: any = await Native._callMethod(MTmarkAllChatMsgAsRead);
    Native.checkErrorFromResult(r);
  }

  /**
   * 获取未读消息数。
   *
   * @returns 未读消息数。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getUnreadCount(): Promise<number> {
    chatlog.log(`${ChatManager.TAG}: getUnreadCount: `);
    let r: any = await Native._callMethod(MTgetUnreadMessageCount);
    Native.checkErrorFromResult(r);
    return r?.[MTgetUnreadMessageCount] as number;
  }

  /**
   * 在本地会话中插入一条消息。
   * 例如，收到一些推送消息后，可以构建消息，写入会话。若该消息已存在（msgId 或 localMsgId 已存在），该插入操作失败。
   * 消息会根据消息里的 Unix 时间戳插入本地数据库，SDK 会更新会话的 `latestMessage` 等属性。
   *
   * @param message 要插入的消息。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async insertMessage(message: ChatMessage): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: insertMessage: `, message);
    let r: any = await Native._callMethod(MTinsertMessage, {
      [MTinsertMessage]: {
        msg: message,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 更新本地消息。
   *
   * 该方法会同时更新本地内存和数据库中的消息。
   *
   * @return 更新后的消息。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async updateMessage(message: ChatMessage): Promise<ChatMessage> {
    chatlog.log(
      `${ChatManager.TAG}: updateMessage: ${message.msgId}, ${message.localTime}`,
      message
    );
    let r: any = await Native._callMethod(MTupdateChatMessage, {
      [MTupdateChatMessage]: {
        message: message,
      },
    });
    Native.checkErrorFromResult(r);
    const rr = r?.[MTupdateChatMessage];
    return new ChatMessage(rr);
  }

  /**
   * 将消息导入本地数据库。
   *
   * 你只能将你发送或接收的消息导入本地数据库。
   *
   * @param messages 要导入的消息列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async importMessages(messages: Array<ChatMessage>): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: importMessages: ${messages.length}`,
      messages
    );
    let r: any = await Native._callMethod(MTimportMessages, {
      [MTimportMessages]: {
        messages: messages,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 下载消息附件。
   *
   * **注意** 该方法仅用于下载组合类型消息或线程类型的消息附件。
   *
   * **注意** 底层不会获取原始消息对象，会使用json转换后的消息对象。
   *
   * 如果附件自动下载失败也可以调用该方法。
   *
   * @param message 需要下载附件的消息ID。
   * @param callback 监听消息变化的监听器。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async downloadAttachmentInCombine(
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: downloadAttachmentInCombine: ${message.msgId}, ${message.localTime}`,
      message
    );
    ChatManager.handleDownloadFileCallback(
      this,
      message,
      MTdownloadAttachmentInCombine,
      callback
    );
    let r: any = await Native._callMethod(MTdownloadAttachmentInCombine, {
      [MTdownloadAttachmentInCombine]: {
        message: message,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 下载消息缩略图。
   *
   * **注意** 此方法仅用于下载组合类型消息中的消息缩略图。
   *
   * @param message 要下载缩略图的消息ID。 只有图像消息和视频消息有缩略图。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async downloadThumbnailInCombine(
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: downloadThumbnailInCombine: ${message.msgId}, ${message.localTime}`,
      message
    );
    ChatManager.handleDownloadFileCallback(
      this,
      message,
      MTdownloadThumbnailInCombine,
      callback
    );
    let r: any = await Native._callMethod(MTdownloadThumbnailInCombine, {
      [MTdownloadThumbnailInCombine]: {
        message: message,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 下载消息附件。
   *
   * 如果附件自动下载失败也可以调用该方法。
   *
   * @param message 需要下载附件的消息ID。
   * @param callback 监听消息变化的监听器。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async downloadAttachment(
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: downloadAttachment: ${message.msgId}, ${message.localTime}`,
      message
    );
    ChatManager.handleDownloadAttachmentCallback(this, message, callback);
    let r: any = await Native._callMethod(MTdownloadAttachment, {
      [MTdownloadAttachment]: {
        message: message,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 下载消息的缩略图。
   *
   * @param message 要下载缩略图的消息 ID。只有图片消息和视频消息有缩略图。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async downloadThumbnail(
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: downloadThumbnail: ${message.msgId}, ${message.localTime}`,
      message
    );
    ChatManager.handleDownloadThumbnailCallback(this, message, callback);
    let r: any = await Native._callMethod(MTdownloadThumbnail, {
      [MTdownloadThumbnail]: {
        message: message,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 分页获取指定会话的历史消息。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param chatType 会话类型。详见 {@link ChatConversationType}。
   * @param -
   * - pageSize: 每页期望返回的消息数量。
   * - startMsgId: 开始消息 ID。如果该参数为空字符串或 `null`，SDK 按服务器最新接收消息的时间倒序获取。
   * - direction: 消息搜索方向，详见 {@link ChatSearchDirection}
   * @returns 获取到的消息和下次查询的 cursor。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchHistoryMessages(
    convId: string,
    chatType: ChatConversationType,
    params: {
      pageSize?: number;
      startMsgId?: string;
      direction?: ChatSearchDirection;
    }
  ): Promise<ChatCursorResult<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchHistoryMessages: ${convId}, ${chatType}, ${params}`
    );
    let r: any = await Native._callMethod(MTfetchHistoryMessages, {
      [MTfetchHistoryMessages]: {
        convId: convId,
        convType: chatType as number,
        pageSize: params.pageSize ?? 20,
        startMsgId: params.startMsgId ?? '',
        direction: params.direction ?? ChatSearchDirection.UP,
      },
    });
    Native.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatMessage>({
      cursor: r?.[MTfetchHistoryMessages].cursor,
      list: r?.[MTfetchHistoryMessages].list,
      opt: {
        map: (param: any) => {
          return new ChatMessage(param);
        },
      },
    });
    return ret;
  }

  /**
   * 根据消息拉取参数配置从服务器分页获取指定会话的历史消息。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param chatType 会话类型。详见 {@link ChatConversationType}.
   * @param params -
   * - options: 查询历史消息的参数配置类。详见 {@link ChatFetchMessageOptions}.
   * - cursor: 查询的起始游标位置。
   * - pageSize: 每页期望获取的消息条数。取值范围为 [1,400]。
   *
   * @returns 消息列表（不包含查询起始 ID 的消息）和下次查询的 cursor。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchHistoryMessagesByOptions(
    convId: string,
    chatType: ChatConversationType,
    params?: {
      options?: ChatFetchMessageOptions;
      cursor?: string;
      pageSize?: number;
    }
  ): Promise<ChatCursorResult<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchHistoryMessagesByOptions: ${convId}, ${chatType}, ${params}`
    );
    let r: any = await Native._callMethod(MTfetchHistoryMessagesByOptions, {
      [MTfetchHistoryMessagesByOptions]: {
        convId: convId,
        convType: chatType as number,
        pageSize: params?.pageSize ?? 20,
        cursor: params?.cursor ?? '',
        options: params?.options,
      },
    });
    Native.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatMessage>({
      cursor: r?.[MTfetchHistoryMessagesByOptions].cursor,
      list: r?.[MTfetchHistoryMessagesByOptions].list,
      opt: {
        map: (param: any) => {
          return new ChatMessage(param);
        },
      },
    });
    return ret;
  }

  /**
   * 从本地数据库获取指定会话中包含特定关键字的消息。
   *
   * @param keywords 查询关键字。
   * @param timestamp 查询的起始消息 Unix 时间戳，单位为毫秒。该参数设置后，SDK 从指定时间戳的消息开始，按消息搜索方向获取。 如果该参数设置为负数，SDK 从当前时间开始搜索。
   * @param maxCount 每次获取的最大消息数。取值范围为 [1,400]。
   * @param from 单聊或群聊中的消息发送方的用户 ID。若设置为 `null` 或空字符串，SDK 将在整个会话中搜索消息。
   * @param direction 消息搜索方向。详见  {@link ChatSearchDirection}.
   *                  - (Default) `ChatSearchDirection.UP`: 按照消息中的时间戳的逆序查询
   *                  - `ChatSearchDirection.DOWN`: 按照消息中的时间戳的正序查询。
   * @returns 消息列表（不包含查询起始时间戳对应的消息）。若未查找到任何消息，返回空列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   *
   * @deprecated 2024-04-22. Use {@link getMsgsWithKeyword} instead.
   */
  public async searchMsgFromDB(
    keywords: string,
    timestamp: number = -1,
    maxCount: number = 20,
    from: string = '',
    direction: ChatSearchDirection = ChatSearchDirection.UP
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: searchMsgFromDB: ${keywords}, ${timestamp}, ${maxCount}, ${from}`
    );
    let r: any = await Native._callMethod(MTsearchChatMsgFromDB, {
      [MTsearchChatMsgFromDB]: {
        keywords: keywords,
        timeStamp: timestamp,
        maxCount: maxCount,
        from: from,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
      },
    });
    Native.checkErrorFromResult(r);
    let ret = new Array<ChatMessage>(0);
    const rr: Array<any> = r?.[MTsearchChatMsgFromDB];
    if (rr) {
      rr.forEach((element) => {
        ret.push(new ChatMessage(element));
      });
    }
    return ret;
  }

  /**
   * 获取所有会话在一定时间内的会话中发送的消息。
   *
   * 该方法从本地数据库获取数据。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @params -
   * - keywords 查询的关键字。
   * - direction 消息搜索方向。请参阅 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP` 按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN` 按照消息中包含的 Unix 时间戳的升序检索消息。
   * - timestamp 用于查询的消息中的起始 Unix 时间戳。单位是毫秒。设置该参数后，SDK 按照消息搜索方向，从指定的消息开始检索消息。
   *   如果将此参数设置为负值，则 SDK 从当前时间开始，按照消息中时间戳的降序顺序检索消息。
   * - searchScope 消息搜索范围。请参阅 {@link ChatMessageSearchScope}。
   * - maxCount 每次检索的最大消息数。取值范围为 [1,400]。
   * - from 用于检索的用户 ID 或群组 ID。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。如果没有获取到消息，返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getMsgsWithKeyword(params: {
    keywords: string;
    timestamp?: number;
    maxCount?: number;
    from?: string;
    direction?: ChatSearchDirection;
    searchScope?: ChatMessageSearchScope;
  }): Promise<Array<ChatMessage>> {
    const {
      keywords,
      timestamp = -1,
      maxCount = 20,
      from = '',
      direction = ChatSearchDirection.UP,
      searchScope = ChatMessageSearchScope.All,
    } = params;
    chatlog.log(
      `${ChatManager.TAG}: searchMsgFromDB: ${keywords}, ${timestamp}, ${maxCount}, ${from}`
    );
    let r: any = await Native._callMethod(MTsearchChatMsgFromDB, {
      [MTsearchChatMsgFromDB]: {
        keywords: keywords,
        timeStamp: timestamp,
        maxCount: maxCount,
        from: from,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        searchScope: searchScope,
      },
    });
    Native.checkErrorFromResult(r);
    let ret = new Array<ChatMessage>(0);
    const rr: Array<any> = r?.[MTsearchChatMsgFromDB];
    if (rr) {
      rr.forEach((element) => {
        ret.push(new ChatMessage(element));
      });
    }
    return ret;
  }

  /**
   * Uses the pagination to get read receipts for group messages from the server.
   *
   * 发送群组消息已读回执见 {@link {@link #sendConversationReadAck(String)}。
   *
   * @param msgId 消息 ID。
   * @param startAckId 开始的已读回执 ID。如果该参数设置为空字符串或 `null`，从服务器接收已读回执时间的倒序开始获取。
   * @param pageSize 每页期望获取群消息已读回执的条数。
   * @returns 已读回执列表和用于下次查询的 cursor。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchGroupAcks(
    msgId: string,
    groupId: string,
    startAckId: string,
    pageSize: number = 0
  ): Promise<ChatCursorResult<ChatGroupMessageAck>> {
    chatlog.log(
      `${ChatManager.TAG}: asyncFetchGroupAcks: ${msgId}, ${startAckId}, ${pageSize}`
    );
    let r: any = await Native._callMethod(MTasyncFetchGroupAcks, {
      [MTasyncFetchGroupAcks]: {
        msg_id: msgId,
        ack_id: startAckId,
        pageSize: pageSize,
        group_id: groupId,
      },
    });
    Native.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatGroupMessageAck>({
      cursor: r?.[MTasyncFetchGroupAcks].cursor,
      list: r?.[MTasyncFetchGroupAcks].list,
      opt: {
        map: (param: any) => {
          return new ChatGroupMessageAck(param);
        },
      },
    });
    return ret;
  }

  /**
   * 删除服务端的指定会话及其历史消息。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param isDeleteMessage 删除会话时是否同时删除历史消息。
   * - (默认) `true`：是；
   * - `false`: 否。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async removeConversationFromServer(
    convId: string,
    convType: ChatConversationType,
    isDeleteMessage: boolean = true
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: removeConversationFromServer: ${convId}, ${convType}, ${isDeleteMessage}`
    );
    let ct = 0;
    switch (convType) {
      case ChatConversationType.PeerChat:
        ct = 0;
        break;
      case ChatConversationType.GroupChat:
        ct = 1;
        break;
      case ChatConversationType.RoomChat:
        ct = 2;
        break;
      default:
        throw new ChatError({
          code: 1,
          description: `This type is not supported. ` + convType,
        });
    }
    let r = await Native._callMethod(MTdeleteRemoteConversation, {
      [MTdeleteRemoteConversation]: {
        conversationId: convId,
        conversationType: ct,
        isDeleteRemoteMessage: isDeleteMessage,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 根据会话ID和会话类型获取会话。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param createIfNeed 如果没有找到指定的会话，是否创建会话：
   * - （默认）`true`：是。
   * - `假`：否。
   * @param isChatThread 会话是否为子区会话。
   * - （默认）`false`：否。
   * - `true`：是的。
   *
   * @returns 检索到的会话对象。 如果未找到会话，SDK 将返回“null”。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getConversation(
    convId: string,
    convType: ChatConversationType,
    createIfNeed: boolean = true,
    isChatThread: boolean = false
  ): Promise<ChatConversation | undefined> {
    chatlog.log(
      `${ChatManager.TAG}: getConversation: ${convId}, ${convType}, ${createIfNeed}, ${isChatThread}`
    );
    let r: any = await Native._callMethod(MTgetConversation, {
      [MTgetConversation]: {
        convId: convId,
        convType: convType as number,
        createIfNeed: createIfNeed,
        isChatThread: isChatThread,
      },
    });
    Native.checkErrorFromResult(r);
    const rr = r?.[MTgetConversation];
    if (rr) {
      return new ChatConversation(rr);
    }
    return undefined;
  }

  /**
   * 获取本地数据库中所有会话。
   *
   * 该方法会先从内存中获取，如果未找到任何会话，从本地数据库获取。
   *
   * @returns 获取的会话。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getAllConversations(): Promise<Array<ChatConversation>> {
    chatlog.log(`${ChatManager.TAG}: getAllConversations:`);
    let r: any = await Native._callMethod(MTloadAllConversations);
    Native.checkErrorFromResult(r);
    let ret = new Array<ChatConversation>(0);
    const rr: Array<any> = r?.[MTloadAllConversations];
    if (rr) {
      rr.forEach((element) => {
        ret.push(new ChatConversation(element));
      });
    }
    return ret;
  }

  /**
   * 从服务器获取会话列表。
   *
   * @returns 会话列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchAllConversations(): Promise<Array<ChatConversation>> {
    chatlog.log(`${ChatManager.TAG}: fetchAllConversations:`);
    let r: any = await Native._callMethod(MTgetConversationsFromServer);
    Native.checkErrorFromResult(r);
    let ret = new Array<ChatConversation>(0);
    const rr: Array<any> = r?.[MTgetConversationsFromServer];
    if (rr) {
      rr.forEach((element) => {
        ret.push(new ChatConversation(element));
      });
    }
    return ret;
  }

  /**
   * 删除指定会话及其本地历史消息。
   *
   * @param convId 会话 ID。
   * @param withMessage 删除会话时是否同时删除本地的历史消息。
   *                    - （默认）`true`：删除；
   *                    - `false`：不删除。
   * @returns 会话是否删除成功。
   *          - `true`：是；
   *          - `false`： 否。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async deleteConversation(
    convId: string,
    withMessage: boolean = true
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteConversation: ${convId}, ${withMessage}`
    );
    let r: any = await Native._callMethod(MTdeleteConversation, {
      [MTdeleteConversation]: {
        convId: convId,
        deleteMessages: withMessage,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 从会话中获取最新消息。
   *
   * **注意**
   *
   * 该操作不会改变未读消息数。
   * 如果会话对象不存在，此方法将创建它。
   *
   * SDK首先从内存中获取最新消息。 如果没有找到消息，SDK会从本地数据库中加载消息，然后放入内存中。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 消息实例。 如果消息不存在，SDK 将返回 `undefined`。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getLatestMessage(
    convId: string,
    convType: ChatConversationType,
    isChatThread: boolean = false
  ): Promise<ChatMessage | undefined> {
    chatlog.log(
      `${ChatManager.TAG}: latestMessage: `,
      convId,
      convType,
      isChatThread
    );
    let r: any = await Native._callMethod(MTgetLatestMessage, {
      [MTgetLatestMessage]: {
        convId: convId,
        convType: convType,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTgetLatestMessage];
    if (rr) {
      return new ChatMessage(rr);
    }
    return undefined;
  }

  /**
   * 获取最新收到的会话消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 消息实例。 如果消息不存在，SDK 将返回 `undefined`。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getLatestReceivedMessage(
    convId: string,
    convType: ChatConversationType,
    isChatThread: boolean = false
  ): Promise<ChatMessage | undefined> {
    chatlog.log(
      `${ChatManager.TAG}: lastReceivedMessage: `,
      convId,
      convType,
      isChatThread
    );
    let r: any = await Native._callMethod(MTgetLatestMessageFromOthers, {
      [MTgetLatestMessageFromOthers]: {
        convId: convId,
        convType: convType,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTgetLatestMessageFromOthers];
    if (rr) {
      return new ChatMessage(rr);
    }
    return undefined;
  }

  /**
   * 获取会话未读消息数。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 未读消息数。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getConversationUnreadCount(
    convId: string,
    convType: ChatConversationType,
    isChatThread: boolean = false
  ): Promise<number> {
    chatlog.log(
      `${ChatManager.TAG}: getConversationUnreadCount: `,
      convId,
      convType,
      isChatThread
    );
    let r: any = await Native._callMethod(MTgetUnreadMsgCount, {
      [MTgetUnreadMsgCount]: {
        convId: convId,
        convType: convType,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: number = r?.[MTgetUnreadMsgCount] as number;
    return ret;
  }

  /**
   * 获取会话的消息数。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 消息计数。
   *获取消息计数
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getConversationMessageCount(
    convId: string,
    convType: ChatConversationType,
    isChatThread: boolean = false
  ): Promise<number> {
    chatlog.log(
      `${ChatManager.TAG}: getConversationMessageCount: `,
      convId,
      convType,
      isChatThread
    );
    let r: any = await Native._callMethod(MTgetMsgCount, {
      [MTgetMsgCount]: {
        convId: convId,
        convType: convType,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: number = r?.[MTgetMsgCount] as number;
    return ret;
  }

  /**
   * 将消息标记为已读。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @param msgId 消息 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async markMessageAsRead(
    convId: string,
    convType: ChatConversationType,
    msgId: string,
    isChatThread: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: markMessageAsRead: `,
      convId,
      convType,
      msgId,
      isChatThread
    );
    let r: any = await Native._callMethod(MTmarkMessageAsRead, {
      [MTmarkMessageAsRead]: {
        convId: convId,
        convType: convType,
        msg_id: msgId,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 将所有消息标记为已读。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async markAllMessagesAsRead(
    convId: string,
    convType: ChatConversationType,
    isChatThread: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: markAllMessagesAsRead: `,
      convId,
      convType,
      isChatThread
    );
    let r: any = await Native._callMethod(MTmarkAllMessagesAsRead, {
      [MTmarkAllMessagesAsRead]: {
        convId: convId,
        convType: convType,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 更新本地数据库中的消息。
   *
   * 修改消息后，消息 ID 保持不变，SDK 会自动更新会话的属性，如“latestMessage”。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @param msg 要更新的消息的 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async updateConversationMessage(
    convId: string,
    convType: ChatConversationType,
    msg: ChatMessage,
    isChatThread: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: updateConversationMessage: `,
      convId,
      convType,
      msg,
      isChatThread
    );
    let r: any = await Native._callMethod(MTupdateConversationMessage, {
      [MTupdateConversationMessage]: {
        convId: convId,
        convType: convType,
        msg: msg,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 从本地数据库中删除一条消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @param msgId 要删除的消息的 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async deleteMessage(
    convId: string,
    convType: ChatConversationType,
    msgId: string,
    isChatThread: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteMessage: ${convId}, ${convType}, ${msgId}, ${isChatThread}`
    );
    let r: any = await Native._callMethod(MTremoveMessage, {
      [MTremoveMessage]: {
        convId: convId,
        convType: convType,
        msg_id: msgId,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 从本地数据库中删除一段时间内发送或接收的消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @params 参数
   * - startTs：消息删除的起始 UNIX 时间戳。 单位是毫秒。
   * - endTs：消息删除的结束 UNIX 时间戳。 单位是毫秒。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async deleteMessagesWithTimestamp(
    convId: string,
    convType: ChatConversationType,
    params: {
      startTs: number;
      endTs: number;
    },
    isChatThread: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteMessagesWithTimestamp: ${convId}, ${convType}, ${params}, ${isChatThread}`
    );
    let r: any = await Native._callMethod(MTdeleteMessagesWithTs, {
      [MTdeleteMessagesWithTs]: {
        convId: convId,
        convType: convType,
        startTs: params.startTs,
        endTs: params.endTs,
        isChatThread: isChatThread ?? false,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 从内存和本地数据库中删除会话中的所有消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async deleteConversationAllMessages(
    convId: string,
    convType: ChatConversationType,
    isChatThread: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteConversationAllMessages: `,
      convId,
      convType,
      isChatThread
    );
    let r: any = await Native._callMethod(MTclearAllMessages, {
      [MTclearAllMessages]: {
        convId: convId,
        convType: convType,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 删除指定时间戳之前的所有本地消息。
   *
   * @param timestamp 指定的时间戳，单位为毫秒。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async deleteMessagesBeforeTimestamp(timestamp: number): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteMessagesBeforeTimestamp:`,
      timestamp
    );
    let r: any = await Native._callMethod(MTdeleteMessagesBeforeTimestamp, {
      [MTdeleteMessagesBeforeTimestamp]: {
        timestamp: timestamp,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 从本地数据库中检索会话中某种类型的消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param msgType 消息类型。 请参阅{@link ChatMessageType}。
   * @param Direction 消息搜索方向。 请参阅{@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param timestamp 用于查询的消息中的起始 Unix 时间戳。 单位是毫秒。 设置该参数后，SDK按照消息搜索方向，从指定的消息开始检索消息。
   * 如果将此参数设置为负值，则SDK从当前时间开始，按照消息中时间戳的降序顺序检索消息。
   * @param count 每次检索的最大消息数。 取值范围为[1,400]。
   * @param sender 用于检索的用户 ID 或组 ID。 通常，它是会话 ID。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。 如果没有获取到消息，则返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   *
   * @2023 年 7 月 24 日已弃用。 请改用 {@link getMsgsWithMsgType}。
   */
  public async getMessagesWithMsgType(
    convId: string,
    convType: ChatConversationType,
    msgType: ChatMessageType,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string,
    isChatThread: boolean = false
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessagesWithMsgType: `,
      convId,
      convType,
      msgType,
      direction,
      timestamp,
      count,
      sender,
      isChatThread
    );
    let r: any = await Native._callMethod(MTloadMsgWithMsgType, {
      [MTloadMsgWithMsgType]: {
        convId: convId,
        convType: convType,
        msg_type: msgType,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        timestamp: timestamp,
        count: count,
        sender: sender ?? '',
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTloadMsgWithMsgType];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 从本地数据库中检索会话中某种类型的消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @params -
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param msgType 消息类型。 请参阅{@link ChatMessageType}。
   * @param Direction 消息搜索方向。 请参阅{@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param timestamp 用于查询的消息中的起始 Unix 时间戳。 单位是毫秒。 设置该参数后，SDK按照消息搜索方向，从指定的消息开始检索消息。
   * 如果将此参数设置为负值，则SDK从当前时间开始，按照消息中时间戳的降序顺序检索消息。
   * @param count 每次检索的最大消息数。 取值范围为[1,400]。
   * @param sender 用于检索的用户 ID 或组 ID。 通常，它是会话 ID。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。 如果没有获取到消息，则返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getMsgsWithMsgType(params: {
    convId: string;
    convType: ChatConversationType;
    msgType: ChatMessageType;
    direction?: ChatSearchDirection;
    timestamp?: number;
    count?: number;
    sender?: string;
    isChatThread?: boolean;
  }): Promise<Array<ChatMessage>> {
    const {
      convId,
      convType,
      msgType,
      direction = ChatSearchDirection.UP,
      timestamp = -1,
      count = 20,
      sender,
      isChatThread = false,
    } = params;
    chatlog.log(
      `${ChatManager.TAG}: getMsgsWithMsgType: `,
      convId,
      convType,
      msgType,
      direction,
      timestamp,
      count,
      sender,
      isChatThread
    );
    let r: any = await Native._callMethod(MTloadMsgWithMsgType, {
      [MTloadMsgWithMsgType]: {
        convId: convId,
        convType: convType,
        msg_type: msgType,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        timestamp: timestamp,
        count: count,
        sender: sender ?? '',
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTloadMsgWithMsgType];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 从本地数据库中检索会话中指定数量的消息。
   *
   * 检索到的消息也会根据其中包含的时间戳放入内存中的会话中。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param startMsgId 查询的起始消息ID。 设置该参数后，SDK按照消息搜索方向，从指定的消息开始检索消息。
   * 如果该参数设置为空字符串，则SDK按照消息搜索方向检索消息，而忽略该参数。
   * @param Direction 消息搜索方向。 请参阅{@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param loadCount 每次检索的最大消息数。 取值范围为[1,50]。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。 如果没有获取到消息，则返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   *
   * @2023 年 7 月 24 日已弃用。 请改用 {@link getMsgs}。
   */
  public async getMessages(
    convId: string,
    convType: ChatConversationType,
    startMsgId: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    loadCount: number = 20,
    isChatThread: boolean = false
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessages: `,
      convId,
      convType,
      startMsgId,
      direction,
      loadCount,
      isChatThread
    );
    let r: any = await Native._callMethod(MTloadMsgWithStartId, {
      [MTloadMsgWithStartId]: {
        convId: convId,
        convType: convType,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        startId: startMsgId,
        count: loadCount,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTloadMsgWithStartId];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 从本地数据库中检索会话中指定数量的消息。
   *
   * 检索到的消息也会根据其中包含的时间戳放入内存中的会话中。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @params -
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param startMsgId 查询的起始消息ID。 设置该参数后，SDK按照消息搜索方向，从指定的消息开始检索消息。
   * 如果该参数设置为空字符串，则SDK按照消息搜索方向检索消息，而忽略该参数。
   * @param Direction 消息搜索方向。 请参阅{@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param loadCount 每次检索的最大消息数。 取值范围为[1,50]。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。如果没有获取到消息，则返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getMsgs(params: {
    convId: string;
    convType: ChatConversationType;
    startMsgId: string;
    direction?: ChatSearchDirection;
    loadCount?: number;
    isChatThread?: boolean;
  }): Promise<Array<ChatMessage>> {
    const {
      convId,
      convType,
      startMsgId,
      direction = ChatSearchDirection.UP,
      loadCount = 20,
      isChatThread = false,
    } = params;
    chatlog.log(
      `${ChatManager.TAG}: getMsgs: `,
      convId,
      convType,
      startMsgId,
      direction,
      loadCount,
      isChatThread
    );
    let r: any = await Native._callMethod(MTloadMsgWithStartId, {
      [MTloadMsgWithStartId]: {
        convId: convId,
        convType: convType,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        startId: startMsgId,
        count: loadCount,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTloadMsgWithStartId];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 获取指定用户在一定时间内的会话中发送的消息。
   *
   * 该方法从本地数据库获取数据。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。请参阅 {@link ChatConversationType}。
   * @param keywords 查询的关键字。
   * @param Direction 消息搜索方向。请参阅 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param timestamp 用于查询的消息中的起始 Unix 时间戳。单位是毫秒。设置该参数后，SDK 按照消息搜索方向，从指定的消息开始检索消息。
   * 如果将此参数设置为负值，则 SDK 从当前时间开始，按照消息中时间戳的降序顺序检索消息。
   * @param count 每次检索的最大消息数。取值范围为 [1,400]。
   * @param sender 用于检索的用户 ID 或群组 ID。
   * @param isChatThread 会话是否是子区会话。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。如果没有获取到消息，则返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   *
   * @deprecated 2023-07-24 此方法已弃用。 请改用 {@link getMsgsWithKeyword}。
   */
  public async getMessagesWithKeyword(
    convId: string,
    convType: ChatConversationType,
    keywords: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string,
    isChatThread: boolean = false
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessagesWithKeyword: `,
      convId,
      convType,
      keywords,
      direction,
      timestamp,
      count,
      sender,
      isChatThread
    );
    let r: any = await Native._callMethod(MTloadMsgWithKeywords, {
      [MTloadMsgWithKeywords]: {
        convId: convId,
        convType: convType,
        keywords: keywords,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        timestamp: timestamp,
        count: count,
        sender: sender,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTloadMsgWithKeywords];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 获取指定用户在一定时间内的会话中发送的消息。
   *
   * 该方法从本地数据库获取数据。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @params -
   * - convId 会话 ID。
   * - convType 会话类型。请参阅 {@link ChatConversationType}。
   * - keywords 查询的关键字。
   * - direction 消息搜索方向。请参阅 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP` 按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN` 按照消息中包含的 Unix 时间戳的升序检索消息。
   * - timestamp 用于查询的消息中的起始 Unix 时间戳。单位是毫秒。设置该参数后，SDK 按照消息搜索方向，从指定的消息开始检索消息。
   *   如果将此参数设置为负值，则 SDK 从当前时间开始，按照消息中时间戳的降序顺序检索消息。
   * - searchScope 消息搜索范围。请参阅 {@link ChatMessageSearchScope}。
   * - count 每次检索的最大消息数。取值范围为 [1,400]。
   * - sender 用于检索的用户 ID 或群组 ID。
   * - isChatThread 会话是否为子区会话。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。如果没有获取到消息，返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getConvMsgsWithKeyword(params: {
    convId: string;
    convType: ChatConversationType;
    keywords: string;
    direction?: ChatSearchDirection;
    timestamp?: number;
    count?: number;
    sender?: string;
    searchScope?: ChatMessageSearchScope;
    isChatThread?: boolean;
  }): Promise<Array<ChatMessage>> {
    const {
      convId,
      convType,
      keywords,
      direction = ChatSearchDirection.UP,
      timestamp = -1,
      count = 20,
      sender,
      searchScope = ChatMessageSearchScope.All,
      isChatThread = false,
    } = params;
    chatlog.log(
      `${ChatManager.TAG}: getMsgsWithKeyword: `,
      convId,
      convType,
      keywords,
      direction,
      timestamp,
      count,
      searchScope,
      sender,
      isChatThread
    );
    let r: any = await Native._callMethod(MTloadMsgWithKeywords, {
      [MTloadMsgWithKeywords]: {
        convId: convId,
        convType: convType,
        keywords: keywords,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        timestamp: timestamp,
        count: count,
        sender: sender,
        searchScope: searchScope,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTloadMsgWithKeywords];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 检索本地数据库中某个会话在一定时间内发送和接收的消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param startTime 查询的起始 Unix 时间戳，以毫秒为单位。
   * @param endTime 查询的结束 Unix 时间戳，以毫秒为单位。
   * @param Direction 消息搜索方向。 请参阅{@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param count 每次检索的最大消息数。 取值范围为[1,400]。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 检索到的消息列表（不包括具有开始或结束时间戳的消息）。 如果没有获取到消息，则返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   *
   * @deprecated 2023-07-24 此方法已弃用。 请改用 {@link getMsgWithTimestamp}。
   */
  public async getMessageWithTimestamp(
    convId: string,
    convType: ChatConversationType,
    startTime: number,
    endTime: number,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    count: number = 20,
    isChatThread: boolean = false
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessageWithTimestamp: `,
      convId,
      convType,
      startTime,
      endTime,
      direction,
      count,
      isChatThread
    );
    let r: any = await Native._callMethod(MTloadMsgWithTime, {
      [MTloadMsgWithTime]: {
        convId: convId,
        convType: convType,
        startTime: startTime,
        endTime: endTime,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        count: count,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTloadMsgWithTime];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 检索本地数据库中某个会话在一定时间内发送和接收的消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @params -
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param startTime 查询的起始 Unix 时间戳，以毫秒为单位。
   * @param endTime 查询的结束 Unix 时间戳，以毫秒为单位。
   * @param Direction 消息搜索方向。 请参阅{@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param count 每次检索的最大消息数。 取值范围为[1,400]。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 检索到的消息列表（不包括具有开始或结束时间戳的消息）。 如果没有获取到消息，则返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getMsgWithTimestamp(params: {
    convId: string;
    convType: ChatConversationType;
    startTime: number;
    endTime: number;
    direction?: ChatSearchDirection;
    count?: number;
    isChatThread?: boolean;
  }): Promise<Array<ChatMessage>> {
    const {
      convId,
      convType,
      startTime,
      endTime,
      direction = ChatSearchDirection.UP,
      count = 20,
      isChatThread = false,
    } = params;
    chatlog.log(
      `${ChatManager.TAG}: getMsgWithTimestamp: `,
      convId,
      convType,
      startTime,
      endTime,
      direction,
      count,
      isChatThread
    );
    let r: any = await Native._callMethod(MTloadMsgWithTime, {
      [MTloadMsgWithTime]: {
        convId: convId,
        convType: convType,
        startTime: startTime,
        endTime: endTime,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        count: count,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTloadMsgWithTime];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 翻译消息。
   *
   * @param msg 要翻译的文本消息。
   * @param languages 目标语言。
   * @returns 翻译。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async translateMessage(
    msg: ChatMessage,
    languages: Array<string>
  ): Promise<ChatMessage> {
    chatlog.log(`${ChatManager.TAG}: translateMessage: `, msg, languages);
    let r: any = await Native._callMethod(MTtranslateMessage, {
      [MTtranslateMessage]: {
        message: msg,
        languages: languages,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTtranslateMessage];
    return new ChatMessage(rr?.message);
  }

  /**
   * 查询翻译服务支持的语言。
   *
   * @returns 翻译服务支持的语言列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchSupportedLanguages(): Promise<
    Array<ChatTranslateLanguage>
  > {
    chatlog.log(`${ChatManager.TAG}: fetchSupportedLanguages: `);
    let r: any = await Native._callMethod(MTfetchSupportLanguages);
    ChatManager.checkErrorFromResult(r);
    const ret: Array<ChatTranslateLanguage> = [];
    const rr: Array<any> = r?.[MTfetchSupportLanguages];
    if (rr) {
      rr.forEach((value: any) => {
        ret.push(new ChatTranslateLanguage(value));
      });
    }
    return ret;
  }

  /**
   * 设置会话的扩展信息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。 请参阅{@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @param ext 扩展信息。 该参数必须是key-value类型。
   */
  public async setConversationExtension(
    convId: string,
    convType: ChatConversationType,
    ext: {
      [key: string]: string | number | boolean;
    },
    isChatThread: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: setConversationExtension: `,
      convId,
      convType,
      ext,
      isChatThread
    );
    let r: any = await Native._callMethod(MTsyncConversationExt, {
      [MTsyncConversationExt]: {
        convId: convId,
        convType: convType,
        ext: ext,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 添加 Reaction。
   *
   * @param reaction Reaction 的内容。
   * @param msgId 要添加 Reaction 的消息 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async addReaction(reaction: string, msgId: string): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: addReaction: `, reaction, msgId);
    let r: any = await Native._callMethod(MTaddReaction, {
      [MTaddReaction]: {
        reaction,
        msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 删除 Reaction。
   *
   * @param reaction 要删除的 Reaction。
   * @param msgId 添加了该 Reaction 的消息 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async removeReaction(reaction: string, msgId: string): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: removeReaction: `, reaction, msgId);
    let r: any = await Native._callMethod(MTremoveReaction, {
      [MTremoveReaction]: {
        reaction,
        msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 获取 Reaction 列表。
   *
   * @param msgIds 消息 ID 列表。
   * @param groupId 群组 ID，该参数仅在会话类型为群聊时有效。
   * @param chatType 会话类型。
   * @returns 若调用成功，返回 Reaction 列表；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchReactionList(
    msgIds: Array<string>,
    groupId: string,
    chatType: ChatMessageChatType
  ): Promise<Map<string, Array<ChatMessageReaction>>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchReactionList: `,
      msgIds,
      groupId,
      chatType
    );
    let r: any = await Native._callMethod(MTfetchReactionList, {
      [MTfetchReactionList]: {
        msgIds,
        groupId,
        chatType,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: Map<string, Array<ChatMessageReaction>> = new Map();
    Object.entries(r?.[MTfetchReactionList]).forEach((v: [string, any]) => {
      const list: Array<ChatMessageReaction> = [];
      Object.entries(v[1]).forEach((vv: [string, any]) => {
        list.push(new ChatMessageReaction(vv[1]));
      });
      ret.set(v[0], list);
    });
    return ret;
  }

  /**
   * 获取 Reaction 详情。
   *
   * @param msgId 消息 ID。
   * @param reaction Reaction 内容。
   * @param cursor 开始获取 Reaction 的游标位置。
   * @param pageSize 每页期望返回的 Reaction 数量。
   * @returns 若调用成功，返回 Reaction 详情。若返回 `null`，则所有数据均获取。
   *          若调用失败，则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchReactionDetail(
    msgId: string,
    reaction: string,
    cursor?: string,
    pageSize?: number
  ): Promise<ChatCursorResult<ChatMessageReaction>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchReactionDetail: `,
      msgId,
      reaction,
      cursor,
      pageSize
    );
    let r: any = await Native._callMethod(MTfetchReactionDetail, {
      [MTfetchReactionDetail]: {
        msgId,
        reaction,
        cursor,
        pageSize,
      },
    });
    ChatManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatMessageReaction>({
      cursor: r?.[MTfetchReactionDetail].cursor,
      list: r?.[MTfetchReactionDetail].list,
      opt: {
        map: (param: any) => {
          return new ChatMessageReaction(param);
        },
      },
    });
    return ret;
  }

  /**
   * 举报消息。
   *
   * @param msgId 要举报的消息 ID。
   * @param tag 非法消息的标签。你需要填写自定义标签，例如`涉政`或`广告`。
   * @param reason 举报原因。你需要自行填写举报原因。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async reportMessage(
    msgId: string,
    tag: string,
    reason: string
  ): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: reportMessage: `, msgId, tag, reason);
    let r: any = await Native._callMethod(MTreportMessage, {
      [MTreportMessage]: {
        msgId,
        tag,
        reason,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 获取指定消息的 Reaction 列表。
   *
   * @param msgId 消息 ID。
   * @returns 若调用成功，则返回 Reaction 列表；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getReactionList(
    msgId: string
  ): Promise<Array<ChatMessageReaction>> {
    chatlog.log(`${ChatManager.TAG}: getReactionList: `, msgId);
    let r: any = await Native._callMethod(MTgetReactionList, {
      [MTgetReactionList]: {
        msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: Array<ChatMessageReaction> = [];
    if (r?.[MTgetReactionList]) {
      Object.entries(r?.[MTgetReactionList]).forEach((value: [string, any]) => {
        ret.push(new ChatMessageReaction(value[1]));
      });
    }
    return ret;
  }

  /**
   * 获取群组消息的已读人数。
   *
   * @param msgId 消息 ID。
   * @returns 若调用成功，返回群组消息的已读人数；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async groupAckCount(msgId: string): Promise<number | undefined> {
    chatlog.log(`${ChatManager.TAG}: groupAckCount: `, msgId);
    let r: any = await Native._callMethod(MTgroupAckCount, {
      [MTgroupAckCount]: {
        msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    if (r?.[MTgroupAckCount] !== undefined) {
      return r?.[MTgroupAckCount] as number;
    }
    return undefined;
  }

  /**
   * 创建子区。
   *
   * 子区所属群组的所有成员均可调用该方法。
   *
   * 子区创建成功后，会出现如下情况：
   *
   *  - 单设备登录时，子区所属群组的所有成员均会收到 {@link ChatMessageEventListener#onChatMessageThreadCreated} 回调。
   *   你可通过设置 {@link ChatMessageEventListener} 监听相关事件。
   *
   *  - 多端多设备登录时，各设备会收到 {@link ChatMultiDeviceEventListener#onThreadEvent} 回调。
   *   你可通过设置 {@link ChatMultiDeviceEventListener} 监听相关事件。
   *
   * @param name 要创建的子区的名称。长度不超过 64 个字符。
   * @param msgId 父消息 ID。
   * @param parentId 父 ID，即群组 ID。
   * @returns 调用成功时，返回创建的子区对象；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async createChatThread(
    name: string,
    msgId: string,
    parentId: string
  ): Promise<ChatMessageThread> {
    chatlog.log(
      `${ChatManager.TAG}: createChatThread: `,
      name,
      msgId,
      parentId
    );
    let r: any = await Native._callMethod(MTcreateChatThread, {
      [MTcreateChatThread]: {
        name: name,
        messageId: msgId,
        parentId: parentId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    return new ChatMessageThread(r?.[MTcreateChatThread]);
  }

  /**
   * 加入子区。
   *
   * 子区所属群组的所有成员均可调用该方法。
   *
   * 多端多设备登录时，注意以下几点：
   *
   * - 设备会收到 {@link ChatMultiDeviceEventListener.onThreadEvent} 回调。
   *
   * - 可通过设置 {@link ChatMultiDeviceEventListener} 监听相关事件。
   *
   * @param chatThreadId 子区 ID。
   * @returns 若调用成功，返回子区详情 {@link ChatMessageThread}；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async joinChatThread(
    chatThreadId: string
  ): Promise<ChatMessageThread> {
    chatlog.log(`${ChatManager.TAG}: joinChatThread: `, chatThreadId);
    let r: any = await Native._callMethod(MTjoinChatThread, {
      [MTjoinChatThread]: {
        threadId: chatThreadId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    return new ChatMessageThread(r?.[MTjoinChatThread]);
  }

  /**
   * 退出子区。
   *
   * 子区中的所有成员均可调用该方法。
   *
   * 多设备登录情况下，注意以下几点：
   *
   * - 各设备会收到 {@link ChatMultiDeviceEventListener.onThreadEvent} 回调。
   *
   * - 你可通过设置 {@link ChatMultiDeviceEventListener} 监听相关事件。
   *
   * @param chatThreadId 要退出的子区的 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async leaveChatThread(chatThreadId: string): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: leaveChatThread: `, chatThreadId);
    let r: any = await Native._callMethod(MTleaveChatThread, {
      [MTleaveChatThread]: {
        threadId: chatThreadId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 解散子区。
   *
   * 只有子区所属群组的群主及管理员可调用该方法。
   *
   * **注意**
   *
   * - 单设备登录时，子区所属群组的所有成员均会收到 {@link ChatMessageEventListener.onChatMessageThreadDestroyed} 回调。
   *   你可通过设置 {@link ChatMessageEventListener} 监听子区事件。
   *
   * - 多端多设备登录时，设备会收到 {@link ChatMultiDeviceEventListener.onThreadEvent} 回调。
   *   你可通过设置 {@link ChatMultiDeviceEventListener} 监听子区事件。
   *
   * @param chatThreadId 子区 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async destroyChatThread(chatThreadId: string): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: destroyChatThread: `, chatThreadId);
    let r: any = await Native._callMethod(MTdestroyChatThread, {
      [MTdestroyChatThread]: {
        threadId: chatThreadId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 修改子区名称。
   *
   * 只有子区所属群主、群管理员及子区创建者可调用该方法。
   *
   * 子区所属群组的成员会收到 {@link ChatMessageEventListener.onChatMessageThreadUpdated} 回调。
   *
   * 你可通过设置 {@link ChatMessageEventListener} 监听子区事件。
   *
   * @param chatThreadId  子区 ID。
   * @param newName 子区的新名称。长度不超过 64 个字符。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async updateChatThreadName(
    chatThreadId: string,
    newName: string
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: updateChatThreadName: `,
      chatThreadId,
      newName
    );
    let r: any = await Native._callMethod(MTupdateChatThreadSubject, {
      [MTupdateChatThreadSubject]: {
        threadId: chatThreadId,
        name: newName,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 移除子区成员。
   *
   * 只有子区所属群主、群管理员及子区创建者可调用该方法。
   *
   * 被移出的成员会收到 {@link ChatMessageEventListener.onChatMessageThreadUserRemoved} 回调。
   *
   * 你可通过设置 {@link ChatMessageEventListener} 监听子区事件。
   *
   * @param chatThreadId 子区 ID。
   * @param memberId 被移出子区的成员的用户 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async removeMemberWithChatThread(
    chatThreadId: string,
    memberId: string
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: removeMemberWithChatThread: `,
      chatThreadId,
      memberId
    );
    let r: any = await Native._callMethod(MTremoveMemberFromChatThread, {
      [MTremoveMemberFromChatThread]: {
        threadId: chatThreadId,
        memberId: memberId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 分页获取子区成员。
   *
   * 子区所属群组的所有成员均可调用该方法。
   *
   * @param chatThreadId 子区 ID。
   * @param cursor 开始获取数据的游标位置，首次调用方法时传 `null` 或空字符串，按成员加入子区时间的正序获取数据。
   * @param pageSize 每页期望返回的成员数。取值范围为 [1,400]。
   * @returns 若调用成功，返回子区成员列表；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchMembersWithChatThreadFromServer(
    chatThreadId: string,
    cursor: string = '',
    pageSize: number = 20
  ): Promise<ChatCursorResult<string>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchMembersWithChatThreadFromServer: `,
      chatThreadId,
      cursor,
      pageSize
    );
    let r: any = await Native._callMethod(MTfetchChatThreadMember, {
      [MTfetchChatThreadMember]: {
        threadId: chatThreadId,
        cursor: cursor,
        pageSize: pageSize,
      },
    });
    ChatManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<string>({
      cursor: r?.[MTfetchChatThreadMember].cursor,
      list: r?.[MTfetchChatThreadMember].list,
      opt: {
        map: (param: any) => {
          return param;
        },
      },
    });
    return ret;
  }

  /**
   * 分页从服务器获取当前用户加入的子区列表。
   *
   * @param cursor 开始获取数据的游标位置。首次调用方法时传 `null` 或空字符串，按用户加入子区时间的倒序获取数据。
   * @param pageSize 每页期望返回的子区数。取值范围为 [1,400]。
   * @returns 若调用成功，返回子区列表；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchJoinedChatThreadFromServer(
    cursor: string = '',
    pageSize: number = 20
  ): Promise<ChatCursorResult<ChatMessageThread>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchJoinedChatThreadFromServer: `,
      cursor,
      pageSize
    );
    let r: any = await Native._callMethod(MTfetchJoinedChatThreads, {
      [MTfetchJoinedChatThreads]: {
        cursor: cursor,
        pageSize: pageSize,
      },
    });
    ChatManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatMessageThread>({
      cursor: r?.[MTfetchJoinedChatThreads].cursor,
      list: r?.[MTfetchJoinedChatThreads].list,
      opt: {
        map: (param: any) => {
          return new ChatMessageThread(param);
        },
      },
    });
    return ret;
  }

  /**
   * 分页从服务器获取当前用户加入指定群组的子区列表。
   *
   * @param parentId 父 ID，即群组 ID。
   * @param cursor 开始取数据的游标位置。首次调用方法时传 `null` 或空字符串，按用户加入子区时间的倒序获取数据。
   * @param pageSize 每页期望返回的子区数。取值范围为 [1,400]。
   * @returns 若调用成功，返回子区列表；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchJoinedChatThreadWithParentFromServer(
    parentId: string,
    cursor: string = '',
    pageSize: number = 20
  ): Promise<ChatCursorResult<ChatMessageThread>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchJoinedChatThreadWithParentFromServer: `,
      parentId,
      cursor,
      pageSize
    );
    let r: any = await Native._callMethod(
      MTfetchJoinedChatThreadsWithParentId,
      {
        [MTfetchJoinedChatThreadsWithParentId]: {
          parentId: parentId,
          cursor: cursor,
          pageSize: pageSize,
        },
      }
    );
    ChatManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatMessageThread>({
      cursor: r?.[MTfetchJoinedChatThreadsWithParentId].cursor,
      list: r?.[MTfetchJoinedChatThreadsWithParentId].list,
      opt: {
        map: (param: any) => {
          return new ChatMessageThread(param);
        },
      },
    });
    return ret;
  }

  /**
   * 分页从服务器端获取指定群组的子区列表。
   *
   * @param parentId 父 ID，即群组 ID。
   * @param cursor 开始取数据的游标位置。首次获取数据时传 `null` 或空字符串，按子区创建时间的倒序获取数据。
   * @param pageSize 每页期望返回的子区数。取值范围为 [1,400]。
   * @returns 若调用成功，返回子区列表；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchChatThreadWithParentFromServer(
    parentId: string,
    cursor: string = '',
    pageSize: number = 20
  ): Promise<ChatCursorResult<ChatMessageThread>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchChatThreadWithParentFromServer: `,
      parentId,
      cursor,
      pageSize
    );
    let r: any = await Native._callMethod(MTfetchChatThreadsWithParentId, {
      [MTfetchChatThreadsWithParentId]: {
        parentId: parentId,
        cursor: cursor,
        pageSize: pageSize,
      },
    });
    ChatManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatMessageThread>({
      cursor: r?.[MTfetchChatThreadsWithParentId].cursor,
      list: r?.[MTfetchChatThreadsWithParentId].list,
      opt: {
        map: (param: any) => {
          return new ChatMessageThread(param);
        },
      },
    });
    return ret;
  }

  /**
   * 从服务器批量获取指定子区中的最新一条消息。
   *
   * @param chatThreadIds 要查询的子区 ID 列表，每次最多可传 20 个子区。
   * @returns 若调用成功，返回子区的最新一条消息列表；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchLastMessageWithChatThread(
    chatThreadIds: Array<string>
  ): Promise<Map<string, ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchLastMessageWithChatThread: `,
      chatThreadIds
    );
    let r: any = await Native._callMethod(MTfetchLastMessageWithChatThreads, {
      [MTfetchLastMessageWithChatThreads]: {
        threadIds: chatThreadIds,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: Map<string, ChatMessage> = new Map();
    Object.entries(r?.[MTfetchLastMessageWithChatThreads]).forEach(
      (v: [string, any]) => {
        ret.set(v[0], new ChatMessage(v[1]));
      }
    );
    return ret;
  }

  /**
   * 从服务器获取子区详情。
   *
   * @param chatThreadId 子区 ID。
   * @returns 若调用成功，返回子区详情；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchChatThreadFromServer(
    chatThreadId: string
  ): Promise<ChatMessageThread | undefined> {
    chatlog.log(
      `${ChatManager.TAG}: fetchChatThreadFromServer: `,
      chatThreadId
    );
    let r: any = await Native._callMethod(MTfetchChatThreadDetail, {
      [MTfetchChatThreadDetail]: {
        threadId: chatThreadId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTfetchChatThreadDetail];
    if (rr) {
      return new ChatMessageThread(rr);
    }
    return undefined;
  }

  /**
   * 获取本地子区详情。
   *
   * @param msgId 子区 ID。
   * @returns 若调用成功，返回子区详情；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getMessageThread(
    msgId: string
  ): Promise<ChatMessageThread | undefined> {
    chatlog.log(`${ChatManager.TAG}: getMessageThread: `, msgId);
    let r: any = await Native._callMethod(MTgetMessageThread, {
      [MTgetMessageThread]: {
        msgId: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTgetMessageThread];
    if (rr) {
      return new ChatMessageThread(rr);
    }
    return undefined;
  }

  /**
   * 根据指定会话 ID 获取本地子区会话对象。
   *
   * @param convId 会话 ID。
   * @param createIfNeed 未找到会话时是否自动创建该会话：
   * - (默认) `true`: 是；
   * - `false`: 否。
   *
   * @returns 子区会话实例。如果未找到会话，SDK 返回空值。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getThreadConversation(
    convId: string,
    createIfNeed: boolean = true
  ): Promise<ChatConversation | undefined> {
    chatlog.log(
      `${ChatManager.TAG}: getThreadConversation: `,
      convId,
      createIfNeed
    );
    let r: any = await Native._callMethod(MTgetThreadConversation, {
      [MTgetThreadConversation]: {
        convId: convId,
        createIfNeed: createIfNeed,
      },
    });
    Native.checkErrorFromResult(r);
    const rr = r?.[MTgetThreadConversation];
    if (rr) {
      return new ChatConversation(rr);
    }
    return undefined;
  }

  /**
   * 从服务器分页获取会话列表。
   *
   * @param pageSize 当前页码，从 1 开始。
   * @param pageNum 每页获取的会话数量，取值范围为 [1,20]。
   * @returns 当前用户的会话列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchConversationsFromServerWithPage(
    pageSize: number,
    pageNum: number
  ): Promise<Array<ChatConversation>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchConversationsFromServerWithPage: `,
      pageSize,
      pageNum
    );
    let r: any = await Native._callMethod(
      MTfetchConversationsFromServerWithPage,
      {
        [MTfetchConversationsFromServerWithPage]: {
          pageSize: pageSize,
          pageNum: pageNum,
        },
      }
    );
    Native.checkErrorFromResult(r);
    let ret = [] as ChatConversation[];
    const rr: Array<any> = r?.[MTfetchConversationsFromServerWithPage];
    if (rr) {
      rr.forEach((element) => {
        ret.push(new ChatConversation(element));
      });
    }
    return ret;
  }

  /**
   * 从会话中删除消息（从本地存储和服务器）。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。
   * @param isChatThread 会话是否为子区会话。
   *
   * @param msgIds 要从当前会话中删除的消息的 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async removeMessagesFromServerWithMsgIds(
    convId: string,
    convType: ChatConversationType,
    msgIds: string[],
    isChatThread: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: removeMessagesFromServerWithMsgIds: `,
      convId,
      convType,
      msgIds,
      isChatThread
    );
    if (msgIds.length === 0) {
      // todo: temp fix native
      console.log(
        `${ChatManager.TAG}: removeMessagesFromServerWithMsgIds: msgIds count is 0`
      );
      throw new ChatError({ code: 1, description: 'msgIds count is 0' });
    }
    if ((await ChatClient.getInstance().isLoginBefore()) === false) {
      // todo: temp fix native
      console.log(
        `${ChatManager.TAG}: removeMessagesFromServerWithMsgIds: not logged in yet.`
      );
      throw new ChatError({ code: 1, description: 'not logged in yet' });
    }
    let r: any = await Native._callMethod(
      MTremoveMessagesFromServerWithMsgIds,
      {
        [MTremoveMessagesFromServerWithMsgIds]: {
          convId: convId,
          convType: convType,
          msgIds: msgIds,
          isChatThread: isChatThread,
        },
      }
    );
    Native.checkErrorFromResult(r);
  }

  /**
   * 从会话中删除消息（从本地存储和服务器）。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。
   * @param isChatThread 会话是否为子区会话。
   *
   * @param timestamp 消息时间戳（以毫秒为单位）。时间戳小于指定时间戳的消息将被删除。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async removeMessagesFromServerWithTimestamp(
    convId: string,
    convType: ChatConversationType,
    timestamp: number,
    isChatThread: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: removeMessagesFromServerWithTimestamp: `,
      convId,
      convType,
      timestamp,
      isChatThread
    );
    if (timestamp <= 0) {
      // todo: temp fix native
      console.log(
        `${ChatManager.TAG}: removeMessagesFromServerWithTimestamp: timestamp <= 0`
      );
      throw new ChatError({ code: 1, description: 'timestamp <= 0' });
    }
    if ((await ChatClient.getInstance().isLoginBefore()) === false) {
      // todo: temp fix native
      console.log(
        `${ChatManager.TAG}: removeMessagesFromServerWithTimestamp: not logged in yet.`
      );
      throw new ChatError({ code: 1, description: 'not logged in yet' });
    }
    let r: any = await Native._callMethod(MTremoveMessagesFromServerWithTs, {
      [MTremoveMessagesFromServerWithTs]: {
        convId: convId,
        convType: convType,
        timestamp: timestamp,
        isChatThread: isChatThread,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 分页从服务器获取会话列表。
   *
   * SDK 按照会话活跃时间（会话的最后一条消息的时间戳）倒序返回会话列表。
   *
   * 若会话中没有消息，则 SDK 按照会话创建时间的倒序返回会话列表。
   *
   * @param cursor: 查询数据起始位置。如果为空字符串或者 `undefined`，SDK 从最新活跃的会话开始获取。
   *
   * @param pageSize: 每页期望返回的会话数量。取值范围为 [1,50]。
   *
   * @returns 会话列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchConversationsFromServerWithCursor(
    cursor?: string,
    pageSize?: number
  ): Promise<ChatCursorResult<ChatConversation>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchConversationsFromServerWithCursor: ${cursor}, ${pageSize}`
    );
    let r: any = await Native._callMethod(
      MTgetConversationsFromServerWithCursor,
      {
        [MTgetConversationsFromServerWithCursor]: {
          cursor: cursor ?? '',
          pageSize: pageSize ?? 20,
        },
      }
    );
    Native.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatConversation>({
      cursor: r?.[MTgetConversationsFromServerWithCursor].cursor,
      list: r?.[MTgetConversationsFromServerWithCursor].list,
      opt: {
        map: (param: any) => {
          return new ChatConversation(param);
        },
      },
    });
    return ret;
  }

  /**
   * 分页从服务器获取置顶会话。
   *
   * SDK 按照会话置顶时间倒序返回。
   *
   * @param cursor: 查询数据起始位置。如果为空字符串或者 `undefined`，SDK 从最新置顶的会话开始查询。
   * @param pageSize: 请求最大会话数量。范围 [1，50]。
   *
   * @returns 置顶的会话列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchPinnedConversationsFromServerWithCursor(
    cursor?: string,
    pageSize?: number
  ): Promise<ChatCursorResult<ChatConversation>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchPinnedConversationsFromServerWithCursor: ${cursor}, ${pageSize}`
    );
    let r: any = await Native._callMethod(
      MTgetPinnedConversationsFromServerWithCursor,
      {
        [MTgetPinnedConversationsFromServerWithCursor]: {
          cursor: cursor ?? '',
          pageSize: pageSize ?? 20,
        },
      }
    );
    Native.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatConversation>({
      cursor: r?.[MTgetPinnedConversationsFromServerWithCursor].cursor,
      list: r?.[MTgetPinnedConversationsFromServerWithCursor].list,
      opt: {
        map: (param: any) => {
          return new ChatConversation(param);
        },
      },
    });
    return ret;
  }

  /**
   * 设置会话是否置顶。
   *
   * @param convId 会话 ID.
   * @param isPinned 是否置顶会话。
   *  - `true`：置顶；
   * 	- `false`: 取消置顶。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async pinConversation(
    convId: string,
    isPinned: boolean
  ): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: pinConversation: ${convId}, ${isPinned}`);
    let r: any = await Native._callMethod(MTpinConversation, {
      [MTpinConversation]: {
        convId,
        isPinned,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 修改文本消息。
   *
   * 调用该方法修改消息内容后，本地和服务端的消息均会修改。
   *
   * 调用该方法只能修改单聊和群聊中的文本消息，不能修改聊天室消息。
   *
   * @param msgId 修改消息 ID。
   * @param body 文本消息 body。详见 {@link ChatTextMessageBody}。
   *
   * @returns 修改后的消息。 详见 {@link ChatMessageBody}。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async modifyMessageBody(
    msgId: string,
    body: ChatMessageBody
  ): Promise<ChatMessage> {
    chatlog.log(
      `${ChatManager.TAG}: modifyMessageBody: ${msgId}, ${body.type}`
    );
    if (body.type !== ChatMessageType.TXT) {
      throw new ChatError({
        code: 1,
        description:
          'Currently only text message content modification is supported.',
      });
    }
    let r: any = await Native._callMethod(MTmodifyMessage, {
      [MTmodifyMessage]: {
        msgId,
        body,
      },
    });
    Native.checkErrorFromResult(r);
    const rr = r?.[MTmodifyMessage];
    return new ChatMessage(rr);
  }

  /**
   * 获取合并类型消息中的原始消息列表。
   *
   * 合并消息包含 1 条或者多条其它类型消息。
   *
   * @param message 合并类型的消息。
   *
   * @returns 消息 body 里面的原始消息列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchCombineMessageDetail(
    message: ChatMessage
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchCombineMessageDetail: ${message.body.type}`
    );
    if (message.body.type !== ChatMessageType.COMBINE) {
      throw new ChatError({
        code: 1,
        description: 'Please select a combine type message.',
      });
    }
    let r: any = await Native._callMethod(MTdownloadAndParseCombineMessage, {
      [MTdownloadAndParseCombineMessage]: {
        message,
      },
    });
    Native.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTdownloadAndParseCombineMessage];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 标记会话。
   *
   * 调用该方法会同时为本地和服务器端的会话添加标记。
   *
   * @param convIds 会话 ID 列表。
   * @param mark 要添加的会话标记。请参阅{@link ChatConversationMarkType}。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async addRemoteAndLocalConversationsMark(
    convIds: string[],
    mark: ChatConversationMarkType
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: addRemoteAndLocalConversationsMark: ${convIds}, ${mark}`
    );
    let r: any = await Native._callMethod(
      MTaddRemoteAndLocalConversationsMark,
      {
        [MTaddRemoteAndLocalConversationsMark]: {
          convIds,
          mark,
        },
      }
    );
    Native.checkErrorFromResult(r);
  }

  /**
   *  取消标记会话。
   *
   *  调用该方法会同时为本地和服务器端的会话添加标记。
   *
   * @param convIds 会话 ID 列表。
   * @param mark 要移除的会话标记。请参阅 {@link ChatConversationMarkType}。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async deleteRemoteAndLocalConversationsMark(
    convIds: string[],
    mark: ChatConversationMarkType
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteRemoteAndLocalConversationsMark: ${convIds}, ${mark}`
    );
    let r: any = await Native._callMethod(
      MTdeleteRemoteAndLocalConversationsMark,
      {
        [MTdeleteRemoteAndLocalConversationsMark]: {
          convIds,
          mark,
        },
      }
    );
    Native.checkErrorFromResult(r);
  }

  /**
   * 按会话过滤选项从服务端获取会话。
   *
   * @param option 会话过滤选项。请参阅 {@link ChatConversationFetchOptions}。
   *
   * @returns 获取的会话列表。请参阅 {@link ChatCursorResult}。
   */
  public async fetchConversationsByOptions(
    option: ChatConversationFetchOptions
  ): Promise<ChatCursorResult<ChatConversation>> {
    chatlog.log(`${ChatManager.TAG}: fetchConversationsByOptions: ${option}`);
    let r: any = await Native._callMethod(MTfetchConversationsByOptions, {
      [MTfetchConversationsByOptions]: {
        ...option,
      },
    });
    Native.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatConversation>({
      cursor: r?.[MTfetchConversationsByOptions].cursor,
      list: r?.[MTfetchConversationsByOptions].list,
      opt: {
        map: (param: any) => {
          return new ChatConversation(param);
        },
      },
    });
    return ret;
  }

  /**
   * 清空所有会话及其消息。
   *
   * @param clearServerData 是否删除服务端所有会话及其消息：
   *                       - true：是。服务端的所有会话及其消息会被清除，当前用户无法再从服务端拉取消息和会话，其他用户不受影响。
   *                       - （默认）false：否。只清除本地所有会话及其消息，服务端的会话及其消息仍保留。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async deleteAllMessageAndConversation(
    clearServerData: boolean = false
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteAllMessageAndConversation: ${clearServerData}`
    );
    let r: any = await Native._callMethod(MTdeleteAllMessageAndConversation, {
      [MTdeleteAllMessageAndConversation]: {
        clearServerData: clearServerData,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 置顶消息。
   *
   * @param messageId 消息 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async pinMessage(messageId: string): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: pinMessage: ${messageId}`);
    let r: any = await Native._callMethod(MTpinMessage, {
      [MTpinMessage]: {
        msgId: messageId,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 取消置顶消息。
   *
   * @param messageId 消息 ID。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async unpinMessage(messageId: string): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: pinMessage: ${messageId}`);
    let r: any = await Native._callMethod(MTunpinMessage, {
      [MTunpinMessage]: {
        msgId: messageId,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * 从服务端获取指定会话中的置顶消息。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。请参阅 {@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 置顶消息列表。如果没有获取到消息，则返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async fetchPinnedMessages(
    convId: string,
    convType: ChatConversationType,
    isChatThread: boolean = false
  ): Promise<ChatMessage[]> {
    chatlog.log(
      `${ChatManager.TAG}: fetchPinnedMessages:`,
      convId,
      convType,
      isChatThread
    );
    let r: any = await Native._callMethod(MTfetchPinnedMessages, {
      [MTfetchPinnedMessages]: {
        convId: convId,
        convType: convType,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTfetchPinnedMessages] as [];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 从本地获取指定会话中的置顶消息。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型。请参阅 {@link ChatConversationType}。
   * @param isChatThread 会话是否为子区会话。
   *
   * @returns 置顶消息列表。如果没有获取到消息，则返回空列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getPinnedMessages(
    convId: string,
    convType: ChatConversationType,
    isChatThread: boolean = false
  ): Promise<ChatMessage[]> {
    chatlog.log(
      `${ChatManager.TAG}: getPinnedMessages:`,
      convId,
      convType,
      isChatThread
    );
    let r: any = await Native._callMethod(MTpinnedMessages, {
      [MTpinnedMessages]: {
        convId: convId,
        convType: convType,
        isChatThread: isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage[] = [];
    const rr = r?.[MTpinnedMessages] as [];
    if (rr) {
      Object.entries(rr).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * 获取单条消息的置顶详情。
   *
   * @param messageId 消息 ID。
   * @returns 消息的置顶详情。若消息不存在或为非置顶状态，返回 `undefined`。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async getMessagePinInfo(
    messageId: string
  ): Promise<ChatMessagePinInfo | undefined> {
    chatlog.log(`${ChatManager.TAG}: getMessagePinInfo:`, messageId);
    let r: any = await Native._callMethod(MTgetPinInfo, {
      [MTgetPinInfo]: {
        msgId: messageId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    if (r?.[MTgetPinInfo]) {
      return new ChatMessagePinInfo(r[MTgetPinInfo]);
    }
    return undefined;
  }
}
