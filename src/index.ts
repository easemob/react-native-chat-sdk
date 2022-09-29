import { ChatClient } from './ChatClient';
import { ChatManager } from './ChatManager';
import { ChatContactManager } from './ChatContactManager';
import { ChatGroupManager } from './ChatGroupManager';
import { ChatPresenceManager } from './ChatPresenceManager';
import { ChatPushManager } from './ChatPushManager';
import { ChatRoomManager } from './ChatRoomManager';
import { ChatUserInfoManager } from './ChatUserInfoManager';
import type {
  ChatMultiDeviceEvent,
  ChatConnectEventListener,
  ChatMultiDeviceEventListener,
  ChatCustomEventListener,
  ChatMessageEventListener,
  ChatGroupEventListener,
  ChatContactEventListener,
  ChatRoomEventListener,
  ChatPresenceEventListener,
  ChatMultiDeviceEventFromNumber,
} from './ChatEvents';
import {
  ChatConversationType,
  ChatConversation,
  ChatConversationTypeToString,
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
  ChatGroupInfo,
  ChatGroupFileStatusCallback,
  ChatGroupSharedFile,
  ChatGroupStyleFromNumber,
  ChatGroupStyleToString,
  ChatGroupPermissionTypeFromNumber,
  ChatGroupPermissionTypeToString,
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
  ChatMessageBody,
  ChatTextMessageBody,
  ChatLocationMessageBody,
  ChatFileMessageBody,
  ChatImageMessageBody,
  ChatVideoMessageBody,
  ChatVoiceMessageBody,
  ChatCmdMessageBody,
  ChatCustomMessageBody,
  ChatMessageDirectionFromString,
  ChatMessageStatusFromNumber,
  ChatMessageStatusToString,
  ChatDownloadStatusFromNumber,
  ChatDownloadStatusToString,
} from './common/ChatMessage';
import {
  ChatConversationTypeFromNumber,
  ChatSearchDirection,
} from './common/ChatConversation';
import { ChatOptions } from './common/ChatOptions';
import { ChatPageResult } from './common/ChatPageResult';
import {
  ChatRoomPermissionType,
  ChatRoom,
  ChatRoomPermissionTypeFromNumber,
  ChatRoomPermissionTypeToString,
} from './common/ChatRoom';
import { ChatUserInfo } from './common/ChatUserInfo';
import {
  ChatMessageReaction,
  ChatMessageReactionEvent,
} from './common/ChatMessageReaction';
import {
  ChatMessageThread,
  ChatMessageThreadEvent,
  ChatMessageThreadOperation,
} from './common/ChatMessageThread';
import { ChatPresence } from './common/ChatPresence';
import { ChatTranslateLanguage } from './common/ChatTranslateLanguage';
import {
  ChatPushDisplayStyle,
  ChatPushConfig,
  ChatPushOption,
} from './common/ChatPushConfig';
import {
  ChatPushRemindType,
  ChatPushRemindTypeFromNumber,
  ChatPushRemindTypeToNumber,
  ChatSilentModeParam,
  ChatSilentModeParamType,
  ChatSilentModeParamTypeFromNumber,
  ChatSilentModeParamTypeToNumber,
  ChatSilentModeTime,
  ChatSilentModeResult,
} from './common/ChatSilentMode';
import type { ChatAreaCode } from './common/ChatAreaCode';

/**
 * export manager
 */
export {
  ChatClient,
  ChatManager,
  ChatContactManager,
  ChatGroupManager,
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
  ChatMultiDeviceEventListener,
  ChatCustomEventListener,
  ChatMessageEventListener,
  ChatGroupEventListener,
  ChatContactEventListener,
  ChatRoomEventListener,
  ChatPresenceEventListener,
};

/**
 * export enum type
 */
export {
  ChatSearchDirection,
  ChatConversationType,
  ChatGroupStyle,
  ChatGroupPermissionType,
  ChatMessageChatType,
  ChatMessageDirection,
  ChatMessageStatus,
  ChatDownloadStatus,
  ChatMessageType,
  ChatRoomPermissionType,
  ChatMessageThreadOperation,
  ChatSilentModeParamType,
  ChatPushRemindType,
  ChatPushDisplayStyle,
  ChatAreaCode,
};

/**
 * export class type
 */
export {
  ChatConversation,
  ChatCursorResult,
  ChatDeviceInfo,
  ChatError,
  ChatGroupMessageAck,
  ChatGroupOptions,
  ChatGroup,
  ChatGroupSharedFile,
  ChatGroupInfo,
  ChatGroupFileStatusCallback,
  ChatMessageStatusCallback,
  ChatMessage,
  ChatMessageBody,
  ChatTextMessageBody,
  ChatLocationMessageBody,
  ChatFileMessageBody,
  ChatImageMessageBody,
  ChatVideoMessageBody,
  ChatVoiceMessageBody,
  ChatCmdMessageBody,
  ChatCustomMessageBody,
  ChatOptions,
  ChatPageResult,
  ChatPresence,
  ChatRoom,
  ChatTranslateLanguage,
  ChatUserInfo,
  ChatMultiDeviceEvent,
  ChatMessageReaction,
  ChatMessageThread,
  ChatMessageThreadEvent,
  ChatMessageReactionEvent,
  ChatPushConfig,
  ChatPushOption,
  ChatSilentModeTime,
  ChatSilentModeParam,
  ChatSilentModeResult,
};

/**
 * export converter
 */
export {
  ChatMessageTypeFromString,
  ChatMessageChatTypeFromNumber,
  ChatMessageDirectionFromString,
  ChatMessageStatusFromNumber,
  ChatMessageStatusToString,
  ChatDownloadStatusFromNumber,
  ChatDownloadStatusToString,
  ChatConversationTypeFromNumber,
  ChatMultiDeviceEventFromNumber,
  ChatConversationTypeToString,
  ChatGroupStyleFromNumber,
  ChatGroupStyleToString,
  ChatGroupPermissionTypeFromNumber,
  ChatGroupPermissionTypeToString,
  ChatRoomPermissionTypeFromNumber,
  ChatRoomPermissionTypeToString,
  ChatSilentModeParamTypeFromNumber,
  ChatSilentModeParamTypeToNumber,
  ChatPushRemindTypeFromNumber,
  ChatPushRemindTypeToNumber,
};
