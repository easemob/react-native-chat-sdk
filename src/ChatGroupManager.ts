import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatGroupEventListener } from './ChatEvents';
import {
  ChatGroupSharedFile,
  ChatGroup,
  ChatGroupOptions,
  ChatGroupInfo,
  ChatGroupFileStatusCallback,
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
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import { BaseManager } from './__internal__/Base';

/**
 * The group manager class, which manages group creation and deletion, user joining and exiting the group, etc.
 */
export class ChatGroupManager extends BaseManager {
  protected static TAG = 'ChatGroupManager';

  private _groupListeners: Set<ChatGroupEventListener>;
  private _groupSubscriptions: Map<string, EmitterSubscription>;

  constructor() {
    super();
    this._groupListeners = new Set();
    this._groupSubscriptions = new Map();
  }

  public setNativeListener(event: NativeEventEmitter): void {
    this._eventEmitter = event;
    console.log(`${ChatGroupManager.TAG}: setNativeListener: `);
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

  private static handleUploadFileCallback(
    self: ChatGroupManager,
    groupId: string,
    filePath: string,
    callback?: ChatGroupFileStatusCallback
  ): void {
    ChatGroupManager.handleGroupFileCallback(
      MTuploadGroupSharedFile,
      self,
      groupId,
      filePath,
      callback
    );
  }

  private static handleDownloadFileCallback(
    self: ChatGroupManager,
    groupId: string,
    filePath: string,
    callback?: ChatGroupFileStatusCallback
  ): void {
    ChatGroupManager.handleGroupFileCallback(
      MTdownloadGroupSharedFile,
      self,
      groupId,
      filePath,
      callback
    );
  }

  /**
   * Gets the group instance from the cache by group ID.
   *
   * @param groupId The group ID.
   * @returns The group instance. Returns undefined if the group does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getGroupWithId(groupId: string): Promise<ChatGroup | undefined> {
    console.log(`${ChatGroupManager.TAG}: getGroupWithId: ${groupId}`);
    let r: any = await Native._callMethod(MTgetGroupWithId, {
      [MTgetGroupWithId]: {
        groupId: groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    const g = r?.[MTgetGroupWithId];
    if (g) {
      return new ChatGroup(g);
    }
    return undefined;
  }

  /**
   * Gets all groups of the current user from the cache.
   *
   * @returns The group list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getJoinedGroups(): Promise<Array<ChatGroup>> {
    console.log(`${ChatGroupManager.TAG}: getJoinedGroups: `);
    let r: any = await Native._callMethod(MTgetJoinedGroups);
    ChatGroupManager.checkErrorFromResult(r);
    const ret: ChatGroup[] = [];
    Object.entries(r?.[MTgetJoinedGroups]).forEach((value: [string, any]) => {
      ret.push(new ChatGroup(value[1]));
    });
    return ret;
  }

  /**
   * Gets all joined groups of the current user from the server.
   *
   * This method returns a group list which does not contain member information. If you want to update information of a group to include its member information, call {@link #fetchMemberListFromServer}.
   *
   * @param pageSize The number of pages.
   * @param pageNum The page number.
   * @returns The list of groups that the current user joins.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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
    const ret: ChatGroup[] = [];
    Object.entries(r?.[MTgetJoinedGroupsFromServer]).forEach(
      (value: [string, any]) => {
        ret.push(new ChatGroup(value[1]));
      }
    );
    return ret;
  }

  /**
   * Gets public groups from the server with pagination.
   *
   * @param pageSize The number of pages.
   * @param cursor The cursor position from which to start to get data next time. Sets the parameter as null for the first time.
   * @returns The result of {@link ChatCursorResult}, including the cursor for getting data next time and the group list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchPublicGroupsFromServer(
    pageSize: number,
    cursor?: string
  ): Promise<ChatCursorResult<ChatGroupInfo>> {
    console.log(`${ChatGroupManager.TAG}: fetchPublicGroupsFromServer: `);
    let r: any = await Native._callMethod(MTgetPublicGroupsFromServer, {
      [MTgetPublicGroupsFromServer]: {
        pageSize,
        cursor,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret = new ChatCursorResult<ChatGroupInfo>({
      cursor: r?.[MTgetPublicGroupsFromServer].cursor,
      list: r?.[MTgetPublicGroupsFromServer].list,
      opt: {
        map: (param: any) => {
          return new ChatGroupInfo(param);
        },
      },
    });
    return ret;
  }

  /**
   * Creates a group instance.
   *
   * After the group is created, the data in the cache and database will be updated and multiple devices will receive the notification event and update the group data to the cache and database.
   *
   * You can set {@link ChatGroupEventListener} to listen for the event.
   *
   * @param options The options for creating a group. See {@link ChatGroupOptions}.
   * The options are as follows:
   * - The maximum number of group members. The default value is 200.
   * - The group style. See {@link ChatGroupStyle}. The default value is {@link ChatGroupStyle#PrivateOnlyOwnerInvite}.
   * @param groupName The group name.
   * @param desc The group description.
   * @param inviteMembers The group member array. The group owner ID is optional.
   * @param inviteReason The group joining invitation.
   * @returns The created group instance.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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
    return new ChatGroup(r?.[MTcreateGroup]);
  }

  /**
   * Gets the group information from the server.
   *
   * This method does not get member information. If member information is required, call {@link #fetchMemberListFromServer}.
   *
   * @param groupId The group ID.
   * @returns The group instance. Returns undefined if the group does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchGroupInfoFromServer(
    groupId: string
  ): Promise<ChatGroup | undefined> {
    console.log(`${ChatGroupManager.TAG}: fetchGroupInfoFromServer: `);
    let r: any = await Native._callMethod(MTgetGroupSpecificationFromServer, {
      [MTgetGroupSpecificationFromServer]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    const g = r?.[MTgetGroupSpecificationFromServer];
    if (g) {
      return new ChatGroup(g);
    }
    return undefined;
  }

  /**
   * Gets the member list of the group with pagination.
   *
   * @param groupId The group ID.
   * @param pageSize The number of group members per page.
   * @param cursor The cursor position from which to start to get data next time. Sets the parameter as null for the first time.
   * @returns The result of {@link ChatCursorResult}, including the cursor for getting data next time and the group member list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Gets the group block list from server with pagination.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param pageSize The number of groups per page.
   * @param pageNum The page number, starting from 1.
   * @returns The group block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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
    let ret: Array<string> = r?.[MTgetGroupBlockListFromServer];
    return ret;
  }

  /**
   * Gets the mute list of the group from the server.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param pageSize The number of muted members per page.
   * @param pageNum The page number, starting from 1.
   * @returns The group mute list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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
    let ret: string[] = r?.[MTgetGroupMuteListFromServer];
    return ret;
  }

  /**
   * Gets the allow list of the group from the server.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @returns The allow list of the group.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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
    let ret: string[] = r?.[MTgetGroupWhiteListFromServer];
    return ret;
  }

  /**
   * Gets whether the member is on the allow list of the group.
   *
   * @param groupId The group ID.
   * @returns A Boolean value to indicate whether the current user is on the allow list of the group;
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Gets the shared files of the group from the server.
   *
   * @param groupId The group ID.
   * @param pageSize The number of shared files per page.
   * @param pageNum The page number, starting from 1.
   * @returns The shared file list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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
    const ret: ChatGroupSharedFile[] = [];
    Object.entries(r?.[MTgetGroupFileListFromServer]).forEach(
      (value: [string, any]) => {
        ret.push(new ChatGroupSharedFile(value[1]));
      }
    );
    return ret;
  }

  /**
   * Gets the group announcement from the server.
   *
   * Group members can call this method.
   *
   * @param groupId The group ID.
   * @returns The group announcement.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Adds users to the group.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param members The array of new members to add.
   * @param welcome (option) The welcome message.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Invites users to join the group.
   *
   * This method works only for groups with the style of `PrivateOnlyOwnerInvite`, `PrivateMemberCanInvite`, or `PublicJoinNeedApproval`.
   * For a group with the PrivateOnlyOwnerInvite style, only the group owner can invite users to join the group;
   * For a group with the PrivateMemberCanInvite style, each group member can invite users to join the group.
   *
   * @param groupId The group ID.
   * @param members The array of new members to invite.
   * @param reason The invitation reason.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Removes a member from the group.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param members The username of the member to be removed.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Adds the user to the block list of the group.
   *
   * Users will be first removed from the group they have joined before being added to the block list of the group. The users on the group block list cannot join the group again.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param members The list of users to be added to the block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Removes users from the group block list.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param members The users to be removed from the group block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Changes the group name.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param name The new group name.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Changes the group description.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param desc The new group description.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   *
   * Leaves a group.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async leaveGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: leaveGroup: `);
    let r: any = await Native._callMethod(MTleaveGroup, {
      [MTleaveGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Destroys the group instance.
   *
   * Only the group owner can call this method.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async destroyGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: destroyGroup: `);
    let r: any = await Native._callMethod(MTdestroyGroup, {
      [MTdestroyGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Blocks group messages.
   *
   * The user that blocks group messages is still a group member, but can't receive group messages.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async blockGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: blockGroup: `);
    let r: any = await Native._callMethod(MTblockGroup, {
      [MTblockGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Unblocks group messages.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async unblockGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unblockGroup: `);
    let r: any = await Native._callMethod(MTunblockGroup, {
      [MTunblockGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Transfers the group ownership.
   *
   * Only the group owner can call this method.
   *
   * @param groupId The group ID.
   * @param newOwner The new owner ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async changeOwner(groupId: string, newOwner: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: changeOwner: `);
    let r: any = await Native._callMethod(MTupdateGroupOwner, {
      [MTupdateGroupOwner]: {
        groupId: groupId,
        owner: newOwner,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Adds a group admin.
   *
   * Only the group owner can call this method and group admins cannot.
   *
   * @param groupId The group ID.
   * @param admin The username of the admin to add.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addAdmin(groupId: string, admin: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: addAdmin: `);
    let r: any = await Native._callMethod(MTaddAdmin, {
      [MTaddAdmin]: {
        groupId,
        admin,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Removes a group admin.
   *
   * Only the group owner can call this method.
   *
   * @param groupId The group ID.
   * @param admin The username of the admin to remove.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeAdmin(groupId: string, admin: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: removeAdmin: `);
    let r: any = await Native._callMethod(MTremoveAdmin, {
      [MTremoveAdmin]: {
        groupId,
        admin,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Mutes group members.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param members The list of members to be muted.
   * @param duration The mute duration in milliseconds.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Cancel mutes group members.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param members The list of members to be muted.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Mutes all members.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async muteAllMembers(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: muteAllMembers: `);
    let r: any = await Native._callMethod(MTmuteAllMembers, {
      [MTmuteAllMembers]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Cancel mute all group members.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async unMuteAllMembers(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: unMuteAllMembers: `);
    let r: any = await Native._callMethod(MTunMuteAllMembers, {
      [MTunMuteAllMembers]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Adds members to the allow list of the group.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param members The members to be added to the allow list of the group.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Removes members from the allow list of the group.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param members The members to be removed from the allow list of the group.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Uploads the shared file to the group.
   *
   * When a shared file is uploaded, the upload progress callback will be triggered.
   *
   * @param groupId The group ID.
   * @param filePath The local path of the shared file.
   * @param callback (option) The result for file upload.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async uploadGroupSharedFile(
    groupId: string,
    filePath: string,
    callback?: ChatGroupFileStatusCallback
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: uploadGroupSharedFile: `);
    ChatGroupManager.handleUploadFileCallback(
      this,
      groupId,
      filePath,
      callback
    );
    let r: any = await Native._callMethod(MTuploadGroupSharedFile, {
      [MTuploadGroupSharedFile]: {
        groupId,
        filePath,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Downloads the shared file of the group.
   *
   * @param groupId The group ID.
   * @param fileId The ID of the shared file.
   * @param savePath The local path of the shared file.
   * @param callback (option) The result for file download.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async downloadGroupSharedFile(
    groupId: string,
    fileId: string,
    savePath: string,
    callback?: ChatGroupFileStatusCallback
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: downloadGroupSharedFile: `);
    ChatGroupManager.handleDownloadFileCallback(
      this,
      groupId,
      savePath,
      callback
    );
    let r: any = await Native._callMethod(MTdownloadGroupSharedFile, {
      [MTdownloadGroupSharedFile]: {
        groupId,
        fileId,
        savePath,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Removes a shared file of the group.
   *
   * Group members can delete their own uploaded files. The group owner or admin can delete all shared files.
   *
   * @param groupId The group ID.
   * @param fileId The ID of the shared file.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Updates the group announcement.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param announcement The group announcement.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Updates the group extension field.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param extension The group extension field.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateGroupExtension(
    groupId: string,
    extension: string
  ): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: updateGroupExtension: `);
    let r: any = await Native._callMethod(MTupdateGroupExt, {
      [MTupdateGroupExt]: {
        groupId: groupId,
        ext: extension,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Joins a public group.
   *
   * For a group that requires no authentication，users can join it freely without obtaining permissions from the group owner.
   * For a group that requires authentication, users need to wait for the group owner to agree before joining the group. For details, see {@link ChatGroupStyle}.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async joinPublicGroup(groupId: string): Promise<void> {
    console.log(`${ChatGroupManager.TAG}: joinPublicGroup: `);
    let r: any = await Native._callMethod(MTjoinPublicGroup, {
      [MTjoinPublicGroup]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Requests to join a group.
   *
   * This method works only for public groups requiring authentication, i.e., groups with the style of {@link ChatGroupStyle#PublicJoinNeedApproval}.
   *
   * @param groupId The group ID.
   * @param reason The reason for requesting to join the group.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Approves a group request.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param username The username of the user who sends a request to join the group.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Declines a group request.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param username The username of the user who sends a request to join the group.
   * @param reason The reason of declining.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Accepts a group invitation.
   *
   * @param groupId The group ID.
   * @param inviter The user who initiates the invitation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Declines a group invitation.
   *
   * @param groupId The group ID.
   * @param inviter The username of the inviter.
   * @param reason The reason of declining.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Add contact listener
   *
   * @param listener The listener to be added.
   */
  addGroupListener(listener: ChatGroupEventListener): void {
    this._groupListeners.add(listener);
  }

  /**
   * Remove contact listener
   *
   * @param listener The listener to be deleted.
   */
  removeGroupListener(listener: ChatGroupEventListener): void {
    this._groupListeners.delete(listener);
  }

  /**
   * Clear contact listener
   */
  removeAllGroupListener(): void {
    this._groupListeners.clear();
  }
}
