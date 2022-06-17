import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatContactEventListener } from './ChatEvents';
import { ChatError } from './common/ChatError';
import { chatlog } from './common/ChatLog';
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
 * The contact manager class, which manages chat contacts such as adding, retrieving, modifying, and deleting contacts.
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
    chatlog.log(`${ChatContactManager.TAG}: setNativeListener: `);
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
   * Adds a contact listener.
   *
   * @param listener The listener to add.
   */
  public addContactListener(listener: ChatContactEventListener): void {
    chatlog.log(`${ChatContactManager.TAG}: addContactListener: `);
    this._contactListeners.add(listener);
  }

  /**
   * Removes the contact listener.
   *
   * @param listener The listener to remove.
   */
  public removeContactListener(listener: ChatContactEventListener): void {
    chatlog.log(`${ChatContactManager.TAG}: removeContactListener: `);
    this._contactListeners.delete(listener);
  }

  /**
   * Removes all contact listeners.
   */
  public removeAllContactListener(): void {
    chatlog.log(`${ChatContactManager.TAG}: removeAllContactListener: `);
    this._contactListeners.clear();
  }

  /**
   * Adds a new contact.
   *
   * @param userId The user ID of the contact to add.
   * @param reason The reason for adding the contact. This parameter is optional and can be `null` or "".
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addContact(userId: string, reason: string = ''): Promise<void> {
    chatlog.log(`${ChatContactManager.TAG}: addContact: `, userId);
    let r: any = await Native._callMethod(MTaddContact, {
      [MTaddContact]: {
        username: userId,
        reason: reason,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Deletes a contact and all the related conversations.
   *
   * @param userId The user ID of the contact to delete.
   * @param keepConversation Whether to retain conversations of the contact to delete.
   * - `true`: Yes.
   * - (Default) `false`: No.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async deleteContact(
    userId: string,
    keepConversation: boolean = false
  ): Promise<void> {
    chatlog.log(`${ChatContactManager.TAG}: deleteContact: `, userId);
    let r: any = await Native._callMethod(MTdeleteContact, {
      [MTdeleteContact]: {
        username: userId,
        keepConversation: keepConversation,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Gets the contact list from the server.
   *
   * @returns The list of contacts.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getAllContactsFromServer(): Promise<Array<string>> {
    chatlog.log(`${ChatContactManager.TAG}: getAllContactsFromServer: `);
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
    chatlog.log(`${ChatContactManager.TAG}: getAllContactsFromDB: `);
    let r: any = await Native._callMethod(MTgetAllContactsFromDB);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetAllContactsFromDB];
    return ret;
  }

  /**
   * Adds a contact to the block list.
   *
   * You can send messages to the users on the block list, but cannot receive messages from them.
   *
   * @param userId The user ID of the contact to be added to the block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addUserToBlockList(userId: string): Promise<void> {
    chatlog.log(`${ChatContactManager.TAG}: addUserToBlockList: `, userId);
    let r: any = await Native._callMethod(MTaddUserToBlockList, {
      [MTaddUserToBlockList]: {
        username: userId,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Removes the contact from the block list.
   *
   * @param userId The user ID of the contact to be removed from the block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeUserFromBlockList(userId: string): Promise<void> {
    chatlog.log(`${ChatContactManager.TAG}: removeUserFromBlockList: `, userId);
    let r: any = await Native._callMethod(MTremoveUserFromBlockList, {
      [MTremoveUserFromBlockList]: {
        username: userId,
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
    chatlog.log(`${ChatContactManager.TAG}: getBlockListFromServer: `);
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
    chatlog.log(`${ChatContactManager.TAG}: getBlockListFromDB: `);
    let r: any = await Native._callMethod(MTgetBlockListFromDB);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetBlockListFromDB];
    return ret;
  }

  /**
   * Accepts a friend invitation。
   *
   * @param userId The user who sends the friend invitation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async acceptInvitation(userId: string): Promise<void> {
    chatlog.log(`${ChatContactManager.TAG}: acceptInvitation: `, userId);
    let r: any = await Native._callMethod(MTacceptInvitation, {
      [MTacceptInvitation]: { username: userId },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Declines a friend invitation.
   *
   * @param userId The user who sends the friend invitation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async declineInvitation(userId: string): Promise<void> {
    chatlog.log(`${ChatContactManager.TAG}: declineInvitation: `, userId);
    let r: any = await Native._callMethod(MTdeclineInvitation, {
      [MTdeclineInvitation]: { username: userId },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * Gets the unique IDs of the current user on the other devices. The ID is in the format of user ID + "/" + resource.
   *
   * @returns The list of unique IDs of users on the other devices if the method succeeds.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getSelfIdsOnOtherPlatform(): Promise<Array<string>> {
    chatlog.log(`${ChatContactManager.TAG}: getSelfIdsOnOtherPlatform: `);
    let r: any = await Native._callMethod(MTgetSelfIdsOnOtherPlatform);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetSelfIdsOnOtherPlatform];
    return ret;
  }
}
