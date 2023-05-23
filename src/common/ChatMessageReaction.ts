/**
 * Operation type of reaction.
 */
export enum ChatReactionOperate {
  Remove,
  Add,
}

/**
 * Reaction Operation
 */
export class ChatReactionOperation {
  /**
   * Operator userId.
   */
  userId: string;
  /**
   * Changed reaction.
   */
  reaction: string;
  /**
   * Operate type.
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
 * The message Reaction instance class that defines Reaction attributes.
 */
export class ChatMessageReaction {
  /**
   * The Reaction content.
   */
  reaction: string;
  /**
   * The count of the users who added this Reaction.
   */
  count: string;
  /**
   * Whether the current user added this Reaction.
   * - `true`: Yes.
   * - `false`: No.
   */
  isAddedBySelf: boolean;
  /**
   * The list of users that added this Reaction.
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
 * The message Reaction event class.
 *
 */
export class ChatMessageReactionEvent {
  /**
   * The conversation ID.
   */
  convId: string;
  /**
   * The message ID.
   */
  msgId: string;
  /**
   * The Reaction list.
   */
  reactions: Array<ChatMessageReaction>;
  /**
   * Details of changed operation.
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
