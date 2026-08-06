/**
 * The message sender information class, which contains the display information of the message sender.
 */
export class ChatMessageSenderInfo {
  /**
   * The user ID of the message sender.
   */
  userId?: string;
  /**
   * The nickname of the message sender.
   */
  nickname?: string;
  /**
   * The avatar URL of the message sender.
   */
  avatarUrl?: string;
  /**
   * The remark of the message sender set by the current user.
   */
  remark?: string;
  /**
   * The namecard of the message sender in the group.
   */
  groupNameCard?: string;
  constructor(params: {
    userId?: string;
    nickname?: string;
    avatarUrl?: string;
    remark?: string;
    groupNameCard?: string;
  }) {
    this.userId = params.userId;
    this.nickname = params.nickname;
    this.avatarUrl = params.avatarUrl;
    this.remark = params.remark;
    this.groupNameCard = params.groupNameCard;
  }
}
