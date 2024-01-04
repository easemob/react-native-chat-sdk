import type { EmitterSubscription, NativeEventEmitter } from 'react-native';

import { BaseManager } from './__internal__/Base';
import {
  MTacceptInvitation,
  MTaddContact,
  MTaddUserToBlockList,
  MTdeclineInvitation,
  MTdeleteContact,
  MTfetchAllContacts,
  MTfetchContacts,
  MTgetAllContacts,
  MTgetAllContactsFromDB,
  MTgetAllContactsFromServer,
  MTgetBlockListFromDB,
  MTgetBlockListFromServer,
  MTgetContact,
  MTgetSelfIdsOnOtherPlatform,
  MTonContactChanged,
  MTremoveUserFromBlockList,
  MTsetContactRemark,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import type { ChatContactEventListener } from './ChatEvents';
import { chatlog } from './common/ChatConst';
import { ChatContact } from './common/ChatContact';
import { ChatCursorResult } from './common/ChatCursorResult';
import { ChatError } from './common/ChatError';

/**
 * 联系人管理类，用于添加、查询和删除联系人。
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
          listener.onContactAdded?.(params.username);
          break;
        case 'onContactDeleted':
          listener.onContactDeleted?.(params.username);
          break;
        case 'onContactInvited':
          listener.onContactInvited?.(params.username, params.reason);
          break;
        case 'onFriendRequestAccepted':
          listener.onFriendRequestAccepted?.(params.username);
          break;
        case 'onFriendRequestDeclined':
          listener.onFriendRequestDeclined?.(params.username);
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
   * 添加联系人监听器。
   *
   * @param listener 要添加的监听器。
   */
  public addContactListener(listener: ChatContactEventListener): void {
    chatlog.log(`${ChatContactManager.TAG}: addContactListener: `);
    this._contactListeners.add(listener);
  }

  /**
   * 移除联系人监听器。
   *
   * @param listener 要移除的监听器。
   */
  public removeContactListener(listener: ChatContactEventListener): void {
    chatlog.log(`${ChatContactManager.TAG}: removeContactListener: `);
    this._contactListeners.delete(listener);
  }

  /**
   * 移除所有联系人监听器。
   */
  public removeAllContactListener(): void {
    chatlog.log(`${ChatContactManager.TAG}: removeAllContactListener: `);
    this._contactListeners.clear();
  }

  /**
   * 添加好友。
   *
   * @param userId 要添加为好友的用户 ID。
   * @param reason 添加为好友的原因。该参数可选，可设置为 `null` 或 `""`。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 删除联系人及其相关的会话。
   *
   * @param userId 要删除的联系人用户 ID。
   * @param keepConversation 是否保留要删除的联系人的会话。
   * - `true`：是；
   * - （默认）`false`：否。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 从服务器获取联系人列表。
   *
   * @returns 联系人列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getAllContactsFromServer(): Promise<Array<string>> {
    chatlog.log(`${ChatContactManager.TAG}: getAllContactsFromServer: `);
    let r: any = await Native._callMethod(MTgetAllContactsFromServer);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetAllContactsFromServer];
    return ret;
  }

  /**
   * 从本地数据库获取联系人列表。
   *
   * @returns 联系人列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getAllContactsFromDB(): Promise<Array<string>> {
    chatlog.log(`${ChatContactManager.TAG}: getAllContactsFromDB: `);
    let r: any = await Native._callMethod(MTgetAllContactsFromDB);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetAllContactsFromDB];
    return ret;
  }

  /**
   * 将指定用户加入黑名单。
   *
   * 你可以向黑名单中用户发消息，但是接收不到对方发送的消息。
   *
   * @param userId 要加入黑名单的用户的用户 ID。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 将指定用户移除黑名单。
   *
   * @param userId 要在黑名单中移除的用户 ID。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 从服务器获取黑名单列表。
   *
   * @returns 黑名单列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getBlockListFromServer(): Promise<Array<string>> {
    chatlog.log(`${ChatContactManager.TAG}: getBlockListFromServer: `);
    let r: any = await Native._callMethod(MTgetBlockListFromServer);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetBlockListFromServer];
    return ret;
  }

  /**
   * 从本地数据库获取黑名单列表。
   *
   * @returns 黑名单列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getBlockListFromDB(): Promise<Array<string>> {
    chatlog.log(`${ChatContactManager.TAG}: getBlockListFromDB: `);
    let r: any = await Native._callMethod(MTgetBlockListFromDB);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetBlockListFromDB];
    return ret;
  }

  /**
   * 接受加好友的邀请。
   *
   * @param userId 发起好友邀请的用户 ID。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async acceptInvitation(userId: string): Promise<void> {
    chatlog.log(`${ChatContactManager.TAG}: acceptInvitation: `, userId);
    let r: any = await Native._callMethod(MTacceptInvitation, {
      [MTacceptInvitation]: { username: userId },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * 拒绝加好友的邀请。
   *
   * @param userId 发起好友邀请的用户 ID。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async declineInvitation(userId: string): Promise<void> {
    chatlog.log(`${ChatContactManager.TAG}: declineInvitation: `, userId);
    let r: any = await Native._callMethod(MTdeclineInvitation, {
      [MTdeclineInvitation]: { username: userId },
    });
    ChatContactManager.checkErrorFromResult(r);
  }

  /**
   * 获取登录用户在其他登录设备上唯一 ID，该 ID 由 user ID + "/" + resource 组成。
   *
   * @returns 该方法调用成功会返回 ID 列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getSelfIdsOnOtherPlatform(): Promise<Array<string>> {
    chatlog.log(`${ChatContactManager.TAG}: getSelfIdsOnOtherPlatform: `);
    let r: any = await Native._callMethod(MTgetSelfIdsOnOtherPlatform);
    ChatContactManager.checkErrorFromResult(r);
    const ret: string[] = r?.[MTgetSelfIdsOnOtherPlatform];
    return ret;
  }

  /**
   * 从本地数据库获取所有所有联系人。
   *
   * @returns 联系人列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getAllContacts(): Promise<ChatContact[]> {
    chatlog.log(`${ChatContactManager.TAG}: getAllContacts: `);
    let r: any = await Native._callMethod(MTgetAllContacts);
    ChatContactManager.checkErrorFromResult(r);
    const list: any[] = r?.[MTgetAllContacts];
    const ret: ChatContact[] = [];
    for (const i of list) {
      ret.push(new ChatContact(i));
    }
    return ret;
  }

  /**
   * 从本地数据库获取指定联系人备注信息。
   *
   * @param userId 用户ID。
   * @returns 联系人对象。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async getContact(userId: string): Promise<ChatContact> {
    chatlog.log(`${ChatContactManager.TAG}: getContact: `);
    let r: any = await Native._callMethod(MTgetContact, {
      [MTgetContact]: {
        userId,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
    return new ChatContact(r?.[MTgetContact]);
  }

  /**
   * 从服务器获取所有联系人。
   *
   * @returns 联系人列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async fetchAllContacts(): Promise<ChatContact[]> {
    chatlog.log(`${ChatContactManager.TAG}: fetchAllContacts: `);
    let r: any = await Native._callMethod(MTfetchAllContacts);
    ChatContactManager.checkErrorFromResult(r);
    const list: any[] = r?.[MTfetchAllContacts];
    const ret: ChatContact[] = [];
    for (const i of list) {
      ret.push(new ChatContact(i));
    }
    return ret;
  }

  /**
   * 从服务器分页获取联系人
   * @params params -
   * - cursor: 分页游标，默认为空，可以请求第一页。
   * - pageSize: 每页最大数目。默认20。 [1-50]
   * @returns 联系人列表。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async fetchContacts(params: {
    cursor?: string;
    pageSize?: number;
  }): Promise<ChatCursorResult<ChatContact>> {
    chatlog.log(`${ChatContactManager.TAG}: fetchContacts: `);
    let r: any = await Native._callMethod(MTfetchContacts, {
      [MTfetchContacts]: {
        cursor: params.cursor,
        pageSize: params.pageSize ?? 20,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatContact>({
      cursor: r?.[MTfetchContacts].cursor,
      list: r?.[MTfetchContacts].list,
      opt: {
        map: (param: any) => {
          return new ChatContact(param);
        },
      },
    });
    return ret;
  }

  /**
   * 设置联系人备注。
   *
   * @param contact 联系人对象，包括将要设置的备注。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  public async setContactRemark(contact: ChatContact): Promise<void> {
    chatlog.log(`${ChatContactManager.TAG}: setContactRemark: `);
    let r: any = await Native._callMethod(MTsetContactRemark, {
      [MTsetContactRemark]: {
        userId: contact.userId,
        remark: contact.remark,
      },
    });
    ChatContactManager.checkErrorFromResult(r);
  }
}
