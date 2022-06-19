/**
 * The translation language class, which contains the information of the translation languages.
 */
export class ChatTranslateLanguage {
  /**
   * The code of a target language. For example, the code for simplified Chinese is "zh-Hans".
   */
  code: string;
  /**
   * The language name. For example, the code for simplified Chinese is "Chinese Simplified".
   */
  name: string;
  /**
   * The native name of the language. For example, the native name of simplified Chinese is "Chinese (Simplified)".
   */
  nativeName: string;
  constructor(params: { code: string; name: string; nativeName: string }) {
    this.code = params.code;
    this.name = params.name;
    this.nativeName = params.nativeName;
  }
}
