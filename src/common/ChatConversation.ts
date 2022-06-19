import { ChatClient } from '../ChatClient';
import { ChatError } from './ChatError';
import type { ChatMessage, ChatMessageType } from './ChatMessage';

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
 * The conversation types.
 */
export enum ChatConversationType {
  /**
   * One-to-one chat.
   */
  PeerChat = 0,
  /**
   * Group chat.
   */
  GroupChat = 1,
  /**
   * Chat room.
   */
  RoomChat = 2,
}

/**
 * Converts the conversation type from int to enum.
 *
 * @param params The conversation type of the int type.
 * @returns The conversation type of the enum type.
 */
export function ChatConversationTypeFromNumber(
  params: number
): ChatConversationType {
  switch (params) {
    case 0:
      return ChatConversationType.PeerChat;
    case 1:
      return ChatConversationType.GroupChat;
    case 2:
      return ChatConversationType.RoomChat;
    default:
      throw new ChatError({
        code: 1,
        description: `This type is not supported. ` + params,
      });
  }
}

/**
 * Converts the conversation type from enum to string.
 *
 * @param params The conversation type of the enum type.
 * @returns The conversation type of the string type.
 */
export function ChatConversationTypeToString(
  params: ChatConversationType
): string {
  return ChatConversationType[params];
}

/**
 * The conversation class, which defines one-to-one conversations, group conversations, and chat room conversations.
 *
 * Each type of conversation involves messages that are sent and received.
 *
 * You can get the conversation name by conversation type:
 * One-to-one chat: See {@link ChatUserInfoManager#fetchUserInfoById}.
 * Group chat: See {@link ChatGroup#getGroupWithId}.
 * Chat room: See {@link ChatRoom#fetchChatRoomInfoFromServer}.
 */
export class ChatConversation {
  /**
   * The conversation ID.
   */
  convId: string;
  /**
   * The conversation type.
   */
  convType: ChatConversationType;
  /**
   * The conversation extension.
   */
  ext?: any;
  constructor(params: {
    convId: string;
    convType: ChatConversationType;
    ext?: any;
  }) {
    this.convId = params.convId;
    this.convType = params.convType;
    this.ext = params.ext;
  }

  /**
   * Gets the conversation ID.
   *
   * @returns The conversation ID.
   */
  public async name(): Promise<string | undefined> {
    if (this.convType === ChatConversationType.PeerChat) {
      const ret = await ChatClient.getInstance().userManager.fetchUserInfoById([
        this.convId,
      ]);
      if (ret.size > 0) {
        return ret.values().next().value.nickName;
      }
    } else if (this.convType === ChatConversationType.GroupChat) {
      const ret =
        await ChatClient.getInstance().groupManager.fetchGroupInfoFromServer(
          this.convId
        );
      if (ret) {
        return ret.groupName;
      }
    } else if (this.convType === ChatConversationType.RoomChat) {
      const ret =
        await ChatClient.getInstance().roomManager.fetchChatRoomInfoFromServer(
          this.convId
        );
      if (ret) {
        return ret.roomName;
      }
    } else {
      throw new ChatError({
        code: 1,
        description: `This type is not supported. ` + this.convType,
      });
    }
    return undefined;
  }

  /**
   * Gets the count of unread messages in the conversation.
   *
   * @returns The count of unread messages.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchUnreadCount(): Promise<number> {
    return ChatClient.getInstance().chatManager.unreadCount(
      this.convId,
      this.convType
    );
  }

  /**
   * Gets the latest message from the conversation.
   *
   * @returns The message instance. The SDK returns `undefined` if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchLatestMessage(): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.fetchLatestMessage(
      this.convId,
      this.convType
    );
  }

  /**
   * Gets the latest message received in the conversation.
   *
   * @returns The message instance. The SDK returns `undefined` if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchLatestReceivedMessage(): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.fetchLastReceivedMessage(
      this.convId,
      this.convType
    );
  }

  /**
   * Gets the extension information of the conversation.
   *
   * @param ext The extension information of the conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  // public async setConversationExtension(ext: any): Promise<void> {
  //   this.ext = ext;
  //   return ChatClient.getInstance().chatManager.setConversationExtension(
  //     this.convId,
  //     this.convType,
  //     this.ext
  //   );
  // }

  /**
   * Marks a message as read.
   *
   * @param msgId The message ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async markMessageAsRead(msgId: string): Promise<void> {
    return ChatClient.getInstance().chatManager.markMessageAsRead(
      this.convId,
      this.convType,
      msgId
    );
  }

  /**
   * Marks all messages as read.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async markAllMessagesAsRead(): Promise<void> {
    return ChatClient.getInstance().chatManager.markAllMessagesAsRead(
      this.convId,
      this.convType
    );
  }

  /**
   * Inserts a message to a conversation in the local database。
   *
   * To insert the message correctly, ensure that the conversation ID of the message is the same as that of the conversation.
   *
   * The message will be inserted based on the Unix timestamp included in it. Upon message insertion, the SDK will automatically update attributes of the conversation, including `latestMessage`.
   *
   * @param msg The message instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async insertMessage(msg: ChatMessage): Promise<void> {
    if (msg.conversationId !== this.convId) {
      throw new ChatError({
        code: 1,
        description:
          'The Message conversation id is not same as conversation id',
      });
    }
    return ChatClient.getInstance().chatManager.insertMessage(
      this.convId,
      this.convType,
      msg
    );
  }

  /**
   * Inserts a message to the end of a conversation in the local database.
   *
   * To insert the message correctly, ensure that the conversation ID of the message is the same as that of the conversation.
   *
   * After a message is inserted, the SDK will automatically update attributes of the conversation, including `latestMessage`.
   *
   * @param msg The message instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async appendMessage(msg: ChatMessage): Promise<void> {
    if (msg.conversationId !== this.convId) {
      throw new ChatError({
        code: 1,
        description:
          'The Message conversation id is not same as conversation id',
      });
    }
    return ChatClient.getInstance().chatManager.appendMessage(
      this.convId,
      this.convType,
      msg
    );
  }

  /**
   * Updates a message in the local database.
   *
   * After you modify a message, the message ID remains unchanged and the SDK automatically updates attributes of the conversation, like `latestMessage`.
   *
   * @param msg The message instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateMessage(msg: ChatMessage): Promise<void> {
    if (msg.conversationId !== this.convId) {
      throw new ChatError({
        code: 1,
        description:
          'The Message conversation id is not same as conversation id',
      });
    }
    return ChatClient.getInstance().chatManager.updateConversationMessage(
      this.convId,
      this.convType,
      msg
    );
  }

  /**
   * Deletes a message from the local database.
   *
   * @param msgId The ID of message to delete.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteMessage(
    convId: string,
    convType: ChatConversationType,
    msgId: string
  ): Promise<void> {
    return ChatClient.getInstance().chatManager.deleteMessage(
      this.convId,
      this.convType,
      msgId
    );
  }

  /**
   * Deletes all the messages of the conversation.
   *
   * This method deletes all the messages of the conversation from both the memory and local database.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteAllMessages(): Promise<void> {
    return ChatClient.getInstance().chatManager.deleteAllMessages(
      this.convId,
      this.convType
    );
  }

  /**
   * Gets the specified message.
   *
   * @param msgId The message ID.
   * @returns The message instance. The SDK returns `undefined` if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessageById(msgId: string): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.getMessageById(
      this.convId,
      this.convType,
      msgId
    );
  }

  /**
   * Gets messages of certain types that a specified user sends in a conversation.
   *
   * @param msgType The message type. See {@link ChatMessageType}.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the reverse chronological order of the Unix timestamp ({@link SortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.Down`: Messages are retrieved in the chronological order of the Unix timestamp ({@link SortMessageByServerTime}) included in them.
   * @param timestamp The starting Unix timestamp for search. The unit is millisecond.
   * @param count The maximum number of messages to retrieve. The value range is [1,50].
   * @param sender The message sender. This parameter can also be used for search among group messages or chat room messages.
   * @returns The message list. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessagesWithMsgType(
    msgType: ChatMessageType,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string
  ): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMessagesWithMsgType(
      this.convId,
      this.convType,
      msgType,
      direction,
      timestamp,
      count,
      sender
    );
  }

  /**
   * Gets messages of a certain quantity in a conversation from the local database.
   *
   * **Note**
   *
   * The obtained messages will also join the existing messages of the conversation stored in the memory.
   *
   * @param startMsgId The starting message ID. If this parameter is set as "" or `null`, the SDK loads messages in the reverse chronological order of when the server receives them.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the reverse chronological order of the Unix timestamp ({@link SortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.Down`: Messages are retrieved in the chronological order of the Unix timestamp ({@link SortMessageByServerTime}) included in them.
   * @param loadCount The maximum number of messages to retrieve. The value range is [1,50].
   * @returns The message list. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessages(
    startMsgId: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    loadCount: number = 20
  ): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMessages(
      this.convId,
      this.convType,
      startMsgId,
      direction,
      loadCount
    );
  }

  /**
   * Gets messages of a certain quantity that the specified user sends in a conversation.
   *
   * This method gets data from the local database.
   *
   * @param keywords The keywords for query.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the reverse chronological order of the Unix timestamp ({@link SortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.Down`: Messages are retrieved in the chronological order of the Unix timestamp ({@link SortMessageByServerTime}) included in them.
   * @param timestamp The starting Unix timestamp for search. The unit is millisecond.
   * @param count The maximum number of messages to retrieve. The value range is [1,50].
   * @param sender The message sender. The parameter can also be used to search among group chat messages.
   * @returns The message list. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessagesWithKeyword(
    keywords: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string
  ): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMessagesWithKeyword(
      this.convId,
      this.convType,
      keywords,
      direction,
      timestamp,
      count,
      sender
    );
  }

  /**
   * Gets messages that are sent or received in a certain period in a conversation.
   *
   * This method gets data from the local database.
   *
   * @param startTime The starting Unix timestamp for search. The unit is millisecond.
   * @param endTime The ending Unix timestamp for search. The unit is millisecond.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the reverse chronological order of the Unix timestamp ({@link SortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.Down`: Messages are retrieved in the chronological order of the Unix timestamp ({@link SortMessageByServerTime}) included in them.
   * @param count The maximum number of message to retrieve. The value range is [1,50].
   * @returns The message list. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessagesFromTime(
    startTime: number,
    endTime: number,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    count: number = 20
  ): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMessagesFromTime(
      this.convId,
      this.convType,
      startTime,
      endTime,
      direction,
      count
    );
  }
}
