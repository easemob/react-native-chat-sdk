import {
  EmitterSubscription,
  EventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import { ChatContactManager } from './ChatContactManager';
import {
  ChatConnectEventListener,
  ChatMultiDeviceEventFromNumber,
  ChatCustomEventListener,
  ChatMultiDeviceEventListener,
} from './ChatEvents';
import { ChatGroupManager } from './ChatGroupManager';
import { ChatManager } from './ChatManager';
import { ChatPresenceManager } from './ChatPresenceManager';
import { ChatPushManager } from './ChatPushManager';
import { ChatRoomManager } from './ChatRoomManager';
import { ChatUserInfoManager } from './ChatUserInfoManager';
import { ChatDeviceInfo } from './common/ChatDeviceInfo';
import { ChatError } from './common/ChatError';
import { chatlog } from './common/ChatLog';
import { ChatOptions } from './common/ChatOptions';
import { ChatPushConfig } from './common/ChatPushConfig';
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
  MTonConnected,
  MTonDisconnected,
  MTonMultiDeviceEvent,
  MTonCustomEvent,
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
 * The chat client class, which is the entry of the chat SDK. It defines how to log in to and log out of the chat app and how to manage the connection between the SDK and the chat server.
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

  public getEventEmitter(): EventEmitter {
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
  private _sdkVersion: string = '4.0.0';
  private _rnSdkVersion: string = '1.1.0';
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
      let ec = params?.errorCode as number;
      element.onDisconnected?.(ec);
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
      let event = params?.event as number;
      if (event < 10) {
        element.onContactEvent?.(
          ChatMultiDeviceEventFromNumber(event),
          params.target,
          params.ext
        );
      } else if (event >= 10 && event < 40) {
        element.onGroupEvent?.(
          ChatMultiDeviceEventFromNumber(event),
          params.target,
          params.ext
        );
      } else {
        element.onThreadEvent?.(
          ChatMultiDeviceEventFromNumber(event),
          params.target,
          params.ext
        );
      }
    });
  }
  private onCustomEvent(params: any): void {
    chatlog.log(`${ChatClient.TAG}: onCustomEvent: `, params);
    this._customListeners.forEach((element) => {
      element.onDataReceived(params);
    });
  }
  private onUserDidLoginFromOtherDevice(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidLoginFromOtherDevice: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected?.(206);
    });
  }
  private onUserDidRemoveFromServer(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidRemoveFromServer: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected?.(207);
    });
  }
  private onUserDidForbidByServer(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidForbidByServer: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected?.(305);
    });
  }
  private onUserDidChangePassword(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidChangePassword: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected?.(216);
    });
  }
  private onUserDidLoginTooManyDevice(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidLoginTooManyDevice: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected?.(214);
    });
  }
  private onUserKickedByOtherDevice(): void {
    chatlog.log(`${ChatClient.TAG}: onUserKickedByOtherDevice: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected?.(217);
    });
  }
  private onUserAuthenticationFailed(): void {
    chatlog.log(`${ChatClient.TAG}: onUserAuthenticationFailed: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected?.(202);
    });
  }

  private reset(): void {
    chatlog.log(`${ChatClient.TAG}: reset: `);
    this._currentUsername = '';
  }

  /**
   * Gets the SDK configurations.
   *
   * Ensure that you set the SDK options during initialization. See {@link ChatOptions}.
   *
   * @returns The SDK configurations.
   */
  public get options(): ChatOptions | undefined {
    chatlog.log(`${ChatClient.TAG}: options: `);
    return this._options;
  }

  /**
   * Gets the current logged-in user ID.
   *
   * **Note**
   *
   * The user ID for successful login is valid.
   *
   * The user ID is obtained from the memory and updated in the case of login, logout, and reconnection upon disconnection. You can call {@link getCurrentUsername} to get the latest data from the server.
   *
   * @returns The current logged-in user ID.
   */
  public get currentUserName(): string {
    chatlog.log(`${ChatClient.TAG}: currentUserName: `, this._currentUsername);
    return this._currentUsername;
  }

  /**
   * Initializes the SDK.
   *
   * **Note**
   *
   * - Make sure to initialize the SDK in the main thread.
   * - This method must be called before any other methods are called.
   *
   * @param options The options for SDK initialization. Ensure that you set the options. See {@link ChatOptions}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async init(options: ChatOptions): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: init: `, options);
    if (options.appKey === undefined || options.appKey.length === 0) {
      throw new Error('appKey is empty.');
    }
    this._options = new ChatOptions(options); // deep copy
    chatlog.enableLog = options.debugModel ?? false;
    const r = await Native._callMethod(MTinit, { options });
    ChatClient.checkErrorFromResult(r);
    this._isInit = true;
  }

  /**
   * Checks whether the SDK is connected to the chat server.
   *
   * @returns Whether the SDK is connected to the chat server.
   *         - `true`: Yes.
   *         - `false`: No.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async isConnected(): Promise<boolean> {
    chatlog.log(`${ChatClient.TAG}: isConnected: `);
    const r: any = await Native._callMethod(MTisConnected);
    ChatClient.checkErrorFromResult(r);
    let _connected = r?.[MTisConnected] as boolean;
    return _connected;
  }

  /**
   * Gets the current logged-in user ID from the server.
   *
   * **Note**
   *
   * To get the current logged-in user ID from the memory, see {@link currentUserName}.
   *
   * @returns The logged-in user ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Checks whether the current user is logged in to the app.
   *
   * **Note**
   *
   * This method needs to be called after initialization and before login.
   *
   * @returns Whether the user is logged in to the app:
   *          - `true`: The user is logged in to the app. In automatic login mode, the SDK returns `true` before successful login and `false` otherwise.
   *          - `false`: The user is not logged in to the app. In non-automatic login mode, the SDK returns `false`.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async isLoginBefore(): Promise<boolean> {
    chatlog.log(`${ChatClient.TAG}: isLoginBefore: `);
    let r: any = await Native._callMethod(MTisLoggedInBefore);
    ChatClient.checkErrorFromResult(r);
    let _isLoginBefore = r?.[MTisLoggedInBefore] as boolean;
    return _isLoginBefore;
  }

  /**
   * Gets the token for login.
   *
   * @returns The token for login.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getAccessToken(): Promise<string> {
    chatlog.log(`${ChatClient.TAG}: getAccessToken: `);
    let r: any = await Native._callMethod(MTgetToken);
    ChatClient.checkErrorFromResult(r);
    let _token = r?.[MTgetToken] as string;
    return _token;
  }

  /**
   * Creates a new user (open registration).
   *
   * **Note**
   *
   * There are two registration modes:
   *
   * - Open registration: This mode is for testing use, but not recommended in a formal environment;
   *   If a call failure occurs, you can contact our business manager.
   *
   * - Authorized registration: You can create a new user through a REST API, and then save it to your server or return it to the client.
   *
   * @param username The user ID.
   *                 Ensure that you set this parameter. The user ID can be a maximum of 64 characters of the following types:
   *                 - 26 English letters (a-z)
   *                 - 10 numbers (0-9),
   *                 - "_", "-", "."
   *                 The user ID is case-insensitive, so Aa and aa are the same user ID.
   *                 The email address or the UUID of the user cannot be used as the user ID.
   *                 You can also set this parameter with the regular expression ^[a-zA-Z0-9_-]+$.
   * @param password The password. Ensure that you set this parameter. The password can contain a maximum of 64 characters.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async createAccount(
    username: string,
    password: string
  ): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: createAccount: `, username, '******');
    let r: any = await Native._callMethod(MTcreateAccount, {
      [MTcreateAccount]: {
        username: username,
        password: password,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * Logs in to the chat server with a password or an Easemob token.
   *
   * **Note**
   *
   * If you use an Easemob token to log in to the server, you can get the token in either of the following ways:
   * - Through an SDK API. See {@link createAccount} or {@link getAccessToken}.
   * - Through the console. See {@url https://console.easemob.com/app/applicationOverview/userManagement}.
   *
   * The token expiration reminder is notified by the two callback methods: {@link ChatConnectEventListener.onTokenWillExpire} and {@link ChatConnectEventListener.onTokenDidExpire}.
   *
   * @param userName    The user ID. See {@link createAccount}.
   * @param pwdOrToken  The password or token. See {@link createAccount} or {@link getAccessToken}
   * @param isPassword  Whether to log in with a password or a token.
   *                    - `true`: A token is used.
   *                    - (Default) `false`: A password is used.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async login(
    userName: string,
    pwdOrToken: string,
    isPassword: boolean = true
  ): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: login: `, userName, '******', isPassword);
    let r: any = await Native._callMethod(MTlogin, {
      [MTlogin]: {
        username: userName,
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
   * Logs in to the chat server with the user ID and an Agora token.
   *
   * **Note**
   *
   * The Agora token is different from token {@link login.token} provided by Easemob.
   *
   * This method supports automatic login.
   *
   * @param userName The user ID. See {@link createAccount}.
   * @param agoraToken The Agora token.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async loginWithAgoraToken(
    userName: string,
    agoraToken: string
  ): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: loginWithAgoraToken: `, userName, '******');
    let r: any = await Native._callMethod(MTloginWithAgoraToken, {
      [MTloginWithAgoraToken]: {
        username: userName,
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
   * Renews the Agora token.
   *
   * **Note**
   *
   * If you log in with an Agora token and are notified by the callback method {@link ChatConnectEventListener} that the token is to expire, you can call this method to update the token to avoid unknown issues caused by an invalid token.
   *
   * @param agoraToken The new Agora token.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async renewAgoraToken(agoraToken: string): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: renewAgoraToken: `, '******');
    let r: any = await Native._callMethod(MTrenewToken, {
      [MTrenewToken]: {
        agoraToken: agoraToken,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * Logs out of the chat app.
   *
   * @param unbindDeviceToken Whether to unbind the token upon logout. This parameter is available only to mobile platforms.
   * - (Default) `true`: Yes.
   * - `false`: No.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Updates the App Key, which is the unique identifier used to access the chat service.
   *
   * **Note**
   *
   * - As this key controls access to the chat service for your app, you can only update the key when the current user is logged out.
   *
   * - Updating the App Key means to switch to a new App Key.
   *
   * - You can retrieve the new App Key from the Console.
   *
   * - You can also set an App Key by using the {@link ChatOptions.appKey} method when logged out.
   *
   * @param newAppKey The new App Key. Ensure that you set this parameter.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Compresses the debug log file into a gzip archive.
   *
   * We strongly recommend that you delete this debug archive once it is no longer used.
   *
   * @returns The path of the compressed gzip file.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async compressLogs(): Promise<string | undefined> {
    chatlog.log(`${ChatClient.TAG}: compressLogs:`);
    let r: any = await Native._callMethod(MTcompressLogs);
    ChatClient.checkErrorFromResult(r);
    return r?.[MTcompressLogs];
  }

  /**
   * Gets the list of online devices to which you have logged in with a specified account.
   *
   * @param username The user ID.
   * @param password The password.
   * @returns The list of the online logged-in devices.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getLoggedInDevicesFromServer(
    username: string,
    password: string
  ): Promise<Array<ChatDeviceInfo>> {
    chatlog.log(
      `${ChatClient.TAG}: getLoggedInDevicesFromServer: `,
      username,
      '******'
    );
    let r: any = await Native._callMethod(MTgetLoggedInDevicesFromServer, {
      [MTgetLoggedInDevicesFromServer]: {
        username: username,
        password: password,
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
   * Logs out from a specified account on a device.
   *
   * For how to get the device ID, see {@link ChatDeviceInfo.resource}.
   *
   * @param username The user ID.
   * @param password The password.
   * @param resource The device ID. See {@link ChatDeviceInfo.resource}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async kickDevice(
    username: string,
    password: string,
    resource: string
  ): Promise<void> {
    chatlog.log(
      `${ChatClient.TAG}: kickDevice: `,
      username,
      '******',
      resource
    );
    let r: any = await Native._callMethod(MTkickDevice, {
      [MTkickDevice]: {
        username: username,
        password: password,
        resource: resource,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * Logs out from a specified account on all devices.
   *
   * @param username The user ID.
   * @param password The password.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async kickAllDevices(
    username: string,
    password: string
  ): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: kickAllDevices: `, username, '******');
    let r: any = await Native._callMethod(MTkickAllDevices, {
      [MTkickAllDevices]: {
        username: username,
        password: password,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * Update push configurations.
   *
   * **Note**
   * For the iOS platform, you need to pass the device ID during initialization. Otherwise, the push function cannot be used properly. See {@link ChatClient.init}
   *
   * @param config The push config, See {@link ChatPushConfig}
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Adds the connection status listener.
   *
   * @param listener The connection status listener to add.
   */
  public addConnectionListener(listener: ChatConnectEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addConnectionListener: `);
    this._connectionListeners.add(listener);
  }

  /**
   * Removes the connection status listener.
   *
   * @param listener The connection status listener to remove.
   */
  public removeConnectionListener(listener: ChatConnectEventListener): void {
    chatlog.log(`${ChatClient.TAG}: removeConnectionListener: `);
    this._connectionListeners.delete(listener);
  }

  /**
   * Removes all the connection status listeners for the chat server.
   */
  public removeAllConnectionListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllConnectionListener: `);
    this._connectionListeners.clear();
  }

  /**
   * Adds the multi-device listener.
   *
   * @param listener The multi-device listener to add.
   */
  public addMultiDeviceListener(listener: ChatMultiDeviceEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addMultiDeviceListener: `);
    this._multiDeviceListeners.add(listener);
  }

  /**
   * Removes the specified multi-device listener.
   *
   * @param listener The multi-device listener to remove.
   */
  public removeMultiDeviceListener(
    listener: ChatMultiDeviceEventListener
  ): void {
    chatlog.log(`${ChatClient.TAG}: removeMultiDeviceListener: `);
    this._multiDeviceListeners.delete(listener);
  }

  /**
   * Removes all the multi-device listeners.
   */
  public removeAllMultiDeviceListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllMultiDeviceListener: `);
    this._multiDeviceListeners.clear();
  }

  /**
   * Adds a custom listener to receive data that the iOS or Android devices send to the React Native layer.
   *
   * @param listener The custom listener to add.
   */
  public addCustomListener(listener: ChatCustomEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addCustomListener: `);
    this._customListeners.add(listener);
  }

  /**
   * Removes a custom listener to stop receiving data that the iOS or Android devices send to the React Native layer.
   *
   * @param listener The custom listener to remove.
   */
  public removeCustomListener(listener: ChatCustomEventListener): void {
    chatlog.log(`${ChatClient.TAG}: removeCustomListener: `);
    this._customListeners.delete(listener);
  }

  /**
   *  Removes all the custom listeners.
   */
  public removeAllCustomListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllCustomListener: `);
    this._customListeners.clear();
  }

  /**
   * Gets the chat manager class.
   *
   * This method can be called only after the chat client is initialized.
   *
   * @returns The chat manager class.
   */
  public get chatManager(): ChatManager {
    return this._chatManager;
  }

  /**
   * Gets the chat group manager class.
   *
   * This method can be called only after the chat client is initialized.
   *
   * @returns The chat group manager class.
   */
  public get groupManager(): ChatGroupManager {
    return this._groupManager;
  }

  /**
   * Gets the contact manager class.
   *
   * This method can be called only after the chat client is initialized.
   *
   * @returns The contact manager class.
   */
  public get contactManager(): ChatContactManager {
    return this._contactManager;
  }

  /**
   * Gets the push manager class.
   *
   * This method can be called only after the chat client is initialized.
   *
   * @returns The push manager class.
   */
  public get pushManager(): ChatPushManager {
    return this._pushManager;
  }

  /**
   * Gets the user information manager class.
   *
   * This method can be called only after the chat client is initialized.
   *
   * @returns The user information manager class.
   */
  public get userManager(): ChatUserInfoManager {
    return this._userInfoManager;
  }

  /**
   * Gets the chat room manager class.
   *
   * This method can be called only after the chat client is initialized.
   *
   * @returns The chat room manager class.
   */
  public get roomManager(): ChatRoomManager {
    return this._chatRoomManager;
  }

  /**
   * Gets the presence manager class.
   *
   * This method can be called only after the chat client is initialized.
   *
   * @returns The presence manager class.
   */
  public get presenceManager(): ChatPresenceManager {
    return this._presenceManager;
  }
}
