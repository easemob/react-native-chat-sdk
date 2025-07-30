import { ChatAreaCode } from './ChatAreaCode';
import { ChatError } from './ChatError';
import type { ChatPushConfig } from './ChatPushConfig';

/**
 * 聊天设置类，用于定义 SDK 的各种参数和选项，例如，是否发送前加密信息、是否自动接受加好友邀请等。
 */
export class ChatOptions {
  /**
   * 创建 App 时在 console 后台上注册的 App 唯一识别符，即 App Key。
   */
  appKey: string;
  /**
   * 创建 App 时在 console 后台上注册的 App 唯一识别符，即 App ID。
   */
  appId: string;
  /**
   * 是否开启自动登录。
   * -（默认） `true`：开启；
   * - `false`：关闭。
   */
  autoLogin: boolean;
  /**
   * 是否输出调试信息。
   * - `true`: SDK 会在日志里输出调试信息。
   * - （默认） `false`: SDK 不输出调试信息。
   */
  debugModel: boolean;
  /**
   * 日志可以带上的标记。区别其它类型的日志。
   */
  logTag?: string;
  /**
   * 是否激活日志的时间戳。
   */
  logTimestamp?: boolean;
  /**
   * 是否自动接受好友邀请。
   *
   * - `true`: 是.
   * - (Default) `false`: 否.
   */
  acceptInvitationAlways: boolean;
  /**
   * 是否自动接受群组邀请。
   * - （默认） `true`：是。
   * - `false`：否。
   */
  autoAcceptGroupInvitation: boolean;
  /**
   * 是否需要接收方阅读消息后发送已读回执。
   * - （默认） `true`：是；
   * - `false`：否。
   *
   * 该设置对于 {@link ChatManager.sendConversationReadAck} 无效。
   *
   */
  requireAck: boolean;
  /**
   * 是否需要接收方发送送达回执。
   * -（默认）`true`：是；
   * - `false`：否。
   *
   * 只对单聊有效。 {@link ChatMessageChatType.PeerChat}
   */
  requireDeliveryAck: boolean;
  /**
   * 是否在退出（主动或被动）群组时删除该群组中在内存和本地数据库中的历史消息。
   * - （默认） `true`: 是；
   * - `false`: 否。
   */
  deleteMessagesAsExitGroup: boolean;
  /**
   * 是否在退出（主动或被动）聊天室时删除该聊天室在内存和本地数据库中的历史消息。
   * - （默认） `true`: 是；
   * - `false`：否。
   */
  deleteMessagesAsExitChatRoom: boolean;
  /**
   * 是否允许聊天室所有者离开聊天室。
   * - （默认） `true`: 允许。离开聊天室后，聊天室所有者除了接收不到该聊天室的消息，其他权限不变。
   * - `false`: 不允许。
   */
  isChatRoomOwnerLeaveAllowed: boolean;
  /**
   * 是否按服务器收到消息时间的倒序对消息排序。
   * - （默认） `true`：是；
   * - `false`：否。按消息创建时间的倒序排序。
   */
  sortMessageByServerTime: boolean;
  /**
   * 是否只通过 HTTPS 进行 REST 操作。
   * - （默认） `true`：是；
   * - `false`：否。支持 HTTPS 和 HTTP。
   */
  usingHttpsOnly: boolean;
  /**
   * 是否自动将消息附件上传到聊天服务器。
   * -（默认）`true`：是；
   * - `false`：否。
   */
  serverTransfer: boolean;
  /**
   * 是否自动下载缩略图。
   * - （默认） `true`：是；
   * - `false`：否。
   */
  isAutoDownload: boolean;
  /**
   * 推送设置。
   */
  pushConfig?: ChatPushConfig;
  /**
   * 设置是否开启 DNS。
   * - （默认） `true`：开启。
   * - `false`：关闭。私有部署时需要关闭。
   */
  enableDNSConfig: boolean;
  /**
   * DNS 服务器的地址。
   */
  dnsUrl: string;
  /**
   * REST 服务器地址。
   *
   * 该地址在进行私有部署时实现数据隔离和数据安全时使用。
   *
   * 如有需求，请联系商务。
   */
  restServer: string;
  /**
   * IM 消息服务器地址。
   *
   * 该地址在进行私有部署时实现数据隔离和数据安全时使用。
   *
   * 如有需求，请联系商务。
   */
  imServer: string;
  /**
   * IM 消息服务器的自定义端口号。
   *
   * 该端口在进行私有部署时实现数据隔离和数据安全时使用。
   *
   * 如有需求，请联系商务。
   */
  imPort: number;
  /**
   * 是否激活 TLS。默认false。
   */
  enableTLS: boolean;
  /**
   * 接收消息通知是否包含发送成功的消息。
   * - `true`：是。接收消息通知中包含发送成功的消息。
   * - （默认）`false`：否。接收消息通知中只包含接收的消息。
   */
  messagesReceiveCallbackIncludeSend: boolean;
  /**
   * 是否将导入的消息视为已读。
   */
  regardImportMessagesAsRead: boolean;
  /**
   * 区号。
   * 该属性用于限制可访问边缘节点的范围。 默认值为“GLOB”。 请参阅{@link ChatAreaCode}。
   * 该属性只有在调用 {@link ChatClient.init} 时才能设置。 在应用程序运行期间无法更改属性设置。
   */
  areaCode: ChatAreaCode;

  /**
   * SDK 从本地数据库中加载会话时是否包含空会话（没有消息的会话）：
   *
   * - `true`：包含空会话；
   * - （默认）`false`：不包含空会话。
   */
  enableEmptyConversation: boolean;

  /**
   * 自定义设备名称。
   *
   * `customOSType` 设置为 -1，则该属性不生效。
   *
   * 典型应用：用户需要iphone手机和ipad设备同时在线。
   *
   */
  customDeviceName?: string;

  /**
   * 自定义设备类型。
   */
  customOSType?: number;

  /**
   * 设置当发送的文本消息的内容被文本审核（Moderation）服务替换时，是否需要返回给发送方。
   *  - true：将内容替换后的消息返回给发送方。
   *  - （默认）false：将原消息返回给发送方。
   */
  useReplacedMessageContents: boolean;

  /**
   * 是否在登录时传递额外的登录信息给服务器。
   *
   * 该属性用于在登录时传递额外的登录信息给服务器，例如，登录时传递设备信息。
   */
  loginExtraInfo?: string;

  /**
   * 工作目录下的内容是否可以拷贝
   *
   * **Note** 仅ios平台生效。
   *
   * 默认是 `false`
   */
  workPathCopiable?: boolean;

  /**
   * UIKit 版本。
   *
   * - (Default) undefined.
   *
   */
  uikitVersion?: string;

  /**
   * @deprecated 请使用 {@link withAppId} and {@link withAppKey} 替代.
   */
  constructor(params: {
    appKey: string;
    appId: string;
    autoLogin?: boolean;
    debugModel?: boolean;
    acceptInvitationAlways?: boolean;
    autoAcceptGroupInvitation?: boolean;
    requireAck?: boolean;
    requireDeliveryAck?: boolean;
    deleteMessagesAsExitGroup?: boolean;
    deleteMessagesAsExitChatRoom?: boolean;
    isChatRoomOwnerLeaveAllowed?: boolean;
    sortMessageByServerTime?: boolean;
    usingHttpsOnly?: boolean;
    serverTransfer?: boolean;
    isAutoDownload?: boolean;
    pushConfig?: ChatPushConfig;
    areaCode?: ChatAreaCode;
    logTag?: string;
    logTimestamp?: boolean;
    enableEmptyConversation?: boolean;
    customDeviceName?: string;
    customOSType?: number;
    enableDNSConfig?: boolean;
    dnsUrl?: string;
    restServer?: string;
    imServer?: string;
    imPort?: number;
    enableTLS?: boolean;
    messagesReceiveCallbackIncludeSend?: boolean;
    regardImportMessagesAsRead?: boolean;
    useReplacedMessageContents?: boolean;
    loginExtraInfo?: string;
    workPathCopiable?: boolean;
    uikitVersion?: string;
  }) {
    if (!params.appKey && !params.appId) {
      throw new ChatError({
        code: -1,
        description: 'appId and appKey cannot be undefined at the same time!',
      });
    }
    this.appId = params.appId;
    this.appKey = params.appKey;
    this.autoLogin = params.autoLogin ?? true;
    this.debugModel = params.debugModel ?? false;
    this.acceptInvitationAlways = params.acceptInvitationAlways ?? false;
    this.autoAcceptGroupInvitation = params.autoAcceptGroupInvitation ?? false;
    this.requireAck = params.requireAck ?? true;
    this.requireDeliveryAck = params.requireDeliveryAck ?? false;
    this.deleteMessagesAsExitGroup = params.deleteMessagesAsExitGroup ?? true;
    this.deleteMessagesAsExitChatRoom =
      params.deleteMessagesAsExitChatRoom ?? true;
    this.isChatRoomOwnerLeaveAllowed =
      params.isChatRoomOwnerLeaveAllowed ?? true;
    this.sortMessageByServerTime = params.sortMessageByServerTime ?? true;
    this.usingHttpsOnly = params.usingHttpsOnly ?? true;
    this.serverTransfer = params.serverTransfer ?? true;
    this.isAutoDownload = params.isAutoDownload ?? true;
    this.pushConfig = params.pushConfig;
    this.enableDNSConfig =
      params.enableDNSConfig !== undefined ? params.enableDNSConfig : true;
    this.dnsUrl = params.dnsUrl ?? '';
    this.restServer = params.restServer ?? '';
    this.imServer = params.imServer ?? '';
    this.imPort = params.imPort !== undefined ? params.imPort : 0;
    this.areaCode = params.areaCode ?? ChatAreaCode.GLOB;
    this.logTag = params.logTag;
    this.logTimestamp = params.logTimestamp;
    this.enableEmptyConversation = params.enableEmptyConversation ?? false;
    this.customDeviceName = params.customDeviceName;
    this.customOSType = params.customOSType;
    this.enableTLS = params.enableTLS ?? false;
    this.messagesReceiveCallbackIncludeSend =
      params.messagesReceiveCallbackIncludeSend ?? false;
    this.regardImportMessagesAsRead =
      params.regardImportMessagesAsRead ?? false;
    this.useReplacedMessageContents =
      params.useReplacedMessageContents ?? false;
    this.loginExtraInfo = params.loginExtraInfo;
    this.workPathCopiable = params.workPathCopiable ?? false;
    this.uikitVersion = params.uikitVersion;
  }

  static withAppId(params: {
    appId: string;
    autoLogin?: boolean;
    debugModel?: boolean;
    acceptInvitationAlways?: boolean;
    autoAcceptGroupInvitation?: boolean;
    requireAck?: boolean;
    requireDeliveryAck?: boolean;
    deleteMessagesAsExitGroup?: boolean;
    deleteMessagesAsExitChatRoom?: boolean;
    isChatRoomOwnerLeaveAllowed?: boolean;
    sortMessageByServerTime?: boolean;
    usingHttpsOnly?: boolean;
    serverTransfer?: boolean;
    isAutoDownload?: boolean;
    pushConfig?: ChatPushConfig;
    areaCode?: ChatAreaCode;
    logTag?: string;
    logTimestamp?: boolean;
    enableEmptyConversation?: boolean;
    customDeviceName?: string;
    customOSType?: number;
    enableDNSConfig?: boolean;
    dnsUrl?: string;
    restServer?: string;
    imServer?: string;
    imPort?: number;
    enableTLS?: boolean;
    messagesReceiveCallbackIncludeSend?: boolean;
    regardImportMessagesAsRead?: boolean;
    useReplacedMessageContents?: boolean;
    loginExtraInfo?: string;
    workPathCopiable?: boolean;
    uikitVersion?: string;
  }) {
    return new ChatOptions({
      ...params,
      appId: params.appId,
      appKey: undefined as any,
    });
  }
  static withAppKey(params: {
    appKey: string;
    autoLogin?: boolean;
    debugModel?: boolean;
    acceptInvitationAlways?: boolean;
    autoAcceptGroupInvitation?: boolean;
    requireAck?: boolean;
    requireDeliveryAck?: boolean;
    deleteMessagesAsExitGroup?: boolean;
    deleteMessagesAsExitChatRoom?: boolean;
    isChatRoomOwnerLeaveAllowed?: boolean;
    sortMessageByServerTime?: boolean;
    usingHttpsOnly?: boolean;
    serverTransfer?: boolean;
    isAutoDownload?: boolean;
    pushConfig?: ChatPushConfig;
    areaCode?: ChatAreaCode;
    logTag?: string;
    logTimestamp?: boolean;
    enableEmptyConversation?: boolean;
    customDeviceName?: string;
    customOSType?: number;
    enableDNSConfig?: boolean;
    dnsUrl?: string;
    restServer?: string;
    imServer?: string;
    imPort?: number;
    enableTLS?: boolean;
    messagesReceiveCallbackIncludeSend?: boolean;
    regardImportMessagesAsRead?: boolean;
    useReplacedMessageContents?: boolean;
    loginExtraInfo?: string;
    workPathCopiable?: boolean;
    uikitVersion?: string;
  }) {
    return new ChatOptions({
      ...params,
      appKey: params.appKey,
      appId: undefined as any,
    });
  }
}
