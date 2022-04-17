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

export interface ChatRoom {
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
}
