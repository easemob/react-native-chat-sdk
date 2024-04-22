import type { EmitterSubscription, NativeEventEmitter } from 'react-native';

import {
  MTaddChatRoomAdmin,
  MTaddMembersToChatRoomAllowList,
  MTblockChatRoomMembers,
  MTchangeChatRoomDescription,
  MTchangeChatRoomOwner,
  MTchangeChatRoomSubject,
  MTchatRoomChange,
  MTcreateChatRoom,
  MTdestroyChatRoom,
  MTfetchChatRoomAllowListFromServer,
  MTfetchChatRoomAnnouncement,
  MTfetchChatRoomAttributes,
  MTfetchChatRoomBlockList,
  MTfetchChatRoomInfoFromServer,
  MTfetchChatRoomMembers,
  MTfetchChatRoomMuteList,
  MTfetchPublicChatRoomsFromServer,
  MTgetChatRoom,
  MTisMemberInChatRoomAllowListFromServer,
  MTjoinChatRoom,
  MTleaveChatRoom,
  MTmuteAllChatRoomMembers,
  MTmuteChatRoomMembers,
  MTremoveChatRoomAdmin,
  MTremoveChatRoomAttributes,
  MTremoveChatRoomMembers,
  MTremoveMembersFromChatRoomAllowList,
  MTsetChatRoomAttributes,
  MTunBlockChatRoomMembers,
  MTunMuteAllChatRoomMembers,
  MTunMuteChatRoomMembers,
  MTupdateChatRoomAnnouncement,
} from './__internal__/Consts';
import { ExceptionHandler } from './__internal__/ErrorHandler';
import { Native } from './__internal__/Native';
import type { ChatRoomEventListener } from './ChatEvents';
import { chatlog } from './common/ChatConst';
import { ChatCursorResult } from './common/ChatCursorResult';
import { ChatException } from './common/ChatError';
import { ChatPageResult } from './common/ChatPageResult';
import { ChatRoom } from './common/ChatRoom';

/**
 * 聊天室管理类，负责聊天室加入和退出、聊天室列表获取以及成员权限管理等。
 */
export class ChatRoomManager extends Native {
  private static TAG = 'ChatRoomManager';
  constructor() {
    super();
    this._roomListeners = new Set<ChatRoomEventListener>();
    this._roomSubscriptions = new Map<string, EmitterSubscription>();
  }

  private _roomListeners: Set<ChatRoomEventListener>;
  private _roomSubscriptions: Map<string, EmitterSubscription>;

  public setNativeListener(event: NativeEventEmitter): void {
    chatlog.log(`${ChatRoomManager.TAG}: setNativeListener: `);
    this._roomSubscriptions.forEach((value: EmitterSubscription) => {
      value.remove();
    });
    this._roomSubscriptions.clear();
    this._roomSubscriptions.set(
      MTchatRoomChange,
      event.addListener(MTchatRoomChange, (params: any) => {
        this.invokeRoomListener(params);
      })
    );
  }

  private invokeRoomListener(params: any): void {
    this._roomListeners.forEach((listener: ChatRoomEventListener) => {
      const contactEventType = params?.type;
      switch (contactEventType) {
        case 'onChatRoomDestroyed':
          listener.onDestroyed?.({
            roomId: params.roomId,
            roomName: params.roomName,
          });
          break;
        case 'onMemberJoined':
          listener.onMemberJoined?.({
            roomId: params.roomId,
            participant: params.participant,
          });
          break;
        case 'onMemberExited':
          listener.onMemberExited?.({
            roomId: params.roomId,
            participant: params.participant,
            roomName: params.roomName,
          });
          break;
        case 'onRemovedFromChatRoom':
          listener.onMemberRemoved?.({
            roomId: params.roomId,
            participant: params.participant,
            roomName: params.roomName,
            reason: params.reason,
          });
          break;
        case 'onMuteListAdded':
          listener.onMuteListAdded?.({
            roomId: params.roomId,
            mutes: params.mutes,
            expireTime: params.expireTime,
          });
          break;
        case 'onMuteListRemoved':
          listener.onMuteListRemoved?.({
            roomId: params.roomId,
            mutes: params.mutes,
          });
          break;
        case 'onAdminAdded':
          listener.onAdminAdded?.({
            roomId: params.roomId,
            admin: params.admin,
          });
          break;
        case 'onAdminRemoved':
          listener.onAdminRemoved?.({
            roomId: params.roomId,
            admin: params.admin,
          });
          break;
        case 'onOwnerChanged':
          listener.onOwnerChanged?.({
            roomId: params.roomId,
            newOwner: params.newOwner,
            oldOwner: params.oldOwner,
          });
          break;
        case 'onAnnouncementChanged':
          listener.onAnnouncementChanged?.({
            roomId: params.roomId,
            announcement: params.announcement,
          });
          break;
        case 'onAllowListAdded':
          listener.onAllowListAdded?.({
            roomId: params.roomId,
            members: params.members,
          });
          break;
        case 'onAllowListRemoved':
          listener.onAllowListRemoved?.({
            roomId: params.roomId,
            members: params.members,
          });
          break;
        case 'onAllMemberMuteStateChanged':
          listener.onAllChatRoomMemberMuteStateChanged?.({
            roomId: params.roomId,
            isAllMuted: params.isAllMuted,
          });
          break;
        case 'onSpecificationChanged':
          listener.onSpecificationChanged?.(new ChatRoom(params.room));
          break;
        case 'onAttributesUpdated':
          const attributes: Map<string, string> = new Map();
          Object.entries(params).forEach((v: [string, any]) => {
            attributes.set(v[0], v[1]);
          });
          listener.onAttributesUpdated?.({
            roomId: params.roomId,
            attributes: attributes,
            from: params.from,
          });
          break;
        case 'onAttributesRemoved':
          listener.onAttributesRemoved?.({
            roomId: params.roomId,
            removedKeys: params.removedKeys,
            from: params.from,
          });
          break;

        default:
          ExceptionHandler.getInstance().sendExcept({
            except: new ChatException({
              code: 1,
              description: `This type is not supported. ` + contactEventType,
            }),
            from: ChatRoomManager.TAG,
          });
      }
    });
  }

  /**
   * 注册聊天室监听器。
   *
   * @param listener 要注册的监听器。
   */
  public addRoomListener(listener: ChatRoomEventListener): void {
    chatlog.log(`${ChatRoomManager.TAG}: addRoomListener: `);
    this._roomListeners.add(listener);
  }

  /**
   * 移除聊天室监听器。
   *
   * @param listener 要移除的监听器。
   */
  public removeRoomListener(listener: ChatRoomEventListener): void {
    chatlog.log(`${ChatRoomManager.TAG}: removeRoomListener: `);
    this._roomListeners.delete(listener);
  }

  /**
   * 移除所有聊天室监听器。
   */
  public removeAllRoomListener(): void {
    chatlog.log(`${ChatRoomManager.TAG}: removeAllRoomListener: `);
    this._roomListeners.clear();
  }

  /**
   * 加入聊天室。
   *
   * 退出聊天室见： {@link leaveChatRoom}。
   *
   * @param roomId 要加入的聊天室的 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async joinChatRoom(roomId: string): Promise<void> {
    chatlog.log(`${ChatRoomManager.TAG}: joinChatRoom: ${roomId}`);
    let r: any = await Native._callMethod(MTjoinChatRoom, {
      [MTjoinChatRoom]: {
        roomId: roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 退出聊天室。
   *
   * @param roomId 要退出的聊天室 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async leaveChatRoom(roomId: string): Promise<void> {
    chatlog.log(`${ChatRoomManager.TAG}: leaveChatRoom: ${roomId}`);
    let r: any = await Native._callMethod(MTleaveChatRoom, {
      [MTleaveChatRoom]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 从服务器分页获取公开聊天室。
   *
   * @param pageNum 当前页码，从 1 开始。
   * @param pageSize 每页期望返回的聊天室数量。
   * @returns 获取的聊天室列表。详见 {@link ChatPageResult}。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchPublicChatRoomsFromServer(
    pageNum: number = 1,
    pageSize: number = 200
  ): Promise<ChatPageResult<ChatRoom>> {
    chatlog.log(
      `${ChatRoomManager.TAG}: fetchPublicChatRoomsFromServer: `,
      pageNum,
      pageSize
    );
    let r: any = await Native._callMethod(MTfetchPublicChatRoomsFromServer, {
      [MTfetchPublicChatRoomsFromServer]: {
        pageNum,
        pageSize,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret = new ChatPageResult<ChatRoom>({
      pageCount: r?.[MTfetchPublicChatRoomsFromServer].count,
      list: r?.[MTfetchPublicChatRoomsFromServer].list,
      opt: {
        map: (param: any) => {
          return new ChatRoom(param);
        },
      },
    });
    return ret;
  }

  /**
   * 从服务器获取聊天室详情。
   *
   * 默认不包含聊天室成员列表。
   *
   * @param roomId 聊天室 ID。
   * @returns 聊天室详情。如果聊天室不存在，返回 `undefined`。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchChatRoomInfoFromServer(
    roomId: string
  ): Promise<ChatRoom | undefined> {
    chatlog.log(
      `${ChatRoomManager.TAG}: fetchChatRoomInfoFromServer: ${roomId}`
    );
    let r: any = await Native._callMethod(MTfetchChatRoomInfoFromServer, {
      [MTfetchChatRoomInfoFromServer]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    const rr = r?.[MTfetchChatRoomInfoFromServer];
    if (rr) {
      return new ChatRoom(rr);
    }
    return undefined;
  }

  /**
   * 根据聊天室 ID 从本地数据库获取聊天室。
   *
   * @param roomId 聊天室 ID。
   * @returns 聊天室实例。如果聊天室不存在，返回 `undefined`。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async getChatRoomWithId(
    roomId: string
  ): Promise<ChatRoom | undefined> {
    chatlog.log(`${ChatRoomManager.TAG}: getChatRoomWithId: ${roomId}`);
    let r: any = await Native._callMethod(MTgetChatRoom, {
      [MTgetChatRoom]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    const rr = r?.[MTgetChatRoom];
    if (rr) {
      return new ChatRoom(rr);
    }
    return undefined;
  }

  /**
   * 创建聊天室。
   *
   * @param subject 聊天室名称。
   * @param description 聊天室描述。
   * @param welcome 新成员加入时的欢迎消息。
   * @param members 被邀请加入的成员用户 ID 列表。
   * @param maxCount 聊天室最大人数。
   * @returns 聊天室实例。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async createChatRoom(
    subject: string,
    description?: string,
    welcome?: string,
    members?: Array<string>,
    maxCount: number = 300
  ): Promise<ChatRoom> {
    chatlog.log(
      `${ChatRoomManager.TAG}: createChatRoom: `,
      subject,
      description,
      welcome,
      members,
      maxCount
    );
    let r: any = await Native._callMethod(MTcreateChatRoom, {
      [MTcreateChatRoom]: {
        subject: subject,
        desc: description,
        welcomeMsg: welcome,
        members: members,
        maxUserCount: maxCount,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret: ChatRoom = new ChatRoom(r?.[MTcreateChatRoom]);
    return ret;
  }

  /**
   * 解散聊天室。
   *
   * 仅聊天室所有者有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async destroyChatRoom(roomId: string): Promise<void> {
    chatlog.log(`${ChatRoomManager.TAG}: destroyChatRoom: `, roomId);
    let r: any = await Native._callMethod(MTdestroyChatRoom, {
      [MTdestroyChatRoom]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 修改聊天室名称。
   *
   * 仅聊天室所有者有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param subject 聊天室新名称
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async changeChatRoomSubject(
    roomId: string,
    subject: string
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: changeChatRoomSubject: ${roomId}, ${subject}`
    );
    let r: any = await Native._callMethod(MTchangeChatRoomSubject, {
      [MTchangeChatRoomSubject]: {
        roomId,
        subject,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 修改聊天室描述信息。
   *
   * 仅聊天室所有者有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param description 修改后的聊天室描述信息。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async changeChatRoomDescription(
    roomId: string,
    description: string
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: changeChatRoomSubject: `,
      roomId,
      description
    );
    let r: any = await Native._callMethod(MTchangeChatRoomDescription, {
      [MTchangeChatRoomDescription]: {
        roomId,
        description,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 获取聊天室成员用户 ID 列表。
   *
   * @param roomId 聊天室 ID。
   * @param cursor 开始取数据的游标位置。首次调用 `cursor` 传空字符串或 "null"，SDK 按照用户加入聊天室时间的倒序获取数据。
   * @param pageSize 每页期望返回的成员数。
   * @returns 聊天室成员的用户 ID 列表和 cursor。详见 {@link ChatCursorResult}。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchChatRoomMembers(
    roomId: string,
    cursor: string = '',
    pageSize: number = 200
  ): Promise<ChatCursorResult<string>> {
    chatlog.log(
      `${ChatRoomManager.TAG}: fetchChatRoomMembers: `,
      roomId,
      cursor,
      pageSize
    );
    let r: any = await Native._callMethod(MTfetchChatRoomMembers, {
      [MTfetchChatRoomMembers]: {
        roomId,
        cursor,
        pageSize,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<string>({
      cursor: r?.[MTfetchChatRoomMembers].cursor,
      list: r?.[MTfetchChatRoomMembers].list,
      opt: {
        map: (param: any) => {
          return param as string;
        },
      },
    });
    return ret;
  }

  /**
   * 将聊天室中指定成员禁言。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param muteMembers 要禁言的成员的用户 ID。
   * @param duration 禁言时长，单位为毫秒。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async muteChatRoomMembers(
    roomId: string,
    muteMembers: Array<string>,
    duration: number = -1
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: muteChatRoomMembers: `,
      roomId,
      muteMembers,
      duration
    );
    let r: any = await Native._callMethod(MTmuteChatRoomMembers, {
      [MTmuteChatRoomMembers]: {
        roomId,
        muteMembers,
        duration,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 取消对指定聊天室成员的禁言。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param unMuteMembers 要取消禁言的成员的用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async unMuteChatRoomMembers(
    roomId: string,
    unMuteMembers: Array<string>
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: unMuteChatRoomMembers: `,
      roomId,
      unMuteMembers
    );
    let r: any = await Native._callMethod(MTunMuteChatRoomMembers, {
      [MTunMuteChatRoomMembers]: {
        roomId,
        unMuteMembers,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 转让聊天室所有者权限。
   *
   * 仅聊天室所有者有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param newOwner 新聊天室所有者的用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async changeOwner(roomId: string, newOwner: string): Promise<void> {
    chatlog.log(`${ChatRoomManager.TAG}: changeOwner: `, roomId, newOwner);
    let r: any = await Native._callMethod(MTchangeChatRoomOwner, {
      [MTchangeChatRoomOwner]: {
        roomId,
        newOwner,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 添加聊天室管理员。
   *
   * 仅聊天室所有者有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param admin  聊天室管理员的用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async addChatRoomAdmin(roomId: string, admin: string): Promise<void> {
    chatlog.log(`${ChatRoomManager.TAG}: addChatRoomAdmin: `, roomId, admin);
    let r: any = await Native._callMethod(MTaddChatRoomAdmin, {
      [MTaddChatRoomAdmin]: {
        roomId,
        admin,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 移除聊天室管理员权限。
   *
   * @param roomId 聊天室 ID。
   * @param admin 要被移除管理员权限的成员用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async removeChatRoomAdmin(
    roomId: string,
    admin: string
  ): Promise<void> {
    chatlog.log(`${ChatRoomManager.TAG}: removeChatRoomAdmin: `, roomId, admin);
    let r: any = await Native._callMethod(MTremoveChatRoomAdmin, {
      [MTremoveChatRoomAdmin]: {
        roomId,
        admin,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 分页从服务器获取聊天室禁言名单。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param pageNum 当前页码，从 1 开始。
   * @param pageSize 期望每页获取的名单数量。
   * @returns 禁言成员的用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchChatRoomMuteList(
    roomId: string,
    pageNum: number = 1,
    pageSize: number = 200
  ): Promise<Array<string>> {
    chatlog.log(
      `${ChatRoomManager.TAG}: fetchChatRoomMuteList: `,
      roomId,
      pageNum,
      pageSize
    );
    let r: any = await Native._callMethod(MTfetchChatRoomMuteList, {
      [MTfetchChatRoomMuteList]: {
        roomId,
        pageNum,
        pageSize,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret: string[] = r?.[MTfetchChatRoomMuteList];
    return ret;
  }

  /**
   * 将成员移出聊天室。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param members 要被移出聊天室的成员用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async removeChatRoomMembers(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: removeChatRoomMembers: `,
      roomId,
      members
    );
    let r: any = await Native._callMethod(MTremoveChatRoomMembers, {
      [MTremoveChatRoomMembers]: {
        roomId,
        members,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 将指定成员加入聊天室黑名单。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param members 要被加入聊天室黑名单的成员用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async blockChatRoomMembers(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: blockChatRoomMembers: `,
      roomId,
      members
    );
    let r: any = await Native._callMethod(MTblockChatRoomMembers, {
      [MTblockChatRoomMembers]: {
        roomId,
        members,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 将指定用户从聊天室黑名单中移除。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param members 要被移除聊天室黑名单的用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async unBlockChatRoomMembers(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: unBlockChatRoomMembers: `,
      roomId,
      members
    );
    let r: any = await Native._callMethod(MTunBlockChatRoomMembers, {
      [MTunBlockChatRoomMembers]: {
        roomId,
        members,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 从服务器获取黑名单列表。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param pageNum 当前页码，从 1 开始。
   * @param pageSize 期望每页获取的名单数量。
   * @returns 聊天室黑名单用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchChatRoomBlockList(
    roomId: string,
    pageNum: number = 1,
    pageSize: number = 200
  ): Promise<Array<string>> {
    chatlog.log(
      `${ChatRoomManager.TAG}: fetchChatRoomBlockList: `,
      roomId,
      pageNum,
      pageSize
    );
    let r: any = await Native._callMethod(MTfetchChatRoomBlockList, {
      [MTfetchChatRoomBlockList]: {
        roomId,
        pageNum,
        pageSize,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    const ret: Array<string> = r?.[MTfetchChatRoomBlockList];
    return ret;
  }

  /**
   * 更新聊天室公告。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param announcement 修改后的聊天室公告内容。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async updateChatRoomAnnouncement(
    roomId: string,
    announcement: string
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: updateChatRoomAnnouncement: `,
      roomId,
      announcement
    );
    let r: any = await Native._callMethod(MTupdateChatRoomAnnouncement, {
      [MTupdateChatRoomAnnouncement]: {
        roomId,
        announcement,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 从服务器获取聊天室公告内容。
   *
   * @param roomId 聊天室 ID。
   * @returns 聊天室公告内容。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchChatRoomAnnouncement(
    roomId: string
  ): Promise<string | undefined> {
    chatlog.log(`${ChatRoomManager.TAG}: fetchChatRoomAnnouncement: `, roomId);
    let r: any = await Native._callMethod(MTfetchChatRoomAnnouncement, {
      [MTfetchChatRoomAnnouncement]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    return r?.[MTfetchChatRoomAnnouncement];
  }

  /**
   * 从服务器获取白名单列表。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @returns 白名单列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchChatRoomAllowListFromServer(
    roomId: string
  ): Promise<Array<string>> {
    chatlog.log(
      `${ChatRoomManager.TAG}: fetchChatRoomAllowListFromServer: `,
      roomId
    );
    let r: any = await Native._callMethod(MTfetchChatRoomAllowListFromServer, {
      [MTfetchChatRoomAllowListFromServer]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret: string[] = r?.[MTfetchChatRoomAllowListFromServer];
    return ret;
  }

  /**
   * 查询指定成员是否在聊天室白名单中。
   *
   * @param roomId 聊天室 ID。
   * @returns 指定成员是否在聊天室白名单中。
   * - `true`：是；
   * - `false`：否。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async isMemberInChatRoomAllowList(roomId: string): Promise<boolean> {
    chatlog.log(
      `${ChatRoomManager.TAG}: isMemberInChatRoomAllowList: `,
      roomId
    );
    let r: any = await Native._callMethod(
      MTisMemberInChatRoomAllowListFromServer,
      {
        [MTisMemberInChatRoomAllowListFromServer]: {
          roomId,
        },
      }
    );
    ChatRoomManager.checkErrorFromResult(r);
    let ret: boolean = r?.[MTisMemberInChatRoomAllowListFromServer];
    return ret;
  }

  /**
   * 将成员加入聊天室白名单。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param members 要加入聊天室白名单的成员用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async addMembersToChatRoomAllowList(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: addMembersToChatRoomAllowList: `,
      roomId,
      members
    );
    let r: any = await Native._callMethod(MTaddMembersToChatRoomAllowList, {
      [MTaddMembersToChatRoomAllowList]: {
        roomId,
        members,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 将聊天室成员从白名单中移除。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   * @param members 要移除聊天室白名单的成员用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async removeMembersFromChatRoomAllowList(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(
      `${ChatRoomManager.TAG}: removeMembersFromChatRoomAllowList: `,
      roomId,
      members
    );
    let r: any = await Native._callMethod(
      MTremoveMembersFromChatRoomAllowList,
      {
        [MTremoveMembersFromChatRoomAllowList]: {
          roomId,
          members,
        },
      }
    );
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 禁言聊天室所有成员。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * 该方法对聊天室所有者、管理员和在白名单中的成员无效。
   *
   * @param roomId 聊天室 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async muteAllChatRoomMembers(roomId: string): Promise<void> {
    chatlog.log(`${ChatRoomManager.TAG}: muteAllChatRoomMembers: `, roomId);
    let r: any = await Native._callMethod(MTmuteAllChatRoomMembers, {
      [MTmuteAllChatRoomMembers]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 解除聊天室全员禁言。
   *
   * 仅聊天室所有者或者管理员有权限调用该方法。
   *
   * @param roomId 聊天室 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async unMuteAllChatRoomMembers(roomId: string): Promise<void> {
    chatlog.log(`${ChatRoomManager.TAG}: unMuteAllChatRoomMembers: `, roomId);
    let r: any = await Native._callMethod(MTunMuteAllChatRoomMembers, {
      [MTunMuteAllChatRoomMembers]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  /**
   * 从服务器获取聊天室数据。
   *
   * @param roomId 聊天室 ID。
   * @param keys 要获取的聊天室自定义属性的属性 key 列表。若将该参数设置为 `null` 或留空，调用该方法会获取聊天室所有自定义属性。
   *
   * @returns 聊天室自定义属性，键值对格式。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchChatRoomAttributes(
    roomId: string,
    keys?: Array<string>
  ): Promise<Map<string, string>> {
    chatlog.log(`${ChatRoomManager.TAG}: ${this.fetchChatRoomAttributes.name}`);
    let r: any = await Native._callMethod(MTfetchChatRoomAttributes, {
      [MTfetchChatRoomAttributes]: {
        roomId,
        keys,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    const ret: Map<string, string> = new Map();
    Object.entries(r?.[MTfetchChatRoomAttributes]).forEach(
      (v: [string, any]) => {
        ret.set(v[0], v[1]);
      }
    );
    return ret;
  }

  /**
   * 设置聊天室自定义属性。
   *
   * @param params -
   * - roomId 聊天室 ID。
   * - attributes 要设置的聊天室自定义属性，为键值对（key-value）结构。
   * 在键值对中，key 为属性名，不超过 128 字符；value 为属性值，不超过 4096 字符。
   * 每个聊天室最多有 100 个属性，每个应用的聊天室属性总大小不超过 10 GB。Key 支持以下字符集：
   *   - 26 个小写英文字母 a-z；
   * - 26 个大写英文字母 A-Z；
   * - 10 个数字 0-9；
   * - “_”, “-”, “.”。
   * - deleteWhenLeft: 当前成员退出聊天室是否自动删除该自定义属性。
   *   - (Default)`true`：是
   *   - `false`：否
   * - overwrite: 是否覆盖其他成员设置的属性 key 相同的属性。
   *   - `true`：是
   *   - (Default)`false`：否
   *
   * @returns 若某些属性设置失败，SDK 返回键值对（key-value）结构的属性集合，在每个键值对中 key 为属性 key，value 为失败原因。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async addAttributes(params: {
    roomId: string;
    attributes: { [x: string]: string }[];
    deleteWhenLeft?: boolean;
    overwrite?: boolean;
  }): Promise<Map<string, string>> {
    chatlog.log(`${ChatRoomManager.TAG}: ${this.addAttributes.name}`);
    let r: any = await Native._callMethod(MTsetChatRoomAttributes, {
      [MTsetChatRoomAttributes]: {
        roomId: params.roomId,
        attributes: params.attributes,
        autoDelete: params.deleteWhenLeft ?? false,
        forced: params.overwrite ?? false,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    const ret: Map<string, string> = new Map();
    if (r?.[MTsetChatRoomAttributes]) {
      Object.entries(r?.[MTsetChatRoomAttributes]).forEach(
        (v: [string, any]) => {
          ret.set(v[0], v[1]);
        }
      );
    }
    return ret;
  }

  /**
   * 删除聊天室自定义属性。
   *
   * @param params -
   * - roomId: 聊天室 ID。
   * - keys: 要删除的聊天室自定义属性的 key 列表。
   * - forced: 是否删除其他成员设置的属性 key 相同的自定义属性。
   *   - `true`：是
   *   - （默认）`false`：否
   *
   * @returns 若某些属性设置失败，SDK 返回键值对（key-value）结构的属性集合，在每个键值对中 key 为属性 key，value 为失败原因。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async removeAttributes(params: {
    roomId: string;
    keys: Array<string>;
    forced?: boolean;
  }): Promise<Map<string, string>> {
    chatlog.log(`${ChatRoomManager.TAG}: ${this.removeAttributes.name}`);
    let r: any = await Native._callMethod(MTremoveChatRoomAttributes, {
      [MTremoveChatRoomAttributes]: {
        roomId: params.roomId,
        keys: params.keys,
        forced: params.forced ?? false,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    const ret: Map<string, string> = new Map();
    if (r?.[MTremoveChatRoomAttributes]) {
      Object.entries(r?.[MTremoveChatRoomAttributes]).forEach(
        (v: [string, any]) => {
          ret.set(v[0], v[1]);
        }
      );
    }
    return ret;
  }
}
