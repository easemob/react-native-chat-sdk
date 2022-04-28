import { ChatClient } from './ChatClient';
import type { ChatUserInfo } from './common/ChatUserInfo';
import { MTfetchUserInfoById, MTupdateOwnUserInfo } from './_internal/Consts';
import { Native } from './_internal/Native';

export class ChatUserInfoManager extends Native {
  private static TAG = 'ChatUserInfoManager';

  private _effectiveUserInfo: Map<string, ChatUserInfo>;

  constructor() {
    super();
    this._effectiveUserInfo = new Map();
  }

  public async updateOwnUserInfo(userInfo: ChatUserInfo): Promise<void> {
    console.log(`${ChatUserInfoManager.TAG}: updateOwnUserInfo: `);
    let r: any = await Native._callMethod(MTupdateOwnUserInfo, {
      [MTupdateOwnUserInfo]: {
        userInfo: userInfo,
      },
    });
    ChatUserInfoManager.checkErrorFromResult(r);
  }

  public async fetchUserInfoById(
    userIds: Array<string>,
    expireTime: number = 0
  ): Promise<Map<string, ChatUserInfo>> {
    console.log(`${ChatUserInfoManager.TAG}: fetchUserInfoById: `);
    const needReqIds: string[] = [];
    userIds.forEach((id: string) => {
      if (
        !this._effectiveUserInfo.has(id) ||
        (this._effectiveUserInfo.has(id) &&
          Date.now() >
            this._effectiveUserInfo.get(id)!.expireTime + expireTime * 1000)
      ) {
        needReqIds.push(id);
      }
    });

    const ret: Map<string, ChatUserInfo> = new Map();
    needReqIds.forEach((id: string) => {
      ret.set(id, this._effectiveUserInfo.get(id)!);
    });

    if (needReqIds.length === 0) {
      return ret;
    }

    let r: any = await Native._callMethod(MTfetchUserInfoById, {
      [MTfetchUserInfoById]: {
        userIds: needReqIds,
      },
    });
    ChatUserInfoManager.checkErrorFromResult(r);
    const rr = r?.[MTfetchUserInfoById] as Map<string, ChatUserInfo>;
    rr.forEach((info: ChatUserInfo) => {
      ret.set(info.userId, info);
    });
    return ret;
  }

  public clearUserInfo(): void {
    this._effectiveUserInfo.clear();
  }

  public async fetchOwnInfo(
    expireTime: number = 0
  ): Promise<ChatUserInfo | undefined> {
    console.log(`${ChatUserInfoManager.TAG}: fetchOwnInfo: `);
    const id = await ChatClient.getInstance().getCurrentUsername();
    if (id) {
      const ret = await this.fetchUserInfoById([id], expireTime);
      if (ret.size > 0) {
        return ret.get(id);
      }
    }
    return undefined;
  }
}
