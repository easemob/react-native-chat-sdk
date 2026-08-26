import {
  ChatMessage,
  type ChatMessageBody,
  type ChatMessageChatType,
  ChatMessageChatTypeFromNumber,
} from './ChatMessage';

/**
 * 服务器端消息搜索的结果。详见 {@link ChatManager.searchMessagesFromServer}。
 */
export class ChatSearchServerMessageResult {
  /**
   * 服务器生成的消息 ID。
   */
  messageId: string;
  /**
   * 消息发送者的用户 ID。
   */
  from: string;
  /**
   * 消息接收方的用户 ID：
   *
   * - 单聊：消息接收方的用户 ID；
   * - 群聊：群组 ID；
   * - 聊天室：聊天室 ID。
   */
  to: string;
  /**
   * 会话 ID。
   */
  conversationId: string;
  /**
   * 消息发送时的 Unix 时间戳。单位为毫秒。
   */
  timestamp: number;
  /**
   * 会话类型。详见 {@link ChatMessageChatType}。
   */
  chatType: ChatMessageChatType;
  /**
   * 消息体。详见 {@link ChatMessageBody}。
   */
  body?: ChatMessageBody;
  /**
   * 消息的扩展属性。
   */
  ext?: Record<string, any>;
  /**
   * 搜索关键词匹配到的高亮文本。
   */
  highlightTexts?: string[];
  constructor(params: {
    messageId?: string;
    from?: string;
    to?: string;
    conversationId?: string;
    timestamp?: number;
    chatType?: number;
    body?: any;
    ext?: Record<string, any>;
    highlightTexts?: string[];
  }) {
    this.messageId = params.messageId ?? '';
    this.from = params.from ?? '';
    this.to = params.to ?? '';
    this.conversationId = params.conversationId ?? '';
    this.timestamp = params.timestamp ?? 0;
    this.chatType = ChatMessageChatTypeFromNumber(params.chatType ?? 0);
    this.body = params.body ? ChatMessage.getBody(params.body) : undefined;
    this.ext = params.ext;
    this.highlightTexts = params.highlightTexts;
  }
}
