import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { ChatClient, ChatMessage } from 'react-native-chat-sdk';
import { styleValues } from '../__internal__/Css';
import {
  LeafScreenBase,
  StateBase,
  StatelessBase,
} from '../__internal__/LeafScreenBase';
import { metaDataList, MN } from './ContactManagerData';
import type { ApiParams } from '../__internal__/DataTypes';

export interface StateChatContact extends StateBase {
  addContact: {
    username: string;
    reason: string;
  };
  deleteContact: {
    username: string;
    keepConversation: boolean;
  };
  getAllContactsFromServer: {};
  getAllContactsFromDB: {};
  addUserToBlockList: {
    username: string;
  };
  removeUserFromBlockList: {
    username: string;
  };
  getBlockListFromServer: {};
  getBlockListFromDB: {};
  acceptInvitation: {
    username: string;
  };
  declineInvitation: {
    username: string;
  };
  getSelfIdsOnOtherPlatform: {};
}

export interface StatelessChatContact extends StatelessBase {}

let formatData: any = {};
for (let key of metaDataList.keys()) {
  let eachMethodParams: any = {};
  metaDataList.get(key)?.params.forEach((item) => {
    eachMethodParams[item.paramName] = item.paramDefaultValue;
  });
  formatData[key] = eachMethodParams;
}

const stateDataValue: StateChatContact = Object.assign({}, formatData, {
  sendResult: '',
  recvResult: '',
  exceptResult: '',
});

const statelessDataValue: StatelessChatContact = {};

export class ContactLeafScreen extends LeafScreenBase<StateChatContact> {
  protected static TAG = 'ContactLeafScreen';
  public static route = 'ContactLeafScreen';
  metaData: Map<string, ApiParams>;
  statelessData: StatelessChatContact;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaData = metaDataList;
    this.state = stateDataValue;
    this.statelessData = statelessDataValue;
  }

  protected addListener?(): void {
    console.log(`${ContactLeafScreen.TAG}: addListener`);
  }

  protected removeListener?(): void {
    console.log(`${ContactLeafScreen.TAG}: removeListener`);
  }

  protected renderResult(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderSendResult()}
        {this.renderRecvResult()}
        {this.renderExceptionResult()}
      </View>
    );
  }

  protected renderBody(): ReactNode {
    console.log(`${ContactLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>{this.renderApiDom()}</View>
    );
  }
  protected renderApiDom(): ReactNode[] {
    const apiList = [
      'addContact',
      'deleteContact',
      'getAllContactsFromServer',
      'getAllContactsFromDB',
      'addUserToBlockList',
      'removeUserFromBlockList',
      'getBlockListFromServer',
      'getBlockListFromDB',
      'acceptInvitation',
      'declineInvitation',
      'getSelfIdsOnOtherPlatform',
    ];
    let renderDomAry: ({} | null | undefined)[] = [];
    const data = this.metaData;
    apiList.forEach((apiItem) => {
      this.setKeyPrefix(apiItem);
      renderDomAry.push(
        this.renderParamWithText(data.get(apiItem)!.methodName)
      );
      data.get(apiItem)?.params.forEach((item) => {
        let currentData = data.get(apiItem);
        let itemValue =
          // eslint-disable-next-line no-undef
          this.state[apiItem as keyof typeof this.state][
            item.paramName as keyof typeof currentData
          ];
        if (item.domType && item.domType === 'select') {
          if (item.paramType === 'boolean') {
            renderDomAry.push(
              this.renderParamWithEnum(
                item.paramName,
                ['true', 'false'],
                itemValue ? 'true' : 'false',
                (index: string, option: any) => {
                  let inputData = option === 'true' ? true : false;
                  let pv: any = {};
                  pv[apiItem] = Object.assign(
                    {},
                    // eslint-disable-next-line no-undef
                    this.state[apiItem as keyof typeof this.state],
                    inputData
                  );
                  return this.setState(pv);
                }
              )
            );
          }
        } else {
          let value =
            item.paramType === 'object' ? JSON.stringify(itemValue) : itemValue;
          if (item.paramValue) {
            value = JSON.stringify({ key: 'value' });
            const v = item.paramValue();
            if (v instanceof ChatMessage) {
              value = JSON.stringify(v);
            }
          }
          renderDomAry.push(
            this.renderGroupParamWithInput(
              item.paramName,
              item.paramType,
              value,
              (inputData: { [index: string]: string }) => {
                let pv: any = {};
                pv[apiItem] = Object.assign(
                  {},
                  // eslint-disable-next-line no-undef
                  this.state[apiItem as keyof typeof this.state],
                  inputData
                );
                return this.setState(pv);
              }
            )
          );
        }
      });
      renderDomAry.push(
        this.renderButton(data.get(apiItem)!.methodName, () => {
          this.callApi(data.get(apiItem)!.methodName);
        })
      );
      renderDomAry.push(this.renderDivider());
    });
    renderDomAry.push(this.addSpaces());
    return renderDomAry;
  }

  private callApi(name: string): void {
    console.log(`${ContactLeafScreen.TAG}: callApi: `);
    switch (name) {
      case MN.addContact:
        {
          const { username, reason } = this.state.addContact;
          this.tryCatch(
            ChatClient.getInstance().contactManager.addContact(
              username,
              reason
            ),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.deleteContact:
        {
          const { username, keepConversation } = this.state.deleteContact;
          this.tryCatch(
            ChatClient.getInstance().contactManager.deleteContact(
              username,
              keepConversation
            ),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.getAllContactsFromServer:
        {
          const {} = this.state.getAllContactsFromServer;
          this.tryCatch(
            ChatClient.getInstance().contactManager.getAllContactsFromServer(),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.getAllContactsFromDB:
        {
          const {} = this.state.getAllContactsFromDB;
          this.tryCatch(
            ChatClient.getInstance().contactManager.getAllContactsFromDB(),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.addUserToBlockList:
        {
          const { username } = this.state.addUserToBlockList;
          this.tryCatch(
            ChatClient.getInstance().contactManager.addUserToBlockList(
              username
            ),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.removeUserFromBlockList:
        {
          const { username } = this.state.removeUserFromBlockList;
          this.tryCatch(
            ChatClient.getInstance().contactManager.removeUserFromBlockList(
              username
            ),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.getBlockListFromServer:
        {
          const {} = this.state.getBlockListFromServer;
          this.tryCatch(
            ChatClient.getInstance().contactManager.getBlockListFromServer(),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.getBlockListFromDB:
        {
          const {} = this.state.getBlockListFromDB;
          this.tryCatch(
            ChatClient.getInstance().contactManager.getBlockListFromDB(),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.acceptInvitation:
        {
          const { username } = this.state.acceptInvitation;
          this.tryCatch(
            ChatClient.getInstance().contactManager.acceptInvitation(username),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.declineInvitation:
        {
          const { username } = this.state.declineInvitation;
          this.tryCatch(
            ChatClient.getInstance().contactManager.declineInvitation(username),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      case MN.getSelfIdsOnOtherPlatform:
        {
          const {} = this.state.getSelfIdsOnOtherPlatform;
          this.tryCatch(
            ChatClient.getInstance().contactManager.getSelfIdsOnOtherPlatform(),
            ContactLeafScreen.TAG,
            name
          );
        }
        break;
      default:
        break;
    }
  }
}
