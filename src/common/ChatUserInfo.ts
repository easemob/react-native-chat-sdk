export enum ChatUserInfoType {
  NickName,
  AvatarURL,
  Phone,
  Mail,
  Gender,
  Sign,
  Birth,
  Ext,
}

export class ChatUserInfo {
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
