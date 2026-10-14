import { ChatError } from './ChatError';
import type {
  ChatMessage,
  ChatMessageSearchScope,
  ChatMessageType,
} from './ChatMessage';
import { ChatPushRemindType } from './ChatSilentMode';
import { Factory } from '../__internal__/Factory';

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
 * 每种类型的会话标记与其实际含义之间的映射由开发者维护。
 *
 * 与会话扩展字段不同，会话标记支持搜索。
 *
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
 * 将会话类型从 int 转换为 enum。
 *
 * @param params int 类型的会话类型。
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
      return params;
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
 * 群聊：详见 {@link ChatGroupManager.fetchGroupInfoWithoutMembersFromServer}；
 * 聊天室：详见 {@link ChatRoomManager.fetchChatRoomInfoFromServer}。
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
   * 是否是子区会话：
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

  /**
   * 会话标记。
   */
  marks?: ChatConversationMarkType[];

  /**
   * 会话提醒类型
   */
  remindType?: ChatPushRemindType;

  /**
   * 会话的显示名称。
   *
   * **注意** 该字段由原生 SDK 返回。要在 RN 层根据会话类型获取会话名称，
   * 详见 {@link ChatConversation.name}。
   */
  readonly displayName?: string;

  /**
   * 会话的显示头像。
   *
   * **注意** 该字段由原生 SDK 返回。
   */
  readonly displayAvatar?: string;

  constructor(params: {
    convId: string;
    convType: ChatConversationType;
    isChatThread?: boolean;
    ext?: any;
    isPinned?: boolean;
    pinnedTime?: number;
    marks?: ChatConversationMarkType[];
    remindType?: ChatPushRemindType;
    name?: string;
    avatar?: string;
  }) {
    this.convId = params.convId;
    this.convType = params.convType;
    this.isChatThread = params.isChatThread ?? false;
    this.ext = params.ext;
    this.isPinned = params.isPinned ?? false;
    this.pinnedTime = params.pinnedTime ?? 0;
    this.marks = params.marks;
    this.remindType = params.remindType ?? ChatPushRemindType.ALL;
    this.displayName = params.name;
    this.displayAvatar = params.avatar;
  }

  /**
   * 获取会话 ID。
   *
   * @returns 会话 ID。
   */
  public async name(): Promise<string | undefined> {
    if (this.convType === ChatConversationType.PeerChat) {
      const ret = await Factory.getChatClient().userManager.fetchUserInfoById([
        this.convId,
      ]);
      if (ret.size > 0) {
        return ret.values().next().value?.nickName;
      }
    } else if (this.convType === ChatConversationType.GroupChat) {
      const ret =
        await Factory.getChatClient().groupManager.fetchGroupInfoWithoutMembersFromServer(
          this.convId
        );
      if (ret) {
        return ret.groupName;
      }
    } else if (this.convType === ChatConversationType.RoomChat) {
      const ret =
        await Factory.getChatClient().roomManager.fetchChatRoomInfoFromServer(
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
    return Factory.getChatClient().chatManager.getConversationUnreadCount(
      this.convId,
      this.convType,
      this.isChatThread
    );
  }

  /**
   * 获取会话的消息数目。
   * @returns 消息的数目。
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getMessageCount(): Promise<number> {
    return Factory.getChatClient().chatManager.getConversationMessageCount(
      this.convId,
      this.convType,
      this.isChatThread
    );
  }

  /**
   * 获取会话的消息数目。
   *
   * @param start: 起始时间点
   * @param end: 结束时间点
   *
   * @returns 消息数目
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getMessageCountWithTimestamp(
    start: number,
    end: number
  ): Promise<number> {
    return Factory.getChatClient().chatManager.getMessageCountWithTimestamp({
      start: start,
      end: end,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * 获取指定会话的最新消息。
   *
   * @returns 消息实例。如果不存在返回 `undefined`。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getLatestMessage(): Promise<ChatMessage | undefined> {
    return Factory.getChatClient().chatManager.getLatestMessage(
      this.convId,
      this.convType,
      this.isChatThread
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
    return Factory.getChatClient().chatManager.getLatestReceivedMessage(
      this.convId,
      this.convType,
      this.isChatThread
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
    await Factory.getChatClient().chatManager.setConversationExtension(
      this.convId,
      this.convType,
      this.ext,
      this.isChatThread
    );
    this.ext = ext;
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
    return Factory.getChatClient().chatManager.updateConversationMessage(
      this.convId,
      this.convType,
      msg,
      this.isChatThread
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
    return Factory.getChatClient().chatManager.deleteMessage(
      this.convId,
      this.convType,
      msgId,
      this.isChatThread
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
    return Factory.getChatClient().chatManager.deleteMessagesWithTimestamp(
      this.convId,
      this.convType,
      params,
      this.isChatThread
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
    return Factory.getChatClient().chatManager.deleteConversationAllMessages(
      this.convId,
      this.convType,
      this.isChatThread
    );
  }

  /**
   * 从本地数据库中检索会话中某种类型的消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @params -
   * @param msgType 消息类型。 请参阅{@link ChatMessageType}。
   * @param direction 消息搜索方向。请参阅 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param timestamp 用于查询的消息中的起始 Unix 时间戳。 单位是毫秒。 设置该参数后，SDK按照消息搜索方向，从指定的消息开始检索消息。
   * 如果将此参数设置为负值，则SDK从当前时间开始，按照消息中时间戳的降序顺序检索消息。
   * @param count 每次检索的最大消息数。 取值范围为[1,400]。
   * @param sender 用于检索的用户 ID 或组 ID。 通常，它是会话 ID。
   * @param senders 群聊消息发送者的用户 ID 列表。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。 如果没有获取到消息，则返回空列表。
   *
   * @throws 异常的描述。 请参阅{@link ChatError}。
   */
  public async getMsgsWithMsgType(params: {
    msgType: ChatMessageType;
    direction?: ChatSearchDirection;
    timestamp?: number;
    count?: number;
    sender?: string;
    senders?: Array<string>;
  }): Promise<Array<ChatMessage>> {
    return Factory.getChatClient().chatManager.getMsgsWithMsgType({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * 从本地数据库中检索会话中指定数量的消息。
   *
   * 检索到的消息也会根据其中包含的时间戳放入内存中的会话中。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @params -
   * @param startMsgId 查询的起始消息ID。 设置该参数后，SDK按照消息搜索方向，从指定的消息开始检索消息。
   * 如果该参数设置为空字符串，则SDK按照消息搜索方向检索消息，而忽略该参数。
   * @param direction 消息搜索方向。请参阅 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param loadCount 每次检索的最大消息数。 取值范围为[1,50]。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。 如果没有获取到消息，则返回空列表。
   *
   * @throws 异常的描述。 请参阅{@link ChatError}。
   */
  public async getMsgs(params: {
    startMsgId: string;
    direction?: ChatSearchDirection;
    loadCount?: number;
  }): Promise<Array<ChatMessage>> {
    return Factory.getChatClient().chatManager.getMsgs({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * 从本地获取会话中指定 ID 的消息。
   *
   * @params -
   *  @param msgIds 消息 ID 列表。
   * @returns 检索到的消息列表。如果没有获取到消息，则返回空列表。
   *
   * @throws 异常的描述。请参阅 {@link ChatError}。
   */
  public async getMessagesWithIds(params: {
    msgIds: Array<string>;
  }): Promise<Array<ChatMessage>> {
    return Factory.getChatClient().chatManager.getMessagesWithIds({
      ...params,
      convId: this.convId,
      convType: this.convType,
    });
  }

  /**
   * 获取指定用户在一定时间段内在会话中发送的消息。
   *
   * 该方法搜索本地数据库中的消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @params -
   * - keywords 查询的关键字。
   * - direction 消息搜索方向。请参阅 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳 ({@link ChatOptions.sortMessageByServerTime}) 的降序顺序检索消息。
   * - `ChatSearchDirection.DOWN`: 按照消息中包含的 Unix 时间戳 ({@link ChatOptions.sortMessageByServerTime}) 的升序检索消息。
   * - timestamp 用于查询的消息中的起始 Unix 时间戳。 单位是毫秒。 设置该参数后，SDK按照消息搜索方向，从指定的消息开始检索消息。
   * - searchScope 搜索范围，请参阅 {@link ChatMessageSearchScope}。
   * - count 每次检索的最大消息数。 取值范围为[1,400]。
   * - sender 用于检索的用户 ID 或组 ID。
   * - senders 用于检索的用户 ID 或组 ID 列表。
   *
   * @returns 检索到的消息列表（不包括具有起始时间戳的消息）。 如果没有获取到消息，则返回空列表。
   *
   * @throws 异常的描述。请参阅 {@link ChatError}。
   */
  public async getMsgsWithKeyword(params: {
    keywords: string;
    direction?: ChatSearchDirection;
    timestamp?: number;
    count?: number;
    senders?: Array<string>;
    searchScope?: ChatMessageSearchScope;
  }): Promise<Array<ChatMessage>> {
    return Factory.getChatClient().chatManager.getConvMsgsWithKeyword({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * 检索本地数据库中某个会话在一定时间内发送和接收的消息。
   *
   * **注意** 如果会话对象不存在，此方法将创建它。
   *
   * @params -
   * @param startTime 查询的起始 Unix 时间戳，以毫秒为单位。
   * @param endTime 查询的结束 Unix 时间戳，以毫秒为单位。
   * @param direction 消息搜索方向。请参阅 {@link ChatSearchDirection}。
   * - （默认）`ChatSearchDirection.UP`：按照消息中包含的 Unix 时间戳的降序检索消息。
   * - `ChatSearchDirection.DOWN`：按照消息中包含的 Unix 时间戳的升序检索消息。
   * @param count 每次检索的最大消息数。 取值范围为[1,400]。
   *
   * @returns 检索到的消息列表（不包括具有开始或结束时间戳的消息）。 如果没有获取到消息，则返回空列表。
   *
   * @throws 异常的描述。 请参阅{@link ChatError}。
   */
  public async getMsgWithTimestamp(params: {
    startTime: number;
    endTime: number;
    direction?: ChatSearchDirection;
    count?: number;
  }): Promise<Array<ChatMessage>> {
    return Factory.getChatClient().chatManager.getMsgWithTimestamp({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * 从会话中删除消息（从本地存储和服务器）。
   *
   * @param msgIds 要从当前会话中删除的消息的 ID。
   *
   * @throws 异常的描述。 请参阅{@link ChatError}。
   */
  public async removeMessagesFromServerWithMsgIds(
    msgIds: string[]
  ): Promise<void> {
    return Factory.getChatClient().chatManager.removeMessagesFromServerWithMsgIds(
      this.convId,
      this.convType,
      msgIds,
      this.isChatThread
    );
  }

  /**
   * 从会话中删除消息（从本地存储和服务器）。
   *
   * @param timestamp 消息时间戳（以毫秒为单位）。 时间戳小于指定时间戳的消息将被删除。
   *
   * @throws 异常的描述。 请参阅{@link ChatError}。
   */
  public async removeMessagesFromServerWithTimestamp(
    timestamp: number
  ): Promise<void> {
    return Factory.getChatClient().chatManager.removeMessagesFromServerWithTimestamp(
      this.convId,
      this.convType,
      timestamp,
      this.isChatThread
    );
  }

  /**
   * 从本地获取会话中的置顶消息。
   *
   * @returns 置顶消息列表。如果没有获取到消息，则返回空列表。
   *
   * @throws 异常的描述。 请参阅{@link ChatError}。
   */
  public async getPinnedMessages(): Promise<ChatMessage[]> {
    return Factory.getChatClient().chatManager.getPinnedMessages(
      this.convId,
      this.convType,
      this.isChatThread
    );
  }

  /**
   * 从服务器获取会话中顶置的消息。
   *
   * @returns 顶置消息列表。 如果没有获取到消息，则返回空列表。
   *
   * @throws 异常的描述。 请参阅{@link ChatError}。
   */
  public async fetchPinnedMessages(): Promise<ChatMessage[]> {
    return Factory.getChatClient().chatManager.fetchPinnedMessages(
      this.convId,
      this.convType,
      this.isChatThread
    );
  }

  /**
   * 搜索本地消息。
   *
   * @params - 参数集合
   * - msgTypes: 消息类型的数组。 详见 {@link ChatMessageType}.
   * - timestamp: 时间点。
   * - count: 搜索的最大消息数。
   * - from: 消息的发送者。
   * - direction: 搜索方向。 详见 {@link ChatSearchDirection}.
   *
   * @returns 消息列表。 如果没有获取到消息，则返回空列表。
   *
   * @throws 异常的描述。 请参阅{@link ChatError}。
   */
  public async searchMessages(params: {
    msgTypes: ChatMessageType[];
    timestamp: number;
    count?: number;
    from?: string;
    direction?: ChatSearchDirection;
  }): Promise<ChatMessage[]> {
    return Factory.getChatClient().chatManager.searchMessagesInConversation({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }

  /**
   * 移除本地和服务器的消息。和该聊天会话相关的所有消息都将被删除。会话中的其他人的服务器端消息不受影响。不会删除。
   * @param params - 参数集合
   * - timestamp: 该时间点之前的消息将被删除。
   *
   * @throws 异常的描述。 请参阅{@link ChatError}。
   */
  public async removeMessagesWithTimestamp(params: {
    timestamp: number;
  }): Promise<void> {
    return Factory.getChatClient().chatManager.removeMessagesWithTimestamp({
      ...params,
      convId: this.convId,
      convType: this.convType,
      isChatThread: this.isChatThread,
    });
  }
}
