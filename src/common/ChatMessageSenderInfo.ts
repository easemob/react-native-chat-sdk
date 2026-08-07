/**
 * 消息发送者信息类，包含消息发送者的展示信息。
 */
export class ChatMessageSenderInfo {
  /**
   * 消息发送者的用户 ID。
   */
  userId?: string;
  /**
   * 消息发送者的昵称。
   */
  nickname?: string;
  /**
   * 消息发送者的头像 URL。
   */
  avatarUrl?: string;
  /**
   * 当前用户为该消息发送者设置的备注。
   */
  remark?: string;
  /**
   * 消息发送者在群组中的群名片。
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
