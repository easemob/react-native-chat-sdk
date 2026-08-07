import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const userInfoApis: ApiEntry[] = [
  {
    name: 'ChatUserInfoManager.getLocalUserInfoByIds',
    group: 'ChatUserInfoManager',
    description: '从本地数据库获取指定用户的用户属性。userIds：用户 ID 数组。',
    paramsTemplate: JSON.stringify({ userIds: ['ID'] }, null, 2),
    invoke: async (params) => {
      const ret =
        await ChatClient.getInstance().userManager.getLocalUserInfoByIds(
          params.userIds as string[]
        );
      return Object.fromEntries(ret);
    },
  },
  {
    name: 'ChatUserInfoManager.subscribeUsersInfo',
    group: 'ChatUserInfoManager',
    description: '订阅指定用户的用户属性变更。userIds：用户 ID 数组。',
    paramsTemplate: JSON.stringify({ userIds: ['ID'] }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().userManager.subscribeUsersInfo(
        params.userIds as string[]
      );
    },
  },
  {
    name: 'ChatUserInfoManager.unsubscribeUsersInfo',
    group: 'ChatUserInfoManager',
    description: '取消订阅指定用户的用户属性变更。userIds：用户 ID 数组。',
    paramsTemplate: JSON.stringify({ userIds: ['ID'] }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().userManager.unsubscribeUsersInfo(
        params.userIds as string[]
      );
    },
  },
  {
    name: 'ChatUserInfoManager.fetchSubscribedUsers',
    group: 'ChatUserInfoManager',
    description: '获取当前用户已订阅用户属性的用户列表。无参数。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().userManager.fetchSubscribedUsers();
    },
  },
];
