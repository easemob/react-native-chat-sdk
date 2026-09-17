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
];
