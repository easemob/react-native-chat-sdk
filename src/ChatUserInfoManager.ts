import { ChatClient } from './ChatClient';
import { ChatUserInfo } from './common/ChatUserInfo';
import {
  MTfetchUserInfoById,
  MTupdateOwnUserInfo,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import { chatlog } from './common/ChatConst';

/**
 * The user information manager for updating and getting user attributes.
 */
export class ChatUserInfoManager extends Native {
  private static TAG = 'ChatUserInfoManager';

  constructor() {
    super();
  }

  /**
   * Modifies the user attributes of the current user.
   *
   * @param params The parameter set.
   * - [nickName] The nickname of the user.
   * - [avatarUrl] The avatar URL of the user.
   * - [mail] The email address of the user.
   * - [phone] The phone number of the user.
   * - [gender] The gender of the user. The value can only be `0`, `1`, or `2`. Other values are invalid.
   *    - `0`: (Default) Unknown;
   *    - `1`: Male;
   *    - `2`: Female.
   * - [sign] The signature of the user.
   * - [birth] The birthday of the user.
   * - [ext] The custom extension information of the user. You can set it to an empty string or type custom information and encapsulate them as a JSON string.
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
   * Gets the user attributes of the specified users.
   *
   * @param userIds The user ID array.
   * @returns A map that contains key-value pairs where the key is the user ID and the value is user attributes，see {@link ChatUserInfo}.
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
   * Gets attributes of the current user from the server.
   *
   * @returns The obtained user attributes. See {@link ChatUserInfo}.
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
