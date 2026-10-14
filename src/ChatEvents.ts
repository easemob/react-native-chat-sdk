import { ExceptionHandler } from './__internal__/ErrorHandler';
import type { ChatContact } from './common/ChatContact';
import type { ChatConversationType } from './common/ChatConversation';
import { ChatException } from './common/ChatError';
import type { ChatDataSyncType } from './common/ChatOptions';
import type { ChatGroup } from './common/ChatGroup';
import type {
  ChatMessage,
  ChatMessagePinInfo,
  ChatRecalledMessageInfo,
} from './common/ChatMessage';
import type { ChatMessageReactionEvent } from './common/ChatMessageReaction';
import type { ChatMessageReadReceipt } from './common/ChatMessageReadReceipt';
import type { ChatMessageThreadEvent } from './common/ChatMessageThread';
import type { ChatPresence } from './common/ChatPresence';
import type { ChatRoom } from './common/ChatRoom';
import type { ChatUserInfo } from './common/ChatUserInfo';

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
   * 用户 A 在设备 A1 上更新群组信息时，设备 A2 上会触发该事件。
   *
   * 仅 iOS SDK 会上报该事件（原生值为 34，即 `EMMultiDevicesEventGroupUpdate`）；Android SDK
   * 使用原生值 52 上报群组元数据变更。
   */
  GROUP_UPDATE,
  /**
   * 用户 A 在设备 A1 上创建子区时，设备 A2 上会触发该事件。
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
   * 用户 A 在设备 A1 上修改群组成员属性，则设备 A2 上会收到该事件。
   */
  GROUP_METADATA_CHANGED = 52,
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
  /**
   * 用户 A 在设备 A1 更新会话标记，则设备 A2 上会收到该事件。
   */
  CONVERSATION_UPDATE_MARK = 63,
  /**
   * 用户 A 在设备 A1 更新会话免打扰状态，则设备 A2 上会收到该事件。
   *
   * 系统内部会更新会话的推送提醒方式。如果需要则需要手动更新会话列表。
   */
  CONVERSATION_MUTE_CHANGED = 64,
  /**
   * 用户 A 在设备 A1 上清除某个会话的未读消息数时，设备 A2 上会触发该事件。
   *
   * 详见 {@link ChatManager.clearConversationUnreadMessageCount}。
   */
  CONVERSATION_UNREAD_MESSAGE_COUNT_CLEARED = 65,
  /**
   * 用户 A 在设备 A1 上清除所有会话的未读消息数时，设备 A2 上会触发该事件。
   *
   * 详见 {@link ChatManager.clearAllConversationUnreadMessageCount}。
   */
  ALL_CONVERSATION_UNREAD_MESSAGE_COUNT_CLEARED = 66,
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
    case 34:
      return ChatMultiDeviceEvent.GROUP_UPDATE;

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
    case 65:
      return ChatMultiDeviceEvent.CONVERSATION_UNREAD_MESSAGE_COUNT_CLEARED;
    case 66:
      return ChatMultiDeviceEvent.ALL_CONVERSATION_UNREAD_MESSAGE_COUNT_CLEARED;

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
 * {@link ChatConnectEventListener.onDisconnected} 携带的断开连接原因码。
 *
 * 这些数值与底层原生 SDK 的 `EMError` 错误码一致。SDK 会原样传递这些错误码且不进行过滤，
 * 因此仍可能收到此处未列出的错误码（包括未来原生 SDK 版本新增的错误码）；该枚举仅用于提高可读性和便于比较。
 *
 * 断开连接原因分为两类：
 * - 登出原因：本地登录状态不再有效，用户必须重新登录。
 * - 连接原因：用户仍保持登录状态，但连接已断开，SDK 会自动重连。
 *
 * 除非原生 SDK 文档另有说明，否则应将收到的未列出错误码视为连接原因。
 *
 * 注意：token 过期不会触发 `onDisconnected`，而是通过 {@link ChatConnectEventListener.onTokenDidExpire} 上报。
 */
export enum ChatDisconnectErrorCode {
  // 登出原因：本地登录状态无效，用户必须重新登录。

  /**
   * 应用的日活跃用户数（DAU）或月活跃用户数（MAU）已达到上限。
   */
  APP_ACTIVE_NUMBER_REACH_LIMIT = 8,

  /**
   * token 与登录信息不匹配。
   */
  INVALID_TOKEN = 104,

  /**
   * 用于建立连接的参数无效。
   */
  INVALID_PARAM = 110,

  /**
   * 用户鉴权失败。
   *
   * 仅使用 token 登录时，鉴权失败通常由登录调用上报；如果 SDK 在重连期间刷新 token 失败，仍可能出现此错误码。
   */
  USER_AUTHENTICATION_FAILED = 202,

  /**
   * 用户不存在。
   */
  USER_NOT_FOUND = 204,

  /**
   * 用户已从其他设备登录。
   *
   * 回调的 `info` 参数携带该设备的名称和扩展信息。
   */
  USER_LOGIN_FROM_OTHER_DEVICE = 206,

  /**
   * 用户已从服务器移除。
   */
  USER_REMOVED_FROM_SERVER = 207,

  /**
   * 用户已绑定其他设备，无法在当前设备上保持登录状态。
   */
  USER_BIND_ANOTHER_DEVICE = 213,

  /**
   * 用户登录的设备数量过多。
   */
  USER_LOGIN_TOO_MANY_DEVICES = 214,

  /**
   * 用户已修改密码。
   */
  USER_KICKED_BY_CHANGE_PASSWORD = 216,

  /**
   * 用户被其他设备踢下线。
   */
  USER_KICKED_BY_OTHER_DEVICE = 217,

  /**
   * 本次登录设备与上次登录设备不同，用户需要重新登录。
   *
   * 仅当服务器启用“不将其他设备踢下线”选项时，该原因才会生效。
   */
  USER_DEVICE_CHANGED = 220,

  /**
   * 无法获取可用的服务器地址。
   */
  SERVER_GET_DNSLIST_FAILED = 304,

  /**
   * 应用被服务器禁用。
   */
  SERVER_SERVICE_RESTRICTED = 305,

  // 连接原因：用户保持登录状态，SDK 会自动重连。

  /**
   * 发生网络错误。
   *
   * 该错误码仅由 Android 上报；在 iOS 上，网络断开时不会上报错误码。
   */
  NETWORK_ERROR = 2,

  /**
   * 应用的用户数量或服务配额超过限制。
   */
  EXCEED_SERVICE_LIMIT = 4,

  /**
   * 无法连接服务器，例如连接超时、DNS 解析失败或连接被拒绝。
   *
   * 这是网络不稳定时最常见的原因。
   */
  SERVER_NOT_REACHABLE = 300,

  /**
   * 发生未知服务器错误，例如 IO 错误或连接流意外关闭。
   */
  SERVER_UNKNOWN_ERROR = 303,

  /**
   * 传输数据解密失败。
   */
  SERVER_DECRYPTION_FAILED = 306,
}

/**
 * 连接事件监听器。
 *
 * 在不稳定的网络环境中断开连接时，使用该 SDK 的应用会收到 `onDisconnected` 回调。
 *
 * 无需手动重连，Chat SDK 会自动处理重连。
 *
 * 包含以下两个连接相关回调：
 * - `onConnected`：连接建立时触发。
 * - `onDisconnected`：连接断开时触发，并携带表示断开原因的错误码，详见 {@link ChatDisconnectErrorCode}。
 *
 * 添加连接事件监听器：
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
 *    onDisconnected(errorCode?: number, info?: { deviceName?: string; ext?: string }): void {
 *      chatlog.log('ConnectScreen.onDisconnected', errorCode, info);
 *    }
 *  })();
 *  ChatClient.getInstance().addConnectionListener(listener);
 *  ```
 *
 * 移除连接事件监听器：
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
   * SDK 与 chat 服务器断开连接时触发。
   *
   * `errorCode` 由原生 SDK 原样传递，分为两类（详见 {@link ChatDisconnectErrorCode}）：
   * - 登出原因（例如 `USER_LOGIN_FROM_OTHER_DEVICE`）：本地登录状态不再有效，应返回登录页面并重新登录。
   * - 连接原因（例如 `NETWORK_ERROR`、`SERVER_NOT_REACHABLE`）：用户仍保持登录状态，但连接已断开，SDK 会自动重连；收到这些错误码时不要返回登录页面。
   *
   * 未在 {@link ChatDisconnectErrorCode} 中列出的错误码（包括未来原生 SDK 版本新增的错误码）也会原样传递；
   * 除非原生 SDK 文档另有说明，否则应将其视为连接原因。
   *
   * 如果没有 `errorCode`，表示平台未提供断开原因（例如 iOS 上的网络断开）；也应将其视为连接事件。
   *
   * 注意：token 过期导致的登出不会触发该回调，详见 {@link ChatConnectEventListener.onTokenDidExpire}。
   * 需要同时处理这两个回调，才能覆盖所有登出场景。
   *
   * @param errorCode 断开连接的原因，详见 {@link ChatDisconnectErrorCode}。
   * @param info 仅当 `errorCode` 为 {@link ChatDisconnectErrorCode.USER_LOGIN_FROM_OTHER_DEVICE} 时存在：`deviceName` 为发起登录的设备名称，`ext` 为该设备的扩展信息。详见 {@link ChatOptions.loginExtraInfo}。
   */
  onDisconnected?(
    errorCode?: number,
    info?: { deviceName?: string; ext?: string }
  ): void;

  /**
   * Agora token 即将过期时触发。
   */
  onTokenWillExpire?(): void;

  /**
   * Agora token 已过期时触发。
   */
  onTokenDidExpire?(): void;

  /**
   * 开始接收离线消息的时候触发。
   */
  onOfflineMessageSyncStart?(): void;

  /**
   * 结束接收离线消息的时候触发。
   */
  onOfflineMessageSyncFinish?(): void;

  /**
   * SDK 开始从服务器同步指定类型的数据时触发。
   *
   * @param type 要同步的数据类型，是 {@link ChatDataSyncType} 的位掩码。
   */
  onDataSyncStart?(type: ChatDataSyncType): void;

  /**
   * SDK 完成从服务器同步指定类型的数据时触发。
   *
   * @param type 已同步的数据类型，是 {@link ChatDataSyncType} 的位掩码。
   * @param errorCode 同步结果的错误码。`0` 表示成功。
   */
  onDataSyncFinish?(type: ChatDataSyncType, errorCode: number): void;

  /**
   * 本地数据库打开时触发。
   *
   * 数据库的打开过程独立于登录流程。依赖本地数据库的 SDK 方法只能在该回调触发后调用。
   *
   * @param username 已打开数据库所绑定的用户 ID。
   * @param errorCode 数据库打开结果的错误码。`0` 表示成功。
   */
  onDatabaseOpened?(username: string, errorCode: number): void;
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
 * - 对方阅读了这条消息，发送方会收到已读回执（发送消息时需将 {@link ChatMessage.isNeedReadReceipt} 设置为 `true`）。
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
   * 收到流式消息回调。
   *
   * @param messages 收到的流式消息。
   */
  onStreamMessagesReceived?(messages: Array<ChatMessage>): void;

  /**
   * 收到命令消息回调。
   *
   * 与 {@link onMessagesReceived} 不同, 这个回调只包含命令的消息，命令消息通常不对用户展示。
   *
   * @param messages 收到的命令消息。
   */
  onCmdMessagesReceived?(messages: Array<ChatMessage>): void;

  /**
   * 收到消息已读回执时触发。
   *
   * 以下任一场景会触发该回调：
   *
   * - 接收方阅读消息并发送已读回执，详见 {@link ChatManager.sendMessageReadReceipts}。
   * - 多端多设备登录场景下，当前用户在其他设备上阅读消息或清除会话未读消息数。
   *
   * @param receipts 消息已读回执，详见 {@link ChatMessageReadReceipt}。
   */
  onMessageReadReceipts?(receipts: Array<ChatMessageReadReceipt>): void;

  /**
   * 收到消息已送达回执的回调。
   *
   * @param messages 送达回执对应的消息。
   */
  onMessagesDelivered?(messages: Array<ChatMessage>): void;

  /**
   * 收到消息撤销通知的回调。
   *
   * @param params 撤销消息的信息。
   */
  onMessagesRecalledInfo?(info: Array<ChatRecalledMessageInfo>): void;

  /**
   * 会话更新时触发。
   *
   * 仅在添加或删除会话时触发该回调。
   */
  onConversationsUpdate?(): void;

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
   */
  onChatMessageThreadUpdated?(event: ChatMessageThreadEvent): void;
  /**
   * 子区移除回调。
   *
   * @param event 子区移除事件。
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

  /**
   * 收到消息置顶状态变更回调。
   * @params params -
   * - Param [messageId] 置顶状态变更的消息 ID。
   * - Param [convId] 消息所在会话 ID。
   * - Param [pinOperation] 置顶操作类型。
   * - Param [pinInfo] 置顶或取消置顶操作信息，包括操作时间，操作者的用户 ID。 详见 {@link ChatMessagePinInfo}.
   */
  onMessagePinChanged?(params: {
    messageId: string;
    convId: string;
    pinOperation: number;
    pinInfo: ChatMessagePinInfo;
  }): void;
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
   * 多个群成员加入群组的回调。
   *
   * 例如，用户 A 在设备 A1 上将用户 B 和用户 C 加入群组，则设备 A2 上会收到该事件。 可能收到一次或多次。一次可能是多个成员聚合通知，多次可能是单个成员分别通知。
   *
   * @params 参数组
   * - Param [groupId] 群组 ID。
   * - Param [members] 新成员的用户 ID 数组。
   */
  onMembersJoined?(params: { groupId: string; members: Array<string> }): void;
  /**
   * 多个群组成员主动退出回调。
   *
   * 例如，用户 A 在设备 A1 上将用户 B 和用户 C 从群组中移除，则设备 A2 上会收到该事件。 可能收到一次或多次。一次可能是多个成员聚合通知，多次可能是单个成员分别通知。
   *
   * @params 参数组。
   * - Param [groupId] 群组 ID。
   * - Param [members] 退群的成员的用户 ID 数组。
   */
  onMembersExited?(params: { groupId: string; members: Array<string> }): void;
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

  /**
   * 群组成员的群名片发生变化时触发。
   *
   * @params params -
   * - groupId: 群组 ID。
   * - userId: 群名片发生变化的成员的用户 ID。
   * - namecard: 成员的新群名片。群名片被清除时为 `undefined`。
   */
  onUserGroupNamecardChanged?(params: {
    groupId: string;
    userId: string;
    namecard?: string;
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
  /**
   * 联系人信息更新时触发。
   *
   * @param contact 信息发生更新的联系人。详见 {@link ChatContact}。
   */
  onContactInfoUpdate?(contact: ChatContact): void;
}

/**
 * 用户信息事件监听器。
 *
 * 用于监听用户属性变化，包括当前用户自身属性变化和已订阅用户的属性变化。
 */
export interface ChatUserInfoEventListener {
  /**
   * 当前用户的用户属性更新时触发。
   *
   * @param userInfo 当前用户更新后的用户属性。详见 {@link ChatUserInfo}。
   */
  onSelfUserInfoUpdate?(userInfo: ChatUserInfo): void;
  /**
   * 已订阅用户的用户属性更新时触发。
   *
   * @param userInfos 更新后的用户属性列表。详见 {@link ChatUserInfo}。
   */
  onUserInfoUpdate?(userInfos: ChatUserInfo[]): void;
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
  onMemberJoined?(params: {
    roomId: string;
    participant: string;
    ext?: string;
  }): void;
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
   * 增加禁言成员时候回调。
   *
   * @params 参数组。
   * - Param [roomId] 聊天室 ID。
   * - Param [mutes] 禁言列表。key为用户ID，value为过期时间戳。
   */
  onMuteListAddedV2?(params: {
    roomId: string;
    mutes: Record<string, number>;
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

export interface ChatExceptionEventListener {
  /**
   * 异常事件监听回调。
   *
   * @params -
   * - Param [except] 异常对象。
   * - Param [from] 异常来源。
   * - Param [extra] 额外信息。
   */
  onExcept(params: {
    except: ChatException;
    from?: string;
    extra?: Record<string, string>;
  }): void;
}
