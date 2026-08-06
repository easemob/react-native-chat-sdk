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
  {
    name: 'ChatGroupManager.updateGroupNamecard',
    group: 'ChatGroupManager',
    description:
      '更新当前用户在群内的名片。groupId：群 ID；namecard 可选，省略表示清除名片。',
    paramsTemplate: JSON.stringify(
      { groupId: 'ID', namecard: 'my namecard' },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.updateGroupNamecard(
        String(params.groupId),
        params.namecard === undefined ? undefined : String(params.namecard)
      );
    },
  },
  {
    name: 'ChatGroupManager.getGroupNamecard',
    group: 'ChatGroupManager',
    description: '获取群成员名片。groupId：群 ID；userId：成员用户 ID。',
    paramsTemplate: JSON.stringify({ groupId: 'ID', userId: 'ID' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.getGroupNamecard(
        String(params.groupId),
        String(params.userId)
      );
    },
  },
];
