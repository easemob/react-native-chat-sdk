import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatPresenceEventListener } from './ChatEvents';
import { chatlog } from './common/ChatLog';
import { ChatPresence } from './common/ChatPresence';
import {
  MTfetchPresenceStatus,
  MTfetchSubscribedMembersWithPageNum,
  MTonPresenceStatusChanged,
  MTpresenceSubscribe,
  MTpresenceUnsubscribe,
  MTpublishPresenceWithDescription,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';

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
   * Adds a presence listener.
   *
   * @param listener The presence listener to add.
   */
  addPresenceListener(listener: ChatPresenceEventListener): void {
    this._presenceListeners.add(listener);
  }

  /**
   * Removes a presence listener.
   *
   * @param listener The presence listener to remove.
   */
  removePresenceListener(listener: ChatPresenceEventListener): void {
    this._presenceListeners.delete(listener);
  }

  /**
   * Clears all presence listeners.
   */
  removeAllPresenceListener(): void {
    this._presenceListeners.clear();
  }

  /**
   * Publishes a custom presence state.
   *
   * @param description The extension information of the presence state. It can be set as nil.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Subscribes to the presence state of a user.
   *
   * If the subscription succeeds, the subscriber will receive the callback when the presence state of the user changes.
   *
   * @param members The array of user IDs users whose presence state you want to subscribe to.
   * @param expiry The subscription duration in seconds. The duration cannot exceed 2,592,000 (30×24×3600) seconds, i.e., 30 days.
   * @returns The current presence state of users to whom you have subscribed.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Unsubscribes from the presence state of the unspecified users.
   *
   * @param members The array of user IDs whose presence state you want to unsubscribe from.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Uses the pagination to get a list of users whose presence states you have subscribed to.
   *
   * @param pageNum The current page number, starting from 1.
   * @param pageSize The number of subscribed users that you expect to get on each page.
   * @returns The user IDs of your subscriptions. The SDK returns `null` if you does not subscribe to the presence state of any users.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the current presence state of specified users.
   *
   * @param members The array of user IDs whose current presence state you want to check.
   * @returns The current presence states of the specified users.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
