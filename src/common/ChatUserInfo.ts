/**
 * The ChatUserInfo class, which contains the user attributes, such as the nickname, description, and avatar.
 */
export class ChatUserInfo {
  /**
   * The user id.
   */
  userId: string;
  /**
   * The user name.
   */
  nickName?: string;
  /**
   * The url of user avatar.
   */
  avatarUrl?: string;
  /**
   * The user email.
   */
  mail?: string;
  /**
   * The user mobile phone number.
   */
  phone?: string;
  /**
   * The user gender.
   */
  gender?: number;
  /**
   * The user sign.
   */
  sign?: string;
  /**
   * The user birthday.
   */
  birth?: string;
  /**
   * The user extension information.
   */
  ext?: string;
  /**
   * The time period(seconds) when the user attibutes in the cache expire.
   * If the interval between two calles is less than or equal to the value you set in the parameter, user attributes are obtained directly from the local cache; otherwise, they are obtained from the server. For example, if you set this parameter to 120(2 minutes), once this method is called again within 2 minutes, the SDK returns the attributes obtained last time.
   */
  expireTime: number;

  constructor(params: {
    userId: string;
    nickName?: string;
    avatarUrl?: string;
    mail?: string;
    phone?: string;
    gender?: number;
    sign?: string;
    birth?: string;
    ext?: string;
    expireTime: number;
  }) {
    this.userId = params.userId;
    this.nickName = params.nickName;
    this.avatarUrl = params.avatarUrl;
    this.mail = params.mail;
    this.phone = params.phone;
    this.gender = params.gender;
    this.sign = params.sign;
    this.birth = params.birth;
    this.ext = params.ext;
    this.expireTime = params.expireTime;
  }
}
