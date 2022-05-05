export class ChatTranslateLanguage {
  code: string;
  name: string;
  nativeName: string;
  constructor(params: { code: string; name: string; nativeName: string }) {
    this.code = params.code;
    this.name = params.name;
    this.nativeName = params.nativeName;
  }
}
