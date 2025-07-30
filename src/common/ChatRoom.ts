/**
 *  聊天室角色类型枚举。
 */
export enum ChatRoomPermissionType {
  /**
   * 未知类型。
   */
  None = -1,
  /**
   * 普通成员。
   */
  Member = 0,
  /**
   * 聊天室管理员。
   */
  Admin = 1,
  /**
   * 聊天室所有者。
   */
  Owner = 2,
}

/**
 * 将聊天室角色类型由整型转换为枚举类型。
 *
 * @param params 整型的聊天室角色类型。
 * @returns 枚举类型的聊天室角色类型。
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
      return params;
  }
}

/**
 * 将聊天室角色类型由枚举类型转换为字符串类型。
 *
 * @param params 枚举类型的聊天室角色类型。
 * @returns 字符串类型的聊天室角色类型。
 */
export function ChatRoomPermissionTypeToString(
  params: ChatRoomPermissionType
): string {
  return ChatRoomPermissionType[params]!;
}

/**
 * 聊天室信息类，用于定义内存中的聊天室信息。
 *
 * **注意**
 *
 * 如需最新数据，需从服务器获取：{@link ChatRoomManager.fetchChatRoomInfoFromServer(String)}。
 */
export class ChatRoom {
  /**
   * 聊天室 ID。
   */
  roomId: string;
  /**
   * 聊天室名称。
   */
  roomName?: string;
  /**
   * 聊天室描述。
   */
  description?: string;
  /**
   * 聊天室所有者的用户 ID。
   */
  owner: string;
  /**
   * 聊天室公告。
   */
  announcement?: string;
  /**
   * 聊天室成员数量。
   */
  memberCount?: string;
  /**
   * 聊天室最大成员数，在聊天室创建时设定。
   */
  maxUsers?: string;
  /**
   * 聊天室管理员列表。
   */
  adminList?: Array<string>;
  /**
   * 聊天室成员列表。
   */
  memberList?: Array<string>;
  /**
   * 聊天室黑名单列表。
   */
  blockList?: Array<string>;
  /**
   * 聊天室禁言列表。
   */
  muteList?: Array<string>;
  /**
   * 聊天室禁言列表。
   *
   * key: 用户ID。
   * value: 过期时间戳。
   */
  muteKVList?: Record<string, number>;
  /**
   * 聊天室是否在全员禁言状态。
   * - `true`：是；
   * - `false`：否。
   */
  isAllMemberMuted?: boolean;

  /**
   * 当前用户是否在白名单中。
   * 此属性在加入聊天室后可用。
   * 当前用户被添加到白名单或从白名单中移除时，此属性会更新。
   * - `true`: 在白名单中
   * - `false`: 不在白名单中
   */
  isInWhitelist?: boolean;

  /**
   * 获取聊天室创建时的时间戳（毫秒）。
   * 此属性在加入聊天室后可用。
   */
  createTimestamp?: number;

  /**
   * 获取当前用户禁言到期的时间戳（毫秒）。
   *
   * 此属性在加入聊天室后可用。
   * 当用户被禁言或解除禁言时，此属性会更新。
   *
   * - 值为零表示当前用户未被禁言
   * - 值为-1表示无法正确获取禁言到期时间
   */
  muteExpireTimestamp?: number;

  /**
   * 聊天室成员角色类型，详见 {@link ChatRoomPermissionType}。
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
    muteKVList?: Record<string, number>;
    isAllMemberMuted?: boolean;
    permissionType: number;
    isInWhitelist?: boolean;
    createTimestamp?: number;
    muteExpireTimestamp?: number;
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
    this.muteKVList = params.muteKVList;
    this.isAllMemberMuted = params.isAllMemberMuted;
    this.permissionType = ChatRoomPermissionTypeFromNumber(
      params.permissionType
    );
    this.isInWhitelist = params.isInWhitelist;
    this.createTimestamp = params.createTimestamp;
    this.muteExpireTimestamp = params.muteExpireTimestamp;
  }
}
