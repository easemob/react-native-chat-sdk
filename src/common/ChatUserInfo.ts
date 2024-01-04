/**
 * 用户属性类，包含用户属性信息，例如用户 ID，昵称，头像等。
 */
export class ChatUserInfo {
  /**
   * 用户 ID。
   */
  userId: string;
  /**
   * 用户的昵称。
   */
  nickName?: string;
  /**
   * 用户的头像 URL。
   */
  avatarUrl?: string;
  /**
   * 用户的电子邮件地址。
   */
  mail?: string;
  /**
   * 用户的手机号码。
   */
  phone?: string;
  /**
   * 用户的性别。
   * - （默认）`0`：未知；
   * - `1`：男；
   * - `2`：女。
   */
  gender?: number;
  /**
   * 用户的签名。
   */
  sign?: string;
  /**
   * 用户的生日。
   */
  birth?: string;
  /**
   * 用户属性的自定义扩展信息。
   *
   * 用户可自行扩展，建议封装成 JSON 字符串，也可设置为空字符串。
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
