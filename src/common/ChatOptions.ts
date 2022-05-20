// import { ChatPushConfig } from './ChatPushConfig';

/**
 * The settings of the chat SDK.
 *
 * The chat setting class that defines parameters and options of the SDK, including whether to encrypt the messages before sending them and whether to automatically accept the friend invitations.
 */
export class ChatOptions {
  /**
   * The app key you get from the website console when creating a chat app. It is the unique identifier of your app.
   */
  appKey: string;
  /**
   * Whether to enable automatic login.
   *
   * - `true`: (Default) Enables automatic login.
   * - `false`: Disables automatic login.
   */
  autoLogin: boolean;
  /**
   * Whether to output the debug information. Make sure to call the method after initializing the EMClient using {@link #init(Context, EMOptions)}.
   *
   * - `true`: Yes.
   * - `false`: (Default) No.
   */
  debugModel: boolean;
  /**
   * Whether to accept friend invitations from other users automatically.
   *
   * - `true`: (Default) Yes.
   * - `false`: No.
   */
  acceptInvitationAlways: boolean;
  /**
   * Whether to accept group invitations automatically.
   *
   * - `true`: (Default) Yes.
   * - `false`: No.
   */
  autoAcceptGroupInvitation: boolean;
  /**
   * Whether the read receipt is required.
   *
   * - `true`: (Default) Yes.
   * - `false`: No.
   */
  requireAck: boolean;
  /**
   * Whether the delivery receipt is required.
   *
   * - `true`: Yes.
   * - `false`: (Default) No.
   */
  requireDeliveryAck: boolean;
  /**
   * Whether to delete the group message records when leaving a group.
   *
   * - `true`: (Default) Yes.
   * - `false`: No.
   */
  deleteMessagesAsExitGroup: boolean;
  /**
   * Whether to delete the chat room message records when leaving the chat room.
   *
   * - `true`: (Default) Yes.
   * - `false`: No.
   */
  deleteMessagesAsExitChatRoom: boolean;
  /**
   * Whether to allow the chat room owner to leave the chat room.
   *
   * - `true`: (Default) Yes.
   * - `false`: No.
   */
  isChatRoomOwnerLeaveAllowed: boolean;
  /**
   * Whether to sort messages by the time when the message is received on the server.
   *
   * - `true`: (Default) Yes.
   * - `false`: No.
   */
  sortMessageByServerTime: boolean;
  /**
   * Whether only HTTPS is used for REST operations.
   *
   * - `true`: (Default) Yes. Only HTTPS is used.
   * - `false`: No. Both HTTP and HTTPS are allowed.
   */
  usingHttpsOnly: boolean;
  /**
   * Whether to upload the message attachments automatically to the chat server.
   *
   * - `true`: (Default) Yes.
   * - `false`: No. A custom path is used.
   */
  serverTransfer: boolean;
  /**
   * Whether to auto download the thumbnail.
   *
   * - `true`: (Default) Yes.
   * - `false`: No.
   */
  isAutoDownload: boolean;
  /**
   * The push config.
   */
  // pushConfig: ChatPushConfig;
  /**
   * Sets whether to disable DNS.
   *
   * - `true`: (Default) Yes.
   * - `false`: No.
   */
  enableDNSConfig: boolean;
  /**
   * The DNS url.
   */
  dnsUrl: string;
  /**
   * The custom REST server.
   */
  restServer: string;
  /**
   * The custom IM message server URL.
   */
  imServer: string;
  /**
   * The custom IM server port.
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
    // pushConfig?: any;
    enableDNSConfig?: boolean;
    dnsUrl?: string;
    restServer?: string;
    imServer?: string;
    imPort?: number;
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
    this.usingHttpsOnly = params.usingHttpsOnly ?? false;
    this.serverTransfer = params.serverTransfer ?? true;
    this.isAutoDownload = params.isAutoDownload ?? true;
    // this.pushConfig = params.pushConfig
    //   ? new ChatPushConfig(params.pushConfig)
    //   : new ChatPushConfig({});
    this.enableDNSConfig = params.enableDNSConfig ?? true;
    this.dnsUrl = params.dnsUrl ?? '';
    this.restServer = params.restServer ?? '';
    this.imServer = params.imServer ?? '';
    this.imPort = params.imPort ?? 0;
  }
}
