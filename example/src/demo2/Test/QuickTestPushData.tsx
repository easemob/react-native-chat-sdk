import {
  ChatConversation,
  ChatConversationType,
  ChatPushRemindType,
  ChatSilentModeParam,
  ChatSilentModeParamType,
  ChatSilentModeTime,
} from 'react-native-chat-sdk';
import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';

export const MN = {
  setSilentModeForConversation: 'setSilentModeForConversation',
  removeSilentModeForConversation: 'removeSilentModeForConversation',
  fetchSilentModeForConversation: 'fetchSilentModeForConversation',
  setSilentModeForAll: 'setSilentModeForAll',
  fetchSilentModeForAll: 'fetchSilentModeForAll',
  fetchSilentModeForConversations: 'fetchSilentModeForConversations',
  setPreferredNotificationLanguage: 'setPreferredNotificationLanguage',
  fetchPreferredNotificationLanguage: 'fetchPreferredNotificationLanguage',
};

export const metaDataList = new Map<string, ApiParams>([
  [
    MN.setSilentModeForConversation,
    {
      methodName: MN.setSilentModeForConversation,
      params: [
        {
          paramName: 'convId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
          domType: 'input',
        },
        {
          paramName: 'option',
          paramType: 'json',
          paramDefaultValue: new ChatSilentModeParam({
            paramType: ChatSilentModeParamType.SILENT_MODE_DURATION,
            remindType: ChatPushRemindType.ALL,
            startTime: new ChatSilentModeTime({ hour: 1, minute: 1 }),
            endTime: new ChatSilentModeTime({ hour: 1, minute: 1 }),
            duration: 10,
          }),
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.removeSilentModeForConversation,
    {
      methodName: MN.removeSilentModeForConversation,
      params: [
        {
          paramName: 'convId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchSilentModeForConversation,
    {
      methodName: MN.fetchSilentModeForConversation,
      params: [
        {
          paramName: 'convId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[2].id,
          domType: 'input',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 0,
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.setSilentModeForAll,
    {
      methodName: MN.setSilentModeForAll,
      params: [
        {
          paramName: 'option',
          paramType: 'json',
          paramDefaultValue: ChatSilentModeParam.constructorWithNotification(
            ChatPushRemindType.ALL
          ),
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchSilentModeForAll,
    {
      methodName: MN.fetchSilentModeForAll,
      params: [],
    },
  ],
  [
    MN.fetchSilentModeForConversations,
    {
      methodName: MN.fetchSilentModeForConversations,
      params: [
        {
          paramName: 'conversations',
          paramType: 'json',
          paramDefaultValue: [
            new ChatConversation({
              convId: datasheet.accounts[2].id,
              convType: ChatConversationType.PeerChat,
            }),
            new ChatConversation({
              convId: datasheet.accounts[0].id,
              convType: ChatConversationType.PeerChat,
            }),
          ],
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.setPreferredNotificationLanguage,
    {
      methodName: MN.setPreferredNotificationLanguage,
      params: [
        {
          paramName: 'languageCode',
          paramType: 'string',
          paramDefaultValue: 'lzh',
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.fetchPreferredNotificationLanguage,
    {
      methodName: MN.fetchPreferredNotificationLanguage,
      params: [],
    },
  ],
]);
