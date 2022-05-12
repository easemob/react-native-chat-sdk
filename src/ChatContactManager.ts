import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatContactEventListener } from './ChatEvents';
import { ChatError } from './common/ChatError';
import { BaseManager } from './__internal__/Base';
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
} from './__internal__/Consts';
import { Native } from './__internal__/Native';

/**
 * The contact manager class, which manages chat contacts such as adding, deleting, retrieving, and modifying contacts.
 */
export class ChatContactManager extends BaseManager {
  protected static TAG = 'ChatContactManager';
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
          listener.onContactAdded(params.username);
          break;
        case 'onContactDeleted':
          listener.onContactDeleted(params.username);
          break;
        case 'onContactInvited':
          listener.onContactInvited(params.username, params.reason);
          break;
        case 'onFriendRequestAccepted':
          listener.onFriendRequestAccepted(params.username);
          break;
        case 'onFriendRequestDeclined':
          listener.onFriendRequestDeclined(params.username);
          break;

        default:
          throw new ChatError({
            code: 1,
            description: `This type is not supported. ` + contactEventType,
          });
      }
    });
  }

  /**
   * Add contact listener
   *
   * @param listener The listener to be added.
   */
  public addContactListener(listener: ChatContactEventListener): void {
    this._contactListeners.add(listener);
  }

  /**
   * Remove contact listener
   *
   * @param listener The listener to be deleted.
   */
  public removeContactListener(listener: ChatContactEventListener): void {
    this._contactListeners.delete(listener);
  }

  /**
   * Clear contact listener
   */
  public removeAllContactListener(): void {
    this._contactListeners.clear();
  }

  /**
   * Adds a new contact.
   *
   * @param username The user to be added.
   * @param reason (optional) The invitation message.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addContact(
    username: string,
    reason: string = ''
  ): Promise<void> {
    console.log(`${ChatContactManager.TAG}: addContact: `, username);
    let r: any = await Native._callMethod(MTaddContact, {
      [MTaddContact]: {
        username: username,
        reason: reason,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Deletes a contact and all the related conversations.
   *
   * @param username The contact to be deleted.
   * @param keepConversation Whether to retain conversations of the deleted contact.
   * - `true`: Yes.
   * - `false`: (default) No.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteContact(
    username: string,
    keepConversation: boolean = false
  ): Promise<void> {
    console.log(`${ChatContactManager.TAG}: deleteContact: `, username);
    let r: any = await Native._callMethod(MTdeleteContact, {
      [MTdeleteContact]: {
        username: username,
        keepConversation: keepConversation,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Gets all the contacts from the server.
   *
   * @returns The list of contacts.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getAllContactsFromServer(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getAllContactsFromServer: `);
    let r: any = await Native._callMethod(MTgetAllContactsFromServer);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetAllContactsFromServer];
    return ret;
  }

  /**
   * Gets the contact list from the local database.
   *
   * @returns The contact list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getAllContactsFromDB(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getAllContactsFromDB: `);
    let r: any = await Native._callMethod(MTgetAllContactsFromDB);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetAllContactsFromDB];
    return ret;
  }

  /**
   * Adds a user to the block list.
   * You can send messages to the users on the block list, but cannot receive messages from them.
   *
   * @param username The user to be added to the block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addUserToBlockList(username: string): Promise<void> {
    console.log(`${ChatContactManager.TAG}: addUserToBlockList: `, username);
    let r: any = await Native._callMethod(MTaddUserToBlockList, {
      [MTaddUserToBlockList]: {
        username,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Removes the contact from the block list.
   *
   * @param username The contact to be removed from the block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeUserFromBlockList(username: string): Promise<void> {
    console.log(
      `${ChatContactManager.TAG}: removeUserFromBlockList: `,
      username
    );
    let r: any = await Native._callMethod(MTremoveUserFromBlockList, {
      [MTremoveUserFromBlockList]: {
        username,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Gets the block list from the server.
   *
   * @returns The block list obtained from the server.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getBlockListFromServer(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getBlockListFromServer: `);
    let r: any = await Native._callMethod(MTgetBlockListFromServer);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetBlockListFromServer];
    return ret;
  }

  /**
   * Gets the block list from the local database.
   *
   * @returns The block list obtained from the local database.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getBlockListFromDB(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getBlockListFromDB: `);
    let r: any = await Native._callMethod(MTgetBlockListFromDB);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetBlockListFromDB];
    return ret;
  }

  /**
   * Accepts a friend invitation。
   *
   * @param username The user who sends the friend invitation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async acceptInvitation(username: string): Promise<void> {
    console.log(`${ChatContactManager.TAG}: acceptInvitation: `);
    let r: any = await Native._callMethod(MTacceptInvitation, {
      [MTacceptInvitation]: { username },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Declines a friend invitation.
   *
   * @param username The user who sends the friend invitation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async declineInvitation(username: string): Promise<void> {
    console.log(`${ChatContactManager.TAG}: declineInvitation: `, username);
    let r: any = await Native._callMethod(MTdeclineInvitation, {
      [MTdeclineInvitation]: { username },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Gets the unique IDs of the current user on the other devices. The ID is in the format of username + "/" + resource.
   *
   * @returns The list of unique IDs of users on the other devices if the method succeeds.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getSelfIdsOnOtherPlatform(): Promise<Array<string>> {
    console.log(`${ChatContactManager.TAG}: getSelfIdsOnOtherPlatform: `);
    let r: any = await Native._callMethod(MTgetSelfIdsOnOtherPlatform);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetSelfIdsOnOtherPlatform];
    return ret;
  }
}
