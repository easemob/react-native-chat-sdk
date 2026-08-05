import { ChatClient } from 'react-native-chat-sdk';
import type {
  ChatConnectEventListener,
  ChatContactEventListener,
  ChatGroupEventListener,
  ChatMessageEventListener,
} from 'react-native-chat-sdk';
import { addLog } from './log/log_store';

/**
 * init 成功后统一注册第一期相关的全部事件监听，所有回调写入日志。
 * 这是验证异步回调数据正确性的主要手段。
 */

function makeListener<T extends object>(
  interfaceName: string,
  methodNames: string[]
): T {
  const listener: Record<string, unknown> = {};
  for (const name of methodNames) {
    listener[name] = (...args: unknown[]) => {
      const payload =
        args.length === 0 ? undefined : args.length === 1 ? args[0] : args;
      addLog(`${interfaceName}.${name}`, payload);
    };
  }
  return listener as T;
}

const CONNECT_METHODS = [
  'onConnected',
  'onDisconnected',
  'onTokenWillExpire',
  'onTokenDidExpire',
  'onAppActiveNumberReachLimit',
  'onOfflineMessageSyncStart',
  'onOfflineMessageSyncFinish',
  'onUserDidLoginFromOtherDevice',
  'onUserDidLoginFromOtherDeviceWithInfo',
  'onUserDidRemoveFromServer',
  'onUserDidForbidByServer',
  'onUserDidChangePassword',
  'onUserDidLoginTooManyDevice',
  'onUserKickedByOtherDevice',
  'onUserAuthenticationFailed',
];

const MESSAGE_METHODS = [
  'onMessagesReceived',
  'onStreamMessagesReceived',
  'onCmdMessagesReceived',
  'onMessagesRead',
  'onGroupMessageRead',
  'onMessagesDelivered',
  'onMessagesRecalledInfo',
  'onConversationsUpdate',
  'onConversationRead',
  'onMessageReactionDidChange',
  'onChatMessageThreadCreated',
  'onChatMessageThreadUpdated',
  'onChatMessageThreadDestroyed',
  'onChatMessageThreadUserRemoved',
  'onMessageContentChanged',
  'onMessagePinChanged',
];

const GROUP_METHODS = [
  'onInvitationReceived',
  'onRequestToJoinReceived',
  'onRequestToJoinAccepted',
  'onRequestToJoinDeclined',
  'onInvitationAccepted',
  'onInvitationDeclined',
  'onMemberRemoved',
  'onDestroyed',
  'onAutoAcceptInvitation',
  'onMuteListAdded',
  'onMuteListRemoved',
  'onAdminAdded',
  'onAdminRemoved',
  'onOwnerChanged',
  'onMemberJoined',
  'onMembersJoined',
  'onMemberExited',
  'onMembersExited',
  'onAnnouncementChanged',
  'onSharedFileAdded',
  'onSharedFileDeleted',
  'onAllowListAdded',
  'onAllowListRemoved',
  'onAllGroupMemberMuteStateChanged',
  'onDetailChanged',
  'onStateChanged',
  'onMemberAttributesChanged',
];

const CONTACT_METHODS = [
  'onContactAdded',
  'onContactDeleted',
  'onContactInvited',
  'onFriendRequestAccepted',
  'onFriendRequestDeclined',
];

let registered = false;

export function registerAllListeners(): void {
  if (registered) {
    return;
  }
  registered = true;
  const client = ChatClient.getInstance();
  client.addConnectionListener(
    makeListener<ChatConnectEventListener>(
      'ChatConnectEventListener',
      CONNECT_METHODS
    )
  );
  client.chatManager.addMessageListener(
    makeListener<ChatMessageEventListener>(
      'ChatMessageEventListener',
      MESSAGE_METHODS
    )
  );
  client.groupManager.addGroupListener(
    makeListener<ChatGroupEventListener>(
      'ChatGroupEventListener',
      GROUP_METHODS
    )
  );
  client.contactManager.addContactListener(
    makeListener<ChatContactEventListener>(
      'ChatContactEventListener',
      CONTACT_METHODS
    )
  );
  addLog('listeners.registered', {
    connection: CONNECT_METHODS.length,
    message: MESSAGE_METHODS.length,
    group: GROUP_METHODS.length,
    contact: CONTACT_METHODS.length,
  });
}
