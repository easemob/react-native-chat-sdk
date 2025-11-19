/**
 * The ChatRTCTokenInfo class is used to store RTC Token information, including the user's Agora uid, the Token string, and the expiration timestamp.
 */
export class ChatRTCTokenInfo {
  rtcToken: string;
  expireTimeStamp: number;
  uid: number;

  /**
   *
   * @param rtcToken The rtc token.
   * @param expireTimeStamp The expire time.
   * @param uid The rtc uid
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
