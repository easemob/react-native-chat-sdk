import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatRoomEventListener } from './ChatEvents';
import {
  MTaddChatRoomAdmin,
  MTaddMembersToChatRoomWhiteList,
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
  MTfetchChatRoomWhiteListFromServer,
  MTfetchPublicChatRoomsFromServer,
  MTgetAllChatRooms,
  MTgetChatRoom,
  MTisMemberInChatRoomWhiteListFromServer,
  MTjoinChatRoom,
  MTleaveChatRoom,
  MTmuteAllChatRoomMembers,
  MTmuteChatRoomMembers,
  MTremoveChatRoomAdmin,
  MTremoveChatRoomMembers,
  MTremoveMembersFromChatRoomWhiteList,
  MTunBlockChatRoomMembers,
  MTunMuteAllChatRoomMembers,
  MTunMuteChatRoomMembers,
  MTupdateChatRoomAnnouncement,
} from './_internal/Consts';
import { Native } from './_internal/Native';
import { ChatPageResult } from './common/ChatPageResult';
import { ChatRoom } from './common/ChatRoom';

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
    console.log(`${ChatRoomManager.TAG}: setNativeListener: `, event);
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
          listener.onChatRoomDestroyed({
            roomId: params.roomId,
            roomName: params.roomName,
          });
          break;
        case 'onMemberJoined':
          listener.onMemberJoined({
            roomId: params.roomId,
            participant: params.participant,
          });
          break;
        case 'onMemberExited':
          listener.onMemberExited({
            roomId: params.roomId,
            participant: params.participant,
            roomName: params.roomName,
          });
          break;
        case 'onRemovedFromChatRoom':
          listener.onRemoved({
            roomId: params.roomId,
            participant: params.participant,
            roomName: params.roomName,
          });
          break;
        case 'onMuteListAdded':
          listener.onMuteListAdded({
            roomId: params.roomId,
            mutes: params.mutes,
            expireTime: params.expireTime,
          });
          break;
        case 'onMuteListRemoved':
          listener.onMuteListRemoved({
            roomId: params.roomId,
            mutes: params.mutes,
          });
          break;
        case 'onAdminAdded':
          listener.onAdminAdded({
            roomId: params.roomId,
            admin: params.admin,
          });
          break;
        case 'onAdminRemoved':
          listener.onAdminRemoved({
            roomId: params.roomId,
            admin: params.admin,
          });
          break;
        case 'onOwnerChanged':
          listener.onOwnerChanged({
            roomId: params.roomId,
            newOwner: params.newOwner,
            oldOwner: params.oldOwner,
          });
          break;
        case 'onAnnouncementChanged':
          listener.onAnnouncementChanged({
            roomId: params.roomId,
            announcement: params.announcement,
          });
          break;
        case 'onWhiteListAdded':
          listener.onWhiteListAdded({
            roomId: params.roomId,
            members: params.members,
          });
          break;
        case 'onWhiteListRemoved':
          listener.onWhiteListRemoved({
            roomId: params.roomId,
            members: params.members,
          });
          break;
        case 'onAllMemberMuteStateChanged':
          listener.onAllChatRoomMemberMuteStateChanged({
            roomId: params.roomId,
            isAllMuted: params.isAllMuted,
          });
          break;

        default:
          throw new Error('This type is not supported. ');
      }
    });
  }

  public addRoomListener(listener: ChatRoomEventListener): void {
    this._roomListeners.add(listener);
  }
  public removeRoomListener(listener: ChatRoomEventListener): void {
    this._roomListeners.delete(listener);
  }
  public removeAllRoomListener(): void {
    this._roomListeners.clear();
  }

  public async joinChatRoom(roomId: string): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: joinChatRoom: ${roomId}`);
    let r: any = await Native._callMethod(MTjoinChatRoom, {
      [MTjoinChatRoom]: {
        username: roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async leaveChatRoom(roomId: string): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: leaveChatRoom: ${roomId}`);
    let r: any = await Native._callMethod(MTleaveChatRoom, {
      [MTleaveChatRoom]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async fetchPublicChatRoomsFromServer(
    pageNum: number = 1,
    pageSize: number = 200
  ): Promise<ChatPageResult<ChatRoom>> {
    console.log(`${ChatRoomManager.TAG}: fetchPublicChatRoomsFromServer: `);
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

  public async fetchChatRoomInfoFromServer(roomId: string): Promise<ChatRoom> {
    console.log(
      `${ChatRoomManager.TAG}: fetchChatRoomInfoFromServer: ${roomId}`
    );
    let r: any = await Native._callMethod(MTfetchChatRoomInfoFromServer, {
      [MTfetchChatRoomInfoFromServer]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret: ChatRoom = r?.[MTfetchChatRoomInfoFromServer];
    return ret;
  }

  public async getChatRoomWithId(roomId: string): Promise<ChatRoom> {
    console.log(`${ChatRoomManager.TAG}: getChatRoomWithId: ${roomId}`);
    // todo: !!!
    let r: any = await Native._callMethod(MTgetChatRoom, {
      [MTgetChatRoom]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret: ChatRoom = r?.[MTgetChatRoom];
    return ret;
  }

  public async getAllChatRooms(): Promise<Array<ChatRoom>> {
    console.log(`${ChatRoomManager.TAG}: getAllChatRooms: `);
    let r: any = await Native._callMethod(MTgetAllChatRooms);
    ChatRoomManager.checkErrorFromResult(r);
    let ret: ChatRoom[] = r?.[MTgetAllChatRooms];
    return ret;
  }

  public async createChatRoom(
    subject: string,
    desc?: string,
    welcomeMsg?: string,
    members?: Array<string>,
    maxCount: number = 300
  ): Promise<ChatRoom> {
    console.log(`${ChatRoomManager.TAG}: createChatRoom: `);
    let r: any = await Native._callMethod(MTcreateChatRoom, {
      [MTcreateChatRoom]: {
        subject: subject,
        desc: desc,
        welcomeMsg: welcomeMsg,
        members: members,
        maxUserCount: maxCount,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret: ChatRoom = r?.[MTcreateChatRoom];
    return ret;
  }

  public async destroyChatRoom(roomId: string): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: destroyChatRoom: `);
    let r: any = await Native._callMethod(MTdestroyChatRoom, {
      [MTdestroyChatRoom]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async changeChatRoomSubject(
    roomId: string,
    subject: string
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: changeChatRoomSubject: `);
    let r: any = await Native._callMethod(MTchangeChatRoomSubject, {
      [MTchangeChatRoomSubject]: {
        roomId,
        subject,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async changeChatRoomDescription(
    roomId: string,
    description: string
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: changeChatRoomSubject: `);
    let r: any = await Native._callMethod(MTchangeChatRoomDescription, {
      [MTchangeChatRoomDescription]: {
        roomId,
        description,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async fetchChatRoomMembers(
    roomId: string,
    cursor: string = '',
    pageSize: number = 200
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: fetchChatRoomMembers: `);
    let r: any = await Native._callMethod(MTfetchChatRoomMembers, {
      [MTfetchChatRoomMembers]: {
        roomId,
        cursor,
        pageSize,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async muteChatRoomMembers(
    roomId: string,
    muteMembers: Array<string>,
    duration: number = -1
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: muteChatRoomMembers: `);
    let r: any = await Native._callMethod(MTmuteChatRoomMembers, {
      [MTmuteChatRoomMembers]: {
        roomId,
        muteMembers,
        duration,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async unMuteChatRoomMembers(
    roomId: string,
    unMuteMembers: Array<string>
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: unMuteChatRoomMembers: `);
    let r: any = await Native._callMethod(MTunMuteChatRoomMembers, {
      [MTunMuteChatRoomMembers]: {
        roomId,
        unMuteMembers,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async changeOwner(roomId: string, newOwner: string): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: changeOwner: `);
    let r: any = await Native._callMethod(MTchangeChatRoomOwner, {
      [MTchangeChatRoomOwner]: {
        roomId,
        newOwner,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async addChatRoomAdmin(roomId: string, admin: string): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: addChatRoomAdmin: `);
    let r: any = await Native._callMethod(MTaddChatRoomAdmin, {
      [MTaddChatRoomAdmin]: {
        roomId,
        admin,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async removeChatRoomAdmin(
    roomId: string,
    admin: string
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: removeChatRoomAdmin: `);
    let r: any = await Native._callMethod(MTremoveChatRoomAdmin, {
      [MTremoveChatRoomAdmin]: {
        roomId,
        admin,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async fetchChatRoomMuteList(
    roomId: string,
    pageNum: number = 1,
    pageSize: number = 200
  ): Promise<Array<string>> {
    console.log(`${ChatRoomManager.TAG}: fetchChatRoomMuteList: `);
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

  public async removeChatRoomMembers(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: removeChatRoomMembers: `);
    let r: any = await Native._callMethod(MTremoveChatRoomMembers, {
      [MTremoveChatRoomMembers]: {
        roomId,
        members,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async blockChatRoomMembers(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: blockChatRoomMembers: `);
    let r: any = await Native._callMethod(MTblockChatRoomMembers, {
      [MTblockChatRoomMembers]: {
        roomId,
        members,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async unBlockChatRoomMembers(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: unBlockChatRoomMembers: `);
    let r: any = await Native._callMethod(MTunBlockChatRoomMembers, {
      [MTunBlockChatRoomMembers]: {
        roomId,
        members,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async fetchChatRoomBlockList(
    roomId: string,
    pageNum: number = 1,
    pageSize: number = 200
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: fetchChatRoomBlockList: `);
    let r: any = await Native._callMethod(MTfetchChatRoomBlockList, {
      [MTfetchChatRoomBlockList]: {
        roomId,
        pageNum,
        pageSize,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async updateChatRoomAnnouncement(
    roomId: string,
    announcement: string
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: updateChatRoomAnnouncement: `);
    let r: any = await Native._callMethod(MTupdateChatRoomAnnouncement, {
      [MTupdateChatRoomAnnouncement]: {
        roomId,
        announcement,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async fetchChatRoomAnnouncement(roomId: string): Promise<string> {
    console.log(`${ChatRoomManager.TAG}: fetchChatRoomAnnouncement: `);
    let r: any = await Native._callMethod(MTfetchChatRoomAnnouncement, {
      [MTfetchChatRoomAnnouncement]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret: string = r?.[MTfetchChatRoomAnnouncement];
    return ret;
  }

  public async fetchChatRoomWhiteListFromServer(
    roomId: string
  ): Promise<Array<string>> {
    console.log(`${ChatRoomManager.TAG}: fetchChatRoomWhiteListFromServer: `);
    let r: any = await Native._callMethod(MTfetchChatRoomWhiteListFromServer, {
      [MTfetchChatRoomWhiteListFromServer]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
    let ret: string[] = r?.[MTfetchChatRoomWhiteListFromServer];
    return ret;
  }

  public async isMemberInChatRoomWhiteList(roomId: string): Promise<boolean> {
    console.log(`${ChatRoomManager.TAG}: isMemberInChatRoomWhiteList: `);
    let r: any = await Native._callMethod(
      MTisMemberInChatRoomWhiteListFromServer,
      {
        [MTisMemberInChatRoomWhiteListFromServer]: {
          roomId,
        },
      }
    );
    ChatRoomManager.checkErrorFromResult(r);
    let ret: boolean = r?.[MTfetchChatRoomWhiteListFromServer];
    return ret;
  }

  public async addMembersToChatRoomWhiteList(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: addMembersToChatRoomWhiteList: `);
    let r: any = await Native._callMethod(MTaddMembersToChatRoomWhiteList, {
      [MTaddMembersToChatRoomWhiteList]: {
        roomId,
        members,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async removeMembersFromChatRoomWhiteList(
    roomId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: removeMembersFromChatRoomWhiteList: `);
    let r: any = await Native._callMethod(
      MTremoveMembersFromChatRoomWhiteList,
      {
        [MTremoveMembersFromChatRoomWhiteList]: {
          roomId,
          members,
        },
      }
    );
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async muteAllChatRoomMembers(roomId: string): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: muteAllChatRoomMembers: `);
    let r: any = await Native._callMethod(MTmuteAllChatRoomMembers, {
      [MTmuteAllChatRoomMembers]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }

  public async unMuteAllChatRoomMembers(roomId: string): Promise<void> {
    console.log(`${ChatRoomManager.TAG}: unMuteAllChatRoomMembers: `);
    let r: any = await Native._callMethod(MTunMuteAllChatRoomMembers, {
      [MTunMuteAllChatRoomMembers]: {
        roomId,
      },
    });
    ChatRoomManager.checkErrorFromResult(r);
  }
}
