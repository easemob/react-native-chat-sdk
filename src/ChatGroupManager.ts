import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatGroupEventListener } from './ChatEvents';
import {
  ChatGroupSharedFile,
  ChatGroup,
  ChatGroupOptions,
} from './common/ChatGroup';
import { ChatCursorResult } from './common/ChatCursorResult';
import {
  MTacceptInvitationFromGroup,
  MTacceptJoinApplication,
  MTaddAdmin,
  MTaddMembers,
  MTaddWhiteList,
  MTblockGroup,
  MTblockMembers,
  MTcreateGroup,
  MTdeclineInvitationFromGroup,
  MTdeclineJoinApplication,
  MTdestroyGroup,
  MTdownloadGroupSharedFile,
  MTgetGroupAnnouncementFromServer,
  MTgetGroupBlockListFromServer,
  MTgetGroupFileListFromServer,
  MTgetGroupMemberListFromServer,
  MTgetGroupMuteListFromServer,
  MTgetGroupSpecificationFromServer,
  MTgetGroupWhiteListFromServer,
  MTgetGroupWithId,
  MTgetJoinedGroups,
  MTgetJoinedGroupsFromServer,
  MTgetPublicGroupsFromServer,
  MTinviterUser,
  MTisMemberInWhiteListFromServer,
  MTjoinPublicGroup,
  MTleaveGroup,
  MTmuteAllMembers,
  MTmuteMembers,
  MTonGroupChanged,
  MTremoveAdmin,
  MTremoveGroupSharedFile,
  MTremoveMembers,
  MTremoveWhiteList,
  MTrequestToJoinPublicGroup,
  MTunblockGroup,
  MTunblockMembers,
  MTunMuteAllMembers,
  MTunMuteMembers,
  MTupdateDescription,
  MTupdateGroupAnnouncement,
  MTupdateGroupExt,
  MTupdateGroupOwner,
  MTupdateGroupSubject,
  MTuploadGroupSharedFile,
} from './_internal/Consts';
import { Native } from './_internal/Native';

export class ChatGroupManager extends Native {
  private static TAG = 'ChatGroupManager';

  private _groupListeners: Set<ChatGroupEventListener>;
  private _groupSubscriptions: Map<string, EmitterSubscription>;

  constructor() {
    super();
    this._groupListeners = new Set();
    this._groupSubscriptions = new Map();
  }

  public setNativeListener(event: NativeEventEmitter): void {
    console.log(`${ChatGroupManager.TAG}: setNativeListener: `, event);
    this._groupSubscriptions.forEach((value: EmitterSubscription) => {
      value.remove();
    });
    this._groupSubscriptions.clear();
    this._groupSubscriptions.set(
      MTonGroupChanged,
      event.addListener(MTonGroupChanged, (params: any) => {
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
    let r: any = await Native._callMethod(MTgetGroupWithId, {
      [MTgetGroupWithId]: {
        groupId: groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let group: ChatGroup = r?.[MTgetGroupWithId];
    return group;
  }

  public async getJoinedGroups(): Promise<Array<ChatGroup>> {
    console.log(`${ChatGroupManager.TAG}: getJoinedGroups: `);
    let r: any = await Native._callMethod(MTgetJoinedGroups);
    ChatGroupManager.checkErrorFromResult(r);
    let groups: ChatGroup[] = r?.[MTgetJoinedGroups];
    return groups;
  }

  public async fetchJoinedGroupsFromServer(
    pageSize: number,
    pageNum: number
  ): Promise<Array<ChatGroup>> {
    console.log(`${ChatGroupManager.TAG}: fetchJoinedGroupsFromServer: `);
    let r: any = await Native._callMethod(MTgetJoinedGroupsFromServer, {
      [MTgetJoinedGroupsFromServer]: {
        pageSize,
        pageNum,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let groups: ChatGroup[] = r?.[MTgetJoinedGroupsFromServer];
    return groups;
  }

  public async fetchPublicGroupsFromServer(
    pageSize: number,
    cursor?: string
  ): Promise<ChatCursorResult<ChatGroup>> {
    console.log(`${ChatGroupManager.TAG}: fetchPublicGroupsFromServer: `);
    let r: any = await Native._callMethod(MTgetPublicGroupsFromServer, {
      [MTgetPublicGroupsFromServer]: {
        pageSize,
        cursor,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatGroup>({
      cursor: r?.[MTgetPublicGroupsFromServer].cursor,
      list: r?.[MTgetPublicGroupsFromServer].list,
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
    let r: any = await Native._callMethod(MTcreateGroup, {
      [MTcreateGroup]: {
        groupName,
        desc,
        inviteMembers,
        inviteReason,
        options,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let groups: ChatGroup = r?.[MTcreateGroup];
    return groups;
  }

  public async fetchGroupInfoFromServer(groupId: string): Promise<ChatGroup> {
    console.log(`${ChatGroupManager.TAG}: fetchGroupInfoFromServer: `);
    let r: any = await Native._callMethod(MTgetGroupSpecificationFromServer, {
      [MTgetGroupSpecificationFromServer]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let groups: ChatGroup = r?.[MTgetGroupSpecificationFromServer];
    return groups;
  }

  public async fetchMemberListFromServer(
    groupId: string,
    pageSize: number = 200,
    cursor?: string
  ): Promise<ChatCursorResult<string>> {
    console.log(`${ChatGroupManager.TAG}: fetchMemberListFromServer: `);
    let r: any = await Native._callMethod(MTgetGroupMemberListFromServer, {
      [MTgetGroupMemberListFromServer]: {
        groupId,
        pageSize,
        cursor,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<string>({
      cursor: r?.[MTgetGroupMemberListFromServer].cursor,
      list: r?.[MTgetGroupMemberListFromServer].list,
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
    let r: any = await Native._callMethod(MTgetGroupBlockListFromServer, {
      [MTgetGroupBlockListFromServer]: {
        groupId,
        pageSize,
        pageNum,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret = r?.[MTgetGroupBlockListFromServer];
    return ret;
  }

  public async fetchMuteListFromServer(
    groupId: string,
    pageSize: number = 200,
    pageNum: number = 1
  ): Promise<Array<string>> {
    console.log(`${ChatGroupManager.TAG}: fetchMuteListFromServer: `);
    let r: any = await Native._callMethod(MTgetGroupMuteListFromServer, {
      [MTgetGroupMuteListFromServer]: {
        groupId,
        pageSize,
        pageNum,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret = r?.[MTgetGroupMuteListFromServer];
    return ret;
  }

  public async fetchWhiteListFromServer(
    groupId: string
  ): Promise<Array<string>> {
    console.log(`${ChatGroupManager.TAG}: fetchWhiteListFromServer: `);
    let r: any = await Native._callMethod(MTgetGroupWhiteListFromServer, {
      [MTgetGroupWhiteListFromServer]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret = r?.[MTgetGroupWhiteListFromServer];
    return ret;
  }

  public async isMemberInWhiteListFromServer(
    groupId: string
  ): Promise<boolean> {
    console.log(`${ChatGroupManager.TAG}: isMemberInWhiteListFromServer: `);
    let r: any = await Native._callMethod(MTisMemberInWhiteListFromServer, {
      [MTisMemberInWhiteListFromServer]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret = r?.[MTisMemberInWhiteListFromServer] as boolean;
    return ret;
  }

  public async fetchGroupFileListFromServer(
    groupId: string,
    pageSize: number = 200,
    pageNum: number = 1
  ): Promise<Array<ChatGroupSharedFile>> {
    console.log(`${ChatGroupManager.TAG}: fetchGroupFileListFromServer: `);
    let r: any = await Native._callMethod(MTgetGroupFileListFromServer, {
      [MTgetGroupFileListFromServer]: {
        groupId,
        pageSize,
        pageNum,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret: ChatGroupSharedFile[] = r?.[MTgetGroupFileListFromServer];
    return ret;
  }

  public async fetchAnnouncementFromServer(groupId: string): Promise<string> {
    console.log(`${ChatGroupManager.TAG}: fetchAnnouncementFromServer: `);
    let r: any = await Native._callMethod(MTgetGroupAnnouncementFromServer, {
      [MTgetGroupAnnouncementFromServer]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret: string = r?.[MTgetGroupAnnouncementFromServer];
    return ret;
  }

  public async addMembers(
    groupId: string,
    members: Array<string>,
    welcome?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: addMembers: `);
    let r: any = await Native._callMethod(MTaddMembers, {
      [MTaddMembers]: {
        groupId,
        members,
        welcome,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async inviterUser(
    groupId: string,
    members: Array<string>,
    reason?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: inviterUser: `);
    let r: any = await Native._callMethod(MTinviterUser, {
      [MTinviterUser]: {
        groupId,
        members,
        reason,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async removeMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: removeMembers: `);
    let r: any = await Native._callMethod(MTremoveMembers, {
      [MTremoveMembers]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async blockMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: blockMembers: `);
    let r: any = await Native._callMethod(MTblockMembers, {
      [MTblockMembers]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async unblockMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unblockMembers: `);
    let r: any = await Native._callMethod(MTunblockMembers, {
      [MTunblockMembers]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async changeGroupName(groupId: string, name: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: changeGroupName: `);
    let r: any = await Native._callMethod(MTupdateGroupSubject, {
      [MTupdateGroupSubject]: {
        groupId,
        name,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async changeGroupDescription(
    groupId: string,
    desc: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: changeGroupDescription: `);
    let r: any = await Native._callMethod(MTupdateDescription, {
      [MTupdateDescription]: {
        groupId,
        desc,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async leaveGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: leaveGroup: `);
    let r: any = await Native._callMethod(MTleaveGroup, {
      [MTleaveGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async destroyGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: destroyGroup: `);
    let r: any = await Native._callMethod(MTdestroyGroup, {
      [MTdestroyGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async blockGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: blockGroup: `);
    let r: any = await Native._callMethod(MTblockGroup, {
      [MTblockGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async unblockGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unblockGroup: `);
    let r: any = await Native._callMethod(MTunblockGroup, {
      [MTunblockGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async changeOwner(groupId: string, newOwner: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: changeOwner: `);
    let r: any = await Native._callMethod(MTupdateGroupOwner, {
      [MTupdateGroupOwner]: {
        groupId,
        newOwner,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async addAdmin(groupId: string, memberId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: addAdmin: `);
    let r: any = await Native._callMethod(MTaddAdmin, {
      [MTaddAdmin]: {
        groupId,
        memberId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async removeAdmin(groupId: string, memberId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: removeAdmin: `);
    let r: any = await Native._callMethod(MTremoveAdmin, {
      [MTremoveAdmin]: {
        groupId,
        memberId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async muteMembers(
    groupId: string,
    members: Array<string>,
    duration: number = -1
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: muteMembers: `);
    let r: any = await Native._callMethod(MTmuteMembers, {
      [MTmuteMembers]: {
        groupId,
        members,
        duration,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async unMuteMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unMuteMembers: `);
    let r: any = await Native._callMethod(MTunMuteMembers, {
      [MTunMuteMembers]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async muteAllMembers(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: muteAllMembers: `);
    let r: any = await Native._callMethod(MTmuteAllMembers, {
      [MTmuteAllMembers]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async unMuteAllMembers(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unMuteAllMembers: `);
    let r: any = await Native._callMethod(MTunMuteAllMembers, {
      [MTunMuteAllMembers]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async addWhiteList(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: addWhiteList: `);
    let r: any = await Native._callMethod(MTaddWhiteList, {
      [MTaddWhiteList]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async removeWhiteList(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: removeWhiteList: `);
    let r: any = await Native._callMethod(MTremoveWhiteList, {
      [MTremoveWhiteList]: {
        groupId,
        members,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async uploadGroupSharedFile(
    groupId: string,
    filePath: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: uploadGroupSharedFile: `);
    let r: any = await Native._callMethod(MTuploadGroupSharedFile, {
      [MTuploadGroupSharedFile]: {
        groupId,
        filePath,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async downloadGroupSharedFile(
    groupId: string,
    fileId: string,
    savePath: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: downloadGroupSharedFile: `);
    let r: any = await Native._callMethod(MTdownloadGroupSharedFile, {
      [MTdownloadGroupSharedFile]: {
        groupId,
        fileId,
        savePath,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async removeGroupSharedFile(
    groupId: string,
    fileId: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: removeGroupSharedFile: `);
    let r: any = await Native._callMethod(MTremoveGroupSharedFile, {
      [MTremoveGroupSharedFile]: {
        groupId,
        fileId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async updateGroupAnnouncement(
    groupId: string,
    announcement: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: updateGroupAnnouncement: `);
    let r: any = await Native._callMethod(MTupdateGroupAnnouncement, {
      [MTupdateGroupAnnouncement]: {
        groupId,
        announcement,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async updateGroupExtension(
    groupId: string,
    extension: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: updateGroupExtension: `);
    let r: any = await Native._callMethod(MTupdateGroupExt, {
      [MTupdateGroupExt]: {
        groupId,
        extension,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async joinPublicGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: joinPublicGroup: `);
    let r: any = await Native._callMethod(MTjoinPublicGroup, {
      [MTjoinPublicGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async requestToJoinPublicGroup(
    groupId: string,
    reason?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: requestToJoinPublicGroup: `);
    let r: any = await Native._callMethod(MTrequestToJoinPublicGroup, {
      [MTrequestToJoinPublicGroup]: {
        groupId,
        reason,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async acceptJoinApplication(
    groupId: string,
    username: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: acceptJoinApplication: `);
    let r: any = await Native._callMethod(MTacceptJoinApplication, {
      [MTacceptJoinApplication]: {
        groupId,
        username,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async declineJoinApplication(
    groupId: string,
    username: string,
    reason?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: declineJoinApplication: `);
    let r: any = await Native._callMethod(MTdeclineJoinApplication, {
      [MTdeclineJoinApplication]: {
        groupId,
        username,
        reason,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async acceptInvitation(
    groupId: string,
    inviter: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: acceptInvitation: `);
    let r: any = await Native._callMethod(MTacceptInvitationFromGroup, {
      [MTdeclineJoinApplication]: {
        groupId,
        inviter,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  public async declineInvitation(
    groupId: string,
    inviter: string,
    reason?: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: declineInvitation: `);
    let r: any = await Native._callMethod(MTdeclineInvitationFromGroup, {
      [MTdeclineInvitationFromGroup]: {
        groupId,
        inviter,
        reason,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
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
