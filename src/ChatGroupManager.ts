import type { EmitterSubscription, NativeEventEmitter } from 'react-native';
import type { ChatGroupEventListener } from './ChatEvents';
import { chatlog } from './common/ChatLog';
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
  MTaddAllowList,
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
  MTgetGroupAllowListFromServer,
  MTgetGroupWithId,
  MTgetJoinedGroups,
  MTgetJoinedGroupsFromServer,
  MTgetPublicGroupsFromServer,
  MTinviterUser,
  MTisMemberInAllowListFromServer,
  MTjoinPublicGroup,
  MTleaveGroup,
  MTmuteAllMembers,
  MTmuteMembers,
  MTonGroupChanged,
  MTremoveAdmin,
  MTremoveGroupSharedFile,
  MTremoveMembers,
  MTremoveAllowList,
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
import { ChatError } from './common/ChatError';

/**
 * The group manager class, which defines how to manage groups, like group creation and destruction and member management.
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
    chatlog.log(`${ChatGroupManager.TAG}: setNativeListener: `);
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
          listener.onInvitationReceived?.({
            groupId: params.groupId,
            inviter: params.inviter,
            groupName: params?.groupName,
            reason: params?.reason,
          });
          break;
        case 'onRequestToJoinReceived':
          listener.onRequestToJoinReceived?.({
            groupId: params.groupId,
            applicant: params.applicant,
            groupName: params.groupName,
            reason: params?.reason,
          });
          break;
        case 'onRequestToJoinAccepted':
          listener.onRequestToJoinAccepted?.({
            groupId: params.groupId,
            accepter: params.accepter,
            groupName: params?.groupName,
          });
          break;
        case 'onRequestToJoinDeclined':
          listener.onRequestToJoinDeclined?.({
            groupId: params.groupId,
            decliner: params.decliner,
            groupName: params?.groupName,
            reason: params?.reason,
          });
          break;
        case 'onInvitationAccepted':
          listener.onInvitationAccepted?.({
            groupId: params.groupId,
            invitee: params.invitee,
            reason: params?.reason,
          });
          break;
        case 'onInvitationDeclined':
          listener.onInvitationDeclined?.({
            groupId: params.groupId,
            invitee: params.invitee,
            reason: params.reason,
          });
          break;
        case 'onUserRemoved':
          listener.onUserRemoved?.({
            groupId: params.groupId,
            groupName: params.groupName,
          });
          break;
        case 'onGroupDestroyed':
          listener.onGroupDestroyed?.({
            groupId: params.groupId,
            groupName: params.groupName,
          });
          break;
        case 'onAutoAcceptInvitationFromGroup':
          listener.onAutoAcceptInvitation?.({
            groupId: params.groupId,
            inviter: params.inviter,
            inviteMessage: params.inviteMessage,
          });
          break;
        case 'onMuteListAdded':
          listener.onMuteListAdded?.({
            groupId: params.groupId,
            mutes: params.mutes,
            muteExpire: params.muteExpire,
          });
          break;
        case 'onMuteListRemoved':
          listener.onMuteListRemoved?.({
            groupId: params.groupId,
            mutes: params.mutes,
          });
          break;
        case 'onAdminAdded':
          listener.onAdminAdded?.({
            groupId: params.groupId,
            admin: params.admin,
          });
          break;
        case 'onAdminRemoved':
          listener.onAdminRemoved?.({
            groupId: params.groupId,
            admin: params.admin,
          });
          break;
        case 'onOwnerChanged':
          listener.onOwnerChanged?.({
            groupId: params.groupId,
            newOwner: params.newOwner,
            oldOwner: params.oldOwner,
          });
          break;
        case 'onMemberJoined':
          listener.onMemberJoined?.({
            groupId: params.groupId,
            member: params.member,
          });
          break;
        case 'onMemberExited':
          listener.onMemberExited?.({
            groupId: params.groupId,
            member: params.member,
          });
          break;
        case 'onAnnouncementChanged':
          listener.onAnnouncementChanged?.({
            groupId: params.groupId,
            announcement: params.announcement,
          });
          break;
        case 'onSharedFileAdded':
          listener.onSharedFileAdded?.({
            groupId: params.groupId,
            sharedFile: params.sharedFile,
          });
          break;
        case 'onSharedFileDeleted':
          listener.onSharedFileDeleted?.({
            groupId: params.groupId,
            fileId: params.fileId,
          });
          break;
        case 'onAllowListAdded':
          listener.onAllowListAdded?.({
            groupId: params.groupId,
            members: params.members,
          });
          break;
        case 'onAllowListRemoved':
          listener.onAllowListRemoved?.({
            groupId: params.groupId,
            members: params.members,
          });
          break;
        case 'onAllMemberMuteStateChanged':
          listener.onAllGroupMemberMuteStateChanged?.({
            groupId: params.groupId,
            isAllMuted: params.isAllMuted,
          });
          break;
        default:
          throw new ChatError({
            code: 1,
            description: `This type is not supported. ` + groupEventType,
          });
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
   * Gets the group instance from the memory by group ID.
   *
   * @param groupId The group ID.
   * @returns The group instance. The SDK returns `undefined` if the group does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getGroupWithId(groupId: string): Promise<ChatGroup | undefined> {
    chatlog.log(`${ChatGroupManager.TAG}: getGroupWithId: `, groupId);
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
   * Gets the list of groups that the current user has joined.
   *
   * This method gets data from the local database.
   *
   * @returns The group list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getJoinedGroups(): Promise<Array<ChatGroup>> {
    chatlog.log(`${ChatGroupManager.TAG}: getJoinedGroups: `);
    let r: any = await Native._callMethod(MTgetJoinedGroups);
    ChatGroupManager.checkErrorFromResult(r);
    const ret: ChatGroup[] = [];
    Object.entries(r?.[MTgetJoinedGroups]).forEach((value: [string, any]) => {
      ret.push(new ChatGroup(value[1]));
    });
    return ret;
  }

  /**
   * Gets the list of groups that the current user has joined.
   *
   * This method gets data from the server.
   *
   * This method returns a group list which does not contain member information. If you want to update information of a group to include its member information, call {@link #fetchMemberListFromServer}.
   *
   * @param pageSize The number of groups that you expect to return on each page.
   * @param pageNum The page number, starting from 1.
   * @returns The list of groups that the current user joins.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchJoinedGroupsFromServer(
    pageSize: number,
    pageNum: number
  ): Promise<Array<ChatGroup>> {
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchJoinedGroupsFromServer: `,
      pageSize,
      pageNum
    );
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
   * @param pageSize The number of public groups that you expect on each page.
   * @param cursor The cursor position from which to start to get data. At the first method call, if you set `cursor` as `null`, the SDK gets the data in the reverse chronological order of when groups are created.
   * @returns The group list and the cursor for the next query. See {@link ChatCursorResult}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchPublicGroupsFromServer(
    pageSize: number,
    cursor?: string
  ): Promise<ChatCursorResult<ChatGroupInfo>> {
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchPublicGroupsFromServer: `,
      pageSize,
      cursor
    );
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
   * After the group is created, the data in the memory and database will be updated and multiple devices will receive the notification event and update the group to the memory and database.
   *
   * You can set {@link ChatGroupEventListener} to listen for the event.
   *
   * @param options The options for creating a group. They are optional and cannot be `null`. See {@link ChatGroupOptions}.
   * The options are as follows:
   * - The maximum number of members allowed in the group. The default value is 200.
   * - The group style. See {@link ChatGroupStyle}. The default value is {@link ChatGroupStyle#PrivateOnlyOwnerInvite}.
   * - Whether to ask for permission when inviting a user to join the group. The default value is `false`, indicating that invitees are automatically added to the group without their permission.
   * - The extension of group details.
   * @param groupName The group name. It is optional. Pass `null` if you do not want to set this parameter.
   * @param desc The group description. It is optional. Pass `null` if you do not want to set this parameter.
   * @param inviteMembers The group member array. The group owner ID is optional. This parameter cannot be `null`.
   * @param inviteReason The group joining invitation. It is optional. Pass `null` if you do not want to set this parameter.
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
    chatlog.log(
      `${ChatGroupManager.TAG}: createGroup: `,
      options,
      groupName,
      desc,
      inviteMembers,
      inviteReason
    );
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
   * @param groupId The group ID.
   * @param isFetchMembers Whether to get group member information:
   *                       - `true`: Yes. This method can return information of at most 200 group members. To get information of all group members, you can call {@link #fetchMemberListFromServer}.
   *                       - `false`: No.
   * @returns The group instance. The SDK returns `undefined` if the group does not exist.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchGroupInfoFromServer(
    groupId: string,
    isFetchMembers: boolean = false
  ): Promise<ChatGroup | undefined> {
    chatlog.log(`${ChatGroupManager.TAG}: fetchGroupInfoFromServer: `, groupId);
    let r: any = await Native._callMethod(MTgetGroupSpecificationFromServer, {
      [MTgetGroupSpecificationFromServer]: {
        groupId: groupId,
        fetchMembers: isFetchMembers,
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
   * Uses the pagination to get the member list of the group from the server.
   *
   * @param groupId The group ID.
   * @param pageSize The number of group members that you expect to get on each page.
   * @param cursor The cursor position from which to start to get data. At the first method call, if you set `cursor` as `null`, the SDK gets the data in the reverse chronological order of when users join the group.
   * @returns The group member list and the cursor for the next query. See {@link ChatCursorResult}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchMemberListFromServer(
    groupId: string,
    pageSize: number = 200,
    cursor?: string
  ): Promise<ChatCursorResult<string>> {
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchMemberListFromServer: `,
      groupId,
      pageSize,
      cursor
    );
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
   * Uses the pagination to get the group block list from the server.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param pageSize The number of group members on the block list that you expect to get on each page.
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
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchBlockListFromServer: `,
      groupId,
      pageSize,
      pageNum
    );
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
   * Uses the pagination to get the mute list of the group from the server.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param pageSize The number of muted members that you expect to get on each page.
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
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchMuteListFromServer: `,
      groupId,
      pageSize,
      pageNum
    );
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
   * Uses the pagination to get the allow list of the group from the server.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @returns The allow list of the group.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchAllowListFromServer(
    groupId: string
  ): Promise<Array<string>> {
    chatlog.log(`${ChatGroupManager.TAG}: fetchAllowListFromServer: `, groupId);
    let r: any = await Native._callMethod(MTgetGroupAllowListFromServer, {
      [MTgetGroupAllowListFromServer]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret: string[] = r?.[MTgetGroupAllowListFromServer];
    return ret;
  }

  /**
   * Gets whether the member is on the allow list of the group.
   *
   * @param groupId The group ID.
   * @returns Whether the current user is on the allow list of the group.
   * - `true`: Yes.
   * - `false`: No.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async isMemberInAllowListFromServer(
    groupId: string
  ): Promise<boolean> {
    chatlog.log(
      `${ChatGroupManager.TAG}: isMemberInAllowListFromServer: `,
      groupId
    );
    let r: any = await Native._callMethod(MTisMemberInAllowListFromServer, {
      [MTisMemberInAllowListFromServer]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    let ret = r?.[MTisMemberInAllowListFromServer] as boolean;
    return ret;
  }

  /**
   * Uses the pagination to get the shared files of the group from the server.
   *
   * @param groupId The group ID.
   * @param pageSize The number of shared files that you get on each page.
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
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchGroupFileListFromServer: `,
      groupId,
      pageSize,
      pageNum
    );
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
   * All group members can call this method.
   *
   * @param groupId The group ID.
   * @returns The group announcement.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchAnnouncementFromServer(groupId: string): Promise<string> {
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchAnnouncementFromServer: `,
      groupId
    );
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
   * @param welcome (optional) The welcome message.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addMembers(
    groupId: string,
    members: Array<string>,
    welcome?: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: addMembers: `,
      groupId,
      members,
      welcome
    );
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
   * This method works only for groups with the following styles:
   * - `PrivateOnlyOwnerInvite` style: Only the group owner can invite users to join the group.
   * - `PrivateMemberCanInvite` style: Each group member can invite users to join the group.
   * - `PublicJoinNeedApproval` style: Each group member can invite users to join the group and users can join a group only after getting approval from the group owner or admins.
   *
   * @param groupId The group ID.
   * @param members The array of user IDs of new members to invite.
   * @param reason The invitation reason.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async inviterUser(
    groupId: string,
    members: Array<string>,
    reason?: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: inviterUser: `,
      groupId,
      members,
      reason
    );
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
   * @param members The user ID of the member to be removed.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: removeMembers: `, groupId, members);
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
   * @param members The array of user IDs of members to be added to the block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async blockMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: blockMembers: `, groupId, members);
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
   * @param members The user IDs of members to be removed from the group block list.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async unblockMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: unblockMembers: `, groupId, members);
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
   * @param groupName The new group name.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async changeGroupName(
    groupId: string,
    groupName: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: changeGroupName: `,
      groupId,
      groupName
    );
    let r: any = await Native._callMethod(MTupdateGroupSubject, {
      [MTupdateGroupSubject]: {
        groupId,
        name: groupName,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Modifies the group description.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param description The new group description.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async changeGroupDescription(
    groupId: string,
    description: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: changeGroupDescription: `,
      groupId,
      description
    );
    let r: any = await Native._callMethod(MTupdateDescription, {
      [MTupdateDescription]: {
        groupId,
        desc: description,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Leaves a group.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async leaveGroup(groupId: string): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: leaveGroup: `, groupId);
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
    chatlog.log(`${ChatGroupManager.TAG}: destroyGroup: `, groupId);
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
   * The user that blocks group messages is still a group member, but cannot receive group messages.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async blockGroup(groupId: string): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: blockGroup: `, groupId);
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
    chatlog.log(`${ChatGroupManager.TAG}: unblockGroup: `, groupId);
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
   * @param newOwner The user ID of the new group owner.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async changeOwner(groupId: string, newOwner: string): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: changeOwner: `, groupId, newOwner);
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
   * @param admin The user ID of the admin to add.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addAdmin(groupId: string, admin: string): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: addAdmin: `, groupId, admin);
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
   * @param admin The user ID of the group admin to remove.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeAdmin(groupId: string, admin: string): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: removeAdmin: `, groupId, admin);
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
   * @param members The list of user IDs of members to mute.
   * @param duration The mute duration in milliseconds. It is a reserved parameter.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async muteMembers(
    groupId: string,
    members: Array<string>,
    duration: number = -1
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: muteMembers: `,
      groupId,
      members,
      duration
    );
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
   * Unmutes group members.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param members The array of user IDs of members to be unmuted.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async unMuteMembers(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: unMuteMembers: `, groupId, members);
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
    chatlog.log(`${ChatGroupManager.TAG}: muteAllMembers: `, groupId);
    let r: any = await Native._callMethod(MTmuteAllMembers, {
      [MTmuteAllMembers]: {
        groupId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Unmutes all group members.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async unMuteAllMembers(groupId: string): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: unMuteAllMembers: `, groupId);
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
   * @param members The user IDs of members to be added to the allow list of the group.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async addAllowList(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: addAllowList: `, groupId, members);
    let r: any = await Native._callMethod(MTaddAllowList, {
      [MTaddAllowList]: {
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
   * @param members The user IDs of members to be removed from the allow list of the group.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async removeAllowList(
    groupId: string,
    members: Array<string>
  ): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: removeAllowList: `, groupId, members);
    let r: any = await Native._callMethod(MTremoveAllowList, {
      [MTremoveAllowList]: {
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
   * @param callback (Optional) The file upload result callback.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async uploadGroupSharedFile(
    groupId: string,
    filePath: string,
    callback?: ChatGroupFileStatusCallback
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: uploadGroupSharedFile: `,
      groupId,
      filePath
    );
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
   * @param callback (Optional) The file upload result callback.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async downloadGroupSharedFile(
    groupId: string,
    fileId: string,
    savePath: string,
    callback?: ChatGroupFileStatusCallback
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: downloadGroupSharedFile: `,
      groupId,
      fileId,
      savePath
    );
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
    chatlog.log(
      `${ChatGroupManager.TAG}: removeGroupSharedFile: `,
      groupId,
      fileId
    );
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
    chatlog.log(
      `${ChatGroupManager.TAG}: updateGroupAnnouncement: `,
      groupId,
      announcement
    );
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
   * @param extension The updated group extension field.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateGroupExtension(
    groupId: string,
    extension: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: updateGroupExtension: `,
      groupId,
      extension
    );
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
   * For a group that requires no authentication，users can join it freely without obtaining permissions from the group owner or admin.
   *
   * For a group that requires authentication, users need to wait for the group owner or admin to agree before joining the group. For details, see {@link ChatGroupStyle}.
   *
   * @param groupId The group ID.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async joinPublicGroup(groupId: string): Promise<void> {
    chatlog.log(`${ChatGroupManager.TAG}: joinPublicGroup: `, groupId);
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
   * You can call this method to only join public groups requiring authentication, i.e., groups with the style of {@link ChatGroupStyle#PublicJoinNeedApproval}.
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
    chatlog.log(
      `${ChatGroupManager.TAG}: requestToJoinPublicGroup: `,
      groupId,
      reason
    );
    let r: any = await Native._callMethod(MTrequestToJoinPublicGroup, {
      [MTrequestToJoinPublicGroup]: {
        groupId,
        reason,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Accepts a join request.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param username The ID of the user who sends a request to join the group.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async acceptJoinApplication(
    groupId: string,
    username: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: acceptJoinApplication: `,
      groupId,
      username
    );
    let r: any = await Native._callMethod(MTacceptJoinApplication, {
      [MTacceptJoinApplication]: {
        groupId,
        username,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * Declines a join request.
   *
   * Only the group owner or admin can call this method.
   *
   * @param groupId The group ID.
   * @param username The ID of the user who sends a request to join the group.
   * @param reason The reason of declining the join request.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async declineJoinApplication(
    groupId: string,
    username: string,
    reason?: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: declineJoinApplication: `,
      groupId,
      username,
      reason
    );
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
   * @param inviter The user ID of the inviter.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async acceptInvitation(
    groupId: string,
    inviter: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: acceptInvitation: `,
      groupId,
      inviter
    );
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
   * @param inviter The user ID of the inviter.
   * @param reason The reason for declining the invitation.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async declineInvitation(
    groupId: string,
    inviter: string,
    reason?: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: declineInvitation: `,
      groupId,
      inviter,
      reason
    );
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
   * Adds a group listener.
   *
   * @param listener The group listener to add.
   */
  addGroupListener(listener: ChatGroupEventListener): void {
    chatlog.log(`${ChatGroupManager.TAG}: addGroupListener: `);
    this._groupListeners.add(listener);
  }

  /**
   * Removes the group listener.
   *
   * @param listener The group listener to remove.
   */
  removeGroupListener(listener: ChatGroupEventListener): void {
    chatlog.log(`${ChatGroupManager.TAG}: removeGroupListener: `);
    this._groupListeners.delete(listener);
  }

  /**
   * Clears all group listeners.
   */
  removeAllGroupListener(): void {
    chatlog.log(`${ChatGroupManager.TAG}: removeAllGroupListener: `);
    this._groupListeners.clear();
  }
}
