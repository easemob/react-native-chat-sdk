import { ChatUserInfo } from './ChatUserInfo';

/**
 * The Contact class is used to store the information of a contact.
 */
export class ChatContact {
  /**
   * The user id of the contact.
   */
  userId: string;
  /**
   * The remark of the contact.
   */
  remark: string;
  /**
   * The user attributes of the contact. See {@link ChatUserInfo}.
   */
  userInfo?: ChatUserInfo;
  /**
   * The Unix timestamp when the contact is added, in milliseconds.
   */
  addTimestamp?: number;
  constructor(params: {
    userId: string;
    remark: string;
    userInfo?: ChatUserInfo;
    addTimestamp?: number;
  }) {
    this.userId = params.userId;
    this.remark = params.remark;
    this.userInfo = params.userInfo
      ? new ChatUserInfo(params.userInfo)
      : undefined;
    this.addTimestamp = params.addTimestamp;
  }
}
