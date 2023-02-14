import { generateMessageId, getNowTimestamp } from '../__internal__/Utils';
import { ChatClient } from '../ChatClient';
import { ChatError } from './ChatError';
import type {
  ChatMessageReaction,
  ChatMessageThread,
} from 'react-native-chat-sdk';

/**
 * 会话类型枚举。
 */
export enum ChatMessageChatType {
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
  ChatRoom = 2,
}

/**
 * 消息的方向枚举。
 */
export enum ChatMessageDirection {
  /**
   * 该消息是当前用户发送出去的。
   */
  SEND = 'send',
  /**
   * 该消息是当前用户接收到的。
   */
  RECEIVE = 'rec',
}

/**
 * 消息的发送状态枚举类。
 */
export enum ChatMessageStatus {
  /**
   * 消息已创建待发送。
   */
  CREATE = 0,
  /**
   * 正在发送。
   */
  PROGRESS = 1,
  /**
   * 发送成功。
   */
  SUCCESS = 2,
  /**
   * 发送失败。
   */
  FAIL = 3,
}

/**
 * 消息附件下载状态枚举。
 */
export enum ChatDownloadStatus {
  /**
   * 等待下载。
   */
  PENDING = -1,
  /**
   * 正在下载。
   */
  DOWNLOADING = 0,
  /**
   * 下载成功。
   */
  SUCCESS = 1,
  /**
   * 下载失败。
   */
  FAILED = 2,
}

/**
 * 消息类型。
 */
export enum ChatMessageType {
  /**
   * 文本消息。
   */
  TXT = 'txt',
  /**
   * 图片消息。
   */
  IMAGE = 'img',
  /**
   * 视频消息。
   */
  VIDEO = 'video',
  /**
   * 位置消息。
   */
  LOCATION = 'loc',
  /**
   * 语音消息。
   */
  VOICE = 'voice',
  /**
   * 文件消息。
   */
  FILE = 'file',
  /**
   * 命令消息。
   */
  CMD = 'cmd',
  /**
   * 自定义消息。
   */
  CUSTOM = 'custom',
}

/**
 * 聊天室消息优先级。
 */
export enum ChatRoomMessagePriority {
  /**
   * 高优先级
   */
  PriorityHigh = 0,
  /**
   * 普通优先级。默认值
   */
  PriorityNormal,
  /**
   * 低优先级。
   */
  PriorityLow,
}

/**
 * 将会话类型由整型转换为字符串类型。
 *
 * @param params 整型的会话类型。
 * @returns 字符串类型的会话类型。
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
 * 将消息方向由字符串类型转换为枚举类型。
 *
 * @param params 字符串类型的消息方向。
 * @returns 枚举类型的消息方向。
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
 * 将消息状态由整型转换为枚举类型。
 *
 * @param params 整型的消息状态。
 * @returns 枚举类型的消息状态。
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
 * 将消息状态由枚举类型转换为字符串类型。
 *
 * @param params 枚举类型的消息状态。
 * @returns 字符串类型的消息状态。
 */
export function ChatMessageStatusToString(params: ChatMessageStatus): string {
  return ChatMessageStatus[params];
}

/**
 * 将消息下载状态由整型转换为字符串类型。
 *
 * @param params 整型的消息下载状态。
 * @returns 字符串类型的消息下载状态。
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
 * 将消息附件下载状态由整型转换为字符串类型。
 *
 * @param params 整型的消息附件下载状态。
 * @returns 枚举类型的消息附件下载状态。
 */
export function ChatDownloadStatusToString(params: ChatDownloadStatus): string {
  return ChatDownloadStatus[params];
}

/**
 * 将消息类型由字符串类型转换为枚举类型。
 *
 * @param params 字符串类型的消息类型。
 * @returns 枚举类型的消息类型。
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
 * 消息状态监听器接口。
 */
export interface ChatMessageStatusCallback {
  /**
   * 消息上传或下载进度回调。
   *
   * @param progress 消息上传或下载的进度值，取值范围为 [0,100]。
   */
  onProgress(localMsgId: string, progress: number): void;

  /**
   * 消息错误回调。
   *
   * @param error 错误码和错误描述，详见 {@link ChatError}。
   */
  onError(localMsgId: string, error: ChatError): void;

  /**
   * 消息发送成功回调。
   * @param message 发送成功的消息。
   */
  onSuccess(message: ChatMessage): void;
}

/**
 * 消息类，用于定义一条要发送或接收的消息。
 *
 * 例如，构造一条文本消息：
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
   * 服务器生成的消息 ID。
   */
  msgId: string = generateMessageId();
  /**
   * 本地消息 ID。
   */
  localMsgId: string = '';
  /**
   * 会话 ID。
   */
  conversationId: string = '';
  /**
   * 消息发送者的用户 ID。
   */
  from: string = '';
  /**
   * 消息接收方的用户 ID：
   *
   * - 单聊：消息接收方的用户 ID；
   * - 群聊：群组 ID；
   * - 聊天室：聊天室 ID；
   * - 子区：子区 ID。
   */
  to: string = '';
  /**
   * 消息创建的本地 Unix 时间戳。单位为毫秒。
   */
  localTime: number = getNowTimestamp();
  /**
   * 服务器收到该消息的 Unix 时间戳。单位为毫秒。
   */
  serverTime: number = getNowTimestamp();
  /**
   * 是否需要消息接收方发送消息送达回执：
   *
   * - `true`：是。
   * - （默认）`false`：否。
   */
  hasDeliverAck: boolean = false;
  /**
   * 是否需要消息接收方发送已读回执：
   *
   * - `true`：是。
   * - （默认）`false`：否。
   */
  hasReadAck: boolean = false;
  /**
   * 是否需要群组消息已读回执：
   *
   * - `true`：是。
   * - （默认）`false`：否。
   */
  needGroupAck: boolean = false;
  /**
   * 群组消息已读回执数。
   */
  groupAckCount: number = 0;
  /**
   * 消息是否已读：
   *
   * - `true`：是。
   * - （默认）`false`：否。
   */
  hasRead: boolean = false;
  /**
   * 会话类型，包括单聊，群聊和聊天室。
   */
  chatType: ChatMessageChatType = ChatMessageChatType.ChatRoom;
  /**
   * 消息方向，详见 {@link ChatMessageDirection}。
   */
  direction: ChatMessageDirection = ChatMessageDirection.SEND;
  /**
   * 消息发送状态，详见 {@link ChatMessageStatus}。
   */
  status: ChatMessageStatus = ChatMessageStatus.CREATE;
  /**
   * 消息的扩展属性。
   */
  attributes: Object = {};
  /**
   * 消息体实例，详见 {@link ChatMessageBody)}。
   */
  body: ChatMessageBody;

  /**
   * 消息是否为子区消息：
   * 
   * - `true`：是。你需将消息接收方的用户 ID 设置为子区 ID。详见 {@link #to}。
   * - `false`：否。
   *
   * **注意**

   * 该参数仅对群聊有效。
   */
  isChatThread: boolean;

  /**
   * 消息是否为在线时收到的消息。
   *
   * - `true`: 是。这种情况下，如果应用在后台运行可以弹出消息提示框。
   * - `false`: 否，离线时收到的消息。
   */
  isOnline: boolean;

  /**
   * The delivery priorities of chat room messages.
   * **Note** Only for chat rooms.
   */
  private priority?: ChatRoomMessagePriority;

  /**
   * 构造一条消息。
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
   * 创建一条待发送的文本消息。
   *
   * @param targetId 消息接收方的用户 ID。
   * - 单聊时是接收方的用户 ID。
   * - 群聊时是群组 ID。
   * - 聊天室则是聊天室 ID。
   * @param content 文本消息内容。
   * @param chatType 会话类型。
   * @returns 消息实例。
   */
  public static createTextMessage(
    targetId: string,
    content: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      isChatThread?: boolean;
      targetLanguageCodes?: Array<string>;
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
    });
  }

  /**
   * 创建一条待发送的文件类型消息。
   *
   * @param targetId 消息接收方的用户 ID。
   * - 单聊时为接收方的用户 ID。
   * - 群聊时为群组 ID。
   * - 聊天室则为聊天室 ID。
   * @param filePath 文件路径。
   * @param chatType 会话类型。
   * @param opt 文件名称。
   * @returns 消息实例。
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
   * 创建一条待发送的图片消息。
   *
   * @param targetId 消息接收方的用户 ID。
   * - 单聊：接收方的用户 ID。
   * - 群聊：群组 ID。
   * - 聊天室：聊天室 ID。
   * @param filePath 图片路径。
   * @param chatType 会话类型。
   * @param opt
   *   @{#displayName} 图片名称。
   *   @{#thumbnailLocalPath} 图片缩略图的存储路径。
   *   @{#sendOriginalImage} 是否发送原图：
   *     - `true`：发送原图和缩略图。
   *     - （默认）`false`：图片小于 100 KB 时，发送原图和缩略图；图片大于 100 KB 时，发送压缩后的图片和压缩后图片的缩略图。
   *   @{#width} 图片宽度，单位为像素。
   *   @{#height} 图片高度，单位为像素。
   * @returns 消息实例。
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
   * 创建一条待发送的视频消息。
   *
   * @param targetId 消息接收方的用户 ID。
   * - 单聊时是接收方的用户 ID。
   * - 群聊时是群组 ID。
   * - 聊天室则是聊天室 ID。
   * @param filePath 视频文件路径。
   * @param chatType 会话类型。
   * @param opt
   *   @{#displayName} 视频名称
   *   @{#thumbnailLocalPath} 视频第一帧的缩略图的存储路径。
   *   @{#duration} 视频时长，单位为秒。
   *   @{#width} 视频缩略图宽度，单位为像素。
   *   @{#height} 视频缩略图高度，单位为像素。
   * @returns 消息实例。
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
   * 创建一条待发送的语音消息。
   *
   * @param targetId 消息接收方 ID。
   * - 单聊时是接收方的用户 ID。
   * - 群聊时是群组 ID。
   * - 聊天室则是聊天室 ID。
   * @param filePath 语音文件路径。
   * @param chatType 会话类型。
   * @param opt
   *   @{#displayName} 语音文件名称。
   *   @{#duration} 语音时长，单位为秒。
   * @returns 消息实例。
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
   * 创建一条待发送的位置消息。
   *
   * @param targetId 消息接收方的用户 ID。
   * - 单聊：接收方的用户 ID。
   * - 群聊：群组 ID。
   * - 聊天室：聊天室 ID。
   * @param latitude 纬度。
   * @param longitude 经度。
   * @param chatType 会话类型。
   * @param opt
   *   @{#address} 地址。
   * @returns 消息实例。
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
   * 创建一条待发送的命令消息。
   *
   * @param targetId 消息接收方的用户 ID。
   * - 单聊：接收方的用户 ID。
   * - 群聊：群组 ID。
   * - 聊天室：聊天室 ID。
   * @param action 命令内容。
   * @param chatType 会话类型。
   * @returns 消息实例。
   */
  public static createCmdMessage(
    targetId: string,
    action: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      isChatThread?: boolean;
      deliverOnlineOnly?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatCmdMessageBody({
        action: action,
        deliverOnlineOnly: opt?.deliverOnlineOnly,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
    });
  }

  /**
   * 创建一条待发送的自定义类型消息。
   *
   * @param targetId 消息接收方的用户 ID。
   * - 单聊：接收方的用户 ID。
   * - 群聊：群组 ID。
   * - 聊天室：聊天室 ID。
   * @param event 消息触发的自定义事件。
   * @param chatType 会话类型。
   * @param opt
   *   @{#params} 自定义参数字典。
   * @returns 消息实例。
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
   * 创建一条接收消息。
   *
   * @param params 接收的消息。
   * @returns 消息对象。
   */
  public static createReceiveMessage(params: any): ChatMessage {
    return new ChatMessage(params);
  }

  /**
   * 获取 Reaction 列表。
   */
  public get reactionList(): Promise<Array<ChatMessageReaction>> {
    return ChatClient.getInstance().chatManager.getReactionList(this.msgId);
  }

  /**
   * 获取群组消息的已读人数。
   *
   */
  public get groupReadCount(): Promise<number> {
    return ChatClient.getInstance().chatManager.groupAckCount(this.msgId);
  }

  /**
   * 获取指定子区的详情。
   *
   */
  public get threadInfo(): Promise<ChatMessageThread | undefined> {
    return ChatClient.getInstance().chatManager.getMessageThread(this.msgId);
  }

  /**
   * 设置聊天室消息投递优先级。
   */
  public set messagePriority(p: ChatRoomMessagePriority) {
    this.priority = p;
  }
}

/**
 * 消息体基类。
 */
export class ChatMessageBody {
  /**
   * 消息类型，详见 {@link ChatMessageType}。
   */
  type: ChatMessageType;

  constructor(type: string) {
    this.type = ChatMessageTypeFromString(type);
  }
}

/**
 * 文本消息体基类。
 */
export class ChatTextMessageBody extends ChatMessageBody {
  /**
   * 文本消息内容。
   */
  content: string;
  /**
   * 目标翻译语言。详见 {@link https://docs.microsoft.com/en-us/azure/cognitive-services/translator/language-support}。
   */
  targetLanguageCodes?: Array<string>;
  /**
   * 译文。
   *
   * 该参数为 KV 对象，Key 指目标语言，Value 为译文。
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
 * 位置消息体基类。
 */
export class ChatLocationMessageBody extends ChatMessageBody {
  /**
   * 地址。
   */
  address: string;
  /**
   * 纬度。
   */
  latitude: string;
  /**
   * 经度。
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
 * 文件消息体基类。
 */
export class ChatFileMessageBody extends ChatMessageBody {
  /**
   * 文件本地路径。
   */
  localPath: string = '';
  /**
   * 下载附件的 token。
   */
  secret: string;
  /**
   * 文件在服务器的路径。
   */
  remotePath: string;
  /**
   * 文件下载状态，详见 {@link ChatDownloadStatus}。
   */
  fileStatus: ChatDownloadStatus;
  /**
   * 文件大小，单位为字节。
   */
  fileSize: number;
  /**
   * 文件名称。
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
 * 图片消息体基类。
 */
export class ChatImageMessageBody extends ChatFileMessageBody {
  /**
   * 发送图片时是否发送原图。
   * - `true`: 发送原图和缩略图。
   * - (默认） `false`: 若图片小于 100 KB，发送原图和缩略图；若图片大于等于 100 KB, 发送压缩后的图片和压缩后图片的缩略图。
   */
  sendOriginalImage: boolean;
  /**
   * 缩略图的本地路径。
   */
  thumbnailLocalPath: string;
  /**
   * 缩略图在服务器的地址。
   */
  thumbnailRemotePath: string;
  /**
   * 下载缩略图需要的 token。
   */
  thumbnailSecret: string;
  /**
   * 缩略图下载状态，详见 {@link ChatDownloadStatus}。
   */
  thumbnailStatus: ChatDownloadStatus;
  /**
   * 图片宽度，单位为像素。
   */
  width: number;
  /**
   * 图片高度，单位为像素。
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
 * 视频消息体基类。
 */
export class ChatVideoMessageBody extends ChatFileMessageBody {
  /**
   * 视频时长，单位为秒。
   */
  duration: number;
  /**
   * 视频缩略图的本地路径。
   */
  thumbnailLocalPath: string;
  /**
   * 视频缩略图在服务器的路径。
   */
  thumbnailRemotePath: string;
  /**
   * 下载视频缩略图需要的 token。
   */
  thumbnailSecret: string;
  /**
   * 视频缩略图下载状态，详见 {@link ChatDownloadStatus}。
   */
  thumbnailStatus: ChatDownloadStatus;
  /**
   * 视频的宽度，单位是像素。
   */
  width: number;
  /**
   * 视频的高度，单位是像素。
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
 * 语音消息体基类。
 */
export class ChatVoiceMessageBody extends ChatFileMessageBody {
  /**
   * 语音时长，单位为秒。
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
 * 命令消息体基类。
 */
export class ChatCmdMessageBody extends ChatMessageBody {
  /**
   * 命令内容。
   */
  action: string;
  /**
   * 当前命令消息是否只投递在线用户。
   * - （默认）`false`: 投递给所有用户。
   * - `true`: 只投递给在线用户，离线用户再次上线时不会收到该命令消息。
   */
  deliverOnlineOnly: boolean;
  constructor(params: { action: string; deliverOnlineOnly?: boolean }) {
    super(ChatMessageType.CMD);
    this.action = params.action;
    this.deliverOnlineOnly = params.deliverOnlineOnly ?? false;
  }
}

/**
 * 自定义消息体基类。
 */
export class ChatCustomMessageBody extends ChatMessageBody {
  /**
   * 自定义事件。
   */
  event: string;
  /**
   * 自定义消息的键值对。
   */
  params: any;
  constructor(params: { event: string; params?: any }) {
    super(ChatMessageType.CUSTOM);
    this.event = params.event;
    this.params = params.params ?? {};
  }
}
