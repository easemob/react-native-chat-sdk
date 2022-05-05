import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatPresenceManagerListener } from './ChatEvents';
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

  private _presenceListeners: Set<ChatPresenceManagerListener>;
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
    this._presenceListeners.forEach((listener: ChatPresenceManagerListener) => {
      const ret: Array<ChatPresence> = [];
      const l: Array<any> = params?.[MTonPresenceStatusChanged].presences;
      l.forEach((value: any) => {
        ret.push(new ChatPresence(value));
      });
      listener.onPresenceStatusChanged(ret);
    });
  }

  addGroupListener(listener: ChatPresenceManagerListener): void {
    this._presenceListeners.add(listener);
  }
  removeGroupListener(listener: ChatPresenceManagerListener): void {
    this._presenceListeners.delete(listener);
  }
  removeAllGroupListener(): void {
    this._presenceListeners.clear();
  }

  public async publishPresenceWithDescription(
    description?: string
  ): Promise<void> {
    console.log(`${ChatPresenceManager.TAG}: publishPresenceWithDescription: `);
    let r: any = await Native._callMethod(MTpublishPresenceWithDescription, {
      [MTpublishPresenceWithDescription]: {
        desc: description,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
  }

  public async subscribe(
    members: Array<string>,
    expiry: number
  ): Promise<Array<ChatPresence>> {
    console.log(`${ChatPresenceManager.TAG}: subscribe: `);
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

  public async unSubscribe(members: Array<string>): Promise<void> {
    console.log(`${ChatPresenceManager.TAG}: unSubscribe: `);
    let r: any = await Native._callMethod(MTpresenceUnsubscribe, {
      [MTpresenceUnsubscribe]: {
        members,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
  }

  public async fetchSubscribedMembers(
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<Array<string>> {
    console.log(`${ChatPresenceManager.TAG}: fetchSubscribedMembers: `);
    let r: any = await Native._callMethod(MTfetchSubscribedMembersWithPageNum, {
      [MTfetchSubscribedMembersWithPageNum]: {
        pageNum,
        pageSize,
      },
    });
    ChatPresenceManager.checkErrorFromResult(r);
    return r?.[MTfetchSubscribedMembersWithPageNum] as Array<string>;
  }

  public async fetchPresenceStatus(
    members: Array<string>
  ): Promise<Array<ChatPresence>> {
    console.log(`${ChatPresenceManager.TAG}: fetchPresenceStatus: `);
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
