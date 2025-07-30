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
  constructor(params: { userId: string; remark: string }) {
    this.userId = params.userId;
    this.remark = params.remark;
  }
}
