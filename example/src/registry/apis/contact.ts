import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const contactApis: ApiEntry[] = [
  {
    name: 'ChatContactManager.getAllContacts',
    group: 'ChatContactManager',
    description: '获取全部联系人列表（本地数据）。无参数。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().contactManager.getAllContacts();
    },
  },
  {
    name: 'ChatContactManager.addContact',
    group: 'ChatContactManager',
    description:
      '添加好友（服务端接口，未登录返回 201）。userId：用户 ID；reason 可选，申请理由。',
    paramsTemplate: JSON.stringify({ userId: 'ID', reason: 'reason' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().contactManager.addContact(
        String(params.userId),
        params.reason === undefined ? '' : String(params.reason)
      );
    },
  },
];
