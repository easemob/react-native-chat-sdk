import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatRoomEventListener } from './ChatEvents';
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
  MTfetchChatRoomAnnouncement,
  MTfetchChatRoomBlockList,
  MTfetchChatRoomInfoFromServer,
  MTfetchChatRoomMembers,
  MTfetchChatRoomMuteList,
  MTfetchChatRoomAllowListFromServer,
  MTfetchPublicChatRoomsFromServer,
  MTgetChatRoom,
  MTisMemberInChatRoomAllowListFromServer,
  MTjoinChatRoom,
  MTleaveChatRoom,
  MTmuteAllChatRoomMembers,
  MTmuteChatRoomMembers,
  MTremoveChatRoomAdmin,
  MTremoveChatRoomMembers,
  MTremoveMembersFromChatRoomAllowList,
  MTunBlockChatRoomMembers,
  MTunMuteAllChatRoomMembers,
  MTunMuteChatRoomMembers,
  MTupdateChatRoomAnnouncement,
  MTfetchChatRoomAttributes,
  MTsetChatRoomAttributes,
  MTremoveChatRoomAttributes,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import { ChatPageResult } from './common/ChatPageResult';
import { ChatRoom } from './common/ChatRoom';
import { ChatCursorResult } from './common/ChatCursorResult';
import { ChatError } from './common/ChatError';
import { chatlog } from './common/ChatConst';

/**
 * The chat room manager class, which manages user operations, like joining and leaving the chat room and retrieving the chat room list, and manages member privileges.
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
        this.invokeContactListener(params);
      })
    );
  }

  private invokeContactListener(params: any): void {
    this._roomListeners.forEach((listener: ChatRoomEventListener) => {
      const contactEventType = params.type;
      switch (contactEventType) {
        case 'onChatRoomDestroyed':
          listener.onChatRoomDestroyed?.({
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
          listener.onRemoved?.({
            roomId: params.roomId,
            participant: params.participant,
            roomName: params.roomName,
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
          throw new ChatError({
            code: 1,
            description: `This type is not supported. ` + contactEventType,
          });
      }
    });
  }

  /**
   * Adds a chat room listener.
   *
   * @param listener The listener to add.
   */
  public addRoomListener(listener: ChatRoomEventListener): void {
    chatlog.log(`${ChatRoomManager.TAG}: addRoomListener: `);
    this._roomListeners.add(listener);
  }

  /**
   * Removes the chat room listener.
   *
   * @param listener The listener to remove.
   */
  public removeRoomListener(listener: ChatRoomEventListener): void {
    chatlog.log(`${ChatRoomManager.TAG}: removeRoomListener: `);
    this._roomListeners.delete(listener);
  }

  /**
   * Removes all the chat room listeners.
   */
  public removeAllRoomListener(): void {
    chatlog.log(`${ChatRoomManager.TAG}: removeAllRoomListener: `);
    this._roomListeners.clear();
  }

  /**
   * Joins the chat room.
   *
   * To leave the chat room, you can call {@link leaveChatRoom}.
   *
   * @param roomId The ID of the chat room to join.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Leaves the chat room.
   *
   * @param roomId The ID of the chat room to leave.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets chat room data from the server with pagination.
   *
   * @param pageNum The page number, starting from 1.
   * @param pageSize The number of chat rooms that you expect to get on each page.
   * @returns The list of obtained chat rooms. See {@link ChatPageResult}.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the details of the chat room from the server.
   *
   * By default, the details do not include the chat room member list.
   *
   * @param roomId The chat room ID.
   * @returns The chat room instance. The SDK returns `undefined` if the chat room does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the chat room by ID from the local database.
   *
   * @param roomId The chat room ID.
   * @returns The chat room instance. The SDK returns `undefined` if the chat room does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Creates a chat room.
   *
   * @param subject The chat room name.
   * @param description The chat room description.
   * @param welcome A welcome message for new chat room members.
   * @param members The list of members invited to join the chat room.
   * @param maxCount The maximum number of members allowed to join the chat room.
   * @returns The chat room instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Destroys a chat room.
   *
   * Only the chat room owner can call this method.
   *
   * @param roomId The chat room ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Changes the chat room name.
   *
   * Only the chat room owner can call this method.
   *
   * @param roomId The chat room ID.
   * @param subject The new name of the chat room.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Modifies the chat room description.
   *
   * Only the chat room owner can call this method.
   *
   * @param roomId The chat room ID.
   * @param description The new description of the chat room.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the chat room member list.
   *
   * @param roomId The chat room ID.
   * @param cursor The cursor position from which to start to get data.
   *               At the first method call, if you set `cursor` as `null` or an empty string, the SDK gets the data in the reverse chronological order of when users join the chat room.
   * @param pageSize The number of members that you expect to get on each page.
   * @returns The list of chat room members and the cursor for the next query. See {@link ChatCursorResult}.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Mutes the specified members in a chat room.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param muteMembers The user IDs of members to be muted.
   * @param duration The mute duration in milliseconds.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Unmutes the specified members in a chat room.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param unMuteMembers The user IDs of members to be unmuted.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Transfers the chat room ownership.
   *
   * Only the chat room owner can call this method.
   *
   * @param roomId The chat room ID.
   * @param newOwner The user ID of the new chat room owner.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Adds a chat room admin.
   *
   * Only the chat room owner can call this method.
   *
   * @param roomId The chat room ID.
   * @param admin The user ID of the chat room admin to be added.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Removes administrative privileges of a chat room admin.
   *
   * @param roomId The chat room ID.
   * @param admin The user ID of the chat room admin whose administrative privileges are to be removed.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Uses the pagination to get the list of members who are muted in the chat room.
   *
   * This method gets data from the server.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param pageNum The page number, starting from 1.
   * @param pageSize The number of muted members that you expect to get on each page.
   * @returns The user IDs of muted members.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Removes the specified members from a chat room.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param members The user IDs of the members to be removed.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Adds the specified members to the block list of the chat room.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param members The user IDs of members to be added to block list of the chat room.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Removes the specified members from the block list of the chat room.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param members The user IDs of members to be removed from the block list of the chat room.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the chat room block list with pagination.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param pageNum The page number, starting from 1.
   * @param pageSize The number of users on the block list that you expect to get on each page.
   * @returns The user IDs of the chat room members on the block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Updates the chat room announcement.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param announcement The new chat room announcement.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the chat room announcement from the server.
   *
   * @param roomId The chat room ID.
   * @returns The chat room announcement.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets the allow list from the server.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @returns The allow list of the chat room.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Checks whether the member is on the allow list of the chat room.
   *
   * @param roomId The chat room ID.
   * @returns Whether the member is on the allow list of the chat room.
   *          - `true`: Yes.
   *          - `false`: No.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Adds members to the allow list of the chat room.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param members The user IDs of members to be added to the allow list of the chat room.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Removes members from the allow list of the chat room.
   *
   * Only the chat room owner or admin can call this method.
   *
   * @param roomId The chat room ID.
   * @param members The user IDs of members to be removed from the allow list of the chat room.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Mutes all members.
   *
   * Only the chat room owner or admin can call this method.
   *
   * The chat room owner, admins, and members added to the allow list cannot be muted.
   *
   * @param roomId The chat room ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Unmutes all members of the chat room.
   *
   * Only the chat room owner or admins can call this method.
   *
   * @param roomId The chat room ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Gets custom chat room attributes from the server.
   *
   * @param roomId The chat room ID.
   * @param keys The key list of custom attributes to get. If you set it as `null` or leave it empty, this method retrieves all custom attributes.
   *
   * @returns Custom chat room attributes in key-value format.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Sets custom chat room attributes.
   *
   * @param params -
   * - roomId The chat room ID.
   * - attributes The chat room attributes to add. The attributes are in key-value format.
   * In a key-value pair, the key is the attribute name that can contain 128 characters at most; the value is the attribute value that cannot exceed 4096 characters.
   * A chat room can have a maximum of 100 custom attributes and the total length of custom chat room attributes cannot exceed 10 GB for each app. Attribute keys support the following character sets:
   *   - 26 lowercase English letters (a-z)
   *   - 26 uppercase English letters (A-Z)
   *   - 10 numbers (0-9)
   *   - "_", "-", "."
   * - deleteWhenLeft: Whether to delete the chat room attributes set by the member when he or she exits the chat room.
   *   - (Default)`true`: Yes.
   *   - `false`: No.
   * - overwrite: Whether to overwrite the attributes with same key set by others.
   *   - `true`: Yes.
   *   - (Default)`false`: No.
   *
   * @returns If certain attributes fail to be set, the SDK returns a map of the attributes in key-value format, where the key is the attribute key and the value is the reason for the failure.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
   * Removes custom chat room attributes.
   *
   * @param params -
   * - roomId: The chat room ID.
   * - keys: The keys of the chat room attributes to remove.
   * - forced: Whether to remove the attributes with same key set by others.
   *   - `true`: Yes.
   *   - (Default)`false`: No.
   *
   * @returns If certain attributes fail to be removed, the SDK returns a map of the attributes in key-value format, where the key is the attribute key and the value is the reason for the failure.
   *
   * @throws A description of the exception. See {@link ChatError}.
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
