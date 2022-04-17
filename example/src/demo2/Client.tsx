import React, { Component, ReactNode } from 'react';
import {
  View,
  Button,
  Text,
  TextInput,
  TextInputChangeEventData,
  NativeSyntheticEvent,
} from 'react-native';
import { ChatClient, ChatConnectionListener } from 'react-native-chat-sdk';
import { styleValues } from './Const';

interface State {
  connectStatus: string;
  listenerStatus: string;
  useName: string;
  password: string;
}

export class ClientScreen extends Component<{ navigation: any }, State, any> {
  public static route = 'ClientScreen';
  private static TAG = 'ClientScreen';
  navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      connectStatus: '...',
      listenerStatus: '...',
      useName: 'asteriskhx1',
      password: 'qwer',
    };
  }

  private login(): void {
    console.log('ClientScreen.login');
    ChatClient.getInstance()
      .login('asteriskhx1', 'qwer')
      .then(() => {
        console.log('ClientScreen.login: success');
        this.setState({ connectStatus: 'login: success' });
      })
      .catch((reason: any) => {
        console.log('ClientScreen.login: fail');
        this.setState({
          connectStatus: `login: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  private logout(): void {
    console.log('ClientScreen.logout');
    ChatClient.getInstance()
      .logout()
      .then(() => {
        console.log('ClientScreen.logout: success');
        this.setState({ connectStatus: 'logout: success' });
      })
      .catch((reason: any) => {
        console.log('ClientScreen.logout: fail');
        this.setState({
          connectStatus: `logout: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  componentDidMount?(): void {
    console.log(`${ClientScreen.TAG}: componentDidMount: `);
    let listener = new (class s implements ChatConnectionListener {
      that: ClientScreen;
      constructor(parent: any) {
        this.that = parent as ClientScreen;
      }
      onTokenWillExpire(): void {
        console.log('ClientScreen.onTokenWillExpire');
        this.that.setState({ listenerStatus: 'onTokenWillExpire' });
      }
      onTokenDidExpire(): void {
        console.log('ClientScreen.onTokenDidExpire');
        this.that.setState({ listenerStatus: 'onTokenDidExpire' });
      }
      onConnected(): void {
        console.log('ClientScreen.onConnected');
        this.that.setState({ listenerStatus: 'onConnected' });
      }
      onDisconnected(errorCode?: number): void {
        console.log('ClientScreen.onDisconnected: ', errorCode);
        this.that.setState({ listenerStatus: 'onDisconnected' });
      }
    })(this);
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance().addConnectionListener(listener);
  }

  componentWillUnmount?(): void {
    console.log(`${ClientScreen.TAG}: componentWillUnmount: `);
  }

  render(): ReactNode {
    const { connectStatus, listenerStatus, useName, password } = this.state;
    return (
      <View style={styleValues.containerColumn}>
        <View style={styleValues.containerRow}>
          <Text style={styleValues.textStyle}>UseName: </Text>
          <TextInput
            style={styleValues.textInputStyle}
            onChangeText={(text: string) => {
              // console.log(`${ClientScreen.TAG}: `, text);
              this.setState({ useName: text });
            }}
          >
            {useName}
          </TextInput>
        </View>
        <View style={styleValues.containerRow}>
          <Text style={styleValues.textStyle}>Password: </Text>
          <TextInput
            style={styleValues.textInputStyle}
            onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) => {
              // console.log(`${ClientScreen.TAG}`);
              this.setState({ password: e.nativeEvent.text });
            }}
          >
            {password}
          </TextInput>
        </View>
        <View style={styleValues.containerRow}>
          <Button
            title="login"
            onPress={() => {
              // console.log(`${ClientScreen.TAG}`);
              this.login();
            }}
          >
            login
          </Button>
          <Button
            title="logout"
            onPress={() => {
              // console.log(`${ClientScreen.TAG}`);
              this.logout();
            }}
          >
            logout
          </Button>
        </View>
        <View style={styleValues.containerColumn}>
          <Text style={styleValues.textTipStyle}>
            click button result: {connectStatus}
          </Text>
        </View>
        <View style={styleValues.containerColumn}>
          <Text style={styleValues.textTipStyle}>
            listener result: {listenerStatus}
          </Text>
        </View>
      </View>
    );
  }
}
