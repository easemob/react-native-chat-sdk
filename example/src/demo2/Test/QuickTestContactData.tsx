import { ChatContact } from 'react-native-agora-chat';

import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';

export const MN = {
  addContact: 'addContact',
  deleteContact: 'deleteContact',
  getAllContactsFromServer: 'getAllContactsFromServer',
  getAllContactsFromDB: 'getAllContactsFromDB',
  addUserToBlockList: 'addUserToBlockList',
  removeUserFromBlockList: 'removeUserFromBlockList',
  getBlockListFromServer: 'getBlockListFromServer',
  getBlockListFromDB: 'getBlockListFromDB',
  acceptInvitation: 'acceptInvitation',
  declineInvitation: 'declineInvitation',
  getSelfIdsOnOtherPlatform: 'getSelfIdsOnOtherPlatform',
  getAllContacts: 'getAllContacts',
  setContactRemark: 'setContactRemark',
  getContact: 'getContact',
  fetchAllContacts: 'fetchAllContacts',
  fetchContacts: 'fetchContacts',
};

export const metaDataList = new Map<string, ApiParams>([
  [
    MN.addContact,
    {
      methodName: MN.addContact,
      params: [
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[1]!.id,
        },
        {
          paramName: 'reason',
          paramType: 'string',
          paramDefaultValue: 'test',
        },
      ],
    },
  ],
  [
    MN.deleteContact,
    {
      methodName: MN.deleteContact,
      params: [
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[1]!.id,
        },
        {
          paramName: 'keepConversation',
          paramType: 'boolean',
          paramDefaultValue: false,
        },
      ],
    },
  ],
  [
    MN.getAllContactsFromServer,
    {
      methodName: MN.getAllContactsFromServer,
      params: [],
    },
  ],
  [
    MN.getAllContactsFromDB,
    {
      methodName: MN.getAllContactsFromDB,
      params: [],
    },
  ],
  [
    MN.addUserToBlockList,
    {
      methodName: MN.addUserToBlockList,
      params: [
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[1]!.id,
        },
      ],
    },
  ],
  [
    MN.removeUserFromBlockList,
    {
      methodName: MN.removeUserFromBlockList,
      params: [
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[1]!.id,
        },
      ],
    },
  ],
  [
    MN.getBlockListFromServer,
    {
      methodName: MN.getBlockListFromServer,
      params: [
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[1]!.id,
        },
      ],
    },
  ],
  [
    MN.getBlockListFromDB,
    {
      methodName: MN.getBlockListFromDB,
      params: [],
    },
  ],
  [
    MN.acceptInvitation,
    {
      methodName: MN.acceptInvitation,
      params: [
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[1]!.id,
        },
      ],
    },
  ],
  [
    MN.declineInvitation,
    {
      methodName: MN.declineInvitation,
      params: [
        {
          paramName: 'username',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[1]!.id,
        },
      ],
    },
  ],
  [
    MN.getSelfIdsOnOtherPlatform,
    {
      methodName: MN.getSelfIdsOnOtherPlatform,
      params: [],
    },
  ],
  [
    MN.getAllContacts,
    {
      methodName: MN.getAllContacts,
      params: [],
    },
  ],
  [
    MN.setContactRemark,
    {
      methodName: MN.setContactRemark,
      params: [
        {
          paramName: 'contact',
          paramType: 'json',
          paramDefaultValue: new ChatContact({
            userId: datasheet.accounts[1]!.id,
            remark: 'yy',
          }),
        },
      ],
    },
  ],
  [
    MN.getContact,
    {
      methodName: MN.getContact,
      params: [
        {
          paramName: 'userId',
          paramType: 'string',
          paramDefaultValue: datasheet.accounts[1]!.id,
        },
      ],
    },
  ],
  [
    MN.fetchAllContacts,
    {
      methodName: MN.fetchAllContacts,
      params: [],
    },
  ],
  [
    MN.fetchContacts,
    {
      methodName: MN.fetchContacts,
      params: [
        {
          paramName: 'cursor',
          paramType: 'string',
          paramDefaultValue: '',
        },
        {
          paramName: 'pageSize',
          paramType: 'number',
          paramDefaultValue: 20,
        },
      ],
    },
  ],
]);
