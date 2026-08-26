import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const pushApis: ApiEntry[] = [
  {
    name: 'ChatPushManager.fetchSilentModeForAll',
    group: 'ChatPushManager',
    description: '从服务器获取当前用户的全局推送免打扰设置。无参数。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().pushManager.fetchSilentModeForAll();
    },
  },
  {
    name: 'ChatPushManager.fetchPushOptionFromServer',
    group: 'ChatPushManager',
    description: '从服务器获取推送配置。无参数。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().pushManager.fetchPushOptionFromServer();
    },
  },
];
