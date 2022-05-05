import type { NativeEventEmitter } from 'react-native';
import { ChatPushConfigs, PushDisplayStyle } from './common/ChatPushConfig';
import {
  MTdisableOfflinePush,
  MTenableOfflinePush,
  MTgetImPushConfig,
  MTgetImPushConfigFromServer,
  MTgetNoPushGroups,
  MTgetNoPushUsers,
  MTupdateAPNsPushToken,
  MTupdateFCMPushToken,
  MTupdateGroupPushService,
  MTupdateHMSPushToken,
  MTupdateImPushStyle,
  MTupdatePushNickname,
  MTupdateUserPushService,
} from './__internal__/Consts';
import { Native } from './__internal__/Native';
export class ChatPushManager extends Native {
  private static TAG = 'ChatPushManager';
  constructor() {
    super();
  }

  public setNativeListener(_event: NativeEventEmitter): void {
    console.log(`${ChatPushManager.TAG}: setNativeListener: `);
  }

  public async getPushConfigsFromCache(): Promise<ChatPushConfigs> {
    console.log(`${ChatPushManager.TAG}: getPushConfigsFromCache: `);
    let r: any = await Native._callMethod(MTgetImPushConfig);
    ChatPushManager.checkErrorFromResult(r);
    return new ChatPushConfigs(r?.[MTgetImPushConfig]);
  }

  public async fetchPushConfigsFromServer(): Promise<ChatPushConfigs> {
    console.log(`${ChatPushManager.TAG}: fetchPushConfigsFromServer: `);
    let r: any = await Native._callMethod(MTgetImPushConfigFromServer);
    ChatPushManager.checkErrorFromResult(r);
    return new ChatPushConfigs(r?.[MTgetImPushConfigFromServer]);
  }

  public async enableOfflinePush(): Promise<void> {
    console.log(`${ChatPushManager.TAG}: enableOfflinePush: `);
    let r: any = await Native._callMethod(MTenableOfflinePush);
    ChatPushManager.checkErrorFromResult(r);
  }

  public async disableOfflinePush(start: number, end: number): Promise<void> {
    console.log(`${ChatPushManager.TAG}: disableOfflinePush: `);
    let r: any = await Native._callMethod(MTdisableOfflinePush, {
      [MTdisableOfflinePush]: {
        start,
        end,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  public async updatePushServiceForGroup(
    groupIds: Array<string>,
    enablePush: boolean
  ): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updatePushServiceForGroup: `);
    let r: any = await Native._callMethod(MTupdateGroupPushService, {
      [MTupdateGroupPushService]: {
        noPush: enablePush,
        group_ids: groupIds,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  public async updatePushServiceFroUsers(
    userIds: Array<string>,
    enablePush: boolean
  ): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updatePushServiceFroUsers: `);
    let r: any = await Native._callMethod(MTupdateUserPushService, {
      [MTupdateUserPushService]: {
        noPush: enablePush,
        user_ids: userIds,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  public async getNoPushGroupsFromCache(): Promise<Array<string>> {
    console.log(`${ChatPushManager.TAG}: getNoPushGroupsFromCache: `);
    let r: any = await Native._callMethod(MTgetNoPushGroups);
    ChatPushManager.checkErrorFromResult(r);
    return r?.[MTgetNoPushGroups] as Array<string>;
  }

  public async getNoPushUsersFromCache(): Promise<Array<string>> {
    console.log(`${ChatPushManager.TAG}: getNoPushUsersFromCache: `);
    let r: any = await Native._callMethod(MTgetNoPushUsers);
    ChatPushManager.checkErrorFromResult(r);
    return r?.[MTgetNoPushUsers] as Array<string>;
  }

  public async updatePushNickname(nickname: string): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updatePushNickname: `);
    let r: any = await Native._callMethod(MTupdatePushNickname, {
      [MTupdatePushNickname]: {
        nickname,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  public async updatePushDisplayStyle(
    displayStyle: PushDisplayStyle
  ): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updatePushDisplayStyle: `);
    let r: any = await Native._callMethod(MTupdateImPushStyle, {
      [MTupdateImPushStyle]: {
        pushStyle: displayStyle,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  public async updateHMSPushToken(token: string): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updateHMSPushToken: `);
    let r: any = await Native._callMethod(MTupdateHMSPushToken, {
      [MTupdateHMSPushToken]: {
        token: token,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  public async updateFCMPushToken(token: string): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updateFCMPushToken: `);
    let r: any = await Native._callMethod(MTupdateFCMPushToken, {
      [MTupdateFCMPushToken]: {
        token: token,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  public async updateAPNsDeviceToken(token: string): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updateAPNsDeviceToken: `);
    let r: any = await Native._callMethod(MTupdateAPNsPushToken, {
      [MTupdateAPNsPushToken]: {
        token: token,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }
}
