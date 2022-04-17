export enum ChatContactGroupEvent {
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
): ChatContactGroupEvent {
  switch (params) {
    case 2:
      return ChatContactGroupEvent.CONTACT_REMOVE;
    case 3:
      return ChatContactGroupEvent.CONTACT_ACCEPT;
    case 4:
      return ChatContactGroupEvent.CONTACT_DECLINE;
    case 5:
      return ChatContactGroupEvent.CONTACT_BAN;
    case 6:
      return ChatContactGroupEvent.CONTACT_ALLOW;
    case 10:
      return ChatContactGroupEvent.GROUP_CREATE;
    case 11:
      return ChatContactGroupEvent.GROUP_DESTROY;
    case 12:
      return ChatContactGroupEvent.GROUP_JOIN;
    case 13:
      return ChatContactGroupEvent.GROUP_LEAVE;
    case 14:
      return ChatContactGroupEvent.GROUP_APPLY;
    case 15:
      return ChatContactGroupEvent.GROUP_APPLY_ACCEPT;
    case 16:
      return ChatContactGroupEvent.GROUP_APPLY_DECLINE;
    case 17:
      return ChatContactGroupEvent.GROUP_INVITE;
    case 18:
      return ChatContactGroupEvent.GROUP_INVITE_ACCEPT;
    case 19:
      return ChatContactGroupEvent.GROUP_INVITE_DECLINE;
    case 20:
      return ChatContactGroupEvent.GROUP_KICK;
    case 21:
      return ChatContactGroupEvent.GROUP_BAN;
    case 22:
      return ChatContactGroupEvent.GROUP_ALLOW;
    case 23:
      return ChatContactGroupEvent.GROUP_BLOCK;
    case 24:
      return ChatContactGroupEvent.GROUP_UNBLOCK;
    case 25:
      return ChatContactGroupEvent.GROUP_ASSIGN_OWNER;
    case 26:
      return ChatContactGroupEvent.GROUP_ADD_ADMIN;
    case 27:
      return ChatContactGroupEvent.GROUP_REMOVE_ADMIN;
    case 28:
      return ChatContactGroupEvent.GROUP_ADD_MUTE;
    case 29:
      return ChatContactGroupEvent.GROUP_REMOVE_MUTE;
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
 *  let listener = new (class s implements ChatConnectionListener {
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
export interface ChatConnectionListener {
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

export interface ChatMultiDeviceListener {
  onContactEvent(
    event?: ChatContactGroupEvent,
    target?: string,
    ext?: string
  ): void;

  onGroupEvent(
    event?: ChatContactGroupEvent,
    target?: string,
    usernames?: Array<string>
  ): void;
}

export interface ChatCustomListener {
  onDataReceived(map: Map<string, any>): void;
}

export interface ChatContactEventListener {
  /// 被[userName]添加为好友
  onContactAdded(userName?: string): void;

  /// 被[userName]从好友中删除
  onContactDeleted(userName?: string): void;

  /// 收到[userName]的好友申请，原因是[reason]
  onContactInvited(userName?: string, reason?: string): void;

  /// 发出的好友申请被[userName]同意
  onFriendRequestAccepted(userName?: string): void;

  /// 发出的好友申请被[userName]拒绝
  onFriendRequestDeclined(userName?: string): void;
}

export interface ChatConversationListener {
  onConversationUpdate(): void;
}

export interface ChatRoomEventListener {
  /// id是[roomId],名称是[roomName]的聊天室被销毁
  onChatRoomDestroyed(roomId: string, roomName?: string): void;

  /// 有用户[participant]加入id是[roomId]的聊天室
  onMemberJoinedFromChatRoom(roomId: string, participant: string): void;

  /// 有用户[participant]离开id是[roomId]，名字是[roomName]的聊天室
  onMemberExitedFromChatRoom(
    roomId: string,
    roomName?: string,
    participant?: string
  ): void;

  /// 用户[participant]被id是[roomId],名称[roomName]的聊天室删除
  onRemovedFromChatRoom(
    roomId: string,
    roomName?: string,
    participant?: string
  ): void;

  /// @nodoc id是[roomId]的聊天室禁言列表[mutes]有增加
  onMuteListAddedFromChatRoom(
    roomId: string,
    mutes: Array<string>,
    expireTime?: string
  ): void;

  /// @nodoc id是[roomId]的聊天室禁言列表[mutes]有减少
  onMuteListRemovedFromChatRoom(roomId: string, mutes: Array<string>): void;

  /// @nodoc id是[roomId]的聊天室增加id是[admin]管理员
  onAdminAddedFromChatRoom(roomId: string, admin: string): void;

  /// @nodoc id是[roomId]的聊天室移除id是[admin]管理员
  onAdminRemovedFromChatRoom(roomId: string, admin: string): void;

  /// @nodoc id是[roomId]的聊天室所有者由[oldOwner]变更为[newOwner]
  onOwnerChangedFromChatRoom(
    roomId: string,
    newOwner: string,
    oldOwner: string
  ): void;

  /// @nodoc id是[roomId]的聊天室公告变为[announcement]
  onAnnouncementChangedFromChatRoom(roomId: string, announcement: string): void;

  /// 有用户被添加到聊天室白名单
  onWhiteListAddedFromChatRoom(roomId: string, members: Array<string>): void;

  /// 有用户从聊天室白名单被移除
  onWhiteListRemovedFromChatRoom(roomId: string, members: Array<string>): void;

  /// 聊天室禁言状态发生变化
  onAllChatRoomMemberMuteStateChanged(
    roomId: string,
    isAllMuted: boolean
  ): void;
}
