import { ChatUserInfo } from './ChatUserInfo';

/**
 * 联系人对象
 */
export class ChatContact {
  /**
   * 联系人ID。
   */
  userId: string;
  /**
   * 联系人备注。
   */
  remark: string;
  /**
   * 联系人的用户属性。详见 {@link ChatUserInfo}。
   */
  userInfo?: ChatUserInfo;
  /**
   * 添加该联系人的 Unix 时间戳，单位为毫秒。
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
