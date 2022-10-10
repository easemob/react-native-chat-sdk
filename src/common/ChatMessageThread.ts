import { ChatMessage } from './ChatMessage';

/**
 * The chat message thread class.
 */
export class ChatMessageThread {
  /**
   * The message thread ID.
   */
  threadId: string;
  /**
   * The name of the message thread.
   */
  threadName: string;
  /**
   * The creator of the message thread.
   */
  owner: string;
  /**
   * The ID of the parent message of the message thread.
   */
  msgId: string;
  /**
   * The group ID where the message thread belongs.
   */
  parentId: string;
  /**
   * The count of members in the message thread.
   */
  memberCount: number;
  /**
   * The count of messages in the message thread.
   */
  msgCount: number;
  /**
   * The Unix timestamp when the message thread is created. The unit is millisecond.
   */
  createAt: number;
  /**
   * The last reply in the message thread. If it is empty, the last message is withdrawn.
   */
  lastMessage?: ChatMessage;
  /**
   * Creates a message thread.
   */
  constructor(params: {
    threadId: string;
    threadName: string;
    owner: string;
    parentId: string;
    msgId: string;
    memberCount: number;
    msgCount: number;
    createAt: number;
    lastMessage?: any;
  }) {
    this.threadId = params.threadId;
    this.threadName = params.threadName;
    this.parentId = params.parentId;
    this.msgId = params.msgId;
    this.owner = params.owner;
    this.memberCount = params.memberCount;
    this.msgCount = params.msgCount;
    this.createAt = params.createAt;
    if (params.lastMessage) {
      this.lastMessage = ChatMessage.createReceiveMessage(params.lastMessage);
    }
  }
}

/**
 * The message thread event types.
 */
export enum ChatMessageThreadOperation {
  /**
   * The unknown type of message thread event.
   */
  UnKnown = 0,
  /**
   * The message thread is created.
   */
  Create,
  /**
   * The message thread is updated.
   */
  Update,
  /**
   * The message thread is destroyed.
   */
  Delete,
  /**
   * One or more messages are updated in the message thread.
   */
  Update_Msg,
}

/**
 * Converts the message thread event type from Int to enum.
 *
 * @param type The message thread event type of the Int type.
 * @returns The message thread event type of the enum type.
 */
export function ChatMessageThreadOperationFromNumber(type: number) {
  let ret = ChatMessageThreadOperation.UnKnown;
  switch (type) {
    case 1:
      ret = ChatMessageThreadOperation.Create;
      break;
    case 2:
      ret = ChatMessageThreadOperation.Update;
      break;
    case 3:
      ret = ChatMessageThreadOperation.Delete;
      break;
    case 4:
      ret = ChatMessageThreadOperation.Update_Msg;
      break;
    default:
      break;
  }
  return ret;
}

/**
 * The message thread event class.
 */
export class ChatMessageThreadEvent {
  /**
   * The user ID of the message thread operator.
   */
  from: string;
  /**
   * The message thread event type.
   */
  type: ChatMessageThreadOperation;
  /**
   * The message thread object.
   */
  thread: ChatMessageThread;
  /**
   * Constructs a message thread event.
   */
  constructor(params: { from: string; type: number; thread: any }) {
    this.from = params.from;
    this.type = ChatMessageThreadOperationFromNumber(params.type);
    this.thread = new ChatMessageThread(params.thread);
  }
}
