import {
  EmitterSubscription,
  EventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';
import {
  ChatConnectionListener,
  ChatContactGroupEventFromNumber,
  ChatCustomListener,
  ChatMultiDeviceListener,
} from './ChatEvents';
import { ChatManager } from './ChatManager';
import { ChatDeviceInfo } from './common/ChatDeviceInfo';
import type { ChatOptions } from './common/ChatOptions';
import {
  MethodTypechangeAppKey,
  MethodTypecompressLogs,
  MethodTypecreateAccount,
  MethodTypegetCurrentUser,
  MethodTypegetLoggedInDevicesFromServer,
  MethodTypegetToken,
  MethodTypeinit,
  MethodTypeisConnected,
  MethodTypeisLoggedInBefore,
  MethodTypekickAllDevices,
  MethodTypekickDevice,
  MethodTypelogin,
  MethodTypeloginWithAgoraToken,
  MethodTypelogout,
  MethodTypeonConnected,
  MethodTypeonDisconnected,
  MethodTypeonMultiDeviceEvent,
  MethodTypeonSendDataToFlutter,
  MethodTypeonTokenDidExpire,
  MethodTypeonTokenWillExpire,
  MethodTyperenewToken,
} from './_internal/Consts';
import { Native } from './_internal/Native';

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
    console.log('eventEmitter has finished.');
  }

  public getEventEmitter(): EventEmitter {
    return eventEmitter;
  }

  // private _eventEmitter: NativeEventEmitter;

  private _chatManager: ChatManager;
  // todo: no implement
  // private _contactManager: ChatContactManager;
  // private _chatRoomManager: ChatChatRoomManager;
  // private _groupManager: ChatGroupManager;`
  // private _pushManager: ChatPushManager;
  // private _userInfoManager: ChatUserInfoManager;
  // private _conversationManager: ChatConversationManager;

  private _connectionListeners: Set<ChatConnectionListener>;
  // todo: no implement
  private _multiDeviceListeners: Set<ChatMultiDeviceListener>;
  private _customListeners: Set<ChatCustomListener>;

  // 1.主动登录 2.主动退出 3.被动退出
  private _options?: ChatOptions;
  private _sdkVersion: string = '1.0.0';
  private _isInit: boolean = false;
  private _currentUsername: string = '';

  private constructor() {
    super();

    this._chatManager = new ChatManager();
    // todo: no implement
    // this._contactManager = new ChatContactManager();
    // this._chatRoomManager = new ChatChatRoomManager();
    // this._groupManager = new ChatGroupManager();
    // this._pushManager = new ChatPushManager();
    // this._userInfoManager = new ChatUserInfoManager();
    // this._conversationManager = new ChatConversationManager();

    this._connectionListeners = new Set<ChatConnectionListener>();
    this._connectionSubscriptions = new Map<string, EmitterSubscription>();

    this._multiDeviceListeners = new Set<ChatMultiDeviceListener>();
    this._customListeners = new Set<ChatCustomListener>();

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

    // let s: EmitterSubscription[] | undefined = eventEmitter?.listeners(
    //   MethodTypeonConnected
    // );
    // console.log(`${s?.length}`);

    // let s: EmitterSubscription = event.addListener(
    //   MethodTypeonConnected,
    //   (params: any[]): any => {
    //     console.log('etst', params);
    //     s.remove();
    //   }
    // );

    this._connectionSubscriptions.set(
      MethodTypeonConnected,
      event.addListener(MethodTypeonConnected, this.onConnected.bind(this))
    );
    this._connectionSubscriptions.set(
      MethodTypeonDisconnected,
      event.addListener(
        MethodTypeonDisconnected,
        this.onDisconnected.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MethodTypeonTokenDidExpire,
      event.addListener(
        MethodTypeonTokenDidExpire,
        this.onTokenDidExpire.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MethodTypeonTokenWillExpire,
      event.addListener(
        MethodTypeonTokenWillExpire,
        this.onTokenWillExpire.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MethodTypeonMultiDeviceEvent,
      event.addListener(
        MethodTypeonMultiDeviceEvent,
        this.onMultiDeviceEvent.bind(this)
      )
    );
    this._connectionSubscriptions.set(
      MethodTypeonSendDataToFlutter,
      event.addListener(
        MethodTypeonSendDataToFlutter,
        this.onCustomEvent.bind(this)
      )
    );
    console.log(`${ChatClient.TAG}: setConnectNativeListener: `, event);
  }

  private setNativeListener(event: NativeEventEmitter): void {
    console.log(
      `${ChatClient.TAG}: setNativeListener: ${ChatClient.eventType}`
    );
    if (ChatClient.eventType === 1) {
      event.removeAllListeners(MethodTypeonConnected);
      event.addListener(MethodTypeonConnected, this.onConnected.bind(this));
      event.removeAllListeners(MethodTypeonDisconnected);
      event.addListener(
        MethodTypeonDisconnected,
        this.onDisconnected.bind(this)
      );
      event.removeAllListeners(MethodTypeonTokenDidExpire);
      event.addListener(
        MethodTypeonTokenDidExpire,
        this.onTokenDidExpire.bind(this)
      );
      event.removeAllListeners(MethodTypeonTokenWillExpire);
      event.addListener(
        MethodTypeonTokenWillExpire,
        this.onTokenWillExpire.bind(this)
      );
      event.removeAllListeners(MethodTypeonMultiDeviceEvent);
      event.addListener(
        MethodTypeonMultiDeviceEvent,
        this.onMultiDeviceEvent.bind(this)
      );
      event.removeAllListeners(MethodTypeonSendDataToFlutter);
      event.addListener(
        MethodTypeonSendDataToFlutter,
        this.onCustomEvent.bind(this)
      );
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
   * Get SDK Configurations. Make sure to set the param, see {@link EMOptions}.
   *
   * @returns The configurations.
   */
  public get options(): ChatOptions | undefined {
    return this._options;
  }

  /**
   * Get SDK version.
   */
  public get sdkVersion(): string {
    return this._sdkVersion;
  }

  /**
   * Get current user name.
   *
   * The value is valid after successful login.
   */
  public get currentUserName(): string {
    return this._currentUsername;
  }

  /**
   * Get React-native SDK version.
   */
  public get rnSdkVersion(): string {
    return this._sdkVersion;
  }

  /**
   * Make sure to initialize the SDK in the main thread. Make sure to set the param, see {@link ChatOptions}.
   *
   * **note**
   *
   * **This method must be called before any method can be called.**
   *
   * @param options The configurations.
   *
   * @throws Error, see {@link ChatError}
   */
  public async init(options: ChatOptions): Promise<void> {
    console.log(`${ChatClient.TAG}: init: ${options}`);
    this._options = options;
    await Native._callMethod(MethodTypeinit, { options });
    this._isInit = true;
  }

  /**
   * Check whether you have successfully connected to the server.
   *
   * @returns
   * - `true`: The server has been connected.
   * - `false`: The server is not connected.
   *
   * @throws Error, see {@link ChatError}
   */
  public async isConnected(): Promise<boolean> {
    console.log(`${ChatClient.TAG}: isConnected: `);
    let result: any = await Native._callMethod(MethodTypeisConnected);
    ChatClient.hasErrorFromResult(result);
    let _connected = result?.[MethodTypeisConnected] as boolean;
    return _connected;
  }

  /**
   * Get current user name from native. Get cache see {@link currentUserName}
   * @returns The user name.
   *
   * @throws Error, see {@link ChatError}
   */
  public async getCurrentUsername(): Promise<string> {
    console.log(`${ChatClient.TAG}: getCurrentUsername: `);
    let result: any = await Native._callMethod(MethodTypegetCurrentUser);
    ChatClient.hasErrorFromResult(result);
    let userName = result?.[MethodTypegetCurrentUser] as string;
    if (userName && userName.length !== 0) {
      if (userName !== this._currentUsername) {
        this._currentUsername = userName;
      }
    }
    return this._currentUsername;
  }

  /**
   * Get login state.
   *
   * @returns
   * - `true`: In automatic login mode, the value is true before successful login and false otherwise.
   * - `false`: In non-automatic login mode, the value is false.
   *
   * @throws Error, see {@link ChatError}
   */
  public async isLoginBefore(): Promise<boolean> {
    console.log(`${ChatClient.TAG}: isLoginBefore: `);
    let result: any = await Native._callMethod(MethodTypeisLoggedInBefore);
    ChatClient.hasErrorFromResult(result);
    let _isLoginBefore = result?.[MethodTypeisLoggedInBefore] as boolean;
    return _isLoginBefore;
  }

  /**
   * Get login access token.
   *
   * @returns The token value.
   *
   * @throws Error, see {@link ChatError}
   */
  public async getAccessToken(): Promise<string> {
    console.log(`${ChatClient.TAG}: isLoginBefore: `);
    let result: any = await Native._callMethod(MethodTypegetToken);
    ChatClient.hasErrorFromResult(result);
    let _token = result?.[MethodTypegetToken] as string;
    return _token;
  }

  /**
   * Register a new user with your chat network.
   *
   * @param username The username. The maximum length is 64 characters. Ensure that you set this parameter. Supported characters include the 26 English letters (a-z), the ten numbers (0-9), the underscore (_), the hyphen (-), and the English period (.). This parameter is case insensitive, and upper-case letters are automatically changed to low-case ones. If you want to set this parameter as a regular expression, set it as ^[a-zA-Z0-9_-]+$.
   * @param password The password. The maximum length is 64 characters. Ensure that you set this parameter.
   *
   * @throws Error, see {@link ChatError}
   */
  public async createAccount(
    username: string,
    password: string
  ): Promise<void> {
    console.log(`${ChatClient.TAG}: createAccount: ${username}, ${password}`);
    let result: any = await Native._callMethod(MethodTypecreateAccount, {
      [MethodTypecreateAccount]: {
        username: username,
        password: password,
      },
    });
    ChatClient.hasErrorFromResult(result);
  }

  /**
   * An app user logs in to the chat server with a password or token.
   *
   * @param userName The username, see {@link createAccount}.
   * @param pwdOrToken The password or token, see {@link createAccount} or {@link getAccessToken}
   * @param isPassword The password or token flag. true is the password, otherwise it is the token.
   *
   * @throws Error, see {@link ChatError}
   */
  public async login(
    userName: string,
    pwdOrToken: string,
    isPassword: boolean = true
  ): Promise<void> {
    console.log(
      `${ChatClient.TAG}: login: ${userName}, ${pwdOrToken}, ${isPassword}`
    );
    let result: any = await Native._callMethod(MethodTypelogin, {
      [MethodTypelogin]: {
        username: userName,
        pwdOrToken: pwdOrToken,
        isPassword: isPassword,
      },
    });
    ChatClient.hasErrorFromResult(result);
    result = result?.[MethodTypelogin];
    this._currentUsername = result?.username;
    console.log(
      `${ChatClient.TAG}: login: ${result?.username}, ${result?.token}`
    );
  }

  /**
   * An app user logs in to the chat server with a agora token.
   *
   * @param userName The username, see {@link createAccount}.
   * @param agoraToken The token from agora api.
   *
   * @throws Error, see {@link ChatError}
   */
  public async loginWithAgoraToken(
    userName: string,
    agoraToken: string
  ): Promise<void> {
    console.log(
      `${ChatClient.TAG}: loginWithAgoraToken: ${userName}, ${agoraToken}`
    );
    let result: any = await Native._callMethod(MethodTypeloginWithAgoraToken, {
      [MethodTypeloginWithAgoraToken]: {
        username: userName,
        agoraToken: agoraToken,
      },
    });
    ChatClient.hasErrorFromResult(result);
    this._currentUsername = result?.username;
  }

  /**
   * Renew token.
   *
   * When a user is in the Agora token login state and receives a callback
   * notification of the token is to be expired in the {@link ChatConnectionListener}
   * implementation class, this API can be called to update the token to
   * avoid unknown problems caused by the token invalidation.
   *
   * @param agoraToken The new token.
   *
   * @throws Error, see {@link ChatError}
   */
  public async renewAgoraToken(agoraToken: string): Promise<void> {
    console.log(`${ChatClient.TAG}: renewAgoraToken: ${agoraToken}`);
    let result: any = await Native._callMethod(MethodTyperenewToken, {
      [MethodTyperenewToken]: {
        agoraToken: agoraToken,
      },
    });
    ChatClient.hasErrorFromResult(result);
  }

  /**
   * An app user logs out and returns the result.
   *
   * @param unbindDeviceToken Whether to unbind the token.
   * - `true`: means to unbind the device token when logout.
   * - `false`: means to not unbind the device token when logout.
   * @throws Error, see {@link ChatError}
   */
  public async logout(unbindDeviceToken: boolean = true): Promise<void> {
    console.log(`${ChatClient.TAG}: logout: ${unbindDeviceToken}`);
    let result: any = await Native._callMethod(MethodTypelogout, {
      [MethodTypelogout]: {
        unbindToken: unbindDeviceToken,
      },
    });
    ChatClient.hasErrorFromResult(result);
    this.reset();
  }

  /**
   * Update the App Key, which is the unique identifier used to access Agora Chat.
   *
   * You retrieve the new App Key from Agora Console.
   *
   * As this key controls all access to Agora Chat for your app, you can only update the key when the current user is logged out.
   *
   * Also, you can set App Key by the following method when logged out {@link ChatOptions#appKey}.
   *
   * @param newAppKey The App Key, make sure to set the param.
   *
   * @throws Error, see {@link ChatError}
   */
  public async changeAppKey(newAppKey: string): Promise<void> {
    console.log(`${ChatClient.TAG}: changeAppKey: ${newAppKey}`);
    let r: any = await Native._callMethod(MethodTypechangeAppKey, {
      [MethodTypechangeAppKey]: {
        appKey: newAppKey,
      },
    });
    ChatClient.hasErrorFromResult(r);
  }

  /**
   * Compresses the debug log into a gzip archive.
   *
   * Best practice is to delete this debug archive as soon as it is no longer used.
   *
   * @returns The path of the compressed gz file.
   *
   * @throws Error, see {@link ChatError}
   */
  public async compressLogs(): Promise<string | undefined> {
    console.log(`${ChatClient.TAG}: compressLogs:`);
    let r: any = await Native._callMethod(MethodTypecompressLogs);
    ChatClient.hasErrorFromResult(r);
    return r?.[MethodTypecompressLogs];
  }

  /**
   * Gets all the information about the logged in devices under the specified account.
   *
   * @param username The user ID you want to get the device information.
   * @param password The password.
   * @returns The list of the online devices.
   *
   * @throws Error, see {@link ChatError}
   */
  public async getLoggedInDevicesFromServer(
    username: string,
    password: string
  ): Promise<Array<ChatDeviceInfo>> {
    console.log(
      `${ChatClient.TAG}: getLoggedInDevicesFromServer: ${username}, ${password}`
    );
    let result: any = await Native._callMethod(
      MethodTypegetLoggedInDevicesFromServer,
      {
        [MethodTypegetLoggedInDevicesFromServer]: {
          username: username,
          password: password,
        },
      }
    );
    ChatClient.hasErrorFromResult(result);
    let r: ChatDeviceInfo[] = [];
    let list: Array<any> = result?.[MethodTypegetLoggedInDevicesFromServer];
    if (list) {
      list.forEach((element) => {
        r.push(new ChatDeviceInfo(element));
      });
    }
    return r;
  }

  /**
   * Force the specified account to logout from the specified device, to fetch the device ID: {@link ChatDeviceInfo#resource}.
   *
   * @param username The account you want to force logout.
   * @param password The account's password.
   * @param resource The device ID, see {@link ChatDeviceInfo#resource}.
   *
   * @throws Error, see {@link ChatError}
   */
  public async kickDevice(
    username: string,
    password: string,
    resource: string
  ): Promise<void> {
    console.log(
      `${ChatClient.TAG}: kickDevice: ${username}, ${password}, ${resource}`
    );
    let r: any = await Native._callMethod(MethodTypekickDevice, {
      [MethodTypekickDevice]: {
        username: username,
        password: password,
        resource: resource,
      },
    });
    ChatClient.hasErrorFromResult(r);
  }

  /**
   * Kicks out all the devices logged in under the specified account.
   *
   * @param username The account you want to log out from all the devices.
   * @param password The account's password.
   *
   * @throws Error, see {@link ChatError}
   */
  public async kickAllDevices(
    username: string,
    password: string
  ): Promise<void> {
    console.log(`${ChatClient.TAG}: kickAllDevices: ${username}, ${password}`);
    let r: any = await Native._callMethod(MethodTypekickAllDevices, {
      [MethodTypekickAllDevices]: {
        username: username,
        password: password,
      },
    });
    ChatClient.hasErrorFromResult(r);
  }

  public addConnectionListener(listener: ChatConnectionListener): void {
    console.log(`${ChatClient.TAG}: addConnectionListener: `);
    this._connectionListeners.add(listener);
  }

  public removeConnectionListener(listener: ChatConnectionListener): void {
    console.log(`${ChatClient.TAG}: removeConnectionListener: `);
    this._connectionListeners.delete(listener);
  }

  public removeAllConnectionListener(): void {
    console.log(`${ChatClient.TAG}: removeAllConnectionListener: `);
    this._connectionListeners.clear();
  }

  public addMultiDeviceListener(listener: ChatMultiDeviceListener): void {
    this._multiDeviceListeners.add(listener);
  }

  public removeMultiDeviceListener(listener: ChatMultiDeviceListener): void {
    this._multiDeviceListeners.delete(listener);
  }

  public removeAllMultiDeviceListener(): void {
    this._multiDeviceListeners.clear();
  }

  public addCustomListener(listener: ChatCustomListener): void {
    this._customListeners.add(listener);
  }

  public removeCustomListener(listener: ChatCustomListener): void {
    this._customListeners.delete(listener);
  }

  public removeAllCustomListener(): void {
    this._customListeners.clear();
  }

  public get chatManager(): ChatManager {
    return this._chatManager;
  }
}
