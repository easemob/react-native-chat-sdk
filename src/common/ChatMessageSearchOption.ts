import type { ChatMessageSearchScope, ChatMessageType } from './ChatMessage';

/**
 * The keyword matching types for the server-side message search.
 */
export enum ChatSearchKeywordMatchType {
  /**
   * Matches messages that contain any of the keywords.
   */
  OR = 0,
  /**
   * Matches messages that contain all of the keywords.
   */
  AND = 1,
}

/**
 * The search options for searching messages from the server. See {@link ChatManager.searchMessagesFromServer}.
 */
export class ChatMessageSearchOption {
  /**
   * The keyword list for the search.
   *
   * **Note** Each keyword contains 1 to 120 characters, the total length of all keywords cannot exceed 120 characters, and the list contains a maximum of 5 keywords.
   */
  keywordList: string[];
  /**
   * The keyword matching type. See {@link ChatSearchKeywordMatchType}.
   *
   * The default value is `ChatSearchKeywordMatchType.OR`.
   */
  keywordMatchType?: ChatSearchKeywordMatchType;
  /**
   * The conversation ID.
   *
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   *
   * If this parameter is not set, messages in all conversations are searched.
   */
  conversationId?: string;
  /**
   * The message types to search for. See {@link ChatMessageType}.
   *
   * **Note** Command (CMD) and voice messages are not supported.
   */
  msgTypes?: ChatMessageType[];
  /**
   * The start timestamp of the time range to search. The unit is millisecond.
   *
   * **Note** This parameter must be set together with {@link endTime}.
   */
  startTime?: number;
  /**
   * The end timestamp of the time range to search. The unit is millisecond.
   *
   * **Note** This parameter must be set together with {@link startTime}.
   */
  endTime?: number;
  /**
   * The message search scope. See {@link ChatMessageSearchScope}.
   *
   * The default value is `ChatMessageSearchScope.Content`, which means that only the message content is searched.
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
