import type { NativeEventEmitter } from 'react-native';

import { BaseManager } from './__internal__/Base';
import {
  MTackConversationRead,
  MTackGroupMessageRead,
  MTackMessageRead,
  MTaddReaction,
  MTasyncFetchGroupAcks,
  MTclearAllMessages,
  MTcreateChatThread,
  MTdeleteConversation,
  MTdeleteMessagesBeforeTimestamp,
  MTdeleteMessagesWithTs,
  MTdeleteRemoteConversation,
  MTdestroyChatThread,
  MTdownloadAndParseCombineMessage,
  MTdownloadAttachment,
  MTdownloadThumbnail,
  MTfetchChatThreadDetail,
  MTfetchChatThreadMember,
  MTfetchChatThreadsWithParentId,
  MTfetchConversationsFromServerWithPage,
  MTfetchHistoryMessages,
  MTfetchHistoryMessagesByOptions,
  MTfetchJoinedChatThreads,
  MTfetchJoinedChatThreadsWithParentId,
  MTfetchLastMessageWithChatThreads,
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
  MTonMessagesDelivered,
  MTonMessagesRead,
  MTonMessagesRecalled,
  MTonMessagesReceived,
  MTonReadAckForGroupMessageUpdated,
  MTpinConversation,
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
  }

  private onMessagesReceived(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesReceived: `, messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let list: Array<ChatMessage> = [];
      messages.forEach((message: any) => {
        let m = ChatMessage.createReceiveMessage(message);
        list.push(m);
      });
      listener.onMessagesReceived?.(list);
    });
  }
  private onCmdMessagesReceived(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onCmdMessagesReceived: `, messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let list: Array<ChatMessage> = [];
      messages.forEach((message: any) => {
        let m = ChatMessage.createReceiveMessage(message);
        list.push(m);
      });
      listener.onCmdMessagesReceived?.(list);
    });
  }
  private onMessagesRead(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesRead: `, messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let list: Array<ChatMessage> = [];
      messages.forEach((message: any) => {
        let m = ChatMessage.createReceiveMessage(message);
        list.push(m);
      });
      listener.onMessagesRead?.(list);
    });
  }
  private onGroupMessageRead(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onGroupMessageRead: `, messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let list: Array<ChatGroupMessageAck> = [];
      messages.forEach((message: any) => {
        let m = new ChatGroupMessageAck(message);
        list.push(m);
      });
      listener.onGroupMessageRead?.(messages);
    });
  }
  private onMessagesDelivered(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesDelivered: `, messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let list: Array<ChatMessage> = [];
      messages.forEach((message: any) => {
        let m = ChatMessage.createReceiveMessage(message);
        list.push(m);
      });
      listener.onMessagesDelivered?.(list);
    });
  }
  private onMessagesRecalled(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesRecalled: `, messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let list: Array<ChatMessage> = [];
      messages.forEach((message: any) => {
        let m = ChatMessage.createReceiveMessage(message);
        list.push(m);
      });
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
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
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
   * 下载消息的附件。
   *
   * 若附件自动下载失败，也可以调用此方法下载。
   *
   * @param message 要下载附件的消息。
   * @param callback 消息状态变化监听器。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 从服务器分页获取群组消息已读回执详情。
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
   * 根据会话 ID 和会话类型获取会话。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param createIfNeed 未找到指定会话时是否创建一个新会话。
   * - （默认）`true`：是。
   * - `false`：否。
   *
   * @returns 会话。未找到时返回空值。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getConversation(
    convId: string,
    convType: ChatConversationType,
    createIfNeed: boolean = true
  ): Promise<ChatConversation | undefined> {
    chatlog.log(
      `${ChatManager.TAG}: getConversation: ${convId}, ${convType}, ${createIfNeed}`
    );
    let r: any = await Native._callMethod(MTgetConversation, {
      [MTgetConversation]: {
        convId: convId,
        convType: convType as number,
        createIfNeed: createIfNeed,
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
   * 该功能需联系商务开通。开通后，用户默认可拉取 7 天内的 10 个会话（每个会话包含最新一条历史消息）。如需调整会话数量或时间限制请联系商务经理。
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
   * 获取指定会话的最新一条消息。
   *
   * 该操作不影响未读消息数量。
   *
   * SDK 会先从内存中获取。如果没有找到会从本地数据库中获取，并放到内存中。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @returns 获取到的消息。如果没有找到返回 `undefined`。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getLatestMessage(
    convId: string,
    convType: ChatConversationType
  ): Promise<ChatMessage | undefined> {
    chatlog.log(`${ChatManager.TAG}: latestMessage: `, convId, convType);
    let r: any = await Native._callMethod(MTgetLatestMessage, {
      [MTgetLatestMessage]: {
        convId: convId,
        convType: convType,
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
   * 获取指定会话最新收到的一条消息。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @returns 消息实例。如果没有找到返回 `undefined`。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getLatestReceivedMessage(
    convId: string,
    convType: ChatConversationType
  ): Promise<ChatMessage | undefined> {
    chatlog.log(`${ChatManager.TAG}: lastReceivedMessage: `, convId, convType);
    let r: any = await Native._callMethod(MTgetLatestMessageFromOthers, {
      [MTgetLatestMessageFromOthers]: {
        convId: convId,
        convType: convType,
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
   * 获取指定会话中的未读消息数。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @returns 未读消息数。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getConversationUnreadCount(
    convId: string,
    convType: ChatConversationType
  ): Promise<number> {
    chatlog.log(
      `${ChatManager.TAG}: getConversationUnreadCount: `,
      convId,
      convType
    );
    let r: any = await Native._callMethod(MTgetUnreadMsgCount, {
      [MTgetUnreadMsgCount]: {
        convId: convId,
        convType: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: number = r?.[MTgetUnreadMsgCount] as number;
    return ret;
  }

  /**
   * Gets the message count of the conversation.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @returns The message count.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getConversationMessageCount(
    convId: string,
    convType: ChatConversationType
  ): Promise<number> {
    chatlog.log(
      `${ChatManager.TAG}: getConversationMessageCount: `,
      convId,
      convType
    );
    let r: any = await Native._callMethod(MTgetMsgCount, {
      [MTgetMsgCount]: {
        convId: convId,
        convType: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: number = r?.[MTgetMsgCount] as number;
    return ret;
  }

  /**
   * 将指定消息标为已读。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param msgId 消息ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async markMessageAsRead(
    convId: string,
    convType: ChatConversationType,
    msgId: string
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: markMessageAsRead: `,
      convId,
      convType,
      msgId
    );
    let r: any = await Native._callMethod(MTmarkMessageAsRead, {
      [MTmarkMessageAsRead]: {
        convId: convId,
        convType: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 将所有消息标为已读。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async markAllMessagesAsRead(
    convId: string,
    convType: ChatConversationType
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: markAllMessagesAsRead: `,
      convId,
      convType
    );
    let r: any = await Native._callMethod(MTmarkAllMessagesAsRead, {
      [MTmarkAllMessagesAsRead]: {
        convId: convId,
        convType: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 更新本地数据库的消息。
   *
   * 消息更新后，消息 ID 不会修改，SDK 会自动更新会话的 `latestMessage` 等属性。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param msg 要更新的消息的 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async updateConversationMessage(
    convId: string,
    convType: ChatConversationType,
    msg: ChatMessage
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: updateConversationMessage: `,
      convId,
      convType,
      msg
    );
    let r: any = await Native._callMethod(MTupdateConversationMessage, {
      [MTupdateConversationMessage]: {
        convId: convId,
        convType: convType,
        msg: msg,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 删除指定消息。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param msgId 要删除消息的 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async deleteMessage(
    convId: string,
    convType: ChatConversationType,
    msgId: string
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteMessage: ${convId}, ${convType}, ${msgId}`
    );
    let r: any = await Native._callMethod(MTremoveMessage, {
      [MTremoveMessage]: {
        convId: convId,
        convType: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 从本地数据库中删除指定时间段内的消息。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}.
   * @param params -
   * - startTs: 删除消息的起始时间。Unix 时间戳，单位为毫秒。
   * - endTs: 删除消息的结束时间。Unix 时间戳，单位为毫秒。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async deleteMessagesWithTimestamp(
    convId: string,
    convType: ChatConversationType,
    params: {
      startTs: number;
      endTs: number;
    }
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteMessagesWithTimestamp: ${convId}, ${convType}, ${params}`
    );
    let r: any = await Native._callMethod(MTdeleteMessagesWithTs, {
      [MTdeleteMessagesWithTs]: {
        convId: convId,
        convType: convType,
        startTs: params.startTs,
        endTs: params.endTs,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * 清除内存和数据库中指定会话中的消息。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}.
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async deleteConversationAllMessages(
    convId: string,
    convType: ChatConversationType
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteConversationAllMessages: `,
      convId,
      convType
    );
    let r: any = await Native._callMethod(MTclearAllMessages, {
      [MTclearAllMessages]: {
        convId: convId,
        convType: convType,
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
   * 从本地数据库获取会话中的指定用户发送的某些类型的消息。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param msgType 消息类型。详见 {@link ChatMessageType}。
   * @param direction 消息查询方向，详见 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的倒序加载。
   * - `ChatSearchDirection.DOWN`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的顺序加载。
   * @param timestamp 搜索的起始时间戳，单位为毫秒。
   * @param count 获取的最大消息数量。
   * @param sender 消息发送方。该参数也可以在搜索群组消息或聊天室消息时使用。
   * @returns 消息列表。若未获取到，返回空列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getMessagesWithMsgType(
    convId: string,
    convType: ChatConversationType,
    msgType: ChatMessageType,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessagesWithMsgType: `,
      convId,
      convType,
      msgType,
      direction,
      timestamp,
      count,
      sender
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
   * 从本地数据库获取指定会话中一定数量的消息。
   *
   * **注意** 获取到的消息也会放入到内存中。
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param startMsgId 开始消息 ID。若该参数设为空或 `null`，SDK 按服务器接收消息时间的倒序加载消息。
   * @param direction 消息查询方向，详见 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的倒序加载。
   * - `ChatSearchDirection.DOWN`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的顺序加载。
   * @param loadCount 获取的最大消息数量。取值范围为 [1,400]。
   * @returns 消息列表。若未获取到消息，返回空列表。
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getMessages(
    convId: string,
    convType: ChatConversationType,
    startMsgId: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    loadCount: number = 20
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessages: `,
      convId,
      convType,
      startMsgId,
      direction,
      loadCount
    );
    let r: any = await Native._callMethod(MTloadMsgWithStartId, {
      [MTloadMsgWithStartId]: {
        convId: convId,
        convType: convType,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        startId: startMsgId,
        count: loadCount,
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
   * 从本地数据库获取会话中的指定用户在一定时间段内发送的特定消息。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param keywords 查询的关键字。
   * @param direction 消息查询方向，详见 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的倒序加载。
   * - `ChatSearchDirection.DOWN`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的顺序加载。
   * @param timestamp 搜索的开始时间戳，单位为毫秒。
   * @param count 获取的最大消息数量。取值范围为 [1,400]。
   * @param sender 消息发送者，该参数也可以在搜索群组消息和聊天室消息时使用。
   * @returns 消息列表。若未获取到消息，返回空列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getMessagesWithKeyword(
    convId: string,
    convType: ChatConversationType,
    keywords: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessagesWithKeyword: `,
      convId,
      convType,
      keywords,
      direction,
      timestamp,
      count,
      sender
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
   * 从本地数据库获取指定会话在一段时间内的消息。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param startTime 搜索起始时间戳，单位为毫秒。
   * @param endTime 搜索结束时间戳，单位为毫秒。
   * @param direction 消息查询方向，详见 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的倒序加载。
   * - `ChatSearchDirection.DOWN`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的顺序加载。
   * @param count 获取的最大消息数量。取值范围为 [1,400]。
   * @returns 消息列表。若未获取到消息，返回空列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getMessageWithTimestamp(
    convId: string,
    convType: ChatConversationType,
    startTime: number,
    endTime: number,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    count: number = 20
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessageWithTimestamp: `,
      convId,
      convType,
      startTime,
      endTime,
      direction,
      count
    );
    let r: any = await Native._callMethod(MTloadMsgWithTime, {
      [MTloadMsgWithTime]: {
        convId: convId,
        convType: convType,
        startTime: startTime,
        endTime: endTime,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        count: count,
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
   * 翻译一条文本消息。
   *
   * @param msg 要翻译的文本消息。
   * @param languages 目标语言。
   * @returns 译文。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 设置会话的扩展属性。
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话 ID。
   * @param convType 会话类型，详见 {@link ChatConversationType}。
   * @param ext 扩展信息。可添加自定义扩展信息。
   */
  public async setConversationExtension(
    convId: string,
    convType: ChatConversationType,
    ext: {
      [key: string]: string | number | boolean;
    }
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: setConversationExtension: `,
      convId,
      convType,
      ext
    );
    let r: any = await Native._callMethod(MTsyncConversationExt, {
      [MTsyncConversationExt]: {
        convId: convId,
        convType: convType,
        ext: ext,
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
    Object.entries(r?.[MTgetReactionList]).forEach((value: [string, any]) => {
      ret.push(new ChatMessageReaction(value[1]));
    });
    return ret;
  }

  /**
   * 获取群组消息的已读人数。
   *
   * @param msgId 消息 ID。
   * @returns 若调用成功，返回群组消息的已读人数；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
   */
  public async groupAckCount(msgId: string): Promise<number> {
    chatlog.log(`${ChatManager.TAG}: groupAckCount: `, msgId);
    let r: any = await Native._callMethod(MTgroupAckCount, {
      [MTgroupAckCount]: {
        msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    return r?.[MTgroupAckCount] as number;
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
   */
  public async fetchMembersWithChatThreadFromServer(
    chatThreadId: string,
    cursor: string = '',
    pageSize: number = 20
  ): Promise<Array<string>> {
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
    return r?.[MTfetchChatThreadMember] as Array<string>;
  }

  /**
   * 分页从服务器获取当前用户加入的子区列表。
   *
   * @param cursor 开始获取数据的游标位置。首次调用方法时传 `null` 或空字符串，按用户加入子区时间的倒序获取数据。
   * @param pageSize 每页期望返回的子区数。取值范围为 [1,400]。
   * @returns 若调用成功，返回子区列表；失败则抛出异常。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}.
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
   * 根据消息 ID 单向删除漫游消息
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话ID。
   * @param convType 会话类型。
   * @param msgIds 将要删除的消息ID列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async removeMessagesFromServerWithMsgIds(
    convId: string,
    convType: ChatConversationType,
    msgIds: string[]
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: removeMessagesFromServerWithMsgIds: `,
      convId,
      convType,
      msgIds
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
        },
      }
    );
    Native.checkErrorFromResult(r);
  }

  /**
   * 根据消息 时间戳 单向删除漫游消息
   *
   * **注意** 调用该方法，如果会话对象不存在则创建。
   *
   * @param convId 会话ID。
   * @param convType 会话类型。
   * @param timestamp UNIX 时间戳，单位为毫秒。若消息的 UNIX 时间戳小于设置的值，则会被删除。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async removeMessagesFromServerWithTimestamp(
    convId: string,
    convType: ChatConversationType,
    timestamp: number
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: removeMessagesFromServerWithTimestamp: `,
      convId,
      convType,
      timestamp
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
   * @returns 会话列表。
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
   * @param isPinned 是否置顶。
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
}
