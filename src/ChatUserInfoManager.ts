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
 * 用户信息管理类，负责更新及获取用户属性。
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
   * 添加用户信息监听器。
   *
   * @param listener 要添加的监听器。
   */
  public addUserInfoListener(listener: ChatUserInfoEventListener): void {
    chatlog.log(`${ChatUserInfoManager.TAG}: addUserInfoListener: `);
    this._userInfoListeners.add(listener);
  }

  /**
   * 移除用户信息监听器。
   *
   * @param listener 要移除的监听器。
   */
  public removeUserInfoListener(listener: ChatUserInfoEventListener): void {
    chatlog.log(`${ChatUserInfoManager.TAG}: removeUserInfoListener: `);
    this._userInfoListeners.delete(listener);
  }

  /**
   * 移除所有用户信息监听器。
   */
  public removeAllUserInfoListener(): void {
    chatlog.log(`${ChatUserInfoManager.TAG}: removeAllUserInfoListener: `);
    this._userInfoListeners.clear();
  }

  /**
   * 修改当前用户的信息。
   *
   * @param params 参数。
   * - [nickName] 用户昵称。
   * - [avatarUrl] 用户头像。
   * - [mail] 用户邮箱。
   * - [phone] 用户手机号。
   * - [gender] 用户性别。该参数的值可为 `0`、`1` 或 `2`，其他值无效。
   *   - `0`：（默认）未知；
   *   - `1`：男；
   *   - `2`：女。
   * - [sign] 用户签名。
   * - [birth] 用户的生日。
   * - [ext] 用户的自定义属性字段。该字段可为空，或设置为自定义扩展信息，封装为 JSON 字符串。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 获取指定用户的用户属性。
   *
   * @param userIds 要获取用户属性的用户 ID 列表。
   * @returns 用户 ID 和用户属性的键值对，详见 {@link ChatUserInfo}。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 从本地数据库获取指定用户的用户属性信息。
   *
   * @param userIds 用户 ID 数组。
   * @returns 键为用户 ID、值为用户属性的映射，详见 {@link ChatUserInfo}。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 订阅指定用户的用户属性。
   *
   * 已订阅用户的用户属性更新时，会触发 {@link ChatUserInfoEventListener.onUserInfoUpdate} 回调。
   *
   * @param userIds 用户 ID 数组。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 取消订阅指定用户的用户属性。
   *
   * @param userIds 用户 ID 数组。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 获取当前用户已订阅用户属性的用户列表。
   *
   * @returns 已订阅用户的用户属性列表。详见 {@link ChatUserInfo}。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 从服务器获取当前用户的用户属性信息。
   *
   * @returns 用户属性信息，详见 {@link ChatUserInfo}。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
