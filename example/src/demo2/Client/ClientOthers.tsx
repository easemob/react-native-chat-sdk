import React, { Component, ReactNode } from 'react';
import { View, Button, Text, TextInput, ScrollView } from 'react-native';
import { ChatClient, ChatPushConfig } from 'react-native-chat-sdk';
import { styleValues } from '../__internal__/Css';
import messaging from '@react-native-firebase/messaging';

interface State {
  result: string;
  newAppKey: string;
  username: string;
  password: string;
  agoraToken: string;
  devices: string;
  deviceId: string;
  deviceToken: string;
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
      deviceId: '',
      deviceToken: '',
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

  private async requestFcmToken() {
    // https://rnfirebase.io/reference/messaging#getToken
    // await messaging().registerDeviceForRemoteMessages();
    const fcmToken = await messaging().getToken();
    console.log('fcm token: ', fcmToken);
    return fcmToken;
  }

  private async updatePush(): Promise<void> {
    const deviceId = ChatClient.getInstance().options?.pushConfig?.deviceId;
    const deviceToken = await this.requestFcmToken();
    ChatClient.getInstance()
      .updatePushConfig(new ChatPushConfig({ deviceId, deviceToken }))
      .then(() => {
        console.log(`${ClientOthersScreen.TAG}: updatePush: success`);
        this.setState({ result: `updatePush: success` });
      })
      .catch((reason: any) => {
        console.log(
          `${ClientOthersScreen.TAG}: updatePush: fail`,
          JSON.stringify(reason)
        );
        this.setState({
          result: `updatePush: fail: ${reason.code} ${reason.description}`,
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

  componentDidMount?(): void {
    console.log(`${ClientOthersScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount?(): void {
    console.log(`${ClientOthersScreen.TAG}: componentWillUnmount: `);
  }

  render(): ReactNode {
    const { result, agoraToken, newAppKey, deviceId, deviceToken } = this.state;
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
            <Text style={styleValues.textStyle}>deviceId: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({ deviceId: text });
              }}
            >
              {deviceId}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>deviceToken: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({ deviceToken: text });
              }}
            >
              {deviceToken}
            </TextInput>
            <Button
              title="updatePush"
              onPress={() => {
                this.updatePush();
              }}
            >
              newAppKey
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
