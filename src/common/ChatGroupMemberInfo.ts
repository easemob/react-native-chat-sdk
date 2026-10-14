import type { ChatGroupPermissionType } from './ChatGroup';

/**
 * 定义群组成员信息的类。
 *
 * 详见 {@link ChatGroupReadReceipt.from}。
 */
export class ChatGroupMemberInfo {
  /**
   * 群组成员的用户 ID。
   */
  memberId: string;
  /**
   * 成员加入群组的 Unix 时间戳，单位为毫秒。
   */
  joinedTimestamp: number;
  /**
   * 群组成员的角色，详见 {@link ChatGroupPermissionType}。
   */
  role: ChatGroupPermissionType;
  /**
   * 群组成员在群组中的名片。
   */
  namecard?: string;
  /**
   * 群组成员的昵称。
   */
  nickname?: string;
  /**
   * 群组成员的头像 URL。
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
