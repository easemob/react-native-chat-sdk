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
  ChatContactGroupEventFromNumber,
  ChatCustomEventListener,
  ChatMultiDeviceEventListener,
} from './ChatEvents';
import { ChatGroupManager } from './ChatGroupManager';
import { ChatManager } from './ChatManager';
import { ChatPushManager } from './ChatPushManager';
import { ChatRoomManager } from './ChatRoomManager';
import { ChatUserInfoManager } from './ChatUserInfoManager';
import { ChatDeviceInfo } from './common/ChatDeviceInfo';
import type { ChatOptions } from './common/ChatOptions';
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
  MTonSendDataToFlutter,
  MTonTokenDidExpire,
  MTonTokenWillExpire,
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
          throw new Error(LINKING_ERROR);
        },
      }
    );
const eventEmitter = new NativeEventEmitter(ExtSdkApiRN);
console.log('eventEmitter: ', eventEmitter);

export class ChatClient extends Native {
  public static eventType = 2; // 1.remove 2.subscription(suggested)
  private static TAG = 'ChatClient';
  private static _instance: ChatClient;
  private _connectionSubscriptions: Map<string, EmitterSubscription>;
  public static getInstance(): ChatClient {
    if (ChatClient._instance == null || ChatClient._instance === undefined) {
      ChatClient._instance = new ChatClient();
    }
    return ChatClient._instance;
  }

  private setEventEmitter(): void {
    console.log(`${ChatClient.TAG}: setEventEmitter: `);
    this.setNativeListener(this.getEventEmitter());
    this._chatManager.setNativeListener(this.getEventEmitter());
    this._groupManager.setNativeListener(this.getEventEmitter());
    this._contactManager.setNativeListener(this.getEventEmitter());
    this._chatManager.setNativeListener(this.getEventEmitter());
    this._pushManager.setNativeListener(this.getEventEmitter());
    this._chatRoomManager.setNativeListener(this.getEventEmitter());
    console.log('eventEmitter has finished.');
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

  private _connectionListeners: Set<ChatConnectEventListener>;
  // todo: no implement
  private _multiDeviceListeners: Set<ChatMultiDeviceEventListener>;
  private _customListeners: Set<ChatCustomEventListener>;

  private _options?: ChatOptions;
  private _sdkVersion: string = '1.0.0';
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

    this._connectionListeners = new Set<ChatConnectEventListener>();
    this._connectionSubscriptions = new Map<string, EmitterSubscription>();

    this._multiDeviceListeners = new Set<ChatMultiDeviceEventListener>();
    this._customListeners = new Set<ChatCustomEventListener>();

    this.setEventEmitter();
  }

  private setConnectNativeListener(event: EventEmitter): void {
    console.log(`${ChatClient.TAG}: setConnectNativeListener: `);
    this._connectionSubscriptions.forEach(
      (
        value: EmitterSubscription,
        key: string,
        map: Map<string, EmitterSubscription>
      ) => {
        console.log(
          `${ChatClient.TAG}: setConnectNativeListener: ${key}, ${value}, ${map}`
        );
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
      MTonSendDataToFlutter,
      event.addListener(MTonSendDataToFlutter, this.onCustomEvent.bind(this))
    );
  }

  private setNativeListener(event: NativeEventEmitter): void {
    console.log(`${ChatClient.TAG}: setNativeListener: `);
    if (ChatClient.eventType === 1) {
      event.removeAllListeners(MTonConnected);
      event.addListener(MTonConnected, this.onConnected.bind(this));
      event.removeAllListeners(MTonDisconnected);
      event.addListener(MTonDisconnected, this.onDisconnected.bind(this));
      event.removeAllListeners(MTonTokenDidExpire);
      event.addListener(MTonTokenDidExpire, this.onTokenDidExpire.bind(this));
      event.removeAllListeners(MTonTokenWillExpire);
      event.addListener(MTonTokenWillExpire, this.onTokenWillExpire.bind(this));
      event.removeAllListeners(MTonMultiDeviceEvent);
      event.addListener(
        MTonMultiDeviceEvent,
        this.onMultiDeviceEvent.bind(this)
      );
      event.removeAllListeners(MTonSendDataToFlutter);
      event.addListener(MTonSendDataToFlutter, this.onCustomEvent.bind(this));
    } else if (ChatClient.eventType === 2) {
      this.setConnectNativeListener(event);
    } else {
      throw new Error('This type is not supported.');
    }
  }

  public onConnected(): void {
    console.log(`${ChatClient.TAG}: onConnected: `);
    this._connectionListeners.forEach((element) => {
      element.onConnected();
    });
  }
  private onDisconnected(params?: any): void {
    console.log(`${ChatClient.TAG}: onDisconnected: ${params}`);
    this._connectionListeners.forEach((element) => {
      let ec = params?.errorCode as number;
      element.onDisconnected(ec);
    });
  }
  private onTokenWillExpire(params?: any): void {
    console.log(`${ChatClient.TAG}: onTokenWillExpire: ${params}`);
    this._connectionListeners.forEach((element) => {
      element.onTokenWillExpire();
    });
  }
  private onTokenDidExpire(params?: any): void {
    console.log(`${ChatClient.TAG}: onTokenDidExpire: ${params}`);
    this._connectionListeners.forEach((element) => {
      element.onTokenDidExpire();
    });
  }
  private onMultiDeviceEvent(params?: any): void {
    console.log(`${ChatClient.TAG}: onMultiDeviceEvent: ${params}`);
    this._multiDeviceListeners.forEach((element) => {
      let event = params?.event as number;
      if (event > 10) {
        element.onGroupEvent(
          ChatContactGroupEventFromNumber(event),
          params?.target,
          params?.userNames
        );
      } else {
        element.onContactEvent(
          ChatContactGroupEventFromNumber(event),
          params?.target,
          params?.userNames
        );
      }
    });
  }
  private onCustomEvent(params: any): void {
    console.log(`${ChatClient.TAG}: onCustomEvent: ${params}`);
    this._customListeners.forEach((element) => {
      element.onDataReceived(params);
    });
  }

  private reset(): void {
    this._currentUsername = '';
  }

  /**
   * Gets the configurations. Make sure to set the param, see {@link EMOptions}.
   *
   * @returns The configurations.
   */
  public get options(): ChatOptions | undefined {
    return this._options;
  }

  /**
   * Gets the SDK version.
   *
   * @returns The SDK version.
   */
  public get sdkVersion(): string {
    return this._sdkVersion;
  }

  /**
   * Gets the current logged-in user ID.
   *
   * The value is valid after successful login.
   * @returns The current logged-in user ID.
   */
  public get currentUserName(): string {
    return this._currentUsername;
  }

  /**
   * Gets the version of the React Native SDK.
   *
   * @returns The version of the React Native SDK.
   */
  public get rnSdkVersion(): string {
    return this._sdkVersion;
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
    console.log(`${ChatClient.TAG}: init: ${options}`);
    this._options = options;
    await Native._callMethod(MTinit, { options });
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
    console.log(`${ChatClient.TAG}: isConnected: `);
    let result: any = await Native._callMethod(MTisConnected);
    ChatClient.checkErrorFromResult(result);
    let _connected = result?.[MTisConnected] as boolean;
    return _connected;
  }

  /**
   * Gets the current logged-in user ID from the server. To get it from the memory, see {@link currentUserName}.
   * @returns The logged-in user ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getCurrentUsername(): Promise<string> {
    console.log(`${ChatClient.TAG}: getCurrentUsername: `);
    let result: any = await Native._callMethod(MTgetCurrentUser);
    ChatClient.checkErrorFromResult(result);
    let userName = result?.[MTgetCurrentUser] as string;
    if (userName && userName.length !== 0) {
      if (userName !== this._currentUsername) {
        this._currentUsername = userName;
      }
    }
    return this._currentUsername;
  }

  /**
   * Checks whether the user is logged into the app.
   *
   * @returns
   * - `true`: In automatic login mode, the value is true before successful login and false otherwise.
   * - `false`: In non-automatic login mode, the value is false.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async isLoginBefore(): Promise<boolean> {
    console.log(`${ChatClient.TAG}: isLoginBefore: `);
    let result: any = await Native._callMethod(MTisLoggedInBefore);
    ChatClient.checkErrorFromResult(result);
    let _isLoginBefore = result?.[MTisLoggedInBefore] as boolean;
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
    console.log(`${ChatClient.TAG}: isLoginBefore: `);
    let result: any = await Native._callMethod(MTgetToken);
    ChatClient.checkErrorFromResult(result);
    let _token = result?.[MTgetToken] as string;
    return _token;
  }

  /**
   * Creates a new user.
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
    console.log(`${ChatClient.TAG}: createAccount: ${username}, ${password}`);
    let result: any = await Native._callMethod(MTcreateAccount, {
      [MTcreateAccount]: {
        username: username,
        password: password,
      },
    });
    ChatClient.checkErrorFromResult(result);
  }

  /**
   * Logs into the chat server with a password or a token.
   *
   * @param userName The user ID. See {@link createAccount}.
   * @param pwdOrToken The password or token. See {@link createAccount} or {@link getAccessToken}
   * @param isPassword  Whether to log in with a password or a token.
   *  - `true`: A token is used.
   *  - (Default) `false`: A password is used.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async login(
    userName: string,
    pwdOrToken: string,
    isPassword: boolean = true
  ): Promise<void> {
    console.log(
      `${ChatClient.TAG}: login: ${userName}, ${pwdOrToken}, ${isPassword}`
    );
    let result: any = await Native._callMethod(MTlogin, {
      [MTlogin]: {
        username: userName,
        pwdOrToken: pwdOrToken,
        isPassword: isPassword,
      },
    });
    ChatClient.checkErrorFromResult(result);
    result = result?.[MTlogin];
    this._currentUsername = result?.username;
    console.log(
      `${ChatClient.TAG}: login: ${result?.username}, ${result?.token}`
    );
  }

  /**
   * Logs into the chat server with the user ID and an Agora token.
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
    console.log(
      `${ChatClient.TAG}: loginWithAgoraToken: ${userName}, ${agoraToken}`
    );
    let result: any = await Native._callMethod(MTloginWithAgoraToken, {
      [MTloginWithAgoraToken]: {
        username: userName,
        agoraToken: agoraToken,
      },
    });
    ChatClient.checkErrorFromResult(result);
    this._currentUsername = result?.username;
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
    console.log(`${ChatClient.TAG}: renewAgoraToken: ${agoraToken}`);
    let result: any = await Native._callMethod(MTrenewToken, {
      [MTrenewToken]: {
        agoraToken: agoraToken,
      },
    });
    ChatClient.checkErrorFromResult(result);
  }

  /**
   * Logs out of the chat app.
   *
   * @param unbindDeviceToken Whether to unbind the token upon logout.
   * - (Default) `true`: Yes.
   * - `false`: No.
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async logout(unbindDeviceToken: boolean = true): Promise<void> {
    console.log(`${ChatClient.TAG}: logout: ${unbindDeviceToken}`);
    let result: any = await Native._callMethod(MTlogout, {
      [MTlogout]: {
        unbindToken: unbindDeviceToken,
      },
    });
    ChatClient.checkErrorFromResult(result);
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
    console.log(`${ChatClient.TAG}: changeAppKey: ${newAppKey}`);
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
    console.log(`${ChatClient.TAG}: compressLogs:`);
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
    console.log(
      `${ChatClient.TAG}: getLoggedInDevicesFromServer: ${username}, ${password}`
    );
    let result: any = await Native._callMethod(MTgetLoggedInDevicesFromServer, {
      [MTgetLoggedInDevicesFromServer]: {
        username: username,
        password: password,
      },
    });
    ChatClient.checkErrorFromResult(result);
    let r: ChatDeviceInfo[] = [];
    let list: Array<any> = result?.[MTgetLoggedInDevicesFromServer];
    if (list) {
      list.forEach((element) => {
        r.push(new ChatDeviceInfo(element));
      });
    }
    return r;
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
    console.log(
      `${ChatClient.TAG}: kickDevice: ${username}, ${password}, ${resource}`
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
    console.log(`${ChatClient.TAG}: kickAllDevices: ${username}, ${password}`);
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
    console.log(`${ChatClient.TAG}: addConnectionListener: `);
    this._connectionListeners.add(listener);
  }

  /**
   *  Removes the connection listener for the chat server.
   *
   *  @param listener The chat server connection listener to be removed.
   */
  public removeConnectionListener(listener: ChatConnectEventListener): void {
    console.log(`${ChatClient.TAG}: removeConnectionListener: `);
    this._connectionListeners.delete(listener);
  }

  /**
   *  Removes all the connection listeners for the chat server.
   */
  public removeAllConnectionListener(): void {
    console.log(`${ChatClient.TAG}: removeAllConnectionListener: `);
    this._connectionListeners.clear();
  }

  /**
   *  Adds the multi-device listener.
   *
   *  @param listener The multi-device listener to be added.
   */
  public addMultiDeviceListener(listener: ChatMultiDeviceEventListener): void {
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
    this._multiDeviceListeners.delete(listener);
  }

  /**
   *  Removes all the multi-device listeners.
   */
  public removeAllMultiDeviceListener(): void {
    this._multiDeviceListeners.clear();
  }

  /**
   *  Adds a custom listener to receive data from iOS or Android devices.
   *
   *  @param listener The custom listener to be added.
   */
  public addCustomListener(listener: ChatCustomEventListener): void {
    this._customListeners.add(listener);
  }

  /**
   *  Removes a custom listener to receive data from iOS or Android devices.
   *
   *  @param listener The custom listener to be removed.
   */
  public removeCustomListener(listener: ChatCustomEventListener): void {
    this._customListeners.delete(listener);
  }

  /**
   *  Removes all the custom listeners.
   */
  public removeAllCustomListener(): void {
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

  public get groupManager(): ChatGroupManager {
    return this._groupManager;
  }

  public get contactManager(): ChatContactManager {
    return this._contactManager;
  }

  public get pushManager(): ChatPushManager {
    return this._pushManager;
  }

  public get userManager(): ChatUserInfoManager {
    return this._userInfoManager;
  }

  public get roomManager(): ChatRoomManager {
    return this._chatRoomManager;
  }
}
