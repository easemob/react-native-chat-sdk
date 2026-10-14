import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

/**
 * ChatClient 级 API（init/login/logout 为页面专用，不在此注册）。
 * 设备管理三方法自 5.0.0 起改为 token 鉴权，token 用 `$config.accounts.0.mm` 引用。
 */
export const clientApis: ApiEntry[] = [
  {
    name: 'ChatClient.getLoggedInDevicesFromServer',
    group: 'ChatClient',
    description:
      '获取指定账号的在线登录设备列表（5.0.0 起 token 鉴权）。' +
      'userId：用户 ID；token：用户 token。返回设备列表（resource/deviceUUID/deviceName）。',
    paramsTemplate: JSON.stringify({ userId: 'ID', token: 'TOKEN' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().getLoggedInDevicesFromServer(
        String(params.userId),
        String(params.token)
      );
    },
  },
  {
    name: 'ChatClient.kickDevice',
    group: 'ChatClient',
    description:
      '将指定账号在指定设备上踢下线（5.0.0 起 token 鉴权）。' +
      'resource：设备 ID，取自 getLoggedInDevicesFromServer 返回的 resource。' +
      '注意：踢当前设备会导致本端登出。',
    paramsTemplate: JSON.stringify(
      { userId: 'ID', token: 'TOKEN', resource: 'RESOURCE' },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().kickDevice(
        String(params.userId),
        String(params.token),
        String(params.resource)
      );
    },
  },
  {
    name: 'ChatClient.kickAllDevices',
    group: 'ChatClient',
    description:
      '将指定账号在所有设备上踢下线（5.0.0 起 token 鉴权）。' +
      '注意：包含当前设备，调用后本端登出，脚本中应作为最后一步。',
    paramsTemplate: JSON.stringify({ userId: 'ID', token: 'TOKEN' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().kickAllDevices(
        String(params.userId),
        String(params.token)
      );
    },
  },
  {
    name: 'ChatClient.renewToken',
    group: 'ChatClient',
    description:
      '更新用户 token（5.0.0 由 renewAgoraToken 改名）。token：新的用户 token。',
    paramsTemplate: JSON.stringify({ token: 'TOKEN' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().renewToken(String(params.token));
    },
  },
  {
    name: 'ChatClient.bindDeviceToken',
    group: 'ChatClient',
    description:
      '绑定设备的推送 token（双端公用，5.0.0 取代 updatePushConfig）。' +
      'deviceToken：APNs 或厂商推送 SDK 返回的 token；' +
      'notifierName：Android 必填的厂商推送凭据（如 FCM Sender ID），iOS 忽略该参数。' +
      'iOS 的 APNs 证书名请在 ChatOptions.apnsCertName 中配置。',
    paramsTemplate: JSON.stringify(
      { deviceToken: 'DEVICE_TOKEN', notifierName: 'NOTIFIER_NAME' },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().bindDeviceToken({
        deviceToken: String(params.deviceToken),
        notifierName:
          params.notifierName === undefined
            ? undefined
            : String(params.notifierName),
      });
    },
  },
  {
    name: 'ChatClient.bindPushKitToken',
    group: 'ChatClient',
    description:
      '绑定 Apple PushKit token，用于 VoIP 推送（仅 iOS 有效，其他平台直接返回）。' +
      'deviceToken：PKPushRegistry 回调返回的十六进制 token。' +
      'PushKit 证书名请在 ChatOptions.pushKitCertName 中配置；' +
      '未登录时调用会失败但 token 已缓存，下次登录成功后自动绑定。',
    paramsTemplate: JSON.stringify({ deviceToken: 'HEX_TOKEN' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().bindPushKitToken({
        deviceToken: String(params.deviceToken),
      });
    },
  },
  {
    name: 'ChatClient.unbindPushKitToken',
    group: 'ChatClient',
    description:
      '解绑已绑定的 Apple PushKit token（仅 iOS 有效，其他平台直接返回）。无参数。' +
      'logout(unbindDeviceToken: true) 已会同时解绑，仅需在保持登录状态下单独解绑时才调用。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().unbindPushKitToken();
    },
  },
];
