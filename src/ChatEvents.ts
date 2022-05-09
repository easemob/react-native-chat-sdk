import type { ChatGroupMessageAck } from './common/ChatGroup';
import type { ChatMessage } from './common/ChatMessage';
import type { ChatPresence } from './common/ChatPresence';

export enum ChatMultiDeviceEvent {
  CONTACT_REMOVE,
  CONTACT_ACCEPT,
  CONTACT_DECLINE,
  CONTACT_BAN,
  CONTACT_ALLOW,
  GROUP_CREATE,
  GROUP_DESTROY,
  GROUP_JOIN,
  GROUP_LEAVE,
  GROUP_APPLY,
  GROUP_APPLY_ACCEPT,
  GROUP_APPLY_DECLINE,
  GROUP_INVITE,
  GROUP_INVITE_ACCEPT,
  GROUP_INVITE_DECLINE,
  GROUP_KICK,
  GROUP_BAN,
  GROUP_ALLOW,
  GROUP_BLOCK,
  GROUP_UNBLOCK,
  GROUP_ASSIGN_OWNER,
  GROUP_ADD_ADMIN,
  GROUP_REMOVE_ADMIN,
  GROUP_ADD_MUTE,
  GROUP_REMOVE_MUTE,
}

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
      throw new Error(`not exist this type: ${params}`);
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
   * Occurs when the token has expired.
   */
  onTokenWillExpire(): void;

  /**
   * Occurs when the token is about to expire.
   */
  onTokenDidExpire(): void;
}

export interface ChatMultiDeviceEventListener {
  onContactEvent(
    event?: ChatMultiDeviceEvent,
    target?: string,
    ext?: string
  ): void;

  onGroupEvent(
    event?: ChatMultiDeviceEvent,
    target?: string,
    usernames?: Array<string>
  ): void;
}

export interface ChatCustomEventListener {
  onDataReceived(map: Map<string, any>): void;
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

export interface ChatGroupEventListener {
  onInvitationReceived(params: {
    groupId: string;
    inviter: string;
    groupName?: string;
    reason?: string;
  }): void;
  onRequestToJoinReceived(params: {
    groupId: string;
    applicant: string;
    groupName?: string;
    reason?: string;
  }): void;
  onRequestToJoinAccepted(params: {
    groupId: string;
    accepter: string;
    groupName?: string;
  }): void;
  onRequestToJoinDeclined(params: {
    groupId: string;
    decliner: string;
    groupName?: string;
    reason?: string;
  }): void;
  onInvitationAccepted(params: {
    groupId: string;
    invitee: string;
    reason?: string;
  }): void;
  onInvitationDeclined(params: {
    groupId: string;
    invitee: string;
    reason?: string;
  }): void;
  onUserRemoved(params: { groupId: string; groupName?: string }): void;
  onGroupDestroyed(params: { groupId: string; groupName?: string }): void;
  onAutoAcceptInvitation(params: {
    groupId: string;
    inviter: string;
    inviteMessage?: string;
  }): void;
  onMuteListAdded(params: {
    groupId: string;
    mutes: Array<string>;
    muteExpire?: number;
  }): void;
  onMuteListRemoved(params: { groupId: string; mutes: Array<string> }): void;
  onAdminAdded(params: { groupId: string; admin: string }): void;
  onAdminRemoved(params: { groupId: string; admin: string }): void;
  onOwnerChanged(params: {
    groupId: string;
    newOwner: string;
    oldOwner: string;
  }): void;
  onMemberJoined(params: { groupId: string; member: string }): void;
  onMemberExited(params: { groupId: string; member: string }): void;
  onAnnouncementChanged(params: {
    groupId: string;
    announcement: string;
  }): void;
  onSharedFileAdded(params: { groupId: string; sharedFile: string }): void;
  onSharedFileDeleted(params: { groupId: string; fileId: string }): void;
  onWhiteListAdded(params: { groupId: string; members: Array<string> }): void;
  onWhiteListRemoved(params: { groupId: string; members: Array<string> }): void;
  onAllGroupMemberMuteStateChanged(params: {
    groupId: string;
    isAllMuted: boolean;
  }): void;
}

export interface ChatContactEventListener {
  onContactAdded(userName: string): void;
  onContactDeleted(userName: string): void;
  onContactInvited(userName: string, reason?: string): void;
  onFriendRequestAccepted(userName: string): void;
  onFriendRequestDeclined(userName: string): void;
}

export interface ChatRoomEventListener {
  onChatRoomDestroyed(params: { roomId: string; roomName?: string }): void;
  onMemberJoined(params: { roomId: string; participant: string }): void;
  onMemberExited(params: {
    roomId: string;
    participant: string;
    roomName?: string;
  }): void;
  onRemoved(params: {
    roomId: string;
    participant?: string;
    roomName?: string;
  }): void;
  onMuteListAdded(params: {
    roomId: string;
    mutes: Array<string>;
    expireTime?: string;
  }): void;
  onMuteListRemoved(params: { roomId: string; mutes: Array<string> }): void;
  onAdminAdded(params: { roomId: string; admin: string }): void;
  onAdminRemoved(params: { roomId: string; admin: string }): void;
  onOwnerChanged(params: {
    roomId: string;
    newOwner: string;
    oldOwner: string;
  }): void;
  onAnnouncementChanged(params: { roomId: string; announcement: string }): void;
  onWhiteListAdded(params: { roomId: string; members: Array<string> }): void;
  onWhiteListRemoved(params: { roomId: string; members: Array<string> }): void;
  onAllChatRoomMemberMuteStateChanged(params: {
    roomId: string;
    isAllMuted: boolean;
  }): void;
}

export interface ChatPresenceManagerListener {
  onPresenceStatusChanged(list: Array<ChatPresence>): void;
}
