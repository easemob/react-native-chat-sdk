import React, { Component, ReactNode } from 'react';
import {
  Button,
  NativeSyntheticEvent,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TextInputChangeEventData,
  View,
} from 'react-native';
import { ChatClient, ChatDeviceInfo } from 'react-native-chat-sdk';

import { styleValues } from '../__internal__/Css';

interface State {
  result: string;
  username: string;
  password: string;
  resource: string;
  devices: string;
  usePassword: boolean;
}

export class KickScreen extends Component<{ navigation: any }, State, any> {
  public static route = 'KickScreen';
  private static TAG = 'KickScreen';
  navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      result: '',
      resource: '',
      username: 'asterisk001',
      password: 'qwerty',
      devices: '',
      usePassword: true,
    };
  }

  private kickDevice(): void {
    ChatClient.getInstance()
      .kickDevice(
        this.state.username,
        this.state.password,
        this.state.resource,
        this.state.usePassword
      )
      .then(() => {
        console.log('KickScreen: kickDevice: success');
        this.setState({ result: `kickDevice: success` });
      })
      .catch((reason: any) => {
        console.log('KickScreen: kickDevice: fail');
        this.setState({
          result: `kickDevice: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  private kickAllDevices(): void {
    ChatClient.getInstance()
      .kickAllDevices(
        this.state.username,
        this.state.password,
        this.state.usePassword
      )
      .then(() => {
        console.log(`${KickScreen.TAG}: kickAllDevices: success`);
        this.setState({ result: `kickAllDevices: success` });
      })
      .catch((reason: any) => {
        console.log(`${KickScreen.TAG}: kickAllDevices: fail`);
        this.setState({
          result: `kickAllDevices: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  private getLoggedInDevicesFromServer(): void {
    ChatClient.getInstance()
      .getLoggedInDevicesFromServer(
        this.state.username,
        this.state.password,
        this.state.usePassword
      )
      .then((value: Array<ChatDeviceInfo>) => {
        console.log(
          `${KickScreen.TAG}: getLoggedInDevicesFromServer: success`,
          value
        );
        this.setState({
          result:
            `getLoggedInDevicesFromServer: success` + JSON.stringify(value),
          devices: JSON.stringify(value),
        });
        if ((value as any[]).length > 0) {
          this.setState({
            resource: value[0]!.resource,
          });
        }
      })
      .catch((reason: any) => {
        console.log(`${KickScreen.TAG}: getLoggedInDevicesFromServer: fail`);
        this.setState({
          result: `getLoggedInDevicesFromServer: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  componentDidMount?(): void {
    console.log(`${KickScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount?(): void {
    console.log(`${KickScreen.TAG}: componentWillUnmount: `);
  }

  render(): ReactNode {
    const { result, resource, username, password } = this.state;
    return (
      <ScrollView>
        <View style={styleValues.containerColumn}>
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
            <Switch
              onValueChange={(usePassword: boolean) => {
                this.setState({ usePassword: usePassword });
              }}
            />
            <Button
              title="get devices"
              onPress={() => {
                this.getLoggedInDevicesFromServer();
              }}
            />
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>username: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                // console.log(`${KickScreen.TAG}: `, text);
                this.setState({ username: text });
              }}
            >
              {username}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>Password: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) => {
                // console.log(`${KickScreen.TAG}`);
                this.setState({ password: e.nativeEvent.text });
              }}
            >
              {password}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>resource: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) => {
                // console.log(`${KickScreen.TAG}`);
                this.setState({ resource: e.nativeEvent.text });
              }}
            >
              {resource}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="kickDevice"
              onPress={() => {
                // console.log(`${KickScreen.TAG}`);
                this.kickDevice();
              }}
            />
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="kickAllDevices"
              onPress={() => {
                // console.log(`${KickScreen.TAG}`);
                this.kickAllDevices();
              }}
            />
          </View>
          <View style={styleValues.containerColumn}>
            <Text selectable={true} style={styleValues.textTipStyle}>
              result: {result}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
