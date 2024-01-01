import { ChatClient } from './ChatClient';
import { ChatContactManager } from './ChatContactManager';
import {
  ChatConnectEventListener,
  ChatContactEventListener,
  ChatCustomEventListener,
  ChatGroupEventListener,
  ChatMessageEventListener,
  ChatMultiDeviceEvent,
  ChatMultiDeviceEventFromNumber,
  ChatMultiDeviceEventListener,
  ChatPresenceEventListener,
  ChatRoomEventListener,
} from './ChatEvents';
import { ChatGroupManager } from './ChatGroupManager';
import { ChatManager } from './ChatManager';
import { ChatPresenceManager } from './ChatPresenceManager';
import { ChatPushManager } from './ChatPushManager';
import { ChatRoomManager } from './ChatRoomManager';
import { ChatUserInfoManager } from './ChatUserInfoManager';
import { ChatAreaCode } from './common/ChatAreaCode';
import { ChatContact } from './common/ChatContact';
import {
  ChatConversation,
  ChatConversationType,
  ChatConversationTypeToString,
} from './common/ChatConversation';
import {
  ChatConversationTypeFromNumber,
  ChatSearchDirection,
} from './common/ChatConversation';
import { ChatCursorResult } from './common/ChatCursorResult';
import { ChatDeviceInfo } from './common/ChatDeviceInfo';
import { ChatError } from './common/ChatError';
import {
  ChatGroup,
  ChatGroupFileStatusCallback,
  ChatGroupInfo,
  ChatGroupMessageAck,
  ChatGroupOptions,
  ChatGroupPermissionType,
  ChatGroupPermissionTypeFromNumber,
  ChatGroupPermissionTypeToString,
  ChatGroupSharedFile,
  ChatGroupStyle,
  ChatGroupStyleFromNumber,
  ChatGroupStyleToString,
} from './common/ChatGroup';
import { ChatLog } from './common/ChatLog';
import {
  ChatCmdMessageBody,
  ChatCustomMessageBody,
  ChatDownloadStatus,
  ChatDownloadStatusFromNumber,
  ChatDownloadStatusToString,
  ChatFetchMessageOptions,
  ChatFileMessageBody,
  ChatImageMessageBody,
  ChatLocationMessageBody,
  ChatMessage,
  ChatMessageBody,
  ChatMessageChatType,
  ChatMessageChatTypeFromNumber,
  ChatMessageDirection,
  ChatMessageDirectionFromString,
  ChatMessageStatus,
  ChatMessageStatusCallback,
  ChatMessageStatusFromNumber,
  ChatMessageStatusToString,
  ChatMessageType,
  ChatMessageTypeFromString,
  ChatRoomMessagePriority,
  ChatTextMessageBody,
  ChatVideoMessageBody,
  ChatVoiceMessageBody,
} from './common/ChatMessage';
import {
  ChatMessageReaction,
  ChatMessageReactionEvent,
  ChatReactionOperation,
} from './common/ChatMessageReaction';
import {
  ChatMessageThread,
  ChatMessageThreadEvent,
  ChatMessageThreadOperation,
} from './common/ChatMessageThread';
import { ChatOptions } from './common/ChatOptions';
import { ChatPageResult } from './common/ChatPageResult';
import { ChatPresence } from './common/ChatPresence';
import {
  ChatPushConfig,
  ChatPushDisplayStyle,
  ChatPushOption,
} from './common/ChatPushConfig';
import {
  ChatRoom,
  ChatRoomPermissionType,
  ChatRoomPermissionTypeFromNumber,
  ChatRoomPermissionTypeToString,
} from './common/ChatRoom';
import {
  ChatPushRemindType,
  ChatPushRemindTypeFromNumber,
  ChatPushRemindTypeToNumber,
  ChatSilentModeParam,
  ChatSilentModeParamType,
  ChatSilentModeParamTypeFromNumber,
  ChatSilentModeParamTypeToNumber,
  ChatSilentModeResult,
  ChatSilentModeTime,
} from './common/ChatSilentMode';
import { ChatTranslateLanguage } from './common/ChatTranslateLanguage';
import { ChatUserInfo } from './common/ChatUserInfo';

/**
 * export manager
 */
export {
  ChatClient,
  ChatContactManager,
  ChatGroupManager,
  ChatManager,
  ChatPresenceManager,
  ChatPushManager,
  ChatRoomManager,
  ChatUserInfoManager,
};

/**
 * export notify
 */
export {
  ChatConnectEventListener,
  ChatContactEventListener,
  ChatCustomEventListener,
  ChatGroupEventListener,
  ChatMessageEventListener,
  ChatMultiDeviceEventListener,
  ChatPresenceEventListener,
  ChatRoomEventListener,
};

/**
 * export enum type
 */
export {
  ChatAreaCode,
  ChatConversationType,
  ChatDownloadStatus,
  ChatGroupPermissionType,
  ChatGroupStyle,
  ChatMessageChatType,
  ChatMessageDirection,
  ChatMessageStatus,
  ChatMessageThreadOperation,
  ChatMessageType,
  ChatPushDisplayStyle,
  ChatPushRemindType,
  ChatRoomMessagePriority,
  ChatRoomPermissionType,
  ChatSearchDirection,
  ChatSilentModeParamType,
};

/**
 * export class type
 */
export {
  ChatCmdMessageBody,
  ChatContact,
  ChatConversation,
  ChatCursorResult,
  ChatCustomMessageBody,
  ChatDeviceInfo,
  ChatError,
  ChatFetchMessageOptions,
  ChatFileMessageBody,
  ChatGroup,
  ChatGroupFileStatusCallback,
  ChatGroupInfo,
  ChatGroupMessageAck,
  ChatGroupOptions,
  ChatGroupSharedFile,
  ChatImageMessageBody,
  ChatLocationMessageBody,
  ChatLog,
  ChatMessage,
  ChatMessageBody,
  ChatMessageReaction,
  ChatMessageReactionEvent,
  ChatMessageStatusCallback,
  ChatMessageThread,
  ChatMessageThreadEvent,
  ChatMultiDeviceEvent,
  ChatOptions,
  ChatPageResult,
  ChatPresence,
  ChatPushConfig,
  ChatPushOption,
  ChatReactionOperation,
  ChatRoom,
  ChatSilentModeParam,
  ChatSilentModeResult,
  ChatSilentModeTime,
  ChatTextMessageBody,
  ChatTranslateLanguage,
  ChatUserInfo,
  ChatVideoMessageBody,
  ChatVoiceMessageBody,
};

/**
 * export converter
 */
export {
  ChatConversationTypeFromNumber,
  ChatConversationTypeToString,
  ChatDownloadStatusFromNumber,
  ChatDownloadStatusToString,
  ChatGroupPermissionTypeFromNumber,
  ChatGroupPermissionTypeToString,
  ChatGroupStyleFromNumber,
  ChatGroupStyleToString,
  ChatMessageChatTypeFromNumber,
  ChatMessageDirectionFromString,
  ChatMessageStatusFromNumber,
  ChatMessageStatusToString,
  ChatMessageTypeFromString,
  ChatMultiDeviceEventFromNumber,
  ChatPushRemindTypeFromNumber,
  ChatPushRemindTypeToNumber,
  ChatRoomPermissionTypeFromNumber,
  ChatRoomPermissionTypeToString,
  ChatSilentModeParamTypeFromNumber,
  ChatSilentModeParamTypeToNumber,
};

export { default as CHAT_VERSION } from './version';
