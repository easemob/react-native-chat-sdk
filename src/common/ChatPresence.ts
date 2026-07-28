/**
 * 在线状态属性类，包含发布者的用户名、在线设备使用的平台、当前在线状态以及在线状态的扩展信息、更新时间和到期时间。
 */
export class ChatPresence {
  /**
   * 在线状态发布者的用户 ID。
   */
  publisher: string;
  /**
   * 自定义在线状态，例如忙碌、离开和隐身等。
   */
  statusDescription: string;
  /**
   * 上一次更新时间戳，单位为毫秒。
   */
  lastTime: number;
  /**
   * 在线状态的到期时间戳，单位为毫秒。
   */
  expiryTime: number;
  /**
   * 该用户的当前在线状态详情。
   */
  statusDetails: Map<string, number>;

  constructor(params: {
    publisher: string;
    statusDescription: string;
    lastTime: number;
    expiryTime: number;
    statusDetails: any;
  }) {
    this.publisher = params.publisher;
    this.statusDescription = params.statusDescription;
    this.lastTime = params.lastTime;
    this.expiryTime = params.expiryTime;
    this.statusDetails = new Map();
    Object.entries(params.statusDetails).forEach((value: [string, any]) => {
      this.statusDetails.set(value[0], value[1]);
    });
  }
}
