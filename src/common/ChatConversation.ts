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
 * Conversation type convert from number.
 *
 * @param params An integer representing the conversation type.
 * @returns The conversation type.
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
      throw new Error(`not exist this type: ${params}`);
  }
}

/**
 * Conversation type from number.
 *
 * @param params A string representing the session type.
 * @returns The string representing the conversation type.
 */
export function ChatConversationTypeToString(
  params: ChatConversationType
): string {
  return ChatConversationType[params];
}

/**
 * The conversation class, indicating a one-to-one chat, a group chat, or a conversation chat. It contains the messages that are sent and received within the conversation.
 *
 * About the conversation name. Please get the name according to different types.
 * If peer chat type, see {@link ChatUserInfoManager#fetchUserInfoById}.
 * If group chat type, see {@link ChatGroup#getGroupWithId}.
 * If room chat type, see {@link ChatRoom#fetchChatRoomInfoFromServer}.
 */
export class ChatConversation {
  con_id: string;
  type: ChatConversationType;
  // unreadCount: number;
  // con_name?: string;
  // lastMessage?: ChatMessage;
  // lastReceivedMessage?: ChatMessage;
  ext?: any;

  constructor(params: {
    con_id: string;
    type: ChatConversationType;
    ext?: any;
  }) {
    this.con_id = params.con_id;
    this.type = params.type;
    this.ext = params.ext;
  }

  /**
   * Get conversation name.
   *
   * @returns The conversation name.
   */
  public async name(): Promise<string | undefined> {
    if (this.type === ChatConversationType.PeerChat) {
      const ret = await ChatClient.getInstance().userManager.fetchUserInfoById([
        this.con_id,
      ]);
      if (ret.size > 0) {
        return ret.values().next().value.nickName;
      }
    } else if (this.type === ChatConversationType.GroupChat) {
      const ret =
        await ChatClient.getInstance().groupManager.fetchGroupInfoFromServer(
          this.con_id
        );
      if (ret) {
        return ret.groupName;
      }
    } else if (this.type === ChatConversationType.RoomChat) {
      const ret =
        await ChatClient.getInstance().roomManager.fetchChatRoomInfoFromServer(
          this.con_id
        );
      if (ret) {
        return ret.name;
      }
    } else {
      throw new ChatError({
        code: 1,
        description: 'The type is unknown. '.concat(
          (this.type as number).toString()
        ),
      });
    }
    return undefined;
  }

  /**
   * Gets the unread message count of the conversation.
   *
   * @returns The unread message count of the conversation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchUnreadCount(): Promise<number> {
    return ChatClient.getInstance().chatManager.unreadCount(
      this.con_id,
      this.type
    );
  }

  /**
   * Gets the lastest message from the conversation.
   *
   * @returns The message instance. Returns undefined if the message does not
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchLatestMessage(): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.fetchLatestMessage(
      this.con_id,
      this.type
    );
  }

  /**
   * Gets the latest message from the conversation.
   *
   * @returns The message instance. Returns undefined if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchLatestReceivedMessage(): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.fetchLastReceivedMessage(
      this.con_id,
      this.type
    );
  }

  /**
   * Set custom properties for the conversation.
   *
   * @param ext The custom attribute.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async setConversationExtension(ext: any): Promise<void> {
    this.ext = ext;
    return ChatClient.getInstance().chatManager.setConversationExtension(
      this.con_id,
      this.type,
      this.ext
    );
  }

  /**
   * Marks a message as read.
   *
   * @param msgId The message id.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async markMessageAsRead(msgId: string): Promise<void> {
    return ChatClient.getInstance().chatManager.markMessageAsRead(
      this.con_id,
      this.type,
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
      this.con_id,
      this.type
    );
  }

  /**
   * Inserts a message to a conversation in the local database and the SDK will automatically update the latest message.
   *
   * @param msg The message instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async insertMessage(msg: ChatMessage): Promise<void> {
    if (msg.conversationId !== this.con_id) {
      throw new ChatError({
        code: 1,
        description: 'Message id is not same as conversation id',
      });
    }
    return ChatClient.getInstance().chatManager.insertMessage(
      this.con_id,
      this.type,
      msg
    );
  }

  /**
   * Inserts a message to the end of a conversation in the local database.
   *
   * @param msg The message instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async appendMessage(msg: ChatMessage): Promise<void> {
    if (msg.conversationId !== this.con_id) {
      throw new ChatError({
        code: 1,
        description: 'Message id is not same as conversation id',
      });
    }
    return ChatClient.getInstance().chatManager.appendMessage(
      this.con_id,
      this.type,
      msg
    );
  }

  /**
   * Updates a message in the local database.
   *
   * The latest Message of the conversation and other properties will be updated accordingly. The message ID of the message, however, remains the same.
   *
   * @param msg The message instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateMessage(msg: ChatMessage): Promise<void> {
    if (msg.conversationId !== this.con_id) {
      throw new ChatError({
        code: 1,
        description: 'Message id is not same as conversation id',
      });
    }
    return ChatClient.getInstance().chatManager.updateConversationMessage(
      this.con_id,
      this.type,
      msg
    );
  }

  /**
   * Deletes a message in the local database.
   *
   * @param msgId The ID of message to be deleted.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteMessage(
    convId: string,
    convType: ChatConversationType,
    msgId: string
  ): Promise<void> {
    return ChatClient.getInstance().chatManager.deleteMessage(
      this.con_id,
      this.type,
      msgId
    );
  }

  /**
   * Deletes all the messages of the conversation from both the memory and local database.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteAllMessages(): Promise<void> {
    return ChatClient.getInstance().chatManager.deleteAllMessages(
      this.con_id,
      this.type
    );
  }

  /**
   * Gets the message with a specific message ID.
   *
   * @param msgId The message ID.
   * @returns The message instance. Returns undefined if the message does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessageById(msgId: string): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.getMessageById(
      this.con_id,
      this.type,
      msgId
    );
  }

  /**
   * Retrieves messages from the database according to the following parameters: the message type, the Unix timestamp, max count, sender.
   *
   * @param msgType The message type, including TXT, VOICE, IMAGE, and so on.
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
    msgType: ChatMessageType,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string
  ): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMessagesWithMsgType(
      this.con_id,
      this.type,
      msgType,
      direction,
      timestamp,
      count,
      sender
    );
  }

  /**
   * Loads multiple messages from the local database.
   *
   * Loads messages from the local database before the specified message.
   *
   * The loaded messages will also join the existing messages of the conversation stored in the memory.
   *
   * @param startMsgId The starting message ID. Message loaded in the memory before this message ID will be loaded. If the `startMsgId` is set as "" or null, the SDK will first load the latest messages in the database.
   * @param direction The direction in which the message is loaded: ChatSearchDirection.
   * @param loadCount The number of messages per page.
   * @returns The message list. but, maybe is empty list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getMessages(
    startMsgId: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    loadCount: number = 20
  ): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMessages(
      this.con_id,
      this.type,
      startMsgId,
      direction,
      loadCount
    );
  }

  /**
   * Loads messages from the local database by the following parameters: keywords, timestamp, max count, sender, search direction.
   *
   * **Note**
   * Pay attention to the memory usage when the maxCount is large.
   *
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
    keywords: string,
    direction: ChatSearchDirection = ChatSearchDirection.UP,
    timestamp: number = -1,
    count: number = 20,
    sender?: string
  ): Promise<Array<ChatMessage>> {
    return ChatClient.getInstance().chatManager.getMessagesWithKeyword(
      this.con_id,
      this.type,
      keywords,
      direction,
      timestamp,
      count,
      sender
    );
  }

  /**
   * Loads messages from the local database according the following parameters: start timestamp, end timestamp, count.
   *
   * **Note**
   * Pay attention to the memory usage when the maxCount is large.
   *
   * @param startTime The starting Unix timestamp for search.
   * @param endTime The ending Unix timestamp for search.
   * @param direction The direction in which the message is loaded: ChatSearchDirection.
   * @param count The maximum number of message to retrieve.
   * @returns The list of searched messages.
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
      this.con_id,
      this.type,
      startTime,
      endTime,
      direction,
      count
    );
  }
}
