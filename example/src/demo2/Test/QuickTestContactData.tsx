import { datasheet } from '../__default__/Datasheet';
import type { ApiParams } from '../__internal__/DataTypes';

const addContact = 'addContact';
const deleteContact = 'deleteContact';
const getAllContactsFromServer = 'getAllContactsFromServer';
const getAllContactsFromDB = 'getAllContactsFromDB';
const addUserToBlockList = 'addUserToBlockList';
const removeUserFromBlockList = 'removeUserFromBlockList';
const getBlockListFromServer = 'getBlockListFromServer';
const getBlockListFromDB = 'getBlockListFromDB';
const acceptInvitation = 'acceptInvitation';
const declineInvitation = 'declineInvitation';
const getSelfIdsOnOtherPlatform = 'getSelfIdsOnOtherPlatform';
/**
 * 本地使用不导出
 */
export const MN = {
  addContact,
  deleteContact,
  getAllContactsFromServer,
  getAllContactsFromDB,
  addUserToBlockList,
  removeUserFromBlockList,
  getBlockListFromServer,
  getBlockListFromDB,
  acceptInvitation,
  declineInvitation,
  getSelfIdsOnOtherPlatform,
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
          paramDefaultValue: datasheet.accounts[2].id,
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
          paramDefaultValue: datasheet.accounts[1].id,
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
          paramDefaultValue: datasheet.accounts[1].id,
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
          paramDefaultValue: datasheet.accounts[1].id,
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
          paramDefaultValue: datasheet.accounts[1].id,
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
          paramDefaultValue: datasheet.accounts[1].id,
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
          paramDefaultValue: datasheet.accounts[1].id,
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
]);
