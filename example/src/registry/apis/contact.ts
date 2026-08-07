import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const contactApis: ApiEntry[] = [
  {
    name: 'ChatContactManager.fetchAllContacts',
    group: 'ChatContactManager',
    description: '从服务器获取全部联系人列表。无参数。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().contactManager.fetchAllContacts();
    },
  },
];
