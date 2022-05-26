import { ChatError } from './ChatError';

/**
 * The enumeration of group types.
 */
export enum ChatGroupStyle {
  /**
   * Private groups where only the the group owner can invite users to join.
   */
  PrivateOnlyOwnerInvite = 0,
  /**
   * Private groups where all group members can invite users to join.
   */
  PrivateMemberCanInvite = 1,
  /**
   * Public groups where users can join only after receiving an invitation from the group owner(admin) or the joining request being approved by the  group owner(admin).
   */
  PublicJoinNeedApproval = 2,
  /**
   * Public groups where users can join freely.
   */
  PublicOpenJoin = 3,
}

/**
 * The enumeration of group permission types.
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
 * The group type convert.
 *
 * @param params Integer representing group type.
 * @returns The group type.
 */
export function ChatGroupStyleFromNumber(params: number): ChatGroupStyle {
  switch (params) {
    case 0:
      return ChatGroupStyle.PrivateOnlyOwnerInvite;
    case 1:
      return ChatGroupStyle.PrivateMemberCanInvite;
    case 2:
      return ChatGroupStyle.PublicJoinNeedApproval;
    case 3:
      return ChatGroupStyle.PublicOpenJoin;
    default:
      throw new ChatError({
        code: 1,
        description: `This type is not supported. ` + params,
      });
  }
}

/**
 * The group permission type convert.
 *
 * @param params The group permission type.
 * @returns String representing group permission type.
 */
export function ChatGroupStyleToString(params: ChatGroupStyle): string {
  return ChatGroupStyle[params];
}

/**
 * The group permission type convert.
 *
 * @param params Integer representing group type.
 * @returns The group type.
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
      throw new ChatError({
        code: 1,
        description: `This type is not supported. ` + params,
      });
  }
}

/**
 * The group permission type convert.
 *
 * @param params The group permission type.
 * @returns String representing group permission type.
 */
export function ChatGroupPermissionTypeToString(
  params: ChatGroupPermissionType
): string {
  return ChatGroupPermissionType[params];
}

/**
 * The class for group message read receipts.
 */
export class ChatGroupMessageAck {
  /**
   * The group message ID.
   */
  msg_id: string;
  /**
   * The ID of the  group message read receipt.
   */
  ack_id: string;
  /**
   * The username of the user who sends the read receipt.
   */
  from: string;
  /**
   * The number read receipts of group messages.
   */
  count: number;
  /**
   * The timestamp of sending read receipts of group messages.
   */
  timestamp: number;
  /**
   * The read receipt extension.
   */
  content?: string;
  constructor(params: {
    msg_id: string;
    ack_id: string;
    from: string;
    count: number;
    timestamp: number;
    ext?: { content: string };
  }) {
    this.msg_id = params.msg_id;
    this.ack_id = params.ack_id;
    this.from = params.from;
    this.count = params.count;
    this.timestamp = params.timestamp;
    if (params.ext) {
      this.content = params.ext.content;
    }
  }
}

/**
 * The ChatGroup class, which contains the information of the chat group.
 * Call {@link ChatGroupManager#fetchGroupInfoFromServer} method to obtain group information.
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
   * Whether the group message is blocked.
   */
  messageBlocked: boolean;
  /**
   * Whether all members are muted.
   */
  isAllMemberMuted: boolean;
  /**
   * The current user's role in group.
   */
  permissionType: ChatGroupPermissionType;
  /**
   * The group option.
   */
  private options: ChatGroupOptions;
  /**
   * Get the maximum number of group members allowed in a group. The parameter is set when the group is created.
   */
  get maxCount(): number {
    return this.options.maxCount;
  }

  constructor(params: {
    groupId: string;
    groupName?: string;
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
    options?: ChatGroupOptions;
  }) {
    this.groupId = params.groupId;
    this.groupName = params.groupName ?? '';
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
    this.permissionType = params.permissionType
      ? ChatGroupPermissionTypeFromNumber(params.permissionType)
      : ChatGroupPermissionType.None;
    this.options = params.options ?? new ChatGroupOptions({});
  }
}

/**
 * The group options to be configured when the chat group is created.
 */
export class ChatGroupOptions {
  /**
   * The group style.
   */
  style: ChatGroupStyle;
  /**
   * The maximum number of members in a group.
   */
  maxCount: number;
  /**
   * Whether you need the approval from the user when adding this user to the chat group.
   *
   * Whether you can automatically add a user to the chat group depends on the settings of {ChatGroupOptions#inviteNeedConfirm} and {ChatOptions#autoAcceptGroupInvitation}.
   */
  inviteNeedConfirm: boolean;
  /**
   * The group extension field.
   */
  ext?: string;
  constructor(params: {
    style?: number;
    maxCount?: number;
    inviteNeedConfirm?: boolean;
    ext?: string;
  }) {
    this.style = params.style
      ? ChatGroupStyleFromNumber(params.style)
      : ChatGroupStyle.PublicJoinNeedApproval;
    this.maxCount = params.maxCount ?? 200;
    this.inviteNeedConfirm = params.inviteNeedConfirm ?? false;
    this.ext = params.ext;
  }
}

/**
 * The ChatGroupSharedFile class, which manages the chat group shared files.
 */
export class ChatGroupSharedFile {
  /**
   * The shared file ID.
   */
  fileId: string;
  /**
   * The shared file name.
   */
  name: string;
  /**
   * The username that uploads the shared file.
   */
  owner: string;
  /**
   * The Unix timestamp for uploading the shared file, in milliseconds.
   */
  createTime: number;
  /**
   * The data length of the shared file, in bytes.
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
 * The ChatGroupInfo class.
 */
export class ChatGroupInfo {
  /**
   * The group id.
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
 * The file status change listener interface.
 */
export interface ChatGroupFileStatusCallback {
  /**
   * The progress of sending or receiving messages.
   *
   * @param groupId The group id.
   * @param filePath The file path.
   * @param progress The progress value.
   */
  onProgress(groupId: string, filePath: string, progress: number): void;

  /**
   * Error message sending or receiving.
   *
   * @param groupId The group id.
   * @param filePath The file path.
   * @param error A description of the error. See {@link ChatError}.
   */
  onError(groupId: string, filePath: string, error: ChatError): void;

  /**
   * The message is sent or received.
   *
   * @param groupId The group id.
   * @param filePath The file path.
   */
  onSuccess(groupId: string, filePath: string): void;
}
