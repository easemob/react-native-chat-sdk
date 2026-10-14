import {
  ChatClient,
  ChatConversationType,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageSearchOption,
  ChatTextMessageBody,
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

/** 等服务端发送回调后再返回，确保后续步骤拿到可从本地库查回的消息 ID。 */
function sendMessageAndWait(message: ChatMessage): Promise<ChatMessage> {
  return new Promise((resolve, reject) => {
    let settled = false;
    ChatClient.getInstance()
      .chatManager.sendMessage(message, {
        onProgress: (localMsgId: string, progress: number) => {
          addLog('ChatManager.sendMessage.onProgress', {
            localMsgId,
            progress,
          });
        },
        onError: (
          localMsgId: string,
          error: { code: number; description: string }
        ) => {
          addLog('ChatManager.sendMessage.onError', {
            localMsgId,
            code: error.code,
            description: error.description,
          });
          if (!settled) {
            settled = true;
            reject(error);
          }
        },
        onSuccess: (sentMessage: ChatMessage) => {
          addLog('ChatManager.sendMessage.onSuccess', {
            msgId: sentMessage.msgId,
          });
          if (!settled) {
            settled = true;
            resolve(sentMessage);
          }
        },
      })
      .catch((error) => {
        if (!settled) {
          settled = true;
          reject(error);
        }
      });
  });
}

export const chatApis: ApiEntry[] = [
  {
    name: 'ChatManager.getAllConversations',
    group: 'ChatManager',
    description:
      '获取全部会话列表（本地数据，服务端拉取接口已在 5.0 移除）。无参数。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().chatManager.getAllConversations();
    },
  },
  {
    name: 'ChatManager.deleteConversations',
    group: 'ChatManager',
    description:
      '【5.0.0 新增】批量删除本地会话，可选是否同时删除会话内消息。' +
      'convIds：会话 ID 列表（不存在的 ID 会被忽略）；deleteMessages：默认 true。',
    paramsTemplate: JSON.stringify(
      { convIds: ['ID'], deleteMessages: true },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().chatManager.deleteConversations(
        (params.convIds ?? []).map(String),
        params.deleteMessages ?? true
      );
    },
  },
  {
    name: 'ChatManager.sendMessage',
    group: 'ChatManager',
    description:
      '发送文本消息。chatType：0 单聊 / 1 群聊 / 2 聊天室。' +
      'isNeedReadReceipt 可选：群消息已读回执开关（验证 sendMessageReadReceipts 时开启）。' +
      '返回已发送消息 JSON（含 msgId、localTime），发送进度/成败回调见悬浮日志。' +
      'round-trip：返回的消息 JSON 可作为后续消息类 API 的输入。',
    paramsTemplate: JSON.stringify(
      {
        targetId: 'ID',
        content: 'hello',
        chatType: 0,
        webhookEnv: '',
        isNeedReadReceipt: false,
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
      if (params.isNeedReadReceipt === true) {
        msg.isNeedReadReceipt = true;
      }
      return sendMessageAndWait(msg);
    },
  },
  {
    name: 'ChatManager.getConvMsgsWithKeyword',
    group: 'ChatManager',
    description:
      '按关键字从本地库查询指定会话的消息（ChatConversation.getMsgsWithKeyword 的底层入口）。' +
      'convId：会话 ID；convType：0 单聊 / 1 群聊 / 2 聊天室；' +
      'senders 可选：发送者 ID 列表，省略则不过滤发送者。',
    paramsTemplate: JSON.stringify(
      {
        convId: 'ID',
        convType: 0,
        keywords: 'hello',
        timestamp: -1,
        count: 50,
        direction: 0,
        searchScope: 2,
        senders: ['ID'],
      },
      null,
      2
    ),
    invoke: async (params) => {
      const ret =
        await ChatClient.getInstance().chatManager.getConvMsgsWithKeyword({
          convId: String(params.convId),
          convType: (params.convType ??
            ChatConversationType.PeerChat) as ChatConversationType,
          keywords: String(params.keywords),
          timestamp: params.timestamp as number | undefined,
          count: params.count as number | undefined,
          direction: params.direction as number | undefined,
          senders: params.senders as string[] | undefined,
          searchScope: params.searchScope as number | undefined,
        });
      return ret.map((msg) => ({ msgId: msg.msgId, from: msg.from }));
    },
  },
  {
    name: 'ChatManager.getMsgs',
    group: 'ChatManager',
    description:
      '从本地库加载指定会话的消息（无关键字过滤，用于对照验证）。' +
      'convId：会话 ID；convType：0 单聊 / 1 群聊 / 2 聊天室；startMsgId 传空串则从最新开始。',
    paramsTemplate: JSON.stringify(
      {
        convId: 'ID',
        convType: 0,
        startMsgId: '',
        loadCount: 20,
        direction: 0,
      },
      null,
      2
    ),
    invoke: async (params) => {
      const ret = await ChatClient.getInstance().chatManager.getMsgs({
        convId: String(params.convId),
        convType: (params.convType ??
          ChatConversationType.PeerChat) as ChatConversationType,
        startMsgId: String(params.startMsgId ?? ''),
        loadCount: params.loadCount as number | undefined,
        direction: params.direction as number | undefined,
      });
      return ret.map((msg) => ({ msgId: msg.msgId, from: msg.from }));
    },
  },
  {
    name: 'ChatManager.sendMessageReadReceipts',
    group: 'ChatManager',
    description:
      '【5.0.0 新增】发送消息已读回执（替代已删除的 sendMessageReadAck）。' +
      'msgIds：消息 ID 列表，最多 50 条且须属于同一会话；' +
      '仅对 isNeedReadReceipt=true 的消息生效。',
    paramsTemplate: JSON.stringify({ msgIds: ['ID'] }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().chatManager.sendMessageReadReceipts(
        (params.msgIds ?? []).map(String)
      );
    },
  },
  {
    name: 'ChatManager.clearConversationUnreadMessageCount',
    group: 'ChatManager',
    description:
      '【5.0.0 新增】清空指定会话的本地未读数并同步多设备（不发已读回执）。' +
      'convId：会话 ID。',
    paramsTemplate: JSON.stringify({ convId: 'ID' }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().chatManager.clearConversationUnreadMessageCount(
        String(params.convId)
      );
    },
  },
  {
    name: 'ChatManager.clearAllConversationUnreadMessageCount',
    group: 'ChatManager',
    description:
      '【5.0.0 新增】清空所有会话的本地未读数并同步多设备（不发已读回执）。无参数。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().chatManager.clearAllConversationUnreadMessageCount();
    },
  },
  {
    name: 'ChatManager.getGroupMessageReadReceipts',
    group: 'ChatManager',
    description:
      '【5.0.0 新增】从本地获取群消息已读回执。' +
      'msgIds：消息 ID 列表，最多 20 条且须属于同一会话。' +
      '返回 ChatMessageReadReceipt 列表。',
    paramsTemplate: JSON.stringify({ msgIds: ['ID'] }, null, 2),
    invoke: async (params) => {
      return ChatClient.getInstance().chatManager.getGroupMessageReadReceipts(
        (params.msgIds ?? []).map(String)
      );
    },
  },
  {
    name: 'ChatManager.fetchGroupMessageReadReceipts',
    group: 'ChatManager',
    description:
      '【5.0.0 新增】分页从服务器获取群消息已读回执（替代已删除的 fetchGroupAcks）。' +
      'msgId：消息 ID；groupId：群 ID；cursor/pageSize 可选。' +
      '返回 {cursor, list, totalCount?}（totalCount 仅 iOS）。',
    paramsTemplate: JSON.stringify(
      { msgId: 'ID', groupId: 'ID', cursor: '', pageSize: 20 },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().chatManager.fetchGroupMessageReadReceipts(
        String(params.msgId),
        String(params.groupId),
        params.cursor === undefined ? undefined : String(params.cursor),
        params.pageSize === undefined ? undefined : Number(params.pageSize)
      );
    },
  },
  {
    name: 'ChatManager.modifyMsgBody',
    group: 'ChatManager',
    description:
      '修改消息（5.0.0 起支持同时修改 ext 扩展）。msgId：消息 ID；' +
      'content 可选：新的文本内容（仅文本/自定义消息可改 body）；' +
      'ext 可选：新的扩展（整体覆盖）。返回修改后的消息 JSON。',
    paramsTemplate: JSON.stringify(
      { msgId: 'ID', content: 'modified', ext: { k: 'v' } },
      null,
      2
    ),
    invoke: async (params) => {
      return ChatClient.getInstance().chatManager.modifyMsgBody({
        msgId: String(params.msgId),
        body:
          params.content === undefined
            ? undefined
            : new ChatTextMessageBody({ content: String(params.content) }),
        ext: params.ext,
      });
    },
  },
  {
    name: 'ChatManager.getUnreadCount',
    group: 'ChatManager',
    description:
      '获取所有会话未读数总和（5.0.0 起不再统计聊天室与免打扰会话）。无参数。返回数字。',
    paramsTemplate: '{}',
    invoke: async () => {
      return ChatClient.getInstance().chatManager.getUnreadCount();
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
