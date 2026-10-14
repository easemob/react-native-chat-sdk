/**
 * 消息已读回执类。
 *
 * 已读回执记录消息的已读状态：对于单聊消息，记录对端用户是否已读；
 * 对于要求已读回执的群组消息，记录已读该消息的群组成员数量。
 *
 * 详见 {@link ChatManager.getGroupMessageReadReceipts} 和
 * {@link ChatMessageEventListener.onMessageReadReceipts}。
 */
export class ChatMessageReadReceipt {
  /**
   * 消息 ID。
   */
  msgId: string;
  /**
   * 会话 ID。
   */
  convId: string;
  /**
   * 已读回执是否来自对端用户：
   * - `true`：回执来自对端用户（单聊消息被接收方已读，或群组消息被群组成员已读）。
   * - `false`：在多设备登录场景下，回执来自当前用户的其他设备。
   */
  isPeerReceipt: boolean;
  /**
   * 群组消息的已读回执数量。该字段仅对群组消息有效，
   * 对单聊消息其值为 `0`。
   */
  readCount: number;
  constructor(params: {
    msg_id: string;
    conv_id: string;
    isPeerReceipt: boolean;
    readCount: number;
  }) {
    this.msgId = params.msg_id;
    this.convId = params.conv_id;
    this.isPeerReceipt = params.isPeerReceipt;
    this.readCount = params.readCount;
  }
}
