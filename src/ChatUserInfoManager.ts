import type { EventSubscription, NativeEventEmitter } from 'react-native';

import {
  MTfetchSubscribedUsers,
  MTfetchUserInfoById,
  MTgetLocalUserInfoByIds,
  MTonUserInfoChanged,
  MTsubscribeUsersInfo,
  MTunsubscribeUsersInfo,
  MTupdateOwnUserInfo,
} from './__internal__/Consts';
import { ExceptionHandler } from './__internal__/ErrorHandler';
import { Native } from './__internal__/Native';
import type { ChatUserInfoEventListener } from './ChatEvents';
import { chatlog } from './common/ChatConst';
import { ChatException } from './common/ChatError';
import { ChatUserInfo } from './common/ChatUserInfo';
import { Factory } from './__internal__/Factory';

/**
 * The user information manager for updating and getting user attributes.
 */
export class ChatUserInfoManager extends Native {
  private static TAG = 'ChatUserInfoManager';

  private _userInfoListeners: Set<ChatUserInfoEventListener>;
  private _userInfoSubscriptions: Map<string, EventSubscription>;

  constructor() {
    super();
    this._userInfoListeners = new Set<ChatUserInfoEventListener>();
    this._userInfoSubscriptions = new Map<string, EventSubscription>();
  }

  public setNativeListener(event: NativeEventEmitter): void {
    chatlog.log(`${ChatUserInfoManager.TAG}: setNativeListener: `);
    this._userInfoSubscriptions.forEach((value: EventSubscription) => {
      value.remove();
    });
    this._userInfoSubscriptions.clear();
    this._userInfoSubscriptions.set(
      MTonUserInfoChanged,
      event.addListener(MTonUserInfoChanged, (params: any) => {
        this.invokeUserInfoListener(params);
      })
    );
  }

  private invokeUserInfoListener(params: any): void {
    this._userInfoListeners.forEach((listener: ChatUserInfoEventListener) => {
      const userInfoEventType = params.type;
      switch (userInfoEventType) {
        case 'onSelfUserInfoUpdate':
          listener.onSelfUserInfoUpdate?.(new ChatUserInfo(params.userInfo));
          break;
        case 'onUserInfoUpdate': {
          const ret: ChatUserInfo[] = [];
          const l: Array<any> = params?.userInfos;
          l?.forEach((value: any) => {
            ret.push(new ChatUserInfo(value));
          });
          listener.onUserInfoUpdate?.(ret);
          break;
        }
        default:
          ExceptionHandler.getInstance().sendExcept({
            except: new ChatException({
              code: 1,
              description: `This type is not supported. ` + userInfoEventType,
            }),
            from: ChatUserInfoManager.TAG,
          });
      }
    });
  }

  /**
   * Adds a user information listener.
   *
   * @param listener The listener to add.
   */
  public addUserInfoListener(listener: ChatUserInfoEventListener): void {
    chatlog.log(`${ChatUserInfoManager.TAG}: addUserInfoListener: `);
    this._userInfoListeners.add(listener);
  }

  /**
   * Removes the user information listener.
   *
   * @param listener The listener to remove.
   */
  public removeUserInfoListener(listener: ChatUserInfoEventListener): void {
    chatlog.log(`${ChatUserInfoManager.TAG}: removeUserInfoListener: `);
    this._userInfoListeners.delete(listener);
  }

  /**
   * Removes all user information listeners.
   */
  public removeAllUserInfoListener(): void {
    chatlog.log(`${ChatUserInfoManager.TAG}: removeAllUserInfoListener: `);
    this._userInfoListeners.clear();
  }

  /**
   * Modifies the user attributes of the current user.
   *
   * @params The parameter set.
   * - [nickName] The nickname of the user.
   * - [avatarUrl] The avatar URL of the user.
   * - [mail] The email address of the user.
   * - [phone] The phone number of the user.
   * - [gender] The gender of the user. The value can only be `0`, `1`, or `2`. Other values are invalid.
   *    - `0`: (Default) Unknown;
   *    - `1`: Male;
   *    - `2`: Female.
   * - [sign] The signature of the user.
   * - [birth] The birthday of the user.
   * - [ext] The custom extension information of the user. You can set it to an empty string or type custom information and encapsulate them as a JSON string.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateOwnUserInfo(params: {
    nickName?: string;
    avatarUrl?: string;
    mail?: string;
    phone?: string;
    gender?: number;
    sign?: string;
    birth?: string;
    ext?: string;
  }): Promise<void> {
    chatlog.log(`${ChatUserInfoManager.TAG}: updateOwnUserInfo: `, params);
    const userId = await Factory.getChatClient().getCurrentUsername();
    const ret = await this.fetchUserInfoById([userId]);
    if (ret.has(userId)) {
      let userInfo = new ChatUserInfo(ret.get(userId)!);
      userInfo = Object.assign(userInfo, params);
      let r: any = await Native._callMethod(MTupdateOwnUserInfo, {
        [MTupdateOwnUserInfo]: {
          userInfo,
        },
      });
      ChatUserInfoManager.checkErrorFromResult(r);
    }
  }

  /**
   * Gets the user attributes of the specified users.
   *
   * @param userIds The user ID array.
   * @returns A map that contains key-value pairs where the key is the user ID and the value is user attributes，see {@link ChatUserInfo}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchUserInfoById(
    userIds: Array<string>
  ): Promise<Map<string, ChatUserInfo>> {
    chatlog.log(`${ChatUserInfoManager.TAG}: fetchUserInfoById: `, userIds);
    let r: any = await Native._callMethod(MTfetchUserInfoById, {
      [MTfetchUserInfoById]: {
        userIds: userIds,
      },
    });
    ChatUserInfoManager.checkErrorFromResult(r);
    const ret = new Map<string, ChatUserInfo>();
    Object.entries(r?.[MTfetchUserInfoById]).forEach((value: [string, any]) => {
      const userInfo = new ChatUserInfo(value[1]);
      ret.set(value[0], userInfo);
    });
    return ret;
  }

  /**
   * Gets the user attributes of the specified users from the local database.
   *
   * @param userIds The user ID array.
   * @returns A map that contains key-value pairs where the key is the user ID and the value is user attributes, see {@link ChatUserInfo}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getLocalUserInfoByIds(
    userIds: Array<string>
  ): Promise<Map<string, ChatUserInfo>> {
    chatlog.log(`${ChatUserInfoManager.TAG}: getLocalUserInfoByIds: `, userIds);
    let r: any = await Native._callMethod(MTgetLocalUserInfoByIds, {
      [MTgetLocalUserInfoByIds]: {
        userIds: userIds,
      },
    });
    ChatUserInfoManager.checkErrorFromResult(r);
    const ret = new Map<string, ChatUserInfo>();
    Object.entries(r?.[MTgetLocalUserInfoByIds] ?? {}).forEach(
      (value: [string, any]) => {
        const userInfo = new ChatUserInfo(value[1]);
        ret.set(value[0], userInfo);
      }
    );
    return ret;
  }

  /**
   * Subscribes to the user attributes of the specified users.
   *
   * When the user attributes of a subscribed user are updated, the {@link ChatUserInfoEventListener.onUserInfoUpdate} callback is triggered.
   *
   * @param userIds The user ID array.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async subscribeUsersInfo(userIds: Array<string>): Promise<void> {
    chatlog.log(`${ChatUserInfoManager.TAG}: subscribeUsersInfo: `, userIds);
    let r: any = await Native._callMethod(MTsubscribeUsersInfo, {
      [MTsubscribeUsersInfo]: {
        userIds: userIds,
      },
    });
    ChatUserInfoManager.checkErrorFromResult(r);
  }

  /**
   * Unsubscribes from the user attributes of the specified users.
   *
   * @param userIds The user ID array.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async unsubscribeUsersInfo(userIds: Array<string>): Promise<void> {
    chatlog.log(`${ChatUserInfoManager.TAG}: unsubscribeUsersInfo: `, userIds);
    let r: any = await Native._callMethod(MTunsubscribeUsersInfo, {
      [MTunsubscribeUsersInfo]: {
        userIds: userIds,
      },
    });
    ChatUserInfoManager.checkErrorFromResult(r);
  }

  /**
   * Gets the list of users whose user attributes are subscribed by the current user.
   *
   * @returns The list of user attributes of the subscribed users. See {@link ChatUserInfo}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchSubscribedUsers(): Promise<ChatUserInfo[]> {
    chatlog.log(`${ChatUserInfoManager.TAG}: fetchSubscribedUsers: `);
    let r: any = await Native._callMethod(MTfetchSubscribedUsers, {
      [MTfetchSubscribedUsers]: {},
    });
    ChatUserInfoManager.checkErrorFromResult(r);
    const list: any[] = r?.[MTfetchSubscribedUsers]?.users ?? [];
    const ret: ChatUserInfo[] = [];
    for (const i of list) {
      ret.push(new ChatUserInfo(i));
    }
    return ret;
  }

  /**
   * Gets attributes of the current user from the server.
   *
   * @returns The obtained user attributes. See {@link ChatUserInfo}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchOwnInfo(): Promise<ChatUserInfo | undefined> {
    chatlog.log(`${ChatUserInfoManager.TAG}: fetchOwnInfo: `);
    const id = await Factory.getChatClient().getCurrentUsername();
    if (id) {
      const ret = await this.fetchUserInfoById([id]);
      if (ret.size > 0) {
        return ret.get(id);
      }
    }
    return undefined;
  }
}
