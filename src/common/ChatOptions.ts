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
   * 是否开启自动登录。
   * -（默认） `true`：开启；
   * - `false`：关闭。
   */
  autoLogin: boolean;
  /**
   * 是否输出调试信息。
   * - `true`: SDK 会在日志里输出调试信息。
   * - （默认） `false`: SDK 不输出调试信息。
   *
   * **注意**
   * 请确保在 ChatClient 初始化之后调用 {@link #init(Context, ChatOptions)} 来设置。
   */
  debugModel: boolean;
  /**
   * 是否自动接受加好友邀请。
   * - `true`：是。
   * - （默认）`false`：否。
   */
  acceptInvitationAlways: boolean;
  /**
   * 是否自动接受群组邀请。
   * - （默认） `true`：是。
   * - `false`：否。
   */
  autoAcceptGroupInvitation: boolean;
  /**
   * 是否需要接收方发送已读回执。
   * - （默认） `true`：是；
   * - `false`：否。
   */
  requireAck: boolean;
  /**
   * 是否需要接收方发送送达回执。
   * -（默认）`true`：是；
   * - `false`：否。
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

  constructor(params: {
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
  }) {
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
    this.enableDNSConfig = true;
    this.dnsUrl = '';
    this.restServer = '';
    this.imServer = '';
    this.imPort = 0;
  }
}
