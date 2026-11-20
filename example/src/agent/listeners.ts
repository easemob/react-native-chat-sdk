/**
 * Agent-side SDK listener registration (contract §11). Registered by the
 * ChatClient.init handler after a successful init — independent from the
 * example app's `../listeners.ts` (which covers neither the multi-device nor
 * the presence listener and logs to the UI channel instead of the evidence
 * stream).
 *
 * Every callback is forwarded to the evidence store synchronously with the
 * canonical source name and payload shape. Sources are the bare callback
 * names on the Flutter side; the RN callbacks renamed by this file are mapped
 * per contract §11.
 */

import {
  ChatClient,
  ChatConversationType,
  ChatMultiDeviceEvent,
  type ChatConnectEventListener,
  type ChatContactEventListener,
  type ChatGroup,
  type ChatGroupEventListener,
  type ChatMessage,
  type ChatMessageEventListener,
  type ChatMultiDeviceEventListener,
  type ChatPresenceEventListener,
  type ChatRoomEventListener,
  type ChatUserInfoEventListener,
} from 'react-native-chat-sdk';
import {
  canonicalGroup,
  canonicalMessage,
  canonicalPresence,
  canonicalRecallInfo,
  canonicalUserInfo,
} from './canonical';

export type AgentEmit = (source: string, payload: unknown) => void;

function multiDeviceEventName(
  event: ChatMultiDeviceEvent | undefined
): unknown {
  return event === undefined ? undefined : ChatMultiDeviceEvent[event];
}

function conversationTypeName(type: ChatConversationType | undefined): unknown {
  return type === undefined ? undefined : ChatConversationType[type];
}

function connectionListener(emit: AgentEmit): ChatConnectEventListener {
  return {
    onConnected: () => emit('onConnected', {}),
    onDisconnected: () =>
      emit('onDisconnected', {
        errorCode: null,
        info: null,
        logout: false,
      }),
    onTokenWillExpire: () => emit('onTokenWillExpire', {}),
    onTokenDidExpire: () => emit('onTokenDidExpire', {}),
    onOfflineMessageSyncStart: () => emit('onOfflineMessageSyncStart', {}),
    onOfflineMessageSyncFinish: () => emit('onOfflineMessageSyncFinish', {}),
  };
}

function multiDeviceListener(emit: AgentEmit): ChatMultiDeviceEventListener {
  return {
    onContactEvent: (event, target, ext) =>
      emit('onContactEvent', {
        event: multiDeviceEventName(event),
        userId: target,
        ext: ext ?? null,
      }),
    onGroupEvent: (event, target, usernames) =>
      emit('onGroupEvent', {
        event: multiDeviceEventName(event),
        groupId: target,
        userIds: usernames ?? [],
      }),
    onThreadEvent: (event, target, usernames) =>
      emit('onChatThreadEvent', {
        event: multiDeviceEventName(event),
        chatThreadId: target,
        userIds: usernames ?? [],
      }),
    onMessageRemoved: (convId, deviceId) =>
      emit('onRemoteMessagesRemoved', {
        conversationId: convId,
        deviceId: deviceId ?? null,
      }),
    onConversationEvent: (event, convId, convType) =>
      emit('onConversationEvent', {
        event: multiDeviceEventName(event),
        conversationId: convId,
        type: conversationTypeName(convType),
      }),
  };
}

function messageListener(emit: AgentEmit): ChatMessageEventListener {
  const messages = (list: ChatMessage[]) => ({
    messages: list.map(canonicalMessage),
  });
  return {
    onMessagesReceived: (list) => emit('onMessagesReceived', messages(list)),
    onStreamMessagesReceived: (list) =>
      emit('onStreamMessagesReceived', messages(list)),
    onCmdMessagesReceived: (list) =>
      emit('onCmdMessagesReceived', messages(list)),
    onMessagesRead: (list) => emit('onMessagesRead', messages(list)),
    onMessagesDelivered: (list) => emit('onMessagesDelivered', messages(list)),
    onMessagesRecalledInfo: (info) =>
      emit('onMessagesRecalledInfo', {
        recallMessageInfos: info.map(canonicalRecallInfo),
      }),
    onConversationsUpdate: () => emit('onConversationsUpdate', {}),
    onMessageReactionDidChange: (list) =>
      emit('onMessageReactionDidChange', { events: list }),
    onChatMessageThreadCreated: (event) =>
      emit('onChatThreadCreate', { event }),
    onChatMessageThreadUpdated: (event) =>
      emit('onChatThreadUpdate', { event }),
    onChatMessageThreadDestroyed: (event) =>
      emit('onChatThreadDestroy', { event }),
    onChatMessageThreadUserRemoved: (event) =>
      emit('onUserKickOutOfChatThread', { event }),
    onMessageContentChanged: (message, lastModifyOperatorId, lastModifyTime) =>
      emit('onMessageContentChanged', {
        message: canonicalMessage(message),
        operatorId: lastModifyOperatorId,
        operationTime: lastModifyTime,
      }),
    onMessagePinChanged: (params) =>
      emit('onMessagePinChanged', {
        messageId: params.messageId,
        conversationId: params.convId,
        pinOperation: params.pinOperation,
        pinInfo: params.pinInfo ?? null,
      }),
  };
}

function contactListener(emit: AgentEmit): ChatContactEventListener {
  return {
    onContactAdded: (userName) => emit('onContactAdded', { userId: userName }),
    onContactDeleted: (userName) =>
      emit('onContactDeleted', { userId: userName }),
    onContactInvited: (userName, reason) =>
      emit('onContactInvited', { userId: userName, reason: reason ?? null }),
    onFriendRequestAccepted: (userName) =>
      emit('onFriendRequestAccepted', { userId: userName }),
    onFriendRequestDeclined: (userName) =>
      emit('onFriendRequestDeclined', { userId: userName }),
    onContactInfoUpdate: (contact) => emit('onContactInfoUpdate', { contact }),
  };
}

function groupListener(emit: AgentEmit): ChatGroupEventListener {
  return {
    onInvitationReceived: (p) => emit('onInvitationReceivedFromGroup', p),
    onRequestToJoinReceived: (p) => emit('onRequestToJoinReceivedFromGroup', p),
    onRequestToJoinAccepted: (p) => emit('onRequestToJoinAcceptedFromGroup', p),
    onRequestToJoinDeclined: (p) => emit('onRequestToJoinDeclinedFromGroup', p),
    onInvitationAccepted: (p) => emit('onInvitationAcceptedFromGroup', p),
    onInvitationDeclined: (p) => emit('onInvitationDeclinedFromGroup', p),
    onMemberRemoved: (p) => emit('onUserRemovedFromGroup', p),
    onDestroyed: (p) => emit('onGroupDestroyed', p),
    onAutoAcceptInvitation: (p) => emit('onAutoAcceptInvitationFromGroup', p),
    onMuteListAdded: (p) => emit('onMuteListAddedFromGroup', p),
    onMuteListRemoved: (p) => emit('onMuteListRemovedFromGroup', p),
    onAdminAdded: (p) => emit('onAdminAddedFromGroup', p),
    onAdminRemoved: (p) => emit('onAdminRemovedFromGroup', p),
    onOwnerChanged: (p) => emit('onOwnerChangedFromGroup', p),
    onMembersJoined: (p) =>
      emit('onMembersJoinedFromGroup', {
        groupId: p.groupId,
        userIds: p.members,
      }),
    onMembersExited: (p) =>
      emit('onMembersExitedFromGroup', {
        groupId: p.groupId,
        userIds: p.members,
      }),
    onAnnouncementChanged: (p) => emit('onAnnouncementChangedFromGroup', p),
    onSharedFileAdded: (p) => emit('onSharedFileAddedFromGroup', p),
    onSharedFileDeleted: (p) => emit('onSharedFileDeletedFromGroup', p),
    onAllowListAdded: (p) => emit('onAllowListAddedFromGroup', p),
    onAllowListRemoved: (p) => emit('onAllowListRemovedFromGroup', p),
    onAllGroupMemberMuteStateChanged: (p) =>
      emit('onAllGroupMemberMuteStateChanged', p),
    onDetailChanged: (group: ChatGroup) =>
      emit('onSpecificationDidUpdate', { group: canonicalGroup(group) }),
    onStateChanged: (group: ChatGroup) =>
      emit('onDisableChanged', {
        groupId: group.groupId,
        isDisable: group.options?.isDisabled ?? false,
      }),
    onMemberAttributesChanged: (p) =>
      emit('onAttributesChangedOfGroupMember', {
        groupId: p.groupId,
        userId: p.member,
        attributes: p.attributes,
        operatorId: p.operator,
      }),
    onUserGroupNamecardChanged: (p) => emit('onUserGroupNamecardChanged', p),
  };
}

function roomListener(emit: AgentEmit): ChatRoomEventListener {
  return {
    onDestroyed: (p) => emit('onChatRoomDestroyed', p),
    onMemberJoined: (p) => emit('onMemberJoinedFromChatRoom', p),
    onMemberExited: (p) => emit('onMemberExitedFromChatRoom', p),
    onMemberRemoved: (p) => emit('onRemovedFromChatRoom', p),
    onMuteListAddedV2: (p) => emit('onMuteListAddedFromChatRoom', p),
    onMuteListRemoved: (p) => emit('onMuteListRemovedFromChatRoom', p),
    onAdminAdded: (p) => emit('onAdminAddedFromChatRoom', p),
    onAdminRemoved: (p) => emit('onAdminRemovedFromChatRoom', p),
    onOwnerChanged: (p) => emit('onOwnerChangedFromChatRoom', p),
    onAnnouncementChanged: (p) => emit('onAnnouncementChangedFromChatRoom', p),
    onAllowListAdded: (p) => emit('onAllowListAddedFromChatRoom', p),
    onAllowListRemoved: (p) => emit('onAllowListRemovedFromChatRoom', p),
    onAllChatRoomMemberMuteStateChanged: (p) =>
      emit('onAllChatRoomMemberMuteStateChanged', p),
    onSpecificationChanged: (room) => emit('onSpecificationChanged', { room }),
    onAttributesUpdated: (p) =>
      emit('onAttributesUpdated', {
        roomId: p.roomId,
        attributes:
          p.attributes instanceof Map
            ? Object.fromEntries(p.attributes)
            : p.attributes,
        from: p.from,
      }),
    onAttributesRemoved: (p) => emit('onAttributesRemoved', p),
  };
}

function presenceListener(emit: AgentEmit): ChatPresenceEventListener {
  return {
    onPresenceStatusChanged: (list) =>
      emit('onPresenceStatusChanged', { list: list.map(canonicalPresence) }),
  };
}

function userInfoListener(emit: AgentEmit): ChatUserInfoEventListener {
  return {
    onSelfUserInfoUpdate: (userInfo) =>
      emit('onSelfUserInfoUpdate', { userInfo: canonicalUserInfo(userInfo) }),
    onUserInfoUpdate: (userInfos) =>
      emit('onUserInfoUpdate', {
        userInfos: userInfos.map(canonicalUserInfo),
      }),
  };
}

/**
 * Register the full contract §11 listener set. Idempotent. Emits the
 * `listeners.registered` agent event with per-domain callback counts.
 */
export function createAgentListenerRegistrar(emit: AgentEmit): () => void {
  let registered = false;
  return () => {
    if (registered) {
      return;
    }
    registered = true;
    const client = ChatClient.getInstance();
    client.addConnectionListener(connectionListener(emit));
    client.addMultiDeviceListener(multiDeviceListener(emit));
    client.chatManager.addMessageListener(messageListener(emit));
    client.groupManager.addGroupListener(groupListener(emit));
    client.contactManager.addContactListener(contactListener(emit));
    client.roomManager.addRoomListener(roomListener(emit));
    client.presenceManager.addPresenceListener(presenceListener(emit));
    client.userManager.addUserInfoListener(userInfoListener(emit));
    emit('listeners.registered', {
      connection: 9,
      multiDevice: 5,
      message: 14,
      group: 26,
      contact: 6,
      room: 16,
      presence: 1,
      userInfo: 2,
    });
  };
}
