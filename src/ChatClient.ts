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
import type { ChatOptions } from './common/ChatOptions';
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
  private _sdkVersion: string = '3.9.1.1';
  private _rnSdkVersion: string = '1.0.0';
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
      element.onConnected();
    });
  }
  private onDisconnected(params?: any): void {
    chatlog.log(`${ChatClient.TAG}: onDisconnected: `, params);
    this._connectionListeners.forEach((element) => {
      let ec = params?.errorCode as number;
      element.onDisconnected(ec);
    });
  }
  private onTokenWillExpire(params?: any): void {
    chatlog.log(`${ChatClient.TAG}: onTokenWillExpire: `, params);
    this._connectionListeners.forEach((element) => {
      element.onTokenWillExpire();
    });
  }
  private onTokenDidExpire(params?: any): void {
    chatlog.log(`${ChatClient.TAG}: onTokenDidExpire: `, params);
    this._connectionListeners.forEach((element) => {
      element.onTokenDidExpire();
    });
  }
  private onMultiDeviceEvent(params?: any): void {
    chatlog.log(`${ChatClient.TAG}: onMultiDeviceEvent: `, params);
    this._multiDeviceListeners.forEach((element) => {
      let event = params?.event as number;
      if (event < 10) {
        element.onContactEvent(
          ChatMultiDeviceEventFromNumber(event),
          params.target,
          params.ext
        );
      } else if (event >= 10 && event < 40) {
        element.onGroupEvent(
          ChatMultiDeviceEventFromNumber(event),
          params.target,
          params.ext
        );
      } else {
        element.onThreadEvent(
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
      element.onDisconnected(206);
    });
  }
  private onUserDidRemoveFromServer(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidRemoveFromServer: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected(207);
    });
  }
  private onUserDidForbidByServer(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidForbidByServer: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected(305);
    });
  }
  private onUserDidChangePassword(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidChangePassword: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected(216);
    });
  }
  private onUserDidLoginTooManyDevice(): void {
    chatlog.log(`${ChatClient.TAG}: onUserDidLoginTooManyDevice: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected(214);
    });
  }
  private onUserKickedByOtherDevice(): void {
    chatlog.log(`${ChatClient.TAG}: onUserKickedByOtherDevice: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected(217);
    });
  }
  private onUserAuthenticationFailed(): void {
    chatlog.log(`${ChatClient.TAG}: onUserAuthenticationFailed: `);
    this._connectionListeners.forEach((element) => {
      element.onDisconnected(202);
    });
  }

  private reset(): void {
    chatlog.log(`${ChatClient.TAG}: reset: `);
    this._currentUsername = '';
  }

  /**
   * Gets the configurations. Make sure to set the param, see {@link EMOptions}.
   *
   * This value is set during initialization.
   *
   * @returns The configurations.
   */
  public get options(): ChatOptions | undefined {
    chatlog.log(`${ChatClient.TAG}: options: `);
    return this._options;
  }

  /**
   * Gets the current logged-in user ID.
   *
   * The value is valid after successful login.
   *
   * The value is cached locally and is updated on login, logout, disconnect, etc. Use {@link getCurrentUsername} if you need a more accurate value.
   *
   * @returns The current logged-in user ID.
   */
  public get currentUserName(): string {
    chatlog.log(`${ChatClient.TAG}: currentUserName: `, this._currentUsername);
    return this._currentUsername;
  }

  /**
   * Initializes the SDK.
   * Make sure to initialize the SDK in the main thread.
   *
   * **Note**
   *
   * **This method must be called before any method can be called.**
   *
   * @param options The options for SDK initialization. The options are required. See {@link ChatOptions}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async init(options: ChatOptions): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: init: `, options);
    this._options = options;
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
   * Gets the current logged-in user ID from the server. To get it from the memory, see {@link currentUserName}.
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
   * Checks whether the user is logged into the app.
   *
   * **Note**
   *
   * This state is after initialization and before login.
   *
   * @returns
   * - `true`: In automatic login mode, the value is true before successful login and false otherwise.
   * - `false`: In non-automatic login mode, the value is false.
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
   * @returns The token.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getAccessToken(): Promise<string> {
    chatlog.log(`${ChatClient.TAG}: isLoginBefore: `);
    let r: any = await Native._callMethod(MTgetToken);
    ChatClient.checkErrorFromResult(r);
    let _token = r?.[MTgetToken] as string;
    return _token;
  }

  /**
   * Creates a new user.
   *
   * There are two registration modes, open registration and authorized registration. The client can register only when the registration is open, otherwise an error message will be returned.
   * Open registration is for testing use, and it is not recommended to use this method to register a Huanxin account in a formal environment;
   * The process of authorization registration should be that your server registers through the REST API provided by Agora, and then saves it to your server or returns it to the client.
   *
   * @param username The user ID.
   *                 This parameter is required. The user ID can be a maximum of 64 characters of the following types:
   *                 - 26 English letters (a-z)
   *                 - 10 numbers (0-9),
   *                 - "_", "-", "."
   *                 This parameter is case insensitive and upper-case letters are automatically changed to low-case ones.
   *                 Also, you can set this parameter with a regular expression in the format of ^[a-zA-Z0-9_-]+$.
   * @param password The password. It is required. The password can contain a maximum of 64 characters.
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
   * Login into the chat server with a password or a token.
   *
   * If you use a token to log in to the server, there are two ways to obtain the token. The first is obtained through the SDK interface, See {@link createAccount} or {@link getAccessToken}, and the second is obtained through the chatlog, {@link https://chatlog.easemob.com/app/applicationOverview/userManagement}.
   *
   * The token expiration reminder is notified by the listener {@link ChatConnectEventListener#onTokenWillExpire} and  {@link ChatConnectEventListener#onTokenDidExpire}. If necessary, please pay attention to the listener event.
   *
   * @param userName The user ID. See {@link createAccount}.
   * @param pwdOrToken The password or token.
   *
   * @param isPassword  Whether to log in with a password or a token.
   *  - `true`: A token is used.
   *  - `false`: (Default) A password is used.
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
   * Logs into the chat server with the user ID and an Agora token.
   * This method supports automatic login.
   *
   * Agora token is different from token {@link login#token}. Agora is obtained through agora server.
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
   * If you log in with an Agora token and are notified by a callback method {@link ChatConnectEventListener} that the token is to be expired, you can call this method to update the token to avoid unknown issues caused by an invalid token.
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
   * @param unbindDeviceToken Whether to unbind the token upon logout.
   * - `true`: (Default) Yes.
   * - `false`: No.
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
   * Updates the App Key, which is the unique identifier used to access Chat service.
   *
   * You can retrieve the new App Key from the Console.
   *
   * As this key controls all access to Chat service for your app, you can only update the key when the current user is logged out.
   *
   * Also, you can set App Key by the following method when logged out: {@link ChatOptions#appKey}.
   *
   * @param newAppKey The App Key. It is required
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async changeAppKey(newAppKey: string): Promise<void> {
    chatlog.log(`${ChatClient.TAG}: changeAppKey: `, newAppKey);
    let r: any = await Native._callMethod(MTchangeAppKey, {
      [MTchangeAppKey]: {
        appKey: newAppKey,
      },
    });
    ChatClient.checkErrorFromResult(r);
  }

  /**
   * Compresses the debug log into a gzip archive.
   *
   * We recommend that you delete this debug archive once it is no longer used.
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
   * Gets all the information about the devices which you have logged into with a specified account.
   *
   * @param username The user ID.
   * @param password The password.
   * @returns The list of the login devices.
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
   * For how to get the device ID, see {@link ChatDeviceInfo#resource}.
   *
   * @param username The user ID.
   * @param password The password.
   * @param resource The device ID. See {@link ChatDeviceInfo#resource}.
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
   *  Adds the connection listener for the chat server.
   *
   *  @param listener The chat server connection listener to be added.
   */
  public addConnectionListener(listener: ChatConnectEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addConnectionListener: `);
    this._connectionListeners.add(listener);
  }

  /**
   *  Removes the connection listener for the chat server.
   *
   *  @param listener The chat server connection listener to be removed.
   */
  public removeConnectionListener(listener: ChatConnectEventListener): void {
    chatlog.log(`${ChatClient.TAG}: removeConnectionListener: `);
    this._connectionListeners.delete(listener);
  }

  /**
   *  Removes all the connection listeners for the chat server.
   */
  public removeAllConnectionListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllConnectionListener: `);
    this._connectionListeners.clear();
  }

  /**
   *  Adds the multi-device listener.
   *
   *  @param listener The multi-device listener to be added.
   */
  public addMultiDeviceListener(listener: ChatMultiDeviceEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addMultiDeviceListener: `);
    this._multiDeviceListeners.add(listener);
  }

  /**
   *  Removes the multi-device listener.
   *
   *  @param listener The multi-device listener to be removed.
   */
  public removeMultiDeviceListener(
    listener: ChatMultiDeviceEventListener
  ): void {
    chatlog.log(`${ChatClient.TAG}: removeMultiDeviceListener: `);
    this._multiDeviceListeners.delete(listener);
  }

  /**
   *  Removes all the multi-device listeners.
   */
  public removeAllMultiDeviceListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllMultiDeviceListener: `);
    this._multiDeviceListeners.clear();
  }

  /**
   *  Adds a custom listener to receive data from iOS or Android devices.
   *
   *  @param listener The custom listener to be added.
   */
  public addCustomListener(listener: ChatCustomEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addCustomListener: `);
    this._customListeners.add(listener);
  }

  /**
   *  Removes a custom listener to receive data from iOS or Android devices.
   *
   *  @param listener The custom listener to be removed.
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
   *  Gets the `ChatManager` class. Make sure to call it after ChatClient has been initialized.
   *
   *  @returns The `ChatManager` class.
   */
  public get chatManager(): ChatManager {
    return this._chatManager;
  }

  /**
   *  Gets the `ChatGroupManager` class. Make sure to call it after ChatClient has been initialized.
   *
   *  @returns The `ChatGroupManager` class.
   */
  public get groupManager(): ChatGroupManager {
    return this._groupManager;
  }

  /**
   *  Gets the `ChatContactManager` class. Make sure to call it after ChatClient has been initialized.
   *
   *  @returns The `ChatContactManager` class.
   */
  public get contactManager(): ChatContactManager {
    return this._contactManager;
  }

  /**
   *  Gets the `ChatPushManager` class. Make sure to call it after ChatClient has been initialized.
   *
   *  @returns The `ChatPushManager` class.
   */
  public get pushManager(): ChatPushManager {
    return this._pushManager;
  }

  /**
   *  Gets the `ChatUserInfoManager` class. Make sure to call it after ChatClient has been initialized.
   *
   *  @returns The `ChatUserInfoManager` class.
   */
  public get userManager(): ChatUserInfoManager {
    return this._userInfoManager;
  }

  /**
   *  Gets the `ChatRoomManager` class. Make sure to call it after ChatClient has been initialized.
   *
   *  @returns The `ChatRoomManager` class.
   */
  public get roomManager(): ChatRoomManager {
    return this._chatRoomManager;
  }

  /**
   *  Gets the `ChatPresenceManager` class. Make sure to call it after ChatClient has been initialized.
   *
   *  @returns The `ChatPresenceManager` class.
   */
  public get presenceManager(): ChatPresenceManager {
    return this._presenceManager;
  }
}
