/**
 * Operation type of reaction.
 */
export enum ChatReactionOperate {
  Remove,
  Add,
}

/**
 * 消息 Reaction 操作实体类。
 */
export class ChatReactionOperation {
  /**
   * 操作者 ID。
   */
  userId: string;
  /**
   * 发生变化的 Reaction。
   */
  reaction: string;
  /**
   * Reaction类型。详见 {@link ChatReactionOperate}
   */
  operate: ChatReactionOperate;
  constructor(params: {
    userId: string;
    reaction: string;
    operate: ChatReactionOperate;
  }) {
    this.userId = params.userId;
    this.reaction = params.reaction;
    this.operate = params.operate;
  }
  public static fromNative(params: {
    userId: string;
    reaction: string;
    operate: number;
  }): ChatReactionOperation {
    let o: ChatReactionOperate = ChatReactionOperate.Add;
    if (params.operate === 0) {
      o = ChatReactionOperate.Remove;
    } else if (params.operate === 1) {
      o = ChatReactionOperate.Add;
    }
    const ret = new ChatReactionOperation({ ...params, operate: o });
    return ret;
  }
}

/**
 * 消息Reaction的类。
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
  /**
   * Reaction 操作列表。
   */
  operations: Array<ChatReactionOperation>;
  constructor(params: {
    convId: string;
    msgId: string;
    reactions: Array<ChatMessageReaction>;
    operations: Array<ChatReactionOperation>;
  }) {
    this.convId = params.convId;
    this.msgId = params.msgId;
    this.reactions = params.reactions;
    this.operations = params.operations;
  }
}
