export class ChatCircleTag {
  tagId: string;
  tagName: string;
  constructor(params: { tagId: string; tagName: string }) {
    this.tagId = params.tagId;
    this.tagName = params.tagName;
  }
}
