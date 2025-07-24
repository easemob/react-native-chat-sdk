import { ChatAreaCode } from './ChatAreaCode';
import { ChatError } from './ChatError';
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
   * It is the unique identifier of your app.
   */
  appId: string;
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
   */
  debugModel: boolean;
  /**
   * Global flag for printing logs.
   */
  logTag?: string;
  /**
   * Whether to activate the timestamp of the log.
   */
  logTimestamp?: boolean;
  /**
   * Whether to accept friend invitations from other users automatically.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  acceptInvitationAlways: boolean;
  /**
   * Whether to accept group invitations automatically.
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  autoAcceptGroupInvitation: boolean;
  /**
   * Whether to require the message read receipt from the recipient.
   *
   * - (Default) `true`: Yes.
   * - `false`: No.
   *
   * This property does not take effect for {@link ChatManager.sendConversationReadAck}.
   *
   */
  requireAck: boolean;
  /**
   * Whether to require the delivery receipt.
   *
   * **Note**
   *
   * Only valid for single chat messages. {@link ChatMessageChatType.PeerChat}
   *
   * - `true`: Yes.
   * - (Default) `false`: No.
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
   * - (Default) `true`: Yes. Even if the chat room owner leaves the chat room, the owner still has all privileges, except for receiving messages in the chat room.
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
  /**
   * Whether to enable TLS connection, which takes effect during initialization and is `false` by default.
   */
  enableTLS: boolean;
  /**
   * Whether the sent message is included in `ChatMessageEventListener.onMessagesReceived`.
   * - `true`: Yes. Besides the received message, the sent message is also included in `ChatMessageEventListener.onMessagesReceived`.
   * - (Default)`false`: No. Only the received message is included in `ChatMessageEventListener.onMessagesReceived`.
   */
  messagesReceiveCallbackIncludeSend: boolean;
  /**
   * Whether to set messages from the server side as read.
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  regardImportMessagesAsRead: boolean;
  /**
   * The area code.
   * This attribute is used to restrict the scope of accessible edge nodes. The default value is `GLOB`. See {@link ChatAreaCode}.
   * This attribute can be set only when you call {@link ChatClient.init}. The attribute setting cannot be changed during the app runtime.
   */
  areaCode: ChatAreaCode;

  /**
   * Whether to include empty conversations when the SDK loads conversations from the local database:
   *
   * - `true`: Yes. Empty conversations are included.
   * - (Default) `false`: No. Empty conversations are excluded.
   */
  enableEmptyConversation: boolean;

  /**
   * Custom device name.
   *
   * This attribute does not take effect when `customOSType` is set to `-1`.
   *
   * An application scenario is as follows: User A wants to log in to a mobile phone and a tablet with the same user account. Then the user sets `customOSType` to `1` and `customDeviceName` to `foo`.
   *
   */
  customDeviceName?: string;

  /**
   * Custom system type.
   */
  customOSType?: number;

  /**
   * Whether the server returns the sender the text message with the content replaced during text moderation:
   * - `true`: Yes.
   * - (Default) `false`: No. The server returns the original message to the sender.
   */
  useReplacedMessageContents: boolean;

  /**
   * Extra login information. Can be a string in json format.
   *
   * This attribute is used to pass extra login information to the server. The server can use this information to verify the user's identity.
   */
  loginExtraInfo?: string;

  /**
   * Whether the work path is copyable.
   *
   * **Note** This attribute is used only for the iOS platform.
   *
   * default is `false`
   */
  workPathCopiable?: boolean;

  /**
   * The UIKit version.
   *
   * - (Default) undefined.
   *
   */
  uikitVersion?: string;

  /**
   * @deprecated Use {@link withAppId} and {@link withAppKey} instead.
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
