import { ChatError } from './ChatError';

/**
 * The enumeration of chat room role types.
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
 * The room permission type convert.
 *
 * @param params The integer representing permission type.
 * @returns The room permission type.
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
 * The room permission type convert.
 *
 * @param params The room permission type.
 * @returns The string representing room permission type.
 */
export function ChatRoomPermissionTypeToString(
  params: ChatRoomPermissionType
): string {
  return ChatRoomPermissionType[params];
}

/**
 * The chat room instance class.
 * To get the correct value, ensure that you call {@ link ChatRoomManager#fetchChatRoomInfoFromServer(String)} before calling this method.
 */
export class ChatRoom {
  /**
   * The chat room ID.
   */
  roomId: string;
  /**
   * The chat room name from the memory.
   */
  name?: string;
  /**
   * The chat room description from the memory.
   */
  description?: string;
  /**
   * The chat room owner ID. If this method returns an empty string, the SDK fails to get chat room details.
   */
  owner: string;
  /**
   * The chat room announcement in the chat room from the memory.
   */
  announcement?: string;
  /**
   * The number of online members from the memory.
   */
  memberCount?: string;
  /**
   * The maximum number of members in the chat room from the memory, which is set/specified when the chat room is created.
   */
  maxUsers?: string;
  /**
   * The chat room admin list.
   */
  adminList?: Array<string>;
  /**
   * The member list.
   */
  memberList?: Array<string>;
  /**
   * The chat room block list.
   */
  blockList?: Array<string>;
  /**
   * The mute list of the chat room.
   */
  muteList?: Array<string>;
  /**
   * Whether all members are muted in the chat room from the memory.
   */
  isAllMemberMuted?: boolean;
  /**
   * The current user's role in the chat room. The role types: {@link ChatRoomPermissionType}.
   */
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
