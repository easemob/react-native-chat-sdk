export class ChatPresence {
  publisher: string;
  statusDescription: string;
  lastTime: string;
  expireTime: string;
  statusDetails: Map<string, number>;
  constructor(params: {
    publisher: string;
    statusDescription: string;
    lastTime: string;
    expireTime: string;
    statusDetails: Map<string, number>;
  }) {
    this.publisher = params.publisher;
    this.statusDescription = params.statusDescription;
    this.lastTime = params.lastTime;
    this.expireTime = params.expireTime;
    this.statusDetails = params.statusDetails;
  }
}
