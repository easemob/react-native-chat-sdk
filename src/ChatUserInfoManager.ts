import {
  MTfetchUserInfoById,
  MTupdateOwnUserInfo,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
import { ChatClient } from './ChatClient';
import { chatlog } from './common/ChatConst';
import { ChatUserInfo } from './common/ChatUserInfo';

/**
 * 用户信息管理类，负责更新及获取用户属性。
 */
export class ChatUserInfoManager extends Native {
  private static TAG = 'ChatUserInfoManager';

  constructor() {
    super();
  }

  /**
   * 修改当前用户的信息。
   *
   * @param params 参数。
   * - [nickName] 用户昵称。
   * - [avatarUrl] 用户头像。
   * - [mail] 用户邮箱。
   * - [phone] 用户手机号。
   * - [gender] 用户性别。该参数的值可为 `0`、`1` 或 `2`。
   *   - `0`：（默认）未知
   *   - `1`：男
   *   - `2`：女
   * - [sign] 用户签名。
   * - [birth] 用户的生日。
   * - [ext] 用户的自定义属性字段。该字段可为空，或设置为自定义扩展信息，封装为 JSON 字符串。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 获取指定用户的用户属性。
   *
   * @param userIds 要获取用户属性的用户 ID 列表。
   * @returns 用户 ID 和用户属性的键值对，详见 {@link ChatUserInfo}。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
   * 从服务器获取当前用户的用户属性信息。
   *
   * @returns 用户属性信息，详见 {@link ChatUserInfo}。
   *
   * @throws 如果有方法调用的异常会在这里抛出，可以看到具体错误原因。参见 {@link ChatError}。
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
