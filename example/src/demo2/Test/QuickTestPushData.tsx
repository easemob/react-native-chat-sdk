import {
  ChatConversation,
  ChatConversationType,
  ChatPushRemindType,
  ChatSilentModeParam,
} from 'react-native-chat-sdk';
import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';

export const MN = {
  setConversationSilentMode: 'setConversationSilentMode',
  removeConversationSilentMode: 'removeConversationSilentMode',
  fetchConversationSilentMode: 'fetchConversationSilentMode',
  setSilentModeForAll: 'setSilentModeForAll',
  fetchSilentModeForAll: 'fetchSilentModeForAll',
  fetchSilentModeForConversations: 'fetchSilentModeForConversations',
  setPreferredNotificationLanguage: 'setPreferredNotificationLanguage',
  fetchPreferredNotificationLanguage: 'fetchPreferredNotificationLanguage',
};

export const metaDataList = new Map<string, ApiParams>([
  [
    MN.setConversationSilentMode,
    {
      methodName: MN.setConversationSilentMode,
      params: [
        {
          paramName: 'convId',
          paramType: 'string',
          paramDefaultValue: '187663429730305',
          domType: 'input',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 1,
          domType: 'input',
        },
        {
          paramName: 'option',
          paramType: 'json',
          paramDefaultValue: ChatSilentModeParam.constructorWithDuration(10),
          domType: 'input',
        },
      ],
    },
  ],
  [
    MN.removeConversationSilentMode,
    {
      methodName: MN.removeConversationSilentMode,
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
    MN.fetchConversationSilentMode,
    {
      methodName: MN.fetchConversationSilentMode,
      params: [
        {
          paramName: 'convId',
          paramType: 'string',
          paramDefaultValue: '187663429730305',
          domType: 'input',
        },
        {
          paramName: 'convType',
          paramType: 'number',
          paramDefaultValue: 1,
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
