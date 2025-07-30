import type { EmitterSubscription, NativeEventEmitter } from 'react-native';

import { BaseManager } from './__internal__/Base';
import {
  MTacceptInvitationFromGroup,
  MTacceptJoinApplication,
  MTaddAdmin,
  MTaddAllowList,
  MTaddMembers,
  MTblockGroup,
  MTblockMembers,
  MTcreateGroup,
  MTdeclineInvitationFromGroup,
  MTdeclineJoinApplication,
  MTdestroyGroup,
  MTdownloadGroupSharedFile,
  MTfetchJoinedGroupCount,
  MTfetchMemberAttributesFromGroup,
  MTfetchMembersAttributesFromGroup,
  MTgetGroupAllowListFromServer,
  MTgetGroupAnnouncementFromServer,
  MTgetGroupBlockListFromServer,
  MTgetGroupFileListFromServer,
  MTfetchMemberInfoListFromServer,
  MTgetGroupMemberListFromServer,
  MTgetGroupMuteListFromServer,
  MTgetGroupSpecificationFromServer,
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
  MTremoveAllowList,
  MTremoveGroupSharedFile,
  MTremoveMembers,
  MTrequestToJoinPublicGroup,
  MTsetMemberAttributesFromGroup,
  MTunblockGroup,
  MTunblockMembers,
  MTunMuteAllMembers,
  MTunMuteMembers,
  MTupdateDescription,
  MTupdateGroupAnnouncement,
  MTupdateGroupAvatar,
  MTupdateGroupExt,
  MTupdateGroupOwner,
  MTupdateGroupSubject,
  MTuploadGroupSharedFile,
} from './__internal__/Consts';
import { ExceptionHandler } from './__internal__/ErrorHandler';
import { Native } from './__internal__/Native';
import type { ChatGroupEventListener } from './ChatEvents';
import { chatlog } from './common/ChatConst';
import { ChatCursorResult } from './common/ChatCursorResult';
import { ChatException } from './common/ChatError';
import {
  ChatGroup,
  type ChatGroupFileStatusCallback,
  ChatGroupInfo,
  ChatGroupMember,
  ChatGroupOptions,
  ChatGroupSharedFile,
} from './common/ChatGroup';

/**
 * 群组管理类，用于管理群组的创建，删除及成员管理等操作。
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
            applicant: params?.applicant,
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
          listener.onMemberRemoved?.({
            groupId: params.groupId,
            groupName: params.groupName,
          });
          break;
        case 'onGroupDestroyed':
          listener.onDestroyed?.({
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
        case 'onMembersJoined':
          listener.onMembersJoined?.({
            groupId: params.groupId,
            members: params.members,
          });
          break;
        case 'onMemberExited':
          listener.onMemberExited?.({
            groupId: params.groupId,
            member: params.member,
          });
          break;
        case 'onMembersExited':
          listener.onMembersExited?.({
            groupId: params.groupId,
            members: params.members,
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
        case 'onStateChanged':
          listener.onStateChanged?.(new ChatGroup(params.group));
          break;
        case 'onSpecificationChanged':
          listener.onDetailChanged?.(new ChatGroup(params.group));
          break;
        case 'onMemberAttributesChanged':
          listener.onMemberAttributesChanged?.({
            groupId: params.groupId,
            member: params.member,
            operator: params.operator,
            attributes: params.attributes,
          });
          break;
        default:
          ExceptionHandler.getInstance().sendExcept({
            except: new ChatException({
              code: 1,
              description: `This type is not supported. ` + groupEventType,
            }),
            from: ChatGroupManager.TAG,
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
   * 根据群组 ID，从内存中获取群组对象。
   *
   * @param groupId 群组 ID。
   * @returns 群组实例。如果群组不存在，返回 `undefined`。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 从本地数据库获取当前用户已加入的群组。
   *
   * @returns 群组列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 以分页方式从服务器获取当前用户已加入的群组。
   *
   * 此操作只返回群组列表，不包含群组的所有成员信息。如果要更新某个群组包括成员的全部信息，需要再调用 {@link #fetchMemberListFromServer}。
   *
   * @param pageSize 每页期望返回的群组数。[1, 20]
   * @param pageNum 当前页码，从 0 开始。
   * @returns 当前用户已加入的群组列表
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
        needRole: true,
        needMemberCount: true,
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
   * 分页从服务器获取公开群组。
   *
   * @param pageSize 每页期望返回的群组数。
   * @param cursor 开始取数据的游标位置。首次调用时传 `null`，按群组创建时间的倒序获取。
   * @returns 群组列表以及用于下次查询的 cursor。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 创建群组。
   *
   * 群组创建成功后，会更新内存及数据库中的数据，多端多设备会收到相应的通知事件，然后将群组更新到内存及数据库中。
   *
   * 可通过设置 {@link ChatGroupEventListener} 监听相关事件。
   *
   * @param options 群组创建时需设置的选项。该参数可选，不可为 `null`。详见 {@link ChatGroupOptions}.
   * 群组的其他选项如下：
   *                      - 群组最大成员数，默认值为 200；
   *                      - 群组类型，详见 {@link ChatGroupStyle}。默认值为 {@link ChatGroupStyle.PrivateOnlyOwnerInvite}，即私有群，仅群主可邀请用户入群；
   *                      - 邀请入群是否需要对方同意，默认为 `false`，即邀请后直接入群；
   *                      - 群详情扩展。
   * @param groupName 群组名称。该参数可选，不设置传 `null`。
   * @param desc 群组描述。该参数可选，不设置传 `null`。
   * @param inviteMembers 群成员列表。可选参数。该参数不可为 `null`。
   * @param inviteReason 成员入群的邀请信息。该参数可选，不设置传 `null`。
   * @returns 创建成功的群组实例。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async createGroup(
    options: ChatGroupOptions,
    groupName: string,
    desc?: string,
    inviteMembers?: Array<string>,
    inviteReason?: string
  ): Promise<ChatGroup> {
    return this.createGroupEx({
      options,
      groupName,
      desc,
      inviteMembers,
      inviteReason,
    });
  }

  /**
   * 创建群组对象。支持设置头像。
   *
   * 群组创建成功后，会更新内存及数据库中的数据，多端多设备会收到相应的通知事件，然后将群组更新到内存及数据库中。
   *
   * 可通过设置 {@link ChatGroupEventListener} 监听相关事件。
   *
   * @param options 群组创建时需设置的选项。该参数可选，不可为 `null`。详见 {@link ChatGroupOptions}.
   * 群组的其他选项如下：
   *                      - 群组最大成员数，默认值为 200；
   *                      - 群组类型，详见 {@link ChatGroupStyle}。默认值为 {@link ChatGroupStyle.PrivateOnlyOwnerInvite}，即私有群，仅群主可邀请用户入群；
   *                      - 邀请入群是否需要对方同意，默认为 `false`，即邀请后直接入群；
   *                      - 群详情扩展。
   * @param groupName 群组名称。
   * @param groupAvatar 群组头像。
   * @param desc 群组描述。
   * @param inviteMembers 群成员列表。
   * @param inviteReason 成员入群的邀请信息。
   * @returns 创建成功的群组实例。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async createGroupEx(params: {
    options: ChatGroupOptions;
    groupName: string;
    groupAvatar?: string;
    desc?: string;
    inviteMembers?: Array<string>;
    inviteReason?: string;
  }): Promise<ChatGroup> {
    const {
      options,
      groupName,
      groupAvatar,
      desc,
      inviteMembers,
      inviteReason,
    } = params;
    chatlog.log(
      `${ChatGroupManager.TAG}: createGroupEx: `,
      options,
      groupName,
      groupAvatar,
      desc,
      inviteMembers,
      inviteReason
    );
    let r: any = await Native._callMethod(MTcreateGroup, {
      [MTcreateGroup]: {
        groupName,
        groupAvatar,
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
   * 从服务器获取群组详情。
   *
   * @param groupId 群组 ID。
   * @param isFetchMembers 是否获取群组成员信息：
   *                       - `true`：是；该方法最多可获取 200 个成员的信息。如需获取所有群组成员的信息，可调用 {@link fetchMemberListFromServer}。
   *                       - `false`：否。
   * @returns 群组实例。如果群组不存在，返回 `undefined`。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchGroupInfoFromServer(
    groupId: string,
    isFetchMembers: boolean = false
  ): Promise<ChatGroup | undefined> {
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchGroupInfoFromServer: `,
      groupId,
      isFetchMembers
    );
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
   * 获取群组信息，但不包含群组成员信息。
   *
   * @param groupId 群组 ID。
   * @returns 群组实例。如果群组不存在，返回 `undefined`。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchGroupInfoWithoutMembersFromServer(
    groupId: string
  ): Promise<ChatGroup | undefined> {
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchGroupInfoWithoutMembersFromServer: `,
      groupId
    );
    let r: any = await Native._callMethod(MTgetGroupSpecificationFromServer, {
      [MTgetGroupSpecificationFromServer]: {
        groupId: groupId,
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
   * 从服务器分页获取群组成员。
   *
   * @param groupId 群组 ID。
   * @param pageSize 每页获取的群组成员数量。
   * @param cursor 开始取数据的游标位置。首次调用时传 `null`，按成员加入群组时间的倒序获取。
   * @returns 群组成员列表以及下次查询的 cursor。详见 {@link ChatCursorResult}。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 从服务器分页获取群组成员信息列表。
   *
   * @param groupId 群组 ID。
   * @param cursor 游标位置，从该位置开始获取数据。首次调用时传 `null`，按成员加入群组时间的倒序获取。
   * @param limit 每页获取的群组成员数量。默认值为 200。
   * @returns 群组成员信息列表和下次查询的游标。详见 {@link ChatCursorResult}。
   *
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}.
   */
  public async fetchMemberInfoListFromServer(
    groupId: string,
    cursor: string,
    limit?: number
  ): Promise<ChatCursorResult<ChatGroupMember>> {
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchMemberInfoListFromServer: `,
      groupId,
      cursor,
      limit
    );
    let r: any = await Native._callMethod(MTfetchMemberInfoListFromServer, {
      [MTfetchMemberInfoListFromServer]: {
        groupId,
        cursor,
        limit: limit ?? 200,
      },
    });
    let ret = new ChatCursorResult<ChatGroupMember>({
      cursor: r?.[MTfetchMemberInfoListFromServer].cursor,
      list: r?.[MTfetchMemberInfoListFromServer].list,
      opt: {
        map: (param: any) => {
          return new ChatGroupMember(param);
        },
      },
    });
    return ret;
  }

  /**
   * 从服务器分页获取群组黑名单列表。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param pageSize 每页获取的数量。
   * @param pageNum 当前页码，从 1 开始。
   * @returns 群组黑名单列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 从服务器分页获取群组禁言列表。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param pageSize 每页获取的禁言成员数量。
   * @param pageNum 当前页码，从 1 开始。
   * @returns 群组禁言列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 从服务器分页获取群组白名单列表。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @returns 群组白名单列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 从服务器查询该用户是否在群组白名单上。
   *
   * @param groupId 群组 ID。
   * @returns 该用户是否在群白名单上。
   * - `true`：是。
   * - `false`：否。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 从服务器分页获取群共享文件。
   *
   * @param groupId 群组 ID。
   * @param pageSize 每页获取的群共享文件数量。
   * @param pageNum 当前页面，从 1 开始。
   * @returns 群共享文档列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 从服务器获取群组公告。
   *
   * 所有群成员都可以调用该方法。
   *
   * @param groupId 群组 ID。
   * @returns 群组公告。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 向群组中添加新成员。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param members 要加入的成员列表。
   * @param welcome (可选) 欢迎消息。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 邀请用户加入群组。
   *
   * 该方法只适用于以下三种类型的群组： `PrivateOnlyOwnerInvite`、`PrivateMemberCanInvite` 和 `PublicJoinNeedApproval`。
   * 对于 `PrivateOnlyOwnerInvite` 类型，只有群主可以邀请其他用户加入群组。
   * 对于 `PrivateMemberCanInvite` 类型，所有成员都可以邀请其他用户加入群组。
   * 对于 `PublicJoinNeedApproval` 类型，所有成员都可以邀请其他用户加入群组，但邀请后需要群主或群管理员审批。
   *
   * @param groupId 群组 ID。
   * @param members 受邀用户的用户 ID 列表。
   * @param reason 邀请理由。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async inviteUser(
    groupId: string,
    members: Array<string>,
    reason?: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: inviteUser: `,
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
   * 从群组中移除用户。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param members 要移出群组的成员用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 将成员加入群组的黑名单列表。
   *
   * 成功调用该方法后，该用户会先被移除出群组，然后加入群组黑名单。该用户无法接收、发送群消息，也无法申请再次加入群组。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param members 要加入群组黑名单的成员的用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 将用户从群组黑名单中移除。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param members 要移出黑名单的用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 修改群组名称。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param groupName 新的群组名称。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 修改群组描述。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param description 新的群组描述。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 主动退出群组。
   *
   * @param groupId 群组 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 解散群组。
   *
   * 仅群主可调用此方法。
   *
   * @param groupId 群组 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 屏蔽群消息。
   *
   * 屏蔽群消息的用户仍是群成员，但无法接收群消息。
   *
   * @param groupId 群组 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 解除屏蔽群消息。
   *
   * @param groupId 群组 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 转移群主权限。
   *
   * 仅群主可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param newOwner 新群主的用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 添加群组管理员。
   *
   * 仅群主可调用此方法。管理员不可调用该方法。
   *
   * @param groupId 群组 ID。
   * @param admin 设置为群组管理员的成员用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 移除群组管理员权限。
   *
   * 仅群主可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param admin 移除群组管理员权限的成员用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 禁言群组成员。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param members 要禁言的成员用户 ID 列表。
   * @param duration 禁言时长。预留参数。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 将成员移除群组禁言名单。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param members 要移出禁言名单的用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 禁言全体群成员。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 解除全体成员禁言。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 将成员加入群组白名单。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param members 要加入群组白名单的用户 ID 列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 从群白名单中移出成员。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param members 要移出群组白名单的成员列表。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 上传群组共享文件。
   *
   * 上传成功时会触发群共享文件上传回调。
   *
   * @param groupId 群组 ID。
   * @param filePath 群共享文件路径。
   * @param callback (可选) 群共享文件上传结果回调。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 下载群共享文件。
   *
   * @param groupId 群组 ID。
   * @param fileId 群共享文件 ID。
   * @param savePath 群共享文件保存地址。
   * @param callback （可选）下载结果回调。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 删除指定群共享文件。
   *
   * 群成员可以删除自己上传的共享文件，群主或管理员可以删除所有人上传的共享文件。
   *
   * @param groupId 群组 ID。
   * @param fileId 群共享文件 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 更新群公告。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param announcement 新的群公告。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 更新群组头像。
   *
   * @param groupId 群组 ID。
   * @param avatar 新的群组头像。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async updateGroupAvatar(
    groupId: string,
    avatar: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: updateGroupAvatar: `,
      groupId,
      avatar
    );
    let r: any = await Native._callMethod(MTupdateGroupAvatar, {
      [MTupdateGroupAvatar]: {
        groupId,
        avatar,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * 更新群组扩展字段信息。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param extension 更新后的群组扩展字段信息。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 加入公开群组。
   *
   * 若群组无需群主或管理员验证，可直接加入。
   *
   * 若群组需要群主或管理员验证，用户需等待请求批准后才能加入。群组类型详见 {@link ChatGroupStyle}。
   *
   * @param groupId 群组 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 申请加入群组。
   *
   * 该方法仅适用于群组类型为 {@link ChatGroupStyle.PublicJoinNeedApproval} 的公开群组。
   *
   * @param groupId 群组 ID。
   * @param reason 申请加入的理由。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 同意入群申请。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param username 申请入群的用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async acceptJoinApplication(
    groupId: string,
    userId: string
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: acceptJoinApplication: `,
      groupId,
      userId
    );
    let r: any = await Native._callMethod(MTacceptJoinApplication, {
      [MTacceptJoinApplication]: {
        groupId,
        username: userId,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * 拒绝用户的入群申请。
   *
   * 仅群主和管理员可调用此方法。
   *
   * @param groupId 群组 ID。
   * @param username 申请入群的用户 ID。
   * @param reason 拒绝理由。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 接受入群邀请。
   *
   * @param groupId 群组 ID。
   * @param inviter 邀请人的用户 ID。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 拒绝入群邀请。
   *
   * @param groupId 群组 ID。
   * @param inviter 邀请人的用户 ID。
   * @param reason 拒绝理由。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
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
   * 设置单个群成员的自定义属性。
   *
   * @param groupId 群组 ID。
   * @param member 要设置自定义属性的群成员的用户 ID。
   * @param attribute 要设置的群成员自定义属性的 map，为 key-value 格式。对于一个 key-value 键值对，若 value 设置空字符串即删除该自定义属性。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async setMemberAttribute(
    groupId: string,
    member: string,
    attributes: Record<string, string>
  ): Promise<void> {
    chatlog.log(
      `${ChatGroupManager.TAG}: setMemberAttribute: `,
      groupId,
      member,
      attributes
    );
    let r: any = await Native._callMethod(MTsetMemberAttributesFromGroup, {
      [MTsetMemberAttributesFromGroup]: {
        groupId,
        member,
        attributes,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
  }

  /**
   * 获取单个群成员所有自定义属性。
   *
   * @param groupId 群组 ID。
   * @param member 要获取的自定义属性的群成员的用户 ID。
   *
   * @returns 成员属性。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchMemberAttributes(
    groupId: string,
    member: string
  ): Promise<Record<string, string> | undefined> {
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchMemberAttributes: `,
      groupId,
      member
    );
    let r: any = await Native._callMethod(MTfetchMemberAttributesFromGroup, {
      [MTfetchMemberAttributesFromGroup]: {
        groupId,
        member,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    return r?.[MTfetchMemberAttributesFromGroup];
  }

  /**
   * 根据指定的属性 key 获取多个群成员的自定义属性。
   *
   * @param groupId 群组 ID。
   * @param members 要获取自定义属性的群成员的用户 ID 数组。
   * @param attributeKeys 要获取自定义属性的 key 的数组。若 keys 为空数组或不传则获取这些群成员的所有自定义属性。
   *
   * @returns 指定成员指定关键字的属性。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchMembersAttributes(
    groupId: string,
    members: string[],
    attributeKeys?: string[]
  ): Promise<Map<string, Record<string, string>>> {
    chatlog.log(
      `${ChatGroupManager.TAG}: fetchMembersAttributes: `,
      groupId,
      members,
      attributeKeys
    );
    let r: any = await Native._callMethod(MTfetchMembersAttributesFromGroup, {
      [MTfetchMembersAttributesFromGroup]: {
        groupId,
        members,
        keys: attributeKeys,
      },
    });
    ChatGroupManager.checkErrorFromResult(r);
    const ret: Map<string, Record<string, string>> = new Map();
    Object.entries(r?.[MTfetchMembersAttributesFromGroup]).forEach(
      (v: [string, any]) => {
        ret.set(v[0], v[1]);
      }
    );
    return ret;
  }

  /**
   * 获取已加入的群组数目。
   *
   * @returns 已加入群组的数目。
   *
   * @throws 如果有异常会在这里抛出，包含错误码和错误描述，详见 {@link ChatError}。
   */
  public async fetchJoinedGroupCount(): Promise<number> {
    chatlog.log(`${ChatGroupManager.TAG}: fetchJoinedGroupCount: `);
    let r: any = await Native._callMethod(MTfetchJoinedGroupCount);
    ChatGroupManager.checkErrorFromResult(r);
    return r?.[MTfetchJoinedGroupCount];
  }

  /**
   * 添加群组监听器。
   *
   * @param listener 将要添加的群组监听器。
   */
  public addGroupListener(listener: ChatGroupEventListener): void {
    chatlog.log(`${ChatGroupManager.TAG}: addGroupListener: `);
    this._groupListeners.add(listener);
  }

  /**
   * 移除群组监听器。
   *
   * @param listener 要移除的群组监听器。
   */
  public removeGroupListener(listener: ChatGroupEventListener): void {
    chatlog.log(`${ChatGroupManager.TAG}: removeGroupListener: `);
    this._groupListeners.delete(listener);
  }

  /**
   * 清除群组监听器。
   */
  public removeAllGroupListener(): void {
    chatlog.log(`${ChatGroupManager.TAG}: removeAllGroupListener: `);
    this._groupListeners.clear();
  }
}
