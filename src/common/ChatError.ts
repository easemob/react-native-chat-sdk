/**
 * Error description object.
 */
export class ChatError {
  /**
   * The Error code.
   *
   * Please refer to the corresponding platform error code.
   * Example:
   * - iOS: ${@link EMErrorCode#https://docs-im.easemob.com/ccim/ios/errorcode}
   * - Android: ${@link HyphenateException#errorCode#https://docs-im.easemob.com/ccim/android/errorcode}
   */
  code: number;
  /**
   * The Error description.
   */
  description: string;

  constructor(params: { code: number; description: string }) {
    this.code = params.code;
    this.description = params.description;
  }
}
