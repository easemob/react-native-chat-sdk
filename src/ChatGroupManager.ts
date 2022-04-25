import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatGroupEventListener } from './ChatEvents';
import {
  ChatGroupSharedFile,
  ChatGroup,
  ChatGroupOptions,
} from './common/ChatGroup';
import { ChatCursorResult } from './common/ChatCursorResult';
import {
  MethodTypeacceptInvitationFromGroup,
  MethodTypeacceptJoinApplication,
  MethodTypeaddAdmin,
  MethodTypeaddMembers,
  MethodTypeaddWhiteList,
  MethodTypeblockGroup,
  MethodTypeblockMembers,
  MethodTypecreateGroup,
  MethodTypedeclineInvitationFromGroup,
  MethodTypedeclineJoinApplication,
  MethodTypedestroyGroup,
  MethodTypedownloadGroupSharedFile,
  MethodTypegetGroupAnnouncementFromServer,
  MethodTypegetGroupBlockListFromServer,
  MethodTypegetGroupFileListFromServer,
  MethodTypegetGroupMemberListFromServer,
  MethodTypegetGroupMuteListFromServer,
  MethodTypegetGroupSpecificationFromServer,
  MethodTypegetGroupWhiteListFromServer,
  MethodTypegetGroupWithId,
  MethodTypegetJoinedGroups,
  MethodTypegetJoinedGroupsFromServer,
  MethodTypegetPublicGroupsFromServer,
  MethodTypeinviterUser,
  MethodTypeisMemberInWhiteListFromServer,
  MethodTypejoinPublicGroup,
  MethodTypeleaveGroup,
  MethodTypemuteAllMembers,
  MethodTypemuteMembers,
  MethodTypeonGroupChanged,
  MethodTyperemoveAdmin,
  MethodTyperemoveGroupSharedFile,
  MethodTyperemoveMembers,
  MethodTyperemoveWhiteList,
  MethodTyperequestToJoinPublicGroup,
  MethodTypeunblockGroup,
  MethodTypeunblockMembers,
  MethodTypeunMuteAllMembers,
  MethodTypeunMuteMembers,
  MethodTypeupdateDescription,
  MethodTypeupdateGroupAnnouncement,
  MethodTypeupdateGroupExt,
  MethodTypeupdateGroupOwner,
  MethodTypeupdateGroupSubject,
  MethodTypeuploadGroupSharedFile,
} from './_internal/Consts';
import { Native } from './_internal/Native';

export class ChatGroupManager extends Native {
  private static TAG = 'ChatGroupManager';

  private _groupListeners: Set<ChatGroupEventListener>;
  private _groupSubscriptions = new Map<string, EmitterSubscription>();

  constructor() {
    super();
    this._groupListeners = new Set();
  }

  public setNativeListener(event: NativeEventEmitter): void {
    console.log(`${ChatGroupManager.TAG}: setNativeListener: `, event);
    this._groupSubscriptions.forEach((value: EmitterSubscription) => {
      value.remove();
    });
    this._groupSubscriptions.clear();
    this._groupSubscriptions.set(
      MethodTypeonGroupChanged,
      event.addListener(MethodTypeonGroupChanged, (params: any) => {
        this.invokeGroupListener(params);
      })
    );
  }

  private invokeGroupListener(params: any): void {
    this._groupListeners.forEach((listener: ChatGroupEventListener) => {
      const groupEventType = params.type;
      switch (groupEventType) {
        case 'onInvitationReceived':
          listener.onInvitationReceived({
            groupId: params.groupId,
            inviter: params.inviter,
            groupName: params?.groupName,
            reason: params?.reason,
          });
          break;
        case 'onRequestToJoinReceived':
          listener.onRequestToJoinReceived({
            groupId: params.groupId,
            applicant: params.applicant,
            groupName: params.groupName,
            reason: params?.reason,
          });
          break;
        case 'onRequestToJoinAccepted':
          listener.onRequestToJoinAccepted({
            groupId: params.groupId,
            accepter: params.accepter,
            groupName: params?.groupName,
          });
          break;
        case 'onRequestToJoinDeclined':
          listener.onRequestToJoinDeclined({
            groupId: params.groupId,
            decliner: params.decliner,
            groupName: params?.groupName,
            reason: params?.reason,
          });
          break;
        case 'onInvitationAccepted':
          listener.onInvitationAccepted({
            groupId: params.groupId,
            invitee: params.invitee,
            reason: params?.reason,
          });
          break;
        case 'onInvitationDeclined':
          listener.onInvitationDeclined({
            groupId: params.groupId,
            invitee: params.invitee,
            reason: params.reason,
          });
          break;
        case 'onUserRemoved':
          listener.onUserRemoved({
            groupId: params.groupId,
            groupName: params.groupName,
          });
          break;
        case 'onGroupDestroyed':
          listener.onGroupDestroyed({
            groupId: params.groupId,
            groupName: params.groupName,
          });
          break;
        case 'onAutoAcceptInvitationFromGroup':
          listener.onAutoAcceptInvitation({
            groupId: params.groupId,
            inviter: params.inviter,
            inviteMessage: params.inviteMessage,
          });
          break;
        case 'onMuteListAdded':
          listener.onMuteListAdded({
            groupId: params.groupId,
            mutes: params.mutes,
            muteExpire: params.muteExpire,
          });
          break;
        case 'onMuteListRemoved':
          listener.onMuteListRemoved({
            groupId: params.groupId,
            mutes: params.mutes,
          });
          break;
        case 'onAdminAdded':
          listener.onAdminAdded({
            groupId: params.groupId,
            admin: params.admin,
          });
          break;
        case 'onAdminRemoved':
          listener.onAdminRemoved({
            groupId: params.groupId,
            admin: params.admin,
          });
          break;
        case 'onOwnerChanged':
          listener.onOwnerChanged({
            groupId: params.groupId,
            newOwner: params.newOwner,
            oldOwner: params.oldOwner,
          });
          break;
        case 'onMemberJoined':
          listener.onMemberJoined({
            groupId: params.groupId,
            member: params.member,
          });
          break;
        case 'onMemberExited':
          listener.onMemberExited({
            groupId: params.groupId,
            member: params.member,
          });
          break;
        case 'onAnnouncementChanged':
          listener.onAnnouncementChanged({
            groupId: params.groupId,
            announcement: params.announcement,
          });
          break;
        case 'onSharedFileAdded':
          listener.onSharedFileAdded({
            groupId: params.groupId,
            sharedFile: params.sharedFile,
          });
          break;
        case 'onSharedFileDeleted':
          listener.onSharedFileDeleted({
            groupId: params.groupId,
            fileId: params.fileId,
          });
          break;
        case 'onWhiteListAdded':
          listener.onWhiteListAdded({
            groupId: params.groupId,
            members: params.members,
          });
          break;
        case 'onWhiteListRemoved':
          listener.onWhiteListRemoved({
            groupId: params.groupId,
            members: params.members,
          });
          break;
        case 'onAllMemberMuteStateChanged':
          listener.onAllGroupMemberMuteStateChanged({
            groupId: params.groupId,
            isAllMuted: params.isAllMuted,
          });
          break;
        default:
          throw new Error('This type is not supported. ');
      }
    });
  }

  public async getGroupWithId(groupId: string): Promise<ChatGroup> {
    console.log(`${ChatGroupManager.TAG}: getGroupWithId: ${groupId}`);
    let r: any = await Native._callMethod(MethodTypegetGroupWithId, {
      [MethodTypegetGroupWithId]: {
        groupId: groupId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
    let group: ChatGroup = r?.[MethodTypegetGroupWithId];
    return group;
  }

  public async getJoinedGroups(): Promise<Array<ChatGroup>> {
    console.log(`${ChatGroupManager.TAG}: getJoinedGroups: `);
    let r: any = await Native._callMethod(MethodTypegetJoinedGroups);
    ChatGroupManager.hasErrorFromResult(r);
    let groups: ChatGroup[] = r?.[MethodTypegetJoinedGroups];
    return groups;
  }

  public async fetchJoinedGroupsFromServer(
    pageSize: number,
    pageNum: number
  ): Promise<Array<ChatGroup>> {
    console.log(`${ChatGroupManager.TAG}: fetchJoinedGroupsFromServer: `);
    let r: any = await Native._callMethod(MethodTypegetJoinedGroupsFromServer, {
      [MethodTypegetJoinedGroupsFromServer]: {
        pageSize,
        pageNum,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
    let groups: ChatGroup[] = r?.[MethodTypegetJoinedGroupsFromServer];
    return groups;
  }

  public async fetchPublicGroupsFromServer(
    pageSize: number,
    cursor?: string
  ): Promise<ChatCursorResult<ChatGroup>> {
    console.log(`${ChatGroupManager.TAG}: fetchPublicGroupsFromServer: `);
    let r: any = await Native._callMethod(MethodTypegetPublicGroupsFromServer, {
      [MethodTypegetPublicGroupsFromServer]: {
        pageSize,
        cursor,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
    let ret = new ChatCursorResult<ChatGroup>({
      cursor: r?.[MethodTypegetPublicGroupsFromServer].cursor,
      list: r?.[MethodTypegetPublicGroupsFromServer].list,
      opt: {
        map: (param: any) => {
          return new ChatGroup(param);
        },
      },
    });
    return ret;
  }

  public async createGroup(
    options: ChatGroupOptions,
    groupName: string,
    desc?: string,
    inviteMembers?: Array<string>,
    inviteReason?: string
  ): Promise<ChatGroup> {
    console.log(`${ChatGroupManager.TAG}: createGroup: `);
    let r: any = await Native._callMethod(MethodTypecreateGroup, {
      [MethodTypecreateGroup]: {
        groupName,
        desc,
        inviteMembers,
        inviteReason,
        options,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
    let groups: ChatGroup = r?.[MethodTypecreateGroup];
    return groups;
  }

  public async fetchGroupInfoFromServer(groupId: string): Promise<ChatGroup> {
    console.log(`${ChatGroupManager.TAG}: fetchGroupInfoFromServer: `);
    let r: any = await Native._callMethod(
      MethodTypegetGroupSpecificationFromServer,
      {
        [MethodTypegetGroupSpecificationFromServer]: {
          groupId,
        },
      }
    );
    ChatGroupManager.hasErrorFromResult(r);
    let groups: ChatGroup = r?.[MethodTypegetGroupSpecificationFromServer];
    return groups;
  }

  public async fetchMemberListFromServer(
    groupId: string,
    pageSize: number = 200,
    cursor?: string
  ): Promise<ChatCursorResult<string>> {
    console.log(`${ChatGroupManager.TAG}: fetchMemberListFromServer: `);
    let r: any = await Native._callMethod(
      MethodTypegetGroupMemberListFromServer,
      {
        [MethodTypegetGroupMemberListFromServer]: {
          groupId,
          pageSize,
          cursor,
        },
      }
    );
    ChatGroupManager.hasErrorFromResult(r);
    let ret = new ChatCursorResult<string>({
      cursor: r?.[MethodTypegetGroupMemberListFromServer].cursor,
      list: r?.[MethodTypegetGroupMemberListFromServer].list,
      opt: {
        map: (param: any) => {
          return param as string;
        },
      },
    });
    return ret;
  }

  public async fetchBlockListFromServer(
    groupId: string,
    pageSize: number = 200,
    pageNum: number = 1
  ): Promise<Array<string>> {
    console.log(`${ChatGroupManager.TAG}: fetchBlockListFromServer: `);
    let r: any = await Native._callMethod(
      MethodTypegetGroupBlockListFromServer,
      {
        [MethodTypegetGroupBlockListFromServer]: {
          groupId,
          pageSize,
          pageNum,
        },
      }
    );
    ChatGroupManager.hasErrorFromResult(r);
    let ret = r?.[MethodTypegetGroupBlockListFromServer];
    return ret;
  }

  public async fetchMuteListFromServer(
    groupId: string,
    pageSize: number = 200,
    pageNum: number = 1
  ): Promise<Array<string>> {
    console.log(`${ChatGroupManager.TAG}: fetchMuteListFromServer: `);
    let r: any = await Native._callMethod(
      MethodTypegetGroupMuteListFromServer,
      {
        [MethodTypegetGroupMuteListFromServer]: {
          groupId,
          pageSize,
          pageNum,
        },
      }
    );
    ChatGroupManager.hasErrorFromResult(r);
    let ret = r?.[MethodTypegetGroupMuteListFromServer];
    return ret;
  }

  public async fetchWhiteListFromServer(
    groupId: string
  ): Promise<Array<string>> {
    console.log(`${ChatGroupManager.TAG}: fetchWhiteListFromServer: `);
    let r: any = await Native._callMethod(
      MethodTypegetGroupWhiteListFromServer,
      {
        [MethodTypegetGroupWhiteListFromServer]: {
          groupId,
        },
      }
    );
    ChatGroupManager.hasErrorFromResult(r);
    let ret = r?.[MethodTypegetGroupWhiteListFromServer];
    return ret;
  }

  public async isMemberInWhiteListFromServer(
    groupId: string
  ): Promise<boolean> {
    console.log(`${ChatGroupManager.TAG}: isMemberInWhiteListFromServer: `);
    let r: any = await Native._callMethod(
      MethodTypeisMemberInWhiteListFromServer,
      {
        [MethodTypeisMemberInWhiteListFromServer]: {
          groupId,
        },
      }
    );
    ChatGroupManager.hasErrorFromResult(r);
    let ret = r?.[MethodTypeisMemberInWhiteListFromServer] as boolean;
    return ret;
  }

  public async fetchGroupFileListFromServer(
    groupId: string,
    pageSize: number = 200,
    pageNum: number = 1
  ): Promise<Array<ChatGroupSharedFile>> {
    console.log(`${ChatGroupManager.TAG}: fetchGroupFileListFromServer: `);
    let r: any = await Native._callMethod(
      MethodTypegetGroupFileListFromServer,
      {
        [MethodTypegetGroupFileListFromServer]: {
          groupId,
          pageSize,
          pageNum,
        },
      }
    );
    ChatGroupManager.hasErrorFromResult(r);
    let ret: ChatGroupSharedFile[] = r?.[MethodTypegetGroupFileListFromServer];
    return ret;
  }

  public async fetchAnnouncementFromServer(groupId: string): Promise<string> {
    console.log(`${ChatGroupManager.TAG}: fetchAnnouncementFromServer: `);
    let r: any = await Native._callMethod(
      MethodTypegetGroupAnnouncementFromServer,
      {
        [MethodTypegetGroupAnnouncementFromServer]: {
          groupId,
        },
      }
    );
    ChatGroupManager.hasErrorFromResult(r);
    let ret: string = r?.[MethodTypegetGroupAnnouncementFromServer];
    return ret;
  }

  public async addMembers(
    groupId: string,
    members: Array<string>,
    welcome?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: addMembers: `);
    let r: any = await Native._callMethod(MethodTypeaddMembers, {
      [MethodTypeaddMembers]: {
        groupId,
        members,
        welcome,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async inviterUser(
    groupId: string,
    members: Array<string>,
    reason?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: inviterUser: `);
    let r: any = await Native._callMethod(MethodTypeinviterUser, {
      [MethodTypeinviterUser]: {
        groupId,
        members,
        reason,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async removeMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: removeMembers: `);
    let r: any = await Native._callMethod(MethodTyperemoveMembers, {
      [MethodTyperemoveMembers]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async blockMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: blockMembers: `);
    let r: any = await Native._callMethod(MethodTypeblockMembers, {
      [MethodTypeblockMembers]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async unblockMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unblockMembers: `);
    let r: any = await Native._callMethod(MethodTypeunblockMembers, {
      [MethodTypeunblockMembers]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async changeGroupName(groupId: string, name: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: changeGroupName: `);
    let r: any = await Native._callMethod(MethodTypeupdateGroupSubject, {
      [MethodTypeupdateGroupSubject]: {
        groupId,
        name,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async changeGroupDescription(
    groupId: string,
    desc: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: changeGroupDescription: `);
    let r: any = await Native._callMethod(MethodTypeupdateDescription, {
      [MethodTypeupdateDescription]: {
        groupId,
        desc,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async leaveGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: leaveGroup: `);
    let r: any = await Native._callMethod(MethodTypeleaveGroup, {
      [MethodTypeleaveGroup]: {
        groupId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async destroyGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: destroyGroup: `);
    let r: any = await Native._callMethod(MethodTypedestroyGroup, {
      [MethodTypedestroyGroup]: {
        groupId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async blockGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: blockGroup: `);
    let r: any = await Native._callMethod(MethodTypeblockGroup, {
      [MethodTypeblockGroup]: {
        groupId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async unblockGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unblockGroup: `);
    let r: any = await Native._callMethod(MethodTypeunblockGroup, {
      [MethodTypeunblockGroup]: {
        groupId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async changeOwner(groupId: string, newOwner: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: changeOwner: `);
    let r: any = await Native._callMethod(MethodTypeupdateGroupOwner, {
      [MethodTypeupdateGroupOwner]: {
        groupId,
        newOwner,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async addAdmin(groupId: string, memberId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: addAdmin: `);
    let r: any = await Native._callMethod(MethodTypeaddAdmin, {
      [MethodTypeaddAdmin]: {
        groupId,
        memberId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async removeAdmin(groupId: string, memberId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: removeAdmin: `);
    let r: any = await Native._callMethod(MethodTyperemoveAdmin, {
      [MethodTyperemoveAdmin]: {
        groupId,
        memberId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async muteMembers(
    groupId: string,
    members: Array<string>,
    duration: number = -1
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: muteMembers: `);
    let r: any = await Native._callMethod(MethodTypemuteMembers, {
      [MethodTypemuteMembers]: {
        groupId,
        members,
        duration,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async unMuteMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unMuteMembers: `);
    let r: any = await Native._callMethod(MethodTypeunMuteMembers, {
      [MethodTypeunMuteMembers]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async muteAllMembers(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: muteAllMembers: `);
    let r: any = await Native._callMethod(MethodTypemuteAllMembers, {
      [MethodTypemuteAllMembers]: {
        groupId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async unMuteAllMembers(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unMuteAllMembers: `);
    let r: any = await Native._callMethod(MethodTypeunMuteAllMembers, {
      [MethodTypeunMuteAllMembers]: {
        groupId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async addWhiteList(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: addWhiteList: `);
    let r: any = await Native._callMethod(MethodTypeaddWhiteList, {
      [MethodTypeaddWhiteList]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async removeWhiteList(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: removeWhiteList: `);
    let r: any = await Native._callMethod(MethodTyperemoveWhiteList, {
      [MethodTyperemoveWhiteList]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async uploadGroupSharedFile(
    groupId: string,
    filePath: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: uploadGroupSharedFile: `);
    let r: any = await Native._callMethod(MethodTypeuploadGroupSharedFile, {
      [MethodTypeuploadGroupSharedFile]: {
        groupId,
        filePath,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async downloadGroupSharedFile(
    groupId: string,
    fileId: string,
    savePath: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: downloadGroupSharedFile: `);
    let r: any = await Native._callMethod(MethodTypedownloadGroupSharedFile, {
      [MethodTypedownloadGroupSharedFile]: {
        groupId,
        fileId,
        savePath,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async removeGroupSharedFile(
    groupId: string,
    fileId: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: removeGroupSharedFile: `);
    let r: any = await Native._callMethod(MethodTyperemoveGroupSharedFile, {
      [MethodTyperemoveGroupSharedFile]: {
        groupId,
        fileId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async updateGroupAnnouncement(
    groupId: string,
    announcement: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: updateGroupAnnouncement: `);
    let r: any = await Native._callMethod(MethodTypeupdateGroupAnnouncement, {
      [MethodTypeupdateGroupAnnouncement]: {
        groupId,
        announcement,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async updateGroupExtension(
    groupId: string,
    extension: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: updateGroupExtension: `);
    let r: any = await Native._callMethod(MethodTypeupdateGroupExt, {
      [MethodTypeupdateGroupExt]: {
        groupId,
        extension,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async joinPublicGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: joinPublicGroup: `);
    let r: any = await Native._callMethod(MethodTypejoinPublicGroup, {
      [MethodTypejoinPublicGroup]: {
        groupId,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async requestToJoinPublicGroup(
    groupId: string,
    reason?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: requestToJoinPublicGroup: `);
    let r: any = await Native._callMethod(MethodTyperequestToJoinPublicGroup, {
      [MethodTyperequestToJoinPublicGroup]: {
        groupId,
        reason,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async acceptJoinApplication(
    groupId: string,
    username: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: acceptJoinApplication: `);
    let r: any = await Native._callMethod(MethodTypeacceptJoinApplication, {
      [MethodTypeacceptJoinApplication]: {
        groupId,
        username,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async declineJoinApplication(
    groupId: string,
    username: string,
    reason?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: declineJoinApplication: `);
    let r: any = await Native._callMethod(MethodTypedeclineJoinApplication, {
      [MethodTypedeclineJoinApplication]: {
        groupId,
        username,
        reason,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async acceptInvitation(
    groupId: string,
    inviter: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: acceptInvitation: `);
    let r: any = await Native._callMethod(MethodTypeacceptInvitationFromGroup, {
      [MethodTypedeclineJoinApplication]: {
        groupId,
        inviter,
      },
    });
    ChatGroupManager.hasErrorFromResult(r);
  }

  public async declineInvitation(
    groupId: string,
    inviter: string,
    reason?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: declineInvitation: `);
    let r: any = await Native._callMethod(
      MethodTypedeclineInvitationFromGroup,
      {
        [MethodTypedeclineInvitationFromGroup]: {
          groupId,
          inviter,
          reason,
        },
      }
    );
    ChatGroupManager.hasErrorFromResult(r);
  }

  addGroupListener(listener: ChatGroupEventListener): void {
    this._groupListeners.add(listener);
  }
  removeGroupListener(listener: ChatGroupEventListener): void {
    this._groupListeners.delete(listener);
  }
  removeAllGroupListener(): void {
    this._groupListeners.clear();
  }
}
