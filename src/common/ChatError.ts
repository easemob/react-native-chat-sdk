/**
 * The chat error class, which contains the error code and error description.
 */
export class ChatError {
  /**
   * The error code.
   *
   * See the error code of the iOS or Android platform:
   * - iOS: {@link EMErrorCode#https://docs-im.easemob.com/ccim/ios/errorcode}
   * - Android: {@link HyphenateException#errorCode#https://docs-im.easemob.com/ccim/android/errorcode}
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
