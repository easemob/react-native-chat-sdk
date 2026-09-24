/**
 * The display style of offline push notifications.
 */
export enum ChatPushDisplayStyle {
  /**
   * Only displays "You have a new message". It is the default display of offline push notifications.
   */
  Simple = 0,
  /**
   * Displays the content of the offline push notifications.
   */
  Summary,
}

/**
 * The push option class.
 */
export class ChatPushOption {
  /**
   * The display type of push notifications.
   */
  displayStyle?: ChatPushDisplayStyle;
  /**
   * The nickname of the sender displayed in push notifications.
   */
  displayName?: string;
  constructor(params: {
    displayStyle?: ChatPushDisplayStyle;
    displayName?: string;
  }) {
    this.displayStyle = params?.displayStyle;
    this.displayName = params?.displayName;
  }
}
