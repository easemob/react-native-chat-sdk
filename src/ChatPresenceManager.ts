import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatPresenceEventListener } from './ChatEvents';
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
    console.log(`${ChatPresenceManager.TAG}: setNativeListener: `);
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
    console.log('test: ', params);
    this._presenceListeners.forEach((listener: ChatPresenceEventListener) => {
      const ret: Array<ChatPresence> = [];
      const l: Array<any> = params?.presences;
      l.forEach((value: any) => {
        console.log('test: ', value);
        ret.push(new ChatPresence(value));
      });
      listener.onPresenceStatusChanged(ret);
    });
  }

  /**
   * Add presence listener.
   *
   * @param listener The listener to be added.
   */
  addPresenceListener(listener: ChatPresenceEventListener): void {
    this._presenceListeners.add(listener);
  }

  /**
   * Remove presence listener.
   *
   * @param listener The listener to be deleted.
   */
  removePresenceListener(listener: ChatPresenceEventListener): void {
    this._presenceListeners.delete(listener);
  }

  /**
   * Clear all presence listener.
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
  public async publishPresenceWithDescription(
    description?: string
  ): Promise<void> {
    console.log(
      `${ChatPresenceManager.TAG}: publishPresenceWithDescription: `,
      description
    );
    let r: any = await Native._callMethod(MTpublishPresenceWithDescription, {
      [MTpublishPresenceWithDescription]: {
        desc: description,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
  }

  /**
   * Subscribes to a user's presence states. If the subscription succeeds, the subscriber will receive the callback when the user's presence state changes.
   *
   * @param members The list of IDs of users whose presence states you want to subscribe to.
   * @param expiry The expiration time of the presence subscription.
   * @returns Which contains IDs of users whose presence states you have subscribed to.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async subscribe(
    members: Array<string>,
    expiry: number
  ): Promise<Array<ChatPresence>> {
    console.log(`${ChatPresenceManager.TAG}: subscribe: `, members, expiry);
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
   * Unsubscribes from a user's presence states.
   *
   * @param members The array of IDs of users whose presence states you want to unsubscribe from.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async unSubscribe(members: Array<string>): Promise<void> {
    console.log(`${ChatPresenceManager.TAG}: unSubscribe: `, members);
    let r: any = await Native._callMethod(MTpresenceUnsubscribe, {
      [MTpresenceUnsubscribe]: {
        members,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
  }

  /**
   * Uses pagination to get a list of users whose presence states you have subscribed to.
   *
   * @param pageNum The current page number, starting from 1.
   * @param pageSize The number of subscribed users on each page.
   * @returns Which contains IDs of users whose presence states you have subscribed to. Returns null if you subscribe to no user's presence state.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchSubscribedMembers(
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<Array<string>> {
    console.log(
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
   * Gets the current presence state of users.
   *
   * @param members The array of IDs of users whose current presence state you want to check.
   * @returns Which contains the users whose presence state you have subscribed to.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchPresenceStatus(
    members: Array<string>
  ): Promise<Array<ChatPresence>> {
    console.log(`${ChatPresenceManager.TAG}: fetchPresenceStatus: `, members);
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
