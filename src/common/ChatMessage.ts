import { generateMessageId, getNowTimestamp } from '../_internal/Utils';
import { ChatClient } from '../ChatClient';
import type { ChatError } from './ChatError';

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
 * The enumeration of the message MessageDirection.
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
 * The enumeration of the message sending/reception status.
 *
 * The states include success, failure, being sent/being received, and created to be sent.
 */
export enum ChatMessageStatus {
  /**
   * The message is created to be sent.
   */
  CREATE = 0,
  /**
   * The message is being delivered/receiving.
   */
  PROGRESS = 1,
  /**
   * The message is successfully delivered/received.
   */
  SUCCESS = 2,
  /**
   * The message fails to be delivered/received.
   */
  FAIL = 3,
}

/**
 * The download status of the attachment file .
 */
export enum ChatDownloadStatus {
  /**
   * File message download is pending.
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
 * The enumeration of the message type.
 */
export enum ChatMessageBodyType {
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
export function ChatGroupPermissionTypeToString(
  params: ChatMessageChatType
): string {
  return ChatMessageChatType[params];
}

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
export function ChatMessageStatusToString(params: ChatMessageStatus): string {
  return ChatMessageStatus[params];
}

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
export function ChatDownloadStatusToString(params: ChatDownloadStatus): string {
  return ChatDownloadStatus[params];
}

export function ChatMessageBodyTypeFromString(
  params: string
): ChatMessageBodyType {
  switch (params) {
    case 'txt':
      return ChatMessageBodyType.TXT;
    case 'loc':
      return ChatMessageBodyType.LOCATION;
    case 'cmd':
      return ChatMessageBodyType.CMD;
    case 'custom':
      return ChatMessageBodyType.CUSTOM;
    case 'file':
      return ChatMessageBodyType.FILE;
    case 'img':
      return ChatMessageBodyType.IMAGE;
    case 'video':
      return ChatMessageBodyType.VIDEO;
    case 'voice':
      return ChatMessageBodyType.VOICE;
    default:
      throw new Error(`not exist this type: ${params}`);
  }
}

/**
 * Message status listener.
 */
export interface ChatMessageStatusCallback {
  /**
   * The progress of sending or receiving messages.
   *
   * @param progress Progress of the value.
   */
  onProgress(localMsgId: string, progress: number): void;

  /**
   * Error message sending or receiving.
   *
   * @param error Error, see {@link ChatError}
   */
  onError(localMsgId: string, error: ChatError): void;

  /**
   * The message is sent or received.
   * @param message The message.
   */
  onSuccess(message: ChatMessage): void;
}

/**
 * The message instance, which represents a sent/received message.
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
   * Gets the message ID.
   */
  msgId: string = generateMessageId();
  /**
   * Gets the local message ID.
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
   * The delivery receipt, which is to check whether the other party has received the message.
   *
   * Whether the other party has received the message.
   * `true`:the message has been delivered to the other party.
   */
  hasDeliverAck: boolean = false;
  /**
   * Whether the message has been read.
   *
   * Whether the other party has read the message.
   * `true`: The message has been read by the other party.
   */
  hasReadAck: boolean = false;
  /**
   * Sets whether read receipts are required for group messages.
   *
   * `true`: Read receipts are required;
   * `false`: Read receipts are NOT required.
   */
  needGroupAck: boolean = false;
  /**
   * Gets the number of members that have read the group message.
   */
  groupAckCount: number = 0;
  /**
   * Checks whether the message is read.
   *
   * `true`: The message is read.
   * `false`: The message is unread.
   */
  hasRead: boolean = false;
  /**
   * The enumeration of the chat type.
   *
   * There are three chat types: one-to-one chat, group chat, and chat room.
   */
  chatType: ChatMessageChatType = ChatMessageChatType.ChatRoom;
  /**
   * The message direction. see {@link ChatMessageDirection}
   */
  direction: ChatMessageDirection = ChatMessageDirection.SEND;
  /**
   * Gets the message sending/reception status. see {@link ChatMessageStatus}
   */
  status: ChatMessageStatus = ChatMessageStatus.CREATE;
  /**
   * Message's extension attribute.
   */
  attributes: Object = {};
  /**
   * Message body. We recommend you use {@link ChatMessageBody)}.
   */
  body: ChatMessageBody;

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
    attributes?: Object;
    body: Object;
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
  }

  private static getBody(params: any): ChatMessageBody {
    let type = ChatMessageBodyTypeFromString(params.type as string);
    switch (type) {
      case ChatMessageBodyType.TXT:
        return new ChatTextMessageBody(params);

      case ChatMessageBodyType.LOCATION:
        return new ChatLocationMessageBody(params);

      case ChatMessageBodyType.CMD:
        return new ChatCmdMessageBody(params);

      case ChatMessageBodyType.CUSTOM:
        return new ChatCustomMessageBody(params);

      case ChatMessageBodyType.FILE:
        return new ChatFileMessageBody(params);

      case ChatMessageBodyType.IMAGE:
        return new ChatImageMessageBody(params);

      case ChatMessageBodyType.VIDEO:
        return new ChatVideoMessageBody(params);

      case ChatMessageBodyType.VOICE:
        return new ChatVoiceMessageBody(params);

      default:
        throw new Error(`not exist this type: ${type}`);
    }
  }

  private static createSendMessage(
    body: ChatMessageBody,
    targetId: string,
    chatType: ChatMessageChatType
  ): ChatMessage {
    let r = new ChatMessage({
      from: ChatClient.getInstance().currentUserName ?? '',
      body: body,
      direction: 'send',
      to: targetId,
      hasRead: true,
      chatType: chatType,
    });
    return r;
  }

  /**
   * Creates a text message for sending.
   *
   * @param targetId The ID of the message recipient(user or group).
   * @param content The text content.
   * @param chatType The Conversation type.
   * @returns The message instance.
   */
  public static createTextMessage(
    targetId: string,
    content: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat
  ): ChatMessage {
    let s = ChatMessageBodyType.TXT.valueOf();
    return ChatMessage.createSendMessage(
      new ChatTextMessageBody({ type: s, content: content }),
      targetId,
      chatType
    );
  }

  /**
   * Creates a file message for sending.
   *
   * @param targetId The ID of the message recipient(user or group).
   * @param filePath The file path.
   * @param chatType The Conversation type.
   * @param opt The file name. like 'readme.doc'
   * @returns The message instance.
   */
  public static createFileMessage(
    targetId: string,
    filePath: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      displayName: string;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage(
      new ChatFileMessageBody({
        type: ChatMessageBodyType.FILE.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? '',
      }),
      targetId,
      chatType
    );
  }

  /**
   *  Creates a image message for sending.
   *
   * @param targetId The ID of the message recipient(user or group).
   * @param filePath The image path.
   * @param chatType The Conversation type.
   * @param opt
   *   @{#displayName} The image name. like 'image.jpeg'
   *   @{#thumbnailLocalPath} The image thumbnail path.
   *   @{#sendOriginalImage} Whether to send the original image.
   *     `true`: Send the original image.
   *     `false`: (default) For an image greater than 100 KB, the SDK will compress it.
   *   @{#width} The image width.
   *   @{#height} The image height.
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
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage(
      new ChatImageMessageBody({
        type: ChatMessageBodyType.IMAGE.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? filePath,
        thumbnailLocalPath: opt?.thumbnailLocalPath,
        sendOriginalImage: opt?.sendOriginalImage ?? false,
        width: opt?.width,
        height: opt?.height,
      }),
      targetId,
      chatType
    );
  }

  /**
   * Creates a video message for sending.
   *
   * @param targetId The ID of the message recipient(user or group).
   * @param filePath The path of the video file.
   * @param chatType The Conversation type.
   * @param opt
   *   @{#displayName} The video name. like 'video.mp4'
   *   @{#thumbnailLocalPath} The path of the thumbnail of the first frame of video.
   *   @{#duration} The video duration in seconds.
   *   @{#width} The video thumbnail image width.
   *   @{#height} The video thumbnail image height.
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
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage(
      new ChatVideoMessageBody({
        type: ChatMessageBodyType.VIDEO.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? '',
        thumbnailLocalPath: opt?.thumbnailLocalPath,
        duration: opt?.duration,
        width: opt?.width,
        height: opt?.height,
      }),
      targetId,
      chatType
    );
  }

  /**
   * Creates a video message for sending.
   *
   * @param targetId The ID of the message recipient(user or group).
   * @param filePath The path of the voice file.
   * @param chatType The Conversation type.
   * @param opt
   *   @{#displayName} The voice name. like 'voice.mp3'
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
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage(
      new ChatVoiceMessageBody({
        type: ChatMessageBodyType.VOICE.valueOf(),
        localPath: filePath,
        displayName: opt?.displayName ?? '',
        duration: opt?.duration,
      }),
      targetId,
      chatType
    );
  }

  /**
   * Creates a location message for sending.
   *
   * @param targetId The ID of the message recipient(user or group).
   * @param latitude The latitude.
   * @param longitude The longitude.
   * @param chatType The Conversation type.
   * @param opt
   *   @{#address} Place names. like `beijing`.
   * @returns The message instance.
   */
  public static createLocationMessage(
    targetId: string,
    latitude: string,
    longitude: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      address: string;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage(
      new ChatLocationMessageBody({
        type: ChatMessageBodyType.LOCATION.valueOf(),
        latitude: latitude,
        longitude: longitude,
        address: opt?.address ?? '',
      }),
      targetId,
      chatType
    );
  }

  /**
   * Creates a cmd message for sending.
   *
   * @param targetId The ID of the message recipient(user or group).
   * @param action Action behavior.
   * @param chatType The Conversation type.
   * @returns The message instance.
   */
  public static createCmdMessage(
    targetId: string,
    action: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat
  ): ChatMessage {
    return ChatMessage.createSendMessage(
      new ChatCmdMessageBody({
        action: action,
      }),
      targetId,
      chatType
    );
  }

  /**
   * Creates a custom message for sending.
   *
   * @param targetId The ID of the message recipient(user or group).
   * @param event
   * @param chatType The Conversation type.
   * @param opt
   *   @{#params} Custom parameters. Key/value pair. It can be nested.
   * @returns The message instance.
   */
  public static createCustomMessage(
    targetId: string,
    event: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      params: Map<string, any>;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage(
      new ChatCustomMessageBody({
        event: event,
        params: opt?.params,
      }),
      targetId,
      chatType
    );
  }

  public static createReceiveMessage(params: any): ChatMessage {
    return new ChatMessage(params);
  }
}

/**
 * The content part of the message.
 *
 * The base class for the concrete message type.
 */
export class ChatMessageBody {
  /**
   * Message type. see {@link ChatMessageBodyType}
   */
  type: ChatMessageBodyType;

  constructor(type: string) {
    this.type = ChatMessageBodyTypeFromString(type);
  }
}

/**
 * Text message body.
 */
export class ChatTextMessageBody extends ChatMessageBody {
  /**
   * Text message content.
   */
  content: string;
  constructor(params: { type: string; content: string }) {
    super(params.type);
    this.content = params.content;
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
 * File message body.
 */
export class ChatFileMessageBody extends ChatMessageBody {
  /**
   * The path of the image file.
   */
  localPath: string = '';
  /**
   * The file's token.
   */
  secret: string;
  /**
   * The path of the attachment file in the server.
   */
  remotePath: string;
  /**
   * The download status of the attachment file . see {@link ChatDownloadStatus}
   */
  fileStatus: ChatDownloadStatus;
  /**
   * The size of the file in bytes.
   */
  fileSize: number;
  /**
   * The file name. like "file.doc"
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
   * false`: (default) Send the thumbnail(image with size larger than 100k will be compressed);
   * `true`: Send the original image.
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
   * The download status of the thumbnail. see {@link ChatDownloadStatus}
   */
  thumbnailStatus: ChatDownloadStatus;
  /**
   * The image width.
   */
  width: number;
  /**
   * The image height.
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
   * The download status of the video thumbnail. see {@link ChatDownloadStatus}
   */
  thumbnailStatus: ChatDownloadStatus;
  /**
   * The video width.
   */
  width: number;
  /**
   * The video height.
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
   * The command action content.
   */
  action: string;
  /**
   * Checks whether this cmd message is only delivered to online users.
   *
   * `true`: Only delivers to online users.
   * `false`: Delivers to all users.
   */
  deliverOnlineOnly: boolean;
  constructor(params: { action: string; deliverOnlineOnly?: boolean }) {
    super(ChatMessageBodyType.CMD);
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
   * The params map.
   */
  params: any;
  constructor(params: { event: string; params?: any }) {
    super(ChatMessageBodyType.CUSTOM);
    this.event = params.event;
    this.params = params.params ?? {};
  }
}
