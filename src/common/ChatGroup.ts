import type { ChatError } from './ChatError';
import { ChatGroupMemberInfo } from './ChatGroupMemberInfo';

/**
 * The group role types.
 */
export enum ChatGroupPermissionType {
  /**
   * Unknown.
   */
  None = -1,
  /**
   * The group member.
   */
  Member = 0,
  /**
   * The group admin.
   */
  Admin = 1,
  /**
   * The group owner.
   */
  Owner = 2,
}

/**
 * Converts the group role from Int to enum.
 *
 * @param params The group role of the Int type.
 * @returns The group role of the enum type.
 */
export function ChatGroupPermissionTypeFromNumber(
  params: number
): ChatGroupPermissionType {
  switch (params) {
    case -1:
      return ChatGroupPermissionType.None;
    case 0:
      return ChatGroupPermissionType.Member;
    case 1:
      return ChatGroupPermissionType.Admin;
    case 2:
      return ChatGroupPermissionType.Owner;
    default:
      return params;
  }
}

/**
 * Converts the group role from enum to string.
 *
 * @param params The group role of the enum type.
 * @returns The group role of the string type.
 */
export function ChatGroupPermissionTypeToString(
  params: ChatGroupPermissionType
): string {
  return ChatGroupPermissionType[params]!;
}

/**
 * The class for read receipts of group messages.
 */
export class ChatGroupReadReceipt {
  /**
   * The group message ID.
   */
  msgId: string;
  /**
   * The ID of the read receipt of a group message.
   */
  ackId: string;
  /**
   * The information of the group member who sends the read receipt. See {@link ChatGroupMemberInfo}.
   */
  from: ChatGroupMemberInfo;
  /**
   * The number of read receipts of group messages.
   */
  count: number;
  /**
   * The Unix timestamp of sending the read receipt of a group message. The unit is millisecond.
   */
  timestamp: number;
  constructor(params: {
    msg_id: string;
    ack_id: string;
    from: any;
    count: number;
    timestamp: number;
  }) {
    this.msgId = params.msg_id;
    this.ackId = params.ack_id;
    this.from = new ChatGroupMemberInfo(params.from);
    this.count = params.count;
    this.timestamp = params.timestamp;
  }
}

/**
 * The group information class, which contains the information of the chat group.
 *
 * You can call the {@link ChatGroupManager.fetchGroupInfoWithoutMembersFromServer} method to obtain group information.
 */
export class ChatGroup {
  /**
   * The group ID.
   */
  groupId: string;
  /**
   * The group name.
   */
  groupName: string;
  /**
   * The group avatar.
   */
  groupAvatar: string;
  /**
   * The group description.
   */
  description: string;
  /**
   * The user ID of the group owner.
   */
  owner: string;
  /**
   * The content of the group announcement.
   */
  announcement: string;
  /**
   * The member count of the group.
   */
  memberCount: number;
  /**
   * The member list of the group.
   */
  memberList: Array<string>;
  /**
   * The admin list of the group.
   */
  adminList: Array<string>;
  /**
   * The block list of the group.
   */
  blockList: Array<string>;
  /**
   * The mute list of the group.
   */
  muteList: Array<string>;
  /**
   * Whether group messages are blocked.
   * - `true`: Yes.
   * - `false`: No.
   */
  messageBlocked: boolean;
  /**
   * Whether all group members are muted.
   * - `true`: Yes.
   * - `false`: No.
   */
  isAllMemberMuted: boolean;
  /**
   * The role of the current user in the group.
   */
  permissionType: ChatGroupPermissionType;
  /**
   * The group configs. See {@link ChatGroupConfigs}.
   */
  configs?: ChatGroupConfigs;
  /**
   * Whether the group is disabled:
   * - `true`: Yes.
   * - `false`: No.
   */
  isDisabled: boolean;
  /**
   * Gets the maximum number of members allowed in a group. The parameter is set when the group is created.
   */
  get maxCount(): number {
    return this.configs?.maxCount ?? 0;
  }

  constructor(params: {
    groupId: string;
    groupName?: string;
    groupAvatar?: string;
    description?: string;
    owner: string;
    announcement?: string;
    memberCount?: number;
    memberList?: Array<string>;
    adminList?: Array<string>;
    blockList?: Array<string>;
    muteList?: Array<string>;
    messageBlocked?: boolean;
    isAllMemberMuted?: boolean;
    permissionType: number;
    configs?: any;
    isDisabled?: boolean;
  }) {
    this.groupId = params.groupId;
    this.groupName = params.groupName ?? '';
    this.groupAvatar = params.groupAvatar ?? '';
    this.description = params.description ?? '';
    this.owner = params.owner ?? '';
    this.announcement = params.announcement ?? '';
    this.memberCount = params.memberCount ?? 0;
    this.memberList = params.memberList ?? [];
    this.adminList = params.adminList ?? [];
    this.blockList = params.blockList ?? [];
    this.muteList = params.muteList ?? [];
    this.messageBlocked = params.messageBlocked ?? false;
    this.isAllMemberMuted = params.isAllMemberMuted ?? false;
    this.permissionType = ChatGroupPermissionTypeFromNumber(
      params.permissionType
    );
    if (params.configs) {
      this.configs = new ChatGroupConfigs(params.configs);
    }
    this.isDisabled = params.isDisabled ?? false;
  }
}

/**
 * The group config types, used to specify which group configs to update.
 *
 * The type is a bitmask. Multiple types can be combined with the bitwise OR operator,
 * for example, `ChatGroupConfigsType.MaxUsers | ChatGroupConfigsType.Ext`.
 *
 * See {@link ChatGroupManager.updateGroupConfigs}.
 */
export enum ChatGroupConfigsType {
  /**
   * Whether group members are allowed to invite others to join the group.
   */
  AllowInvites = 1, // 1 << 0
  /**
   * The maximum number of members allowed in the group.
   */
  MaxUsers = 2, // 1 << 1
  /**
   * Whether to ask for consent when inviting a user to join the group.
   */
  InviteNeedConfirm = 4, // 1 << 2
  /**
   * Whether joining the group requires the approval of the group owner or an admin.
   */
  JoinApprovalRequired = 8, // 1 << 3
  /**
   * Whether the group is a public group.
   */
  IsPublic = 16, // 1 << 4
  /**
   * The group extension information.
   */
  Ext = 32, // 1 << 5
}

/**
 * The group configs to be set when the chat group is created or updated.
 */
export class ChatGroupConfigs {
  /**
   * The maximum number of members allowed in a group. The default value is 200.
   */
  maxCount: number;
  /**
   * Whether to ask for consent when inviting a user to join a group.
   *
   * Whether to automatically accept the invitation to join a group depends on two settings:
   *
   * - {@link ChatGroupConfigs.inviteNeedConfirm}, an option for group creation.
   * - {@link ChatOptions.autoAcceptGroupInvitation}: Determines whether to automatically accept an invitation to join the group.
   *
   * There are two cases:
   * - If `inviteNeedConfirm` is set to `false`, the SDK adds the invitee directly to the group on the server side, regardless of the setting of {@link ChatOptions.autoAcceptGroupInvitation} on the invitee side.
   * - If `inviteNeedConfirm` is set to `true`, whether the invitee automatically joins the chat group or not depends on the settings of {@link ChatOptions.autoAcceptGroupInvitation}.
   *
   * {@link ChatOptions.autoAcceptGroupInvitation} is an SDK-level operation. If it is set to `true`, the invitee automatically joins the chat group; if it is set to `false`, the invitee can manually accept or decline the group invitation instead of joining the group automatically.
   *
   */
  inviteNeedConfirm: boolean;
  /**
   * The group extension information.
   */
  ext?: string;
  /**
   * Whether the group is a public group:
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  isPublic: boolean;
  /**
   * Whether joining the group requires the approval of the group owner or an admin:
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  joinApprovalRequired: boolean;
  /**
   * Whether group members are allowed to invite other users to join the group:
   * - `true`: Yes.
   * - (Default) `false`: No.
   */
  allowInvites: boolean;
  /**
   * Construct a group configs object.
   */
  constructor(params: {
    maxCount?: number;
    inviteNeedConfirm?: boolean;
    ext?: string;
    isPublic?: boolean;
    joinApprovalRequired?: boolean;
    allowInvites?: boolean;
  }) {
    this.maxCount = params.maxCount ?? 200;
    this.inviteNeedConfirm = params.inviteNeedConfirm ?? false;
    this.ext = params.ext;
    this.isPublic = params.isPublic ?? false;
    this.joinApprovalRequired = params.joinApprovalRequired ?? false;
    this.allowInvites = params.allowInvites ?? false;
  }
}

/**
 * The shared file class, which defines how to manage shared files.
 */
export class ChatGroupSharedFile {
  /**
   * The ID of the shared file.
   */
  fileId: string;
  /**
   * The name of the shared file.
   */
  name: string;
  /**
   * The user ID of the member who uploads the shared file.
   */
  owner: string;
  /**
   * The Unix timestamp for uploading the shared file, in milliseconds.
   */
  createTime: number;
  /**
   * The size of the shared file, in bytes.
   */
  fileSize: number;
  constructor(params: {
    fileId: string;
    name: string;
    owner: string;
    createTime: number;
    fileSize: number;
  }) {
    this.fileId = params.fileId;
    this.name = params.name;
    this.owner = params.owner;
    this.createTime = params.createTime;
    this.fileSize = params.fileSize;
  }
}

/**
 * The class that defines basic information of chat groups.
 */
export class ChatGroupInfo {
  /**
   * The group ID.
   */
  groupId: string;
  /**
   * The group name.
   */
  groupName: string;
  constructor(params: { groupId: string; groupName: string }) {
    this.groupId = params.groupId;
    this.groupName = params.groupName;
  }
}

/**
 * The status change listener for shared files in groups.
 */
export interface ChatGroupFileStatusCallback {
  /**
   * Occurs when a shared file is being uploaded or downloaded.
   *
   * @param groupId The group ID.
   * @param filePath The path of the shared file.
   * @param progress The value of the download or upload progress. The value range is 0-100 in percentage.
   */
  onProgress?(groupId: string, filePath: string, progress: number): void;

  /**
   * Occurs when there is an error during the upload or download of a shared file.
   *
   * @param groupId The group ID.
   * @param filePath The path of the shared file.
   * @param error A description of the error. See {@link ChatError}.
   */
  onError(groupId: string, filePath: string, error: ChatError): void;

  /**
   * Occurs when the message is sent.
   *
   * @param groupId The group ID.
   * @param filePath The path of the shared file.
   */
  onSuccess(groupId: string, filePath: string): void;
}

/**
 * The class that defines the member information of a chat group.
 */
export class ChatGroupMember {
  /**
   * The user ID of the group member.
   */
  memberId: string;
  /**
   * The Unix timestamp for the member joining the group, in milliseconds.
   */
  joinedTimestamp: number;
  /**
   * The role of the group member.
   */
  role: ChatGroupPermissionType;
  /**
   * The namecard of the group member in the group.
   */
  namecard?: string;
  /**
   * The nickname of the group member.
   */
  nickname?: string;
  /**
   * The avatar URL of the group member.
   */
  avatarUrl?: string;
  constructor(params: {
    memberId: string;
    joinedTimestamp: number;
    role: ChatGroupPermissionType;
    namecard?: string;
    nickname?: string;
    avatarUrl?: string;
  }) {
    this.memberId = params.memberId;
    this.joinedTimestamp = params.joinedTimestamp;
    this.role = params.role;
    this.namecard = params.namecard;
    this.nickname = params.nickname;
    this.avatarUrl = params.avatarUrl;
  }
}
