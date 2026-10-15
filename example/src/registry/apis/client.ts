import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const clientApis: ApiEntry[] = [
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
