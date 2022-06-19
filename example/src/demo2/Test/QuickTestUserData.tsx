import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';

export const MN = {
  updateOwnUserInfo: 'updateOwnUserInfo',
  fetchUserInfoById: 'fetchUserInfoById',
  fetchOwnInfo: 'fetchOwnInfo',
  clearUserInfo: 'clearUserInfo',
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
          domType: 'input',
        },
        {
          paramName: 'avatarUrl',
          paramType: 'string',
          paramDefaultValue: '',
          domType: 'input',
        },
        {
          paramName: 'mail',
          paramType: 'string',
          paramDefaultValue: 'xxx@hotmail.com',
          domType: 'input',
        },
        {
          paramName: 'phone',
          paramType: 'string',
          paramDefaultValue: '134 8888 9999',
          domType: 'input',
        },
        {
          paramName: 'gender',
          paramType: 'number',
          paramDefaultValue: 0,
          domType: 'input',
        },
        {
          paramName: 'sign',
          paramType: 'string',
          paramDefaultValue: 'I am teacher',
          domType: 'input',
        },
        {
          paramName: 'birth',
          paramType: 'string',
          paramDefaultValue: '2020.09.01',
          domType: 'input',
        },
        {
          paramName: 'ext',
          paramType: 'string',
          paramDefaultValue: JSON.stringify({ key: 'value' }),
          domType: 'input',
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
          paramType: 'json',
          paramDefaultValue: [datasheet.accounts[0].id],
          domType: 'input',
        },
        {
          paramName: 'expireTime',
          paramType: 'number',
          paramDefaultValue: 0,
          domType: 'input',
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
          domType: 'input',
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
