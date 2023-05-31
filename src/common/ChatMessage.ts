import { generateMessageId, getNowTimestamp } from '../__internal__/Utils';
import { ChatClient } from '../ChatClient';
import { ChatError } from './ChatError';
import type { ChatMessageReaction } from './ChatMessageReaction';
import type { ChatMessageThread } from './ChatMessageThread';
import type { ChatSearchDirection } from './ChatConversation';

/**
 * The conversation types.
 */
export enum ChatMessageChatType {
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
  ChatRoom = 2,
}

/**
 * The message directions.
 */
export enum ChatMessageDirection {
  /**
   * This message is sent from the local client.
   */
  SEND = 'send',
  /**
   * The message is received by the local client.
   */
  RECEIVE = 'rec',
}

/**
 * The message sending states.
 */
export enum ChatMessageStatus {
  /**
   * The message is created to be sent.
   */
  CREATE = 0,
  /**
   * The message is being delivered.
   */
  PROGRESS = 1,
  /**
   * The message is successfully delivered.
   */
  SUCCESS = 2,
  /**
   * The message fails to be delivered.
   */
  FAIL = 3,
}

/**
 * The attachment file download states.
 */
export enum ChatDownloadStatus {
  /**
   * The file message download is pending.
   */
  PENDING = -1,
  /**
   * The SDK is downloading the file message.
   */
  DOWNLOADING = 0,
  /**
   * The SDK successfully downloads the file message.
   */
  SUCCESS = 1,
  /**
   * The SDK fails to download the file message.
   */
  FAILED = 2,
}

/**
 * The message types.
 */
export enum ChatMessageType {
  /**
   * Text message.
   */
  TXT = 'txt',
  /**
   * Image message.
   */
  IMAGE = 'img',
  /**
   * Video message.
   */
  VIDEO = 'video',
  /**
   * Location message.
   */
  LOCATION = 'loc',
  /**
   * Voice message.
   */
  VOICE = 'voice',
  /**
   * File message.
   */
  FILE = 'file',
  /**
   * Command message.
   */
  CMD = 'cmd',
  /**
   * Custom message.
   */
  CUSTOM = 'custom',
}

/**
 * The priorities of chat room messages.
 */
export enum ChatRoomMessagePriority {
  /**
   * High
   */
  PriorityHigh = 0,
  /**
   * Normal. `Normal` is the default priority.
   */
  PriorityNormal,
  /**
   * Low
   */
  PriorityLow,
}

/**
 * Converts the conversation type from int to string.
 *
 * @param params The conversation type of the int type.
 * @returns The conversation type of the string type.
 */
export function ChatMessageChatTypeFromNumber(
  params: number
): ChatMessageChatType {
  switch (params) {
    case 2:
      return ChatMessageChatType.ChatRoom;
    case 1:
      return ChatMessageChatType.GroupChat;
    default:
      return ChatMessageChatType.PeerChat;
  }
}

/**
 * Converts the message direction from string to enum.
 *
 * @param params The message direction of the string type.
 * @returns The message direction of the enum type.
 */
export function ChatMessageDirectionFromString(
  params: string
): ChatMessageDirection {
  switch (params) {
    case 'send':
      return ChatMessageDirection.SEND;
    default:
      return ChatMessageDirection.RECEIVE;
  }
}

/**
 * Converts the message status from int to enum.
 *
 * @param params The message status of the int type.
 * @returns The message status of the enum type.
 */
export function ChatMessageStatusFromNumber(params: number): ChatMessageStatus {
  switch (params) {
    case 3:
      return ChatMessageStatus.FAIL;
    case 2:
      return ChatMessageStatus.SUCCESS;
    case 1:
      return ChatMessageStatus.PROGRESS;
    default:
      return ChatMessageStatus.CREATE;
  }
}

/**
 * Converts the message status from enum to string.
 *
 * @param params The message status of the enum type.
 * @returns The message status of the string type.
 */
export function ChatMessageStatusToString(params: ChatMessageStatus): string {
  return ChatMessageStatus[params];
}

/**
 * Converts the message download status from int to string.
 *
 * @param params The message download status of the int type.
 * @returns The message download status of the string type.
 */
export function ChatDownloadStatusFromNumber(
  params: number
): ChatDownloadStatus {
  switch (params) {
    case 0:
      return ChatDownloadStatus.DOWNLOADING;
    case 1:
      return ChatDownloadStatus.SUCCESS;
    case 2:
      return ChatDownloadStatus.FAILED;
    default:
      return ChatDownloadStatus.PENDING;
  }
}

/**
 * Converts the message download status from int to string.
 *
 * @param params The message download status of the int type.
 * @returns The message download status of the string type.
 */
export function ChatDownloadStatusToString(params: ChatDownloadStatus): string {
  return ChatDownloadStatus[params];
}

/**
 * Converts the message type from string to enum.
 *
 * @param params The message type of the string type.
 * @returns The message type of the enum type.
 */
export function ChatMessageTypeFromString(params: string): ChatMessageType {
  switch (params) {
    case 'txt':
      return ChatMessageType.TXT;
    case 'loc':
      return ChatMessageType.LOCATION;
    case 'cmd':
      return ChatMessageType.CMD;
    case 'custom':
      return ChatMessageType.CUSTOM;
    case 'file':
      return ChatMessageType.FILE;
    case 'img':
      return ChatMessageType.IMAGE;
    case 'video':
      return ChatMessageType.VIDEO;
    case 'voice':
      return ChatMessageType.VOICE;
    default:
      throw new ChatError({
        code: 1,
        description: `This type is not supported. ` + params,
      });
  }
}

/**
 * The message status change listener.
 */
export interface ChatMessageStatusCallback {
  /**
   * Occurs when a message is uploaded or downloaded.
   *
   * @param progress The message upload/download progress value. The value range is 0 to 100 in percentage.
   */
  onProgress?(localMsgId: string, progress: number): void;

  /**
   * Occurs when a message error occurs.
   *
   * @param error A description of the error. See {@link ChatError}.
   */
  onError(localMsgId: string, error: ChatError): void;

  /**
   * Occurs when a message is successfully delivered.
   *
   * @param message The message that is successfully delivered.
   */
  onSuccess(message: ChatMessage): void;
}

/**
 * The message class that defines a message that is to be sent or received.
 *
 * For example, construct a text message to send:
 *
 * ```typescript
 *   let msg = ChatMessage.createTextMessage(
 *         'asteriskhx2',
 *         Date.now().toString(),
 *         ChatMessageChatType.PeerChat
 *       );
 * ```
 */
export class ChatMessage {
  static TAG = 'ChatMessage';
  /**
   * The message ID generated on the server.
   */
  msgId: string = generateMessageId();
  /**
   * The local message ID.
   */
  localMsgId: string = '';
  /**
   * The conversation ID.
   */
  conversationId: string = '';
  /**
   * The user ID of the message sender.
   */
  from: string = '';
  /**
   * The user ID of the message recipient:
   *
   * - For the one-to-one chat, it is the user ID of the message recipient;
   * - For the group chat, it is the group ID;
   * - For the chat room chat, it is the chat room ID;
   * - For a message thread, it is the ID of the message thread.
   */
  to: string = '';
  /**
   * The Unix timestamp when the message is created locally. The unit is millisecond.
   */
  localTime: number = getNowTimestamp();
  /**
   * The Unix timestamp when the server receives the message. The unit is millisecond.
   */
  serverTime: number = getNowTimestamp();
  /**
   * Whether the delivery receipt is required, which is to check whether the message is delivered successfully.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  hasDeliverAck: boolean = false;
  /**
   * Whether the message read receipt is required.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  hasReadAck: boolean = false;
  /**
   * Whether read receipts are required for group messages.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  needGroupAck: boolean = false;
  /**
   * The number of members that have read the group message.
   */
  groupAckCount: number = 0;
  /**
   * Whether the message is read.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  hasRead: boolean = false;
  /**
   * The conversation type. See {@link ChatType}.
   */
  chatType: ChatMessageChatType = ChatMessageChatType.ChatRoom;
  /**
   * The message direction. See {@link ChatMessageDirection}.
   */
  direction: ChatMessageDirection = ChatMessageDirection.SEND;
  /**
   * The message sending status. See {@link ChatMessageStatus}.
   */
  status: ChatMessageStatus = ChatMessageStatus.CREATE;
  /**
   * The extension attribute of the message.
   */
  attributes: Object = {};
  /**
   * The message body. See {@link ChatMessageBody}.
   */
  body: ChatMessageBody;

  /**
   * Whether it is a message in a message thread.
   * 
   * - `true`: Yes. In this case, you need to set the user ID of the message recipient to the message thread ID. See {@link to}.
   * - `false`: No.
   *
   * **Note**

   * This parameter is valid only for group chat.
   */
  isChatThread: boolean;

  /**
   * Whether it is a online message.
   *
   * - `true`: Yes. In this case, if the application is running in the background, a notification window may pop up.
   * - `false`: No.
   */
  isOnline: boolean;

  /**
   * The delivery priorities of chat room messages.
   * **Note** Only for chat rooms.
   */
  private priority?: ChatRoomMessagePriority;

  /**
   * Whether the message is delivered only when the recipient(s) is/are online:
   * - `true`：The message is delivered only when the recipient(s) is/are online. If the recipient is offline, the message is discarded.
   * - (Default) `false`：The message is delivered when the recipient(s) is/are online. If the recipient(s) is/are offline, the message will not be delivered to them until they get online.
   */
  deliverOnlineOnly: boolean;

  /**
   * Constructs a message.
   */
  public constructor(params: {
    msgId?: string;
    localMsgId?: string;
    conversationId?: string;
    from?: string;
    to?: string;
    localTime?: number;
    serverTime?: number;
    hasDeliverAck?: boolean;
    hasReadAck?: boolean;
    needGroupAck?: boolean;
    groupAckCount?: number;
    hasRead?: boolean;
    chatType?: number;
    direction?: string;
    status?: number;
    attributes?: any;
    body: any;
    isChatThread?: boolean;
    isOnline?: boolean;
    deliverOnlineOnly?: boolean;
  }) {
    this.msgId = params.msgId ?? generateMessageId();
    this.conversationId = params.conversationId ?? '';
    this.from = params.from ?? '';
    this.to = params.to ?? '';
    this.localTime = params.localTime ?? getNowTimestamp();
    this.serverTime = params.serverTime ?? getNowTimestamp();
    this.hasDeliverAck = params.hasDeliverAck ?? false;
    this.hasReadAck = params.hasReadAck ?? false;
    this.needGroupAck = params.needGroupAck ?? false;
    this.groupAckCount = params.groupAckCount ?? 0;
    this.hasRead = params.hasRead ?? false;
    this.chatType = ChatMessageChatTypeFromNumber(params.chatType ?? 0);
    this.direction = ChatMessageDirectionFromString(params.direction ?? 'send');
    this.status = ChatMessageStatusFromNumber(params.status ?? 0);
    this.attributes = params.attributes ?? {};
    this.body = ChatMessage.getBody(params.body);
    this.localMsgId = this.localTime.toString();
    this.isChatThread = params.isChatThread ?? false;
    this.isOnline = params.isOnline ?? true;
    this.deliverOnlineOnly = params.deliverOnlineOnly ?? false;
  }

  private static getBody(params: any): ChatMessageBody {
    let type = ChatMessageTypeFromString(params.type as string);
    switch (type) {
      case ChatMessageType.TXT:
        return new ChatTextMessageBody(params);

      case ChatMessageType.LOCATION:
        return new ChatLocationMessageBody(params);

      case ChatMessageType.CMD:
        return new ChatCmdMessageBody(params);

      case ChatMessageType.CUSTOM:
        return new ChatCustomMessageBody(params);

      case ChatMessageType.FILE:
        return new ChatFileMessageBody(params);

      case ChatMessageType.IMAGE:
        return new ChatImageMessageBody(params);

      case ChatMessageType.VIDEO:
        return new ChatVideoMessageBody(params);

      case ChatMessageType.VOICE:
        return new ChatVoiceMessageBody(params);

      default:
        throw new ChatError({
          code: 1,
          description: `This type is not supported. ` + type,
        });
    }
  }

  private static createSendMessage(params: {
    body: ChatMessageBody;
    targetId: string;
    chatType: ChatMessageChatType;
    isChatThread?: boolean;
    isOnline?: boolean;
    deliverOnlineOnly?: boolean;
  }): ChatMessage {
    let r = new ChatMessage({
      from: ChatClient.getInstance().currentUserName ?? '',
      body: params.body,
      direction: 'send',
      to: params.targetId,
      hasRead: true,
      chatType: params.chatType,
      isChatThread: params.isChatThread,
      conversationId: params.targetId,
      isOnline: params.isOnline,
      deliverOnlineOnly: params.deliverOnlineOnly,
    });
    return r;
  }

  /**
   * Creates a text message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param content The text content.
   * @param chatType The conversation type. See {@link ChatType}.
   * @param opt The extension parameters of the message.
   *  - targetLanguageCodes: The language code. See {@link ChatTextMessageBody.targetLanguageCodes}.
   *  -  isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * @returns The message instance.
   */
  public static createTextMessage(
    targetId: string,
    content: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      isChatThread?: boolean;
      targetLanguageCodes?: Array<string>;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
    }
  ): ChatMessage {
    let s = ChatMessageType.TXT.valueOf();
    return ChatMessage.createSendMessage({
      body: new ChatTextMessageBody({
        type: s,
        content: content,
        targetLanguageCodes: opt?.targetLanguageCodes,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
    });
  }

  /**
   * Creates a message with a file attachment for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The file path.
   * @param chatType The conversation type. See {@link ChatType}.
   * @param opt The extension parameters of the message.
   * - displayName: The file name.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * @returns The message instance.
   */
  public static createFileMessage(
    targetId: string,
    filePath: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      displayName: string;
      isChatThread?: boolean;
      fileSize?: number;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatFileMessageBody({
        type: ChatMessageType.FILE.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? '',
        fileSize: opt?.fileSize,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
    });
  }

  /**
   * Creates an image message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The image path.
   * @param chatType The conversation type. See {@link ChatType}.
   * @param opt The extension parameters of the message.
   * - displayName: The image name.
   * - thumbnailLocalPath: The image thumbnail path.
   * - sendOriginalImage: Whether to send the original image.
   *   - `true`: Yes.
   *   - (Default) `false`: If the image is equal to or greater than 100 KB, the SDK will compress it before sending the compressed image.
   * - width: The image width in pixels.
   * - height: The image height in pixels.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * @returns The message instance.
   */
  public static createImageMessage(
    targetId: string,
    filePath: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      displayName: string;
      thumbnailLocalPath?: string;
      sendOriginalImage?: boolean;
      width: number;
      height: number;
      isChatThread?: boolean;
      fileSize?: number;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatImageMessageBody({
        type: ChatMessageType.IMAGE.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? filePath,
        thumbnailLocalPath: opt?.thumbnailLocalPath,
        sendOriginalImage: opt?.sendOriginalImage ?? false,
        width: opt?.width,
        height: opt?.height,
        fileSize: opt?.fileSize,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
    });
  }

  /**
   * Creates a video message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The path of the video file.
   * @param chatType The conversation type. See {@link ChatType}.
   * @param opt The extension parameters of the message.
   * - displayName: The video file name.
   * - thumbnailLocalPath: The path of the thumbnail of the first frame of video.
   * - duration: The video duration in seconds.
   * - width: The video thumbnail width in pixels.
   * - height: The video thumbnail height in pixels.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * @returns The message instance.
   */
  public static createVideoMessage(
    targetId: string,
    filePath: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      displayName: string;
      thumbnailLocalPath: string;
      duration: number;
      width: number;
      height: number;
      isChatThread?: boolean;
      fileSize?: number;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatVideoMessageBody({
        type: ChatMessageType.VIDEO.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? '',
        thumbnailLocalPath: opt?.thumbnailLocalPath,
        duration: opt?.duration,
        width: opt?.width,
        height: opt?.height,
        fileSize: opt?.fileSize,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
    });
  }

  /**
   * Creates a voice message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The path of the voice file.
   * @param chatType The conversation type. See {@link ChatType}.
   * @param opt The extension parameters of the message.
   * - displayName: The voice file name.
   * - duration: The voice duration in seconds.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * @returns The message instance.
   */
  public static createVoiceMessage(
    targetId: string,
    filePath: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      displayName: string;
      duration: number;
      isChatThread?: boolean;
      fileSize?: number;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatVoiceMessageBody({
        type: ChatMessageType.VOICE.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? '',
        duration: opt?.duration,
        fileSize: opt?.fileSize,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
    });
  }

  /**
   * Creates a location message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param latitude The latitude.
   * @param longitude The longitude.
   * @param chatType The conversation type. See {@link ChatType}.
   * @param opt The extension parameters of the message.
   * - address: The location details.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * @returns The message instance.
   */
  public static createLocationMessage(
    targetId: string,
    latitude: string,
    longitude: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      address: string;
      isChatThread?: boolean;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatLocationMessageBody({
        type: ChatMessageType.LOCATION.valueOf(),
        latitude: latitude,
        longitude: longitude,
        address: opt?.address ?? '',
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
    });
  }

  /**
   * Creates a command message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param action The command action.
   * @param chatType The conversation type. See {@link ChatType}.
   * @param opt The extension parameters of the message.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * - deliverOnlineOnly: Whether this command message is delivered only to the online users.
   *   - (Default) `true`: Yes.
   *   - `false`: No. The command message is delivered to users, regardless of their online or offline status.
   * @returns The message instance.
   */
  public static createCmdMessage(
    targetId: string,
    action: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      isChatThread?: boolean;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatCmdMessageBody({
        action: action,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
    });
  }

  /**
   * Creates a custom message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param event The custom event.
   * @param chatType The conversation type. See {@link ChatType}.
   * @param opt The extension parameters of the message.
   * - params: The dictionary of custom parameters.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * @returns The message instance.
   */
  public static createCustomMessage(
    targetId: string,
    event: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      params: Record<string, string>;
      isChatThread?: boolean;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatCustomMessageBody({
        event: event,
        params: opt?.params,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
    });
  }

  /**
   * Creates a received message instance.
   *
   * @param params The received message.
   * @returns The message object.
   */
  public static createReceiveMessage(params: any): ChatMessage {
    return new ChatMessage(params);
  }

  /**
   * Gets the list of Reactions.
   */
  public get reactionList(): Promise<Array<ChatMessageReaction>> {
    return ChatClient.getInstance().chatManager.getReactionList(this.msgId);
  }

  /**
   * Gets the count of read receipts of a group message.
   */
  public get groupReadCount(): Promise<number> {
    return ChatClient.getInstance().chatManager.groupAckCount(this.msgId);
  }

  /**
   * Gets details of a message thread.
   */
  public get threadInfo(): Promise<ChatMessageThread | undefined> {
    return ChatClient.getInstance().chatManager.getMessageThread(this.msgId);
  }

  /**
   * Set the chat room message priority.
   */
  public set messagePriority(p: ChatRoomMessagePriority) {
    this.priority = p;
  }
}

/**
 * The message body base class.
 */
export class ChatMessageBody {
  /**
   * The message type. See {@link ChatMessageType}.
   */
  type: ChatMessageType;

  constructor(type: string) {
    this.type = ChatMessageTypeFromString(type);
  }
}

/**
 * The text message body class.
 */
export class ChatTextMessageBody extends ChatMessageBody {
  /**
   * The text message content.
   */
  content: string;
  /**
   * The target language for translation. See {@link https://docs.microsoft.com/en-us/azure/cognitive-services/translator/language-support}.
   */
  targetLanguageCodes?: Array<string>;
  /**
   * The translation.
   *
   * It is a KV object, where the key is the target language and the value is the translation.
   */
  translations?: any;
  constructor(params: {
    type: string;
    content: string;
    targetLanguageCodes?: Array<string>;
    translations?: any;
  }) {
    super(params.type);
    this.content = params.content;
    this.targetLanguageCodes = params.targetLanguageCodes;
    this.translations = params.translations;
  }
}

/**
 * The location message body class.
 */
export class ChatLocationMessageBody extends ChatMessageBody {
  /**
   * The address.
   */
  address: string;
  /**
   * The latitude.
   */
  latitude: string;
  /**
   * The longitude.
   */
  longitude: string;
  constructor(params: {
    type: string;
    address: string;
    latitude: string;
    longitude: string;
  }) {
    super(params.type);
    this.address = params.address;
    this.latitude = params.latitude;
    this.longitude = params.longitude;
  }
}

/**
 * The file message body class.
 */
export class ChatFileMessageBody extends ChatMessageBody {
  /**
   * The local path of the file.
   */
  localPath: string = '';
  /**
   * The token to download the file attachment.
   */
  secret: string;
  /**
   * The path of the attachment file in the server.
   */
  remotePath: string;
  /**
   * The download status of the attachment file. See {@link ChatDownloadStatus}.
   */
  fileStatus: ChatDownloadStatus;
  /**
   * The size of the file in bytes.
   */
  fileSize: number;
  /**
   * The file name.
   */
  displayName: string;

  constructor(params: {
    type: string;
    localPath: string;
    secret?: string;
    remotePath?: string;
    fileStatus?: number;
    fileSize?: number;
    displayName: string;
  }) {
    super(params.type);
    this.localPath = params.localPath;
    this.secret = params.secret ?? '';
    this.remotePath = params.remotePath ?? '';
    this.fileStatus = ChatDownloadStatusFromNumber(params.fileStatus ?? -1);
    this.fileSize = params.fileSize ?? 0;
    this.displayName = params.displayName;
  }
}

/**
 * The image message body class.
 */
export class ChatImageMessageBody extends ChatFileMessageBody {
  /**
   Whether to send the original image.
  * - `true`: Yes. 
  * - (Default) `false`: No. If the image is smaller than 100 KB, the SDK sends the original image. If the image is equal to or greater than 100 KB, the SDK will compress it before sending the compressed image.
   */
  sendOriginalImage: boolean;
  /**
   * The local path or the URI of the thumbnail as a string.
   */
  thumbnailLocalPath: string;
  /**
   * The URL of the thumbnail on the server.
   */
  thumbnailRemotePath: string;
  /**
   * The secret to access the thumbnail. A secret is required for verification for thumbnail download.
   */
  thumbnailSecret: string;
  /**
   * The download status of the thumbnail. See {@link ChatDownloadStatus}
   */
  thumbnailStatus: ChatDownloadStatus;
  /**
   * The image width in pixels.
   */
  width: number;
  /**
   * The image height in pixels.
   */
  height: number;
  constructor(params: {
    type: string;
    localPath: string;
    secret?: string;
    remotePath?: string;
    fileStatus?: number;
    fileSize?: number;
    displayName: string;
    sendOriginalImage?: boolean;
    thumbnailLocalPath?: string;
    thumbnailRemotePath?: string;
    thumbnailSecret?: string;
    thumbnailStatus?: number;
    width?: number;
    height?: number;
  }) {
    super({
      type: params.type,
      localPath: params.localPath,
      secret: params.secret,
      remotePath: params.remotePath,
      fileStatus: params.fileStatus,
      fileSize: params.fileSize,
      displayName: params.displayName,
    });
    this.sendOriginalImage = params.sendOriginalImage ?? false;
    this.thumbnailLocalPath = params.thumbnailLocalPath ?? '';
    this.thumbnailRemotePath = params.thumbnailRemotePath ?? '';
    this.thumbnailSecret = params.thumbnailSecret ?? '';
    this.thumbnailStatus = ChatDownloadStatusFromNumber(
      params.thumbnailStatus ?? -1
    );
    this.width = params.width ?? 0;
    this.height = params.height ?? 0;
  }
}

/**
 * The video message body class.
 */
export class ChatVideoMessageBody extends ChatFileMessageBody {
  /**
   * The video duration in seconds.
   */
  duration: number;
  /**
   * The local path of the video thumbnail.
   */
  thumbnailLocalPath: string;
  /**
   * The URL of the thumbnail on the server.
   */
  thumbnailRemotePath: string;
  /**
   * The secret to download the video thumbnail.
   */
  thumbnailSecret: string;
  /**
   * The download status of the video thumbnail. See {@link ChatDownloadStatus}
   */
  thumbnailStatus: ChatDownloadStatus;
  /**
   * The video width in pixels.
   */
  width: number;
  /**
   * The video height in pixels.
   */
  height: number;
  constructor(params: {
    type: string;
    localPath: string;
    secret?: string;
    remotePath?: string;
    fileStatus?: number;
    fileSize?: number;
    displayName: string;
    duration?: number;
    thumbnailLocalPath?: string;
    thumbnailRemotePath?: string;
    thumbnailSecret?: string;
    thumbnailStatus?: ChatDownloadStatus;
    width?: number;
    height?: number;
  }) {
    super({
      type: params.type,
      localPath: params.localPath,
      secret: params.secret,
      remotePath: params.remotePath,
      fileStatus: params.fileStatus,
      fileSize: params.fileSize,
      displayName: params.displayName,
    });
    this.duration = params.duration ?? 0;
    this.thumbnailLocalPath = params.thumbnailLocalPath ?? '';
    this.thumbnailRemotePath = params.thumbnailRemotePath ?? '';
    this.thumbnailSecret = params.thumbnailSecret ?? '';
    this.thumbnailStatus = ChatDownloadStatusFromNumber(
      params.thumbnailStatus ?? -1
    );
    this.width = params.width ?? 0;
    this.height = params.height ?? 0;
  }
}

/**
 * The voice message body.
 */
export class ChatVoiceMessageBody extends ChatFileMessageBody {
  /**
   * The voice duration in seconds.
   */
  duration: number;
  constructor(params: {
    type: string;
    localPath: string;
    secret?: string;
    remotePath?: string;
    fileStatus?: number;
    fileSize?: number;
    displayName: string;
    duration?: number;
  }) {
    super({
      type: params.type,
      localPath: params.localPath,
      secret: params.secret,
      remotePath: params.remotePath,
      fileStatus: params.fileStatus,
      fileSize: params.fileSize,
      displayName: params.displayName,
    });
    this.duration = params.duration ?? 0;
  }
}

/**
 * The command message body.
 */
export class ChatCmdMessageBody extends ChatMessageBody {
  /**
   * The command action.
   */
  action: string;
  /**
   * Whether the message is delivered only when the recipient(s) is/are online:
   * -  (Default) `false`: The message is delivered when the recipient(s) is/are online. If the recipient(s) is/are offline, the message will not be delivered to them until they get online.
   * - `true`: The message is delivered only when the recipient(s) is/are online. If the recipient is offline, the message is discarded.
   */
  deliverOnlineOnly: boolean;
  constructor(params: { action: string }) {
    super(ChatMessageType.CMD);
    this.action = params.action;
  }
}

/**
 * The custom message body.
 */
export class ChatCustomMessageBody extends ChatMessageBody {
  /**
   * The event.
   */
  event: string;
  /**
   * The custom params map.
   */
  params?: Record<string, string>;
  constructor(params: { event: string; params?: Record<string, string> }) {
    super(ChatMessageType.CUSTOM);
    this.event = params.event;
    this.params = params.params;
  }
}

/**
 * The parameter configuration class for pulling historical messages from the server.
 */
export class ChatFetchMessageOptions {
  /**
   * The user ID of the message sender in the group conversation.
   */
  from?: string;
  /**
   * The array of message types for query. The default value is `undefined`, indicating that all types of messages are retrieved.
   */
  msgTypes?: ChatMessageType[];
  /**
   * The start time for message query. The time is a UNIX time stamp in milliseconds. The default value is -1,indicating that this parameter is ignored during message query.If the [startTs] is set to a specific time spot and the [endTs] uses the default value -1,the SDK returns messages that are sent and received in the period that is from the start time to the current time.If the [startTs] uses the default value -1 and the [endTs] is set to a specific time spot,the SDK returns messages that are sent and received in the period that is from the timestamp of the first message to the current time.
   */
  startTs: number;
  /**
   * The end time for message query. The time is a UNIX time stamp in milliseconds.
   */
  endTs: number;
  /**
   * The message search direction, Default is {@link ChatSearchDirection.UP}.
   */
  direction: ChatSearchDirection;
  /**
   * Whether to save the retrieved messages to the database:
   * - `true`: save to database;
   * - `false`(Default)：no save to database.
   */
  needSave: boolean;
  constructor(params: {
    from?: string;
    msgTypes?: ChatMessageType[];
    startTs: number;
    endTs: number;
    direction: ChatSearchDirection;
    needSave: boolean;
  }) {
    this.from = params.from;
    this.startTs = params.startTs;
    this.endTs = params.endTs;
    this.direction = params.direction;
    this.needSave = params.needSave;
    this.msgTypes = params.msgTypes;
  }
}
