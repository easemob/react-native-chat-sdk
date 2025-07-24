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
  MTgetConvsMsgsWithKeyword,
  MTgetConversation,
  MTgetConversationsFromServer,
  MTgetConversationsFromServerWithCursor,
  MTgetLatestMessage,
  MTgetLatestMessageFromOthers,
  MTgetMessage,
  MTgetMessageCount,
  MTgetMessageCountWithTimestamp,
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
  MTmodifyMsgBody,
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
  MTonMessagesRecalledInfo,
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
  MTremoveMessagesWithTimestamp,
  MTremoveReaction,
  MTreportMessage,
  MTresendMessage,
  MTsearchChatMsgFromDB,
  MTsearchMessages,
  MTsearchMessagesInConversation,
  MTsendMessage,
  MTsyncConversationExt,
  MTtranslateMessage,
  MTunpinMessage,
  MTupdateChatMessage,
  MTupdateChatThreadSubject,
  MTupdateConversationMessage,
  MTgetMessagesWithIds,
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
  type ChatMessageStatusCallback,
  ChatMessageType,
  ChatRecalledMessageInfo,
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
 * The chat manager class, responsible for sending and receiving messages, managing conversations (including loading and deleting conversations), and downloading attachments.
 *
 * The sample code for sending a text message is as follows:
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
    event.removeAllListeners(MTonMessagesRecalledInfo);
    event.addListener(
      MTonMessagesRecalledInfo,
      this.onMessagesRecalledInfo.bind(this)
    );
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

  private createReceiveRecallMessage(params: any[]): ChatRecalledMessageInfo[] {
    let list: Array<ChatRecalledMessageInfo> = [];
    params.forEach((param: any) => {
      const m = new ChatRecalledMessageInfo({
        recalledMessage: param.recalledMessage
          ? ChatMessage.createReceiveMessage(param.recalledMessage)
          : undefined,
        recalledBy: param.recalledBy,
        recalledExt: param.recalledExt,
        recalledMessageId: param.recalledMessageId,
      });
      list.push(m);
    });
    return list;
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
  private onMessagesRecalledInfo(params: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesRecalledInfo: `, params);
    if (this._messageListeners.size === 0) {
      return;
    }
    let list: Array<ChatRecalledMessageInfo> =
      this.createReceiveRecallMessage(params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onMessagesRecalledInfo?.(list);
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
   * Adds a message listener.
   *
   * @param listener The message listener to add.
   */
  public addMessageListener(listener: ChatMessageEventListener): void {
    chatlog.log(`${ChatManager.TAG}: addMessageListener: `);
    this._messageListeners.add(listener);
  }

  /**
   * Removes the message listener.
   *
   * @param listener The message listener to remove.
   */
  public removeMessageListener(listener: ChatMessageEventListener): void {
    chatlog.log(`${ChatManager.TAG}: removeMessageListener: `);
    this._messageListeners.delete(listener);
  }

  /**
   * Removes all message listeners.
   */
  public removeAllMessageListener(): void {
    chatlog.log(`${ChatManager.TAG}: removeAllMessageListener: `);
    this._messageListeners.clear();
  }

  /**
   * Sends a message.
   *
   * **Note**
   *
   * - For a voice or image message or a message with an attachment, the SDK will automatically upload the attachment.
   * - You can determine whether to upload the attachment to the chat sever by setting {@link ChatOptions}.
   *
   * @param message The message object to be sent. Ensure that you set this parameter.
   * @param callback The listener that listens for message changes.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Resends a message.
   *
   * @param message The message object to be resent.
   * @param callback The listener that listens for message changes.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Sends the read receipt to the server.
   *
   * This method applies to one-to-one chats only.
   *
   * **Note**
   *
   * This method takes effect only when you set {@link ChatOptions.requireAck} as `true`.
   *
   * To send a group message read receipt, you can call {@link sendGroupMessageReadAck}.
   *
   * We recommend that you call {@link sendConversationReadAck} when opening the chat page. In other cases, you can call this method to reduce the number of method calls.
   *
   * @param message The message for which the read receipt is to be sent.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Sends the group message receipt to the server.
   *
   * **Note**
   *
   * - This method takes effect only after you set {@link ChatOptions.requireAck} and {@link ChatMessage.needGroupAck} as `true`.
   * - This method applies to group messages only. To send a read receipt for a one-to-one chat message, you can call {@link sendMessageReadAck}; to send a conversation read receipt, you can call {@link sendConversationReadAck}.
   *
   * @param msgId The message ID.
   * @param groupId The group ID.
   * @param opt The extension information, which is a custom keyword that specifies a custom action or command.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Sends the conversation read receipt to the server.
   *
   * **Note**
   *
   * - This method is valid only for one-to-one conversations.
   * - After this method is called, the sever will set the message status from unread to read.
   * - The SDK triggers the {@link ChatMessageEventListener.onConversationRead} callback on the client of the message sender, notifying that the messages are read. This also applies to multi-device scenarios.
   *
   * @param convId The conversation ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * For a one-to-one chat conversation, only the message sender can recall the message that is sent successfully. If the message expires, the recall fails.
   *
   * For a group/chat room conversation, except the message sender, the group/chat room owner and administrators can recall messages sent in the group/chat room. If the message expires, only the group/chat room owner and administrators can recall it.
   *
   * @param msgId The message ID.
   * @param option The extension information.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async recallMessage(
    msgId: string,
    option?: { ext?: string }
  ): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: recallMessage: ${msgId}`);
    let r: any = await Native._callMethod(MTrecallMessage, {
      [MTrecallMessage]: {
        msg_id: msgId,
        ext: option?.ext,
      },
    });
    Native.checkErrorFromResult(r);
  }

  /**
   * Gets a message from the local database by message ID.
   *
   * @param msgId The message ID.
   * @returns The message.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets messages with the specified IDs from the local database.
   *
   * @params -
   *  @param convId The conversation ID.
   *  @param convType The conversation type. See {@link ChatConversationType}.
   *  @param msgIds The message IDs.
   * @returns The list of retrieved messages. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessagesWithIds(params: {
    convId: string;
    convType: ChatConversationType;
    msgIds: Array<string>;
  }): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessagesWithIds: ${params.convId}, ${params.convType}, ${params.msgIds}`
    );
    let r: any = await Native._callMethod(MTgetMessagesWithIds, {
      [MTgetMessagesWithIds]: {
        convId: params.convId,
        convType: params.convType,
        msgIds: params.msgIds,
      },
    });
    Native.checkErrorFromResult(r);
    const rr = r?.[MTgetMessagesWithIds];
    return rr.map((msg: any) => new ChatMessage(msg));
  }

  /**
   * Marks all conversations as read.
   *
   * This method is for the local conversations only.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async markAllConversationsAsRead(): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: markAllConversationsAsRead: `);
    let r: any = await Native._callMethod(MTmarkAllChatMsgAsRead);
    Native.checkErrorFromResult(r);
  }

  /**
   * Gets the count of the unread messages.
   *
   * @returns The count of the unread messages.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getUnreadCount(): Promise<number> {
    chatlog.log(`${ChatManager.TAG}: getUnreadCount: `);
    let r: any = await Native._callMethod(MTgetUnreadMessageCount);
    Native.checkErrorFromResult(r);
    return r?.[MTgetUnreadMessageCount] as number;
  }

  /**
   * Inserts a message to the conversation in the local database.
   *
   * For example, when a notification messages is received, a message can be constructed and written to the conversation. If the message to insert already exits (msgId or localMsgId is existed), the insertion fails.
   *
   * The message will be inserted based on the Unix timestamp included in it. Upon message insertion, the SDK will automatically update attributes of the conversation, including `latestMessage`.
   *
   * @param message The message to be inserted.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Updates the local message.
   *
   * The message will be updated both in the memory and local database.
   *
   * @return The updated message.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Imports messages to the local database.
   *
   * You can only import messages that you sent or received.
   *
   * @param messages The messages to import.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Downloads the message attachment.
   *
   * **Note** This method is only used to download messages attachment in combine type message or thread type.
   *
   * **Note** The bottom layer will not get the original message object and will use the json converted message object.
   *
   * You can also call this method if the attachment fails to be downloaded automatically.
   *
   * @param message The ID of the message with the attachment to be downloaded.
   * @param callback The listener that listens for message changes.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Downloads the message thumbnail.
   *
   * **Note** This method is only used to download messages thumbnail in combine type message.
   *
   * @param message The ID of the message with the thumbnail to be downloaded. Only the image messages and video messages have a thumbnail.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Downloads the message attachment.
   *
   * You can also call this method if the attachment fails to be downloaded automatically.
   *
   * @param message The ID of the message with the attachment to be downloaded.
   * @param callback The listener that listens for message changes.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Downloads the message thumbnail.
   *
   * @param message The ID of the message with the thumbnail to be downloaded. Only the image messages and video messages have a thumbnail.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Uses the pagination to get messages in the specified conversation from the server.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @params params
   * - pageSize: The number of messages that you expect to get on each page. The value range is [1,50].
   * - startMsgId: The starting message ID for query. After this parameter is set, the SDK retrieves messages, starting from the specified one, in the reverse chronological order of when the server receives them. If this parameter is set an empty string, the SDK retrieves messages, starting from the latest one, in the reverse chronological order of when the server receives them.
   * - direction: The message search direction. See {@link ChatSearchDirection}.
   *                  - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   *                  - `ChatSearchDirection.Down`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @returns The list of retrieved messages (excluding the one with the starting ID) and the cursor for the next query.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2024-08-15 Use {@link fetchHistoryMessagesByOptions} instead.
   */
  public async fetchHistoryMessages(
    convId: string,
    convType: ChatConversationType,
    params: {
      pageSize?: number;
      startMsgId?: string;
      direction?: ChatSearchDirection;
    }
  ): Promise<ChatCursorResult<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchHistoryMessages: ${convId}, ${convType}, ${params}`
    );
    let r: any = await Native._callMethod(MTfetchHistoryMessages, {
      [MTfetchHistoryMessages]: {
        convId: convId,
        convType: convType as number,
        pageSize: params.pageSize ?? 20,
        startMsgId: params.startMsgId ?? '',
        direction:
          params.direction === ChatSearchDirection.DOWN ? 'down' : 'up',
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
   * retrieve the history message for the specified session from the server.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param params -
   * - options: The parameter configuration class for pulling historical messages from the server. See {@link ChatFetchMessageOptions}.
   * - cursor: The cursor position from which to start querying data.
   * - pageSize: The number of messages that you expect to get on each page. The value range is [1,50].
   *
   * @returns The list of retrieved messages (excluding the one with the starting ID) and the cursor for the next query.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchHistoryMessagesByOptions(
    convId: string,
    convType: ChatConversationType,
    params?: {
      options?: ChatFetchMessageOptions;
      cursor?: string;
      pageSize?: number;
    }
  ): Promise<ChatCursorResult<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchHistoryMessagesByOptions: ${convId}, ${convType}, ${params}`
    );
    let r: any = await Native._callMethod(MTfetchHistoryMessagesByOptions, {
      [MTfetchHistoryMessagesByOptions]: {
        convId: convId,
        convType: convType as number,
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
   * Retrieves messages with keywords in a conversation from the local database.
   *
   * @param keywords The keywords for query.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * @param maxCount The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param from     The user ID of the message sender. If you do not set this parameter, the SDK ignores this parameter when retrieving messages.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   *                  - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   *                  - `ChatSearchDirection.Down`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        timestamp: timestamp,
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
   * Retrieves messages with keywords from the local database.
   *
   * @param keywords The keywords for query.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * @param maxCount The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param from The user ID of the message sender. If you do not set this parameter, the SDK ignores this parameter when retrieving messages.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   *                  - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   *                  - `ChatSearchDirection.Down`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        timestamp: timestamp,
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
   *  Loads messages with the specified keyword from the local database, returning a dictionary containing conversation IDs and message ID arrays.
   *  The SDK returns messages in chronological order.
   *
   * @params -
   *  @param keywords        The keyword for message search. If you set this parameter as `undefined`, the SDK ignores this parameter when retrieving messages.
   *  @param timestamp       The Unix timestamp threshold for message search. The unit is millisecond. If you set this parameter as `undefined`, the SDK loads messages from the latest one.
   *  @param from          The sender of the message. If you set this parameter as `undefined`, the SDK ignores this parameter when retrieving messages.
   *  @param direction       The message search direction. See {@link ChatSearchDirection}.
   *                        - `UP`: The SDK retrieves messages in the descending order of the timestamp included in them.
   *                        - `DOWN`：The SDK retrieves messages in the ascending order of the timestamp included in them.
   *  @param searchScope           The message search scope. See {@link ChatMessageSearchScope}.
   *
   * @returns A dictionary containing conversation IDs and message ID arrays. If no message is obtained, an empty dictionary is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getConvsMsgsWithKeyword(params: {
    keywords: string;
    timestamp?: number;
    from?: string;
    direction?: ChatSearchDirection;
    searchScope?: ChatMessageSearchScope;
  }): Promise<Map<string, Array<string>>> {
    chatlog.log(
      `${ChatManager.TAG}: getConvsMsgsWithKeyword: ${params.keywords}, ${params.timestamp}, ${params.from}, ${params.direction}, ${params.searchScope}`
    );
    let r: any = await Native._callMethod(MTgetConvsMsgsWithKeyword, {
      [MTgetConvsMsgsWithKeyword]: {
        keywords: params.keywords,
        timestamp: params.timestamp ?? -1,
        from: params.from,
        direction: params.direction === ChatSearchDirection.UP ? 'up' : 'down',
        searchScope: params.searchScope ?? ChatMessageSearchScope.All,
      },
    });
    Native.checkErrorFromResult(r);
    let ret = new Map<string, Array<string>>();
    const rr: Array<any> = r?.[MTgetConvsMsgsWithKeyword];
    if (rr) {
      rr.forEach((element) => {
        ret.set(element.convId, element.msgIds);
      });
    }
    return ret;
  }

  /**
   * Uses the pagination to get read receipts for group messages from the server.
   *
   * For how to send read receipts for group messages, see {@link sendConversationReadAck}.
   *
   * @param msgId The message ID.
   * @param startAckId The starting read receipt ID for query. After this parameter is set, the SDK retrieves read receipts, from the specified one, in the reverse chronological order of when the server receives them.
   *                   If this parameter is set as `null` or an empty string, the SDK retrieves read receipts, from the latest one, in the reverse chronological order of when the server receives them.
   * @param pageSize The number of read receipts for the group message that you expect to get on each page. The value range is [1,400].
   * @returns The list of retrieved read receipts (excluding the one with the starting ID) and the cursor for the next query.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Deletes the specified conversation and its historical messages from the server.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isDeleteMessage Whether to delete the historical messages with the conversation.
   * - (Default) `true`: Yes.
   * - `false`: No.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the conversation by conversation ID and conversation type.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param createIfNeed Whether to create a conversation if the specified conversation is not found:
   * - (Default) `true`: Yes.
   * - `false`: No.
   * @param isChatThread Whether the conversation is a thread conversation.
   * - (Default) `false`: No.
   * - `true`: Yes.
   *
   * @returns The retrieved conversation object. The SDK returns `null` if the conversation is not found.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets all conversations from the local database.
   *
   * Conversations will be first retrieved from the memory. If no conversation is found, the SDK retrieves from the local database.
   *
   * @returns The retrieved conversations.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * @deprecated 2023-07-24 Use {@link fetchConversationsFromServerWithCursor} instead.
   *
   * Gets the conversation list from the server.
   *
   * **Note**
   *
   * - To use this function, you need to contact our business manager to activate it.
   * - After this function is activated, users can pull 10 conversations within 7 days by default (each conversation contains the latest historical message).
   * - If you want to adjust the number of conversations or time limit, contact our business manager.
   *
   * @returns The conversation list of the current user.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Deletes a conversation and its local messages from the local database.
   *
   * @param convId The conversation ID.
   * @param withMessage Whether to delete the historical messages with the conversation.
   * - (Default) `true`: Yes.
   * - `false`: No.
   * @returns Whether the conversation is successfully deleted.
   * - `true`: Yes.
   * - `false`: No.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the latest message from the conversation.
   *
   * **Note**
   *
   * The operation does not change the unread message count.
   * If the conversation object does not exist, this method will create it.
   *
   * The SDK gets the latest message from the memory first. If no message is found, the SDK loads the message from the local database and then puts it in the memory.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The message instance. The SDK returns `undefined` if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the latest received message from the conversation.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The message instance. The SDK returns `undefined` if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the unread message count of the conversation.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The unread message count.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the message count of the conversation.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The message count.
   *getMessageCount
   * @throws A description of the exception. See {@link ChatError}.
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
   * Marks a message as read.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @param msgId The message ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Marks all messages as read.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Updates a message in the local database.
   *
   * After you modify a message, the message ID remains unchanged and the SDK automatically updates properties of the conversation, like `latestMessage`.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @param msg The ID of the message to update.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Deletes a message from the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @param msgId The ID of the message to delete.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Deletes messages sent or received in a certain period from the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @params params
   * - startTs: The starting UNIX timestamp for message deletion. The unit is millisecond.
   * - endTs: The end UNIX timestamp for message deletion. The unit is millisecond.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Deletes all messages in the conversation from both the memory and local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Deletes local messages with timestamp that is before the specified one.
   *
   * @param timestamp The specified Unix timestamp(milliseconds).
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Retrieves messages of a certain type in a conversation from the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param msgType The message type. See {@link ChatMessageType}.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param sender The message sender, which is the user ID of the peer user for one-to-one chat or group ID for group chat.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2023-07-24. Use {@link getMsgsWithMsgType} instead.
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
   * Retrieves messages of a certain type in the conversation from the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @params -
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param msgType The message type. See {@link ChatMessageType}.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param sender The user ID of the message sender. If you do not set this parameter, the SDK ignores this parameter when retrieving messages.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Retrieves messages of a specified quantity in a conversation from the local database.
   *
   * The retrieved messages will also be put in the conversation in the memory according to the timestamp included in them.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param startMsgId The starting message ID for query. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                   If this parameter is set an empty string, the SDK retrieves messages according to the message search direction while ignoring this parameter.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param loadCount The maximum number of messages to retrieve each time. The value range is [1,50].
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2023-07-24. Use {@link getMsgs} instead.
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
   * Retrieves messages of a specified quantity in a conversation from the local database.
   *
   * The retrieved messages will also be put in the conversation in the memory according to the timestamp included in them.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @params -
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param startMsgId The starting message ID for query. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                   If this parameter is set an empty string, the SDK retrieves messages according to the message search direction while ignoring this parameter.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param loadCount The maximum number of messages to retrieve each time. The value range is [1,50].
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets messages that the specified user sends in a conversation in a certain period.
   *
   * This method gets data from the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param keywords The keywords for query.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param sender The user ID of the message sender. If you do not set this parameter, the SDK ignores this parameter when retrieving messages.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2023-07-24 This method is deprecated. Use {@link getConvMsgsWithKeyword} instead.
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
   * Gets messages that the specified user sends in a conversation in a certain period.
   *
   * This method gets data from the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @params -
   * - convId The conversation ID.
   * - convType The conversation type. See {@link ChatConversationType}.
   * - keywords The keywords for query.
   * - direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * - timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   * - searchScope The message search scope. See {@link ChatMessageSearchScope}.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * - count The maximum number of messages to retrieve each time. The value range is [1,400].
   * - sender The user ID of the message sender. If you do not set this parameter, the SDK ignores this parameter when retrieving messages. use `senders` instead. 2025-07-22
   * - senders The user IDs of the message senders. If you do not set this parameter, the SDK ignores this parameter when retrieving messages.
   * - isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getConvMsgsWithKeyword(params: {
    convId: string;
    convType: ChatConversationType;
    keywords: string;
    direction?: ChatSearchDirection;
    timestamp?: number;
    count?: number;
    sender?: string;
    senders?: Array<string>;
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
      senders,
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
      senders,
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
        senders: senders,
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
   * Retrieves messages that are sent and received in a certain period in a conversation in the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param startTime The starting Unix timestamp for query, in milliseconds.
   * @param endTime The ending Unix timestamp for query, in milliseconds.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of retrieved messages (excluding with the ones with the starting or ending timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2023-07-24 This method is deprecated. Use {@link getMsgWithTimestamp} instead.
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
   * Retrieves messages that are sent and received in a certain period in a conversation in the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @params -
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param startTime The starting Unix timestamp for query, in milliseconds.
   * @param endTime The ending Unix timestamp for query, in milliseconds.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of retrieved messages (excluding with the ones with the starting or ending timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Translates a text message.
   *
   * @param msg The text message to translate.
   * @param languages The target languages.
   * @returns The translation.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets all languages supported by the translation service.
   *
   * @returns The list of languages supported for translation.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Sets the extension information of the conversation.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @param ext The extension information. This parameter must be key-value type.
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
   * Adds a Reaction.
   *
   * @param reaction The Reaction content.
   * @param msgId The ID of the message for which the Reaction is added.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Deletes a Reaction.
   *
   * @param reaction The Reaction to delete.
   * @param msgId The message ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the list of Reactions.
   *
   * @param msgIds The message ID list.
   * @param groupId The group ID, which is invalid only when the chat type is group chat.
   * @param chatType The chat type.
   * @returns If success, the Reaction list is returned; otherwise, an exception is thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the Reaction details.
   *
   * @param msgId The message ID.
   * @param reaction The Reaction content.
   * @param cursor The cursor position from which to start getting Reactions.
   * @param pageSize The number of Reactions you expect to get on each page.
   * @returns If success, the SDK returns the Reaction details and the cursor for the next query. The SDK returns `null` if all the data is fetched.
   *          If a failure occurs, an exception is thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Reports an inappropriate message.
   *
   * @param msgId The ID of the message to report.
   * @param tag The tag of the inappropriate message. You need to type a custom tag, like `porn` or `ad`.
   * @param reason The reporting reason. You need to type a specific reason.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the list of Reactions from a message.
   *
   * @param msgId The message ID.
   * @returns If success, the Reaction list is returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the number of members that have read the group message.
   *
   * @param msgId The message ID.
   * @returns If success, the SDK returns the number of members that have read the group message; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Creates a message thread.
   *
   * Each member of the group where the thread belongs can call this method.
   *
   * Upon the creation of a message thread, the following will occur:
   *
   *  - In a single-device login scenario, each member of the group to which the message thread belongs will receive the {@link ChatMessageEventListener.onChatMessageThreadCreated} callback.
   *   You can listen for message thread events by setting {@link ChatMessageEventListener}.
   *
   * - In a multi-device login scenario, the devices will receive the {@link ChatMultiDeviceEventListener.onThreadEvent} callback.
   *   You can listen for message thread events by setting {@link ChatMultiDeviceEventListener}.
   *
   * @param name The name of the new message thread. It can contain a maximum of 64 characters.
   * @param msgId The ID of the parent message.
   * @param parentId The parent ID, which is the group ID.
   * @returns If success, the new message thread object is returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Joins a message thread.
   *
   * Each member of the group where the message thread belongs can call this method.
   *
   * In a multi-device login scenario, note the following:
   *
   * - The devices will receive the {@link ChatMultiDeviceEventListener.onThreadEvent} callback.
   *
   * - You can listen for message thread events by setting {@link ChatMultiDeviceEventListener}.
   *
   * @param chatThreadId The message thread ID.
   * @returns If success, the message thread details {@link ChatMessageThread} are returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Leaves a message thread.
   *
   * Each member in the message thread can call this method.
   *
   * In a multi-device login scenario, note the following:
   *
   * - The devices will receive the {@link ChatMultiDeviceEventListener.onThreadEvent} callback.
   *
   * - You can listen for message thread events by setting {@link ChatMultiDeviceEventListener}.
   *
   * @param chatThreadId The ID of the message thread that the current user wants to leave.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Destroys the message thread.
   *
   * Only the owner or admins of the group where the message thread belongs can call this method.
   *
   * **Note**
   *
   * - In a single-device login scenario, each member of the group to which the message thread belongs will receive the {@link ChatMessageEventListener.onChatMessageThreadDestroyed} callback.
   *   You can listen for message thread events by setting {@link ChatMessageEventListener}.
   *
   * - In a multi-device login scenario, the devices will receive the {@link ChatMultiDeviceEventListener.onThreadEvent} callback.
   *   You can listen for message thread events by setting {@link ChatMultiDeviceEventListener}.
   *
   * @param chatThreadId The message thread ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Changes the name of the message thread.
   *
   * Only the owner or admins of the group where the message thread belongs and the message thread creator can call this method.
   *
   * Each member of the group to which the message thread belongs will receive the {@link ChatMessageEventListener.onChatMessageThreadUpdated} callback.
   *
   * You can listen for message thread events by setting {@link ChatMessageEventListener}.
   *
   * @param chatThreadId  The message thread ID.
   * @param newName The new message thread name. It can contain a maximum of 64 characters.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Removes a member from the message thread.
   *
   * Only the owner or admins of the group where the message thread belongs and the message thread creator can call this method.
   *
   * The removed member will receive the {@link ChatMessageEventListener.onChatMessageThreadUserRemoved} callback.
   *
   * You can listen for message thread events by setting {@link ChatMessageEventListener}.
   *
   * @param chatThreadId The message thread ID.
   * @param memberId The user ID of the member to be removed from the message thread.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Uses the pagination to get a list of members in the message thread.
   *
   * Each member of the group to which the message thread belongs can call this method.
   *
   * @param chatThreadId The message thread ID.
   * @param cursor The position from which to start getting data. At the first method call, if you set `cursor` to `null` or an empty string, the SDK will get data in the chronological order of when members join the message thread.
   * @param pageSize The number of members that you expect to get on each page. The value range is [1,400].
   * @returns If success, the list of members in a message thread is returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Uses the pagination to get the list of message threads that the current user has joined.
   *
   * @param cursor The position from which to start getting data. At the first method call, if you set `cursor` to `null` or an empty string, the SDK will get data in the reverse chronological order of when the user joins the message threads.
   * @param pageSize The number of message threads that you expect to get on each page. The value range is [1,400].
   * @returns If success, a list of message threads is returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Uses the pagination to get the list of message threads that the current user has joined in the specified group.
   *
   * This method gets data from the server.
   *
   * @param parentId The parent ID, which is the group ID.
   * @param cursor The position from which to start getting data. At the first method call, if you set `cursor` to `null` or an empty string, the SDK will get data in the reverse chronological order of when the user joins the message threads.
   * @param pageSize The number of message threads that you expect to get on each page. The value range is [1,400].
   * @returns If success, a list of message threads is returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Uses the pagination to get the list of message threads in the specified group.
   *
   * This method gets data from the server.
   *
   * @param parentId The parent ID, which is the group ID.
   * @param cursor The position from which to start getting data. At the first method call, if you set `cursor` to `null` or an empty string, the SDK will get data in the reverse chronological order of when message threads are created.
   * @param pageSize The number of message threads that you expect to get on each page. The value range is [1,400].
   * @returns If success, a list of message threads is returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the last reply in the specified message threads from the server.
   *
   * @param chatThreadIds The list of message thread IDs to query. You can pass a maximum of 20 message thread IDs each time.
   * @returns If success, a list of last replies are returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the details of the message thread from the server.
   *
   * @param chatThreadId The message thread ID.
   * @returns If success, the details of the message thread are returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the details of the message thread from the memory.
   *
   * @param msgId The message thread ID.
   * @returns If success, the details of the message thread are returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the thread conversation by conversation ID.
   *
   * @param convId The conversation ID.
   * @param createIfNeed Whether to create a conversation if the specified conversation is not found:
   * - (Default) `true`: Yes.
   * - `false`: No.
   *
   * @returns The retrieved conversation object. The SDK returns `null` if the conversation is not found.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets conversations from the server with pagination.
   *
   * @param pageSize The number of conversations to retrieve on each page.
   * @param pageNum The current page number, starting from 1.
   * @returns If success, the list of conversations is returned; otherwise, an exception will be thrown.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2024-08-13 replace with {@link fetchConversationsFromServerWithCursor}
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
   * Deletes messages from the conversation (from both local storage and server).
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation Type.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @param msgIds The IDs of messages to delete from the current conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Deletes messages from the conversation (from both local storage and server).
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @param convId The conversation ID.
   * @param convType The conversation Type.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @param timestamp The message timestamp in millisecond. The messages with the timestamp smaller than the specified one will be deleted.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the list of conversations from the server with pagination.
   *
   * The SDK retrieves the list of conversations in the reverse chronological order of their active time (generally the timestamp of the last message).
   *
   * If there is no message in the conversation, the SDK retrieves the list of conversations in the reverse chronological order of their creation time.
   *
   * @param cursor: The cursor position from which to start querying data. If you pass in an empty string or `undefined`, the SDK retrieves conversations from the latest active one.
   *
   * @param pageSize: The number of conversations that you expect to get on each page. The value range is [1,50].
   *
   * @returns The list of retrieved conversations.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Get the list of pinned conversations from the server with pagination.
   *
   * The SDK returns the pinned conversations in the reverse chronological order of their pinning.
   *
   * @param cursor: The cursor position from which to start querying data. If you pass in an empty string or `undefined`, the SDK retrieves the pinned conversations from the latest pinned one.
   * @param pageSize: The number of conversations that you expect to get on each page. The value range is [1,50].
   *
   * @returns The list of retrieved conversations.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Sets whether to pin a conversation.
   *
   * @param convId The conversation ID.
   * @param isPinned Whether to pin a conversation:
   * - `true`：Yes.
   * - `false`: No. The conversation is unpinned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Modifies a message.
   *
   * After this method is called to modify a message, both the local message and the message on the server are modified.
   *
   * This method can only modify a text message in one-to-one chats or group chats, but not in chat rooms.
   *
   * @param msgId The ID of the message to modify.
   * @param body The modified text message body. See {@link ChatTextMessageBody}.
   *
   * @returns The modified message. See {@link ChatMessageBody}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2025-07-21. Use {@link modifyMsgBody} instead.
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
   *   Modifies a message both in the local storage and server.
   *
   *  - Text and custom message: Both the message body `body` and extension information `ext` can be modified.
   *  - Image/voice/video/file/combined message: Only the message extension field `ext` can be modified.
   *  - Command message: This type of message cannot be modified.
   *
   *  Note that the message ID cannot be changed.
   *
   * @params -
   *  @param messageId       The ID of the message for modification.
   *  @param body            The modified message body. You can only modify the body of a text message and a custom message. The value `undefined` indicates that the message body remains unchanged.
   *  @param ext             The modified message extension information. The new extension information will overwrite the previous. The value `undefined` indicates that the message extension information remains unchanged.
   *
   * @returns The modified message. See {@link ChatMessage}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   */
  public async modifyMsgBody(params: {
    msgId: string;
    body?: ChatMessageBody;
    ext?: Record<string, any>;
  }): Promise<ChatMessage> {
    chatlog.log(
      `${ChatManager.TAG}: modifyMsgBody: ${params.msgId}, ${params.body?.type}, ${params.ext}`
    );
    let r: any = await Native._callMethod(MTmodifyMsgBody, {
      [MTmodifyMsgBody]: {
        msgId: params.msgId,
        body: params.body,
        ext: params.ext,
      },
    });
    Native.checkErrorFromResult(r);
    const rr = r?.[MTmodifyMsgBody];
    return new ChatMessage(rr);
  }

  /**
   * Gets the list of original messages included in a combined message.
   *
   * A combined message contains one or more multiple original messages.
   *
   * @param message The combined message.
   *
   * @returns The list of original messages in the message body.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   *  Marks conversations.
   *
   *  This method marks conversations both locally and on the server.
   *
   * @param convIds The list of conversation IDs.
   * @param mark The mark to add for the conversations. See {@link ChatConversationMarkType}.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   *  Unmarks conversations.
   *
   *  This method unmarks conversations both locally and on the server.
   *
   * @param convIds The list of conversation IDs.
   * @param mark The conversation mark to remove. See {@link ChatConversationMarkType}.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the conversations from the server by conversation filter options.
   *
   * @param option The conversation filter options. See {@link ChatConversationFetchOptions}.
   *
   * @returns The retrieved list of conversations. See {@link ChatCursorResult}.
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
   * Clears all conversations and all messages in them.
   *
   * @param clearServerData Whether to clear all conversations and all messages in them on the server.
   *   - `true`：Yes. All conversations and all messages in them will be cleared on the server side.
   *   The current user cannot retrieve messages and conversations from the server, while this has no impact on other users.
   *  - (Default) `false`：No. All local conversations and all messages in them will be cleared, while those on the server remain.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Pins a message.
   *
   * @param messageId The message ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Unpins a message.
   *
   * @param messageId The message ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the list of pinned messages in the conversation from the server.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of pinned messages. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the pinned messages in a local conversation.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isChatThread Whether the conversation is a thread conversation.
   *
   * @returns The list of pinned messages. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the pinning information of a message.
   *
   * @param messageId The message ID.
   * @returns The message pinning information. If the message does not exit or is not pinned, `undefined` is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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

  /**
   * Searches for messages.
   *
   * @params - params
   * - msgTypes: The message types to search for. See {@link ChatMessageType}.
   * - timestamp: The timestamp of the message to search for.
   * - count: The number of messages to search for. The value range is [1,100]. The default value is 20.
   * - from: The message ID to start searching from.
   * - direction: The search direction. See {@link ChatSearchDirection}.
   * - isChatThread: Whether the conversation is a thread conversation.
   *
   * @returns The list of messages that meet the search criteria.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async searchMessages(params: {
    msgTypes: ChatMessageType[];
    timestamp: number;
    count?: number;
    from?: string;
    direction?: ChatSearchDirection;
    isChatThread?: boolean;
  }): Promise<ChatMessage[]> {
    chatlog.log(`${ChatManager.TAG}: searchMessages:`, params);
    const { direction = ChatSearchDirection.UP } = params;
    let r: any = await Native._callMethod(MTsearchMessages, {
      [MTsearchMessages]: {
        types: params.msgTypes,
        timestamp: params.timestamp,
        count: params.count ?? 20,
        from: params.from,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        isChatThread: params.isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const nativeReturn = r?.[MTsearchMessages];
    const ret: ChatMessage[] = [];
    if (nativeReturn) {
      Object.entries(nativeReturn).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * Searches for messages in a conversation.
   *
   * @params - params
   * - convId: The conversation ID.
   * - convType: The conversation type. See {@link ChatConversationType}.
   * - msgTypes: The message types to search for. See {@link ChatMessageType}.
   * - timestamp: The timestamp of the message to search for.
   * - count: The number of messages to search for. The value range is [1,100]. The default value is 20.
   * - from: The message ID to start searching from.
   * - direction: The search direction. See {@link ChatSearchDirection}.
   * - isChatThread: Whether the conversation is a thread conversation.
   *
   * @returns The list of messages that meet the search criteria.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async searchMessagesInConversation(params: {
    convId: string;
    convType: ChatConversationType;
    msgTypes: ChatMessageType[];
    timestamp: number;
    count?: number;
    from?: string;
    direction?: ChatSearchDirection;
    isChatThread?: boolean;
  }): Promise<ChatMessage[]> {
    chatlog.log(`${ChatManager.TAG}: searchMessagesInConversation:`, params);
    const { direction = ChatSearchDirection.UP } = params;
    let r: any = await Native._callMethod(MTsearchMessagesInConversation, {
      [MTsearchMessagesInConversation]: {
        convId: params.convId,
        convType: params.convType,
        types: params.msgTypes,
        timestamp: params.timestamp,
        count: params.count ?? 20,
        from: params.from,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        isChatThread: params.isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const nativeReturn = r?.[MTsearchMessagesInConversation];
    const ret: ChatMessage[] = [];
    if (nativeReturn) {
      Object.entries(nativeReturn).forEach((value: [string, any]) => {
        ret.push(new ChatMessage(value[1]));
      });
    }
    return ret;
  }

  /**
   * Delete the local and server messages of the current user. The server messages of other users in the single chat or group chat with the user will not be affected and can be obtained through roaming.
   * @param params -
   * - convId: The conversation ID.
   * - convType: The conversation type. See {@link ChatConversationType}.
   * - timestamp: Messages before this timestamp will be deleted.
   * - isChatThread: Whether the conversation is a thread conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeMessagesWithTimestamp(params: {
    convId: string;
    convType: ChatConversationType;
    timestamp: number;
    isChatThread?: boolean;
  }): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: removeMessagesWithTimestamp:`, params);
    let r: any = await Native._callMethod(MTremoveMessagesWithTimestamp, {
      [MTremoveMessagesWithTimestamp]: {
        convId: params.convId,
        convType: params.convType,
        timestamp: params.timestamp,
        isChatThread: params.isChatThread,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Gets the count of messages in the conversation.
   *
   * @params -
   * - convId: The conversation ID.
   * - convType: The conversation type. See {@link ChatConversationType}.
   * - isChatThread: Whether the conversation is a thread conversation.
   * - start: The start timestamp.
   * - end: The end timestamp.
   *
   * @returns The count of messages.
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessageCountWithTimestamp(params: {
    convId: string;
    convType: ChatConversationType;
    start: number;
    end: number;
    isChatThread?: boolean;
  }): Promise<number> {
    chatlog.log(`${ChatManager.TAG}: getMessageCountWithTimestamp:`, params);
    let r: any = await Native._callMethod(MTgetMessageCountWithTimestamp, {
      [MTgetMessageCountWithTimestamp]: {
        ...params,
      },
    });
    ChatManager.checkErrorFromResult(r);
    return r?.[MTgetMessageCountWithTimestamp];
  }

  /**
   * Gets the count of messages in the local database.
   *
   * @returns The count of messages.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessageCount(): Promise<number> {
    chatlog.log(`${ChatManager.TAG}: getMessageCount: `);
    let r: any = await Native._callMethod(MTgetMessageCount);
    Native.checkErrorFromResult(r);
    return r?.[MTgetMessageCount] as number;
  }
}
