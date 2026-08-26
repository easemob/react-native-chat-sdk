import {
  ChatClient,
  ChatConversationType,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageSearchOption,
  ChatVoiceParam,
} from 'react-native-chat-sdk';
import type { ApiEntry } from '../api_entry';
import { addLog } from '../../log/log_store';

/** 发送进度/成败回调统一打日志（媒体消息测试辅助条目用） */
function sendCallbacks(tag: string) {
  return {
    onProgress: (localMsgId: string, progress: number) => {
      addLog(`${tag}.onProgress`, { localMsgId, progress });
    },
    onError: (
      localMsgId: string,
      error: { code: number; description: string }
    ) => {
      addLog(`${tag}.onError`, {
        localMsgId,
        code: error.code,
        description: error.description,
      });
    },
    onSuccess: (message: ChatMessage) => {
      addLog(`${tag}.onSuccess`, { msgId: message.msgId });
    },
  };
}

export const chatApis: ApiEntry[] = [
  {
    name: 'ChatManager.fetchConversationsFromServerWithCursor',
    group: 'ChatManager',
    description: '从服务器分页获取会话列表。cursor/pageSize 均可选。',
    paramsTemplate: JSON.stringify({ pageSize: 20 }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().chatManager.fetchConversationsFromServerWithCursor(
        params.cursor === undefined ? undefined : String(params.cursor),
        params.pageSize === undefined ? undefined : Number(params.pageSize)
      );
    },
  },
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
        webhookEnv: '',
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
      if (params.webhookEnv !== undefined && params.webhookEnv !== '') {
        msg.webhookEnv = String(params.webhookEnv);
      }
      await ChatClient.getInstance().chatManager.sendMessage(
        msg,
        sendCallbacks('ChatManager.sendMessage')
      );
      return msg;
    },
  },
  {
    name: 'ChatManager.searchMessagesFromServer',
    group: 'ChatManager',
    description:
      '服务端搜索消息（需在 Console 开通消息搜索增值服务）。' +
      'keywordList 必填（最多 5 个关键词）；pageNum 从 1 开始，pageSize [1,100]。' +
      'keywordMatchType：0 OR / 1 AND；conversationId/msgTypes/startTime/endTime/searchScope 可选。',
    paramsTemplate: JSON.stringify(
      {
        keywordList: ['hello'],
        pageSize: 10,
        pageNum: 1,
      },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().chatManager.searchMessagesFromServer({
        option: new ChatMessageSearchOption({
          keywordList: (params.keywordList ?? []).map(String),
          keywordMatchType:
            params.keywordMatchType === undefined
              ? undefined
              : Number(params.keywordMatchType),
          conversationId:
            params.conversationId === undefined
              ? undefined
              : String(params.conversationId),
          msgTypes: params.msgTypes,
          startTime:
            params.startTime === undefined
              ? undefined
              : Number(params.startTime),
          endTime:
            params.endTime === undefined ? undefined : Number(params.endTime),
          searchScope:
            params.searchScope === undefined
              ? undefined
              : Number(params.searchScope),
        }),
        pageSize: Number(params.pageSize ?? 10),
        pageNum: Number(params.pageNum ?? 1),
      });
    },
  },
  {
    name: 'ChatManager.sendImageMessage',
    group: 'ChatManager',
    description:
      '【测试辅助】发送图片消息（默认发原图，供 downloadBigImage 验证）。' +
      'filePath：图片本地路径。返回已发送消息 JSON。',
    paramsTemplate: JSON.stringify(
      {
        targetId: 'ID',
        filePath: '/path/to/image.png',
        chatType: 0,
      },
      null,
      2
    ),
    invoke: async (params) => {
      const msg = ChatMessage.createImageMessage(
        String(params.targetId),
        String(params.filePath),
        (params.chatType ??
          ChatMessageChatType.PeerChat) as ChatMessageChatType,
        { sendOriginalImage: true }
      );
      await ChatClient.getInstance().chatManager.sendMessage(
        msg,
        sendCallbacks('ChatManager.sendImageMessage')
      );
      return msg;
    },
  },
  {
    name: 'ChatManager.sendVoiceMessage',
    group: 'ChatManager',
    description:
      '【测试辅助】发送语音消息（供 voiceMessageToText 验证）。' +
      'filePath：语音本地路径；duration 可选（毫秒）。返回已发送消息 JSON。',
    paramsTemplate: JSON.stringify(
      {
        targetId: 'ID',
        filePath: '/path/to/voice.aac',
        chatType: 0,
        duration: 3000,
      },
      null,
      2
    ),
    invoke: async (params) => {
      const msg = ChatMessage.createVoiceMessage(
        String(params.targetId),
        String(params.filePath),
        (params.chatType ??
          ChatMessageChatType.PeerChat) as ChatMessageChatType,
        {
          duration:
            params.duration === undefined ? undefined : Number(params.duration),
        }
      );
      await ChatClient.getInstance().chatManager.sendMessage(
        msg,
        sendCallbacks('ChatManager.sendVoiceMessage')
      );
      return msg;
    },
  },
  {
    name: 'ChatManager.getLatestMessage',
    group: 'ChatManager',
    description:
      '【测试辅助】获取指定单聊会话的最新一条消息。convId：对方用户 ID。' +
      '返回消息 JSON，可作为 downloadBigImage / voiceMessageToText 的输入。',
    paramsTemplate: JSON.stringify({ convId: 'ID' }, null, 2),
    invoke: async (params) => {
      const conv = await ChatClient.getInstance().chatManager.getConversation(
        String(params.convId),
        ChatConversationType.PeerChat,
        false
      );
      return conv?.getLatestMessage();
    },
  },
  {
    name: 'ChatManager.voiceMessageToText',
    group: 'ChatManager',
    description:
      '将语音消息转换为文本。message：语音消息 JSON（body.type 为 voice）。',
    paramsTemplate: JSON.stringify(
      {
        message: {
          msgId: 'ID',
          body: { type: 'voice', localPath: '/path/to/voice.aac' },
        },
      },
      null,
      2
    ),
    invoke: async (params) => {
      if (params.message == null) {
        throw new Error('params.message is required (voice message JSON)');
      }
      return ChatClient.getInstance().chatManager.voiceMessageToText(
        new ChatMessage(params.message)
      );
    },
  },
  {
    name: 'ChatManager.voiceFileToText',
    group: 'ChatManager',
    description:
      '将语音文件转换为文本。filePath：语音文件本地路径；voiceParam 可选，format 取值 pcm/amr/mp3。',
    paramsTemplate: JSON.stringify(
      {
        filePath: '/path/to/voice.pcm',
        voiceParam: { format: 'pcm', sampleRate: 16000 },
      },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().chatManager.voiceFileToText(
        String(params.filePath),
        params.voiceParam ? new ChatVoiceParam(params.voiceParam) : undefined
      );
    },
  },
  {
    name: 'ChatManager.downloadBigImage',
    group: 'ChatManager',
    description:
      '下载图片消息的大图。message：图片消息 JSON（body.type 为 img）。' +
      '下载进度/成败回调见悬浮日志。',
    paramsTemplate: JSON.stringify(
      {
        message: {
          msgId: 'ID',
          body: { type: 'img', localPath: '/path/to/image.jpg' },
        },
      },
      null,
      2
    ),
    invoke: async (params) => {
      if (params.message == null) {
        throw new Error('params.message is required (image message JSON)');
      }
      await ChatClient.getInstance().chatManager.downloadBigImage(
        new ChatMessage(params.message),
        {
          onProgress: (localMsgId, progress) => {
            addLog('ChatManager.downloadBigImage.onProgress', {
              localMsgId,
              progress,
            });
          },
          onError: (localMsgId, error) => {
            addLog('ChatManager.downloadBigImage.onError', {
              localMsgId,
              code: error.code,
              description: error.description,
            });
          },
          onSuccess: (msg) => {
            addLog('ChatManager.downloadBigImage.onSuccess', {
              msgId: msg.msgId,
            });
          },
        }
      );
    },
  },
];
