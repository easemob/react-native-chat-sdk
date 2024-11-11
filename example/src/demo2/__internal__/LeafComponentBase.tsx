import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { styleValues } from './Css';

export interface StateBase {
  sendResult: string;
  recvResult: string;
}

export abstract class LeafComponentBaseScreen<
  S extends StateBase
> extends React.Component<{ navigation: any }, S> {
  protected static TAG = 'LeafComponentBaseScreen';
  protected navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
  }

  protected tryCatch(
    promise: Promise<any>,
    tag: string,
    name: string,
    accept?: (value: any) => void,
    reject?: (reason: any) => void
  ): void {
    promise
      .then((value: any) => {
        let result;
        if (value !== undefined && value instanceof Object) {
          result = JSON.stringify(value);
        } else {
          result = 'none';
        }
        console.log(`${tag}: ${name}: success: `, result);
        this.setState({ sendResult: 'success: ' + result });
        if (accept) {
          accept(value);
        }
      })
      .catch((reason: any) => {
        console.log(`${tag}: ${name}: fail: `, reason);
        this.setState({ sendResult: 'fail: ' + reason });
        if (reject) {
          reject(reason);
        }
      });
  }

  componentDidMount(): void {
    console.log(`${LeafComponentBaseScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount(): void {
    console.log(`${LeafComponentBaseScreen.TAG}: componentWillUnmount: `);
  }

  protected renderResult(): ReactNode[] {
    const { sendResult, recvResult } = this.state;
    return [
      <View key="sendResult" style={styleValues.containerRow}>
        <Text style={styleValues.textTipStyle}>send_result: {sendResult}</Text>
      </View>,
      <View key="recvResult" style={styleValues.containerRow}>
        <Text style={styleValues.textTipStyle}>recv_result: {recvResult}</Text>
      </View>,
    ];
  }

  render(): ReactNode {
    throw new Error('Please sub class implement.');
  }
}
