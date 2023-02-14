/**
 * 错误类，包含错误码和错误描述。
 */
export class ChatError {
  /**
   * 错误码。
   *
   * 详见原生代码平台 iOS 和 Android 错误码：
   * - iOS：{@link EMErrorCode#https://docs-im.easemob.com/ccim/ios/errorcode}
   * - Android: {@link HyphenateException#errorCode#https://docs-im.easemob.com/ccim/android/errorcode}
   */
  code: number;
  /**
   * 错误描述。
   */
  description: string;

  constructor(params: { code: number; description: string }) {
    this.code = params.code;
    this.description = params.description;
  }
}
