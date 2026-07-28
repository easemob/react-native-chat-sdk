/**
 * 流式消息状态枚举。
 */
export enum ChatStreamChunkStatus {
  /**
   * 流开始。
   */
  START,
  /**
   * 流在一个分片中开始并结束（单片段）。
   */
  START_AND_COMPLETE,
  /**
   * 流进行中。
   */
  PROGRESS,
  /**
   * 流已完成。
   */
  COMPLETE,
  /**
   * 流以错误结束。
   */
  ERROR,
}

/**
 * 流分片的数据结构。
 */
export interface ChatStreamChunk {
  /**
   * 流分片的状态。参见 {@link ChatStreamChunkStatus}。
   */
  status: ChatStreamChunkStatus;
  /**
   * 流分片的错误码。默认值为 0，表示无错误。若值不为 0，请参考 EMErrorCode 错误码表。
   */
  errorCode: number;
  /**
   * 流分片的结束原因。由用户透传。`0` 表示无异常。
   */
  finishReason: number;
  /**
   * 流分片的文本内容。
   */
  text: string;
  /**
   * 流分片的自定义类型。
   */
  customType?: string;

  // sequenceNumber: number; // deprecated
}
