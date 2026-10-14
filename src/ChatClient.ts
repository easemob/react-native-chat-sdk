import {
  type EventSubscription,
  NativeEventEmitter,
  Platform,
} from 'react-native';
import { Factory } from './__internal__/Factory';

import { BaseManager } from './__internal__/Base';
import {
  MTbindDeviceToken,
  MTbindPushKitToken,
  MTchangeAppId,
  MTchangeAppKey,
  MTcompressLogs,
  MTgetCurrentUser,
  MTgetLoggedInDevicesFromServer,
  MTgetRTCTokenInfoWithChannelName,
  MTgetToken,
  MTgetUserIdsWithRTCUids,
  MTinit,
  MTisConnected,
  MTkickAllDevices,
  MTkickDevice,
  MTlogin,
  MTlogout,
  MTonConnected,
  MTonCustomEvent,
  MTonDatabaseOpened,
  MTonDataSyncFinish,
  MTonDataSyncStart,
  MTonDisconnected,
  MTonMultiDeviceEvent,
  MTonMultiDeviceEventContact,
  MTonMultiDeviceEventConversation,
  MTonMultiDeviceEventGroup,
  MTonMultiDeviceEventRemoveMessage,
  MTonMultiDeviceEventThread,
  MTonOfflineMessageSyncFinish,
  MTonOfflineMessageSyncStart,
  MTonTokenDidExpire,
  MTonTokenWillExpire,
  MTrenewToken,
  MTunbindPushKitToken,
} from './__internal__/Consts';
import { ExceptionHandler } from './__internal__/ErrorHandler';
import { ChatContactManager } from './ChatContactManager';
import {
  type ChatConnectEventListener,
  type ChatCustomEventListener,
  type ChatExceptionEventListener,
  ChatMultiDeviceEventFromNumber,
  type ChatMultiDeviceEventListener,
} from './ChatEvents';
import { ChatGroupManager } from './ChatGroupManager';
import { ChatManager } from './ChatManager';
import { ChatPresenceManager } from './ChatPresenceManager';
import { ChatPushManager } from './ChatPushManager';
import { ChatRoomManager } from './ChatRoomManager';
import { ChatUserInfoManager } from './ChatUserInfoManager';
import { chatlog } from './common/ChatConst';
import { ChatDeviceInfo } from './common/ChatDeviceInfo';
import { ChatOptions, type ChatDataSyncType } from './common/ChatOptions';
import { eventEmitter } from './__specs__';
import { Native } from './__internal__/Native';
import { ChatError } from './common/ChatError';
import { ChatRTCTokenInfo } from './common/ChatRTCTokenInfo';

chatlog.log('dev:eventEmitter: ', eventEmitter);

/**
 * Chat 客户端类。该类是 Chat SDK 的入口，负责登录、登出及管理 SDK 与 chat 服务器之间的连接。
 */
export class ChatClient extends BaseManager {
  public static eventType = 2; // 1.remove 2.subscription(suggested)
  protected static TAG = 'ChatClient';
  private static _instance: ChatClient;
  private _connectionSubscriptions: Map<string, EventSubscription>;
  public static getInstance(): ChatClient {
    if (ChatClient._instance === null || ChatClient._instance === undefined) {
      ChatClient._instance = new ChatClient();
    }
    return ChatClient._instance;
  }

  private setEventEmitter(): void {
    chatlog.log(`${ChatClient.TAG}: setEventEmitter: `);
    this.setNativeListener(this.getEventEmitter());
    this._chatManager.setNativeListener(this.getEventEmitter());
    this._groupManager.setNativeListener(this.getEventEmitter());
    this._contactManager.setNativeListener(this.getEventEmitter());
    this._chatManager.setNativeListener(this.getEventEmitter());
    this._pushManager.setNativeListener(this.getEventEmitter());
    this._chatRoomManager.setNativeListener(this.getEventEmitter());
    this._presenceManager.setNativeListener(this.getEventEmitter());
    this._userInfoManager.setNativeListener(this.getEventEmitter());
    chatlog.log('eventEmitter has finished.');
  }

  public getEventEmitter(): NativeEventEmitter {
    return eventEmitter;
  }

  private _chatManager: ChatManager;
  private _groupManager: ChatGroupManager;
  private _contactManager: ChatContactManager;
  private _chatRoomManager: ChatRoomManager;
  private _pushManager: ChatPushManager;
  private _userInfoManager: ChatUserInfoManager;
  private _presenceManager: ChatPresenceManager;

  private _connectionListeners: Set<ChatConnectEventListener>;
  private _multiDeviceListeners: Set<ChatMultiDeviceEventListener>;
  private _customListeners: Set<ChatCustomEventListener>;

  private _options?: ChatOptions;
  private readonly _rnSdkVersion: string = '1.1.0';
  private _currentUsername: string = '';

  private constructor() {
    super();
    Factory.setChatClient(this);

    this._chatManager = new ChatManager();
    this._groupManager = new ChatGroupManager();
    this._contactManager = new ChatContactManager();
    this._chatRoomManager = new ChatRoomManager();
    this._pushManager = new ChatPushManager();
    this._userInfoManager = new ChatUserInfoManager();
    this._presenceManager = new ChatPresenceManager();

    this._connectionListeners = new Set<ChatConnectEventListener>();
    this._connectionSubscriptions = new Map<string, EventSubscription>();

    this._multiDeviceListeners = new Set<ChatMultiDeviceEventListener>();
    this._customListeners = new Set<ChatCustomEventListener>();

    this.setEventEmitter();

    try {
      this._rnSdkVersion = require('./version').default;
    } catch (error) {
      console.error(error);
    }
  }

  public setNativeListener(event: NativeEventEmitter): void {
    chatlog.log(`${ChatClient.TAG}: setNativeListener: `);
    this._connectionSubscriptions.forEach(
      (
        value: EventSubscription,
        key: string,
        map: Map<string, EventSubscription>
      ) => {
        chatlog.log(`${ChatClient.TAG}: setNativeListener:`, key, value, map);
        value.remove();
      }
    );
    this._connectionSubscriptions.clear();

    this._connectionSubscriptions.set(
      MTonConnected,
      event.addListener(MTonConnected, this.onConnected.bind(this))
    );
    this._connectionSubscriptions.set(
      MTonDisconnected,
      event.addListener(MTonDisconnected, this.onDisconnected.bind(this))
    );
    this._connectionSubscriptions.set(
      MTonTokenDidExpire,
      event.addListener(MTonTokenDidExpire, this.onTokenDidExpire.bind(this))
    );
    this._connectionSubscriptions.set(
      MTonTokenWillExpire,
      event.addListener(MTonTokenWillExpire, this.onTokenWillExpire.bind(this))
    );
    this._connectionSubscriptions.set(
      MTonMultiDeviceEvent,
      event.addListener(
        MTonMultiDeviceEvent,
        this.onMultiDeviceEvent.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonCustomEvent,
      event.addListener(MTonCustomEvent, this.onCustomEvent.bind(this))
    );

    this._connectionSubscriptions.set(
      MTonOfflineMessageSyncStart,
      event.addListener(
        MTonOfflineMessageSyncStart,
        this.onOfflineMessageSyncStart.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonOfflineMessageSyncFinish,
      event.addListener(
        MTonOfflineMessageSyncFinish,
        this.onOfflineMessageSyncFinish.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonDataSyncStart,
      event.addListener(MTonDataSyncStart, this.onDataSyncStart.bind(this))
    );
    this._connectionSubscriptions.set(
      MTonDataSyncFinish,
      event.addListener(MTonDataSyncFinish, this.onDataSyncFinish.bind(this))
    );
    this._connectionSubscriptions.set(
      MTonDatabaseOpened,
      event.addListener(MTonDatabaseOpened, this.onDatabaseOpened.bind(this))
    );
  }

  private onConnected(): void {
    chatlog.log(`${ChatClient.TAG}: onConnected: `);
    if (
      this._currentUsername === '' ||
      this._currentUsername === null ||
      this._currentUsername === undefined
    ) {
      this.getCurrentUsername();
    }
    this._connectionListeners.forEach((element) => {
      element.onConnected?.();
    });
  }
  private onDisconnected(params?: any): void {
    chatlog.log(`${ChatClient.TAG}: onDisconnected: `, params);
    const errorCode = params?.errorCode as number | undefined;
    const info =
      params?.deviceName !== undefined || params?.ext !== undefined
        ? {
            deviceName: params?.deviceName as string | undefined,
            ext: params?.ext as string | undefined,
          }
        : undefined;
    this._connectionListeners.forEach((element) => {
      element.onDisconnected?.(errorCode, info);
    });
  }
  private onTokenWillExpire(params?: any): void {
    chatlog.log(`${ChatClient.TAG}: onTokenWillExpire: `, params);
    this._connectionListeners.forEach((element) => {
      element.onTokenWillExpire?.();
    });
  }
  private onTokenDidExpire(params?: any): void {
    chatlog.log(`${ChatClient.TAG}: onTokenDidExpire: `, params);
    this._connectionListeners.forEach((element) => {
      element.onTokenDidExpire?.();
    });
  }
  private onMultiDeviceEvent(params?: any): void {
    chatlog.log(`${ChatClient.TAG}: onMultiDeviceEvent: `, params);
    this._multiDeviceListeners.forEach((element) => {
      const type = params.type as string;
      switch (type) {
        case MTonMultiDeviceEventContact:
          element.onContactEvent?.(
            ChatMultiDeviceEventFromNumber(params.event),
            params.target,
            params.ext
          );
          break;
        case MTonMultiDeviceEventGroup:
          element.onGroupEvent?.(
            ChatMultiDeviceEventFromNumber(params.event),
            params.target,
            params.ext
          );
          break;
        case MTonMultiDeviceEventThread:
          element.onThreadEvent?.(
            ChatMultiDeviceEventFromNumber(params.event),
            params.target,
            params.ext
          );
          break;
        case MTonMultiDeviceEventRemoveMessage:
          element.onMessageRemoved?.(params.convId, params.deviceId);
          break;
        case MTonMultiDeviceEventConversation:
          element.onConversationEvent?.(
            ChatMultiDeviceEventFromNumber(params.event),
            params.convId,
            params.convType
          );
          break;

        default:
          break;
      }
    });
  }
  private onCustomEvent(params: any): void {
    chatlog.log(`${ChatClient.TAG}: onCustomEvent: `, params);
    this._customListeners.forEach((element) => {
      element.onDataReceived(params);
    });
  }
  private onOfflineMessageSyncStart(): void {
    chatlog.log(`${ChatClient.TAG}: onOfflineMessageSyncStart: `);
    this._connectionListeners.forEach((element) => {
      element.onOfflineMessageSyncStart?.();
    });
  }
  private onOfflineMessageSyncFinish(): void {
    chatlog.log(`${ChatClient.TAG}: onOfflineMessageSyncFinish: `);
    this._connectionListeners.forEach((element) => {
      element.onOfflineMessageSyncFinish?.();
    });
  }
  private onDataSyncStart(params: any): void {
    chatlog.log(`${ChatClient.TAG}: onDataSyncStart: `, params);
    this._connectionListeners.forEach((element) => {
      element.onDataSyncStart?.(params.type as ChatDataSyncType);
    });
  }
  private onDataSyncFinish(params: any): void {
    chatlog.log(`${ChatClient.TAG}: onDataSyncFinish: `, params);
    this._connectionListeners.forEach((element) => {
      element.onDataSyncFinish?.(
        params.type as ChatDataSyncType,
        params.errorCode as number
      );
    });
  }
  private onDatabaseOpened(params: any): void {
    chatlog.log(`${ChatClient.TAG}: onDatabaseOpened: `, params);
    this._connectionListeners.forEach((element) => {
      element.onDatabaseOpened?.(
        params.username as string,
        params.errorCode as number
      );
    });
  }

  private reset(): void {
    chatlog.log(`${ChatClient.TAG}: reset: `);
    this._currentUsername = '';
  }

  public get version() {
    chatlog.log(`${ChatClient.TAG}: version: `, this._rnSdkVersion);
    return this._rnSdkVersion;
  }

  /**
   * 获取 SDK 配置项。
   *
   * SDK 选项必填，在初始化时设置。详见 {@link ChatOptions}。
   *
   *
   * @returns SDK 配置信息。
   */
  public get options(): ChatOptions | undefined {
    chatlog.log(`${ChatClient.TAG}: options: `);
    return this._options;
  }

  /**
   * 获取当前登录用户的用户 ID。
   *
   * **注意**
   *
   * 成功登录后有效。
   *
   * 该方法获取内存保存的用户 ID，该数据在登入、登出和断网重连时更新。你可以调用 {@link getCurrentUsername} 从服务器中获取最新数据。
   *
   * @returns 当前登录用户的用户 ID。
   */
  public get currentUserName(): string {
    chatlog.log(`${ChatClient.TAG}: currentUserName: `, this._currentUsername);
    return this._currentUsername;
  }

  /**
   * 初始化 SDK。
   *
   * **注意**
   *
   * - SDK 初始化需在主进程中进行；
   * - 执行该方法后才能调用其他方法。
   *
   * @param options SDK 初始化选项，必填，详见 {@link ChatOptions}。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async init(options: ChatOptions): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: init: `, options);
    if (options.appKey && options.appKey.length > 0) {
      this._options = ChatOptions.withAppKey(options); // deep copy
    } else if (options.appId && options.appId.length > 0) {
      this._options = ChatOptions.withAppId(options); // deep copy
    } else {
      throw new ChatError({
        code: 1,
        description: 'appKey or appId is empty.',
      });
    }
    chatlog.enableLog = this._options!.debugModel ?? false;
    chatlog.enableTimestamp = this._options!.logTimestamp ?? true;
    chatlog.tag = this._options!.logTag ?? '[chat]';
    const r = await Native._callMethod(MTinit, { options: this._options });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 检查 SDK 是否连接到 Chat 服务器。
   *
   * @returns SDK 是否连接到 Chat 服务器。
   *         - `true`：是。
   *         - `false`：否。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async isConnected(): Promise<boolean> {
    chatlog.log(`${ChatClient.TAG}: isConnected: `);
    const r: any = await Native._callMethod(MTisConnected);
    ChatClient.checkErrorFromResult(r);
    let _connected = r?.[MTisConnected] as boolean;
    return _connected;
  }

  /**
   * 从服务器获取当前登录用户的用户 ID。
   *
   * **注意**
   *
   * 从内存中获取见 {@link currentUserName}。
   *
   * @returns 当前登录用户的用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getCurrentUsername(): Promise<string> {
    let r: any = await Native._callMethod(MTgetCurrentUser);
    ChatClient.checkErrorFromResult(r);
    let userName = r?.[MTgetCurrentUser] as string;
    if (userName && userName.length !== 0) {
      if (userName !== this._currentUsername) {
        this._currentUsername = userName;
      }
    }
    chatlog.log(
      `${ChatClient.TAG}: getCurrentUsername: `,
      this._currentUsername
    );
    return this._currentUsername;
  }

  /**
   * 获取登录 token。
   *
   * @returns 登录 token。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getAccessToken(): Promise<string> {
    chatlog.log(`${ChatClient.TAG}: getAccessToken: `);
    let r: any = await Native._callMethod(MTgetToken);
    ChatClient.checkErrorFromResult(r);
    let _token = r?.[MTgetToken] as string;
    return _token;
  }

  /**
   * 通过用户ID和token登录。
   *
   *
   * 请关注token过期回调通知: {@link ChatConnectEventListener.onTokenWillExpire} 和 {@link ChatConnectEventListener.onTokenDidExpire}.
   *
   * @param userId  用户ID.
   * @param token  用户token.
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async loginWithToken(userId: string, token: string): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: loginWithToken: `, userId, '******', false);
    let r: any = await Native._callMethod(MTlogin, {
      [MTlogin]: {
        username: userId,
        pwdOrToken: token,
        isPassword: false,
      },
    });
    ChatClient.checkErrorFromResult(r);
    const rr = r?.[MTlogin];
    if (rr && rr.username) {
      this._currentUsername = rr.username;
      chatlog.log(`${ChatClient.TAG}: login: ${rr?.username}, ${rr?.token}`);
    }
  }

  /**
   * 更新 token。
   *
   * **注意**
   *
   * 使用 token 登录时，如果通过 {@link ChatConnectEventListener} 回调收到 token 即将过期的通知，可以调用该方法更新 token，避免 token 失效导致异常。
   *
   * @param token 新 token。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async renewToken(token: string): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: renewToken: `, '******');
    let r: any = await Native._callMethod(MTrenewToken, {
      [MTrenewToken]: {
        token: token,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 退出登录。
   *
   * @param unbindDeviceToken 登出时是否解绑 token。该参数仅对移动平台有效。
   * - (默认) `true`：是。
   * - `false`：否。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async logout(unbindDeviceToken: boolean = true): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: logout: `, unbindDeviceToken);
    let r: any = await Native._callMethod(MTlogout, {
      [MTlogout]: {
        unbindToken: unbindDeviceToken,
      },
    });
    ChatClient.checkErrorFromResult(r);
    this.reset();
  }

  /**
   * 修改 App Key。
   *
   * App Key 是用户访问 chat 服务时的唯一标识符。
   *
   * **注意**
   *
   * - App Key 用于控制对你的 app 的 Chat 服务的访问，只有在未登录状态才能修改 App Key。
   *
   * - 修改 App Key 是为了方便你切换到其他 App Key。
   *
   * - 你可以在 Console 上获取 App Key。
   *
   * - 你也可以用 {@link ChatOptions#appKey} 设置 App Key。
   *
   * @param newAppKey 新的 App Key，必填。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async changeAppKey(newAppKey: string): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: changeAppKey: `, newAppKey);
    if (newAppKey === undefined || newAppKey.length === 0) {
      throw new Error('appKey is empty.');
    }
    let r: any = await Native._callMethod(MTchangeAppKey, {
      [MTchangeAppKey]: {
        appKey: newAppKey,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 更新 app iD。
   *
   * **注意**
   *
   * - 需要不登录的状态下使用，如果登录请使用 {@link logout} 退出.
   *
   * @param newAppId 新的 App ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async changeAppId(newAppId: string): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: changeAppId: `, newAppId);
    if (newAppId === undefined || newAppId.length === 0) {
      throw new Error('appId is empty.');
    }
    let r: any = await Native._callMethod(MTchangeAppId, {
      [MTchangeAppId]: {
        appId: newAppId,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 压缩日志文件。
   *
   * **注意**
   *
   * 强烈建议方法完成之后删除该压缩文件。
   *
   * @returns 压缩后的日志文件路径。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async compressLogs(): Promise<string | undefined> {
    chatlog.log(`${ChatClient.TAG}: compressLogs:`);
    let r: any = await Native._callMethod(MTcompressLogs);
    ChatClient.checkErrorFromResult(r);
    return r?.[MTcompressLogs];
  }

  /**
   * 获取指定账号下登录的在线设备列表。
   *
   * @param userId 用户 ID。
   * @param token 用户 token，详见 {@link getAccessToken}。
   * @returns 登录的在线设备列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getLoggedInDevicesFromServer(
    userId: string,
    token: string
  ): Promise<Array<ChatDeviceInfo>> {
    chatlog.log(
      `${ChatClient.TAG}: getLoggedInDevicesFromServer: `,
      userId,
      '******'
    );
    let r: any = await Native._callMethod(MTgetLoggedInDevicesFromServer, {
      [MTgetLoggedInDevicesFromServer]: {
        username: userId,
        token: token,
      },
    });
    ChatClient.checkErrorFromResult(r);
    let ret: ChatDeviceInfo[] = [];
    let list: Array<any> = r?.[MTgetLoggedInDevicesFromServer];
    if (list) {
      list.forEach((element) => {
        ret.push(new ChatDeviceInfo(element));
      });
    }
    return ret;
  }

  /**
   * 将特定账号登录的指定设备下线。
   *
   * 关于如何获取设备 ID，详见 {@link ChatDeviceInfo#resource}。
   *
   * @param userId 用户 ID。
   * @param token 用户 token，详见 {@link getAccessToken}。
   * @param resource 设备 ID，详见 {@link ChatDeviceInfo#resource}。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async kickDevice(
    userId: string,
    token: string,
    resource: string
  ): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: kickDevice: `, userId, '******', resource);
    let r: any = await Native._callMethod(MTkickDevice, {
      [MTkickDevice]: {
        username: userId,
        token: token,
        resource: resource,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 将指定账号登录的所有设备都踢下线。
   *
   * @param userId 用户 ID。
   * @param token 用户 token，详见 {@link getAccessToken}。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async kickAllDevices(userId: string, token: string): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: kickAllDevices: `, userId, '******');
    let r: any = await Native._callMethod(MTkickAllDevices, {
      [MTkickAllDevices]: {
        username: userId,
        token: token,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 绑定设备的推送 token。
   *
   * @param params 参数。
   * - `deviceToken`：平台推送服务上报的推送 token。
   * - `notifierName`：平台的推送证书名称。Android 平台必填，iOS 平台忽略该参数。
   *   - Android：厂商推送证书名称，例如 FCM Sender ID、华为/荣耀 App ID、小米/魅族 App ID、OPPO App Key 或 vivo `appId#appKey`。该参数不能为空，否则原生 SDK 会返回参数无效错误。
   *   - iOS：不使用该参数。请在 SDK 初始化时通过 {@link ChatOptions.apnsCertName} 设置 APNs 证书名称，因为 App 运行期间无法修改该证书名称。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async bindDeviceToken(params: {
    deviceToken: string;
    notifierName?: string;
  }): Promise<void> {
    chatlog.log(
      `${ChatClient.TAG}: ${this.bindDeviceToken.name}: `,
      params.notifierName
    );
    let r: any = await Native._callMethod(MTbindDeviceToken, {
      [MTbindDeviceToken]: {
        // Keep the key on every platform: iOS ignores it, and Android reports the
        // native invalid-parameter error instead of a missing-key error when it is empty.
        notifierName: params.notifierName ?? '',
        deviceToken: params.deviceToken,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 绑定 Apple PushKit token，用于 VoIP 推送通知。
   *
   * **注意** 该方法仅在 iOS 平台可用，在其他平台调用不会有任何效果。
   *
   * @param params
   * - deviceToken: `PKPushRegistry` 上报的 PushKit token，为十六进制字符串。
   *
   * **注意** 初始化 SDK 时必须通过 {@link ChatOptions.pushKitCertName} 设置 PushKit 证书名称，因为证书名称在 App 运行期间不可更改。
   *
   * **注意** native SDK 会在绑定前缓存该 token：如果当前用户尚未登录，本次调用会抛出 {@link ChatError} 失败，但 token 仍会被缓存，并在下次登录成功后自动绑定。{@link ChatClient.logout} 的 `unbindDeviceToken` 设为 `true` 时也会解绑 PushKit token。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async bindPushKitToken(params: {
    deviceToken: string;
  }): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: ${this.bindPushKitToken.name}`);
    if (Platform.OS !== 'ios') {
      return;
    }
    let r: any = await Native._callMethod(MTbindPushKitToken, {
      [MTbindPushKitToken]: {
        deviceToken: params.deviceToken,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 解绑通过 {@link ChatClient.bindPushKitToken} 绑定的 Apple PushKit token。
   *
   * **注意** 该方法仅在 iOS 平台可用，在其他平台调用不会有任何效果。
   *
   * {@link ChatClient.logout} 的 `unbindDeviceToken` 设为 `true` 时已经会解绑 PushKit token，因此只有在需要保持当前用户登录状态的同时解绑 token 时，才调用该方法。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async unbindPushKitToken(): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: ${this.unbindPushKitToken.name}`);
    if (Platform.OS !== 'ios') {
      return;
    }
    let r: any = await Native._callMethod(MTunbindPushKitToken);
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 根据频道名称（channelName）获取与 Agora Chat 用户 ID 匹配的声网 RTC token、token 过期时间和 RTC UID。
   *
   * 调用此 API 之前必须启用声网 RTC 功能。
   *
   * 如果频道名称设置为 null，将生成对所有频道有效的 RTC token。
   *
   * 这是一个异步方法。
   *
   * @param channelName 声网 RTC 频道名称。
   * @returns RTC token 信息。详见 {@link ChatRTCTokenInfo}。
   *
   * @throws 异常描述。详见 {@link ChatError}。
   */
  public async getRTCTokenInfoWithChannelName(
    channelName: string
  ): Promise<ChatRTCTokenInfo> {
    chatlog.log(
      `${ChatClient.TAG}: getRTCTokenInfoWithChannelName: `,
      channelName
    );
    let r: any = await Native._callMethod(MTgetRTCTokenInfoWithChannelName, {
      [MTgetRTCTokenInfoWithChannelName]: {
        channelName: channelName,
      },
    });
    ChatClient.checkErrorFromResult(r);
    const params = r?.[MTgetRTCTokenInfoWithChannelName];
    return new ChatRTCTokenInfo({ ...params });
  }

  /**
   * 获取与声网 RTC UID 匹配的 Agora Chat 用户 ID。
   *
   * @param ids 声网 RTC UID 列表。
   * @returns 声网 RTC UID 和 Agora Chat 用户 ID 的映射关系。
   *
   * @throws 异常描述。详见 {@link ChatError}。
   */
  public async getUserIdsWithRTCUids(
    ids: Array<number>
  ): Promise<Map<number, string>> {
    chatlog.log(`${ChatClient.TAG}: getUserIdsWithRTCUids: `, ids);
    let r: any = await Native._callMethod(MTgetUserIdsWithRTCUids, {
      [MTgetUserIdsWithRTCUids]: {
        rtcUids: ids,
      },
    });
    ChatClient.checkErrorFromResult(r);
    const ret: Map<number, string> = new Map();
    Object.entries(r?.[MTgetUserIdsWithRTCUids]).forEach((v: [string, any]) => {
      ret.set(Number(v[0]), v[1]);
    });
    return ret;
  }

  /**
   * 添加连接状态监听器。
   *
   * @param listener 要添加的连接状态监听器。
   */
  public addConnectionListener(listener: ChatConnectEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addConnectionListener: `);
    this._connectionListeners.add(listener);
  }

  /**
   *  移除连接状态监听器。
   *
   *  @param listener 要移除的连接状态监听器。
   */
  public removeConnectionListener(listener: ChatConnectEventListener): void {
    chatlog.log(`${ChatClient.TAG}: removeConnectionListener: `);
    this._connectionListeners.delete(listener);
  }

  /**
   *  移除所有连接状态监听器。
   */
  public removeAllConnectionListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllConnectionListener: `);
    this._connectionListeners.clear();
  }

  /**
   *  添加多设备监听器。
   *
   *  @param listener 要添加的多设备监听器。
   */
  public addMultiDeviceListener(listener: ChatMultiDeviceEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addMultiDeviceListener: `);
    this._multiDeviceListeners.add(listener);
  }

  /**
   *  移除指定多设备监听器。
   *
   *  @param listener 要移除的多设备监听器。
   */
  public removeMultiDeviceListener(
    listener: ChatMultiDeviceEventListener
  ): void {
    chatlog.log(`${ChatClient.TAG}: removeMultiDeviceListener: `);
    this._multiDeviceListeners.delete(listener);
  }

  /**
   *  移除所有多设备监听器。
   */
  public removeAllMultiDeviceListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllMultiDeviceListener: `);
    this._multiDeviceListeners.clear();
  }

  /**
   *  添加自定义监听器，接收 Android 或者 iOS 设备发到 React Native 层的数据。
   *
   *  @param listener 要添加的自定义监听器。
   */
  public addCustomListener(listener: ChatCustomEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addCustomListener: `);
    this._customListeners.add(listener);
  }

  /**
   *  移除自定义监听，不再接收 Android 或者 iOS 设备发到 React Native 层的数据。
   *
   *  @param listener 要移除的自定义监听器。
   */
  public removeCustomListener(listener: ChatCustomEventListener): void {
    chatlog.log(`${ChatClient.TAG}: removeCustomListener: `);
    this._customListeners.delete(listener);
  }

  /**
   *  移除所有自定义监听器。
   */
  public removeAllCustomListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllCustomListener: `);
    this._customListeners.clear();
  }

  /**
   * 增加错误监听器。
   *
   * 接收异常通知。
   */
  public addExceptListener(listener: ChatExceptionEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addExceptListener: `);
    ExceptionHandler.getInstance().listeners.add(listener);
  }

  /**
   * 移除错误监听器。
   */
  public removeExceptListener(listener: ChatExceptionEventListener): void {
    chatlog.log(`${ChatClient.TAG}: removeExceptListener: `);
    ExceptionHandler.getInstance().listeners.delete(listener);
  }

  /**
   * 移除所有错误监听器。
   */
  public removeAllExceptListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllExceptListener: `);
    ExceptionHandler.getInstance().listeners.clear();
  }

  /**
   * 获取聊天管理器对象
   *
   * 需要初始化之后才能够使用。
   *
   * @returns 管理器对象
   */
  public get chatManager(): ChatManager {
    return this._chatManager;
  }

  /**
   * 获取群组管理器类。
   *
   * 该方法只能在 Chat 客户端初始化之后调用。
   *
   *  @returns 群组管理器类。
   */
  public get groupManager(): ChatGroupManager {
    return this._groupManager;
  }

  /**
   * 获取联系人管理器类。
   *
   * 该方法只能在 Chat 客户端初始化之后调用。
   *
   *  @returns 联系人管理器类。
   */
  public get contactManager(): ChatContactManager {
    return this._contactManager;
  }

  /**
   * 获取推送管理器类。
   *
   * 该方法只能在 Chat 客户端初始化之后调用。
   *
   *  @returns 推送管理器类。
   */
  public get pushManager(): ChatPushManager {
    return this._pushManager;
  }

  /**
   * 获取用户信息管理器类。
   *
   * 该方法只能在 Chat 客户端初始化之后调用。
   *
   *  @returns 用户信息管理器类。
   */
  public get userManager(): ChatUserInfoManager {
    return this._userInfoManager;
  }

  /**
   * 获取聊天室管理器类。
   *
   * 该方法只能在 Chat 客户端初始化之后调用。
   *
   *  @returns 聊天室管理器类。
   */
  public get roomManager(): ChatRoomManager {
    return this._chatRoomManager;
  }

  /**
   * 获取在线状态管理器类。
   *
   * 该方法只能在 Chat 客户端初始化之后调用。
   *
   *  @returns 在线状态管理器类。
   */
  public get presenceManager(): ChatPresenceManager {
    return this._presenceManager;
  }
}
