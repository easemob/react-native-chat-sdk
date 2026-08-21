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
];
