import React, { Component, type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ChatClient } from 'react-native-agora-chat';

import { styleValues } from '../__internal__/Css';
import { Button } from '../__internal__/Button';

interface State {
  result: string;
  options: any;
  sdkVersion: string;
  currentUserName: string;
  rnSdkVersion: string;
  isConnected: boolean;
  isLoginBefore: boolean;
  token: string;
}

export class GetStateScreen extends Component<{ navigation: any }, State, any> {
  public static route = 'GetStateScreen';
  private static TAG = 'GetStateScreen';
  navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      result: '...',
      options: {},
      sdkVersion: 'asteriskhx1',
      currentUserName: 'qwer',
      rnSdkVersion: '',
      isConnected: false,
      isLoginBefore: false,
      token: '',
    };
  }

  componentDidMount?(): void {
    console.log(`${GetStateScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount?(): void {
    console.log(`${GetStateScreen.TAG}: componentWillUnmount: `);
  }

  private getOptions(): void {
    console.log(`${GetStateScreen.TAG}: getOptions: `);
    let opt = ChatClient.getInstance().options;
    if (opt) {
      let s = JSON.stringify(opt);
      this.setState({ result: s, options: opt });
    } else {
      this.setState({ result: '' });
    }
  }

  // private getsdkVersion(): void {
  //   console.log(`${GetStateScreen.TAG}: getsdkVersion: `);
  // }

  private getcurrentUserName(): void {
    console.log(`${GetStateScreen.TAG}: getcurrentUserName: `);
    ChatClient.getInstance()
      .getCurrentUsername()
      .then((value: string | undefined) => {
        console.log('GetStateScreen: getcurrentUserName: success', value);
        this.setState({
          result: `getcurrentUserName: success` + value,
          currentUserName: value!,
        });
      })
      .catch((reason: any) => {
        console.log('GetStateScreen: getcurrentUserName: fail', reason);
        this.setState({
          result: `getcurrentUserName: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  // private rnSdkVersion(): void {
  //   console.log(`${GetStateScreen.TAG}: rnSdkVersion: `);
  //   // let r = ChatClient.getInstance().rnSdkVersion;
  //   // this.setState({ result: r, rnSdkVersion: r });
  // }

  private isConnected(): void {
    console.log(`${GetStateScreen.TAG}: isConnected: `);
    ChatClient.getInstance()
      .isConnected()
      .then((value: boolean) => {
        console.log('GetStateScreen: isConnected: success', value);
        this.setState({
          result: `isConnected: success ` + value ? 'true' : 'false',
          isConnected: value,
        });
      })
      .catch((reason: any) => {
        console.log('GetStateScreen: isConnected: fail', reason);
        this.setState({
          result: `isConnected: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  private isLoginBefore(): void {
    console.log(`${GetStateScreen.TAG}: isLoginBefore: `);
    ChatClient.getInstance()
      .isLoginBefore()
      .then((value: boolean) => {
        console.log('GetStateScreen: isLoginBefore: success', value);
        this.setState({
          result: `isLoginBefore: success ` + value ? 'true' : 'false',
          isLoginBefore: value,
        });
      })
      .catch((reason: any) => {
        console.log('GetStateScreen: isLoginBefore: fail', reason);
        this.setState({
          result: `isLoginBefore: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  private getToken(): void {
    console.log(`${GetStateScreen.TAG}: getToken: `);
    ChatClient.getInstance()
      .getAccessToken()
      .then((value: string) => {
        console.log('GetStateScreen: getToken: success', value);
        this.setState({
          result: `getToken: success ` + value,
          token: value,
        });
      })
      .catch((reason: any) => {
        console.log('GetStateScreen: getToken: fail', reason);
        this.setState({
          result: `getToken: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  render(): ReactNode {
    const { result } = this.state;
    return (
      <ScrollView>
        <View style={styleValues.containerColumn}>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>options: </Text>
            <Button
              title="options"
              onPress={() => {
                this.getOptions();
              }}
            />
          </View>
          {/* <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>sdkVersion: </Text>
            <Button
              title="sdkVersion"
              onPress={() => {
                this.getsdkVersion();
              }}
            >
              sdkVersion
            </Button>
          </View> */}
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>currentUserName: </Text>
            <Button
              title="currentUserName"
              onPress={() => {
                this.getcurrentUserName();
              }}
            />
          </View>
          {/* <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>rnSdkVersion: </Text>
            <Button
              title="rnSdkVersion"
              onPress={() => {
                this.rnSdkVersion();
              }}
            >
              rnSdkVersion
            </Button>
          </View> */}
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>isConnected: </Text>
            <Button
              title="isConnected"
              onPress={() => {
                this.isConnected();
              }}
            />
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>isLoginBefore: </Text>
            <Button
              title="isLoginBefore"
              onPress={() => {
                this.isLoginBefore();
              }}
            />
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>token: </Text>
            <Button
              title="token"
              onPress={() => {
                this.getToken();
              }}
            />
          </View>
          <View style={styleValues.containerColumn}>
            <Text style={styleValues.textTipStyle}>result: {result}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
