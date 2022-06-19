/**
 * The user information class, which contains the user attributes, such as the user ID and the nickname and avatar of a user.
 */
export class ChatUserInfo {
  /**
   * The user ID.
   */
  userId: string;
  /**
   * The nickname of the user.
   */
  nickName?: string;
  /**
   * The avatar URL of the user.
   */
  avatarUrl?: string;
  /**
   * The email address of the user.
   */
  mail?: string;
  /**
   * The mobile phone number of the user.
   */
  phone?: string;
  /**
   * The gender of the user.
   * - (Default) `0`: Unknown.
   * - `1`: Male.
   * - `2`: Female.
   */
  gender?: number;
  /**
   * The signature of the user.
   */
  sign?: string;
  /**
   * The birth date of the user.
   */
  birth?: string;
  /**
   * The extension information of the user.
   *
   * You can specify either an empty string or the custom information encapsulated as the JSON string.
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
