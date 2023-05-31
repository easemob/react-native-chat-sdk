/**
 * The chat error class, which contains the error code and error description.
 */
export class ChatError {
  /**
   * The error code.
   *
   * See the error code of the iOS or Android platform:
   * - iOS: {@link https://docs.agora.io/en/agora-chat/reference/error-codes?platform=ios}
   * - Android: {@link https://docs.agora.io/en/agora-chat/reference/error-codes?platform=android}
   */
  code: number;
  /**
   * The error description.
   */
  description: string;

  constructor(params: { code: number; description: string }) {
    this.code = params.code;
    this.description = params.description;
  }
}
