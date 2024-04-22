/**
 * 翻译语言类，包含翻译语言相关信息。
 */
export class ChatTranslateLanguage {
  /**
   * 目标语言代码，如中文简体为 "zh-Hans"。
   */
  code: string;
  /**
   * 语言名称，如中文简体为 "Chinese Simplified"。
   */
  name: string;
  /**
   * 语言的原生名称，如中文简体为 "中文 (简体)"。
   */
  nativeName: string;
  constructor(params: { code: string; name: string; nativeName: string }) {
    this.code = params.code;
    this.name = params.name;
    this.nativeName = params.nativeName;
  }
}
