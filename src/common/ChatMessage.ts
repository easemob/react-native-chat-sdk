import { ExceptionHandler } from '../__internal__/ErrorHandler';
import { generateMessageId, getNowTimestamp } from '../__internal__/Utils';
import { ChatClient } from '../ChatClient';
import type { ChatSearchDirection } from './ChatConversation';
import { ChatError, ChatException } from './ChatError';
import type { ChatMessageReaction } from './ChatMessageReaction';
import type { ChatMessageThread } from './ChatMessageThread';

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
   * internal use.
   */
  // UNKNOWN = 'unknown',
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
  /**
   * Combined message.
   */
  COMBINE = 'combine',
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
 * The message pinning and unpinning operations.
 */
export enum ChatMessagePinOperation {
  /**
   * Pin the message.
   */
  Pin,
  /**
   * Unpin the message.
   */
  Unpin,
}

/**
 * The message search scope.
 */
export enum ChatMessageSearchScope {
  /**
   * Search by message content.
   */
  Content,
  /**
   * Search by message extension.
   */
  Attribute,
  /**
   * Search by message content and extension.
   */
  All,
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
  return ChatMessageStatus[params]!;
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
  return ChatDownloadStatus[params]!;
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
   * Whether messages have arrived at the recipient during a one-to-one chat. If delivery receipts are required, recipient need to set {@link ChatOptions.requireDeliveryAck} to `true` during the SDK initialization. Delivery receipts are unavailable for group messages.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  hasDeliverAck: boolean = false;
  /**
   * Whether the the read receipt from the recipient is received by the sender during a one-to-one chat. Upon reading the message, the recipient calls the {@link ChatManager.sendMessageReadAck} or `{@link ChatManager.sendConversationReadAck}` method to send a read receipt to the sender. If read receipts are required, you need to set {@link ChatOptions.requireAck} to `true` during the SDK initialization.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  hasReadAck: boolean = false;
  /**
   * Whether read receipts are required for a group message.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  needGroupAck: boolean = false;
  /**
   * The number of group members that have read a message. Upon reading a message, members in the group call {@link ChatManager.sendGroupMessageReadAck} or {@link ChatManager.sendConversationReadAck} to send a read receipt for a message or a conversation. To enable the read receipt function for group messages, you need to set {@link ChatOptions.requireAck} to `true` during SDK initialization and set {@link needGroupAck} to `true` when sending a message.
   */
  groupAckCount: number = 0;
  /**
   * Whether the the message is read by the recipient during a one-to-one chat or group chat. This parameter setting has connection with the number of unread messages in a conversation. Upon reading the message, the recipient calls  {@link ChatManager.markMessageAsRead} to mark a message read or {@link ChatManager.markAllMessagesAsRead}  to mark all unread messages in the conversation read.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  hasRead: boolean = false;
  /**
   * The conversation type. See {@link ChatType}.
   */
  chatType: ChatMessageChatType;
  /**
   * The message direction. See {@link ChatMessageDirection}.
   */
  direction: ChatMessageDirection;
  /**
   * The message sending status. See {@link ChatMessageStatus}.
   */
  status: ChatMessageStatus = ChatMessageStatus.CREATE;
  /**
   * The extension attribute of the message.
   *
   * Value can be an object, string, string json, numerical value, undefined, null, etc.
   *
   * **Note** Symbol and function types are not supported.
   */
  attributes: Record<string, any>;
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
  // @ts-expect-error
  private priority?: ChatRoomMessagePriority;

  /**
   * Whether the message is delivered only when the recipient(s) is/are online:
   * - `true`：The message is delivered only when the recipient(s) is/are online. If the recipient is offline, the message is discarded.
   * - (Default) `false`：The message is delivered when the recipient(s) is/are online. If the recipient(s) is/are offline, the message will not be delivered to them until they get online.
   */
  deliverOnlineOnly: boolean;

  /**
   * The recipient list of a targeted message.
   *
   * The default value is `undefined`, indicating that the message is sent to all members in the group or chat room.
   *
   * This property is used only for messages in groups and chat rooms.
   */
  receiverList?: string[];

  /**
   * Whether it is a global broadcast message.
   */
  isBroadcast: boolean;

  /**
   * Whether the message content is replaced.
   *
   * It is valid after `ChatOptions.useReplacedMessageContents` is enabled.
   */
  isContentReplaced: boolean;

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
   * Creates a text message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param content The text content.
   * @param chatType The conversation type. See {@link ChatType}.
   * @params opt The extension parameters of the message.
   *  - targetLanguageCodes: The language code. See {@link ChatTextMessageBody.targetLanguageCodes}.
   *  -  isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * - isOnline: Whether it is a online message.
   * - deliverOnlineOnly: Whether the message is delivered only when the recipient(s) is/are online.
   * - receiverList: The recipient list of a targeted message.
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
   * Creates a message with a file attachment for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The file path.
   * @param chatType The conversation type. See {@link ChatType}.
   * @params opt The extension parameters of the message.
   * - displayName: The file name.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * - isOnline: Whether it is a online message.
   * - deliverOnlineOnly: Whether the message is delivered only when the recipient(s) is/are online.
   * - fileSize: The file size.
   * - receiverList: The recipient list of a targeted message.
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
   * Creates an image message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The image path.
   * @param chatType The conversation type. See {@link ChatType}.
   * @params opt The extension parameters of the message.
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
   * - isOnline: Whether it is a online message.
   * - deliverOnlineOnly: Whether the message is delivered only when the recipient(s) is/are online.
   * - fileSize: The file size.
   * - receiverList: The recipient list of a targeted message.
   * - isGif: Whether the image is a GIF image.
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
   * Creates a video message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The path of the video file.
   * @param chatType The conversation type. See {@link ChatType}.
   * @params opt The extension parameters of the message.
   * - displayName: The video file name.
   * - thumbnailLocalPath: The path of the thumbnail of the first frame of video.
   * - duration: The video duration in seconds.
   * - width: The video thumbnail width in pixels.
   * - height: The video thumbnail height in pixels.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * - isOnline: Whether it is a online message.
   * - deliverOnlineOnly: Whether the message is delivered only when the recipient(s) is/are online.
   * - fileSize: The file size.
   * - receiverList: The recipient list of a targeted message.
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
   * Creates a voice message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param filePath The path of the voice file.
   * @param chatType The conversation type. See {@link ChatType}.
   * @params opt The extension parameters of the message.
   * - displayName: The voice file name.
   * - duration: The voice duration in seconds.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * - isOnline: Whether it is a online message.
   * - deliverOnlineOnly: Whether the message is delivered only when the recipient(s) is/are online.
   * - fileSize: The file size.
   * - receiverList: The recipient list of a targeted message.
   * @returns The message instance.
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
   * Creates a combined message for sending.
   *
   * @param targetId The message recipient. The field setting is determined by the conversation type:
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param messageIdList A collection of message IDs. The list cannot be empty. It can contain a maximum of 300 message IDs.
   * @param chatType The conversation type. See {@link ChatType}.
   * @params opt The extension parameters of the message.
   * - title: The title of the combined message.
   * - summary: The summary of the combined message.
   * - compatibleText: The compatible text of the combined message. This field is used for compatibility with SDK versions that do not support combined messages.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`：No.
   * - isOnline: Whether it is a online message.
   *   - `true`: Yes.
   *   - `false`：No.
   * - deliverOnlineOnly: Whether the message is delivered only when the recipient(s) is/are online:
   *   - `true`: - `true`：The message is delivered only when the recipient(s) is/are online. If the recipient is offline, the message is discarded.
   *   - (Default) `false`：The message is delivered when the recipient(s) is/are online. If the recipient(s) is/are offline, the message will not be delivered to them until they get online.
   * - receiverList: The recipient list of a targeted message.
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
   * Creates a location message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param latitude The latitude.
   * @param longitude The longitude.
   * @param chatType The conversation type. See {@link ChatType}.
   * @params opt The extension parameters of the message.
   * - address: The location details.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * - receiverList: The recipient list of a targeted message.
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
   * Creates a command message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param action The command action.
   * @param chatType The conversation type. See {@link ChatType}.
   * @params opt The extension parameters of the message.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * - deliverOnlineOnly: Whether this command message is delivered only to the online users.
   *   - (Default) `true`: Yes.
   *   - `false`: No. The command message is delivered to users, regardless of their online or offline status.
   * - receiverList: The recipient list of a targeted message.
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
   * Creates a custom message for sending.
   *
   * @param targetId The user ID of the message recipient.
   * - For a one-to-one chat, it is the user ID of the peer user.
   * - For a group chat, it is the group ID.
   * - For a chat room, it is the chat room ID.
   * @param event The custom event.
   * @param chatType The conversation type. See {@link ChatType}.
   * @params opt The extension parameters of the message.
   * - params: The dictionary of custom parameters.
   * - isChatThread: Whether this message is a threaded message.
   *   - `true`: Yes.
   *   - (Default) `false`: No.
   * - receiverList: The recipient list of a targeted message.
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
  public get groupReadCount(): Promise<number | undefined> {
    return ChatClient.getInstance().chatManager.groupAckCount(this.msgId);
  }

  /**
   * Gets details of a message thread.
   */
  public get threadInfo(): Promise<ChatMessageThread | undefined> {
    return ChatClient.getInstance().chatManager.getMessageThread(this.msgId);
  }

  /**
   * Get the list of pinned messages in the conversation.
   */
  public get getPinInfo(): Promise<ChatMessagePinInfo | undefined> {
    return ChatClient.getInstance().chatManager.getMessagePinInfo(this.msgId);
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
export abstract class ChatMessageBody {
  /**
   * The message type. See {@link ChatMessageType}.
   */
  public readonly type: ChatMessageType;

  /**
   * The user ID of the operator that modified the message last time.
   */
  lastModifyOperatorId?: string;

  /**
   * The UNIX timestamp of the last message modification, in milliseconds.
   */
  lastModifyTime?: number;

  /**
   * The number of times a message is modified.
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
 * The file message body class for internal.
 */
abstract class _ChatFileMessageBody extends ChatMessageBody {
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
 * The file message body class.
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
  /**
   * Whether the image is a GIF.
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
 * The video message body class.
 */
export class ChatVideoMessageBody extends _ChatFileMessageBody {
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
 * The voice message body.
 */
export class ChatVoiceMessageBody extends _ChatFileMessageBody {
  /**
   * The voice duration in seconds.
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
 * The command message body.
 */
export class ChatCmdMessageBody extends ChatMessageBody {
  /**
   * The command action.
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
 * The combined message body.
 */
export class ChatCombineMessageBody extends _ChatFileMessageBody {
  /**
   * The title of the combined message.
   */
  title?: string;
  /**
   * The summary of the combined message.
   */
  summary?: string;
  /**
   * The list of IDs of original messages in the combined message.
   *
   * **note** This attribute is used only when you create a combined message.
   */
  messageIdList?: string[];
  /**
   * The compatible text of the combined message.
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
 * The pinning or unpinning information of the message.
 */
export class ChatMessagePinInfo {
  /**
   * The time when the message is pinned or unpinned.
   */
  pinTime: number;
  /**
   * The user ID of the operator that pins or unpins the message.
   */
  operatorId: string;

  constructor(params: { pinTime: number; operatorId: string }) {
    this.pinTime = params.pinTime;
    this.operatorId = params.operatorId;
  }
}

/**
 * The parameter configuration class for pulling historical messages from the server.
 */
export class ChatFetchMessageOptions {
  /**
   * The user ID of the message sender in the group conversation.
   *
   * @deprecated 2025-07-21. Use `senders` instead.
   */
  from?: string;
  /**
   * The array of user IDs of the message senders in the group conversation.
   */
  senders?: Array<string>;
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
   * The message ID of the recalled message.
   */
  recalledMessageId: string;
  /**
   * The recalled message.
   */
  recalledMessage?: ChatMessage;
  /**
   * The user ID of the operator that recalls the message.
   */
  recalledBy: string;
  /**
   * The extension information of the recalled message.
   */
  recalledExt?: string;
  /**
   * The conversation ID of the recalled message.
   */
  recalledConvId?: string;

  /**
   * Creates a recall message instance.
   * @params params -
   * - recalledMessageId: The message ID of the recalled message.
   * - recalledMessage: The recalled message.
   * - recalledBy: The user ID of the operator that recalls the message.
   * - recalledExt: The extension information of the recalled message.
   * - recalledConvId: The conversation ID of the recalled message.
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
