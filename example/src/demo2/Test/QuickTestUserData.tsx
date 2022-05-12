import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';

const updateOwnUserInfo = 'updateOwnUserInfo';
const fetchUserInfoById = 'fetchUserInfoById';
const fetchOwnInfo = 'fetchOwnInfo';
const clearUserInfo = 'clearUserInfo';

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
          paramName: 'nickName',
          paramType: 'string',
          paramDefaultValue: 'foo',
        },
        {
          paramName: 'avatarUrl',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'mail',
          paramType: 'string',
          paramDefaultValue: 'xxx@hotmail.com',
        },
        {
          paramName: 'phone',
          paramType: 'string',
          paramDefaultValue: '134 8888 9999',
        },
        {
          paramName: 'gender',
          paramType: 'number',
          paramDefaultValue: 0,
        },
        {
          paramName: 'sign',
          paramType: 'string',
          paramDefaultValue: 'I am teacher',
        },
        {
          paramName: 'birth',
          paramType: 'string',
          paramDefaultValue: '2020.09.01',
        },
        {
          paramName: 'ext',
          paramType: 'string',
          paramDefaultValue: JSON.stringify({ key: 'value' }),
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
          paramDefaultValue: [datasheet.accounts[0].id],
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
