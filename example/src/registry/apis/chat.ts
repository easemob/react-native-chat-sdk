import {
  ChatClient,
  ChatMessage,
  ChatMessageChatType,
} from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';
import { addLog } from '../../log/log_store';

export const chatApis: ApiEntry[] = [
  {
    name: 'ChatManager.sendMessage',
    group: 'ChatManager',
    description:
      '发送文本消息。chatType：0 单聊 / 1 群聊 / 2 聊天室。' +
      '返回已发送消息 JSON（含 msgId、localTime），发送进度/成败回调见悬浮日志。' +
      'round-trip：返回的消息 JSON 可作为后续消息类 API 的输入。',
    paramsTemplate: JSON.stringify(
      {
        targetId: 'ID',
        content: 'hello',
        chatType: 0,
      },
      null,
      2
    ),
    invoke: async (params) => {
      const msg = ChatMessage.createTextMessage(
        String(params.targetId),
        String(params.content),
        (params.chatType ?? ChatMessageChatType.PeerChat) as ChatMessageChatType
      );
      await ChatClient.getInstance().chatManager.sendMessage(msg, {
        onProgress: (localMsgId, progress) => {
          addLog('ChatManager.sendMessage.onProgress', {
            localMsgId,
            progress,
          });
        },
        onError: (localMsgId, error) => {
          addLog('ChatManager.sendMessage.onError', {
            localMsgId,
            code: error.code,
            description: error.description,
          });
        },
        onSuccess: (localMsgId) => {
          addLog('ChatManager.sendMessage.onSuccess', { localMsgId });
        },
      });
      return msg;
    },
  },
];
