/**
 * RTC Token 信息类，用于存储用户的声网 UID、Token 字符串和过期时间戳。
 */
export class ChatRTCTokenInfo {
  rtcToken: string;
  expireTimeStamp: number;
  uid: number;

  /**
   * @param rtcToken RTC Token。
   * @param expireTimeStamp 过期时间戳。
   * @param uid RTC UID。
   */
  constructor(params: {
    rtcToken: string;
    expireTimeStamp: number;
    uid: number;
  }) {
    this.rtcToken = params.rtcToken;
    this.expireTimeStamp = params.expireTimeStamp;
    this.uid = params.uid;
  }
}
