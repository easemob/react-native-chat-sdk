export class ChatContact {
  userId: string;
  remark: string;
  constructor(params: { userId: string; remark: string }) {
    this.userId = params.userId;
    this.remark = params.remark;
  }
}
