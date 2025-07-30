import type { EmitterSubscription, NativeEventEmitter } from 'react-native';

import {
  MTfetchPresenceStatus,
  MTfetchSubscribedMembersWithPageNum,
  MTonPresenceStatusChanged,
  MTpresenceSubscribe,
  MTpresenceUnsubscribe,
  MTpublishPresenceWithDescription,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import type { ChatPresenceEventListener } from './ChatEvents';
import { chatlog } from './common/ChatConst';
import { ChatPresence } from './common/ChatPresence';

/**
 * 在线状态管理器类。
 */
export class ChatPresenceManager extends Native {
  private static TAG = 'ChatPresenceManager';

  private _presenceListeners: Set<ChatPresenceEventListener>;
  private _presenceSubscriptions: Map<string, EmitterSubscription>;

  constructor() {
    super();
    this._presenceListeners = new Set();
    this._presenceSubscriptions = new Map();
  }

  public setNativeListener(event: NativeEventEmitter): void {
    chatlog.log(`${ChatPresenceManager.TAG}: setNativeListener: `);
    this._presenceSubscriptions.forEach((value: EmitterSubscription) => {
      value.remove();
    });
    this._presenceSubscriptions.clear();
    this._presenceSubscriptions.set(
      MTonPresenceStatusChanged,
      event.addListener(MTonPresenceStatusChanged, (params: any) => {
        this.invokePresenceListener(params);
      })
    );
  }
  private invokePresenceListener(params: any): void {
    this._presenceListeners.forEach((listener: ChatPresenceEventListener) => {
      const ret: Array<ChatPresence> = [];
      const l: Array<any> = params?.presences;
      l.forEach((value: any) => {
        ret.push(new ChatPresence(value));
      });
      listener.onPresenceStatusChanged(ret);
    });
  }

  /**
   * 添加在线状态监听器。
   *
   * @param listener 要添加的在线状态监听器。
   */
  public addPresenceListener(listener: ChatPresenceEventListener): void {
    this._presenceListeners.add(listener);
  }

  /**
   * 移除在线状态监听器。
   *
   * @param listener 要移除的在线状态监听器。
   */
  public removePresenceListener(listener: ChatPresenceEventListener): void {
    this._presenceListeners.delete(listener);
  }

  /**
   * 清除所有在线状态监听器。
   */
  public removeAllPresenceListener(): void {
    this._presenceListeners.clear();
  }

  /**
   * 发布自定义在线状态。
   *
   * @param description 在线状态的扩展信息。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async publishPresence(description?: string): Promise<void> {
    chatlog.log(`${ChatPresenceManager.TAG}: publishPresence: `, description);
    let r: any = await Native._callMethod(MTpublishPresenceWithDescription, {
      [MTpublishPresenceWithDescription]: {
        desc: description,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
  }

  /**
   * 订阅指定用户的在线状态。
   *
   * 订阅成功后，在线状态变更时订阅者会收到回调通知。
   *
   * @param members 要订阅在线状态的用户 ID 数组。
   * @param expiry 订阅时长，单位为秒。最长不超过 2,592,000 (30×24×3600) 秒，即 30 天。
   * @returns 返回被订阅用户的当前状态。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async subscribe(
    members: Array<string>,
    expiry: number
  ): Promise<Array<ChatPresence>> {
    chatlog.log(`${ChatPresenceManager.TAG}: subscribe: `, members, expiry);
    let r: any = await Native._callMethod(MTpresenceSubscribe, {
      [MTpresenceSubscribe]: {
        members,
        expiry,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
    const ret: Array<ChatPresence> = [];
    Object.entries(r?.[MTpresenceSubscribe]).forEach((value: [string, any]) => {
      ret.push(new ChatPresence(value[1]));
    });
    return ret;
  }

  /**
   * 取消订阅指定用户的在线状态。
   *
   * @param members 要取消订阅在线状态的用户 ID 数组。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async unsubscribe(members: Array<string>): Promise<void> {
    chatlog.log(`${ChatPresenceManager.TAG}: unsubscribe: `, members);
    let r: any = await Native._callMethod(MTpresenceUnsubscribe, {
      [MTpresenceUnsubscribe]: {
        members,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
  }

  /**
   * 分页查询当前用户订阅了哪些用户的在线状态。
   *
   * @param pageNum 当前页码，从 1 开始。
   * @param pageSize 每页显示的被订阅用户数量。
   * @returns 返回订阅的在线状态所属的用户名。若当前未订阅任何用户的在线状态，返回空列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async fetchSubscribedMembers(
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<Array<string>> {
    chatlog.log(
      `${ChatPresenceManager.TAG}: fetchSubscribedMembers: `,
      pageNum,
      pageSize
    );
    let r: any = await Native._callMethod(MTfetchSubscribedMembersWithPageNum, {
      [MTfetchSubscribedMembersWithPageNum]: {
        pageNum,
        pageSize,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
    return r?.[MTfetchSubscribedMembersWithPageNum] as Array<string>;
  }

  /**
   * 查询指定用户的当前在线状态。
   *
   * @param members 用户 ID 数组，指定要查询哪些用户的在线状态。
   * @returns 被订阅用户的当前状态。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async fetchPresenceStatus(
    members: Array<string>
  ): Promise<Array<ChatPresence>> {
    chatlog.log(`${ChatPresenceManager.TAG}: fetchPresenceStatus: `, members);
    let r: any = await Native._callMethod(MTfetchPresenceStatus, {
      [MTfetchPresenceStatus]: {
        members,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
    const ret: Array<ChatPresence> = [];
    Object.entries(r?.[MTfetchPresenceStatus]).forEach(
      (value: [string, any]) => {
        ret.push(new ChatPresence(value[1]));
      }
    );
    return ret;
  }
}
