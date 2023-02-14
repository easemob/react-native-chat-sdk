/**
 * 消息 Reaction 实体类，用于指定 Reaction 属性。
 */
export class ChatMessageReaction {
  /**
   * Reaction 内容。
   */
  reaction: string;
  /**
   * 添加了指定 Reaction 的用户数量。
   */
  count: string;
  /**
   * 当前用户是否添加了该 Reaction。
   * - `Yes`：是。
   * - `No`：否。
   */
  isAddedBySelf: boolean;
  /**
   * 添加了指定 Reaction 的用户列表。
   */
  userList: Array<string>;
  constructor(params: {
    reaction: string;
    count: string;
    isAddedBySelf: boolean;
    userList: Array<string>;
  }) {
    this.reaction = params.reaction;
    this.count = params.count;
    this.isAddedBySelf = params.isAddedBySelf;
    this.userList = params.userList;
  }
}
/**
 * 消息 Reaction 事件类。
 *
 */
export class ChatMessageReactionEvent {
  /**
   * 会话 ID。
   */
  convId: string;
  /**
   * 消息 ID。
   */
  msgId: string;
  /**
   * Reaction 列表。
   */
  reactions: Array<ChatMessageReaction>;
  constructor(params: {
    convId: string;
    msgId: string;
    reactions: Array<ChatMessageReaction>;
  }) {
    this.convId = params.convId;
    this.msgId = params.msgId;
    this.reactions = params.reactions;
  }
}
