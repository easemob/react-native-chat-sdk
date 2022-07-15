import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { styleValues } from '../__internal__/Css';
import { LeafScreenBase, StateBase } from '../__internal__/LeafScreenBase';
import { metaDataList, MN } from './ChatUserInfoManagerData';
import type { ApiParams } from '../__internal__/DataTypes';
import { ChatClient } from 'react-native-chat-sdk';
import { generateData } from '../__internal__/Utils';
export interface StateChatUserInfoMessage extends StateBase {
  fetchOwnInfo: {};
  fetchUserInfoById: {
    userIds: Array<string>;
  };
  updateOwnUserInfo: {
    userInfo: object;
  };
}
export class ChatUserInfoManagerLeafScreen extends LeafScreenBase<StateChatUserInfoMessage> {
  protected static TAG = 'ChatUserInfoManagerLeafScreen';
  public static route = 'ChatUserInfoManagerLeafScreen';
  metaDataList: Map<string, ApiParams>;
  state: StateChatUserInfoMessage;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaDataList = metaDataList;
    this.state = Object.assign({}, generateData(metaDataList), {
      sendResult: '',
      recvResult: '',
      exceptResult: '',
    });
  }
  protected renderBody(): ReactNode {
    // console.log(`${ChatUserInfoManagerLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>{this.renderApiDom()}</View>
    );
  }
  protected renderApiDom(): ReactNode[] {
    const apiList = ['updateOwnUserInfo', 'fetchUserInfoById', 'fetchOwnInfo'];
    let renderDomAry: ({} | null | undefined)[] = [];
    const data = this.metaDataList;
    apiList.forEach((apiItem) => {
      this.setKeyPrefix(apiItem);
      renderDomAry.push(
        this.renderParamWithText(data.get(apiItem)!.methodName)
      );
      data.get(apiItem)?.params.forEach((item) => {
        let currentData = data.get(apiItem);
        let itemValue =
          this.state[apiItem as keyof typeof this.state][
            item.paramName as keyof typeof currentData
          ];
        if (item.domType === 'input') {
          let value = this.parseValue(item.paramType, itemValue);
          renderDomAry.push(
            this.renderGroupParamWithInput(
              item.paramName,
              item.paramType,
              value,
              (inputData: { [index: string]: string }) => {
                let paramValue: any = {};
                paramValue[apiItem] = Object.assign(
                  {},
                  this.state[apiItem as keyof typeof this.state],
                  inputData
                );
                return this.setState(paramValue);
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
    console.log(`${ChatUserInfoManagerLeafScreen.TAG}: callApi: `);
    switch (name) {
      case MN.fetchOwnInfo: {
        this.tryCatch(
          ChatClient.getInstance().userManager.fetchOwnInfo(),
          ChatUserInfoManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.fetchUserInfoById: {
        const { userIds } = this.state.fetchUserInfoById;
        this.tryCatch(
          ChatClient.getInstance().userManager.fetchUserInfoById(userIds),
          ChatUserInfoManagerLeafScreen.TAG,
          name
        );
        break;
      }
      case MN.updateOwnUserInfo: {
        const { userInfo } = this.state.updateOwnUserInfo;
        this.tryCatch(
          ChatClient.getInstance().userManager.updateOwnUserInfo(userInfo),
          ChatUserInfoManagerLeafScreen.TAG,
          name
        );
        break;
      }
      default:
        console.log('error name');
        break;
    }
  }
  protected renderResult(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderSendResult()}
        {this.renderRecvResult()}
      </View>
    );
  }
  protected addListener?(): void {
    console.log('addListener');
  }

  protected removeListener?(): void {
    console.log('addListener');
  }
}
