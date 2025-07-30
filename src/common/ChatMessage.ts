import { ExceptionHandler } from '../__internal__/ErrorHandler';
import { generateMessageId, getNowTimestamp } from '../__internal__/Utils';
import { ChatClient } from '../ChatClient';
import type { ChatSearchDirection } from './ChatConversation';
import { ChatError, ChatException } from './ChatError';
import type { ChatMessageReaction } from './ChatMessageReaction';
import type { ChatMessageThread } from './ChatMessageThread';

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
   * 未知消息。
   */
  // UNKNOWN = 'unknown',
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
  /**
   * 合并消息。
   */
  COMBINE = 'combine',
}

/**
 * 聊天室消息优先级。
 */
export enum ChatRoomMessagePriority {
  /**
   * 高
   */
  PriorityHigh = 0,
  /**
   * 普通。默认优先级为 `普通`。
   */
  PriorityNormal,
  /**
   * 低。
   */
  PriorityLow,
}

/**
 * 消息置顶和取消置顶操作。
 */
export enum ChatMessagePinOperation {
  /**
   * 置顶。
   */
  Pin,
  /**
   * 取消置顶。
   */
  Unpin,
}

/**
 * 消息搜索范围。
 */
export enum ChatMessageSearchScope {
  /**
   * 按消息内容搜索。
   */
  Content,
  /**
   * 按索消息扩展属性搜索。
   */
  Attribute,
  /**
   * 按消息内容和扩展属性搜索。
   */
  All,
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
  return ChatMessageStatus[params]!;
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
  return ChatDownloadStatus[params]!;
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
    case 'combine':
      return ChatMessageType.COMBINE;
    default:
      const ret = 'unknown';
      ExceptionHandler.getInstance().sendExcept({
        except: new ChatException({
          code: 1,
          description: `This type is not supported. ` + params,
        }),
        from: 'ChatMessageTypeFromString',
      });
      return ret as ChatMessageType;
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
  onProgress?(localMsgId: string, progress: number): void;

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
   * 单聊时，发送的消息是否送达至接收方。要使该参数生效，初始化时需接收方设置 {@link ChatOptions.requireDeliveryAck} 为 `true`。群消息不支持送达回执。
   *
   * - `true`：是。
   * - （默认）`false`：否。
   */
  hasDeliverAck: boolean = false;
  /**
   * 单聊时，发送方是否收到了接收方的已读回执。接收方阅读消息后会调用 {@link ChatManager.sendMessageReadAck} 或者 {@link ChatManager.sendConversationReadAck} 发送已读回执。若需要已读回执，SDK 初始化时需设置 {@link ChatOptions.requireAck} 为 `true`。
   *
   * - `true`：是。
   * - （默认）`false`：否。
   */
  hasReadAck: boolean = false;
  /**
   * 群聊时，是否需要消息已读回执。
   *
   * - `true`：是。
   * - （默认）`false`：否。
   */
  needGroupAck: boolean = false;
  /**
   * 群聊时，已阅读消息的群成员数量。群成员已读消息后调用 {@link ChatManager.sendGroupMessageReadAck} 或者 {@link ChatManager.sendConversationReadAck} 发送已读回执。若需要开启已读回执功能，初始化时需设置 {@link ChatOptions.requireAck} 为 `true`， 并且发送消息时设置 {@link isNeedGroupAck} 为 `true`。
   */
  groupAckCount: number = 0;
  /**
   * 单聊或群聊时，接收方是否已读了消息。该参数的值影响会话的未读消息数。阅读消息后，接收方可以调用 {@link ChatManager.markMessageAsRead} 或者 {@link ChatManager.markAllMessagesAsRead} 将消息设置为已读。
   *
   * - `true`：是。
   * - （默认）`false`：否。
   */
  hasRead: boolean = false;
  /**
   * 会话类型，包括单聊，群聊和聊天室。详见 {@link ChatType}。
   */
  chatType: ChatMessageChatType = ChatMessageChatType.ChatRoom;
  /**
   * 消息方向，详见 {@link ChatMessageDirection}。
   */
  direction: ChatMessageDirection;
  /**
   * 消息发送状态，详见 {@link ChatMessageStatus}。
   */
  status: ChatMessageStatus;
  /**
   * 消息的扩展属性。
   */
  attributes: Record<string, any>;
  /**
   * 消息体实例，详见 {@link ChatMessageBody}。
   */
  body: ChatMessageBody;

  /**
   * 消息是否为子区消息：
   *
   * - `true`：是。你需将消息接收方的用户 ID 设置为子区 ID。详见 {@link to}。
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
   * 聊天室消息的优先级。
   * **Note** 该属性仅适用于聊天室会话。
   */
  // @ts-expect-error
  private priority?: ChatRoomMessagePriority;

  /**
   * 消息是否只投递给在线用户：
   * - `true`：只有消息接收方在线时才能投递成功。若接收方离线，则消息会被丢弃。
   * - （默认）`false`：如果用户在线，则直接投递；如果用户离线，消息会在用户上线时投递。
   */
  deliverOnlineOnly: boolean;

  /**
   * 消息接收对象列表。
   *
   * 默认为 `undefined`，表示群组或聊天室中的所有成员均能收到该消息。
   *
   * 该属性只在群组或者聊天室中使用。
   */
  receiverList?: string[];

  /**
   * 是否是广播消息。
   */
  isBroadcast: boolean;

  /**
   * 消息内容是否被替换过。
   *
   * 该属性仅在 `ChatOptions.useReplacedMessageContents` 开启时有效。
   */
  isContentReplaced: boolean;

  /**
   * 构造消息。
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
    receiverList?: string[];
    isBroadcast?: boolean;
    isContentReplaced?: boolean;
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
    this.attributes = {};
    this.fromAttributes(params.attributes);
    this.body = ChatMessage.getBody(params.body);
    this.localMsgId = this.localTime.toString();
    this.isChatThread = params.isChatThread ?? false;
    this.isOnline = params.isOnline ?? true;
    this.deliverOnlineOnly = params.deliverOnlineOnly ?? false;
    this.receiverList = params.receiverList;
    this.isBroadcast = params.isBroadcast ?? false;
    this.isContentReplaced = params.isContentReplaced ?? false;
  }

  private fromAttributes(attributes: any) {
    if (attributes) {
      const keys = Object.getOwnPropertyNames(attributes);
      for (const key of keys) {
        const v = attributes[key];
        if (typeof v === 'object') {
          this.attributes[key] = v;
        } else if (typeof v === 'function') {
          this.attributes[key] = v;
        } else if (typeof v === 'symbol' || typeof v === 'undefined') {
          this.attributes[key] = v;
        } else if (typeof v === 'string') {
          // !!! maybe json string
          try {
            this.attributes[key] = JSON.parse(v);
          } catch (error) {
            this.attributes[key] = v;
          }
        } else {
          this.attributes[key] = v;
        }
      }
    }
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

      case ChatMessageType.COMBINE:
        return new ChatCombineMessageBody(params);

      default:
        const ret = new _ChatUnknownMessageBody();
        ExceptionHandler.getInstance().sendExcept({
          except: new ChatException({
            code: 1,
            description: `This type is not supported. ` + type,
          }),
          from: 'getBody',
        });
        return ret;
    }
  }

  public static createSendMessage(params: {
    body: ChatMessageBody;
    targetId: string;
    chatType: ChatMessageChatType;
    isChatThread?: boolean;
    isOnline?: boolean;
    deliverOnlineOnly?: boolean;
    receiverList?: string[];
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
      receiverList: params.receiverList,
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
   * @param chatType 会话类型。详见 {@link ChatType}。
   * @params opt 消息扩展参数。
   *  - isChatThread: 是否是子区消息。默认不是子区消息。
   *  - isOnline: 是否为在线时收到的消息。
   *  - deliverOnlineOnly: 消息是否只投递给在线用户。
   *
   * @returns 消息实例。
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
      receiverList?: string[];
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatTextMessageBody({
        content: content,
        targetLanguageCodes: opt?.targetLanguageCodes,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
      receiverList: opt?.receiverList,
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
   * @param chatType 会话类型。详见 {@link ChatType}。
   * @params opt 消息扩展参数。
   *  - isChatThread: 是否是子区消息。默认不是子区消息。
   *  - isOnline: 是否为在线时收到的消息。
   *  - deliverOnlineOnly: 消息是否只投递给在线用户。
   *
   * @returns 消息实例。
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
      receiverList?: string[];
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatFileMessageBody({
        localPath: filePath,
        displayName: opt?.displayName ?? '',
        fileSize: opt?.fileSize,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
      receiverList: opt?.receiverList,
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
   * @params opt 消息扩展参数。
   *  - isChatThread: 是否是子区消息。默认不是子区消息。
   *  - isOnline: 是否为在线时收到的消息。
   *  - deliverOnlineOnly: 消息是否只投递给在线用户。
   *  - displayName: 图片名称。
   *  - thumbnailLocalPath: 缩略图本地地址。
   *  - sendOriginalImage: 是否发送原图。
   *  - width: 图片宽度。
   *  - height: 图片高度。
   *  - fileSize: 图片大小。
   *  - receiverList: 消息接收人列表。
   *
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
      fileSize?: number;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
      receiverList?: string[];
      isGif?: boolean;
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatImageMessageBody({
        localPath: filePath,
        displayName: opt?.displayName ?? filePath,
        thumbnailLocalPath: opt?.thumbnailLocalPath,
        sendOriginalImage: opt?.sendOriginalImage ?? false,
        width: opt?.width,
        height: opt?.height,
        fileSize: opt?.fileSize,
        isGif: opt?.isGif,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
      receiverList: opt?.receiverList,
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
   * @params opt 消息扩展参数。
   *  - isChatThread: 是否是子区消息。默认不是子区消息。
   *  - isOnline: 是否为在线时收到的消息。
   *  - deliverOnlineOnly: 消息是否只投递给在线用户。
   *  - displayName: 文件名称。
   *  - thumbnailLocalPath: 缩略图本地地址。
   *  - duration: 视频时长。
   *  - width: 视频宽度。
   *  - height: 视频高度。
   *  - fileSize: 文件大小。
   *  - receiverList: 消息接收人列表。
   *
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
      fileSize?: number;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
      receiverList?: string[];
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatVideoMessageBody({
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
      receiverList: opt?.receiverList,
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
   * @params opt 消息扩展参数。
   *  - isChatThread: 是否是子区消息。默认不是子区消息。
   *  - isOnline: 是否为在线时收到的消息。
   *  - deliverOnlineOnly: 消息是否只投递给在线用户。
   *  - displayName: 文件名称。
   *  - thumbnailLocalPath: 缩略图本地地址。
   *  - duration: 语音时长。
   *  - fileSize: 文件大小。
   *  - receiverList: 消息接收人列表。
   *
   * @returns 消息实例。
   */
  public static createVoiceMessage(
    targetId: string,
    filePath: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      displayName?: string;
      duration: number;
      isChatThread?: boolean;
      fileSize?: number;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
      receiverList?: string[];
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatVoiceMessageBody({
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
      receiverList: opt?.receiverList,
    });
  }

  /**
   * 创建合并类型消息体。
   *
   * @param targetId 消息接收方。
   * - 单聊时是接收方的用户 ID。
   * - 群聊时是群组 ID。
   * - 聊天室则是聊天室 ID。
   * @param messageIdList 合并的消息列表 ID。
   * @param chatType 会话类型。 详见 {@link ChatType}.
   * @params opt 消息扩展参数。
   *  - isChatThread: 是否是子区消息。
   *    - `true`：是；
   *    - （默认）`false`：否。
   *  - isOnline: 是否为在线时收到的消息。
   *    - `true`：是；
   *    - `false`：否。
   *  - deliverOnlineOnly: 消息是否只投递给在线用户。
   *    - `true`：是。只有消息接收方在线时才能投递成功。若接收方离线，则消息会被丢弃。
   *    - （默认）`false`：否。如果用户在线，则直接投递；如果用户离线，消息会在用户上线时投递。
   *  - title: 合并消息的标题。
   *  - summary: 合并消息的概要。
   *  - compatibleText: 合并消息的兼容信息。该字段用于需要兼容不支持合并转发消息的版本。
   *  - receiverList: 消息接收人列表。
   *
   * @returns The message instance.
   */
  public static createCombineMessage(
    targetId: string,
    messageIdList: string[],
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      title?: string;
      summary?: string;
      compatibleText?: string;
      isChatThread?: boolean;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
      receiverList?: string[];
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatCombineMessageBody({
        localPath: '',
        title: opt?.title,
        summary: opt?.summary,
        compatibleText: opt?.compatibleText,
        messageIdList: messageIdList,
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
      receiverList: opt?.receiverList,
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
   * @params opt 消息扩展参数。
   *  - isChatThread: 是否是子区消息。默认不是子区消息。
   *  - isOnline: 是否为在线时收到的消息。
   *  - deliverOnlineOnly: 消息是否只投递给在线用户。
   *  - address: 地址信息。
   *  - receiverList: 消息接收人列表。
   *
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
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
      receiverList?: string[];
    }
  ): ChatMessage {
    return ChatMessage.createSendMessage({
      body: new ChatLocationMessageBody({
        latitude: latitude,
        longitude: longitude,
        address: opt?.address ?? '',
      }),
      targetId: targetId,
      chatType: chatType,
      isChatThread: opt?.isChatThread,
      isOnline: opt?.isOnline,
      deliverOnlineOnly: opt?.deliverOnlineOnly,
      receiverList: opt?.receiverList,
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
   * @params opt 消息扩展参数。
   *  - isChatThread: 是否是子区消息。默认不是子区消息。
   *  - isOnline: 是否为在线时收到的消息。
   *  - deliverOnlineOnly: 消息是否只投递给在线用户。
   *  - receiverList: 消息接收人列表。
   *
   * @returns 消息实例。
   */
  public static createCmdMessage(
    targetId: string,
    action: string,
    chatType: ChatMessageChatType = ChatMessageChatType.PeerChat,
    opt?: {
      isChatThread?: boolean;
      isOnline?: boolean;
      deliverOnlineOnly?: boolean;
      receiverList?: string[];
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
      receiverList: opt?.receiverList,
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
   * @params opt 消息扩展参数。
   *  - isChatThread: 是否是子区消息。默认不是子区消息。
   *  - isOnline: 是否为在线时收到的消息。
   *  - deliverOnlineOnly: 消息是否只投递给在线用户。
   *  - params: 自定义参数。key-value格式。
   *  - receiverList: 消息接收人列表。
   *
   * @returns 消息实例。
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
      receiverList?: string[];
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
      receiverList: opt?.receiverList,
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
  public get groupReadCount(): Promise<number | undefined> {
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
   * 获取消息的置顶信息。
   */
  public get getPinInfo(): Promise<ChatMessagePinInfo | undefined> {
    return ChatClient.getInstance().chatManager.getMessagePinInfo(this.msgId);
  }

  /**
   * 设置消息优先级。仅仅聊天室生效。
   */
  public set messagePriority(p: ChatRoomMessagePriority) {
    this.priority = p;
  }
}

/**
 * 消息体基类。
 */
export abstract class ChatMessageBody {
  /**
   * 消息类型，详见 {@link ChatMessageType}。
   */
  public readonly type: ChatMessageType;

  /**
   * 消息最后修改人。
   */
  lastModifyOperatorId?: string;

  /**
   * 最后修改时间戳。
   */
  lastModifyTime?: number;

  /**
   * 修改次数。
   */
  modifyCount?: number;

  protected constructor(
    type: ChatMessageType,
    opt?: {
      lastModifyOperatorId?: string;
      lastModifyTime?: number;
      modifyCount?: number;
    }
  ) {
    this.type = type;
    this.lastModifyOperatorId = opt?.lastModifyOperatorId;
    this.lastModifyTime = opt?.lastModifyTime;
    this.modifyCount = opt?.modifyCount;
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
    content: string;
    targetLanguageCodes?: Array<string>;
    translations?: any;
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super(ChatMessageType.TXT, {
      lastModifyOperatorId: params.lastModifyOperatorId,
      lastModifyTime: params.lastModifyTime,
      modifyCount: params.modifyCount,
    });
    this.content = params.content;
    this.targetLanguageCodes = params.targetLanguageCodes;
    this.translations = params.translations;
  }
}

class _ChatUnknownMessageBody extends ChatMessageBody {
  constructor() {
    super('unknown' as ChatMessageType);
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
    address: string;
    latitude: string;
    longitude: string;
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super(ChatMessageType.LOCATION, {
      lastModifyOperatorId: params.lastModifyOperatorId,
      lastModifyTime: params.lastModifyTime,
      modifyCount: params.modifyCount,
    });
    this.address = params.address;
    this.latitude = params.latitude;
    this.longitude = params.longitude;
  }
}

/**
 * 文件消息体基类。
 */
abstract class _ChatFileMessageBody extends ChatMessageBody {
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

  protected constructor(params: {
    type: ChatMessageType;
    localPath: string;
    secret?: string;
    remotePath?: string;
    fileStatus?: number;
    fileSize?: number;
    displayName?: string;
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super(params.type, {
      lastModifyOperatorId: params.lastModifyOperatorId,
      lastModifyTime: params.lastModifyTime,
      modifyCount: params.modifyCount,
    });
    this.localPath = params.localPath;
    this.secret = params.secret ?? '';
    this.remotePath = params.remotePath ?? '';
    this.fileStatus = ChatDownloadStatusFromNumber(params.fileStatus ?? -1);
    this.fileSize = params.fileSize ?? 0;
    this.displayName = params.displayName ?? '';
  }
}

/**
 * 文件类型的消息体。
 */
export class ChatFileMessageBody extends _ChatFileMessageBody {
  constructor(params: {
    localPath: string;
    secret?: string;
    remotePath?: string;
    fileStatus?: number;
    fileSize?: number;
    displayName?: string;
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super({ ...params, type: ChatMessageType.FILE });
  }
}

/**
 * The image message body class.
 */
export class ChatImageMessageBody extends _ChatFileMessageBody {
  /**
   * 发送图片时是否发送原图。
   * - `true`: 发送原图和缩略图。
   * - (默认）`false`: 若图片小于 100 KB，发送原图和缩略图；若图片大于等于 100 KB, 发送压缩后的图片和压缩后图片的缩略图。
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
  /**
   * 是否是 GIF 图片。
   * - `true`: 是 GIF 图片。
   * - (默认）`false`: 不是 GIF 图片。
   */
  isGif?: boolean;
  constructor(params: {
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
    isGif?: boolean;
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super({
      type: ChatMessageType.IMAGE,
      lastModifyOperatorId: params.lastModifyOperatorId,
      lastModifyTime: params.lastModifyTime,
      modifyCount: params.modifyCount,
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
    this.isGif = params.isGif ?? false;
  }
}

/**
 * 视频消息体基类。
 */
export class ChatVideoMessageBody extends _ChatFileMessageBody {
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
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super({
      type: ChatMessageType.VIDEO,
      lastModifyOperatorId: params.lastModifyOperatorId,
      lastModifyTime: params.lastModifyTime,
      modifyCount: params.modifyCount,
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
export class ChatVoiceMessageBody extends _ChatFileMessageBody {
  /**
   * 语音时长，单位为秒。
   */
  duration: number;
  constructor(params: {
    localPath: string;
    secret?: string;
    remotePath?: string;
    fileStatus?: number;
    fileSize?: number;
    displayName: string;
    duration?: number;
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super({
      type: ChatMessageType.VOICE,
      lastModifyOperatorId: params.lastModifyOperatorId,
      lastModifyTime: params.lastModifyTime,
      modifyCount: params.modifyCount,
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
  constructor(params: {
    action: string;
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super(ChatMessageType.CMD, {
      lastModifyOperatorId: params.lastModifyOperatorId,
      lastModifyTime: params.lastModifyTime,
      modifyCount: params.modifyCount,
    });
    this.action = params.action;
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
  params?: Record<string, string>;
  constructor(params: {
    event: string;
    params?: Record<string, string>;
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super(ChatMessageType.CUSTOM, {
      lastModifyOperatorId: params.lastModifyOperatorId,
      lastModifyTime: params.lastModifyTime,
      modifyCount: params.modifyCount,
    });
    this.event = params.event;
    this.params = params.params;
  }
}

/**
 * 合并消息体。
 */
export class ChatCombineMessageBody extends _ChatFileMessageBody {
  /**
   * 合并消息的标题。
   */
  title?: string;
  /**
   * 合并消息的概要。
   */
  summary?: string;
  /**
   * 合并消息的原始消息 ID 列表。
   *
   * **注意** 该属性只用在创建发送消息的场景。
   */
  messageIdList?: string[];
  /**
   * 合并消息的兼容文本。
   */
  compatibleText?: string;
  constructor(params: {
    localPath: string;
    secret?: string;
    remotePath?: string;
    fileStatus?: number;
    fileSize?: number;
    displayName?: string;
    title?: string;
    summary?: string;
    messageIdList?: string[];
    compatibleText?: string;
    lastModifyOperatorId?: string;
    lastModifyTime?: number;
    modifyCount?: number;
  }) {
    super({
      type: ChatMessageType.COMBINE,
      lastModifyOperatorId: params.lastModifyOperatorId,
      lastModifyTime: params.lastModifyTime,
      modifyCount: params.modifyCount,
      localPath: params.localPath,
      secret: params.secret,
      remotePath: params.remotePath,
      fileStatus: params.fileStatus,
      fileSize: params.fileSize,
      displayName: params.displayName,
    });
    this.title = params.title;
    this.compatibleText = params.compatibleText;
    this.messageIdList = params.messageIdList;
    this.summary = params.summary;
  }
}

/**
 * 消息置顶详情。
 */
export class ChatMessagePinInfo {
  /**
   * 置顶时间戳。
   */
  pinTime: number;
  /**
   * 操作者的ID。
   */
  operatorId: string;

  constructor(params: { pinTime: number; operatorId: string }) {
    this.pinTime = params.pinTime;
    this.operatorId = params.operatorId;
  }
}

/**
 * 查询消息的选项。
 */
export class ChatFetchMessageOptions {
  /**
   * 消息发送方。
   */
  from?: string;
  /**
   * 群组会话中消息发送者的用户 ID 数组。
   */
  senders?: Array<string>;
  /**
   * 消息类型列表。
   */
  msgTypes?: ChatMessageType[];
  /**
   * 消息查询的起始时间，Unix 时间戳，单位为毫秒。默认为 `-1`，表示消息查询时会忽略该参数。 - 若起始时间设置为特定时间点，而结束时间采用默认值 `-1`，则查询起始时间至当前时间的消息。 - 若起始时间采用默认值 `-1`，而结束时间设置了特定时间，SDK 返回从会话中最早的消息到结束时间点的消息。
   */
  startTs: number;
  /**
   * 消息查询的结束时间。
   */
  endTs: number;
  /**
   * 搜索消息的方向, 详见 {@link ChatSearchDirection.UP}。
   */
  direction: ChatSearchDirection;
  /**
   * 获取的消息是否保存到本地数据库。
   * - `true`: 保存到数据库；
   * - `false`(Default)：不保存。
   */
  needSave: boolean;
  constructor(params: {
    from?: string;
    senders?: Array<string>;
    msgTypes?: ChatMessageType[];
    startTs: number;
    endTs: number;
    direction: ChatSearchDirection;
    needSave: boolean;
  }) {
    this.from = params.from;
    this.senders = params.senders;
    this.startTs = params.startTs;
    this.endTs = params.endTs;
    this.direction = params.direction;
    this.needSave = params.needSave;
    this.msgTypes = params.msgTypes;
  }
}

export class ChatRecalledMessageInfo {
  /**
   * 撤销的消息ID。
   */
  recalledMessageId: string;
  /**
   * 撤销的消息对象。
   */
  recalledMessage?: ChatMessage;
  /**
   * 撤销操作者的ID。
   */
  recalledBy: string;
  /**
   * 撤销消息的扩展信息。
   */
  recalledExt?: string;
  /**
   * 撤销的消息会话ID。
   */
  recalledConvId?: string;

  /**
   * 创建撤销消息对象。
   */
  constructor(params: {
    recalledMessageId: string;
    recalledMessage?: ChatMessage;
    recalledBy: string;
    recalledExt?: string;
    recalledConvId?: string;
  }) {
    this.recalledMessageId = params.recalledMessageId;
    this.recalledMessage = params.recalledMessage;
    this.recalledBy = params.recalledBy;
    this.recalledExt = params.recalledExt;
    this.recalledConvId = params.recalledConvId;
  }
}
