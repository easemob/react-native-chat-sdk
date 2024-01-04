import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

import { BaseManager } from './__internal__/Base';
import {
  MTchangeAppKey,
  MTcompressLogs,
  MTcreateAccount,
  MTgetCurrentUser,
  MTgetLoggedInDevicesFromServer,
  MTgetToken,
  MTinit,
  MTisConnected,
  MTisLoggedInBefore,
  MTkickAllDevices,
  MTkickDevice,
  MTlogin,
  MTloginWithAgoraToken,
  MTlogout,
  MTonAppActiveNumberReachLimit,
  MTonConnected,
  MTonCustomEvent,
  MTonDisconnected,
  MTonMultiDeviceEvent,
  MTonMultiDeviceEventContact,
  MTonMultiDeviceEventConversation,
  MTonMultiDeviceEventGroup,
  MTonMultiDeviceEventRemoveMessage,
  MTonMultiDeviceEventThread,
  MTonTokenDidExpire,
  MTonTokenWillExpire,
  MTonUserAuthenticationFailed,
  MTonUserDidChangePassword,
  MTonUserDidForbidByServer,
  MTonUserDidLoginFromOtherDevice,
  MTonUserDidLoginTooManyDevice,
  MTonUserDidRemoveFromServer,
  MTonUserKickedByOtherDevice,
  MTrenewToken,
  MTupdatePushConfig,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import { ChatContactManager } from './ChatContactManager';
import {
  ChatConnectEventListener,
  ChatCustomEventListener,
  ChatMultiDeviceEventFromNumber,
  ChatMultiDeviceEventListener,
} from './ChatEvents';
import { ChatGroupManager } from './ChatGroupManager';
import { ChatManager } from './ChatManager';
import { ChatPresenceManager } from './ChatPresenceManager';
import { ChatPushManager } from './ChatPushManager';
import { ChatRoomManager } from './ChatRoomManager';
import { ChatUserInfoManager } from './ChatUserInfoManager';
import { chatlog } from './common/ChatConst';
import { ChatDeviceInfo } from './common/ChatDeviceInfo';
import { ChatError } from './common/ChatError';
import { ChatOptions } from './common/ChatOptions';
import { ChatPushConfig } from './common/ChatPushConfig';

const LINKING_ERROR =
  `The package 'react-native-chat-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const ExtSdkApiRN = NativeModules.ExtSdkApiRN
  ? NativeModules.ExtSdkApiRN
  : new Proxy(
      {},
      {
        get() {
          throw new ChatError({ code: 1, description: LINKING_ERROR });
        },
      }
    );
const eventEmitter = new NativeEventEmitter(ExtSdkApiRN);
chatlog.log('eventEmitter: ', eventEmitter);

/**
 * Chat 客户端类。该类是 Chat SDK 的入口，负责登录、登出及管理 SDK 与 chat 服务器之间的连接。
 */
export class ChatClient extends BaseManager {
  public static eventType = 2; // 1.remove 2.subscription(suggested)
  protected static TAG = 'ChatClient';
  private static _instance: ChatClient;
  private _connectionSubscriptions: Map<string, EmitterSubscription>;
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
  private readonly _sdkVersion: string = '4.0.0';
  private readonly _rnSdkVersion: string = '1.1.0';
  private _isInit: boolean = false;
  private _currentUsername: string = '';

  private constructor() {
    super();

    this._chatManager = new ChatManager();
    this._groupManager = new ChatGroupManager();
    this._contactManager = new ChatContactManager();
    this._chatRoomManager = new ChatRoomManager();
    this._pushManager = new ChatPushManager();
    this._userInfoManager = new ChatUserInfoManager();
    this._presenceManager = new ChatPresenceManager();

    this._connectionListeners = new Set<ChatConnectEventListener>();
    this._connectionSubscriptions = new Map<string, EmitterSubscription>();

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
        value: EmitterSubscription,
        key: string,
        map: Map<string, EmitterSubscription>
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
      MTonUserDidLoginFromOtherDevice,
      event.addListener(
        MTonUserDidLoginFromOtherDevice,
        this.onUserDidLoginFromOtherDevice.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonUserDidRemoveFromServer,
      event.addListener(
        MTonUserDidRemoveFromServer,
        this.onUserDidRemoveFromServer.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonUserDidForbidByServer,
      event.addListener(
        MTonUserDidForbidByServer,
        this.onUserDidForbidByServer.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonUserDidChangePassword,
      event.addListener(
        MTonUserDidChangePassword,
        this.onUserDidChangePassword.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonUserDidLoginTooManyDevice,
      event.addListener(
        MTonUserDidLoginTooManyDevice,
        this.onUserDidLoginTooManyDevice.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonUserKickedByOtherDevice,
      event.addListener(
        MTonUserKickedByOtherDevice,
        this.onUserKickedByOtherDevice.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonUserAuthenticationFailed,
      event.addListener(
        MTonUserAuthenticationFailed,
        this.onUserAuthenticationFailed.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MTonAppActiveNumberReachLimit,
      event.addListener(
        MTonAppActiveNumberReachLimit,
        this.onAppActiveNumberReachLimit.bind(this)
      )
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
    this._connectionListeners.forEach((element) => {
      // let ec = params?.errorCode as number;
      element.onDisconnected?.();
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
  private onUserDidLoginFromOtherDevice(params: any): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidLoginFromOtherDevice: `);
    this._connectionListeners.forEach((element) => {
      const deviceName = params.deviceName as string | undefined;
      element.onUserDidLoginFromOtherDevice?.(deviceName);
    });
  }
  private onUserDidRemoveFromServer(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidRemoveFromServer: `);
    this._connectionListeners.forEach((element) => {
      element.onUserDidRemoveFromServer?.();
    });
  }
  private onUserDidForbidByServer(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidForbidByServer: `);
    this._connectionListeners.forEach((element) => {
      element.onUserDidForbidByServer?.();
    });
  }
  private onUserDidChangePassword(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidChangePassword: `);
    this._connectionListeners.forEach((element) => {
      element.onUserDidChangePassword?.();
    });
  }
  private onUserDidLoginTooManyDevice(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidLoginTooManyDevice: `);
    this._connectionListeners.forEach((element) => {
      element.onUserDidLoginTooManyDevice?.();
    });
  }
  private onUserKickedByOtherDevice(): void {
    chatlog.log(`${ChatClient.TAG}: onUserKickedByOtherDevice: `);
    this._connectionListeners.forEach((element) => {
      element.onUserKickedByOtherDevice?.();
    });
  }
  private onUserAuthenticationFailed(): void {
    chatlog.log(`${ChatClient.TAG}: onUserAuthenticationFailed: `);
    this._connectionListeners.forEach((element) => {
      element.onUserAuthenticationFailed?.();
    });
  }
  private onAppActiveNumberReachLimit(): void {
    chatlog.log(`${ChatClient.TAG}: onAppActiveNumberReachLimit: `);
    this._connectionListeners.forEach((element) => {
      element.onAppActiveNumberReachLimit?.();
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
    if (options.appKey === undefined || options.appKey.length === 0) {
      throw new Error('appKey is empty.');
    }
    this._options = new ChatOptions(options); // deep copy
    chatlog.enableLog = options.debugModel ?? false;
    chatlog.enableTimestamp = options.logTimestamp ?? true;
    chatlog.tag = options.logTag ?? '[chat]';
    const r = await Native._callMethod(MTinit, { options });
    ChatClient.checkErrorFromResult(r);
    this._isInit = true;
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
   * 检查当前用户是否登录。
   *
   * **注意**
   *
   * 在初始化之后和登录之前调用该方法。
   *
   * @returns 当前用户是否登录。
   *         - `true`：已登录。自动登录时，成功登录前返回 `true`，其他情况下返回 `false`。
   *         - `false`：未登录。非自动登录时，返回 `false`。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async isLoginBefore(): Promise<boolean> {
    chatlog.log(`${ChatClient.TAG}: isLoginBefore: `);
    let r: any = await Native._callMethod(MTisLoggedInBefore);
    ChatClient.checkErrorFromResult(r);
    let _isLoginBefore = r?.[MTisLoggedInBefore] as boolean;
    return _isLoginBefore;
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
   * 注册新用户（开放注册）。
   *
   * **注意**
   *
   * 注册新用户有两种方式：
   *
   * - 开放注册：客户端直接注册新用户，不建议在正式环境使用。
   *   如调用失败可联系商务申请使用该接口。
   *
   * - 授权注册：可调用 REST API 注册新用户，然后保存到服务器或者发送到客户端使用。
   *
   * @param userId 用户 ID。
   *                 该参数必填。用户 ID 不能超过 64 个字符，支持以下类型的字符：
   *                 - 26 个小写英文字母 a-z
   *                 - 26 个大写英文字母 A-Z
   *                 - 10 个数字 0-9
   *                 - "_", "-", "."
   *
   *                 用户 ID 不区分大小写，大写字母会自动转换为小写字母。
   *
   *                 用户的电子邮件地址和 UUID 不能作为用户 ID。
   *
   *                 可通过以下格式的正则表达式设置用户 ID：^[a-zA-Z0-9_-]+$。
   *
   * @param password 密码，长度不超过 64 个字符。该参数必填。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async createAccount(userId: string, password: string): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: createAccount: `, userId, '******');
    let r: any = await Native._callMethod(MTcreateAccount, {
      [MTcreateAccount]: {
        username: userId,
        password: password,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 通过密码或环信 token 登录 Chat 服务器。
   *
   * **注意**
   *
   * 如果利用环信 token 登录，可通过以下方式获取 token：
   * - SDK 接口：详见 {@link createAccount} 或 {@link getAccessToken}。
   * - 环信 console 后台：{@url https://console.easemob.com/app/applicationOverview/userManagement}。
   *
   *  Token 过期提醒通过 {@link ChatConnectEventListener.onTokenWillExpire} 和 {@link ChatConnectEventListener.onTokenDidExpire} 通知。
   *
   * @param userId    用户 ID。详见 {@link createAccount}。
   * @param pwdOrToken  密码或环信 token，详见 {@link createAccount} 或者 {@link getAccessToken}。
   * @param isPassword  是否通过 token 登录。
   *                    - `true`: 通过 token 登录。
   *                    - （默认）`false`: 通过密码登录。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async login(
    userId: string,
    pwdOrToken: string,
    isPassword: boolean = true
  ): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: login: `, userId, '******', isPassword);
    let r: any = await Native._callMethod(MTlogin, {
      [MTlogin]: {
        username: userId,
        pwdOrToken: pwdOrToken,
        isPassword: isPassword,
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
   * @deprecated 2023-11-17 使用 {@link login} 代替。
   *
   * 使用用户 ID 和声网 token 登录。
   *
   * **注意**
   *
   * 该方法支持自动登录。
   *
   * @param userId 用户 ID，详见 {@link createAccount}。
   * @param agoraToken 声网 token。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async loginWithAgoraToken(
    userId: string,
    agoraToken: string
  ): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: loginWithAgoraToken: `, userId, '******');
    let r: any = await Native._callMethod(MTloginWithAgoraToken, {
      [MTloginWithAgoraToken]: {
        username: userId,
        agoratoken: agoraToken,
      },
    });
    ChatClient.checkErrorFromResult(r);
    const rr = r?.[MTloginWithAgoraToken];
    if (rr && rr.username) {
      this._currentUsername = rr.username;
      chatlog.log(`${ChatClient.TAG}: loginA: ${rr?.username}, ${rr?.token}`);
    }
  }

  /**
   * 更新声网 token。
   *
   * **注意**
   *
   * 当用户利用声网 token 登录的情况下在 {@link ChatConnectEventListener} 实现类中收到 token 即将过期事件的回调通知时，可以调用该方法更新 token，避免因 token 失效产生的未知问题。
   *
   * @param agoraToken 新的声网 token。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async renewAgoraToken(agoraToken: string): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: renewAgoraToken: `, '******');
    let r: any = await Native._callMethod(MTrenewToken, {
      [MTrenewToken]: {
        agora_token: agoraToken,
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
   * @param password 密码。
   * @returns 登录的在线设备列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getLoggedInDevicesFromServer(
    userId: string,
    pwdOrToken: string,
    isPassword?: boolean
  ): Promise<Array<ChatDeviceInfo>> {
    chatlog.log(
      `${ChatClient.TAG}: getLoggedInDevicesFromServer: `,
      userId,
      '******'
    );
    let r: any = await Native._callMethod(MTgetLoggedInDevicesFromServer, {
      [MTgetLoggedInDevicesFromServer]: {
        username: userId,
        password: pwdOrToken,
        isPassword: isPassword ?? true,
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
   * @param pwdOrToken 密码或 token。
   * @param resource 设备 ID，详见 {@link ChatDeviceInfo#resource}。
   * @param isPassword 是否使用密码登录设备：
   * - （默认）`true`：使用密码；
   * - `false`：使用用户 token。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async kickDevice(
    userId: string,
    pwdOrToken: string,
    resource: string,
    isPassword?: boolean
  ): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: kickDevice: `, userId, '******', resource);
    let r: any = await Native._callMethod(MTkickDevice, {
      [MTkickDevice]: {
        username: userId,
        password: pwdOrToken,
        resource: resource,
        isPassword: isPassword ?? true,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 将指定账号登录的所有设备都踢下线。
   *
   * @param userId 用户 ID。
   * @param password 密码。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async kickAllDevices(
    userId: string,
    pwdOrToken: string,
    isPassword?: boolean
  ): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: kickAllDevices: `, userId, '******');
    let r: any = await Native._callMethod(MTkickAllDevices, {
      [MTkickAllDevices]: {
        username: userId,
        password: pwdOrToken,
        isPassword: isPassword ?? true,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * 更新推送设置。
   *
   * **注意**
   * 对于 iOS 设备需在初始化 SDK 时录入设备 ID，否则设置不会成功，详见 {@link ChatClient#init}。
   *
   * @param config 推送设置，详见 {@link ChatPushConfig}。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async updatePushConfig(config: ChatPushConfig): Promise<void> {
    chatlog.log(
      `${ChatClient.TAG}: updatePushConfig: ${JSON.stringify(config)}`
    );
    if (this._options) {
      this._options.pushConfig = new ChatPushConfig(this._options.pushConfig); // deep copy
      if (config.deviceId) {
        this._options.pushConfig.deviceId = config.deviceId;
      }
      if (config.deviceToken) {
        this._options.pushConfig.deviceToken = config.deviceToken;
      }
    }
    let r: any = await Native._callMethod(MTupdatePushConfig, {
      [MTupdatePushConfig]: {
        config: config,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * 设置连接状态监听器。
   *
   *  @param listener 要添加的连接状态监听器。
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
   * 获取聊天管理器类。
   *
   * 该方法只能在 Chat 客户端初始化之后调用。
   *
   *  @returns 聊天管理器类。
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
