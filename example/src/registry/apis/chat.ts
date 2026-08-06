import {
  ChatClient,
  ChatMessage,
  ChatMessageChatType,
  ChatVoiceParam,
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
