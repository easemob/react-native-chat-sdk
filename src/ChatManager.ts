import type { NativeEventEmitter } from 'react-native';
import type { ChatMessageEventListener } from './ChatEvents';
import { chatlog } from './common/ChatLog';
import {
  ChatConversation,
  ChatConversationType,
  ChatSearchDirection,
} from './common/ChatConversation';
import { ChatCursorResult } from './common/ChatCursorResult';
import { ChatError } from './common/ChatError';
import { ChatGroupMessageAck } from './common/ChatGroup';
import {
  ChatMessage,
  ChatMessageChatType,
  ChatMessageStatus,
  ChatMessageStatusCallback,
  ChatMessageType,
} from './common/ChatMessage';
import { ChatTranslateLanguage } from './common/ChatTranslateLanguage';
import { BaseManager } from './__internal__/Base';
import {
  MTackConversationRead,
  MTackGroupMessageRead,
  MTackMessageRead,
  MTasyncFetchGroupAcks,
  MTdeleteRemoteConversation,
  MTdownloadAttachment,
  MTdownloadThumbnail,
  MTfetchHistoryMessages,
  MTgetMessage,
  MTgetUnreadMessageCount,
  MTimportMessages,
  MTmarkAllChatMsgAsRead,
  MTonCmdMessagesReceived,
  MTonConversationHasRead,
  MTonConversationUpdate,
  MTonGroupMessageRead,
  MTonMessagesDelivered,
  MTonMessagesRead,
  MTonMessagesRecalled,
  MTonMessagesReceived,
  MTrecallMessage,
  MTresendMessage,
  MTsearchChatMsgFromDB,
  MTsendMessage,
  MTupdateChatMessage,
  MTappendMessage,
  MTclearAllMessages,
  MTgetLatestMessage,
  MTgetLatestMessageFromOthers,
  MTgetUnreadMsgCount,
  MTinsertMessage,
  MTloadMsgWithId,
  MTloadMsgWithKeywords,
  MTloadMsgWithMsgType,
  MTloadMsgWithStartId,
  MTmarkAllMessagesAsRead,
  MTmarkMessageAsRead,
  MTremoveMessage,
  MTupdateConversationMessage,
  MTdeleteConversation,
  MTgetConversation,
  MTgetConversationsFromServer,
  MTloadAllConversations,
  MTloadMsgWithTime,
  MTtranslateMessage,
  MTfetchSupportLanguages,
  // MTsyncConversationName,
  MTaddReaction,
  MTremoveReaction,
  MTfetchReactionList,
  MTfetchReactionDetail,
  MTreportMessage,
  MTonReadAckForGroupMessageUpdated,
  MTmessageReactionDidChange,
  MTgetReactionList,
  MTgroupAckCount,
  MTonChatThreadCreated,
  MTonChatThreadDestroyed,
  MTonChatThreadUpdated,
  MTonChatThreadUserRemoved,
  MTfetchChatThreadDetail,
  MTcreateChatThread,
  MTjoinChatThread,
  MTdestroyChatThread,
  MTleaveChatThread,
  MTupdateChatThreadSubject,
  MTremoveMemberFromChatThread,
  MTfetchChatThreadMember,
  MTfetchJoinedChatThreads,
  MTfetchChatThreadsWithParentId,
  MTfetchJoinedChatThreadsWithParentId,
  MTfetchLastMessageWithChatThreads,
  MTgetMessageThread,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import {
  ChatMessageReaction,
  ChatMessageReactionEvent,
} from './common/ChatMessageReaction';
import {
  ChatMessageThread,
  ChatMessageThreadEvent,
} from './common/ChatMessageThread';

/**
 * The chat manager class, responsible for sending and receiving messages, loading and deleting conversations, and downloading attachments.
 *
 * The sample code for sending a text message:
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
  }

  private onMessagesReceived(messages: any[]): void {
    chatlog.log(`${ChatManager.TAG}: onMessagesReceived: `, messages);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let list: Array<ChatMessage> = [];
      messages.forEach((message: any) => {
        let m = ChatMessage.createReceiveMessage(message);
        list.push(m);
      });
      listener.onMessagesReceived(list);
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
      listener.onCmdMessagesReceived(list);
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
      listener.onMessagesRead(list);
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
      listener.onGroupMessageRead(messages);
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
      listener.onMessagesDelivered(list);
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
      listener.onMessagesRecalled(list);
    });
  }
  private onConversationsUpdate(): void {
    chatlog.log(`${ChatManager.TAG}: onConversationsUpdate: `);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onConversationsUpdate();
    });
  }
  private onConversationHasRead(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onConversationHasRead: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let from = params?.from;
      let to = params?.to;
      listener.onConversationRead(from, to);
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
        list.push(
          new ChatMessageReactionEvent({
            convId: convId,
            msgId: msgId,
            reactions: ll,
          })
        );
      });
      listener.onMessageReactionDidChange(list);
    });
  }

  private onChatMessageThreadCreated(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onChatMessageThreadCreated: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onChatMessageThreadCreated(new ChatMessageThreadEvent(params));
    });
  }

  private onChatMessageThreadUpdated(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onChatMessageThreadUpdated: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onChatMessageThreadUpdated(new ChatMessageThreadEvent(params));
    });
  }

  private onChatMessageThreadDestroyed(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onChatMessageThreadDestroyed: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onChatMessageThreadDestroyed(new ChatMessageThreadEvent(params));
    });
  }

  private onChatMessageThreadUserRemoved(params: any): void {
    chatlog.log(`${ChatManager.TAG}: onChatMessageThreadUserRemoved: `, params);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onChatMessageThreadUserRemoved(
        new ChatMessageThreadEvent(params)
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
   * Adds a message listener.
   * @param listener The listener to be added.
   */
  public addMessageListener(listener: ChatMessageEventListener): void {
    chatlog.log(`${ChatManager.TAG}: addMessageListener: `);
    this._messageListeners.add(listener);
  }

  /**
   * Removes the message listener.
   * @param listener The listener to be deleted.
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
   * For a voice or image or a message with an attachment, the SDK will automatically upload the attachment.
   * You can determine whether to upload the attachment to the chat sever by setting {@link ChatOptions}.
   * @param message The message object to be sent. It is required.
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
   * **Warning**
   * This method only takes effect if you set {@link ChatOptions#requireAck(bool)} as `true`.
   *
   * **Note**
   * To send the group message read receipt, call {@link #sendGroupMessageReadAck(String, String, String)}.
   *
   * We recommend that you call {@link #sendConversationReadAck(String)} when entering a chat page, and call this method to reduce the number of method calls.
   *
   * @param message The failed message.
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
   * You can call the method only after setting the following method: {@link ChatOptions#requireAck(bool)} and {@link ChatMessage#needGroupAck(bool)}.
   *
   * **Note**
   * - This method takes effect only after you set {@link ChatOptions#requireAck} and {@link ChatMessage#needGroupAck} as `true`.
   * - This method applies to group messages only. To send a one-to-one chat message receipt, call {@link sendMessageReadAck}; to send a conversation receipt, call {@link sendConversationReadAck}.
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
   * Sends the conversation read receipt to the server. This method is valid only for one-to-one chat conversations.
   *
   * This method informs the server to set the unread messages count of the conversation to `0`. In multi-device scenarios, all the devices receive the {@link ChatMessageEventListener#onConversationRead(String, String)} callback.
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
   * Recalls the sent message.
   *
   * @param msgId The message ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Loads a message from the local database by message ID.
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
   * Marks all messages as read.
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
  public async getUnreadMessageCount(): Promise<number> {
    chatlog.log(`${ChatManager.TAG}: getUnreadMessageCount: `);
    let r: any = await Native._callMethod(MTgetUnreadMessageCount);
    Native.checkErrorFromResult(r);
    return r?.[MTgetUnreadMessageCount] as number;
  }

  /**
   * Updates the local message.
   *
   * @param message The message will be updated both in the cache and local database.
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
   * Before importing, ensure that the message sender or recipient is the current user.
   *
   * @param messages The message list.
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
   * Downloads the attachment files from the server.
   *
   * You can call the method again if the attachment download fails.
   *
   * @param message The message with the attachment that is to be downloaded.
   * @param callback The listener that Listen for message changes.
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
   * Downloads the thumbnail.
   *
   * @param message The message object.
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
   * Gets historical messages of the conversation from the server with pagination.
   *
   * @param convId The conversation ID.
   * @param chatType The conversation type. See {@link ChatConversationType}.
   * @param pageSize The number of messages that you expect to get on each page.
   * @param startMsgId The ID of the message from which you start to get the historical messages. If `null` is passed, the SDK gets messages in reverse chronological order.
   * @returns The obtained messages and the cursor for the next query.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchHistoryMessages(
    convId: string,
    chatType: ChatConversationType,
    pageSize: number = 20,
    startMsgId: string = ''
  ): Promise<ChatCursorResult<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: fetchHistoryMessages: ${convId}, ${chatType}, ${pageSize}, ${startMsgId}`
    );
    let r: any = await Native._callMethod(MTfetchHistoryMessages, {
      [MTfetchHistoryMessages]: {
        convId: convId,
        type: chatType as number,
        pageSize: pageSize,
        startMsgId: startMsgId,
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
   * Retrieves messages from the database according to the parameters.
   *
   * **Note**
   * Pay attention to the memory usage when the maxCount is large. Currently, a maximum of 400 historical messages can be retrieved each time.
   * @param keywords The keywords in message.
   * @param timestamp The Unix timestamp for search, in milliseconds.
   * @param maxCount The maximum number of messages to retrieve each time.
   * @param from A user ID or group ID at which the retrieval is targeted. Usually, it is the conversation ID.
   * @param direction The message search direction.
   * @returns The list of messages.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets read receipts for group messages from the server with pagination.
   *
   * For how to send read receipts for group messages, see {@link {@link #sendConversationReadAck(String)}.
   *
   * @param msgId The message ID.
   * @param startAckId The starting read receipt ID for query. If you set it as null, the SDK retrieves the read receipts in the reverse chronological order of when the server receives the read receipts.
   * @param pageSize The number of read receipts that you expect to get on each page.
   * @returns The list of obtained read receipts and the cursor for the next query.
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
   * Deletes the specified conversation and the related historical messages from the server.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param isDeleteMessage Whether to delete the historical messages with the conversation.
   * - `true`: (Default) Yes.
   * - `false`: No.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteRemoteConversation(
    convId: string,
    convType: ChatConversationType,
    isDeleteMessage: boolean = true
  ): Promise<void> {
    chatlog.log(
      `${ChatManager.TAG}: deleteRemoteConversation: ${convId}, ${convType}, ${isDeleteMessage}`
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
   * @param convType The conversation type: {@link ChatConversationType}.
   * @param createIfNeed Whether to create a conversation if the specified conversation is not found:
   * - `true`: Yes.
   * - `false`: No.
   *
   * @returns The conversation object found according to the conversation ID and type. Returns null if the conversation is not found.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        type: convType as number,
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
   * Gets all conversations from the local database.
   *
   * Conversations will be first loaded from the memory. If no conversation is found, the SDK loads from the local database.
   *
   * @returns All the conversations from the the local memory or local database.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async loadAllConversations(): Promise<Array<ChatConversation>> {
    chatlog.log(`${ChatManager.TAG}: loadAllConversations:`);
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
   * Gets the conversation list from the server.
   *
   * To use this function, you need to contact our business manager to activate it.
   * After this function is activated, users can pull 10 conversations within 7 days by default (each conversation contains the latest historical message).
   * If you want to adjust the number of conversations or time limit, please contact our business manager.
   *
   * @returns The conversation list of the current user.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getConversationsFromServer(): Promise<Array<ChatConversation>> {
    chatlog.log(`${ChatManager.TAG}: getConversationsFromServer:`);
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
   * Deletes a conversation and its related messages from the local database.
   *
   * If you set `deleteMessages` to `true`, the local historical messages are deleted with the conversation.
   *
   * @param convId The conversation ID.
   * @param withMessage Whether to delete the historical messages with the conversation.
   * - `true`: (Default) Yes.
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
   * Gets the lastest message from the conversation.
   *
   * The operation does not change the unread message count.
   *
   * The SDK gets the latest message from the local memory first. If no message is found, the SDK loads the message from the local database and then puts it in the memory.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @returns The message instance. Returns undefined if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchLatestMessage(
    convId: string,
    convType: ChatConversationType
  ): Promise<ChatMessage | undefined> {
    chatlog.log(`${ChatManager.TAG}: latestMessage: `, convId, convType);
    let r: any = await Native._callMethod(MTgetLatestMessage, {
      [MTgetLatestMessage]: {
        convId: convId,
        type: convType,
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
   * Gets the latest message from the conversation.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @returns The message instance. Returns undefined if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchLastReceivedMessage(
    convId: string,
    convType: ChatConversationType
  ): Promise<ChatMessage | undefined> {
    chatlog.log(`${ChatManager.TAG}: lastReceivedMessage: `, convId, convType);
    let r: any = await Native._callMethod(MTgetLatestMessageFromOthers, {
      [MTgetLatestMessageFromOthers]: {
        convId: convId,
        type: convType,
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
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @returns The unread message count of the conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async unreadCount(
    convId: string,
    convType: ChatConversationType
  ): Promise<number> {
    chatlog.log(`${ChatManager.TAG}: unreadCount: `, convId, convType);
    let r: any = await Native._callMethod(MTgetUnreadMsgCount, {
      [MTgetUnreadMsgCount]: {
        convId: convId,
        type: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: number = r?.[MTgetUnreadMsgCount] as number;
    return ret;
  }

  /**
   * Marks a message as read.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param msgId The message id.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        type: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Marks all messages as read.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        type: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Inserts a message to a conversation in the local database and the SDK will automatically update the latest message.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param msg The message instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async insertMessage(
    convId: string,
    convType: ChatConversationType,
    msg: ChatMessage
  ): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: insertMessage: `, convId, convType, msg);
    let r: any = await Native._callMethod(MTinsertMessage, {
      [MTinsertMessage]: {
        convId: convId,
        type: convType,
        msg: msg,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Inserts a message to the end of a conversation in the local database.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param msg The message instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async appendMessage(
    convId: string,
    convType: ChatConversationType,
    msg: ChatMessage
  ): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: appendMessage: `, convId, convType, msg);
    let r: any = await Native._callMethod(MTappendMessage, {
      [MTappendMessage]: {
        convId: convId,
        type: convType,
        msg: msg,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Updates a message in the local database.
   *
   * The latest Message of the conversation and other properties will be updated accordingly. The message ID of the message, however, remains the same.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param msg The message instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        type: convType,
        msg: msg,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Deletes a message in the local database.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param msgId The ID of message to be deleted.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        type: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Deletes all the messages of the conversation from both the memory and local database.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteAllMessages(
    convId: string,
    convType: ChatConversationType
  ): Promise<void> {
    chatlog.log(`${ChatManager.TAG}: deleteAllMessages: `, convId, convType);
    let r: any = await Native._callMethod(MTclearAllMessages, {
      [MTclearAllMessages]: {
        convId: convId,
        type: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Gets the message with a specific message ID.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param msgId The message ID.
   * @returns The message instance. Returns undefined if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessageById(
    convId: string,
    convType: ChatConversationType,
    msgId: string
  ): Promise<ChatMessage | undefined> {
    chatlog.log(
      `${ChatManager.TAG}: getMessageById: `,
      convId,
      convType,
      msgId
    );
    let r: any = await Native._callMethod(MTloadMsgWithId, {
      [MTloadMsgWithId]: {
        convId: convId,
        type: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTloadMsgWithId];
    if (rr) {
      return new ChatMessage(rr);
    }
    return undefined;
  }

  /**
   * Retrieves messages from the database according to the following parameters: the message type, the Unix timestamp, max count, sender.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param msgType The message type, see {@link ChatMessageType}
   * @param direction The direction in which the message is loaded: ChatSearchDirection.
   * - `ChatSearchDirection.Up`: Messages are retrieved in the reverse chronological order of when the server received messages.
   * - `ChatSearchDirection.Down`: Messages are retrieved in the chronological order of when the server received messages.
   * @param timestamp The Unix timestamp for the search.
   * @param count The max number of messages to search.
   * @param sender The sender of the message. The param can also be used to search in group chat or chat room.
   * @returns The message list. but, maybe is empty list.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        type: convType,
        msg_type: msgType,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        timestamp: timestamp,
        count: count,
        sender: sender,
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
   * Loads multiple messages from the local database.
   *
   * Loads messages from the local database before the specified message.
   *
   * The loaded messages will also join the existing messages of the conversation stored in the memory.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param startMsgId The starting message ID. Message loaded in the memory before this message ID will be loaded. If the `startMsgId` is set as "" or null, the SDK will first load the latest messages in the database.
   * @param direction The direction in which the message is loaded: ChatSearchDirection.
   * @param loadCount The number of messages per page.
   * @returns The message list. but, maybe is empty list.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        type: convType,
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
   * Loads messages from the local database by the following parameters: keywords, timestamp, max count, sender, search direction.
   *
   * **Note**
   * Pay attention to the memory usage when the maxCount is large.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param keywords The keywords in message.
   * @param direction The direction in which the message is loaded: ChatSearchDirection.
   * @param timestamp The timestamp for search.
   * @param count The maximum number of messages to search.
   * @param sender The message sender. The param can also be used to search in group chat.
   * @returns The message list. but, maybe is empty list.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
        type: convType,
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
   * Loads messages from the local database according the following parameters: start timestamp, end timestamp, count.
   *
   * **Note**
   * Pay attention to the memory usage when the maxCount is large.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param startTime The starting Unix timestamp for search.
   * @param endTime The ending Unix timestamp for search.
   * @param direction The direction in which the message is loaded: ChatSearchDirection.
   * @param count The maximum number of message to retrieve.
   * @returns The list of searched messages.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessagesFromTime(
    convId: string,
    convType: ChatConversationType,
    startTime: number,
    endTime: number,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    count: number = 20
  ): Promise<Array<ChatMessage>> {
    chatlog.log(
      `${ChatManager.TAG}: getMessagesFromTime: `,
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
        type: convType,
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
   * Translate a message.
   *
   * @param msg The message object
   * @param languages The target languages to translate
   * @returns Translated Message
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
   * Fetch all languages what the translate service support
   *
   * @returns Supported languages list.
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
   * Set custom properties for the conversation.
   *
   * @param convId The conversation id.
   * @param convType The conversation type.
   * @param ext The custom attribute.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  // public async setConversationExtension(
  //   convId: string,
  //   convType: ChatConversationType,
  //   ext: any
  // ): Promise<void> {
  //   chatlog.log(
  //     `${ChatManager.TAG}: setConversationExtension: `,
  //     convId,
  //     convType,
  //     ext
  //   );
  //   let r: any = await Native._callMethod(MTsyncConversationName, {
  //     [MTsyncConversationName]: {
  //       convId: convId,
  //       type: convType,
  //       ext: ext,
  //     },
  //   });
  //   ChatManager.checkErrorFromResult(r);
  // }

  /**
   * Adds a reaction.
   *
   * @param reaction The reaction content.
   * @param msgId The message ID.
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
   * Deletes a reaction.
   *
   * @param reaction The message reaction.
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
   * @returns The Reaction list under the specified message ID（The UserList of ChatMessageReaction is the summary data, which only contains the information of the first three users）.
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
   * Gets the reaction details.
   *
   * @param msgId The message ID.
   * @param reaction The reaction content.
   * @param cursor The cursor position from which to get Reactions.
   * @param pageSize The number of Reactions you expect to get on each page.
   * @returns The result callback, which contains the reaction list obtained from the server and the cursor for the next query. Returns null if all the data is fetched.
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
   * Report violation message
   *
   * @param msgId Violation Message ID
   * @param tag Report type (For example: involving pornography and terrorism)
   * @param reason Report Reason.
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
   * Gets the list of Reactions from message.
   *
   * @param msgId The message id.
   * @returns The reaction list.
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
    Object.entries(r?.[MTgetReactionList]).forEach((value: [string, any]) => {
      ret.push(new ChatMessageReaction(value[1]));
    });
    return ret;
  }

  /**
   * Get the group message read count.
   *
   * @param msgId The message id.
   * @returns The group message count.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Create Chat Thread.
   * Group members have permission.
   *
   * After chat thread is created, the following notices will appear:
   *
   * 1. Members of the organization (group) to which chat thread belongs will receive the created notification event, and can listen to related events by setting {@link ChatMessageEventListener}. The event callback function is {@link ChatMessageEventListener#onChatMessageThreadCreated(ChatMessageThreadEvent)}.
   * 2. Multiple devices will receive the notification event and you can set {@link ChatMultiDeviceEventListener} to listen on the event. The event callback function is {@link ChatMultiDeviceEventListener#onThreadEvent(int, String, List)}, where the first parameter is the event, for example, {@link ChatMultiDeviceEventListener#THREAD_CREATE} for the chat thread creation event.
   * @param name Chat Thread name. No more than 64 characters in length.
   * @param msgId Parent message ID, generally refers to group message ID.
   * @param parentId Parent ID, generally refers to group ID.
   * @returns Returns the created thread object if successful.
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
   * Join Chat Thread.
   * Group members have permission.
   *
   * Join successfully, return the Chat Thread details {@link EMChatThread}, the details do not include the number of members. Repeated addition will result in an error with the error code {@link EMError#USER_ALREADY_EXIST}. After joining chat thread, the multiple devices will receive the notification event. You can set {@link EMMultiDeviceListener} to listen on the event.
   * The event callback function is {@link EMMultiDeviceListener#onThreadEvent(int, String, List), where the first parameter is the event, and chat thread join event is {@link EMMultiDeviceListener#THREAD_JOIN}.
   *
   * @param chatThreadId Chat Thread ID.
   * @returns Returns the thread object if successful.
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
   * Leave Chat Thread.
   * The operation is available to Chat Thread members.
   * After joining chat thread, the multiple devices will receive the notification event.
   * You can set {@link com.hyphenate.EMMultiDeviceListener} to listen on the event. The event callback function is {@link com.hyphenate.EMMultiDeviceListener#onThreadEvent(int, String, List), where the first parameter is the event, and chat thread exit event is {@link com.hyphenate.EMMultiDeviceListener#THREAD_LEAVE}.
   *
   * @param chatThreadId Chat Thread ID.
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
   * Disband Chat Thread.
   * Group owner and group administrator to which the Chat Thread belongs have permission.
   *
   * After chat thread is disbanded, there will be the following notification:
   * 1. Members of the organization (group) to which chat thread belongs will receive the disbanded notification event, and can listen to related events by setting {@link EMChatThreadChangeListener}. The event callback function is {@link EMChatThreadChangeListener#onChatThreadDestroyed(EMChatThreadEvent)}.
   * 2. Multiple devices will receive the notification event and you can set {@link com.hyphenate.EMMultiDeviceListener} to listen on the event. The event callback function is {@link com.hyphenate.EMMultiDeviceListener#onThreadEvent(int, String, List)}, where the first parameter is the event, for example, {@link com.hyphenate.EMMultiDeviceListener#THREAD_DESTROY} for the chat thread destruction event.
   *
   * @param chatThreadId Chat Thread ID.
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
   * Update Chat Thread name.
   * The group owner, group administrator and Thread creator have permission.
   * After modifying chat thread name, members of the organization (group) to which chat thread belongs will receive the update notification event.
   * You can set {@link EMChatThreadChangeListener} to listen on the event.
   * The event callback function is {@link EMChatThreadChangeListener#onChatThreadUpdated(EMChatThreadEvent)} .
   *
   * @param chatThreadId Chat Thread ID.
   * @param newName New Chat Thread name. No more than 64 characters in length.
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
   * Remove member from Chat Thread.
   * Group owner and group administrator to which Chat Thread belongs have permission.
   * The removed chat thread members will receive the removed notification event.
   * You can set {@link EMChatThreadChangeListener} to listen on the event.
   * The event callback function is {@link EMChatThreadChangeListener#onChatThreadUserRemoved(EMChatThreadEvent)}.
   *
   * @param chatThreadId Chat Thread ID.
   * @param memberId The ID of the member that was removed from Chat Thread.
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
   * Paging to get Chat Thread members.
   * The members of the group to which Chat Thread belongs have permission.
   *
   * @param chatThreadId Chat Thread ID.
   * @param cursor Cursor, the initial value can be empty or empty string.
   * @param pageSize The number of fetches at one time. Value range (0, 50].
   * @returns Returns a list if successful, otherwise throws an exception.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Paging to get the list of Chat Threads that the current user has joined from the server.
   *
   * @param cursor Cursor, the initial value can be empty or empty string.
   * @param pageSize The number of fetches at one time. Value range (0, 50].
   * @returns Returns a list if successful, otherwise throws an exception.
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
          return new ChatMessage(param);
        },
      },
    });
    return ret;
  }

  /**
   * Paging to get the list of Chat Threads that the current user has joined the specified group from the server。
   *
   * @param parentId Generally refers to group ID.
   * @param cursor Cursor, the initial value can be empty or empty string.
   * @param pageSize The number of fetches at one time. Value range (0, 50].
   * @returns Returns a list if successful, otherwise throws an exception.
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
          return new ChatMessage(param);
        },
      },
    });
    return ret;
  }

  /**
   * Paging to get the list of Chat Threads of the specified group from the server.
   *
   * @param parentId Generally refers to group ID.
   * @param cursor Cursor, the initial value can be empty or empty string.
   * @param pageSize The number of fetches at one time. Value range (0, 50].
   * @returns Returns a list if successful, otherwise throws an exception.
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
          return new ChatMessage(param);
        },
      },
    });
    return ret;
  }

  /**
   * Get the latest news of the specified Chat Thread list from the server.
   *
   * @param chatThreadIds Chat Thread id list. The list length is not greater than 20.
   * @returns Returns a list if successful, otherwise throws an exception.
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
        threadId: chatThreadIds,
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
   * Get Chat Thread details from server.
   *
   * @param chatThreadId Chat Thread ID.
   * @returns Returns a thread if successful, otherwise a undefined value.
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
   * Get Chat Thread details from message cache.
   *
   * @param msgId The message id.
   * @returns Returns a thread if successful, otherwise a undefined value.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessageThread(
    msgId: string
  ): Promise<ChatMessageThreadEvent | undefined> {
    chatlog.log(`${ChatManager.TAG}: getMessageThread: `, msgId);
    let r: any = await Native._callMethod(MTgetMessageThread, {
      [MTgetMessageThread]: {
        msgId: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTfetchChatThreadDetail];
    if (rr) {
      return new ChatMessageThreadEvent(rr);
    }
    return undefined;
  }
}
