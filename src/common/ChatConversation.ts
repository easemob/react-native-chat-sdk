import { ChatClient } from '../ChatClient';
import type { ChatCursorResult } from './ChatCursorResult';
import { ChatError } from './ChatError';
import type {
  ChatFetchMessageOptions,
  ChatMessage,
  ChatMessageType,
} from './ChatMessage';

/**
 * 消息搜索方向枚举。
 */
export enum ChatSearchDirection {
  /**
   * 按消息中的时间戳的倒序搜索。
   */
  UP,
  /**
   * 按消息中的时间戳的顺序搜索。
   */
  DOWN,
}

/**
 * 会话类型枚举。
 */
export enum ChatConversationType {
  /**
   * 单聊。
   */
  PeerChat = 0,
  /**
   * 群聊。
   */
  GroupChat = 1,
  /**
   * 聊天室。
   */
  RoomChat = 2,
}

/**
 * 将会话类型由整型转换为枚举类型。
 *
 * @param params 整型的会话类型。
 * @returns 枚举类型的会话类型。
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
 * 将会话类型由枚举转换为字符串类型表示。
 *
 * @param params 枚举类型的会话类型。
 * @returns 字符串类型的会话类型。
 */
export function ChatConversationTypeToString(
  params: ChatConversationType
): string {
  return ChatConversationType[params]!;
}

/**
 * 会话类，用于定义单聊会话、群聊会话和聊天室会话。
 *
 * 每类会话中包含发送和接收的消息。
 *
 * 关于会话名称，请根据会话类型获取：
 * 单聊：详见 {@link ChatUserInfoManager.fetchUserInfoById}；
 * 群聊：详见 {@link ChatGroup.getGroupWithId}；
 * 聊天室：详见 {@link ChatRoom.fetchChatRoomInfoFromServer}。
 */
export class ChatConversation {
  /**
   * 会话 ID。
   */
  convId: string;
  /**
   * 会话类型。
   */
  convType: ChatConversationType;
  /**
   * 是否是子区会话。
   * 
   * - `true`: 是；
   * - `false`: 否。
   *
   * **注意**

   * 该参数仅对群聊有效。
   */
  isChatThread: boolean;
  /**
   * 会话扩展信息。
   */
  ext?: any;
  /**
   * 会话是否置顶：
   * - `true`：会话置顶。
   * - （默认） `false`：会话不置顶。
   */
  isPinned?: boolean;
  /**
   * 会话置顶 UNIX 时间戳，单位为毫秒，值 `0` 表示会话未置顶。
   */
  pinnedTime?: number;

  constructor(params: {
    convId: string;
    convType: ChatConversationType;
    isChatThread?: boolean;
    ext?: any;
    isPinned?: boolean;
    pinnedTime?: number;
  }) {
    this.convId = params.convId;
    this.convType = params.convType;
    this.isChatThread = params.isChatThread ?? false;
    this.ext = params.ext;
    this.isPinned = params.isPinned ?? false;
    this.pinnedTime = params.pinnedTime ?? 0;
  }

  /**
   * 获取会话 ID。
   *
   * @returns 会话 ID。
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
   * 获取会话的未读消息数量。
   *
   * @returns 会话的未读消息数量。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getUnreadCount(): Promise<number> {
    return ChatClient.getInstance().chatManager.getConversationUnreadCount(
      this.convId,
      this.convType
    );
  }

  /**
   * 获取会话的消息数目。
   * @returns 消息的数目。
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getMessageCount(): Promise<number> {
    return ChatClient.getInstance().chatManager.getConversationMessageCount(
      this.convId,
      this.convType
    );
  }

  /**
   * 获取指定会话的最新消息。
   *
   * @returns 消息实例。如果不存在返回 `undefined`。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getLatestMessage(): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.getLatestMessage(
      this.convId,
      this.convType
    );
  }

  /**
   * 获取指定会话中最近接收到的消息。
   *
   * @returns 消息实例。如果不存在返回 `undefined`。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getLatestReceivedMessage(): Promise<ChatMessage | undefined> {
    return ChatClient.getInstance().chatManager.getLatestReceivedMessage(
      this.convId,
      this.convType
    );
  }

  /**
   * 设置指定会话的自定义扩展信息。
   *
   * @param ext 会话扩展信息。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 标记指定消息为已读。
   *
   * @param msgId 消息 ID。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async markMessageAsRead(msgId: string): Promise<void> {
    return ChatClient.getInstance().chatManager.markMessageAsRead(
      this.convId,
      this.convType,
      msgId
    );
  }

  /**
   * 标记所有消息为已读。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async markAllMessagesAsRead(): Promise<void> {
    return ChatClient.getInstance().chatManager.markAllMessagesAsRead(
      this.convId,
      this.convType
    );
  }

  /**
   * 更新本地数据库的指定消息。
   *
   * 消息更新时，消息 ID 不会修改。
   *
   * 消息更新后，SDK 会自动更新会话的 `latestMessage` 等属性。
   *
   * @param msg 消息实例。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 删除本地数据库中的指定消息。
   *
   * @param msgId 要删除的消息 ID。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async deleteMessage(msgId: string): Promise<void> {
    return ChatClient.getInstance().chatManager.deleteMessage(
      this.convId,
      this.convType,
      msgId
    );
  }

  /**
   * 删除消息。
   *
   * @params 参数组。
   * - startTs: 开始的时间戳
   * - endTs: 结束的时间戳
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async deleteMessagesWithTimestamp(params: {
    startTs: number;
    endTs: number;
  }): Promise<void> {
    return ChatClient.getInstance().chatManager.deleteMessagesWithTimestamp(
      this.convId,
      this.convType,
      params
    );
  }

  /**
   * 删除会话的所有消息。
   *
   * 该方法将缓存和数据库的消息全部删除。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async deleteAllMessages(): Promise<void> {
    return ChatClient.getInstance().chatManager.deleteConversationAllMessages(
      this.convId,
      this.convType
    );
  }

  /**
   * 从本地数据库获取会话中的指定用户发送的某些类型的消息。
   *
   * @param msgType 消息类型。详见 {@link ChatMessageType}。
   * @param direction 消息加载方向。默认按消息中的时间戳（{@link SortMessageByServerTime}）的倒序加载，详见 {@link ChatSearchDirection}。
   * @param timestamp 搜索的起始时间戳。单位为毫秒。
   * @param count 获取的最大消息数量。
   * @param sender 消息发送方。该参数也可以在搜索群组消息或聊天室消息时使用。
   *
   * @returns 消息列表。若未获取到，返回空列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 从本地数据库获取指定会话中一定数量的消息。
   *
   * 获取到的消息也会放入到内存中。
   *
   * @param startMsgId 开始消息 ID。若该参数设为空或 `null`，SDK 按服务器接收消息时间的倒序加载消息。
   * @param direction 消息查询方向，详见 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.Up`：按消息中的时间戳 ({@link SortMessageByServerTime}) 的倒序加载。
   * - `ChatSearchDirection.Down`：按消息中的时间戳 ({@link SortMessageByServerTime}) 的顺序加载。
   * @param loadCount 获取的最大消息数量。取值范围为 [1,50]。
   * @returns 消息列表。若未获取到消息，返回空列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 从本地数据库获取会话中的指定用户发送的一定数量的特定消息。
   *
   * @param keywords 查询的关键字。
   * @param direction 消息查询方向，详见 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.Up`：按消息中的时间戳 ({@link SortMessageByServerTime}) 的倒序加载。
   * - `ChatSearchDirection.Down`：按消息中的时间戳 ({@link SortMessageByServerTime}) 的顺序加载。
   * @param timestamp 搜索的开始时间戳。单位为毫秒。
   * @param count 获取的最大消息数量。取值范围为 [1,50]。
   * @param sender 消息发送者，该参数也可以在搜索群组消息和聊天室消息时使用。
   * @returns 消息列表。若未获取到消息，返回空列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 从本地数据库获取指定会话在一段时间内的消息。
   *
   * @param startTime 搜索起始时间戳。单位为毫秒。
   * @param endTime 搜索结束时间戳。单位为毫秒。
   * @param direction 消息查询方向，详见 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.Up`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的倒序加载。
   * - `ChatSearchDirection.Down`：按消息中的时间戳 ({@link sortMessageByServerTime}) 的顺序加载。
   * @param count 获取的最大消息数量。取值范围为 [1,400]。
   * @returns 消息列表。若未获取到消息，返回空列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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

  /**
   * 分页获取指定会话的历史消息。
   *
   * @param -
   * - pageSize: 每页期望返回的消息数量。
   * - startMsgId: 开始消息 ID。如果该参数为空字符串或 `null`，SDK 按服务器最新接收消息的时间倒序获取。
   * - direction: 消息搜索方向，详见 {@link ChatSearchDirection}
   * @returns 获取到的消息和下次查询的 cursor。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchHistoryMessages(params: {
    pageSize?: number;
    startMsgId?: string;
    direction?: ChatSearchDirection;
  }): Promise<ChatCursorResult<ChatMessage>> {
    return ChatClient.getInstance().chatManager.fetchHistoryMessages(
      this.convId,
      this.convType,
      params
    );
  }

  /**
   * 根据消息拉取参数配置从服务器分页获取指定会话的历史消息。
   *
   * @params 参数组。
   * - options: 查询历史消息的参数配置类， 详见 {@link ChatFetchMessageOptions}.
   * - cursor: 查询的起始游标位置。
   * - pageSize: 每页期望获取的消息条数。取值范围为 [1,50]。
   *
   * @returns 查询到的消息列表和下次查询的 cursor。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async fetchHistoryMessagesByOptions(params?: {
    options?: ChatFetchMessageOptions;
    cursor?: string;
    pageSize?: number;
  }): Promise<ChatCursorResult<ChatMessage>> {
    return ChatClient.getInstance().chatManager.fetchHistoryMessagesByOptions(
      this.convId,
      this.convType,
      params
    );
  }

  /**
   * 根据消息 ID 单向删除漫游消息
   *
   * @param msgIds 将要删除的消息ID列表。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async removeMessagesFromServerWithMsgIds(
    msgIds: string[]
  ): Promise<void> {
    return ChatClient.getInstance().chatManager.removeMessagesFromServerWithMsgIds(
      this.convId,
      this.convType,
      msgIds
    );
  }

  /**
   * 根据消息 时间戳 单向删除漫游消息
   *
   * @param timestamp UNIX 时间戳，单位为毫秒。若消息的 UNIX 时间戳小于设置的值，则会被删除。
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async removeMessagesFromServerWithTimestamp(
    timestamp: number
  ): Promise<void> {
    return ChatClient.getInstance().chatManager.removeMessagesFromServerWithTimestamp(
      this.convId,
      this.convType,
      timestamp
    );
  }

  /**
   * 是否设置会话置顶。
   *
   * @param -
   * - `true`：是.
   * - `false`: 否.
   *
   * @throws 如果有异常会在此抛出，包括错误码和错误信息，详见 {@link ChatError}。
   */
  public async pinConversation(isPinned: boolean): Promise<void> {
    return ChatClient.getInstance().chatManager.pinConversation(
      this.convId,
      isPinned
    );
  }
}
