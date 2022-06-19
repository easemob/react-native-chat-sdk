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
