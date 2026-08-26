import type { ChatMessageSearchScope, ChatMessageType } from './ChatMessage';

/**
 * 服务器端消息搜索的关键词匹配类型。
 */
export enum ChatSearchKeywordMatchType {
  /**
   * 匹配包含任意一个关键词的消息。
   */
  OR = 0,
  /**
   * 匹配包含所有关键词的消息。
   */
  AND = 1,
}

/**
 * 从服务器端搜索消息的搜索选项。详见 {@link ChatManager.searchMessagesFromServer}。
 */
export class ChatMessageSearchOption {
  /**
   * 搜索的关键词列表。
   *
   * **注意** 每个关键词包含 1 到 120 个字符，所有关键词的总长度不能超过 120 个字符，且列表中最多包含 5 个关键词。
   */
  keywordList: string[];
  /**
   * 关键词匹配类型。详见 {@link ChatSearchKeywordMatchType}。
   *
   * 默认值为 `ChatSearchKeywordMatchType.OR`。
   */
  keywordMatchType?: ChatSearchKeywordMatchType;
  /**
   * 会话 ID。
   *
   * - 单聊：对端用户的用户 ID；
   * - 群聊：群组 ID；
   * - 聊天室：聊天室 ID。
   *
   * 如果未设置该参数，将搜索所有会话中的消息。
   */
  conversationId?: string;
  /**
   * 要搜索的消息类型。详见 {@link ChatMessageType}。
   *
   * **注意** 不支持命令（CMD）消息和语音消息。
   */
  msgTypes?: ChatMessageType[];
  /**
   * 搜索时间范围的起始时间戳。单位为毫秒。
   *
   * **注意** 该参数必须与 {@link endTime} 一起设置。
   */
  startTime?: number;
  /**
   * 搜索时间范围的结束时间戳。单位为毫秒。
   *
   * **注意** 该参数必须与 {@link startTime} 一起设置。
   */
  endTime?: number;
  /**
   * 消息搜索范围。详见 {@link ChatMessageSearchScope}。
   *
   * 默认值为 `ChatMessageSearchScope.Content`，即仅搜索消息内容。
   */
  searchScope?: ChatMessageSearchScope;
  constructor(params: {
    keywordList: string[];
    keywordMatchType?: ChatSearchKeywordMatchType;
    conversationId?: string;
    msgTypes?: ChatMessageType[];
    startTime?: number;
    endTime?: number;
    searchScope?: ChatMessageSearchScope;
  }) {
    this.keywordList = params.keywordList;
    this.keywordMatchType =
      params.keywordMatchType ?? ChatSearchKeywordMatchType.OR;
    this.conversationId = params.conversationId;
    this.msgTypes = params.msgTypes;
    this.startTime = params.startTime;
    this.endTime = params.endTime;
    this.searchScope = params.searchScope;
  }
}
