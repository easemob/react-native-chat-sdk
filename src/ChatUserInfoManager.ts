import { ChatClient } from './ChatClient';
import { ChatUserInfo } from './common/ChatUserInfo';
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
   * @param userInfo The user attributes to be modified.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateOwnUserInfo(userInfo: ChatUserInfo): Promise<void> {
    console.log(`${ChatUserInfoManager.TAG}: updateOwnUserInfo: `);
    let r: any = await Native._callMethod(MTupdateOwnUserInfo, {
      [MTupdateOwnUserInfo]: {
        userInfo: userInfo,
      },
    });
    ChatUserInfoManager.checkErrorFromResult(r);
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
    console.log(`${ChatUserInfoManager.TAG}: fetchUserInfoById: `);
    let r: any = await Native._callMethod(MTfetchUserInfoById, {
      [MTfetchUserInfoById]: {
        userIds: userIds,
      },
    });
    ChatUserInfoManager.checkErrorFromResult(r);
    const ret = new Map<string, ChatUserInfo>();
    Object.entries(r?.[MTfetchUserInfoById]).forEach((value: [string, any]) => {
      console.log(value[0], value[1]);
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
    console.log(`${ChatUserInfoManager.TAG}: fetchOwnInfo: `);
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
