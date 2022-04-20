import React, { Component, ReactNode } from 'react';
import {
  View,
  Button,
  Text,
  TextInput,
  TextInputChangeEventData,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import { ChatClient } from 'react-native-chat-sdk';
import { styleValues } from '../Utils';

interface State {
  result: string;
  username: string;
  password: string;
  resource: string;
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
      username: 'asteriskhx1',
      password: 'qwer',
    };
  }

  private kickDevice(): void {
    ChatClient.getInstance()
      .kickDevice(this.state.username, this.state.password, this.state.resource)
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
      .kickAllDevices(this.state.username, this.state.password)
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
            >
              kickDevice
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="kickAllDevices"
              onPress={() => {
                // console.log(`${KickScreen.TAG}`);
                this.kickAllDevices();
              }}
            >
              kickAllDevices
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
