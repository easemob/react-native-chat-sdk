import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const groupApis: ApiEntry[] = [
  {
    name: 'ChatGroupManager.fetchJoinedGroupsFromServer',
    group: 'ChatGroupManager',
    description: '从服务器分页获取当前用户加入的群组列表。',
    paramsTemplate: JSON.stringify({ pageSize: 20, pageNum: 0 }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.fetchJoinedGroupsFromServer(
        Number(params.pageSize),
        Number(params.pageNum)
      );
    },
  },
];
