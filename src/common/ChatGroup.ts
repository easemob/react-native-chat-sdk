import { ChatError } from './ChatError';

/**
 * 群组类型枚举。
 */
export enum ChatGroupStyle {
  /**
   * 私有群组，创建完成后，只允许群主邀请用户加入。
   */
  PrivateOnlyOwnerInvite = 0,
  /**
   * 私有群组，创建完成后，只允许群主和群成员邀请用户加入。
   */
  PrivateMemberCanInvite = 1,
  /**
   * 公开群组，创建完成后，只允许群主邀请用户加入；非群成员用户需发送入群申请，群主同意后才能入群。
   */
  PublicJoinNeedApproval = 2,
  /**
   * 公开群组，创建完成后，允许非群组成员加入，无需群主同意。
   */
  PublicOpenJoin = 3,
}

/**
 * 群组角色类型枚举。
 */
export enum ChatGroupPermissionType {
  /**
   * 未知。
   */
  None = -1,
  /**
   * 群组成员。
   */
  Member = 0,
  /**
   * 群管理员。
   */
  Admin = 1,
  /**
   * 群主。
   */
  Owner = 2,
}

/**
 * 将群组类型由整型转换为枚举类型。
 *
 * @param params 整型的群组类型。
 * @returns 枚举类型的群组类型。
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
 * 群组类型由枚举转换为字符串类型。
 *
 * @param params 枚举类型的群组类型。
 * @returns 字符串类型的群组类型。
 */
export function ChatGroupStyleToString(params: ChatGroupStyle): string {
  return ChatGroupStyle[params]!;
}

/**
 * 群成员角色由数字整型转换为枚举类型。
 *
 * @param params 整型的群成员角色类型。
 * @returns 枚举类型的群成员角色。
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
 * 群组角色由枚举类型转换为字符串类型。
 *
 * @param params 枚举类型的群组角色。
 * @returns 字符串类型的群组角色。
 */
export function ChatGroupPermissionTypeToString(
  params: ChatGroupPermissionType
): string {
  return ChatGroupPermissionType[params]!;
}

/**
 * 群组消息已读回执类。
 */
export class ChatGroupMessageAck {
  /**
   * 群组消息 ID。
   */
  msg_id: string;
  /**
   * 群组消息已读回执的 ID。
   */
  ack_id: string;
  /**
   * 发送已读回执的用户 ID。
   */
  from: string;
  /**
   * 群组消息已读回执数量。
   */
  count: number;
  /**
   * 群组消息已读回执发送的 Unix 时间戳。单位为毫秒。
   */
  timestamp: number;
  /**
   * 已读回执的扩展信息。
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
 * 群组信息类，包含群组相关的信息。
 *
 * 可调用 {@link ChatGroupManager.fetchGroupInfoFromServer} 方法获取群组相关信息。
 */
export class ChatGroup {
  /**
   * 群组 ID。
   */
  groupId: string;
  /**
   * 群组名称。
   */
  groupName: string;
  /**
   * 群组的描述信息。
   */
  description: string;
  /**
   * 群主的用户 ID。
   */
  owner: string;
  /**
   * 群组公告内容。
   */
  announcement: string;
  /**
   * 群组的成员数。
   */
  memberCount: number;
  /**
   * 群组成员列表。
   */
  memberList: Array<string>;
  /**
   * 群组管理员列表。
   */
  adminList: Array<string>;
  /**
   * 群组黑名单列表。
   */
  blockList: Array<string>;
  /**
   * 群组禁言列表。
   */
  muteList: Array<string>;
  /**
   * 群组消息是否被当前用户屏蔽。
   * - `true`：是。
   * - `false`：否。
   */
  messageBlocked: boolean;
  /**
   * 是否在全员禁言状态。
   * - `true`：是。
   * - `false`：否。
   */
  isAllMemberMuted: boolean;
  /**
   * 当前用户在群组中的角色。
   */
  permissionType: ChatGroupPermissionType;
  /**
   * 群组选项。
   */
  options?: ChatGroupOptions;
  /**
   * 获取群组最大成员数量。该参数在创建群组时设定。
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
    this.permissionType = ChatGroupPermissionTypeFromNumber(
      params.permissionType
    );
    if (params.options) {
      this.options = new ChatGroupOptions(params.options);
    }
  }
}

/**
 * 群组选项类，包含群组创建时设置的选项。
 */
export class ChatGroupOptions {
  /**
   * 群组类型。
   */
  style: ChatGroupStyle;
  /**
   * 群组最大成员数量。
   */
  maxCount: number;
  /**
   * 邀请用户进群是否需要对方同意。
   *
   * 收到邀请是否自动入群取决于两个设置：创建群组时设置 {@link GroupOptions#inviteNeedConfirm} 以及通过 {@link ChatOptions#autoAcceptGroupInvitation} 确定是否自动接受加群邀请。
   *
   * （1）如果 `inviteNeedConfirm` 设置为 `false`，在服务端直接加受邀人进群，与受邀人对 {@link ChatOptions.autoAcceptGroupInvitation} 的设置无关。
   *  (2) 如果 `inviteNeedConfirm` 设置为 `true`，是否自动入群取决于受邀请人对 {@link ChatOptions.autoAcceptGroupInvitation} 的设置。
   *
   * {@link ChatOptions#autoAcceptGroupInvitation} 为 SDK 级别操作，设置为 `true` 时，受邀人收到入群邀请后，SDK 在内部调用同意入群的 API，自动接受邀请入群；
   *  若设置为 `false`，即非自动同意其邀请，用户可以选择接受邀请进群，也可选择拒绝邀请。
   */
  inviteNeedConfirm: boolean;
  /**
   * 群组扩展信息。
   */
  ext?: string;
  /**
   * Whether the group is disabled:
   * - `true`: Yes.
   * - `false`: No.
   */
  isDisabled: boolean;
  /**
   * Construct a group option.
   */
  constructor(params: {
    style?: number;
    maxCount?: number;
    inviteNeedConfirm?: boolean;
    ext?: string;
    isDisabled?: boolean;
  }) {
    this.style = params.style
      ? ChatGroupStyleFromNumber(params.style)
      : ChatGroupStyle.PublicJoinNeedApproval;
    this.maxCount = params.maxCount ?? 200;
    this.inviteNeedConfirm = params.inviteNeedConfirm ?? false;
    this.ext = params.ext;
    this.isDisabled = params.isDisabled ?? false;
  }
}

/**
 * 群组共享文件类，包含共享文件信息。
 */
export class ChatGroupSharedFile {
  /**
   * 共享文件 ID。
   */
  fileId: string;
  /**
   * 共享文件名称。
   */
  name: string;
  /**
   * 上传共享文件的成员的用户 ID。
   */
  owner: string;
  /**
   * 上传共享文件的 Unix 时间戳，单位为毫秒。
   */
  createTime: number;
  /**
   * 共享文件的大小，单位为字节。
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
 * 群组信息类。
 */
export class ChatGroupInfo {
  /**
   * 群组 ID。
   */
  groupId: string;
  /**
   * 群组名称。
   */
  groupName: string;
  constructor(params: { groupId: string; groupName: string }) {
    this.groupId = params.groupId;
    this.groupName = params.groupName;
  }
}

/**
 * 群组共享文件状态变化监听器。
 */
export interface ChatGroupFileStatusCallback {
  /**
   * 共享文件的上传或下载进度。
   *
   * @param groupId 群组 ID。
   * @param filePath 文件路径。
   * @param progress 进度值，取值范围为 0-100。
   */
  onProgress?(groupId: string, filePath: string, progress: number): void;

  /**
   * 共享文件上传或下载错误回调。
   *
   * @param groupId 群组 ID。
   * @param filePath 群组共享文件路径。
   * @param error 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
   */
  onError(groupId: string, filePath: string, error: ChatError): void;

  /**
   * 消息发送成功回调。
   *
   * @param groupId 群组 ID。
   * @param filePath 群组共享文件路径。
   */
  onSuccess(groupId: string, filePath: string): void;
}
