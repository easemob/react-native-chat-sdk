import {
  ChatMessage,
  type ChatMessageBody,
  type ChatMessageChatType,
  ChatMessageChatTypeFromNumber,
} from './ChatMessage';

/**
 * The result of a message searched from the server. See {@link ChatManager.searchMessagesFromServer}.
 */
export class ChatSearchServerMessageResult {
  /**
   * The message ID generated on the server.
   */
  messageId: string;
  /**
   * The user ID of the message sender.
   */
  from: string;
  /**
   * The user ID of the message recipient:
   *
   * - For the one-to-one chat, it is the user ID of the message recipient;
   * - For the group chat, it is the group ID;
   * - For the chat room chat, it is the chat room ID.
   */
  to: string;
  /**
   * The conversation ID.
   */
  conversationId: string;
  /**
   * The Unix timestamp when the message was sent. The unit is millisecond.
   */
  timestamp: number;
  /**
   * The conversation type. See {@link ChatMessageChatType}.
   */
  chatType: ChatMessageChatType;
  /**
   * The message body. See {@link ChatMessageBody}.
   */
  body?: ChatMessageBody;
  /**
   * The extension attribute of the message.
   */
  ext?: Record<string, any>;
  /**
   * The highlighted texts matched by the search keywords.
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
