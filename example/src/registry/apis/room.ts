import { ChatClient } from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';

export const roomApis: ApiEntry[] = [
  {
    name: 'ChatRoomManager.fetchPublicChatRoomsFromServer',
    group: 'ChatRoomManager',
    description: '从服务器分页获取公开聊天室列表。',
    paramsTemplate: JSON.stringify({ pageNum: 1, pageSize: 20 }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().roomManager.fetchPublicChatRoomsFromServer(
        Number(params.pageNum),
        Number(params.pageSize)
      );
    },
  },
];
