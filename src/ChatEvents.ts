import { ChatError } from './common/ChatError';
import type { ChatGroupMessageAck } from './common/ChatGroup';
import type { ChatMessage } from './common/ChatMessage';
import type { ChatPresence } from './common/ChatPresence';

/**
 * Multi-device event types.
 */
export enum ChatMultiDeviceEvent {
  /**
   * The current user removed a contact on another device.
   */
  CONTACT_REMOVE,
  /**
   * The current user accepted a friend request on another device.
   */
  CONTACT_ACCEPT,
  /**
   * The current user declined a friend request on another device.
   */
  CONTACT_DECLINE,
  /**
   * The current user added a contact to the block list on another device.
   */
  CONTACT_BAN,
  /**
   * The current user removed a contact from the block list on another device.
   */
  CONTACT_ALLOW,

  /**
   * The current user created a group on another device.
   */
  GROUP_CREATE,
  /**
   * The current user destroyed a group on another device.
   */
  GROUP_DESTROY,
  /**
   * The current user joined a group on another device.
   */
  GROUP_JOIN,
  /**
   * The current user left a group on another device.
   */
  GROUP_LEAVE,
  /**
   * The current user requested to join a group on another device.
   */
  GROUP_APPLY,
  /**
   * The current user accepted a group request on another device.
   */
  GROUP_APPLY_ACCEPT,
  /**
   * The current user declined a group request on another device.
   */
  GROUP_APPLY_DECLINE,
  /**
   * The current user invited a user to join the group on another device.
   */
  GROUP_INVITE,
  /**
   * The current user accepted a group invitation on another device.
   */
  GROUP_INVITE_ACCEPT,
  /**
   * The current user declined a group invitation on another device.
   */
  GROUP_INVITE_DECLINE,
  /**
   * The current user kicked a member out of a group on another device.
   */
  GROUP_KICK,
  /**
   * The current user added a member to a group block list on another device.
   */
  GROUP_BAN,
  /**
   * The current user removed a member from a group block list on another device.
   */
  GROUP_ALLOW,
  /**
   * The current user blocked a group on another device.
   */
  GROUP_BLOCK,
  /**
   * The current user unblocked a group on another device.
   */
  GROUP_UNBLOCK,
  /**
   * The current user transferred the group ownership on another device.
   */
  GROUP_ASSIGN_OWNER,
  /**
   * The current user added an admin on another device.
   */
  GROUP_ADD_ADMIN,
  /**
   * The current user removed an admin on another device.
   */
  GROUP_REMOVE_ADMIN,
  /**
   * The current user muted a member on another device.
   */
  GROUP_ADD_MUTE,
  /**
   * The current user unmuted a member on another device.
   */
  GROUP_REMOVE_MUTE,
}

/**
 * Contact or group type convert.
 *
 * @param params The integer representing event type.
 * @returns The event type.
 */
export function ChatContactGroupEventFromNumber(
  params: number
): ChatMultiDeviceEvent {
  switch (params) {
    case 2:
      return ChatMultiDeviceEvent.CONTACT_REMOVE;
    case 3:
      return ChatMultiDeviceEvent.CONTACT_ACCEPT;
    case 4:
      return ChatMultiDeviceEvent.CONTACT_DECLINE;
    case 5:
      return ChatMultiDeviceEvent.CONTACT_BAN;
    case 6:
      return ChatMultiDeviceEvent.CONTACT_ALLOW;
    case 10:
      return ChatMultiDeviceEvent.GROUP_CREATE;
    case 11:
      return ChatMultiDeviceEvent.GROUP_DESTROY;
    case 12:
      return ChatMultiDeviceEvent.GROUP_JOIN;
    case 13:
      return ChatMultiDeviceEvent.GROUP_LEAVE;
    case 14:
      return ChatMultiDeviceEvent.GROUP_APPLY;
    case 15:
      return ChatMultiDeviceEvent.GROUP_APPLY_ACCEPT;
    case 16:
      return ChatMultiDeviceEvent.GROUP_APPLY_DECLINE;
    case 17:
      return ChatMultiDeviceEvent.GROUP_INVITE;
    case 18:
      return ChatMultiDeviceEvent.GROUP_INVITE_ACCEPT;
    case 19:
      return ChatMultiDeviceEvent.GROUP_INVITE_DECLINE;
    case 20:
      return ChatMultiDeviceEvent.GROUP_KICK;
    case 21:
      return ChatMultiDeviceEvent.GROUP_BAN;
    case 22:
      return ChatMultiDeviceEvent.GROUP_ALLOW;
    case 23:
      return ChatMultiDeviceEvent.GROUP_BLOCK;
    case 24:
      return ChatMultiDeviceEvent.GROUP_UNBLOCK;
    case 25:
      return ChatMultiDeviceEvent.GROUP_ASSIGN_OWNER;
    case 26:
      return ChatMultiDeviceEvent.GROUP_ADD_ADMIN;
    case 27:
      return ChatMultiDeviceEvent.GROUP_REMOVE_ADMIN;
    case 28:
      return ChatMultiDeviceEvent.GROUP_ADD_MUTE;
    case 29:
      return ChatMultiDeviceEvent.GROUP_REMOVE_MUTE;
    default:
      throw new ChatError({
        code: 1,
        description: `This type is not supported. ` + params,
      });
  }
}

/**
 * The chat connection listener.
 *
 * For the occasion of onDisconnected during unstable network condition, you
 * don't need to reconnect manually, the chat SDK will handle it automatically.
 *
 * There are only two states: onConnected, onDisconnected.
 *
 * Note: We recommend not to update UI based on those methods, because this
 * method is called on worker thread. If you update UI in those methods, other
 * UI errors might be invoked. Also do not insert heavy computation work here,
 * which might invoke other listeners to handle this connection event.
 *
 * Register:
 *  ```typescript
 *  let listener = new (class s implements ChatConnectEventListener {
 *    onTokenWillExpire(): void {
 *      console.log('ConnectScreen.onTokenWillExpire');
 *    }
 *    onTokenDidExpire(): void {
 *      console.log('ConnectScreen.onTokenDidExpire');
 *    }
 *    onConnected(): void {
 *      console.log('ConnectScreen.onConnected');
 *    }
 *    onDisconnected(errorCode?: number): void {
 *      console.log('ConnectScreen.onDisconnected', errorCode);
 *    }
 *  })();
 *  ChatClient.getInstance().addConnectionListener(listener);
 *  ```
 * Unregister:
 *  ```typescript
 *  ChatClient.getInstance().removeConnectionListener(listener);
 *  ```
 */
export interface ChatConnectEventListener {
  /**
   * Occurs when the SDK connects to the chat server successfully.
   */
  onConnected(): void;

  /**
   * Occurs when the SDK disconnect from the chat server.
   *
   * Note that the logout may not be performed at the bottom level when the SDK is disconnected.
   *
   * @param errorCode The Error code, see {@link ChatError}
   */
  onDisconnected(errorCode?: number): void;

  /**
   * Occurs when the agora token has expired.
   */
  onTokenWillExpire(): void;

  /**
   * Occurs when the agora token is about to expire.
   */
  onTokenDidExpire(): void;
}

/**
 * The multi-device event listener.
 * Listens for callback for the current user's actions on other devices, including contact changes and group changes.
 */
export interface ChatMultiDeviceEventListener {
  /**
   * The multi-device event callback of contact.
   *
   * @param event The event type.
   * @param target The username.
   * @param ext The extended Information.
   */
  onContactEvent(
    event?: ChatMultiDeviceEvent,
    target?: string,
    ext?: string
  ): void;

  /**
   * The multi-device event callback of group.
   *
   * @param event The event type.
   * @param target The group ID.
   * @param usernames The array of usernames.
   */
  onGroupEvent(
    event?: ChatMultiDeviceEvent,
    target?: string,
    usernames?: Array<string>
  ): void;
}

/**
 * User custom data.
 */
export interface ChatCustomEventListener {
  onDataReceived(params: any): void;
}

/**
 * The message event listener.
 *
 * This listener is used to check whether messages are received. If messages are sent successfully, a delivery receipt will be returned (delivery receipt needs to be enabled: {@link ChatOptions#requireDeliveryAck(boolean)}.
 *
 * If the peer user reads the received message, a read receipt will be returned (read receipt needs to be enabled: {@link ChatOptions#requireAck(boolean)})
 *
 * During message delivery, the message ID will be changed from a local uuid to a global unique ID that is generated by the server to uniquely identify a message on all devices using the SDK.
 * This API should be implemented in the app to listen for message status changes.
 *
 * Adds the message listener:
 *   ```typescript
 *   let msgListener = new (class ss implements ChatMessageEventListener {
 *     onMessagesReceived(messages: ChatMessage[]): void {
 *       console.log('ConnectScreen.onMessagesReceived', messages);
 *     }
 *     onCmdMessagesReceived(messages: ChatMessage[]): void {
 *       console.log('ConnectScreen.onCmdMessagesReceived', messages);
 *     }
 *     onMessagesRead(messages: ChatMessage[]): void {
 *       console.log('ConnectScreen.onMessagesRead', messages);
 *     }
 *     onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
 *       console.log('ConnectScreen.onGroupMessageRead', groupMessageAcks);
 *     }
 *     onMessagesDelivered(messages: ChatMessage[]): void {
 *       console.log('ConnectScreen.onMessagesDelivered', messages);
 *     }
 *     onMessagesRecalled(messages: ChatMessage[]): void {
 *       console.log('ConnectScreen.onMessagesRecalled', messages);
 *     }
 *     onConversationsUpdate(): void {
 *       console.log('ConnectScreen.onConversationsUpdate');
 *     }
 *     onConversationRead(from: string, to?: string): void {
 *       console.log('ConnectScreen.onConversationRead', from, to);
 *     }
 *   })();
 *   ChatClient.getInstance().chatManager.addListener(msgListener);
 *   ```
 *
 * Removes the message listener:
 *   ```typescript
 *   ChatClient.getInstance().chatManager.delListener(this.msgListener);
 *   ```
 */
export interface ChatMessageEventListener {
  /**
   * Occurs when a message is received.
   *
   * This callback is triggered to notify the user when a message such as texts or an image, video, voice, location, or file is received.
   *
   * @param messages The received messages.
   */
  onMessagesReceived(messages: Array<ChatMessage>): void;

  /**
   * Occurs when a command message is received.
   *
   * This callback only contains a command message body that is usually invisible to users.
   *
   * @param messages The received command messages.
   */
  onCmdMessagesReceived(messages: Array<ChatMessage>): void;

  /**
   * Occurs when a read receipt is received for a message.
   *
   * @param messages The read message(s).
   */
  onMessagesRead(messages: Array<ChatMessage>): void;

  /**
   * Occurs when a read receipt is received for a group message.
   *
   * @param groupMessageAcks The group message read receipt.
   */
  onGroupMessageRead(groupMessageAcks: Array<ChatGroupMessageAck>): void;

  /**
   * Occurs when a delivery receipt is received.
   *
   * @param messages The delivered message.
   */
  onMessagesDelivered(messages: Array<ChatMessage>): void;

  /**
   * Occurs when a received message is recalled.
   *
   * @param messages The recalled message.
   */
  onMessagesRecalled(messages: Array<ChatMessage>): void;

  /**
   * Occurs when the conversation is updated.
   */
  onConversationsUpdate(): void;

  /**
   * Occurs when received conversation read receipt.
   *
   * This callback occurs in either of the following scenarios:
   * - The message is read by the recipient (The conversation receipt is sent). Upon receiving this event, the SDK sets the `isAcked` property of the message in the conversation to `true` in the local database.
   *
   * - In the multi-device login scenario, when one device sends a conversation receipt,
   * the server will set the number of unread messages to 0, and the callback occurs on the other devices. and sets the `isRead` property of the message in the conversation to `true` in the local database.
   * @param from The user who sends the read receipt.
   * @param to The user who receives the read receipt.
   */
  onConversationRead(from: string, to?: string): void;
}

/**
 * The Group event listener.
 */
export interface ChatGroupEventListener {
  /**
   * Occurs when an invitation is rejected by the inviter.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [inviter] The username of the inviter.
   * - Param [reason] The reason.
   */
  onInvitationReceived(params: {
    groupId: string;
    inviter: string;
    groupName?: string;
    reason?: string;
  }): void;

  /**
   * Occurs when a group join application is received from an applicant.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [applicant] The username of the applicant.
   * - Param [reason] The reason.
   */
  onRequestToJoinReceived(params: {
    groupId: string;
    applicant: string;
    groupName?: string;
    reason?: string;
  }): void;
  /**
   * Occurs when a group-join application is accepted.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [accepter] The username of the accepter.
   */
  onRequestToJoinAccepted(params: {
    groupId: string;
    accepter: string;
    groupName?: string;
  }): void;
  /**
   * Occurs when a group-join application is declined.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [decliner] The username of the decliner.
   * - Param [reason] The reason.
   */
  onRequestToJoinDeclined(params: {
    groupId: string;
    decliner: string;
    groupName?: string;
    reason?: string;
  }): void;
  /**
   * Occurs when a group invitation is approved.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [invitee] The username of the invitee.
   * - Param [reason] The reason.
   */
  onInvitationAccepted(params: {
    groupId: string;
    invitee: string;
    reason?: string;
  }): void;
  /**
   * Occurs when a group invitation is declined.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [invitee] The username of the invitee.
   * - Param [reason] The reason.
   */
  onInvitationDeclined(params: {
    groupId: string;
    invitee: string;
    reason?: string;
  }): void;
  /**
   * Occurs when a group member is removed from the group.
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   */
  onUserRemoved(params: { groupId: string; groupName?: string }): void;
  /**
   * Occurs when a group is destroyed.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   */
  onGroupDestroyed(params: { groupId: string; groupName?: string }): void;
  /**
   * Occurs when the group invitation is accepted automatically.
   * The SDK will join the group before notifying the app of the acceptance of the group invitation.
   *
   * @param params The params set.
   * - Param [groupId]			The group ID.
   * - Param [inviter]			The inviter ID.
   * - Param [inviteMessage]		The invitation message.
   */
  onAutoAcceptInvitation(params: {
    groupId: string;
    inviter: string;
    inviteMessage?: string;
  }): void;
  /**
   * Occurs when members are added to the mute list of the group.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [mutes] The members to be muted.
   * - Param [muteExpire] Reserved parameter. The time when the mute state expires.
   */
  onMuteListAdded(params: {
    groupId: string;
    mutes: Array<string>;
    muteExpire?: number;
  }): void;
  /**
   * Occurs when members are removed from the mute list of the group.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [mutes] The members to be removed from the mute list.
   */
  onMuteListRemoved(params: { groupId: string; mutes: Array<string> }): void;
  /**
   * Occurs when members are changed to admins.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [admin] The members changed to be admins.
   */
  onAdminAdded(params: { groupId: string; admin: string }): void;
  /**
   * Occurs when an admin permission is removed.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [admin] The member whose admin permission is removed.
   */
  onAdminRemoved(params: { groupId: string; admin: string }): void;
  /**
   * Occurs when the chat room ownership is transferred.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [newOwner] The new owner.
   * - Param [oldOwner] The previous owner.
   */
  onOwnerChanged(params: {
    groupId: string;
    newOwner: string;
    oldOwner: string;
  }): void;
  /**
   * Occurs when a member joins the group.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [member] The new member.
   */
  onMemberJoined(params: { groupId: string; member: string }): void;
  /**
   * Occurs when a member exits the group.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [member] The member who exits the group.
   */
  onMemberExited(params: { groupId: string; member: string }): void;
  /**
   * Occurs when the announcement changed.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [member] The new announcement.
   */
  onAnnouncementChanged(params: {
    groupId: string;
    announcement: string;
  }): void;
  /**
   * Occurs when a shared file is added to the group.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [member] The new shared File.
   */
  onSharedFileAdded(params: { groupId: string; sharedFile: string }): void;
  /**
   * Occurs when a shared file is deleted.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [member] The ID of the shared file that is deleted.
   */
  onSharedFileDeleted(params: { groupId: string; fileId: string }): void;
  /**
   * Occurs when one or more group members are added to the allow list.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [members] The members that are added to the allow list.
   */
  onWhiteListAdded(params: { groupId: string; members: Array<string> }): void;
  /**
   * Occurs when one or more group members are removed from the allow list.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [members] The members that are removed from the allow list.
   */
  onWhiteListRemoved(params: { groupId: string; members: Array<string> }): void;
  /**
   * Occurs when all group members are muted or unmuted.
   *
   * @param params The params set.
   * - Param [groupId] The group ID.
   * - Param [isAllMuted] Whether all group members are muted or unmuted.
   */
  onAllGroupMemberMuteStateChanged(params: {
    groupId: string;
    isAllMuted: boolean;
  }): void;
}

/**
 * The contact updates listener.
 *
 * Occurs when the contact changes, including requests to add friends, notifications to delete friends, requests to accept friends, and requests to reject friends.
 */
export interface ChatContactEventListener {
  /**
   * Occurs when user is added as a contact by another user.
   *
   * @param userName The new contact to be added.
   */
  onContactAdded(userName: string): void;
  /**
   * Occurs when a user is removed from the contact list by another user.
   *
   * @param userName The user who is removed from the contact list by another user.
   */
  onContactDeleted(userName: string): void;
  /**
   * Occurs when a user receives a friend request.
   *
   * @param userName The user who initiated the friend request.
   * @param reason The invitation message.
   */
  onContactInvited(userName: string, reason?: string): void;
  /**
   * Occurs when a friend request is approved.
   *
   * @param userName The user who initiated the friend request.
   */
  onFriendRequestAccepted(userName: string): void;
  /**
   * Occurs when a friend request is declined.
   *
   * @param userName The user who initiated the friend request.
   */
  onFriendRequestDeclined(userName: string): void;
}

/**
 * The chat room change listener.
 */
export interface ChatRoomEventListener {
  /**
   * Occurs when the chat room is destroyed.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [roomName] The chatroom subject.
   */
  onChatRoomDestroyed(params: { roomId: string; roomName?: string }): void;
  /**
   * Occurs when a member join the chatroom.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [participant] The new member's username.
   */
  onMemberJoined(params: { roomId: string; participant: string }): void;
  /**
   * Occurs when a member leaves the chatroom.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [participant] The new member's username.
   */
  onMemberExited(params: {
    roomId: string;
    participant: string;
    roomName?: string;
  }): void;
  /**
   * Occurs when a member is dismissed from a chat room.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [roomName] The chatroom subject.
   * - Param [participant] The member is dismissed from a chat room.
   */
  onRemoved(params: {
    roomId: string;
    participant?: string;
    roomName?: string;
  }): void;
  /**
   * Occurs when there are chat room member(s) muted (added to mute list).
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [mutes] The members to be muted.
   * - Param [expireTime] The mute duration.
   */
  onMuteListAdded(params: {
    roomId: string;
    mutes: Array<string>;
    expireTime?: string;
  }): void;
  /**
   * Occurs when there are chat room member(s) unmuted (removed from mute list).
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [mutes] The member(s) muted is removed from the mute list.
   */
  onMuteListRemoved(params: { roomId: string; mutes: Array<string> }): void;
  /**
   * Occurs when a member has been changed to an admin.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [admin] The member who has been changed to an admin.
   */
  onAdminAdded(params: { roomId: string; admin: string }): void;
  /**
   * Occurs when an admin is been removed.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [admin] The member whose admin permission is removed.
   */
  onAdminRemoved(params: { roomId: string; admin: string }): void;
  /**
   * Occurs when the chat room ownership has been transferred.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [newOwner] The new owner.
   * - Param [oldOwner] The previous owner.
   */
  onOwnerChanged(params: {
    roomId: string;
    newOwner: string;
    oldOwner: string;
  }): void;
  /**
   * Occurs when the announcement changed.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [announcement] The changed announcement.
   */
  onAnnouncementChanged(params: { roomId: string; announcement: string }): void;
  /**
   * Occurs when the chat room member(s) is added to the allowlist.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [members] The member(s) to be added to the allowlist.
   */
  onWhiteListAdded(params: { roomId: string; members: Array<string> }): void;
  /**
   * Occurs when the chat room member(s) is removed from the allowlist.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [members] The member(s) is removed from the allowlist.
   */
  onWhiteListRemoved(params: { roomId: string; members: Array<string> }): void;
  /**
   * Occurs when all members in the chat room are muted or unmuted.
   *
   * @param params The params set.
   * - Param [roomId] The chatroom ID.
   * - Param [isAllMuted] Whether all chat room members is muted or unmuted.
   */
  onAllChatRoomMemberMuteStateChanged(params: {
    roomId: string;
    isAllMuted: boolean;
  }): void;
}

/**
 * The delegate protocol that defines presence callbacks.
 */
export interface ChatPresenceEventListener {
  /**
   * Occurs when the presence state of a subscribed user changes.
   *
   * @param list Param [list] The new presence state of a subscribed user.
   */
  onPresenceStatusChanged(list: Array<ChatPresence>): void;
}
