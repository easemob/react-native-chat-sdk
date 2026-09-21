import { type EventSubscription, NativeEventEmitter } from 'react-native';
import { Factory } from './__internal__/Factory';

import { BaseManager } from './__internal__/Base';
import {
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
  MTupdatePushConfig,
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
import { ChatPushConfig } from './common/ChatPushConfig';
import { eventEmitter } from './__specs__';
import { Native } from './__internal__/Native';
import { ChatError } from './common/ChatError';
import { ChatRTCTokenInfo } from './common/ChatRTCTokenInfo';

chatlog.log('dev:eventEmitter: ', eventEmitter);

/**
 * The chat client class, which is the entry of the chat SDK. It defines how to log in to and log out of the chat app and how to manage the connection between the SDK and the chat server.
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
   * Logs in to the chat server with a token. An exception message is thrown if the login fails.
   *
   * **Note**
   *
   * If you use a token to log in to the server, you can get the token in either of the following ways:
   * - Through the console.
   *
   * The token expiration reminder is returned by the two callback methods: {@link ChatConnectEventListener.onTokenWillExpire} and {@link ChatConnectEventListener.onTokenDidExpire}.
   *
   * @param userId  The user ID.
   * @param token  The token.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Renews the token.
   *
   * **Note**
   *
   * If you log in with a token and are notified by the callback method {@link ChatConnectEventListener} that the token is to expire, you can call this method to update the token to avoid unknown issues caused by an invalid token.
   *
   * @param token The new token.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Logs out of the chat app. An exception message is thrown if the logout fails.
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
   * Updates the App id, which is the unique identifier used to access the chat service.
   *
   * **Note**
   *
   * - As this id controls access to the chat service for your app, you can only update the id when the current user is logged out.
   *
   * - Updating the App id means to switch to a new App id.
   *
   * - You can retrieve the new App id from the Console.
   *
   * - You can also set an App id by using the {@link ChatOptions.appId} method when logged out.
   *
   * @param newAppId The new App id. Ensure that you set this parameter.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * @param userId The user ID.
   * @param token The user token. See {@link getAccessToken}.
   * @returns The list of the online logged-in devices.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Logs out from a specified account on a device.
   *
   * For how to get the device ID, see {@link ChatDeviceInfo.resource}.
   *
   * @param userId The user ID.
   * @param token The user token. See {@link getAccessToken}.
   * @param resource The device ID. See {@link ChatDeviceInfo.resource}.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Logs out from a specified account on all devices.
   *
   * @param userId The user ID.
   * @param token The user token. See {@link getAccessToken}.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
      const newPushConfig = new ChatPushConfig(this._options.pushConfig); // deep copy
      if (config.deviceId) {
        newPushConfig.deviceId = config.deviceId;
      }
      if (config.deviceToken) {
        newPushConfig.deviceToken = config.deviceToken;
      }
      const newOptions = { ...this._options };
      newOptions.pushConfig = { ...newPushConfig };
      this._options = newOptions;
    }
    let r: any = await Native._callMethod(MTupdatePushConfig, {
      [MTupdatePushConfig]: {
        config: config,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * Gets the Agora RTC token, token expiration time, and RTC UID matching the Agora Chat user ID according to the channel name (channelName).
   *
   * You must enable the Agora RTC feature before calling this API.
   *
   * If the channel name is set to null, an RTC token valid for all channels will be generated.
   *
   * This is an asynchronous method.
   *
   * @param channelName The Agora RTC channel name.
   * @returns The RTC token information. See {@link ChatRTCTokenInfo}.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the Agora Chat user IDs matching the Agora RTC UIDs.
   *
   * @param ids The Agora RTC UID list.
   * @returns The map of Agora RTC UIDs and Agora Chat user IDs.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Add error listener.
   *
   * Monitor SDK internal errors.
   */
  public addExceptListener(listener: ChatExceptionEventListener): void {
    chatlog.log(`${ChatClient.TAG}: addExceptListener: `);
    ExceptionHandler.getInstance().listeners.add(listener);
  }

  /**
   * Remove error listener.
   */
  public removeExceptListener(listener: ChatExceptionEventListener): void {
    chatlog.log(`${ChatClient.TAG}: removeExceptListener: `);
    ExceptionHandler.getInstance().listeners.delete(listener);
  }

  /**
   * Remove all error listener.
   */
  public removeAllExceptListener(): void {
    chatlog.log(`${ChatClient.TAG}: removeAllExceptListener: `);
    ExceptionHandler.getInstance().listeners.clear();
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
