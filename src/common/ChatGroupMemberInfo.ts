import type { ChatGroupPermissionType } from './ChatGroup';

/**
 * The class that defines the member information of a chat group.
 *
 * See {@link ChatGroupReadReceipt.from}.
 */
export class ChatGroupMemberInfo {
  /**
   * The user ID of the group member.
   */
  memberId: string;
  /**
   * The Unix timestamp for the member joining the group, in milliseconds.
   */
  joinedTimestamp: number;
  /**
   * The role of the group member. See {@link ChatGroupPermissionType}.
   */
  role: ChatGroupPermissionType;
  /**
   * The namecard of the group member in the group.
   */
  namecard?: string;
  /**
   * The nickname of the group member.
   */
  nickname?: string;
  /**
   * The avatar URL of the group member.
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
