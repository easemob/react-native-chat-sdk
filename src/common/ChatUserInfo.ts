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
  }
}
