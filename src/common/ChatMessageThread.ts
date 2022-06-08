import { ChatMessage } from './ChatMessage';

export class ChatMessageThread {
  /**
   * sub-zone id
   */
  threadId: string;
  /**
   * Subject of the sub-zone(There will be a list of requested sub-areas and sub-area details)
   */
  threadName: string;
  /**
   * create  of the sub-zone, require fetch thread's detail first
   */
  owner: string;
  /**
   * A messageId that create sub-zone
   */
  messageId: string;
  /**
   * A channelId that create sub-zone
   */
  parentId: string;
  /**
   * Member list of the sub-zone, require fetch thread's detail first
   */
  memberCount: number;
  /**
   * Number of messages in subsection
   */
  messageCount: number;
  /**
   * Timestamp of subarea creation
   */
  createAt: number;
  /**
   * The last message in the sub-area, if it is empty, it means the last message is withdrawn. If it is not empty, it means a new message.
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
    messageId: string;
    memberCount: number;
    messageCount: number;
    createAt: number;
    lastMessage?: any;
  }) {
    this.threadId = params.threadId;
    this.threadName = params.threadName;
    this.parentId = params.parentId;
    this.messageId = params.messageId;
    this.owner = params.owner;
    this.memberCount = params.memberCount;
    this.messageCount = params.messageCount;
    this.createAt = params.createAt;
    if (params.lastMessage) {
      this.lastMessage = ChatMessage.createReceiveMessage(params.lastMessage);
    }
  }
}

export enum ChatMessageThreadOperation {
  UnKnown = 0,
  Create,
  Update,
  Delete,
  Update_Msg,
}

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

export class ChatMessageThreadEvent {
  from: string;
  type: ChatMessageThreadOperation;
  thread: ChatMessageThread;
  constructor(params: { from: string; type: number; thread: any }) {
    this.from = params.from;
    this.type = ChatMessageThreadOperationFromNumber(params.type);
    this.thread = new ChatMessageThread(params.thread);
  }
}
