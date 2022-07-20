import type { ChatPushConfig } from './ChatPushConfig';

/**
 * The chat setting class that defines parameters and options of the SDK, including whether to encrypt the messages before sending them and whether to automatically accept the friend invitations.
 */
export class ChatOptions {
  /**
   * The App Key you get from the console when creating a chat app. It is the unique identifier of your app.
   */
  appKey: string;
  /**
   * Whether to enable automatic login.
   *
   * - (Default) `true`: Enables automatic login.
   * - `false`: Disables automatic login.
   */
  autoLogin: boolean;
  /**
   * Whether to output the debug information.
   * - `true`: Yes.
   * - (Default) `false`: No.
   *
   * **Note**
   * You can call {@link #init(Context, ChatOptions)} to set this attribute after `ChatClient` is initialized.
   */
  debugModel: boolean;
  /**
   * Whether to accept friend invitations from other users automatically.
   *
   * - (Default) `true`: Yes.
   * - `false`: No.
   */
  acceptInvitationAlways: boolean;
  /**
   * Whether to accept group invitations automatically.
   *
   * - (Default) `true`: Yes.
   * - `false`: No.
   */
  autoAcceptGroupInvitation: boolean;
  /**
   * Whether to require the read receipt.
   *
   * - (Default) `true`: Yes.
   * - `false`: No.
   */
  requireAck: boolean;
  /**
   * Whether to require the delivery receipt.
   *
   * - (Default) `true`: Yes.
   * - `false`: No.
   */
  requireDeliveryAck: boolean;
  /**
   * Whether to delete the historical messages of the group stored in the memory and local database when leaving a group (either voluntarily or passively).
   *
   * - (Default) `true`: Yes.
   * - `false`: No.
   */
  deleteMessagesAsExitGroup: boolean;
  /**
   * Whether to delete the historical messages of the chat room in the memory and local database when leaving the chat room (either voluntarily or passively).
   *
   * - (Default) `true`: Yes.
   * - `false`: No.
   */
  deleteMessagesAsExitChatRoom: boolean;
  /**
   * Whether to allow the chat room owner to leave the chat room.
   *
   * - (Default) `true`: Yes. When leaving the chat room, the chat room owner still has all privileges, except for receive messages in the chat room.
   * - `false`: No.
   */
  isChatRoomOwnerLeaveAllowed: boolean;
  /**
   * Whether to sort the messages in the reverse chronological order of the time when they are received by the server.
   *
   * - (Default) `true`: Yes;
   * - `false`: No. Messages are sorted in the reverse chronological order of the time when they are created.
   */
  sortMessageByServerTime: boolean;
  /**
   * Whether only HTTPS is used for REST operations.
   *
   * - (Default) `true`: Only HTTPS is supported.
   * - `false`: Both HTTP and HTTPS are allowed.
   */
  usingHttpsOnly: boolean;
  /**
   * Whether to upload the message attachments automatically to the chat server.
   *
   * - (Default) `true`: Yes.
   * - `false`: No. A custom path is used.
   */
  serverTransfer: boolean;
  /**
   * Whether to automatically download the thumbnail.
   *
   * - (Default) `true`: Yes.
   * - `false`: No.
   */
  isAutoDownload: boolean;
  /**
   * The push configuration.
   */
  pushConfig?: ChatPushConfig;
  /**
   * Whether to disable DNS.
   *
   * - (Default) `true`: Yes.
   * - `false`: No. DNS needs to be disabled for private deployment.
   */
  enableDNSConfig: boolean;
  /**
   * The URL of the DNS server.
   */
  dnsUrl: string;
  /**
   * The custom address of the REST server.
   *
   * This address is used when you implement data isolation and data security during private deployment.
   *
   * If you need the address, contact our business manager.
   */
  restServer: string;
  /**
   * The custom address of the IM message server.
   *
   * This address is used when you implement data isolation and data security during private deployment.
   *
   * If you need the address, contact our business manager.
   */
  imServer: string;
  /**
   * The custom port of the IM server.
   *
   * The custom port is used when you implement data isolation and data security during private deployment.
   *
   * If you need the port, contact our business manager.
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
