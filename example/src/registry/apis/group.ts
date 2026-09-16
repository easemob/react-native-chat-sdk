import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const groupApis: ApiEntry[] = [
  {
    name: 'ChatGroupManager.getJoinedGroups',
    group: 'ChatGroupManager',
    description: '获取当前用户加入的群组列表（本地数据）。无参数。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().groupManager.getJoinedGroups();
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
    name: 'ChatGroupManager.updateGroupExtension',
    group: 'ChatGroupManager',
    description:
      '更新群扩展字段（仅群主/管理员）。groupId：群 ID；ext：扩展内容。',
    paramsTemplate: JSON.stringify(
      { groupId: 'ID', ext: 'ext-content' },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().groupManager.updateGroupExtension(
        String(params.groupId),
        String(params.ext)
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
