import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { styleValues } from '../__internal__/Css';
import { LeafScreenBase, StateBase } from '../__internal__/LeafScreenBase';
import { metaData, GROUPMN, stateData } from './GroupManagerData';
import type { ApiParams } from '../__internal__/DataTypes';
import type { ChatGroupOptions } from '../../../../src/common/ChatGroup';
import { ChatClient } from 'react-native-chat-sdk';
export interface StateGroupMessage extends StateBase {
  createGroup: {
    groupName: string;
    desc: string;
    inviteMembers: string[];
    inviteReason: string;
    options: ChatGroupOptions;
  };
  addMembers: {
    groupId: string;
    members: Array<string>;
    welcome?: string;
  };
}
export class GroupManagerLeafScreen extends LeafScreenBase<StateGroupMessage> {
  protected static TAG = 'GroupManagerLeafScreen';
  public static route = 'GroupManagerLeafScreen';
  metaData: Map<string, ApiParams>;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaData = metaData;
    this.state = stateData;
  }
  protected renderBody(): ReactNode {
    console.log(`${GroupManagerLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>
        {this.createGroup()}
        {this.addMembers()}
      </View>
    );
  }
  protected createGroup(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('createGroup')!.methodName));
    data.get('createGroup')?.params.forEach((item) => {
      // "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
      let value =
        item.paramType === 'object'
          ? JSON.stringify(item.paramDefaultValue)
          : item.paramDefaultValue;
      domAry.push(
        this.renderGroupParamWithInput(
          item.paramName,
          item.paramType,
          value,
          (inputData: { [index: string]: string }) => {
            this.setState({
              createGroup: Object.assign(this.state.createGroup, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('createGroup')!.methodName, () => {
        this.callApi(data.get('createGroup')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }

  protected addMembers(): ReactNode[] {
    const data = this.metaData;
    let domAry = [];
    domAry.push(this.renderParamWithText(data.get('addMembers')!.methodName));
    data.get('addMembers')?.params.forEach((item) => {
      let value =
        item.paramType === 'object'
          ? JSON.stringify(item.paramDefaultValue)
          : item.paramDefaultValue;
      domAry.push(
        this.renderGroupParamWithInput(
          item.paramName,
          item.paramType,
          value,
          (inputData: { [index: string]: string }) => {
            this.setState({
              createGroup: Object.assign(this.state.createGroup, inputData),
            });
          }
        )
      );
    });
    domAry.push(
      this.renderButton(data.get('addMembers')!.methodName, () => {
        this.callApi(data.get('addMembers')!.methodName);
      })
    );
    domAry.push(this.renderDivider());
    return domAry;
  }

  private callApi(name: string): void {
    console.log(`${GroupManagerLeafScreen.TAG}: callApi: `);
    switch (name) {
      case GROUPMN.createGroup: {
        const { groupName, desc, inviteMembers, inviteReason, options } =
          this.state.createGroup;
        this.tryCatch(
          ChatClient.getInstance().groupManager.createGroup(
            options,
            groupName,
            desc,
            inviteMembers,
            inviteReason
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.createGroup'
        );
        break;
      }
      case GROUPMN.addMembers: {
        const { groupId, members, welcome } = this.state.addMembers;
        this.tryCatch(
          ChatClient.getInstance().groupManager.addMembers(
            groupId,
            members,
            welcome
          ),
          GroupManagerLeafScreen.TAG,
          'GROUPMN.createGroup'
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
