/**
 * The class for message read receipts.
 *
 * A read receipt records the read state of a message: for a one-to-one chat message,
 * whether the peer user has read it; for a group message that requires read receipts,
 * the number of group members that have read it.
 *
 * See {@link ChatManager.getGroupMessageReadReceipts} and
 * {@link ChatMessageEventListener.onMessageReadReceipts}.
 */
export class ChatMessageReadReceipt {
  /**
   * The message ID.
   */
  msgId: string;
  /**
   * The conversation ID.
   */
  convId: string;
  /**
   * Whether the read receipt comes from the peer user:
   * - `true`: The receipt comes from the peer user (a one-to-one chat message read by the recipient, or a group message read by a group member).
   * - `false`: The receipt comes from the current user on another device in a multi-device login scenario.
   */
  isPeerReceipt: boolean;
  /**
   * The number of read receipts of a group message. This field is valid only for group messages
   * and is `0` for one-to-one chat messages.
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
