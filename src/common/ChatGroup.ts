import { ChatError } from './ChatError';

/**
 * The group types.
 */
export enum ChatGroupStyle {
  /**
   * Private groups where only the group owner can invite users to join.
   */
  PrivateOnlyOwnerInvite = 0,
  /**
   * Private groups where each group member can invite users to join.
   */
  PrivateMemberCanInvite = 1,
  /**
   * Public groups where users can join only after an invitation is received from the group owner(admin) or the join request is accepted by the  group owner(admin).
   */
  PublicJoinNeedApproval = 2,
  /**
   * Public groups where users can join freely, without the approval of the group owner or admins.
   */
  PublicOpenJoin = 3,
}

/**
 * The group role types.
 */
export enum ChatGroupType {
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
 * Converts the group type from Int to enum.
 *
 * @param params The group type of the Int type.
 * @returns The group type of the enum type.
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
 * Converts the group type from enum to string.
 *
 * @param params The group type of the enum type.
 * @returns The group type of the string type.
 */
export function ChatGroupStyleToString(params: ChatGroupStyle): string {
  return ChatGroupStyle[params];
}

/**
 * Converts the group role from Int to enum.
 *
 * @param params The group role of the Int type.
 * @returns The group role of the enum type.
 */
export function ChatGroupTypeFromNumber(params: number): ChatGroupType {
  switch (params) {
    case -1:
      return ChatGroupType.None;
    case 0:
      return ChatGroupType.Member;
    case 1:
      return ChatGroupType.Admin;
    case 2:
      return ChatGroupType.Owner;
    default:
      throw new ChatError({
        code: 1,
        description: `This type is not supported. ` + params,
      });
  }
}

/**
 * Converts the group role from enum to string.
 *
 * @param params The group role of the enum type.
 * @returns The group role of the string type.
 */
export function ChatGroupTypeToString(params: ChatGroupType): string {
  return ChatGroupType[params];
}

/**
 *The class for read receipts of group messages.
 */
export class ChatGroupMessageAck {
  /**
   * The group message ID.
   */
  msg_id: string;
  /**
   * The ID of the read receipt of a group message.
   */
  ack_id: string;
  /**
   * The ID of the user who sends the read receipt.
   */
  from: string;
  /**
   * The number of read receipts of group messages.
   */
  count: number;
  /**
   * The Unix timestamp of sending the read receipt of a group message. The unit is millisecond.
   */
  timestamp: number;
  /**
   * The extension information of a read receipt.
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
 * The group information class, which contains the information of the chat group.
 *
 * You can call the {@link ChatGroupManager#fetchGroupInfoFromServer} method to obtain group information.
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
  permissionType: ChatGroupType;
  /**
   * The group options.
   */
  options?: ChatGroupOptions;
  /**
   * Gets the maximum number of members allowed in a group. The parameter is set when the group is created.
   */
  get maxCount(): number {
    return this.options?.maxCount ?? 0;
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
    options?: any;
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
      ? ChatGroupTypeFromNumber(params.permissionType)
      : ChatGroupType.None;
    if (params.options) {
      this.options = new ChatGroupOptions(params.options);
    }
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
   * The maximum number of members allowed in a group.
   */
  maxCount: number;
  /**
   * Whether to ask for consent when inviting a user to join a group.
   *
   * Whether to automatically accept the invitation to join a group depends on two settings:
   *
   * - {@link GroupOptions#inviteNeedConfirm}, an option for group creation.
   * - {@link ChatOptions#autoAcceptGroupInvitation}: Determines whether to automatically accept an invitation to join the group.
   *
   * There are two cases:
   * - If `inviteNeedConfirm` is set to `false`, the SDK adds the invitee directly to the group on the server side, regardless of the setting of {@link ChatOptions#autoAcceptGroupInvitation} on the invitee side.
   * - If `inviteNeedConfirm` is set to `true`, whether the invitee automatically joins the chat group or not depends on the settings of {@link ChatOptions#autoAcceptGroupInvitation}.
   *
   * {@link ChatOptions#autoAcceptGroupInvitation} is an SDK-level operation. If it is set to `true`, the invitee automatically joins the chat group; if it is set to `false`, the invitee can manually accept or decline the group invitation instead of joining the group automatically.
   *
   */
  inviteNeedConfirm: boolean;
  /**
   * The group extension information.
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
  onProgress(groupId: string, filePath: string, progress: number): void;

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
