/**
 * 聊天错误类，包含错误码和错误描述。
 */
export class ChatError extends Error {
  /**
   * 错误码。
   *
   * 详见原生代码平台 iOS 和 Android 错误码：
   * - iOS：{@link http://docs-im-beta.easemob.com/document/ios/error.html}
   * - Android: {@link http://docs-im-beta.easemob.com/document/android/error.html}
   */
  code: number;
  /**
   * 错误描述。
   */
  description: string;

  constructor(params: { code: number; description: string }) {
    super(params.description);
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, new.target.prototype);
    }
    this.name = 'ChatError';
    this.code = params.code;
    this.description = params.description;
  }
}

/**
 * 聊天异常类，继承自 ChatError。
 */
export class ChatException extends ChatError {
  constructor(params: { code: number; description: string }) {
    super(params);
    this.name = 'ChatException';
  }
}
