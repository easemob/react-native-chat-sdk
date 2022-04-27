import { ChatClient } from './ChatClient';
import { ChatSearchDirection, ChatManager } from './ChatManager';

import {
  ChatConversationType,
  ChatConversation,
} from './common/ChatConversation';
import { ChatCursorResult } from './common/ChatCursorResult';
import { ChatDeviceInfo } from './common/ChatDeviceInfo';
import { ChatError } from './common/ChatError';
import {
  ChatGroupStyle,
  ChatGroupPermissionType,
  ChatGroupMessageAck,
  ChatGroupOptions,
  ChatGroup,
} from './common/ChatGroup';
import {
  ChatMessageChatType,
  ChatMessageDirection,
  ChatMessageStatus,
  ChatDownloadStatus,
  ChatMessageType,
  ChatMessageStatusCallback,
  ChatMessage,
  ChatMessageTypeFromString,
  ChatMessageChatTypeFromNumber,
} from './common/ChatMessage';
import { ChatOptions } from './common/ChatOptions';
import { ChatPageResult } from './common/ChatPageResult';
import { ChatRoomPermissionType, ChatRoom } from './common/ChatRoom';
import { ChatUserInfoType, ChatUserInfo } from './common/ChatUserInfo';
import type {
  ChatConnectEventListener,
  ChatMultiDeviceEventListener,
  ChatCustomEventListener,
  ChatContactEventListener,
  ChatConversationEventListener,
  ChatGroupEventListener,
  ChatRoomEventListener,
  ChatMessageEventListener,
} from './ChatEvents';

/**
 * export Objects
 */
export { ChatClient, ChatManager };

/**
 * export enum
 */
export {
  ChatConversationType,
  ChatGroupStyle,
  ChatGroupPermissionType,
  ChatMessageChatType,
  ChatMessageDirection,
  ChatMessageStatus,
  ChatDownloadStatus,
  ChatMessageType,
  ChatRoomPermissionType,
  ChatUserInfoType,
  ChatSearchDirection,
};

/**
 * export class
 */
export {
  ChatConversation,
  ChatCursorResult,
  ChatDeviceInfo,
  ChatError,
  ChatGroupMessageAck,
  ChatGroupOptions,
  ChatGroup,
  ChatMessageStatusCallback,
  ChatMessage,
  ChatOptions,
  ChatPageResult,
  ChatRoom,
  ChatUserInfo,
  ChatMessageEventListener,
  ChatConnectEventListener,
  ChatMultiDeviceEventListener,
  ChatCustomEventListener,
  ChatContactEventListener,
  ChatConversationEventListener,
  ChatGroupEventListener,
  ChatRoomEventListener,
};

export { ChatMessageTypeFromString, ChatMessageChatTypeFromNumber };
