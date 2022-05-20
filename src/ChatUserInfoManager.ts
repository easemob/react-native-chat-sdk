import { ChatClient } from './ChatClient';
import { ChatUserInfo } from './common/ChatUserInfo';
import { chatlog } from './common/ChatLog';
import {
  MTfetchUserInfoById,
  MTupdateOwnUserInfo,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';

export class ChatUserInfoManager extends Native {
  private static TAG = 'ChatUserInfoManager';

  constructor() {
    super();
  }

  /**
   * Modifies the user attributes of the current user.
   *
   * @param params The params set.
   * - [nickName] The user name.
   * - [avatarUrl] The user head image.
   * - [mail] The user email address.
   * - [phone] The user mobile phone number.
   * - [gender] The user sex.
   * - [sign] The user signature.
   * - [birth] The user birthday.
   * - [ext] The user custom define attribute.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateOwnUserInfo(params: {
    nickName?: string;
    avatarUrl?: string;
    mail?: string;
    phone?: string;
    gender?: number;
    sign?: string;
    birth?: string;
    ext?: string;
  }): Promise<void> {
    chatlog.log(`${ChatUserInfoManager.TAG}: updateOwnUserInfo: `, params);
    const userId = await ChatClient.getInstance().getCurrentUsername();
    const ret = await this.fetchUserInfoById([userId]);
    if (ret.has(userId)) {
      let userInfo = new ChatUserInfo(ret.get(userId)!);
      userInfo = Object.assign(userInfo, params);
      let r: any = await Native._callMethod(MTupdateOwnUserInfo, {
        [MTupdateOwnUserInfo]: {
          userInfo,
        },
      });
      ChatUserInfoManager.checkErrorFromResult(r);
    }
  }

  /**
   * Gets user attributes of the specified users.
   *
   * @param userIds The username array.
   * @returns A map that contains key-value pairs where the key is the user ID and the value is user attributes，see {@link ChatUserInfo}
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchUserInfoById(
    userIds: Array<string>
  ): Promise<Map<string, ChatUserInfo>> {
    chatlog.log(`${ChatUserInfoManager.TAG}: fetchUserInfoById: `, userIds);
    let r: any = await Native._callMethod(MTfetchUserInfoById, {
      [MTfetchUserInfoById]: {
        userIds: userIds,
      },
    });
    ChatUserInfoManager.checkErrorFromResult(r);
    const ret = new Map<string, ChatUserInfo>();
    Object.entries(r?.[MTfetchUserInfoById]).forEach((value: [string, any]) => {
      const userInfo = new ChatUserInfo(value[1]);
      ret.set(value[0], userInfo);
    });
    return ret;
  }

  /**
   * Gets the current user's attributes from the server.
   *
   * @returns The user properties that are obtained. See {@link ChatUserInfo}.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchOwnInfo(): Promise<ChatUserInfo | undefined> {
    chatlog.log(`${ChatUserInfoManager.TAG}: fetchOwnInfo: `);
    const id = await ChatClient.getInstance().getCurrentUsername();
    if (id) {
      const ret = await this.fetchUserInfoById([id]);
      if (ret.size > 0) {
        return ret.get(id);
      }
    }
    return undefined;
  }
}
