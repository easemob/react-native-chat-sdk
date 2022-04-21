import React, { Component, ReactNode } from 'react';
import { View, Button, Text, TextInput, ScrollView } from 'react-native';
import { ChatClient } from 'react-native-chat-sdk';
import { styleValues } from '../__internal__/Css';

interface State {
  result: string;
  newAppKey: string;
  username: string;
  password: string;
  agoraToken: string;
  devices: string;
}

export class ClientOthersScreen extends Component<
  { navigation: any },
  State,
  any
> {
  public static route = 'ClientOthersScreen';
  private static TAG = 'ClientOthersScreen';
  navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      result: '',
      agoraToken: '',
      newAppKey: '',
      username: 'asteriskhx1',
      password: 'qwer',
      devices: '',
    };
  }

  private renewAgoraToken(): void {
    ChatClient.getInstance()
      .renewAgoraToken(this.state.agoraToken)
      .then(() => {
        console.log('ClientOthersScreen: renewAgoraToken: success');
        this.setState({ result: `renewAgoraToken: success` });
      })
      .catch((reason: any) => {
        console.log('ClientOthersScreen: renewAgoraToken: fail');
        this.setState({
          result: `renewAgoraToken: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  private changeAppKey(): void {
    ChatClient.getInstance()
      .changeAppKey(this.state.newAppKey)
      .then(() => {
        console.log(`${ClientOthersScreen.TAG}: changeAppKey: success`);
        this.setState({ result: `changeAppKey: success` });
      })
      .catch((reason: any) => {
        console.log(`${ClientOthersScreen.TAG}: changeAppKey: fail`);
        this.setState({
          result: `changeAppKey: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  private compressLogs(): void {
    ChatClient.getInstance()
      .compressLogs()
      .then((value: any) => {
        console.log(`${ClientOthersScreen.TAG}: compressLogs: success`, value);
        this.setState({ result: `compressLogs: success` + value });
      })
      .catch((reason: any) => {
        console.log(`${ClientOthersScreen.TAG}: compressLogs: fail`);
        this.setState({
          result: `compressLogs: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  private getLoggedInDevicesFromServer(): void {
    ChatClient.getInstance()
      .getLoggedInDevicesFromServer(this.state.username, this.state.password)
      .then((value: any) => {
        console.log(
          `${ClientOthersScreen.TAG}: getLoggedInDevicesFromServer: success`,
          value
        );
        this.setState({
          result: `getLoggedInDevicesFromServer: success` + value,
          devices: JSON.stringify(value),
        });
      })
      .catch((reason: any) => {
        console.log(
          `${ClientOthersScreen.TAG}: getLoggedInDevicesFromServer: fail`
        );
        this.setState({
          result: `getLoggedInDevicesFromServer: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  componentDidMount?(): void {
    console.log(`${ClientOthersScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount?(): void {
    console.log(`${ClientOthersScreen.TAG}: componentWillUnmount: `);
  }

  render(): ReactNode {
    const { result, agoraToken, newAppKey, username, password } = this.state;
    return (
      <ScrollView>
        <View style={styleValues.containerColumn}>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>agoraToken: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                // console.log(`${ClientOthersScreen.TAG}: `, text);
                this.setState({ agoraToken: text });
              }}
            >
              {agoraToken}
            </TextInput>
            <Button
              title="agoraToken"
              onPress={() => {
                this.renewAgoraToken();
              }}
            >
              agoraToken
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>newAppKey: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                // console.log(`${ClientOthersScreen.TAG}: `, text);
                this.setState({ newAppKey: text });
              }}
            >
              {newAppKey}
            </TextInput>
            <Button
              title="newAppKey"
              onPress={() => {
                this.changeAppKey();
              }}
            >
              newAppKey
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>compressLogs: </Text>
            <Button
              title="compressLogs"
              onPress={() => {
                this.compressLogs();
              }}
            >
              compressLogs
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>u:</Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                // console.log(`${ClientOthersScreen.TAG}: `, text);
                this.setState({ username: text });
              }}
            >
              {username}
            </TextInput>
            <Text style={styleValues.textStyle}>p:</Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                // console.log(`${ClientOthersScreen.TAG}: `, text);
                this.setState({ password: text });
              }}
            >
              {password}
            </TextInput>
            <Button
              title="devices"
              onPress={() => {
                this.getLoggedInDevicesFromServer();
              }}
            >
              getLoggedInDevicesFromServer
            </Button>
          </View>
          <View style={styleValues.containerColumn}>
            <Text style={styleValues.textTipStyle}>result: {result}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
