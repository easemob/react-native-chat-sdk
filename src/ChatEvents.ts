import type { ChatConversationType } from './common/ChatConversation';
import { ChatError } from './common/ChatError';
import type { ChatGroup, ChatGroupMessageAck } from './common/ChatGroup';
import type { ChatMessage } from './common/ChatMessage';
import type { ChatMessageReactionEvent } from './common/ChatMessageReaction';
import type { ChatMessageThreadEvent } from './common/ChatMessageThread';
import type { ChatPresence } from './common/ChatPresence';
import type { ChatRoom } from './common/ChatRoom';

/**
 * 多设备登录事件类型。
 *
 * 本枚举类以用户 A 同时登录设备 A1 和 设备 A2 为例，描述多设备登录各事件的触发时机。
 */
export enum ChatMultiDeviceEvent {
  /**
   * 用户 A 在设备 A1 上删除了好友，则设备 A2 上会收到该事件。
   */
  CONTACT_REMOVE = 2,
  /**
   * 用户 A 在设备 A1 上同意了好友请求，则设备 A2 上会收到该事件。
   */
  CONTACT_ACCEPT,
  /**
   * 用户 A 在设备 A1 上拒绝了好友请求，则设备 A2 上会收到该事件。
   */
  CONTACT_DECLINE,
  /**
   * 用户 A 在设备 A1 上将其他用户加入了黑名单，则设备 A2 上会收到该事件。
   */
  CONTACT_BAN,
  /**
   * 用户 A 在设备 A1 上将其他用户移出了黑名单，则设备 A2 上会收到该事件。
   */
  CONTACT_ALLOW,

  /**
   * 用户 A 在设备 A1 上创建了群组，则设备 A2 上会收到该事件。
   */
  GROUP_CREATE = 10,
  /**
   * 用户 A 在设备 A1 上销毁了群组，则设备 A2 上会收到该事件。
   */
  GROUP_DESTROY,
  /**
   * 用户 A 在设备 A1 上加入了群组，则设备 A2 会收到该事件。
   */
  GROUP_JOIN,
  /**
   * 用户 A 在设备 A1 上退出群组，则设备 A2 会收到该事件。
   */
  GROUP_LEAVE,
  /**
   * 用户 A 在设备 A1 上申请加入群组，则设备 A2 会收到该事件。
   */
  GROUP_APPLY,
  /**
   * 用户 A 在设备 A1 上收到了入群申请，则设备 A2 会收到该事件。
   */
  GROUP_APPLY_ACCEPT,
  /**
   * 用户 A 在设备 A1 上拒绝了入群申请，设备 A2 上会收到该事件。
   */
  GROUP_APPLY_DECLINE,
  /**
   * 用户 A 在设备 A1 上邀请了其他用户进入群组，则设备 A2 上会收到该事件。
   */
  GROUP_INVITE,
  /**
   * 用户 A 在设备 A1 上同意了其他用户的群组邀请，则设备 A2 上会收到该事件。
   */
  GROUP_INVITE_ACCEPT,
  /**
   * 用户 A 在设备 A1 上拒绝了其他用户的群组邀请，则设备 A2 上会收到该事件。
   */
  GROUP_INVITE_DECLINE,
  /**
   * 用户 A 在设备 A1 上将其他用户踢出群组，则设备 A2 上会收到该事件。
   */
  GROUP_KICK,
  /**
   * 用户 A 在设备 A1 上被加入黑名单，则设备 A2 上会收到该事件。
   */
  GROUP_BAN,
  /**
   * 用户 A 在设备 A1 上将其他用户移出群组，则设备 A2 上会收到该事件。
   */
  GROUP_ALLOW,
  /**
   * 用户 A 在设备 A1 上屏蔽了某个群组的消息，设备 A2 上会收到该事件。
   */
  GROUP_BLOCK,
  /**
   * 用户 A 在设备 A1 上取消屏蔽了某个群组的消息，设备 A2 上会收到该事件。
   */
  GROUP_UNBLOCK,
  /**
   * 用户 A 在设备 A1 上更新了群主，则设备 A2 上会收到该事件。
   */
  GROUP_ASSIGN_OWNER,
  /**
   * 用户 A 在设备 A1 上添加了群组管理员，则设备 A2 上会收到该事件。
   */
  GROUP_ADD_ADMIN,
  /**
   * 用户 A 在设备 A1 上移除了群组管理员，则设备 A2 上会收到该事件。
   */
  GROUP_REMOVE_ADMIN,
  /**
   * 用户 A 在设备 A1 上禁言了群成员，则设备 A2 上会收到该事件。
   */
  GROUP_ADD_MUTE,
  /**
   * 用户 A 在设备 A1 上取消禁言了群成员，则设备 A2 上会收到该事件。
   */
  GROUP_REMOVE_MUTE,
  /**
   * 用户 A 在设备 A1 上将其他成员添加到群组白名单中，则设备 A2 上会收到该事件。
   */
  GROUP_ADD_USER_ALLOW_LIST,
  /**
   * 用户 A 在设备 A1 上将其他成员移除群组白名单，则设备 A2 上会收到该事件。
   */
  GROUP_REMOVE_USER_ALLOW_LIST,
  /**
   * 用户 A 在设备 A1 上将所有其他群组成员添加到群组禁言列表，则设备 A2 上会收到该事件。
   */
  GROUP_ALL_BAN,
  /**
   * 用户 A 在设备 A1 上将所有其他群组成员移除群组禁言列表，则设备 A2 上会收到该事件。
   */
  GROUP_REMOVE_ALL_BAN,
  /**
   * 用户 A 在设备 A1 上修改群组成员属性，则设备 A2 上会收到该事件。
   */
  GROUP_METADATA_CHANGED,

  /**
   * 用户 A 在设备 A1 上创建了子区，则设备 A2 上会收到该事件。
   */
  THREAD_CREATE = 40,
  /**
   * 用户 A 在设备 A1 上移除了子区，则设备 A2 上会收到该事件。
   */
  THREAD_DESTROY,
  /**
   * 用户 A 在设备 A1 上加入了子区，则设备 A2 上会收到该事件。
   */
  THREAD_JOIN,
  /**
   * 用户 A 在设备 A1 上离开了子区，则设备 A2 上会收到该事件。
   */
  THREAD_LEAVE,
  /**
   * 用户 A 在设备 A1 上更新了子区信息，则设备 A2 上会收到该事件。
   */
  THREAD_UPDATE,
  /**
   * 用户 A 在设备 A1 上将其他用户踢出子区，则设备 A2 上会收到该事件。
   */
  THREAD_KICK,
  /**
   * 用户 A 在设备 A1 置顶会话，则设备 A2 上会收到该事件。
   */
  CONVERSATION_PINNED = 60,
  /**
   * 用户 A 在设备 A1 取消置顶会话，则设备 A2 上会收到该事件。
   */
  CONVERSATION_UNPINNED = 61,
  /**
   * 用户 A 在设备 A1 删除会话，则设备 A2 上会收到该事件。
   */
  CONVERSATION_DELETED = 62,
}

/**
 * 将多设备事件从整型转换为枚举类型。
 *
 * @param params 整型的多设备事件。
 * @returns 枚举类型的多设备事件。
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

    default:
      throw new ChatError({
        code: 1,
        description: `This type is not supported. ` + params,
      });
  }
}

/**
 * 网络连接状态监听器。
 *
 * 在不稳定的网络环境断网时，SDK 可以接收到已断开连接的回调。
 *
 * SDK 会自动尝试重连，不需要你手动操作。
 *
 * 以下为两种连接状态回调：
 * - `onConnected`: 当网络连接成功时提示已连接。
 * - `onDisconnected`: 当网络连接断开时提示已断开连接。
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
 *
 *  移除连接事件监听器：
 *
 *  ```typescript
 *  ChatClient.getInstance().removeConnectionListener(listener);
 *  ```
 */
export interface ChatConnectEventListener {
  /**
   * 成功连接到 chat 服务器时触发的回调。
   */
  onConnected?(): void;

  /**
   * 和 chat 服务器断开连接时触发的回调。
   *
   * 断开连接时底层不一定会登出。
   *
   * @param errorCode 错误码，详见 {@link ChatError}。
   */
  onDisconnected?(): void;

  /**
   * Agora token 即将过期时触发。
   */
  onTokenWillExpire?(): void;

  /**
   * Agora token 已过期时触发。
   */
  onTokenDidExpire?(): void;

  /**
   * 应用程序的日活跃用户数量（DAU）或月活跃用户数量（MAU）达到上限时回调。
   *
   * 服务器主动断开连接。
   */
  onAppActiveNumberReachLimit?(): void;

  /**
   * 其他设备登录通知。
   *
   * 服务器主动断开连接。
   */
  onUserDidLoginFromOtherDevice?(deviceName?: string): void;

  /**
   * 用户被移除通知。
   *
   * 服务器主动断开连接。
   */
  onUserDidRemoveFromServer?(): void;

  /**
   * 被服务器禁止连接通知。
   *
   * 服务器主动断开连接。
   */
  onUserDidForbidByServer?(): void;

  /**
   * 用户密码变更通知。
   *
   * 服务器主动断开连接。
   */
  onUserDidChangePassword?(): void;

  /**
   * 登录设备数量超限通知。
   *
   * 服务器主动断开连接。
   */
  onUserDidLoginTooManyDevice?(): void;

  /**
   * 被其他设备踢掉通知。
   *
   * 服务器主动断开连接。
   */
  onUserKickedByOtherDevice?(): void;

  /**
   * 鉴权失败通知。 典型触发通知场景：token 过期、token 验证失败。
   *
   * 服务器主动断开连接。
   */
  onUserAuthenticationFailed?(): void;
}

/**
 * 多设备事件监听器。
 *
 * 该监听器监听联系人事件、群组事件、子区事件和会话事件。
 */
export interface ChatMultiDeviceEventListener {
  /**
   * 联系人事件监听回调。
   *
   * @param event 事件类型。
   * @param target 用户 ID。
   * @param ext 用户相关的扩展信息。
   */
  onContactEvent?(
    event?: ChatMultiDeviceEvent,
    target?: string,
    ext?: string
  ): void;

  /**
   * 群组事件监听回调。
   *
   * @param event 事件类型。
   * @param target 群组 ID。
   * @param usernames 用户 ID 数组。
   */
  onGroupEvent?(
    event?: ChatMultiDeviceEvent,
    target?: string,
    usernames?: Array<string>
  ): void;

  /**
   * 子区事件监听回调。
   *
   * @param event 事件类型。
   * @param target 目标，即群组 ID。
   * @param usernames 用户 ID 数组。
   */
  onThreadEvent?(
    event?: ChatMultiDeviceEvent,
    target?: string,
    usernames?: Array<string>
  ): void;

  /**
   * 会话删除漫游消息后，其他设备收到该通知。
   *
   * @param convId 会话 ID。
   * @param deviceId 设备 ID。
   */
  onMessageRemoved?(convId?: string, deviceId?: string): void;

  /**
   * 会话操作发生后，其他设备收到该通知。
   *
   * @param event 事件类型。
   * @param convId 会话 ID。
   * @param convType 会话类型。
   */
  onConversationEvent?(
    event?: ChatMultiDeviceEvent,
    convId?: string,
    convType?: ChatConversationType
  ): void;
}

/**
 * 自定义事件监听器。
 */
export interface ChatCustomEventListener {
  onDataReceived(params: any): void;
}

/**
 * 消息事件监听器。
 *
 * 该监听器用于监听消息变更状态：
 *
 * - 消息成功发送到对方后，发送方会收到送达回执（需开启送达回执功能，详见 {@link ChatOptions#requireDeliveryAck(boolean)}）。
 *
 * - 对方阅读了这条消息，发送方会收到已读回执（需开启已读回执功能，详见 {@link ChatOptions#requireAck(boolean)}）。
 *
 * 发送消息过程中，消息 ID 会从最初本地生成的 uuid 变更为服务器端生成的全局唯一 ID，该 ID 在使用 SDK 的所有设备上均唯一。
 *
 *     添加消息事件监听器：
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
 *     onMessagesRecalled(messages: ChatMessage[]): void {
 *       chatlog.log('ConnectScreen.onMessagesRecalled', messages);
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
 * 移除消息事件监听器：
 *
 *   ```typescript
 *   ChatClient.getInstance().chatManager.delListener(this.msgListener);
 *   ```
 */
export interface ChatMessageEventListener {
  /**
   * 收到消息回调。
   *
   * 在收到文本、图片、视频、语音、地理位置和文件等消息时，通过此回调通知用户。
   *
   * @param messages 收到的消息。
   */
  onMessagesReceived?(messages: Array<ChatMessage>): void;

  /**
   * 收到命令消息回调。
   *
   * 与 {@link onMessagesReceived} 不同, 这个回调只包含命令的消息，命令消息通常不对用户展示。
   *
   * @param messages 收到的命令消息。
   */
  onCmdMessagesReceived?(messages: Array<ChatMessage>): void;

  /**
   * 收到单聊消息已读回执的回调。
   *
   * @param messages 消息的已读回执。
   */
  onMessagesRead?(messages: Array<ChatMessage>): void;

  /**
   * 收到群组消息的已读回执的回调。
   *
   * @param groupMessageAcks 群组消息已读回执。
   */
  onGroupMessageRead?(groupMessageAcks: Array<ChatGroupMessageAck>): void;

  /**
   * 收到消息已送达回执的回调。
   *
   * @param messages 送达回执对应的消息。
   */
  onMessagesDelivered?(messages: Array<ChatMessage>): void;

  /**
   * 已收到的消息被撤回的回调。
   *
   * @param messages 撤回的消息。
   */
  onMessagesRecalled?(messages: Array<ChatMessage>): void;

  /**
   * 会话更新事件回调。
   */
  onConversationsUpdate?(): void;

  /**
   * 收到会话已读回执的回调。
   *
   * 回调此方法的场景：
   * （1）消息被接收方阅读，即接收方发送了会话已读回执。
   * SDK 在接收到此事件时，会将本地数据库中该会话中消息的 `isAcked` 属性置为 `true`。
   * （2）多端多设备登录场景下，一端发送会话已读回执，服务器端会将会话的未读消息数置为 0，
   * 同时其他端会回调此方法，并将本地数据库中该会话中消息的 `isRead` 属性置为 `true`。
   *
   * @param from 发送已读回执的用户 ID。
   * @param to 收到已读回执的用户 ID。
   */
  onConversationRead?(from: string, to?: string): void;

  /**
   * 消息表情回复（Reaction）变化监听器。
   *
   * @param list Reaction 变化事件。
   */
  onMessageReactionDidChange?(list: Array<ChatMessageReactionEvent>): void;

  /**
   * 子区创建回调。
   *
   * 子区所属群组的所有成员均可调用该方法。
   *
   * @param event 子区创建事件。
   */
  onChatMessageThreadCreated?(event: ChatMessageThreadEvent): void;
  /**
   * 子区更新回调。
   *
   * 子区所属群组的所有成员均可调用该方法。
   *
   * @param event 子区更新事件。
   *
   * @param event The message thread update event.
   */
  onChatMessageThreadUpdated?(event: ChatMessageThreadEvent): void;
  /**
   * 子区移除回调。
   *
   * @param event 子区移除事件。
   *
   * @param event The message thread destruction event.
   */
  onChatMessageThreadDestroyed?(event: ChatMessageThreadEvent): void;
  /**
   * 管理员移除子区用户的回调。
   *
   * @param event 子区用户移除事件。
   */
  onChatMessageThreadUserRemoved?(event: ChatMessageThreadEvent): void;

  /**
   * 文本消息内容更改，其它设备收到该通知。
   *
   * @param message 更改后的消息.
   * @param lastModifyOperatorId 修改消息的人的 ID。
   * @param lastModifyTime 修改消息的时间戳。
   */
  onMessageContentChanged?(
    message: ChatMessage,
    lastModifyOperatorId: string,
    lastModifyTime: number
  ): void;
}

/**
 * 群组事件监听器。
 *
 * 该监听器的回调方法描述的举例中，用户 A 为当前用户，用户 B 为对端用户。
 */
export interface ChatGroupEventListener {
  /**
   * 当前用户收到入群邀请的回调。
   *
   * 例如，用户 B 邀请用户 A 入群，则用户 A 会收到该回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [groupName] 群组名称。
   * - Param [inviter] 邀请人的用户 ID。
   * - Param [reason] 邀请理由。
   */
  onInvitationReceived?(params: {
    groupId: string;
    inviter: string;
    groupName: string;
    reason?: string;
  }): void;

  /**
   * 对端用户接收群组申请的回调。
   *
   * 该回调是由对端用户接收当前用户发送的群组申请触发的。如，用户 A 向用户 B 发送群组申请，用户 B 收到该回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [groupName] 群组名称。
   * - Param [applicant] 申请人的用户 ID。
   * - Param [reason] 申请加入原因。
   */
  onRequestToJoinReceived?(params: {
    groupId: string;
    applicant: string;
    groupName?: string;
    reason?: string;
  }): void;
  /**
   * 对端用户接受当前用户发送的群组申请的回调。
   *
   * 若群组类型为 `PublicJoinNeedApproval`，用户 B 接受用户 A 的群组申请后，用户 A 会收到该回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [groupName] 群组名称。
   * - Param [accepter] 接受人的用户 ID。
   */
  onRequestToJoinAccepted?(params: {
    groupId: string;
    accepter: string;
    groupName?: string;
  }): void;
  /**
   * 对端用户拒绝群组申请的回调。
   *
   * 该回调是由对端用户拒绝当前用户发送的群组申请触发的。例如，用户 B 拒绝用户 A 的群组申请后，用户 A 会收到该回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [groupName] 群组名称。
   * - Param [decliner] 拒绝人的用户 ID。
   * - Param [applicant] 申请人的用户 ID。
   * - Param [reason] 拒绝理由。
   */
  onRequestToJoinDeclined?(params: {
    groupId: string;
    decliner: string;
    groupName?: string;
    applicant?: string;
    reason?: string;
  }): void;
  /**
   * 当前用户收到对端用户同意入群邀请触发的回调。
   *
   * 例如，用户 B 同意了用户 A 的群组邀请，用户 A 会收到该回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [groupName] 群组名称。
   * - Param [invitee] 受邀人的用户 ID。
   * - Param [reason] 接受理由。
   */
  onInvitationAccepted?(params: {
    groupId: string;
    invitee: string;
    reason?: string;
  }): void;
  /**
   * 当前用户收到群组邀请被拒绝的回调。
   *
   * 该回调是由当前用户收到对端用户拒绝入群邀请触发的。例如，用户 B 拒绝了用户 A 的群组邀请，用户 A 会收到该回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [invitee] 受邀人的用户 ID。
   * - Param [reason] 接受理由。
   */
  onInvitationDeclined?(params: {
    groupId: string;
    invitee: string;
    reason?: string;
  }): void;
  /**
   * 当前用户被移出群组时的回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [groupName] 群组名称。
   */
  onMemberRemoved?(params: { groupId: string; groupName?: string }): void;
  /**
   * 当前用户收到群组被解散的回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [groupName] 群组名称。
   */
  onDestroyed?(params: { groupId: string; groupName?: string }): void;
  /**
   * 当前用户自动同意入群邀请的回调。
   *
   * 例如，用户 B 邀请用户 A 入群，由于用户 A 设置了群组自动接受邀请 （{@link ChatOptions.autoAcceptGroupInvitation} 设置为 `true`），所以自动入群，收到该回调。
   *
   * @params 参数组。
   * - Param [groupId]	群组 ID。
   * - Param [inviter]	邀请人的用户 ID。
   * - Param [inviteMessage]	邀请信息。
   */
  onAutoAcceptInvitation?(params: {
    groupId: string;
    inviter: string;
    inviteMessage?: string;
  }): void;
  /**
   * 有成员被禁言回调。
   *
   * 用户禁言后，将无法在群中发送消息，但可查看群组中的消息，而黑名单中的用户无法查看和发送群组消息。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [mutes] 被禁言成员的用户 ID。
   * - Param [muteExpire] 预留参数。禁言时长。
   */
  onMuteListAdded?(params: {
    groupId: string;
    mutes: Array<string>;
    muteExpire?: number;
  }): void;
  /**
   * 有成员被解除禁言的回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [mutes] 用户被解除禁言的列表
   */
  onMuteListRemoved?(params: { groupId: string; mutes: Array<string> }): void;
  /**
   * 成员设置为管理员的回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [admin] 设置为管理员的成员的用户 ID。
   */
  onAdminAdded?(params: { groupId: string; admin: string }): void;
  /**
   * 取消成员的管理员权限的回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [admin] 被移除管理员的成员用户 ID。
   */
  onAdminRemoved?(params: { groupId: string; admin: string }): void;
  /**
   * 转移群主权限的回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [newOwner] 新群主的用户 ID。
   * - Param [oldOwner] 原群主的用户 ID。
   */
  onOwnerChanged?(params: {
    groupId: string;
    newOwner: string;
    oldOwner: string;
  }): void;
  /**
   * 新成员加入群组的回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [member] 新成员的用户 ID。
   */
  onMemberJoined?(params: { groupId: string; member: string }): void;
  /**
   * 群组成员主动退出回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [member] 退群的成员的用户 ID。
   */
  onMemberExited?(params: { groupId: string; member: string }): void;
  /**
   * 群公告更新回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [announcement] 新公告。
   */
  onAnnouncementChanged?(params: {
    groupId: string;
    announcement: string;
  }): void;
  /**
   * 群组添加共享文件回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [sharedFile] 添加的共享文件的 ID。
   */
  onSharedFileAdded?(params: { groupId: string; sharedFile: string }): void;
  /**
   * 群组删除共享文件回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [fileId] 被删除的群共享文件 ID。
   */
  onSharedFileDeleted?(params: { groupId: string; fileId: string }): void;
  /**
   * 成员加入群组白名单回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [members] 被加入白名单的成员的用户 ID。
   */
  onAllowListAdded?(params: { groupId: string; members: Array<string> }): void;
  /**
   * 成员移出群组白名单回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [members] 移出白名单的成员的用户 ID。
   */
  onAllowListRemoved?(params: {
    groupId: string;
    members: Array<string>;
  }): void;
  /**
   * 全员禁言状态变化回调。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [isAllMuted] 是否全员禁言。
   *   - `true`：是；
   *   - `false`：否。
   */
  onAllGroupMemberMuteStateChanged?(params: {
    groupId: string;
    isAllMuted: boolean;
  }): void;

  /**
   * 群组详情变更回调。群组所有成员会收到该事件。
   *
   * @param group 群组对象。
   */
  onDetailChanged?(group: ChatGroup): void;

  /**
   * 群组状态变更回调。群组所有成员会收到该事件。
   *
   * @param group 群组对象。
   */
  onStateChanged?(group: ChatGroup): void;

  /**
   * 群组成员属性变化通知。
   *
   * @param params -
   * - groupId: 群组ID。
   * - member: 群组成员ID。
   * - attributes: 群组成员属性，key-value格式。
   * - operator: 修改属性的人。
   */
  onMemberAttributesChanged?(params: {
    groupId: string;
    member: string;
    attributes: any;
    operator: string;
  }): void;
}

/**
 * 联系人更新监听器。
 *
 * 监听联系人变化，包括添加好友，移除好友，同意好友请求和拒绝好友请求等。
 *
 * 该监听器的回调方法描述的举例中，用户 A 为当前用户，用户 B 为对端用户。
 */
export interface ChatContactEventListener {
  /**
   * 好友请求被接受的回调。
   *
   * 例如，用户 A 向 用户 B 发送好友请求，用户 B 同意后，用户 A 会收到这该回调。
   *
   * @param userName 接受当前用户的好友请求的用户。
   */
  onContactAdded?(userName: string): void;
  /**
   * 好友请求被拒绝的回调。
   *
   * 例如，用户 A 向 用户 B 发送好友请求，用户 B 拒绝后，用户 A 会收到该回调。
   *
   * @param userName 拒绝当前用户的好友请求的用户。
   */
  onContactDeleted?(userName: string): void;
  /**
   * 当前用户收到好友请求的回调。
   *
   * 例如，用户 B 向 用户 A 发送好友请求，用户 A 接收后会收到该回调。
   *
   * @param userName 发起好友请求的用户 ID。
   * @param reason 邀请时的信息。
   */
  onContactInvited?(userName: string, reason?: string): void;
  /**
   * 当前用户同意好友请求的回调。
   *
   * 例如，用户 B 向 用户 A 发送好友请求，用户 A 同意后会收到该回调。
   *
   * @param userName 发起好友请求的用户 ID。
   */
  onFriendRequestAccepted?(userName: string): void;
  /**
   * 拒绝好友请求的回调。
   *
   * 例如，用户 B 向 用户 A 发送好友请求，用户 A 拒绝后会收到该回调。
   *
   * @param userName 发起好友请求的用户 ID。
   */
  onFriendRequestDeclined?(userName: string): void;
}

/**
 * 聊天室事件回调。
 */
export interface ChatRoomEventListener {
  /**
   * 聊天室解散的回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [roomName] 聊天室名称。
   */
  onDestroyed?(params: { roomId: string; roomName?: string }): void;
  /**
   * 聊天室加入新成员回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [participant] 新成员用户 ID。
   */
  onMemberJoined?(params: { roomId: string; participant: string }): void;
  /**
   * 聊天室成员主动退出回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [participant] 离开聊天室的用户 ID。
   */
  onMemberExited?(params: {
    roomId: string;
    participant: string;
    roomName?: string;
  }): void;
  /**
   * 聊天室成员被移除回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [roomName] 聊天室名称。
   * - Param [participant] 被移出聊天室的用户 ID。
   * - Param [reason] 移除的原因。
   */
  onMemberRemoved?(params: {
    roomId: string;
    participant?: string;
    roomName?: string;
    reason?: string;
  }): void;
  /**
   * 有成员被禁言回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [mutes] 被禁言成员的用户 ID。
   * - Param [expireTime] 预留参数，禁言过期时间戳。
   */
  onMuteListAdded?(params: {
    roomId: string;
    mutes: Array<string>;
    expireTime?: string;
  }): void;
  /**
   * 有成员从禁言列表中移除回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [mutes] 被移出禁言列表的用户 ID 列表。
   */
  onMuteListRemoved?(params: { roomId: string; mutes: Array<string> }): void;
  /**
   *有成员设置为聊天室管理员的回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [admin]  设置为管理员的成员的用户 ID。
   */
  onAdminAdded?(params: { roomId: string; admin: string }): void;
  /**
   * 移除聊天室管理员权限的回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [admin] 被移出管理员权限的成员的用户 ID。
   */
  onAdminRemoved?(params: { roomId: string; admin: string }): void;
  /**
   * 转移聊天室的所有权的回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [newOwner] 新聊天室所有者的用户 ID。
   * - Param [oldOwner] 原来的聊天室所有者的用户 ID。
   */
  onOwnerChanged?(params: {
    roomId: string;
    newOwner: string;
    oldOwner: string;
  }): void;
  /**
   * 聊天室公告更新回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [announcement] 更新后的聊天室公告。
   */
  onAnnouncementChanged?(params: {
    roomId: string;
    announcement: string;
  }): void;
  /**
   * 有成员被加入聊天室白名单的回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [members] 被加入白名单的聊天室成员的用户 ID。
   */
  onAllowListAdded?(params: { roomId: string; members: Array<string> }): void;
  /**
   * 有成员被移出聊天室白名单的回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [members] 被移出聊天室白名单列表的成员的用户 ID。
   */
  onAllowListRemoved?(params: { roomId: string; members: Array<string> }): void;
  /**
   * 聊天室全员禁言状态变化回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [isAllMuted] 是否所有聊天室成员被禁言。
   *   - `true`：是；
   *   - `false`：否。
   */
  onAllChatRoomMemberMuteStateChanged?(params: {
    roomId: string;
    isAllMuted: boolean;
  }): void;

  /**
   * 聊天室详情变更回调。聊天室所有成员会收到该事件。
   *
   * @param room 聊天室对象。
   */
  onSpecificationChanged?(room: ChatRoom): void;

  /**
   * 聊天室自定义属性（key-value）更新回调。聊天室所有成员会收到该事件。
   *
   * @params 参数组。
   * - roomId 聊天室 ID。
   * - attributes 更新的聊天室自定义属性列表。
   * - from 操作者的用户 ID。
   */
  onAttributesUpdated?(params: {
    roomId: string;
    attributes: Map<string, string>;
    from: string;
  }): void;

  /**
   * 聊天室自定义属性（key-value）移除回调。聊天室所有成员会收到该事件。
   * @params 参数组。
   * - roomId：聊天室 ID。
   * - removedKeys: 移除的聊天室自定义属性的属性 key 列表。
   * - from: 操作者的用户 ID。
   */
  onAttributesRemoved?(params: {
    roomId: string;
    removedKeys: Array<string>;
    from: string;
  }): void;
}

/**
 * 在线状态订阅监听器接口。
 */
export interface ChatPresenceEventListener {
  /**
   * 收到被订阅用户的在线状态发生变化。
   *
   * @param list 被订阅用户更新后的在线状态。
   */
  onPresenceStatusChanged(list: Array<ChatPresence>): void;
}
