import { ChatMessage } from './ChatMessage';

export class ChatMessageThread {
  /**
   * sub-zone id.
   */
  threadId: string;
  /**
   * The name of the sub-zone.
   */
  threadName: string;
  /**
   * Creator of the sub-zone.
   */
  owner: string;
  /**
   * A msgId that create sub-zone.
   */
  msgId: string;
  /**
   * A id that create sub-zone. Generally, it is a group ID.
   */
  parentId: string;
  /**
   * Member list of the sub-zone.
   */
  memberCount: number;
  /**
   * Number of messages in sub-zone.
   */
  msgCount: number;
  /**
   * Timestamp of sub-zone creation.
   */
  createAt: number;
  /**
   * The last message in the sub-zone, if it is empty, it means the last message is withdrawn. If it is not empty, it means a new message.
   */
  lastMessage?: ChatMessage;
  /**
   * Construct chat thread object.
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
 * Chat thread operation type.
 */
export enum ChatMessageThreadOperation {
  /**
   * Unknown sub-zone operation type
   */
  UnKnown = 0,
  /**
   * Create sub-zone operation.
   */
  Create,
  /**
   * update sub-zone operation.
   */
  Update,
  /**
   * remove sub-zone operation.
   */
  Delete,
  /**
   * update sub-zone last message.
   */
  Update_Msg,
}

/**
 * Converts the thread operation type from int to enum.
 *
 * @param type The chat thread operation type of the int type.
 * @returns The chat thread operation type.
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
 * The chat thread notify event.
 */
export class ChatMessageThreadEvent {
  /**
   * The chat thread operator ID.
   */
  from: string;
  /**
   * The chat thread operation type.
   */
  type: ChatMessageThreadOperation;
  /**
   * The chat thread object.
   */
  thread: ChatMessageThread;
  /**
   * Construct a chat thread event object.
   */
  constructor(params: { from: string; type: number; thread: any }) {
    this.from = params.from;
    this.type = ChatMessageThreadOperationFromNumber(params.type);
    this.thread = new ChatMessageThread(params.thread);
  }
}
