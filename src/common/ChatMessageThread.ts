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
   * A parent that create sub-zone. examples: group id.
   */
  parentId: string;
  /**
   * A messageId that create sub-zone
   */
  msgId: string;
  /**
   * Member list of the sub-zone, require fetch thread's detail first
   */
  memberCount: string;
  /**
   * Timestamp of subarea creation
   */
  timestamp: number;
  constructor(params: {
    threadId: string;
    threadName: string;
    owner: string;
    parentId: string;
    msgId: string;
    memberCount: string;
    timestamp: number;
  }) {
    this.threadId = params.threadId;
    this.threadName = params.threadName;
    this.parentId = params.parentId;
    this.msgId = params.msgId;
    this.owner = params.owner;
    this.memberCount = params.memberCount;
    this.timestamp = params.timestamp;
  }
}

export class ChatMessageThreadEvent {
  /**
   * sub-zone id
   */
  threadId: string;
  /**
   * Subject of the sub-zone(There will be a list of requested sub-areas and sub-area details)
   */
  threadName: string;
  /**
   * A parent that create sub-zone. examples: group id.
   */
  parentId: string;
  /**
   * A messageId that create sub-zone
   */
  msgId: string;
  /**
   * Number of messages in subsection
   */
  msgCount: string;
  /**
   * Timestamp of subarea creation
   */
  timestamp: number;
  /**
   * Received the operation type of the sub-area from others.
   * Maybe is one of create, update, delete, update_msg.
   */
  operation: string;
  /**
   * User id of the operation sub-area
   */
  fromId: string;
  /**
   * The last message in the sub-area, if it is empty, it means the last message is withdrawn. If it is not empty, it means a new message.
   */
  lastMsg?: ChatMessage;
  constructor(params: {
    threadId: string;
    threadName: string;
    parentId: string;
    msgId: string;
    msgCount: string;
    timestamp: number;
    operation: string;
    fromId: string;
    lastMsg?: any;
  }) {
    this.threadId = params.threadId;
    this.threadName = params.threadName;
    this.parentId = params.parentId;
    this.msgId = params.msgId;
    this.msgCount = params.msgCount;
    this.timestamp = params.timestamp;
    this.operation = params.operation;
    this.fromId = params.fromId;
    if (params.lastMsg) {
      this.lastMsg = new ChatMessage(params.lastMsg);
    }
  }
}
