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
  MTclearAllMessages,
  MTgetLatestMessage,
  MTgetLatestMessageFromOthers,
  MTgetUnreadMsgCount,
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
  MTsyncConversationExt,
  MTinsertMessage,
  MTdeleteMessagesBeforeTimestamp,
  MTgetThreadConversation,
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
        list.push(
          new ChatMessageReactionEvent({
            convId: convId,
            msgId: msgId,
            reactions: ll,
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
   * @param convId The conversation ID.
   * @param chatType The conversation type. See {@link ChatConversationType}.
   * @param pageSize The number of messages that you expect to get on each page. The value range is [1,400].
   * @param startMsgId The starting message ID for query. After this parameter is set, the SDK retrieves messages, starting from the specified one, in the reverse chronological order of when the server receives them.
   *                   If this parameter is set as "null" or an empty string, the SDK retrieves messages, starting from the latest one, in the reverse chronological order of when the server receives them.
   * @returns The list of retrieved messages (excluding the one with the starting ID) and the cursor for the next query.
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
        convType: chatType as number,
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
   * Retrieves messages with keywords in a conversation from the local database.
   *
   * @param keywords The keywords for query.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * @param maxCount The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param from The user ID or group ID for retrieval. Usually, it is the conversation ID.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   *                  - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   *                  - `ChatSearchDirection.Down`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
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
   *
   * @returns The retrieved conversation object. The SDK returns `null` if the conversation is not found.
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
   *
   * The SDK gets the latest message from the memory first. If no message is found, the SDK loads the message from the local database and then puts it in the memory.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @returns The message instance. The SDK returns `undefined` if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the latest received message from the conversation.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @returns The message instance. The SDK returns `undefined` if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the unread message count of the conversation.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @returns The unread message count.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Marks a message as read.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param msgId The message ID.
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
        convType: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Marks all messages as read.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
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
        convType: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Updates a message in the local database.
   *
   * After you modify a message, the message ID remains unchanged and the SDK automatically updates properties of the conversation, like `latestMessage`.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param msg The ID of the message to update.
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
        convType: convType,
        msg: msg,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Deletes a message from the local database.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param msgId The ID of the message to delete.
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
        convType: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  /**
   * Deletes all messages in the conversation from both the memory and local database.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
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
        convType: convType,
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
   * Retrieves messages of a certain type in the conversation from the local database.
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
   * @param sender The user ID or group ID for retrieval. Usually, it is the conversation ID.
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
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
        convType: convType,
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
   * Retrieves messages of a specified quantity in a conversation from the local database.
   *
   * The retrieved messages will also be put in the conversation in the memory according to the timestamp included in them.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param startMsgId The starting message ID for query. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                   If this parameter is set as "null" or an empty string, the SDK retrieves messages according to the message search direction while ignoring this parameter.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param loadCount The maximum number of messages to retrieve each time. The value range is [1,50].
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
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
   * Gets messages that the specified user sends in a conversation in a certain period.
   *
   * This method gets data from the local database.
   *
   * **Note**
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
   * @param sender The user ID or group ID for retrieval. Usually, it is the conversation ID.
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
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
   * Retrieves messages that are sent and received in a certain period in a conversation in the local database.
   *
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param startTime The starting Unix timestamp for query, in milliseconds.
   * @param endTime The ending Unix timestamp for query, in milliseconds.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @returns The list of retrieved messages (excluding with the ones with the starting or ending timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * @param convId The conversation ID.
   * @param convType The conversation type. See {@link ChatConversationType}.
   * @param ext The extension information. This parameter must be key-value type.
   */
  public async setConversationExtension(
    convId: string,
    convType: ChatConversationType,
    ext: {
      [key: string]: string | number;
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
   * @param msgId The ID of the inappropriate message.
   * @param tag The message content tag. For example, the message is related to pornography or terrorism.
   * @param reason The reason for reporting the message.
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
    Object.entries(r?.[MTgetReactionList]).forEach((value: [string, any]) => {
      ret.push(new ChatMessageReaction(value[1]));
    });
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
}
