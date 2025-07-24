import { ExceptionHandler } from './__internal__/ErrorHandler';
import type { ChatConversationType } from './common/ChatConversation';
import { ChatException } from './common/ChatError';
import type { ChatGroup, ChatGroupMessageAck } from './common/ChatGroup';
import type {
  ChatMessage,
  ChatMessagePinInfo,
  ChatRecalledMessageInfo,
} from './common/ChatMessage';
import type { ChatMessageReactionEvent } from './common/ChatMessageReaction';
import type { ChatMessageThreadEvent } from './common/ChatMessageThread';
import type { ChatPresence } from './common/ChatPresence';
import type { ChatRoom } from './common/ChatRoom';

/**
 *  The event types in multi-device login scenarios.
 *
 * This class takes user A that uses both Device A1 and Device A2 as an example to describe when the various types of multi-device events are triggered.
 */
export enum ChatMultiDeviceEvent {
  /**
   * If user A deletes a contact on Device A1, this event is triggered on Device A2.
   */
  CONTACT_REMOVE = 2,
  /**
   * If user A accepts a friend request on Device A1, this event is triggered on Device A2.
   */
  CONTACT_ACCEPT,
  /**
   * If user A declines a friend request on Device A1, this event is triggered on Device A2.
   */
  CONTACT_DECLINE,
  /**
   * If user A adds another user to the block list on Device A1, this event is triggered on Device A2.
   */
  CONTACT_BAN,
  /**
   * If user A removes another user from the block list on Device A1, this event is triggered on Device A2.
   */
  CONTACT_ALLOW,

  /**
   * If user A creates a chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_CREATE = 10,
  /**
   * If user A destroys a chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_DESTROY,
  /**
   * If user A joins a chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_JOIN,
  /**
   * If user A leaves a chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_LEAVE,
  /**
   * If user A requests to join a chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_APPLY,
  /**
   * If user A accepts a request to join the chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_APPLY_ACCEPT,
  /**
   * If user A declines a request to join the chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_APPLY_DECLINE,
  /**
   * If user A invites a user to join the chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_INVITE,
  /**
   * If user A accepts a group invitation on Device A1, this event is triggered on Device A2.
   */
  GROUP_INVITE_ACCEPT,
  /**
   * If user A declines a group invitation on Device A1, this event is triggered on Device A2.
   */
  GROUP_INVITE_DECLINE,
  /**
   * If user A removes a user from a chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_KICK,
  /**
   * If user A adds a member to a group block list on Device A1, this event is triggered on Device A2.
   */
  GROUP_BAN,
  /**
   * If user A removes a member from a group block list on Device A1, this event is triggered on Device A2.
   */
  GROUP_ALLOW,
  /**
   * If user A blocks messages from a chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_BLOCK,
  /**
   * If user A unblocks messages from a chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_UNBLOCK,
  /**
   * If user A transfers the group ownership on Device A1, this event is triggered on Device A2.
   */
  GROUP_ASSIGN_OWNER,
  /**
   * If user A adds a group admin on Device A1, this event is triggered on Device A2.
   */
  GROUP_ADD_ADMIN,
  /**
   * If user A removes a group admin on Device A1, this event is triggered on Device A2.
   */
  GROUP_REMOVE_ADMIN,
  /**
   * If user A mutes a group member on Device A1, this event is triggered on Device A2.
   */
  GROUP_ADD_MUTE,
  /**
   * If user A unmutes a group member on Device A1, this event is triggered on Device A2.
   */
  GROUP_REMOVE_MUTE,
  /**
   * If user A adds other members to the allow list of the chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_ADD_USER_ALLOW_LIST,
  /**
   * If user A removes other members from the allow list of the chat group on Device A1, this event is triggered on Device A2.
   */
  GROUP_REMOVE_USER_ALLOW_LIST,
  /**
   * If user A mutes all chat group members on Device A1, this event is triggered on Device A2.
   *
   */
  GROUP_ALL_BAN,
  /**
   * If user A unmutes all chat group members on Device A1, this event is triggered on Device A2.
   *
   * Even if all chat group members are unmuted, members on the mute list still cannot send messages in the group.
   */
  GROUP_REMOVE_ALL_BAN,
  /**
   * If user A creates a message thread on Device A1, this event is triggered on Device A2.
   */
  THREAD_CREATE = 40,
  /**
   * If user A destroys a message thread on Device A1, this event is triggered on Device A2.
   */
  THREAD_DESTROY,
  /**
   * If user A joins a message thread on Device A1, this event is triggered on Device A2.
   */
  THREAD_JOIN,
  /**
   * If user A leaves a message thread on Device A1, this event is triggered on Device A2.
   */
  THREAD_LEAVE,
  /**
   * If user A updates the message thread name, or sends or recalls a message in thread on Device A1, this event is triggered on Device A2.
   */
  THREAD_UPDATE,
  /**
   * If user A kicks a user from a message thread on Device A1, this event is triggered on Device A2.
   */
  THREAD_KICK,
  /**
   * The current user modified custom attributes of a group member on another device.
   */
  GROUP_METADATA_CHANGED = 52,
  /**
   * If user A pins a conversation on device A1, this event is triggered on device A2.
   */
  CONVERSATION_PINNED = 60,
  /**
   * If user A unpins a conversation on device A1, this event is triggered on device A2.
   */
  CONVERSATION_UNPINNED = 61,
  /**
   * If user A deletes a conversation on device A1, this event is triggered on device A2.
   */
  CONVERSATION_DELETED = 62,
  /**
   * If user A updates a conversation mark on device A1, this event is triggered on device A2.
   */
  CONVERSATION_UPDATE_MARK = 63,
  /**
   * If user A mutes a conversation on device A1, this event is triggered on device A2.
   *
   * Upon receiving this event, the system will automatically update the push mode information of the conversation. You need to call the corresponding method to update the conversation.
   */
  CONVERSATION_MUTE_CHANGED = 64,
}

/**
 * Converts the multi-device event from Int to enum.
 *
 * @param params The multi-device event of the int type.
 * @returns The multi-device event of the enum type.
 */
export function ChatMultiDeviceEventFromNumber(
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
    case 30:
      return ChatMultiDeviceEvent.GROUP_ADD_USER_ALLOW_LIST;
    case 31:
      return ChatMultiDeviceEvent.GROUP_REMOVE_USER_ALLOW_LIST;
    case 32:
      return ChatMultiDeviceEvent.GROUP_ALL_BAN;
    case 33:
      return ChatMultiDeviceEvent.GROUP_REMOVE_ALL_BAN;

    case 40:
      return ChatMultiDeviceEvent.THREAD_CREATE;
    case 41:
      return ChatMultiDeviceEvent.THREAD_DESTROY;
    case 42:
      return ChatMultiDeviceEvent.THREAD_JOIN;
    case 43:
      return ChatMultiDeviceEvent.THREAD_LEAVE;
    case 44:
      return ChatMultiDeviceEvent.THREAD_UPDATE;
    case 45:
      return ChatMultiDeviceEvent.THREAD_KICK;

    case 52:
      return ChatMultiDeviceEvent.GROUP_METADATA_CHANGED;

    case 60:
      return ChatMultiDeviceEvent.CONVERSATION_PINNED;
    case 61:
      return ChatMultiDeviceEvent.CONVERSATION_UNPINNED;
    case 62:
      return ChatMultiDeviceEvent.CONVERSATION_DELETED;
    case 63:
      return ChatMultiDeviceEvent.CONVERSATION_UPDATE_MARK;
    case 64:
      return ChatMultiDeviceEvent.CONVERSATION_MUTE_CHANGED;

    default:
      const ret = params as ChatMultiDeviceEvent;
      ExceptionHandler.getInstance().sendExcept({
        except: new ChatException({
          code: 1,
          description: `This type is not supported. ` + params,
        }),
        from: 'ChatMultiDeviceEventFromNumber',
      });
      return ret;
  }
}

/**
 * The connection event listener.
 *
 * In the case of disconnection in an unstable network environment, the app using the SDK receives the `onDisconnected` callback.
 *
 * You do not need to reconnect manually as the chat SDK will handle it automatically.
 *
 * There are two connection-related callbacks:
 * - `onConnected`: Occurs when the connection is set up.
 * - `onDisconnected`: Occurs when the connection breaks down.
 *
 * Adds a connection event listener:
 *
 *  ```typescript
 *  let listener = new (class s implements ChatConnectEventListener {
 *    onTokenWillExpire(): void {
 *      chatlog.log('ConnectScreen.onTokenWillExpire');
 *    }
 *    onTokenDidExpire(): void {
 *      chatlog.log('ConnectScreen.onTokenDidExpire');
 *    }
 *    onConnected(): void {
 *      chatlog.log('ConnectScreen.onConnected');
 *    }
 *    onDisconnected(errorCode?: number): void {
 *      chatlog.log('ConnectScreen.onDisconnected', errorCode);
 *    }
 *  })();
 *  ChatClient.getInstance().addConnectionListener(listener);
 *  ```
 * Removes a connection event listener:
 *
 *  ```typescript
 *  ChatClient.getInstance().removeConnectionListener(listener);
 *  ```
 */
export interface ChatConnectEventListener {
  /**
   * Occurs when the SDK connects to the chat server successfully.
   */
  onConnected?(): void;

  /**
   * Occurs when the SDK disconnects from the chat server.
   *
   * The user also remains logged in. For the cases where the user is disconnected by the server, see {@link ChatConnectEventListener.onAppActiveNumberReachLimit}, {@link ChatConnectEventListener.onUserDidLoginFromOtherDeviceWithInfo}, {@link ChatConnectEventListener.onUserDidRemoveFromServer}, {@link ChatConnectEventListener.onUserDidForbidByServer}, {@link ChatConnectEventListener.onUserDidChangePassword}, {@link ChatConnectEventListener.onUserDidLoginTooManyDevice}, {@link ChatConnectEventListener.onUserKickedByOtherDevice}, {@link ChatConnectEventListener.onUserAuthenticationFailed}.
   */
  onDisconnected?(): void;

  /**
   * Occurs when the token is about to expire.
   *
   * This event occurs from when 20% of the validity period is left.
   */
  onTokenWillExpire?(): void;

  /**
   * Occurs when the token has expired.
   */
  onTokenDidExpire?(): void;

  /**
   * The number of daily active users (DAU) or monthly active users (MAU) for the app has reached the upper limit.
   *
   * The user is disconnected by the server.
   */
  onAppActiveNumberReachLimit?(): void;

  /**
   * Callback invoked when the synchronization of offline messages starts.
   */
  onOfflineMessageSyncStart?(): void;

  /**
   * Callback invoked when the synchronization of offline messages finishes.
   */
  onOfflineMessageSyncFinish?(): void;

  /**
   * Occurs when the current user account is logged in to another device.
   *
   * The user is disconnected by the server.
   *
   * @deprecated 2024-08-15 replace with {@link onUserDidLoginFromOtherDeviceWithInfo}
   */
  onUserDidLoginFromOtherDevice?(deviceName?: string): void;

  /**
   * Occurs when the current user account is logged in to another device.
   *
   * The user is disconnected by the server.
   *
   * @params -
   * - Param [deviceName] The device name.
   * - Param [ext] The extension of user information. see {@link ChatOptions.loginExtraInfo}.
   *
   */
  onUserDidLoginFromOtherDeviceWithInfo?(params: {
    deviceName: string;
    ext?: string;
  }): void;

  /**
   * Occurs when the current chat user is removed from the server.
   *
   * The user is disconnected by the server.
   */
  onUserDidRemoveFromServer?(): void;

  /**
   * Occurs when the current chat user is banned from accessing the server.
   *
   * The user is disconnected by the server.
   */
  onUserDidForbidByServer?(): void;

  /**
   * Occurs when the current chat user changed the password.
   *
   * The user is disconnected by the server.
   */
  onUserDidChangePassword?(): void;

  /**
   * Occurs when the current chat user logged in to many devices.
   *
   * The user is disconnected by the server.
   */
  onUserDidLoginTooManyDevice?(): void;

  /**
   * Occurs when the current chat user is kicked out of the app by another device.
   *
   * The user is disconnected by the server.
   */
  onUserKickedByOtherDevice?(): void;

  /**
   * Occurs when the current chat user authentication failed.
   *
   * This callback is triggered in the following typical scenarios: The token expires or token authentication fails.
   *
   * The user is disconnected by the server.
   */
  onUserAuthenticationFailed?(): void;
}

/**
 * The multi-device event listener.
 *
 * The listener listens for the actions of the current user on other devices, including contact events, group events, thread events, and conversation events.
 */
export interface ChatMultiDeviceEventListener {
  /**
   * Occurs when a contact event occurs.
   *
   * @param event The event type.
   * @param target The user ID.
   * @param ext The extension of user information.
   */
  onContactEvent?(
    event?: ChatMultiDeviceEvent,
    target?: string,
    ext?: string
  ): void;

  /**
   * Occurs when a group event occurs.
   *
   * @param event The event type.
   * @param target The group ID.
   * @param usernames The array of user IDs.
   */
  onGroupEvent?(
    event?: ChatMultiDeviceEvent,
    target?: string,
    usernames?: Array<string>
  ): void;

  /**
   * Occurs when a thread event occurs.
   *
   * @param event The event type.
   * @param target The group ID.
   * @param usernames The array of user IDs.
   */
  onThreadEvent?(
    event?: ChatMultiDeviceEvent,
    target?: string,
    usernames?: Array<string>
  ): void;

  /**
   * Callback to other devices after conversation deleted message from server after enabling multiple devices.
   *
   * @param convId The conversation ID.
   * @param deviceId The device ID.
   */
  onMessageRemoved?(convId?: string, deviceId?: string): void;

  /**
   * Occurs when a conversation event occurs.
   *
   * @param event The event type.
   * @param convId The conversation ID.
   * @param convType The conversation type.
   */
  onConversationEvent?(
    event?: ChatMultiDeviceEvent,
    convId?: string,
    convType?: ChatConversationType
  ): void;
}

/**
 * The custom event listener.
 */
export interface ChatCustomEventListener {
  onDataReceived(params: any): void;
}

/**
 * The message event listener.
 *
 * This listener listens for message state changes:
 *
 * - If messages are sent successfully, a delivery receipt will be returned to the sender (the delivery receipt function needs to be enabled: {@link ChatOptions.requireDeliveryAck}.
 *
 * - If the recipient reads the received message, a read receipt will be returned to the sender (the read receipt function needs to be enabled: {@link ChatOptions.requireAck})
 *
 * During message delivery, the message ID will be changed from a local uuid to a global unique ID that is generated by the server to uniquely identify a message on all devices using the SDK.
 *
 * Adds a message event listener:
 *
 *   ```typescript
 *   let msgListener = new (class ss implements ChatMessageEventListener {
 *     onMessagesReceived(messages: ChatMessage[]): void {
 *       chatlog.log('ConnectScreen.onMessagesReceived', messages);
 *     }
 *     onCmdMessagesReceived(messages: ChatMessage[]): void {
 *       chatlog.log('ConnectScreen.onCmdMessagesReceived', messages);
 *     }
 *     onMessagesRead(messages: ChatMessage[]): void {
 *       chatlog.log('ConnectScreen.onMessagesRead', messages);
 *     }
 *     onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
 *       chatlog.log('ConnectScreen.onGroupMessageRead', groupMessageAcks);
 *     }
 *     onMessagesDelivered(messages: ChatMessage[]): void {
 *       chatlog.log('ConnectScreen.onMessagesDelivered', messages);
 *     }
 *     onMessagesRecalledInfo(messages: ChatRecalledMessageInfo[]): void {
 *       chatlog.log('ConnectScreen.onMessagesRecalledInfo', messages);
 *     }
 *     onConversationsUpdate(): void {
 *       chatlog.log('ConnectScreen.onConversationsUpdate');
 *     }
 *     onConversationRead(from: string, to?: string): void {
 *       chatlog.log('ConnectScreen.onConversationRead', from, to);
 *     }
 *   })();
 *   ChatClient.getInstance().chatManager.addListener(msgListener);
 *   ```
 *
 * Removes a message event listener:
 *
 *   ```typescript
 *   ChatClient.getInstance().chatManager.delListener(this.msgListener);
 *   ```
 */
export interface ChatMessageEventListener {
  /**
   * Occurs when a message is received.
   *
   * This callback is triggered to notify the user of the message that is received, such as texts or an image, video, voice, location, or file.
   *
   * @param messages The received message(s).
   */
  onMessagesReceived?(messages: Array<ChatMessage>): void;

  /**
   * Occurs when a command message is received.
   *
   * Unlike {@link onMessagesReceived}, this callback only contains a command message body that is usually invisible to users.
   *
   * @param messages The received command message(s).
   */
  onCmdMessagesReceived?(messages: Array<ChatMessage>): void;

  /**
   * Occurs when a read receipt is received for a message.
   *
   * @param messages The read receipt(s).
   */
  onMessagesRead?(messages: Array<ChatMessage>): void;

  /**
   * Occurs when a read receipt is received for a group message.
   *
   * @param groupMessageAcks The read receipt(s) for group message(s).
   */
  onGroupMessageRead?(groupMessageAcks: Array<ChatGroupMessageAck>): void;

  /**
   * Occurs when a delivery receipt is received.
   *
   * @param messages The message(s) for which delivery receipt(s) is sent.
   */
  onMessagesDelivered?(messages: Array<ChatMessage>): void;

  /**
   * Occurs when a received message is recalled.
   *
   * If the recipient is offline when the message is delivered and recalled, the recipient only receives this callback instead of the message.
   *
   * @param params The recalled message information.
   */
  onMessagesRecalledInfo?(info: Array<ChatRecalledMessageInfo>): void;

  /**
   * Occurs when the conversation is updated.
   *
   * This callback is triggered only when a conversation is added or removed.
   */
  onConversationsUpdate?(): void;

  /**
   * Occurs when a conversation read receipt is received.
   *
   * This callback occurs in either of the following cases:
   *
   * - The message is read by the recipient and the conversation read receipt is sent. Upon receiving this event, the SDK sets the `isAcked` property of the message in the conversation to `true` in the local database.
   *
   * - In a multi-device login scenario, when one device sends a conversation receipt, the server will set the number of unread messages to `0`, call the callback method on the other devices, and set the `isRead` property of the message in the conversation to `true` in the local database.
   *
   *  @param from The user who sends the conversation read receipt.
   *  @param to The user who receives the conversation read receipt.
   */
  onConversationRead?(from: string, to?: string): void;

  /**
   * Occurs when a message reaction changes.
   *
   * @param list The reaction change event.
   */
  onMessageReactionDidChange?(list: Array<ChatMessageReactionEvent>): void;

  /**
   * Occurs when a message thread is created.
   *
   * Each member of the group where the message thread belongs can call this method.
   *
   * @param event The message thread creation event.
   */
  onChatMessageThreadCreated?(event: ChatMessageThreadEvent): void;
  /**
   * Occurs when a message thread is updated.
   *
   * This method is triggered when the message thread name is changed or a message in the message thread is updated.
   *
   * Each member of the group where the message thread belongs can call this method.
   *
   * @param event The message thread update event.
   */
  onChatMessageThreadUpdated?(event: ChatMessageThreadEvent): void;
  /**
   * Occurs when a message thread is destroyed.
   *
   * Each member of the group where the message thread belongs can call this method.
   *
   * @param event The message thread destruction event.
   */
  onChatMessageThreadDestroyed?(event: ChatMessageThreadEvent): void;
  /**
   * Occurs when the current user is removed from the message thread by the admin.
   *
   * @param event The message thread user removal event.
   */
  onChatMessageThreadUserRemoved?(event: ChatMessageThreadEvent): void;

  /**
   * Occurs when the content of a text message is modified.
   *
   * @param message The modified message.
   * @param lastModifyOperatorId The user ID of the operator that modified the message last time.
   * @param lastModifyTime The last message modification time. It is a UNIX timestamp in milliseconds.
   */
  onMessageContentChanged?(
    message: ChatMessage,
    lastModifyOperatorId: string,
    lastModifyTime: number
  ): void;

  /**
   * Occurs when the message pinning status changed.
   * @params params -
   * - Param [messageId] The ID of the message with the changed pinning status.
   * - Param [convId] The ID of the conversation that contains the message.
   * - Param [pinOperation] The message pinning or unpinning operation.
   * - Param [pinInfo] The information about message pinning or unpinning, including the operation time and the user ID of the operator. See {@link ChatMessagePinInfo}.
   */
  onMessagePinChanged?(params: {
    messageId: string;
    convId: string;
    pinOperation: number;
    pinInfo: ChatMessagePinInfo;
  }): void;
}

/**
 * The group event listener.
 *
 * For descriptions of callback methods in the listener, user A acts as the current user and user B serves as the peer user.
 */
export interface ChatGroupEventListener {
  /**
   * Occurs when the current user receives a group invitation.
   *
   * For example, after user B sends user A a group invitation, user A receives this callback.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [inviter] The user ID of the inviter.
   * - Param [reason] The reason for invitation.
   */
  onInvitationReceived?(params: {
    groupId: string;
    inviter: string;
    groupName: string;
    reason?: string;
  }): void;

  /**
   * Occurs when a join request from the current user is received by the peer user.
   *
   * For example, after user A sends a join request to user B, user B receives this callback.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [applicant] The user ID of the applicant.
   * - Param [reason] The reason for requesting to join the group.
   */
  onRequestToJoinReceived?(params: {
    groupId: string;
    applicant: string;
    groupName?: string;
    reason?: string;
  }): void;
  /**
   * Occurs when a join request from the current user is accepted by the peer user.
   *
   * For a group of the `PublicJoinNeedApproval` style, after user B accepts a join request from user A, user A receives this callback.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [accepter] The ID of the user that accepts the join request.
   */
  onRequestToJoinAccepted?(params: {
    groupId: string;
    accepter: string;
    groupName?: string;
  }): void;
  /**
   * Occurs when a join request from the current user is declined by the peer user.
   *
   * For example, for a group of the `PublicJoinNeedApproval` style, after user B declines a join request from user A, user A receives this callback.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [decliner] The ID of the user that declines the join request.
   * - Param [applicant] The user ID of the applicant.
   * - Param [reason] The reason for declining the join request.
   */
  onRequestToJoinDeclined?(params: {
    groupId: string;
    decliner: string;
    groupName?: string;
    applicant?: string;
    reason?: string;
  }): void;
  /**
   * Occurs when a group invitation from the current user is accepted by the peer user.
   *
   * For example, after user B accepts a group invitation from user A, user A receives this callback.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   * - Param [invitee] The user ID of the invitee.
   * - Param [reason] The reason for accepting the group invitation.
   */
  onInvitationAccepted?(params: {
    groupId: string;
    invitee: string;
    reason?: string;
  }): void;
  /**
   * Occurs when a group invitation from the current user is declined by the peer user.
   *
   * For example, after user B declines a group invitation from user A, user A receives this callback.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [invitee] The user ID of the invitee.
   * - Param [reason] The reason for accepting the group invitation.
   */
  onInvitationDeclined?(params: {
    groupId: string;
    invitee: string;
    reason?: string;
  }): void;
  /**
   * Occurs when the current user is removed from the group.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   */
  onMemberRemoved?(params: { groupId: string; groupName?: string }): void;
  /**
   * Occurs when a group is destroyed.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [groupName] The group name.
   */
  onDestroyed?(params: { groupId: string; groupName?: string }): void;
  /**
   * Occurs when the group invitation is accepted automatically by the current user.
   *
   * For example, after user B invites user A to join the group, as user A sets {@link ChatOptions.autoAcceptGroupInvitation} to `true`, the invitee joins the group automatically and receives this callback.
   *
   * @params The parameter set.
   * - Param [groupId]			The group ID.
   * - Param [inviter]			The user ID of the inviter.
   * - Param [inviteMessage]    The invitation message.
   */
  onAutoAcceptInvitation?(params: {
    groupId: string;
    inviter: string;
    inviteMessage?: string;
  }): void;
  /**
   * Occurs when one or more members are added to the mute list of the group.
   *
   * A user, when muted, can still see group messages, but cannot send messages in the group. However, a user on the block list can neither see nor send group messages.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [mutes] The user ID(s) of member(s) that are muted.
   * - Param [muteExpire] Reserved parameter. The Unix timestamp when the mute expires. The unit is millisecond.
   */
  onMuteListAdded?(params: {
    groupId: string;
    mutes: Array<string>;
    muteExpire?: number;
  }): void;
  /**
   * Occurs when one or more members are removed from the mute list of the group.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [mutes] The user ID(s) of member(s) that is removed from the mute list.
   */
  onMuteListRemoved?(params: { groupId: string; mutes: Array<string> }): void;
  /**
   * Occurs when a member is set as an admin.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [admin] The user ID of the member that is set as an admin.
   */
  onAdminAdded?(params: { groupId: string; admin: string }): void;
  /**
   * Occurs when the administrative privileges of an admin are removed.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [admin] The user ID of the admin whose administrative privileges are removed.
   */
  onAdminRemoved?(params: { groupId: string; admin: string }): void;
  /**
   * Occurs when the group ownership is transferred.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [newOwner] The user ID of the new group owner.
   * - Param [oldOwner] The user ID of the previous group owner.
   */
  onOwnerChanged?(params: {
    groupId: string;
    newOwner: string;
    oldOwner: string;
  }): void;
  /**
   * Occurs when a user joins a group.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [member] The user ID of the new member.
   *
   * @deprecated Use {@link onMembersJoined} instead.
   */
  onMemberJoined?(params: { groupId: string; member: string }): void;
  /**
   * Occurs when multiple users join a group.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [members] The user IDs of the new members.
   */
  onMembersJoined?(params: { groupId: string; members: Array<string> }): void;
  /**
   * Occurs when a member voluntarily leaves the group.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [member] The user ID of the member leaving the group.
   *
   * @deprecated Use {@link onMembersExited} instead.
   */
  onMemberExited?(params: { groupId: string; member: string }): void;
  /**
   * Occurs when multiple users leave a group.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [members] The user IDs of the members leaving the group.
   */
  onMembersExited?(params: { groupId: string; members: Array<string> }): void;
  /**
   * Occurs when the group announcement is updated.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [announcement] The new announcement.
   */
  onAnnouncementChanged?(params: {
    groupId: string;
    announcement: string;
  }): void;
  /**
   * Occurs when a shared file is added to the group.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [sharedFile] The ID of the new shared file.
   */
  onSharedFileAdded?(params: { groupId: string; sharedFile: string }): void;
  /**
   * Occurs when a shared file is removed from a group.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [fileId] The ID of the shared file that is deleted.
   */
  onSharedFileDeleted?(params: { groupId: string; fileId: string }): void;
  /**
   * Occurs when one or more group members are added to the allow list.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [members] The user IDs of members that are added to the allow list of the group.
   */
  onAllowListAdded?(params: { groupId: string; members: Array<string> }): void;
  /**
   * Occurs when one or more group members are removed from the allow list.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [members] The user IDs of members that are removed from the allow list of the group.
   */
  onAllowListRemoved?(params: {
    groupId: string;
    members: Array<string>;
  }): void;
  /**
   * Occurs when all group members are muted or unmuted.
   *
   * @params The parameter set.
   * - Param [groupId] The group ID.
   * - Param [isAllMuted] Whether all group members are muted.
   *   - `true`: Yes.
   *   - `false`: No.
   */
  onAllGroupMemberMuteStateChanged?(params: {
    groupId: string;
    isAllMuted: boolean;
  }): void;

  /**
   * Occurs when the chat group detail change. All chat group members receive this event.
   *
   * @param group The chat group.
   */
  onDetailChanged?(group: ChatGroup): void;

  /**
   * Occurs when the disabled state of group changes.
   *
   * @param group The chat group.
   */
  onStateChanged?(group: ChatGroup): void;

  /**
   * Occurs when a custom attribute(s) of a group member is/are changed.
   *
   * @params params
   * - groupId: The group ID.
   * - member: The group member.
   * - attributes: The modified custom attributes, in key-value format.
   * - operator: The user ID of the operator.
   */
  onMemberAttributesChanged?(params: {
    groupId: string;
    member: string;
    attributes: any;
    operator: string;
  }): void;
}

/**
 * The contact update listener.
 *
 * It listens for contact changes, including adding or removing a friend and accepting and declining a friend request.
 *
 * For descriptions of callback methods in the listener, user A acts as the current user and user B serves as the peer user.
 */
export interface ChatContactEventListener {
  /**
   * Occurs when a friend request from the current user is accepted by the peer user.
   *
   * For example, after user B accepts a friend request from user A, user A receives this callback.
   *
   * @param userName The user ID of the user that accepts the friend request of the current user.
   */
  onContactAdded?(userName: string): void;
  /**
   * Occurs when a friend request from the current user is declined by the peer user.
   *
   * For example, after user B declines a friend request from user A, user A receives this callback.
   *
   * @param userName The user that declines the friend request from the current user.
   */
  onContactDeleted?(userName: string): void;
  /**
   * Occurs when a friend request is received by the current user.
   *
   * For example, after user A receives a friend request from user B, user A receives this callback.
   *
   * @param userName The user who initiates the friend request.
   * @param reason The invitation message.
   */
  onContactInvited?(userName: string, reason?: string): void;
  /**
   * Occurs when a friend request is accepted by the current user.
   *
   * For example, after user A accepts a friend request from user B, user A receives this callback.
   *
   * @param userName The user who initiates the friend request.
   */
  onFriendRequestAccepted?(userName: string): void;
  /**
   * Occurs when a friend request is declined by the current user.
   *
   * For example, after user A declines a friend request from user B, user A receives this callback.
   *
   * @param userName The user who initiates the friend request.
   */
  onFriendRequestDeclined?(userName: string): void;
}

/**
 * The chat room event listener.
 */
export interface ChatRoomEventListener {
  /**
   * Occurs when the chat room is destroyed. All chat room members receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [roomName] The name of the chat room.
   */
  onDestroyed?(params: { roomId: string; roomName?: string }): void;
  /**
   * Occurs when a member joins the chat room. All chat room members, except the new member, receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [participant] The user ID of the new member.
   */
  onMemberJoined?(params: {
    roomId: string;
    participant: string;
    ext?: string;
  }): void;
  /**
   * Occurs when a member exits the chat room. All chat room members, except the member exiting the chat room, receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [participant] The user ID of the member who leaves the chat room.
   */
  onMemberExited?(params: {
    roomId: string;
    participant: string;
    roomName?: string;
  }): void;
  /**
   *  Occurs when a member is removed from a chat room. The member that is kicked out of the chat room receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [roomName] The name of the chat room.
   * - Param [participant] The user ID of the member that is removed from a chat room.
   * - Param [reason] Reason for removal.
   */
  onMemberRemoved?(params: {
    roomId: string;
    participant?: string;
    roomName?: string;
    reason?: string;
  }): void;
  /**
   * Occurs when the chat room member(s) is/are added to the mute list. The muted members receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [mutes] The user ID(s) of muted member(s).
   * - Param [expireTime] Reserved parameter. The Unix timestamp when the mute duration expires.
   *
   * @deprecated 2024-12-03, Please use {@link onMuteListAddedV2} instead.
   */
  onMuteListAdded?(params: {
    roomId: string;
    mutes: Array<string>;
    expireTime?: string;
  }): void;

  /**
   * Occurs when the chat room member(s) is/are added to the mute list. The muted members receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [mutes] The user list. key is User ID, value is the mute expire time.
   */
  onMuteListAddedV2?(params: {
    roomId: string;
    mutes: Record<string, number>;
  }): void;
  /**
   * Occurs when the chat room member(s) is/are removed from the mute list. The members that are removed from the mute list receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [mutes] The user ID(s) of unmuted member(s).
   */
  onMuteListRemoved?(params: { roomId: string; mutes: Array<string> }): void;
  /**
   * Occurs when a chat room member is set as an admin. The member set as the chat room admin receives this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [admin]  The user ID of the member who is set as an admin.
   */
  onAdminAdded?(params: { roomId: string; admin: string }): void;
  /**
   * Occurs when the chat room member(s) is/are removed from the admin list. The admin removed from the admin list receives this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [admin] The user ID of the admin whose administrative privileges are removed.
   */
  onAdminRemoved?(params: { roomId: string; admin: string }): void;
  /**
   * Occurs when the chat room owner is changed. The chat room owner receives this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [newOwner] The user ID of the new chat room owner.
   * - Param [oldOwner] The user ID of the previous chat room owner.
   */
  onOwnerChanged?(params: {
    roomId: string;
    newOwner: string;
    oldOwner: string;
  }): void;
  /**
   * Occurs when the chat room announcement changes. All chat room members receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [announcement] The new announcement.
   */
  onAnnouncementChanged?(params: {
    roomId: string;
    announcement: string;
  }): void;
  /**
   * Occurs when the chat room member(s) is/are added to the allow list. The members added to the allow list receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [members] The member(s) added to the allow list of the chat room.
   */
  onAllowListAdded?(params: { roomId: string; members: Array<string> }): void;
  /**
   * Occurs when the chat room member(s) is/are removed from the allow list. The members that are removed from the allow list receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [members] The member(s) removed from the allow list of the chat room.
   */
  onAllowListRemoved?(params: { roomId: string; members: Array<string> }): void;
  /**
   * Occurs when all members in the chat room are muted or unmuted. All chat room members receive this event.
   *
   * @params The parameter set.
   * - Param [roomId] The chat room ID.
   * - Param [isAllMuted] Whether all chat room members are muted.
   *   - `true`: Yes.
   *   - `false`: No.
   */
  onAllChatRoomMemberMuteStateChanged?(params: {
    roomId: string;
    isAllMuted: boolean;
  }): void;

  /**
   * Occurs when the chat room specifications changes. All chat room members receive this event.
   *
   * @param room The chat room.
   */
  onSpecificationChanged?(room: ChatRoom): void;

  /**
   * The custom chat room attribute(s) is/are updated. All chat room members receive this event.
   *
   * @params params
   * - roomId: The chat room ID.
   * - attributes: The list of custom chat room attributes (key-value) that are updated.
   * - from: The user ID of the operator.
   */
  onAttributesUpdated?(params: {
    roomId: string;
    attributes: Map<string, string>;
    from: string;
  }): void;

  /**
   * The custom chat room attribute(s) is/are removed. All chat room members receive this event.
   *
   * @params params
   * - roomId: The chat room ID.
   * - removedKeys: The key list of custom chat room attributes that are removed.
   * - from: The user ID of the operator.
   */
  onAttributesRemoved?(params: {
    roomId: string;
    removedKeys: Array<string>;
    from: string;
  }): void;
}

/**
 * The presence state change listener.
 */
export interface ChatPresenceEventListener {
  /**
   * The custom chat room attribute(s) is/are removed. All chat room members receive this event.
   *
   * @param list The new presence state of a subscribed user.
   */
  onPresenceStatusChanged(list: Array<ChatPresence>): void;
}

export interface ChatExceptionEventListener {
  /**
   * When an internal except occurs, this callback notification is triggered.
   *
   * @params -
   * - Param [except] The except object.
   * - Param [from] Where the except occurred.
   * - Param [extra] The extra information.
   */
  onExcept(params: {
    except: ChatException;
    from?: string;
    extra?: Record<string, string>;
  }): void;
}
