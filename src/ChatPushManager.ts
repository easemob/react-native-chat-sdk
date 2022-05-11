import type { NativeEventEmitter } from 'react-native';
import { ChatPushConfig, PushDisplayStyle } from './common/ChatPushConfig';
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

/**
 * The message push configuration options.
 */
export class ChatPushManager extends Native {
  private static TAG = 'ChatPushManager';
  constructor() {
    super();
  }

  public setNativeListener(_event: NativeEventEmitter): void {
    console.log(`${ChatPushManager.TAG}: setNativeListener: `);
  }

  /**
   * Get push configuration information from the local cache.
   *
   * @returns The push config information.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getPushConfigsFromCache(): Promise<ChatPushConfig | undefined> {
    console.log(`${ChatPushManager.TAG}: getPushConfigsFromCache: `);
    let r: any = await Native._callMethod(MTgetImPushConfig);
    ChatPushManager.checkErrorFromResult(r);
    const p = r?.[MTgetImPushConfig];
    if (p) {
      return new ChatPushConfig(p);
    }
    return undefined;
  }

  /**
   * Gets the push configurations from the server.
   *
   * @returns The push config information.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async fetchPushConfigsFromServer(): Promise<ChatPushConfig> {
    console.log(`${ChatPushManager.TAG}: fetchPushConfigsFromServer: `);
    let r: any = await Native._callMethod(MTgetImPushConfigFromServer);
    ChatPushManager.checkErrorFromResult(r);
    return new ChatPushConfig(r?.[MTgetImPushConfigFromServer]);
  }

  /**
   * Turns on the push notification.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async enableOfflinePush(): Promise<void> {
    console.log(`${ChatPushManager.TAG}: enableOfflinePush: `);
    let r: any = await Native._callMethod(MTenableOfflinePush);
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * Turns off the push notification.
   *
   * @param start The start hour(24-hour clock).
   * @param end The end hour(24-hour clock).
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Sets whether to turn on or turn off the push notification for the the specified groups.
   *
   * @param groupIds The list of groups to be set.
   * @param enablePush enable push notification.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Sets whether to turn on or turn off the push notification for the the specified users.
   *
   * @param userIds The list of users to be set.
   * @param enablePush enable push notification.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Gets the list of groups which have blocked the push notification.
   *
   * @returns The list of groups that blocked the push notification.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getNoPushGroupsFromCache(): Promise<Array<string>> {
    console.log(`${ChatPushManager.TAG}: getNoPushGroupsFromCache: `);
    let r: any = await Native._callMethod(MTgetNoPushGroups);
    ChatPushManager.checkErrorFromResult(r);
    return r?.[MTgetNoPushGroups] as Array<string>;
  }

  /**
   * Gets the list of users which have blocked the push notification.
   *
   * @returns The list of user that blocked the push notification.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async getNoPushUsersFromCache(): Promise<Array<string>> {
    console.log(`${ChatPushManager.TAG}: getNoPushUsersFromCache: `);
    let r: any = await Native._callMethod(MTgetNoPushUsers);
    ChatPushManager.checkErrorFromResult(r);
    return r?.[MTgetNoPushUsers] as Array<string>;
  }

  /**
   * Updates the push display nickname of the current user.
   *
   * This method can be used to set a push display nickname, the push display nickname will be used to show for offline push notification.
   *
   * @param nickname The push display nickname, which is different from the nickname in the user profile.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updatePushNickname(nickname: string): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updatePushNickname: `);
    let r: any = await Native._callMethod(MTupdatePushNickname, {
      [MTupdatePushNickname]: {
        nickname,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * Updates the push message style. The default value is {@link PushDisplayStyle#Simple}.
   *
   * @param displayStyle The push message display style.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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

  /**
   * Updates the HMS push token.
   *
   * @param token The HMS push token.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateHMSPushToken(token: string): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updateHMSPushToken: `);
    let r: any = await Native._callMethod(MTupdateHMSPushToken, {
      [MTupdateHMSPushToken]: {
        token: token,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * Updates the FCM push token.
   *
   * @param token The FCM push token.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
  public async updateFCMPushToken(token: string): Promise<void> {
    console.log(`${ChatPushManager.TAG}: updateFCMPushToken: `);
    let r: any = await Native._callMethod(MTupdateFCMPushToken, {
      [MTupdateFCMPushToken]: {
        token: token,
      },
    });
    ChatPushManager.checkErrorFromResult(r);
  }

  /**
   * Updates the APNs push token.
   *
   * @param token The APNs push token.
   *
   * @throws A description of the exception. See {@link ChatError}.
   */
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
