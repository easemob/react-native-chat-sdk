import { generateMessageId, getNowTimestamp } from '../__internal__/Utils';
import { ChatClient } from '../ChatClient';
import { ChatError } from './ChatError';
import type {
  ChatMessageThreadEvent,
  ChatMessageReaction,
} from 'react-native-chat-sdk';

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
 * The message sending status.
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
 * The download status of the attachment file.
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
   * Customized message.
   */
  CUSTOM = 'custom',
}

/**
 * The message body type convert.
 *
 * @param params Integer representing message body type.
 * @returns The message body type.
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
 * The message send direction convert.
 *
 * @param params The String representing message direction.
 * @returns The String.
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
 * The message status type convert.
 *
 * @param params The Integer representing message status.
 * @returns The message status.
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
 * The message status type convert.
 *
 * @param params The message status type.
 * @returns The String representing message status type.
 */
export function ChatMessageStatusToString(params: ChatMessageStatus): string {
  return ChatMessageStatus[params];
}

/**
 * The message download status type convert.
 *
 * @param params The integer representing message download status type.
 * @returns The message download status type.
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
 * The message download status type convert.
 *
 * @param params The download status type.
 * @returns The String representing download status type.
 */
export function ChatDownloadStatusToString(params: ChatDownloadStatus): string {
  return ChatDownloadStatus[params];
}

/**
 * The message type convert.
 *
 * @param params The string representing message type.
 * @returns The message type.
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
 * The message status change listener interface.
 */
export interface ChatMessageStatusCallback {
  /**
   * The progress of sending or receiving messages.
   *
   * @param progress The progress value.
   */
  onProgress(localMsgId: string, progress: number): void;

  /**
   * Error message sending or receiving.
   *
   * @param error A description of the error. See {@link ChatError}.
   */
  onError(localMsgId: string, error: ChatError): void;

  /**
   * The message is sent or received.
   * @param message The message.
   */
  onSuccess(message: ChatMessage): void;
}

/**
 * The message instance class, which represents a sent/received message.
 *
 * For example:
 *
 * Constructs a text message to send:
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
   * The server message ID.
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
   * The user ID of the message recipient.
   */
  to: string = '';
  /**
   * The local timestamp of the message.
   */
  localTime: number = getNowTimestamp();
  /**
   * The server timestamp of the message.
   */
  serverTime: number = getNowTimestamp();
  /**
   * Whether the delivery receipt is required, which is to check whether the message is delivered successfully.
   *
   * - `true`: Yes.
   * - `false`: No.
   */
  hasDeliverAck: boolean = false;
  /**
   * Whether the message read receipt is required.
   *
   * - `true`: Yes.
   * - `false`: No.
   */
  hasReadAck: boolean = false;
  /**
   * Whether read receipts are required for group messages.
   *
   * - `true`: Yes.
   * - `false`: No.
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
   * - `false`: No.
   */
  hasRead: boolean = false;
  /**
   * The chat types.
   *
   * There are three chat types: one-to-one chat, group chat, and chat room.
   */
  chatType: ChatMessageChatType = ChatMessageChatType.ChatRoom;
  /**
   * The message direction. See {@link ChatMessageDirection}
   */
  direction: ChatMessageDirection = ChatMessageDirection.SEND;
  /**
   * The message sending/reception status. See {@link ChatMessageStatus}
   */
  status: ChatMessageStatus = ChatMessageStatus.CREATE;
  /**
   * The extension attribute of the message.
   */
  attributes: Object = {};
  /**
   * The message body. See {@link ChatMessageBody)}.
   */
  body: ChatMessageBody;

  /**
   * This attribute indicates whether the message is a sub-message. If it is a sub-message, it may be a sub-message under a group message. Only group messages have submessages. Personal messages and chat room messages cannot have sub-messages. The value of this property is false for normal messages. If the group message has sub-messages, you can obtain the corresponding information by calling {@link #threadInfo}. Sub-messages of group messages receive notifications via {@link ChatMessageEventListener}.
   */
  isChatThread: boolean;

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
  }): ChatMessage {
    let r = new ChatMessage({
      from: ChatClient.getInstance().currentUserName ?? '',
      body: params.body,
      direction: 'send',
      to: params.targetId,
      hasRead: true,
      chatType: params.chatType,
      isChatThread: params.isChatThread,
    });
    return r;
  }

  /**
   * Creates a text message for sending.
   *
   * @param targetId The ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param content The text content.
   * @param chatType The conversation type.
   * @returns The message instance.
   */
  public static createTextMessage(
    targetId: string,
    content: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      isChatThread?: boolean;
      targetLanguages?: Array<string>;
    }
  ): ChatMessage {
    let s = ChatMessageType.TXT.valueOf();
    return ChatMessage.createSendMessage({
      body: new ChatTextMessageBody({
        type: s,
        content: content,
        targetLanguages: opt?.targetLanguages,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
    });
  }

  /**
   * Creates a message with file attachment for sending.
   *
   * @param targetId The ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The file path.
   * @param chatType The conversation type.
   * @param opt The file name.
   * @returns The message instance.
   */
  public static createFileMessage(
    targetId: string,
    filePath: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      displayName: string;
      isChatThread?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatFileMessageBody({
        type: ChatMessageType.FILE.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? '',
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
    });
  }

  /**
   * Creates an image message for sending.
   *
   * @param targetId The ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The image path.
   * @param chatType The conversation type.
   * @param opt
   *   @{#displayName} The image name.
   *   @{#thumbnailLocalPath} The image thumbnail path.
   *   @{#sendOriginalImage} Whether to send the original image.
   *     - `true`: Sends the original image.
   *     - `false`: (Default) Sends the thumbnail. For an image greater than 100 KB, the SDK will first compress it.
   *   @{#width} The image width in pixels.
   *   @{#height} The image height in pixels.
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
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
    });
  }

  /**
   * Creates a video message for sending.
   *
   * @param targetId The ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The path of the video file.
   * @param chatType The conversation type.
   * @param opt
   *   @{#displayName} The video name.
   *   @{#thumbnailLocalPath} The path of the thumbnail of the first frame of video.
   *   @{#duration} The video duration in seconds.
   *   @{#width} The video thumbnail width in pixels.
   *   @{#height} The video thumbnail height in pixels.
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
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
    });
  }

  /**
   * Creates a video message for sending.
   *
   * @param targetId The ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The path of the voice file.
   * @param chatType The conversation type.
   * @param opt
   *   @{#displayName} The voice name.
   *   @{#duration} The voice duration in seconds.
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
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatVoiceMessageBody({
        type: ChatMessageType.VOICE.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? '',
        duration: opt?.duration,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
    });
  }

  /**
   * Creates a location message for sending.
   *
   * @param targetId The ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param latitude The latitude.
   * @param longitude The longitude.
   * @param chatType The conversation type.
   * @param opt
   *   @{#address} The address.
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
    });
  }

  /**
   * Creates a command message for sending.
   *
   * @param targetId The ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param action The command action.
   * @param chatType The conversation type.
   * @returns The message instance.
   */
  public static createCmdMessage(
    targetId: string,
    action: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      isChatThread?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatCmdMessageBody({
        action: action,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
    });
  }

  /**
   * Creates a custom message for sending.
   *
   * @param targetId The ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param event
   * @param chatType The conversation type.
   * @param opt
   *   @{#params} Custom parameters. Key/value pair. It can be nested.
   * @returns The message instance.
   */
  public static createCustomMessage(
    targetId: string,
    event: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      params: any;
      isChatThread?: boolean;
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
    });
  }

  /**
   * Create a message from the server.
   *
   * @param params message in json format.
   * @returns message object.
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
   * Get message read count.
   *
   * **Note**
   * This parameter is valid only when it is a group type. see{@link ChatMessageChatType#GroupChat}
   */
  public get groupReadCount(): Promise<number> {
    return ChatClient.getInstance().chatManager.groupAckCount(this.msgId);
  }

  /**
   * Asynchronously returns the chat thread object.
   */
  public get threadInfo(): Promise<ChatMessageThreadEvent | undefined> {
    return ChatClient.getInstance().chatManager.getMessageThread(this.msgId);
  }
}

/**
 * The content part of the message.
 *
 * The base class for the concrete message type.
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
 * The text message body.
 */
export class ChatTextMessageBody extends ChatMessageBody {
  /**
   * The text message content.
   */
  content: string;
  /**
   * Specifies a list of languages to translate. {@link https://docs.microsoft.com/en-us/azure/cognitive-services/translator/language-support}
   */
  targetLanguages?: Array<string>;
  /**
   * The translated results are placed here.
   * It is Map Object, key is target language, value is translated content.
   */
  translations?: any;
  constructor(params: {
    type: string;
    content: string;
    targetLanguages?: Array<string>;
    translations?: any;
  }) {
    super(params.type);
    this.content = params.content;
    this.targetLanguages = params.targetLanguages;
    this.translations = params.translations;
  }
}

/**
 * The location message body.
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
 * The file message body.
 */
export class ChatFileMessageBody extends ChatMessageBody {
  /**
   * The local path of the image file.
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
   * The download status of the attachment file. See {@link ChatDownloadStatus}
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
   * Sets whether to send the original image when sending an image.
   *
   * - `false`: (Default) Sends the thumbnail. For an image larger than 100 KB, the SDK will first compress it.
   * - `true`: Sends the original image.
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
 * The video message body.
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
   * The secret key of the video thumbnail.
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
   * Checks whether to deliver to online users only.
   * - (Default)`false`: The command message is delivered users, regardless of their online or offline status.
   * - `true`: The message is delivered to the online users only, so the offline users won't receive the message when they log in later.
   */
  deliverOnlineOnly: boolean;
  constructor(params: { action: string; deliverOnlineOnly?: boolean }) {
    super(ChatMessageType.CMD);
    this.action = params.action;
    this.deliverOnlineOnly = params.deliverOnlineOnly ?? false;
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
  params: any;
  constructor(params: { event: string; params?: any }) {
    super(ChatMessageType.CUSTOM);
    this.event = params.event;
    this.params = params.params ?? {};
  }
}
