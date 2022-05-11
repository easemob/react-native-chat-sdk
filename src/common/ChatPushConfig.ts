/**
 * The push styles.
 */
export enum PushDisplayStyle {
  /**
   * The push message presentation style: SimpleBanner represents the presentation of a simple message.
   */
  Simple = 0,

  /**
   * The push message presentation style: MessageSummary represents the presentation of message content.
   */
  Summary,
}

/**
 * The push configuration class.
 */
export class ChatPushConfig {
  /**
   * The display type of push notifications.
   */
  pushStyle: PushDisplayStyle;
  /**
   * Whether to enable the do-not-disturb mode for push notifications.
   */
  noDisturb: boolean;
  /**
   * The start hour of the do-not-disturb mode for push notifications.
   */
  noDisturbStartHour: number;
  /**
   * The end hour of the do-not-disturb mode for push notifications.
   */
  noDisturbEndHour: number;

  constructor(params: {
    pushStyle?: PushDisplayStyle;
    noDisturb?: boolean;
    noDisturbStartHour?: number;
    noDisturbEndHour?: number;
  }) {
    this.pushStyle = params.pushStyle ?? PushDisplayStyle.Simple;
    this.noDisturb = params.noDisturb ?? false;
    this.noDisturbStartHour = params.noDisturbStartHour ?? 0;
    this.noDisturbEndHour = params.noDisturbEndHour ?? 0;
  }
}
