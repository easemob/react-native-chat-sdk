import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const presenceApis: ApiEntry[] = [
  {
    name: 'ChatPresenceManager.publishPresence',
    group: 'ChatPresenceManager',
    description: '发布自定义在线状态。description 可选，状态描述。',
    paramsTemplate: JSON.stringify({ description: 'busy' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().presenceManager.publishPresence(
        params.description === undefined
          ? undefined
          : String(params.description)
      );
    },
  },
  {
    name: 'ChatPresenceManager.fetchPresenceStatus',
    group: 'ChatPresenceManager',
    description: '获取指定用户的在线状态。userIds：用户 ID 数组。',
    paramsTemplate: JSON.stringify({ userIds: ['ID'] }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().presenceManager.fetchPresenceStatus(
        params.userIds as string[]
      );
    },
  },
];
