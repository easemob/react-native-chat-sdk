/**
 * The server tag class.
 */
export class ChatCircleTag {
  /**
   * The server tag ID. See {@link ChatCircleManager#addTagsToServer}.
   */
  tagId: string;
  /**
   * The server tag name.
   */
  tagName: string;
  /**
   * Constructs a server tag object.
   */
  constructor(params: { tagId: string; tagName: string }) {
    this.tagId = params.tagId;
    this.tagName = params.tagName;
  }
}
