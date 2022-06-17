import { ChatError } from './ChatError';

/**
 * The chat room role types.
 */
export enum ChatRoomPermissionType {
  /**
   * Unknown.
   */
  None = -1,
  /**
   * The chat room member.
   */
  Member = 0,
  /**
   * The chat room admin.
   */
  Admin = 1,
  /**
   * The chat room owner.
   */
  Owner = 2,
}

/**
 * Converts the chat room role type from Int to enum.
 *
 * @param params The chat room role type of the Int type.
 * @returns The chat room role type of the enum type.
 */
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
      throw new ChatError({
        code: 1,
        description: `This type is not supported. ` + params,
      });
  }
}

/**
 * Converts the chat room role type from enum to string.
 *
 * @param params The chat room role type of the enum type.
 * @returns The chat room role type of the string type.
 */
export function ChatRoomPermissionTypeToString(
  params: ChatRoomPermissionType
): string {
  return ChatRoomPermissionType[params];
}

/**
 * The chat room instance class.
 *
 * To get the correct value, ensure that you call {@link ChatRoomManager#fetchChatRoomInfoFromServer(String)} to get chat room details before calling this method.
 */
export class ChatRoom {
  /**
   * The chat room ID.
   */
  roomId: string;
  /**
   * The chat room name.
   */
  roomName?: string;
  /**
   * The chat room description.
   */
  description?: string;
  /**
   * The user ID of the chat room owner.
   */
  owner: string;
  /**
   * The chat room announcement.
   */
  announcement?: string;
  /**
   * The number of members in the chat room.
   */
  memberCount?: string;
  /**
   * The maximum number of users allowed to join a chat room. This field is specified during the creation of a chat room.
   */
  maxUsers?: string;
  /**
   * The admin list of the chat room.
   */
  adminList?: Array<string>;
  /**
   * The member list of the chat room.
   */
  memberList?: Array<string>;
  /**
   * The block list of the chat room.
   */
  blockList?: Array<string>;
  /**
   * The mute list of the chat room.
   */
  muteList?: Array<string>;
  /**
   * Whether all members are muted in the chat room.
   * - `true`: Yes.
   * - `false`: No.
   */
  isAllMemberMuted?: boolean;
  /**
   * The role of the current user in the chat room. For role types, see {@link ChatRoomPermissionType}.
   */
  permissionType: ChatRoomPermissionType;
  constructor(params: {
    roomId: string;
    roomName?: string;
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
    this.roomName = params.roomName;
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
