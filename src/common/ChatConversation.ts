import { ChatClient } from '../ChatClient';
import { ChatError } from './ChatError';
import type {
  ChatMessage,
  ChatMessageSearchScope,
  ChatMessageType,
} from './ChatMessage';
import { ChatPushRemindType } from './ChatSilentMode';

/**
 * The message search directions.
 *
 * The message search is based on the Unix timestamp included in messages. Each message contains two Unix timestamps:
 *    - The Unix timestamp when the message is created;
 *    - The Unix timestamp when the message is received by the server.
 *
 * Which Unix timestamp is used for message search depends on the setting of {@link ChatOptions.sortMessageByServerTime}.
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
 * The mapping between each type of conversation mark and their actual meanings is maintained by the developer.
 *
 * Unlike conversation extension fields, conversation marks are searchable.
 */
export enum ChatConversationMarkType {
  Type0,
  Type1,
  Type2,
  Type3,
  Type4,
  Type5,
  Type6,
  Type7,
  Type8,
  Type9,
  Type10,
  Type11,
  Type12,
  Type13,
  Type14,
  Type15,
  Type16,
  Type17,
  Type18,
  Type19,
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
      return params;
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
  return ChatConversationType[params]!;
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

   * This parameter is valid only for group chat.
   */
  isChatThread: boolean;
  /**
   * The conversation extension.
   */
  ext?: any;
  /**
   * Whether the conversation is pinned:
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  isPinned?: boolean;
  /**
   * The UNIX timestamp when the conversation is pinned. The unit is millisecond. This value is `0` when the conversation is not pinned.
   */
  pinnedTime?: number;

  /**
   * The conversation marks.
   */
  marks?: ChatConversationMarkType[];

  /**
   * The conversation remind type.
   */
  remindType?: ChatPushRemindType;

  constructor(params: {
    convId: string;
    convType: ChatConversationType;
    isChatThread?: boolean;
    ext?: any;
    isPinned?: boolean;
    pinnedTime?: number;
    marks?: ChatConversationMarkType[];
    remindType?: ChatPushRemindType;
  }) {
    this.convId = params.convId;
    this.convType = params.convType;
    this.isChatThread = params.isChatThread ?? false;
    this.ext = params.ext;
    this.isPinned = params.isPinned ?? false;
    this.pinnedTime = params.pinnedTime ?? 0;
    this.marks = params.marks;
    this.remindType = params.remindType ?? ChatPushRemindType.ALL;
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
        return ret.values().next().value?.nickName;
      }
    } else if (this.convType === ChatConversationType.GroupChat) {
      const ret =
        await ChatClient.getInstance().groupManager.fetchGroupInfoWithoutMembersFromServer(
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
      this.convType,
      this.isChatThread
    );
  }

  /**
   * Gets the count of messages in the conversation.
   * @returns The count of messages.
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessageCount(): Promise<number> {
    return ChatClient.getInstance().chatManager.getConversationMessageCount(
      this.convId,
      this.convType,
      this.isChatThread
    );
  }

  /**
   * Gets the count of messages in the conversation.
   *
   * @param start: The start timestamp.
   * @param end: The end timestamp.
   *
   * @returns The count of messages.
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessageCountWithTimestamp(
    start: number,
    end: number
  ): Promise<number> {
    return ChatClient.getInstance().chatManager.getMessageCountWithTimestamp({
      start: start,
      end: end,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
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
      this.convType,
      this.isChatThread
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
      this.convType,
      this.isChatThread
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
      this.ext,
      this.isChatThread
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
      msgId,
      this.isChatThread
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
      this.convType,
      this.isChatThread
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
      msg,
      this.isChatThread
    );
  }

  /**
   * Deletes a message from the local database.
   *
   * @param msgId The ID of message to delete.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteMessage(msgId: string): Promise<void> {
    return ChatClient.getInstance().chatManager.deleteMessage(
      this.convId,
      this.convType,
      msgId,
      this.isChatThread
    );
  }

  /**
   * Deletes messages sent or received in a certain period from the local database.
   *
   * @params params
   * - startTs: The starting UNIX timestamp for message deletion. The unit is millisecond.
   * - endTs: The end UNIX timestamp for message deletion. The unit is millisecond.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteMessagesWithTimestamp(params: {
    startTs: number;
    endTs: number;
  }): Promise<void> {
    return ChatClient.getInstance().chatManager.deleteMessagesWithTimestamp(
      this.convId,
      this.convType,
      params,
      this.isChatThread
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
    return ChatClient.getInstance().chatManager.deleteConversationAllMessages(
      this.convId,
      this.convType,
      this.isChatThread
    );
  }

  /**
   * Gets messages of a certain type that a specified user sends in a conversation.
   *
   * @param msgType The message type. See {@link ChatMessageType}.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param sender The user ID or group ID for retrieval. Usually, it is the conversation ID.
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2024-04-17 This method is deprecated. Use {@link getMsgsWithMsgType} instead.
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
      sender,
      this.isChatThread
    );
  }

  /**
   * Gets messages of a certain type in the conversation from the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @params -
   * @param msgType The message type. See {@link ChatMessageType}.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param sender The user ID or group ID for retrieval. Usually, it is the conversation ID.
   * @param senders The user IDs of the message senders in the group conversation.
   *
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMsgsWithMsgType(params: {
    msgType: ChatMessageType;
    direction?: ChatSearchDirection;
    timestamp?: number;
    count?: number;
    sender?: string;
    senders?: Array<string>;
  }): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMsgsWithMsgType({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * Gets messages of a certain quantity in a conversation from the local database.
   *
   * **Note**
   *
   * The obtained messages will also join the existing messages of the conversation stored in the memory.
   *
   * @param startMsgId The starting message ID for query. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                   If this parameter is set an empty string, the SDK retrieves messages according to the message search direction while ignoring this parameter.
   *                  - If `direction` is set as `ChatSearchDirection.UP`, the SDK retrieves messages, starting from the latest one, in the descending order of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   *                 - If `direction` is set as `ChatSearchDirection.DOWN`, the SDK retrieves messages, starting from the oldest one, in the ascending order of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * @param loadCount The maximum number of messages to retrieve each time. The value range is [1,400].
   * @returns The message list (excluding the ones with the starting or ending timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2024-04-17 This method is deprecated. Use {@link getMsgs} instead.
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
      loadCount,
      this.isChatThread
    );
  }

  /**
   * Gets messages of a specified quantity in a conversation from the local database.
   *
   * The retrieved messages will also be put in the conversation in the memory according to the timestamp included in them.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @params -
   * @param startMsgId The starting message ID for query. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                   If this parameter is set an empty string, the SDK retrieves messages according to the message search direction while ignoring this parameter.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param loadCount The maximum number of messages to retrieve each time. The value range is [1,50].
   *
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMsgs(params: {
    startMsgId: string;
    direction?: ChatSearchDirection;
    loadCount?: number;
  }): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMsgs({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * Gets messages with the specified IDs from the local database.
   *
   * @params -
   *  @param msgIds The message IDs.
   * @returns The list of retrieved messages. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessagesWithIds(params: {
    msgIds: Array<string>;
  }): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMessagesWithIds({
      ...params,
      convId: this.convId,
      convType: this.convType,
    });
  }

  /**
   * Gets messages with keywords in a conversation in the local database.
   *
   * @param keywords The keywords for query.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.Up`: Messages are retrieved in the descending order of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.Down`: Messages are retrieved in the ascending order of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * @param timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @param sender The user ID or group ID for retrieval. Usually, it is the conversation ID.
   * @returns  The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2024-04-17 This method is deprecated. Use {@link getMsgsWithKeyword} instead.
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
      sender,
      this.isChatThread
    );
  }

  /**
   * Gets messages that the specified user sends in a conversation in a certain period.
   *
   * This method gets data from the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @params -
   * - keywords The keywords for query.
   * - direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * - timestamp The starting Unix timestamp in the message for query. The unit is millisecond. After this parameter is set, the SDK retrieves messages, starting from the specified one, according to the message search direction.
   * - searchScope The message search scope. See {@link ChatMessageSearchScope}.
   *                  If you set this parameter as a negative value, the SDK retrieves messages, starting from the current time, in the descending order of the timestamp included in them.
   * - count The maximum number of messages to retrieve each time. The value range is [1,400].
   * - sender The user ID or group ID for retrieval. Usually, it is the conversation ID. use `senders` instead. 2025-07-22
   * - senders The user IDs of the message senders. If you do not set this parameter, the SDK ignores this parameter when retrieving messages.
   *
   * @returns The list of retrieved messages (excluding the one with the starting timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMsgsWithKeyword(params: {
    keywords: string;
    direction?: ChatSearchDirection;
    timestamp?: number;
    count?: number;
    sender?: string;
    senders?: Array<string>;
    searchScope?: ChatMessageSearchScope;
  }): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getConvMsgsWithKeyword({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * Gets messages that are sent and received in a certain period in a conversation in the local database.
   *
   * @param startTime The starting Unix timestamp for search. The unit is millisecond.
   * @param endTime The ending Unix timestamp for search. The unit is millisecond.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp ({@link ChatOptions.sortMessageByServerTime}) included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   * @returns The list of retrieved messages (excluding the ones with the starting or ending timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   *
   * @deprecated 2024-04-17 This method is deprecated. Use {@link getMsgWithTimestamp} instead.
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
      count,
      this.isChatThread
    );
  }

  /**
   * Gets messages that are sent and received in a certain period in a conversation in the local database.
   *
   * **note** If the conversation object does not exist, this method will create it.
   *
   * @params -
   * @param startTime The starting Unix timestamp for query, in milliseconds.
   * @param endTime The ending Unix timestamp for query, in milliseconds.
   * @param direction The message search direction. See {@link ChatSearchDirection}.
   * - (Default) `ChatSearchDirection.UP`: Messages are retrieved in the descending order of the Unix timestamp included in them.
   * - `ChatSearchDirection.DOWN`: Messages are retrieved in the ascending order of the Unix timestamp included in them.
   * @param count The maximum number of messages to retrieve each time. The value range is [1,400].
   *
   * @returns The list of retrieved messages (excluding with the ones with the starting or ending timestamp). If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMsgWithTimestamp(params: {
    startTime: number;
    endTime: number;
    direction?: ChatSearchDirection;
    count?: number;
  }): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMsgWithTimestamp({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * Deletes messages from the conversation (from both local storage and server).
   *
   * @param msgIds The IDs of messages to delete from the current conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeMessagesFromServerWithMsgIds(
    msgIds: string[]
  ): Promise<void> {
    return ChatClient.getInstance().chatManager.removeMessagesFromServerWithMsgIds(
      this.convId,
      this.convType,
      msgIds,
      this.isChatThread
    );
  }

  /**
   * Deletes messages from the conversation (from both local storage and server).
   *
   * @param timestamp The message timestamp in millisecond. The messages with the timestamp smaller than the specified one will be deleted.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeMessagesFromServerWithTimestamp(
    timestamp: number
  ): Promise<void> {
    return ChatClient.getInstance().chatManager.removeMessagesFromServerWithTimestamp(
      this.convId,
      this.convType,
      timestamp,
      this.isChatThread
    );
  }

  /**
   * Gets the pinned messages in the conversation from the local database.
   *
   * @returns The list of pinned messages. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getPinnedMessages(): Promise<ChatMessage[]> {
    return ChatClient.getInstance().chatManager.getPinnedMessages(
      this.convId,
      this.convType,
      this.isChatThread
    );
  }

  /**
   * Gets the pinned messages in the conversation from the server.
   *
   * @returns The list of pinned messages. If no message is obtained, an empty list is returned.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchPinnedMessages(): Promise<ChatMessage[]> {
    return ChatClient.getInstance().chatManager.fetchPinnedMessages(
      this.convId,
      this.convType,
      this.isChatThread
    );
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
  }): Promise<ChatMessage[]> {
    return ChatClient.getInstance().chatManager.searchMessagesInConversation({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * Delete the local and server messages of the current user. The server messages of other users in the single chat or group chat with the user will not be affected and can be obtained through roaming.
   * @param params -
   * - timestamp: Messages before this timestamp will be deleted.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeMessagesWithTimestamp(params: {
    timestamp: number;
  }): Promise<void> {
    return ChatClient.getInstance().chatManager.removeMessagesWithTimestamp({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }
}

/**
 * The conversation filter class.
 */
export class ChatConversationFetchOptions {
  /**
   * The number of conversations to retrieve.
   *
   * If you retrieve marked conversations, the value range is [1,10], with 10 as the default. Otherwise, the value range is [1,50].
   */
  pageSize?: number;
  /**
   * The cursor to specify where to start retrieving conversations.
   */
  cursor?: string;
  /**
   * Whether to get pinned conversations.
   * - `true`: Yes.
   * - `false`: No.
   */
  pinned?: boolean;
  /**
   * Whether to get marked conversations.
   * - `true`: Yes.
   * - `false`: No.
   */
  mark?: ChatConversationMarkType;
  constructor(params: {
    pageSize?: number;
    cursor?: string;
    pinned?: boolean;
    mark?: ChatConversationMarkType;
  }) {
    this.pageSize = params.pageSize;
    this.cursor = params.cursor;
    this.pinned = params.pinned;
    this.mark = params.mark;
  }
  static default(): ChatConversationFetchOptions {
    return new ChatConversationFetchOptions({
      pageSize: 20,
      pinned: false,
    });
  }
  static pinned(): ChatConversationFetchOptions {
    return new ChatConversationFetchOptions({
      pageSize: 20,
      pinned: true,
    });
  }
  static withMark(
    mark: ChatConversationMarkType
  ): ChatConversationFetchOptions {
    return new ChatConversationFetchOptions({
      pageSize: 20,
      mark: mark,
    });
  }
}
