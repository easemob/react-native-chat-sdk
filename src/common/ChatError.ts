/**
 * The chat error class, which contains the error code and error description.
 */
export class ChatError {
  /**
   * The error code.
   *
   * See the error code of the iOS or Android platform:
   * - iOS: {@url https://docs-preprod.agora.io/en/agora-chat/agora_chat_error_ios?platform=iOS}
   * - Android: {@url https://docs-preprod.agora.io/en/agora-chat/agora_chat_error_android?platform=Android}
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
