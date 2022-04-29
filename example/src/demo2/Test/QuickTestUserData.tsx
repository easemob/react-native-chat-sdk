import { ChatUserInfo } from 'react-native-chat-sdk';
import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';

const updateOwnUserInfo = 'updateOwnUserInfo';
const fetchUserInfoById = 'fetchUserInfoById';
const fetchOwnInfo = 'fetchOwnInfo';
const clearUserInfo = 'clearUserInfo';

/**
 * 本地使用不导出
 */
export const MN = {
  updateOwnUserInfo,
  fetchUserInfoById,
  fetchOwnInfo,
  clearUserInfo,
};

export const metaDataList = new Map<string, ApiParams>([
  [
    MN.updateOwnUserInfo,
    {
      methodName: MN.updateOwnUserInfo,
      params: [
        {
          paramName: 'userInfo',
          paramType: 'object',
          paramDefaultValue: new ChatUserInfo({
            userId: datasheet.accounts[0].id,
            phone: '13426223214',
            expireTime: Date.now(),
          }),
        },
      ],
    },
  ],
  [
    MN.fetchUserInfoById,
    {
      methodName: MN.fetchUserInfoById,
      params: [
        {
          paramName: 'userIds',
          paramType: 'object',
          paramDefaultValue: [datasheet.accounts[2].id],
        },
        {
          paramName: 'expireTime',
          paramType: 'number',
          paramDefaultValue: 0,
        },
      ],
    },
  ],
  [
    MN.fetchOwnInfo,
    {
      methodName: MN.fetchOwnInfo,
      params: [
        {
          paramName: 'expireTime',
          paramType: 'number',
          paramDefaultValue: 0,
        },
      ],
    },
  ],
  [
    MN.clearUserInfo,
    {
      methodName: MN.clearUserInfo,
      params: [],
    },
  ],
]);
