import { ChatMessage } from './ChatMessage';

/**
 * 消息子区类。
 */
export class ChatMessageThread {
  /**
   * 子区 ID。
   */
  threadId: string;
  /**
   * 子区名称。
   */
  threadName: string;
  /**
   * 子区创建者。
   */
  owner: string;
  /**
   * 子区父消息 ID。
   */
  msgId: string;
  /**
   * 子区所属的群组 ID。
   */
  parentId: string;
  /**
   * 子区成员数量。
   */
  memberCount: number;
  /**
   * 子区消息数量。
   */
  msgCount: number;
  /**
   * 子区创建的 Unix 时间戳。单位为毫秒。
   */
  createAt: number;
  /**
   * 子区最新一条消息。如果为空，表明最新一条消息被撤回。
   */
  lastMessage?: ChatMessage;
  /**
   * 创建子区实例。
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
 * 子区事件类型枚举。
 */
export enum ChatMessageThreadOperation {
  /**
   * 未知类型。
   */
  UnKnown = 0,
  /**
   * 子区创建。
   */
  Create,
  /**
   * 子区更新。
   */
  Update,
  /**
   * 子区删除。
   */
  Delete,
  /**
   * 更新子区最新一条消息。
   */
  Update_Msg,
}

/**
 * 将子区事件类型由整型转换为枚举类型。
 *
 * @param type 整型的子区事件。
 * @returns 枚举类型的子区事件。
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
 * 子区通知。
 */
export class ChatMessageThreadEvent {
  /**
   * 子区操作者。
   */
  from: string;
  /**
   * 子区事件类型。
   */
  type: ChatMessageThreadOperation;
  /**
   * 子区实例。
   */
  thread: ChatMessageThread;
  /**
   * 构建子区事件实例。
   */
  constructor(params: { from: string; type: number; thread: any }) {
    this.from = params.from;
    this.type = ChatMessageThreadOperationFromNumber(params.type);
    this.thread = new ChatMessageThread(params.thread);
  }
}
