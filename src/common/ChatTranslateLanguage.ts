/**
 * Translation language class.
 */
export class ChatTranslateLanguage {
  /**
   * Language code, such as "zh-Hans" for simplified Chinese.
   */
  code: string;
  /**
   * Language name, such as Chinese Simplified as "Chinese Simplified".
   */
  name: string;
  /**
   * The native name of the language, such as "Chinese (Simplified)" for Simplified Chinese.
   */
  nativeName: string;
  constructor(params: { code: string; name: string; nativeName: string }) {
    this.code = params.code;
    this.name = params.name;
    this.nativeName = params.nativeName;
  }
}
