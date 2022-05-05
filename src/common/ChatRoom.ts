export enum ChatRoomPermissionType {
  None = -1,
  Member = 0,
  Admin = 1,
  Owner = 2,
}

export function ChatRoomPermissionTypeFromNumber(
  params: number
): ChatRoomPermissionType {
  switch (params) {
    case -1:
      return ChatRoomPermissionType.None;
    case 0:
      return ChatRoomPermissionType.Member;
    case 1:
      return ChatRoomPermissionType.Admin;
    case 2:
      return ChatRoomPermissionType.Owner;
    default:
      throw new Error(`not exist this type: ${params}`);
  }
}
export function ChatRoomPermissionTypeToString(
  params: ChatRoomPermissionType
): string {
  return ChatRoomPermissionType[params];
}

export class ChatRoom {
  roomId: string;
  name?: string;
  description?: string;
  owner: string;
  announcement?: string;
  memberCount?: string;
  maxUsers?: string;
  adminList?: Array<string>;
  memberList?: Array<string>;
  blockList?: Array<string>;
  muteList?: Array<string>;
  isAllMemberMuted?: boolean;
  permissionType: ChatRoomPermissionType;
  constructor(params: {
    roomId: string;
    name?: string;
    description?: string;
    owner: string;
    announcement?: string;
    memberCount?: string;
    maxUsers?: string;
    adminList?: Array<string>;
    memberList?: Array<string>;
    blockList?: Array<string>;
    muteList?: Array<string>;
    isAllMemberMuted?: boolean;
    permissionType: number;
  }) {
    this.roomId = params.roomId;
    this.name = params.name;
    this.description = params.description;
    this.owner = params.owner;
    this.announcement = params.announcement;
    this.memberCount = params.memberCount;
    this.maxUsers = params.maxUsers;
    this.adminList = params.adminList;
    this.memberList = params.memberList;
    this.blockList = params.blockList;
    this.muteList = params.muteList;
    this.isAllMemberMuted = params.isAllMemberMuted;
    this.permissionType = ChatRoomPermissionTypeFromNumber(
      params.permissionType
    );
  }
}
