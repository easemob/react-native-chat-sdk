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
  constructor(params: { userId: string; remark: string }) {
    this.userId = params.userId;
    this.remark = params.remark;
  }
}
