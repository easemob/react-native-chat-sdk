/**
 *
 * Stream message status enum.
 */
export enum ChatStreamChunkStatus {
  /**
   * Stream started.
   */
  START,
  /**
   * Stream started and completed in one chunk (single fragment).
   */
  START_AND_COMPLETE,
  /**
   * Stream in progress.
   */
  PROGRESS,
  /**
   * Stream completed.
   */
  COMPLETE,
  /**
   * Stream ended with error.
   */
  ERROR,
}

/**
 *  Stream chunk status of the stream chunk.
 */
export interface ChatStreamChunk {
  /**
   * Stream chunk status of the stream chunk. see {@link ChatStreamChunkStatus}.
   */
  status: ChatStreamChunkStatus;
  /**
   * Stream chunk error code of the stream chunk. Default value is 0, which indicates no error. If the value is not 0, please refer to the EMErrorCode error code table for details.
   */
  errorCode: number;
  /**
   * Stream chunk finish reason of the stream chunk. Passed through by the user. `0` indicates no exception.
   */
  finishReason: number;
  /**
   * Text content of the stream chunk.
   */
  text: string;
  /**
   * Custom type of the stream chunk.
   */
  customType?: string;

  // sequenceNumber: number; // deprecated
}
