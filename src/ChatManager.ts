import type { NativeEventEmitter } from 'react-native';
import type { ChatMessageEventListener } from './ChatEvents';
import {
  ChatConversation,
  ChatConversationType,
} from './common/ChatConversation';
import { ChatCursorResult } from './common/ChatCursorResult';
import { ChatError } from './common/ChatError';
import { ChatGroupMessageAck } from './common/ChatGroup';
import {
  ChatMessage,
  ChatMessageStatus,
  ChatMessageStatusCallback,
  ChatMessageType,
} from './common/ChatMessage';
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
  MTonMessageError,
  MTonMessageProgressUpdate,
  MTonMessagesDelivered,
  MTonMessagesRead,
  MTonMessagesRecalled,
  MTonMessagesReceived,
  MTonMessageSuccess,
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
} from './__internal__/Consts';
import { Native } from './__internal__/Native';

/**
 * The message search directions.
 */
export enum ChatSearchDirection {
  /**
   * Messages are retrieved in the reverse chronological order of the timestamp included in them.
   */
  UP,
  /**
   * Messages are retrieved in the chronological order of the timestamp included in them.
   */
  DOWN,
}

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
 *      console.log('ConnectScreen.sendMessage.onProgress ', progress);
 *    }
 *    onError(error: ChatError): void {
 *      console.log('ConnectScreen.sendMessage.onError ', error);
 *    }
 *    onSuccess(): void {
 *      console.log('ConnectScreen.sendMessage.onSuccess');
 *    }
 *    onReadAck(): void {
 *      console.log('ConnectScreen.sendMessage.onReadAck');
 *    }
 *    onDeliveryAck(): void {
 *      console.log('ConnectScreen.sendMessage.onDeliveryAck');
 *    }
 *    onStatusChanged(status: ChatMessageStatus): void {
 *      console.log('ConnectScreen.sendMessage.onStatusChanged ', status);
 *    }
 *  })();
 *  ChatClient.getInstance()
 *    .chatManager.sendMessage(msg, callback)
 *    .then((nmsg: ChatMessage) => {
 *      console.log(`${msg}, ${nmsg}`);
 *    })
 *    .catch();
 *  ```
 */
export class ChatManager extends Native {
  static TAG = 'ChatManager';

  private _messageListeners: Set<ChatMessageEventListener>;
  private _eventEmitter?: NativeEventEmitter;

  constructor() {
    super();
    this._messageListeners = new Set<ChatMessageEventListener>();
  }

  public setNativeListener(eventEmitter: NativeEventEmitter) {
    this._eventEmitter = eventEmitter;
    eventEmitter.removeAllListeners(MTonMessagesReceived);
    eventEmitter.addListener(
      MTonMessagesReceived,
      this.onMessagesReceived.bind(this)
    );
    eventEmitter.removeAllListeners(MTonCmdMessagesReceived);
    eventEmitter.addListener(
      MTonCmdMessagesReceived,
      this.onCmdMessagesReceived.bind(this)
    );
    eventEmitter.removeAllListeners(MTonMessagesRead);
    eventEmitter.addListener(MTonMessagesRead, this.onMessagesRead.bind(this));
    eventEmitter.removeAllListeners(MTonGroupMessageRead);
    eventEmitter.addListener(
      MTonGroupMessageRead,
      this.onGroupMessageRead.bind(this)
    );
    eventEmitter.removeAllListeners(MTonMessagesDelivered);
    eventEmitter.addListener(
      MTonMessagesDelivered,
      this.onMessagesDelivered.bind(this)
    );
    eventEmitter.removeAllListeners(MTonMessagesRecalled);
    eventEmitter.addListener(
      MTonMessagesRecalled,
      this.onMessagesRecalled.bind(this)
    );
    eventEmitter.removeAllListeners(MTonConversationUpdate);
    eventEmitter.addListener(
      MTonConversationUpdate,
      this.onConversationsUpdate.bind(this)
    );
    eventEmitter.removeAllListeners(MTonConversationHasRead);
    eventEmitter.addListener(
      MTonConversationHasRead,
      this.onConversationHasRead.bind(this)
    );
  }

  private onMessagesReceived(messages: any[]): void {
    console.log(`${ChatManager.TAG}: onMessagesReceived: ${messages}`);
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
    console.log(`${ChatManager.TAG}: onCmdMessagesReceived: ${messages}`);
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
    console.log(`${ChatManager.TAG}: onMessagesRead: ${messages}`);
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
    console.log(`${ChatManager.TAG}: onGroupMessageRead: ${messages}`);
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
    console.log(`${ChatManager.TAG}: onMessagesDelivered: ${messages}`);
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
    console.log(`${ChatManager.TAG}: onMessagesRecalled: ${messages}`);
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
    console.log(`${ChatManager.TAG}: onConversationsUpdate: `);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      listener.onConversationsUpdate();
    });
  }
  private onConversationHasRead(params: any): void {
    console.log(`${ChatManager.TAG}: onConversationHasRead: ${params}`);
    this._messageListeners.forEach((listener: ChatMessageEventListener) => {
      let from = params?.from;
      let to = params?.to;
      listener.onConversationRead(from, to);
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

  private static handleMessageCallback(
    methodName: string,
    self: ChatManager,
    message: ChatMessage,
    callback?: ChatMessageStatusCallback
  ): void {
    if (callback && self._eventEmitter) {
      const subscription = self._eventEmitter.addListener(
        methodName,
        (params: any) => {
          const localMsgId: string = params.localTime.toString();
          console.log(
            `${ChatManager.TAG}: handleMessageCallback: ${methodName}: ${localMsgId}`
          );
          if (message.localMsgId === localMsgId) {
            const callbackType: String = params.callbackType;
            if (callbackType === MTonMessageSuccess) {
              const m = params.message;
              callback.onSuccess(new ChatMessage(m));
              subscription.remove();
            } else if (callbackType === MTonMessageError) {
              const e = params.error;
              callback.onError(localMsgId, new ChatError(e));
              subscription.remove();
            } else if (callbackType === MTonMessageProgressUpdate) {
              const progress: number = params.progress;
              callback.onProgress(localMsgId, progress);
            }
          }
        }
      );
    }
  }

  /**
   * Adds a message listener.
   * @param listener The message listener.
   */
  public addMessageListener(listener: ChatMessageEventListener): void {
    this._messageListeners.add(listener);
  }

  /**
   * Removes the message listener.
   * @param listener The message listener.
   */
  public removeMessageListener(listener: ChatMessageEventListener): void {
    this._messageListeners.delete(listener);
  }

  /**
   * Removes all message listeners.
   */
  public removeAllMessageListener(): void {
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
    console.log(
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
    console.log(
      `${ChatManager.TAG}: resendMessage: ${message.msgId}, ${message.localTime}`
    );
    if (
      message.msgId !== message.localMsgId &&
      message.status === ChatMessageStatus.SUCCESS
    ) {
      callback.onError(
        message.localMsgId,
        new ChatError({ code: 1, description: 'message has send success' })
      );
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
    console.log(
      `${ChatManager.TAG}: sendMessageReadAck: ${message.msgId}, ${message.localTime}`
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
    console.log(
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
    console.log(`${ChatManager.TAG}: sendConversationReadAck: ${convId}`);
    let r: any = await Native._callMethod(MTackConversationRead, {
      [MTackConversationRead]: {
        con_id: convId,
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
    console.log(`${ChatManager.TAG}: recallMessage: ${msgId}`);
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
  public async getMessage(msgId: string): Promise<ChatMessage | null> {
    console.log(`${ChatManager.TAG}: getMessage: ${msgId}`);
    let r: any = await Native._callMethod(MTgetMessage, {
      [MTgetMessage]: {
        msg_id: msgId,
      },
    });
    Native.checkErrorFromResult(r);
    console.log('r: ', r);
    r = r?.[MTgetMessage];
    if (r) {
      return new ChatMessage(r);
    } else {
      return null;
    }
  }

  /**
   * Marks all messages as read.
   *
   * This method is for the local conversations only.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async markAllConversationsAsRead(): Promise<void> {
    console.log(`${ChatManager.TAG}: markAllConversationsAsRead: `);
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
    console.log(`${ChatManager.TAG}: getUnreadMessageCount: `);
    let r: any = await Native._callMethod(MTgetUnreadMessageCount);
    Native.checkErrorFromResult(r);
    return r?.[MTgetUnreadMessageCount] as number;
  }

  /**
   * Updates the local message.
   *
   * @param message The message will be updated both in the cache and local database.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateMessage(message: ChatMessage): Promise<void> {
    console.log(
      `${ChatManager.TAG}: updateMessage: ${message.msgId}, ${message.localTime}`
    );
    let r: any = await Native._callMethod(MTupdateChatMessage, {
      [MTupdateChatMessage]: {
        message: message,
      },
    });
    Native.checkErrorFromResult(r);
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
    console.log(`${ChatManager.TAG}: importMessages: ${messages.length}`);
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
    console.log(
      `${ChatManager.TAG}: downloadAttachment: ${message.msgId}, ${message.localTime}`
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
    console.log(
      `${ChatManager.TAG}: downloadThumbnail: ${message.msgId}, ${message.localTime}`
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
    console.log(
      `${ChatManager.TAG}: fetchHistoryMessages: ${convId}, ${chatType}, ${pageSize}, ${startMsgId}`
    );
    let r: any = await Native._callMethod(MTfetchHistoryMessages, {
      [MTfetchHistoryMessages]: {
        con_id: convId,
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
    console.log(
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
    (r?.[MTsearchChatMsgFromDB] as Array<any>).forEach((element) => {
      ret.push(new ChatMessage(element));
    });
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
    console.log(
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
   * - (Default) `true`: Yes.
   * - `false`: No.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteRemoteConversation(
    convId: string,
    convType: ChatConversationType,
    isDeleteMessage: boolean = true
  ): Promise<void> {
    console.log(
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
        throw new Error('no have this type');
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
  ): Promise<ChatConversation> {
    console.log(
      `${ChatManager.TAG}: getConversation: ${convId}, ${convType}, ${createIfNeed}`
    );
    let r: any = await Native._callMethod(MTgetConversation, {
      [MTgetConversation]: {
        con_id: convId,
        type: convType as number,
        createIfNeed: createIfNeed,
      },
    });
    Native.checkErrorFromResult(r);
    return new ChatConversation(r?.[MTgetConversation]);
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
    console.log(`${ChatManager.TAG}: loadAllConversations:`);
    let r: any = await Native._callMethod(MTloadAllConversations);
    Native.checkErrorFromResult(r);
    let ret = new Array<ChatConversation>(0);
    (r?.[MTloadAllConversations] as Array<any>).forEach((element) => {
      ret.push(new ChatConversation(element));
    });
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
    console.log(`${ChatManager.TAG}: getConversationsFromServer:`);
    let r: any = await Native._callMethod(MTgetConversationsFromServer);
    Native.checkErrorFromResult(r);
    let ret = new Array<ChatConversation>(0);
    (r?.[MTgetConversationsFromServer] as Array<any>).forEach((element) => {
      ret.push(new ChatConversation(element));
    });
    return ret;
  }

  /**
   * Deletes a conversation and its related messages from the local database.
   *
   * If you set `deleteMessages` to `true`, the local historical messages are deleted with the conversation.
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
    console.log(
      `${ChatManager.TAG}: deleteConversation: ${convId}, ${withMessage}`
    );
    let r: any = await Native._callMethod(MTdeleteConversation, {
      [MTdeleteConversation]: {
        con_id: convId,
        deleteMessages: withMessage,
      },
    });
    Native.checkErrorFromResult(r);
  }

  public async getLatestMessage(
    convId: string,
    convType: ChatConversationType
  ): Promise<ChatMessage> {
    console.log(`${ChatManager.TAG}: latestMessage: `);
    let r: any = await Native._callMethod(MTgetLatestMessage, {
      [MTgetLatestMessage]: {
        con_id: convId,
        type: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage = r?.[MTgetLatestMessage];
    return ret;
  }

  public async getLastReceivedMessage(
    convId: string,
    convType: ChatConversationType
  ): Promise<ChatMessage> {
    console.log(`${ChatManager.TAG}: lastReceivedMessage: `);
    let r: any = await Native._callMethod(MTgetLatestMessageFromOthers, {
      [MTgetLatestMessageFromOthers]: {
        con_id: convId,
        type: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: ChatMessage = r?.[MTgetLatestMessageFromOthers];
    return ret;
  }

  public async unreadCount(
    convId: string,
    convType: ChatConversationType
  ): Promise<number> {
    console.log(`${ChatManager.TAG}: unreadCount: `);
    let r: any = await Native._callMethod(MTgetUnreadMsgCount, {
      [MTgetUnreadMsgCount]: {
        con_id: convId,
        type: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const ret: number = r?.[MTgetUnreadMsgCount];
    return ret;
  }

  public async markMessageAsRead(
    convId: string,
    convType: ChatConversationType,
    msgId: string
  ): Promise<void> {
    console.log(`${ChatManager.TAG}: markMessageAsRead: `);
    let r: any = await Native._callMethod(MTmarkMessageAsRead, {
      [MTmarkMessageAsRead]: {
        con_id: convId,
        type: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  public async markAllMessagesAsRead(
    convId: string,
    convType: ChatConversationType
  ): Promise<void> {
    console.log(`${ChatManager.TAG}: markAllMessagesAsRead: `);
    let r: any = await Native._callMethod(MTmarkAllMessagesAsRead, {
      [MTmarkAllMessagesAsRead]: {
        con_id: convId,
        type: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  public async insertMessage(
    convId: string,
    convType: ChatConversationType,
    msg: ChatMessage
  ): Promise<void> {
    console.log(`${ChatManager.TAG}: insertMessage: `);
    let r: any = await Native._callMethod(MTinsertMessage, {
      [MTinsertMessage]: {
        con_id: convId,
        type: convType,
        msg: msg,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  public async appendMessage(
    convId: string,
    convType: ChatConversationType,
    msg: ChatMessage
  ): Promise<void> {
    console.log(`${ChatManager.TAG}: appendMessage: `);
    let r: any = await Native._callMethod(MTappendMessage, {
      [MTappendMessage]: {
        con_id: convId,
        type: convType,
        msg: msg,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  public async updateConversationMessage(
    convId: string,
    convType: ChatConversationType,
    msg: ChatMessage
  ): Promise<void> {
    console.log(`${ChatManager.TAG}: updateConversationMessage: `);
    let r: any = await Native._callMethod(MTupdateConversationMessage, {
      [MTupdateConversationMessage]: {
        con_id: convId,
        type: convType,
        msg: msg,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  public async deleteMessage(
    convId: string,
    convType: ChatConversationType,
    msgId: string
  ): Promise<void> {
    console.log(`${ChatManager.TAG}: deleteMessage: ${convId}, ${convType}`);
    let r: any = await Native._callMethod(MTremoveMessage, {
      [MTremoveMessage]: {
        con_id: convId,
        type: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  public async deleteAllMessages(
    convId: string,
    convType: ChatConversationType
  ): Promise<void> {
    console.log(`${ChatManager.TAG}: deleteAllMessages: `);
    let r: any = await Native._callMethod(MTclearAllMessages, {
      [MTclearAllMessages]: {
        con_id: convId,
        type: convType,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  public async getMessageById(
    convId: string,
    convType: ChatConversationType,
    msgId: string
  ): Promise<void> {
    console.log(`${ChatManager.TAG}: getMessageById: `);
    let r: any = await Native._callMethod(MTloadMsgWithId, {
      [MTloadMsgWithId]: {
        con_id: convId,
        type: convType,
        msg_id: msgId,
      },
    });
    ChatManager.checkErrorFromResult(r);
  }

  public async getMessagesWithMsgType(
    convId: string,
    convType: ChatConversationType,
    msgType: ChatMessageType,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string
  ): Promise<Array<ChatMessage>> {
    console.log(`${ChatManager.TAG}: getMessagesWithMsgType: `);
    let r: any = await Native._callMethod(MTloadMsgWithMsgType, {
      [MTloadMsgWithMsgType]: {
        con_id: convId,
        type: convType,
        msg_type: msgType,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        timestamp: timestamp,
        count: count,
        sender: sender,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTloadMsgWithMsgType] as Map<string, ChatMessage>;
    const ret: ChatMessage[] = [];
    rr.forEach((value: ChatMessage) => {
      ret.push(value);
    });
    return ret;
  }

  public async getMessages(
    convId: string,
    convType: ChatConversationType,
    startMsgId: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    loadCount: number = 20
  ): Promise<Array<ChatMessage>> {
    console.log(`${ChatManager.TAG}: getMessages: `);
    let r: any = await Native._callMethod(MTloadMsgWithStartId, {
      [MTloadMsgWithStartId]: {
        con_id: convId,
        type: convType,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        startId: startMsgId,
        count: loadCount,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTloadMsgWithStartId] as Map<string, ChatMessage>;
    const ret: ChatMessage[] = [];
    rr.forEach((value: ChatMessage) => {
      ret.push(value);
    });
    return ret;
  }

  public async getMessagesWithKeyword(
    convId: string,
    convType: ChatConversationType,
    keywords: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string
  ): Promise<Array<ChatMessage>> {
    console.log(`${ChatManager.TAG}: getMessagesWithKeyword: `);
    let r: any = await Native._callMethod(MTloadMsgWithKeywords, {
      [MTloadMsgWithKeywords]: {
        con_id: convId,
        type: convType,
        keywords: keywords,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        timestamp: timestamp,
        count: count,
        sender: sender,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTloadMsgWithKeywords] as Map<string, ChatMessage>;
    const ret: ChatMessage[] = [];
    rr.forEach((value: ChatMessage) => {
      ret.push(value);
    });
    return ret;
  }

  public async getMessagesFromTime(
    convId: string,
    convType: ChatConversationType,
    startTime: number,
    endTime: number,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    count: number = 20
  ): Promise<Array<ChatMessage>> {
    console.log(`${ChatManager.TAG}: getMessagesFromTime: `);
    let r: any = await Native._callMethod(MTloadMsgWithTime, {
      [MTloadMsgWithTime]: {
        con_id: convId,
        type: convType,
        startTime: startTime,
        endTime: endTime,
        direction: direction === ChatSearchDirection.UP ? 'up' : 'down',
        count: count,
      },
    });
    ChatManager.checkErrorFromResult(r);
    const rr = r?.[MTloadMsgWithTime] as Map<string, ChatMessage>;
    const ret: ChatMessage[] = [];
    rr.forEach((value: ChatMessage) => {
      ret.push(value);
    });
    return ret;
  }
}
