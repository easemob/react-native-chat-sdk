export class ChatError {
  code: number;
  description: string;

  constructor(params: { code: number; description: string }) {
    this.code = params.code;
    this.description = params.description;
  }
}
