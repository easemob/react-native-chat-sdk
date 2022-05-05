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
export class ChatPushConfigs {
  pushStyle: PushDisplayStyle;
  noDisturb: boolean;
  noDisturbStartHour: number;
  noDisturbEndHour: number;

  constructor(params: {
    pushStyle: PushDisplayStyle;
    noDisturb: boolean;
    noDisturbStartHour: number;
    noDisturbEndHour: number;
  }) {
    this.pushStyle = params.pushStyle;
    this.noDisturb = params.noDisturb;
    this.noDisturbStartHour = params.noDisturbStartHour;
    this.noDisturbEndHour = params.noDisturbEndHour;
  }
}
