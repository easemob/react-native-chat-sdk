export enum ChatGroupStyle {
  PrivateOnlyOwnerInvite = 0, // 私有群，只有群主能邀请他人进群，被邀请人会收到邀请信息，同意后可入群；
  PrivateMemberCanInvite = 1, // 私有群，所有人都可以邀请他人进群，被邀请人会收到邀请信息，同意后可入群；
  PublicJoinNeedApproval = 2, // 公开群，可以通过获取公开群列表api取的，申请加入时需要管理员以上权限用户同意；
  PublicOpenJoin = 3, // 公开群，可以通过获取公开群列表api取的，可以直接进入；
}

export enum ChatGroupPermissionType {
  None = -1,
  Member = 0,
  Admin = 1,
  Owner = 2,
}

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
      throw new Error(`not exist this type: ${params}`);
  }
}
export function ChatConversationTypeToString(params: ChatGroupStyle): string {
  return ChatGroupStyle[params];
}

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
      throw new Error(`not exist this type: ${params}`);
  }
}
export function ChatGroupPermissionTypeToString(
  params: ChatGroupPermissionType
): string {
  return ChatGroupPermissionType[params];
}

export class ChatGroupMessageAck {
  msg_id: string;
  from: string;
  count: number;
  timestamp: number;
  content?: string;
  constructor(params: {
    msg_id: string;
    from: string;
    count: number;
    timestamp: number;
    ext?: { content: string };
  }) {
    this.msg_id = params.msg_id;
    this.from = params.from;
    this.count = params.count;
    this.timestamp = params.timestamp;
    if (params.ext) {
      this.content = params.ext.content;
    }
  }
}

export class ChatGroup {
  groupId: string;
  name: string;
  desc: string;
  owner: string;
  announcement: string;
  memberCount: number;
  memberList: Array<string>;
  adminList: Array<string>;
  blockList: Array<string>;
  muteList: Array<string>;
  noticeEnable: boolean;
  messageBlocked: boolean;
  isAllMemberMuted: boolean;
  options: ChatGroupOptions;
  permissionType: ChatGroupPermissionType;
  constructor(params: {
    groupId: string;
    name: string;
    desc: string;
    owner: string;
    announcement: string;
    memberCount: number;
    memberList: Array<string>;
    adminList: Array<string>;
    blockList: Array<string>;
    muteList: Array<string>;
    noticeEnable: boolean;
    messageBlocked: boolean;
    isAllMemberMuted: boolean;
    options: ChatGroupOptions;
    permissionType: number;
  }) {
    this.groupId = params.groupId;
    this.name = params.name;
    this.desc = params.desc ?? '';
    this.owner = params.owner ?? '';
    this.announcement = params.announcement ?? '';
    this.memberCount = params.memberCount ?? 0;
    this.memberList = params.memberList ?? [];
    this.adminList = params.adminList ?? [];
    this.blockList = params.blockList ?? [];
    this.muteList = params.muteList ?? [];
    this.noticeEnable = params.noticeEnable ?? false;
    this.messageBlocked = params.messageBlocked ?? false;
    this.isAllMemberMuted = params.isAllMemberMuted ?? false;
    this.options = params.options ?? new ChatGroupOptions({});
    this.permissionType = params.permissionType
      ? ChatGroupPermissionTypeFromNumber(params.permissionType)
      : ChatGroupPermissionType.None;
  }
}

export class ChatGroupOptions {
  style: ChatGroupStyle;
  maxCount: number;
  inviteNeedConfirm: boolean;
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

export class ChatGroupSharedFile {
  fileId: string;
  name: string;
  owner: string;
  createTime: number;
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
