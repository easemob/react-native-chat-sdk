/**
 * 推送消息的展示样式。
 */
export enum ChatPushDisplayStyle {
  /**
   * 显示”你有一条新消息“。默认的样式。
   */
  Simple = 0,
  /**
   * 消息内容的样式。例如：显示消息内容。
   */
  Summary,
}

/**
 * 推送选项类。
 */
export class ChatPushOption {
  /**
   * 推送通知的显示样式。
   */
  displayStyle?: ChatPushDisplayStyle;
  /**
   * 推送通知的显示昵称。
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
