import type { NativeEventEmitter } from 'react-native';
import { Native } from './__internal__/Native';

export class ChatPushManager extends Native {
  private static TAG = 'ChatPushManager';
  constructor() {
    super();
    // this._contactListeners = new Set<ChatContactEventListener>();
    // this._contactSubscriptions = new Map<string, EmitterSubscription>();
  }

  //   private _contactListeners: Set<ChatContactEventListener>;
  //   private _contactSubscriptions: Map<string, EmitterSubscription>;

  public setNativeListener(_event: NativeEventEmitter): void {
    console.log(`${ChatPushManager.TAG}: setNativeListener: `);
    //   this._contactSubscriptions.forEach((value: EmitterSubscription) => {
    //     value.remove();
    //   });
    //   this._contactSubscriptions.clear();
    //   this._contactSubscriptions.set(
    //     MTonContactChanged,
    //     event.addListener(MTonContactChanged, (params: any) => {
    //       this.invokeContactListener(params);
    //     })
    //   );
  }

  //   private invokeContactListener(params: any): void {
  //     this._contactListeners.forEach((listener: ChatContactEventListener) => {
  //       const contactEventType = params.type;
  //       switch (contactEventType) {
  //         case 'onContactAdded':
  //           listener.onContactAdded(params.userName);
  //           break;
  //         case 'onContactDeleted':
  //           listener.onContactDeleted(params.userName);
  //           break;
  //         case 'onContactInvited':
  //           listener.onContactInvited(params.userName, params.reason);
  //           break;
  //         case 'onFriendRequestAccepted':
  //           listener.onFriendRequestAccepted(params.userName);
  //           break;
  //         case 'onFriendRequestDeclined':
  //           listener.onFriendRequestDeclined(params.userName);
  //           break;

  //         default:
  //           throw new Error('This type is not supported. ');
  //       }
  //     });
  //   }

  //   public addContactListener(listener: ChatContactEventListener): void {
  //     this._contactListeners.add(listener);
  //   }
  //   public removeContactListener(listener: ChatContactEventListener): void {
  //     this._contactListeners.delete(listener);
  //   }
  //   public removeAllContactListener(): void {
  //     this._contactListeners.clear();
  //   }
}
