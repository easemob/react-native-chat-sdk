import { ChatClient } from '../ChatClient';
import { ChatError } from './ChatError';
import type { ChatMessage, ChatMessageType } from './ChatMessage';

/**
 * The message search directions.
 *
 * The message search is based on the Unix timestamp included in messages. Each message contains two Unix timestamps:
 *    - The Unix timestamp when the message is created;
 *    - The Unix timestamp when the message is received by the server.
 *
 * Which Unix timestamp is used for message search depends on the setting of {@link sortMessageByServerTime}.
 *
 */
export enum ChatSearchDirection {
  /**
   * Messages are retrieved in the descending order of the timestamp included in them.
   *
   */
  UP,
  /**
   * Messages are retrieved in the ascending order of the timestamp included in them.
   *
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
   * Chat group chat.
   */
  GroupChat = 1,
  /**
   * Chat room chat.
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
 * - One-to-one chat: See {@link ChatUserInfoManager.fetchUserInfoById}.
 * - Group chat: See {@link ChatGroup.getGroupWithId}.
 * - Chat room: See {@link ChatRoom.fetchChatRoomInfoFromServer}.
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
   * Whether the current conversation is a thread conversation.
   * 
   * - `true`: Yes.
   * - `false`: No.
   *
   * **Note**

   * This parameter is valid only for group chat.This parameter is valid only for group.
   */
  isChatThread: boolean;
  /**
   * The conversation extension.
   */
  ext?: any;
  constructor(params: {
    convId: string;
    convType: ChatConversationType;
    isChatThread?: boolean;
    ext?: any;
  }) {
    this.convId = params.convId;
    this.convType = params.convType;
    this.isChatThread = params.isChatThread ?? false;
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
  public async getUnreadCount(): Promise<number> {
    return ChatClient.getInstance().chatManager.getConversationUnreadCount(
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
  public async getLatestMessage(): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.getLatestMessage(
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
  public async getLatestReceivedMessage(): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.getLatestReceivedMessage(
      this.convId,
      this.convType
    );
  }

  /**
   * Sets the extension information of the conversation.
   *
   * @param ext The extension information of the conversation. This parameter must be in the key-value format.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async setConversationExtension(ext: {
    [key: string]: string | number;
  }): Promise<void> {
    await ChatClient.getInstance().chatManager.setConversationExtension(
      this.convId,
      this.convType,
      this.ext
    );
    this.ext = ext;
  }

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
   * Retrieves messages of a certain type that a specified user sends in a conversation.
   *
   * @param msgType The message type. See {@link ChatMessageType}.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param sender The user ID or group ID for retrieval. Usually, it is the conversation ID.
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
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
   * Retrieves messages of a certain quantity in a conversation from the local database.
   *
   * **Note**
   *
   * The obtained messages will also join the existing messages of the conversation stored in the memory.
   *
   * @param startMsgId The starting message ID for query. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                   If this parameter is set as "null" or an empty string, the SDK retrieves messages according to the message search direction while ignoring this parameter.
   *                  - If `direction` is set as `ChatSearchDirection.UP`, the SDK retrieves messages, starting from the latest one, in the descending order of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   *                 - If `direction` is set as `ChatSearchDirection.DOWN`, the SDK retrieves messages, starting from the oldest one, in the ascending order of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * @param loadCount The maximum number of messages to retrieve each time. The value range is [1,400].
   * @returns The message list (excluding the ones with the starting or ending timestamp). If no message is obtained, an empty list is returned.
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
   * Retrieves messages with keywords in a conversation in the local database.
   *
   * @param keywords The keywords for query.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the descending order of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.Down`: Messages are retrieved in the ascending order of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param sender The user ID or group ID for retrieval. Usually, it is the conversation ID.
   * @returns  The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
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
   * Gets messages that are sent and received in a certain period in a conversation in the local database.
   *
   * @param startTime The starting Unix timestamp for search. The unit is millisecond.
   * @param endTime The ending Unix timestamp for search. The unit is millisecond.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp ({@link sortMessageByServerTime}) included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @returns The list of retrieved messages (excluding the ones with the starting or ending timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessageWithTimestamp(
    startTime: number,
    endTime: number,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    count: number = 20
  ): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMessageWithTimestamp(
      this.convId,
      this.convType,
      startTime,
      endTime,
      direction,
      count
    );
  }
}
