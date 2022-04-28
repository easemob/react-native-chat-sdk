import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatContactEventListener } from './ChatEvents';
import {
  MTacceptInvitation,
  MTaddContact,
  MTaddUserToBlockList,
  MTdeclineInvitation,
  MTdeleteContact,
  MTgetAllContactsFromDB,
  MTgetAllContactsFromServer,
  MTgetBlockListFromDB,
  MTgetBlockListFromServer,
  MTgetSelfIdsOnOtherPlatform,
  MTonContactChanged,
  MTremoveUserFromBlockList,
} from './_internal/Consts';
import { Native } from './_internal/Native';

export class ChatContactManager extends Native {
  private static TAG = 'ChatContactManager';
  constructor() {
    super();
    this._contactListeners = new Set<ChatContactEventListener>();
    this._contactSubscriptions = new Map<string, EmitterSubscription>();
  }

  private _contactListeners: Set<ChatContactEventListener>;
  private _contactSubscriptions: Map<string, EmitterSubscription>;

  public setNativeListener(event: NativeEventEmitter): void {
    console.log(`${ChatContactManager.TAG}: setNativeListener: `);
    this._contactSubscriptions.forEach((value: EmitterSubscription) => {
      value.remove();
    });
    this._contactSubscriptions.clear();
    this._contactSubscriptions.set(
      MTonContactChanged,
      event.addListener(MTonContactChanged, (params: any) => {
        this.invokeContactListener(params);
      })
    );
  }

  private invokeContactListener(params: any): void {
    this._contactListeners.forEach((listener: ChatContactEventListener) => {
      const contactEventType = params.type;
      switch (contactEventType) {
        case 'onContactAdded':
          listener.onContactAdded(params.userName);
          break;
        case 'onContactDeleted':
          listener.onContactDeleted(params.userName);
          break;
        case 'onContactInvited':
          listener.onContactInvited(params.userName, params.reason);
          break;
        case 'onFriendRequestAccepted':
          listener.onFriendRequestAccepted(params.userName);
          break;
        case 'onFriendRequestDeclined':
          listener.onFriendRequestDeclined(params.userName);
          break;

        default:
          throw new Error('This type is not supported. ');
      }
    });
  }

  public addContactListener(listener: ChatContactEventListener): void {
    this._contactListeners.add(listener);
  }
  public removeContactListener(listener: ChatContactEventListener): void {
    this._contactListeners.delete(listener);
  }
  public removeAllContactListener(): void {
    this._contactListeners.clear();
  }

  public async addContact(
    username: string,
    reason: string = ''
  ): Promise<void> {
    console.log(`${ChatContactManager.TAG}: addContact: ${username}`);
    let r: any = await Native._callMethod(MTaddContact, {
      [MTaddContact]: {
        username: username,
        reason: reason,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  public async deleteContact(
    username: string,
    keepConversation: boolean = false
  ): Promise<void> {
    console.log(`${ChatContactManager.TAG}: deleteContact: ${username}`);
    let r: any = await Native._callMethod(MTdeleteContact, {
      [MTdeleteContact]: {
        username: username,
        reason: keepConversation,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  public async getAllContactsFromServer(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getAllContactsFromServer: `);
    let r: any = await Native._callMethod(MTgetAllContactsFromServer);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetAllContactsFromServer];
    return ret;
  }

  public async getAllContactsFromDB(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getAllContactsFromDB: `);
    let r: any = await Native._callMethod(MTgetAllContactsFromDB);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetAllContactsFromDB];
    return ret;
  }

  public async addUserToBlockList(username: string): Promise<void> {
    console.log(`${ChatContactManager.TAG}: addUserToBlockList: `);
    let r: any = await Native._callMethod(MTaddUserToBlockList, {
      [MTaddUserToBlockList]: {
        username,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  public async removeUserFromBlockList(username: string): Promise<void> {
    console.log(`${ChatContactManager.TAG}: removeUserFromBlockList: `);
    let r: any = await Native._callMethod(MTremoveUserFromBlockList, {
      [MTremoveUserFromBlockList]: {
        username,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  public async getBlockListFromServer(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getBlockListFromServer: `);
    let r: any = await Native._callMethod(MTgetBlockListFromServer);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetBlockListFromServer];
    return ret;
  }

  public async getBlockListFromDB(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getBlockListFromDB: `);
    let r: any = await Native._callMethod(MTgetBlockListFromDB);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetBlockListFromDB];
    return ret;
  }

  public async acceptInvitation(username: string): Promise<void> {
    console.log(`${ChatContactManager.TAG}: acceptInvitation: `);
    let r: any = await Native._callMethod(MTacceptInvitation, {
      [MTacceptInvitation]: { username },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  public async declineInvitation(username: string): Promise<void> {
    console.log(`${ChatContactManager.TAG}: declineInvitation: `);
    let r: any = await Native._callMethod(MTdeclineInvitation, {
      [MTdeclineInvitation]: { username },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  public async getSelfIdsOnOtherPlatform(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getSelfIdsOnOtherPlatform: `);
    let r: any = await Native._callMethod(MTgetSelfIdsOnOtherPlatform);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetSelfIdsOnOtherPlatform];
    return ret;
  }
}
