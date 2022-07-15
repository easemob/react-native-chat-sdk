import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { ChatClient } from 'react-native-chat-sdk';
import { styleValues } from '../__internal__/Css';
import {
  LeafScreenBase,
  StateBase,
  StatelessBase,
} from '../__internal__/LeafScreenBase';
import { metaDataList, MN } from './PresenceManagerData';
import type { ApiParams } from '../__internal__/DataTypes';
import { generateData } from '../__internal__/Utils';

export interface StateChatPresence extends StateBase {
  publishPresence: {
    description: string;
  };
  presenceSubscribe: {
    members: string[];
    expiry: number;
  };
  presenceUnsubscribe: {
    members: string[];
  };
  fetchSubscribedMembersWithPageNum: {
    pageNum: number;
    pageSize: number;
  };
  fetchPresenceStatus: {
    members: string[];
  };
}

export interface StatelessChatPresence extends StatelessBase {}

const statelessDataValue: StatelessChatPresence = {};

export class PresenceLeafScreen extends LeafScreenBase<StateChatPresence> {
  protected static TAG = 'PresenceLeafScreen';
  public static route = 'PresenceLeafScreen';
  metaData: Map<string, ApiParams>;
  statelessData: StatelessChatPresence;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaData = metaDataList;
    this.state = Object.assign({}, generateData(metaDataList), {
      sendResult: '',
      cbResult: '',
      recvResult: '',
      exceptResult: '',
    });
    this.statelessData = statelessDataValue;
  }

  protected addListener?(): void {
    console.log(`${PresenceLeafScreen.TAG}: addListener`);
  }

  protected removeListener?(): void {
    console.log(`${PresenceLeafScreen.TAG}: removeListener`);
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
    // console.log(`${PresenceLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>{this.renderApiDom()}</View>
    );
  }
  protected renderApiDom(): ReactNode[] {
    const apiList = [
      'publishPresence',
      'presenceSubscribe',
      'presenceUnsubscribe',
      'fetchSubscribedMembersWithPageNum',
      'fetchPresenceStatus',
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
                    this.state[apiItem as keyof typeof this.state],
                    inputData
                  );
                  return this.setState(pv);
                }
              )
            );
          }
        } else {
          let value = this.parseValue(item.paramType, itemValue);
          renderDomAry.push(
            this.renderGroupParamWithInput(
              item.paramName,
              item.paramType,
              value,
              (inputData: { [index: string]: string }) => {
                let pv: any = {};
                pv[apiItem] = Object.assign(
                  {},
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
    console.log(`${PresenceLeafScreen.TAG}: callApi: `);
    if (name === MN.publishPresence) {
      const { description } = this.state.publishPresence;
      this.tryCatch(
        ChatClient.getInstance().presenceManager.publishPresence(description),
        PresenceLeafScreen.TAG,
        name
      );
    } else if (name === MN.presenceSubscribe) {
      const { members, expiry } = this.state.presenceSubscribe;
      this.tryCatch(
        ChatClient.getInstance().presenceManager.subscribe(members, expiry),
        PresenceLeafScreen.TAG,
        name
      );
    } else if (name === MN.presenceUnsubscribe) {
      const { members } = this.state.presenceUnsubscribe;
      this.tryCatch(
        ChatClient.getInstance().presenceManager.unSubscribe(members),
        PresenceLeafScreen.TAG,
        name
      );
    } else if (name === MN.fetchSubscribedMembersWithPageNum) {
      const { pageNum, pageSize } =
        this.state.fetchSubscribedMembersWithPageNum;
      this.tryCatch(
        ChatClient.getInstance().presenceManager.fetchSubscribedMembers(
          pageNum,
          pageSize
        ),
        PresenceLeafScreen.TAG,
        name
      );
    } else if (name === MN.fetchPresenceStatus) {
      const { members } = this.state.fetchPresenceStatus;
      this.tryCatch(
        ChatClient.getInstance().presenceManager.fetchPresenceStatus(members),
        PresenceLeafScreen.TAG,
        name
      );
    }
  }
}
