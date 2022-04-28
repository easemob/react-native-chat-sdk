import type { StateGroupMessage } from './GroupManagerItem';
import type { ApiParams } from '../__internal__/DataTypes';

export const GROUPMN = {
  createGroup: 'createGroup',
  addMembers: 'addMembers',
  inviterUser: 'inviterUser',
};

export const metaData = new Map<string, ApiParams>([
  [
    GROUPMN.createGroup,
    {
      methodName: GROUPMN.createGroup,
      params: [
        {
          paramName: 'groupName',
          paramType: 'string',
          paramDefaultValue: 'WY-group',
        },
        {
          paramName: 'desc',
          paramType: 'string',
          paramDefaultValue: 'a test group',
        },
        {
          paramName: 'inviteMembers',
          paramType: 'object',
          paramDefaultValue: [],
        },
        {
          paramName: 'inviteReason',
          paramType: 'string',
          paramDefaultValue: 'Join the group',
        },
        {
          paramName: 'options',
          paramType: 'object',
          paramDefaultValue: {
            inviteNeedConfirm: false,
            extField: {},
          },
        },
      ],
    },
  ],
  [
    GROUPMN.addMembers,
    {
      methodName: GROUPMN.addMembers,
      params: [
        {
          paramName: 'groupId',
          paramType: 'string',
          paramDefaultValue: '179992358092801',
        },
        {
          paramName: 'members',
          paramType: 'object',
          paramDefaultValue: ['asterisk001'],
        },
        {
          paramName: 'welcome',
          paramType: 'string',
          paramDefaultValue: 'welcome!',
        },
      ],
    },
  ],
]);

let formatData: any = {};
for (let key of metaData.keys()) {
  let eachMethodParams: any = {};
  metaData.get(key)?.params.forEach((item) => {
    eachMethodParams[item.paramName] = item.paramDefaultValue;
  });
  formatData[key] = eachMethodParams;
}
export const stateData: StateGroupMessage = Object.assign({}, formatData, {
  sendResult: '',
  recvResult: '',
  exceptResult: '',
});
//   export const stateData: StateGroupMessage = {
//   createGroup: {
//     groupName:
//       metaData.get(GROUPMN.createGroup)?.params[0].paramValue ??
//       metaData[0].params[0].paramDefaultValue,
//     desc:
//       metaData[0].params[1].paramValue ??
//       metaData[0].params[1].paramDefaultValue,
//     inviteMembers:
//       metaData[0].params[2].paramValue ??
//       metaData[0].params[2].paramDefaultValue,
//     inviteReason:
//       metaData[0].params[3].paramValue ??
//       metaData[0].params[3].paramDefaultValue,
//     options:
//       metaData[0].params[4].paramValue ??
//       metaData[0].params[4].paramDefaultValue,
//   },
//   sendResult: '',
//   recvResult: '',
//   exceptResult: '',
// };
