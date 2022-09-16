/**
 * The server tag data.
 */
export class ChatCircleTag {
  /**
   * The server tag ID generated when created. See {@link ChatCircleManager#addTagsToServer}
   */
  tagId: string;
  /**
   * The server tag name.
   */
  tagName: string;
  /**
   * Construct a server tag object.
   */
  constructor(params: { tagId: string; tagName: string }) {
    this.tagId = params.tagId;
    this.tagName = params.tagName;
  }
}
