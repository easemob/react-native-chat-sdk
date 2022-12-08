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
import {
  ChatClient,
  ChatConnectEventListener,
  ChatMultiDeviceEvent,
  ChatMultiDeviceEventListener,
} from 'react-native-chat-sdk';
import { datasheet } from '../__default__/Datasheet';
import { styleValues } from '../__internal__/Css';

interface State {
  loginStatus: string;
  connectStatus: string;
  listenerStatus: string;
  useName: string;
  password: string;
}

export class LoginAndLogoutScreen extends Component<
  { navigation: any },
  State,
  any
> {
  public static route = 'LoginAndLogoutScreen';
  private static TAG = 'LoginAndLogoutScreen';
  navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      loginStatus: '',
      connectStatus: '...',
      listenerStatus: '...',
      useName: datasheet.accounts[0].id,
      password: datasheet.accounts[0].mm,
    };
  }

  private login(isPassword: boolean, isAgora?: boolean): void {
    console.log(`${LoginAndLogoutScreen.TAG}: login`);
    if (isAgora) {
      ChatClient.getInstance()
        .loginWithAgoraToken(this.state.useName, this.state.password)
        .then((value: any) => {
          console.log(`${LoginAndLogoutScreen.TAG}: login: success`, value);
          this.setState({ connectStatus: `login: success` + value });
        })
        .catch((reason: any) => {
          console.log(`${LoginAndLogoutScreen.TAG}: login: fail`);
          this.setState({
            connectStatus: `login: fail: ${reason.code} ${reason.description}`,
          });
        });
    } else {
      ChatClient.getInstance()
        .login(this.state.useName, this.state.password, isPassword)
        .then((value: any) => {
          console.log(`${LoginAndLogoutScreen.TAG}: login: success`, value);
          this.setState({ connectStatus: `login: success` + value });
        })
        .catch((reason: any) => {
          console.log(`${LoginAndLogoutScreen.TAG}: login: fail`);
          this.setState({
            connectStatus: `login: fail: ${reason.code} ${reason.description}`,
          });
        });
    }
  }

  private logout(): void {
    console.log(`${LoginAndLogoutScreen.TAG}: logout`);
    ChatClient.getInstance()
      .logout()
      .then(() => {
        console.log(`${LoginAndLogoutScreen.TAG}: logout: success`);
        this.setState({ connectStatus: `logout: success` });
      })
      .catch((reason: any) => {
        console.log(`${LoginAndLogoutScreen.TAG}: logout: fail`);
        this.setState({
          connectStatus: `logout: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  componentDidMount?(): void {
    console.log(`${LoginAndLogoutScreen.TAG}: componentDidMount: `);
    let listener = new (class s implements ChatConnectEventListener {
      that: LoginAndLogoutScreen;
      constructor(parent: any) {
        this.that = parent as LoginAndLogoutScreen;
      }
      onTokenWillExpire(): void {
        console.log('LoginAndLogoutScreen.onTokenWillExpire');
        this.that.setState({ listenerStatus: 'onTokenWillExpire' });
      }
      onTokenDidExpire(): void {
        console.log('LoginAndLogoutScreen.onTokenDidExpire');
        this.that.setState({ listenerStatus: 'onTokenDidExpire' });
      }
      onConnected(): void {
        console.log('LoginAndLogoutScreen.onConnected');
        this.that.setState({ listenerStatus: 'onConnected' });
      }
      onDisconnected(errorCode?: number): void {
        console.log('LoginAndLogoutScreen.onDisconnected: ', errorCode);
        this.that.setState({ listenerStatus: 'onDisconnected' });
      }
    })(this);
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance().addConnectionListener(listener);

    const multiDeviceListener = new (class
      implements ChatMultiDeviceEventListener
    {
      that: LoginAndLogoutScreen;
      constructor(parent: LoginAndLogoutScreen) {
        this.that = parent;
      }
      onThreadEvent(
        event?: ChatMultiDeviceEvent,
        target?: string,
        ext?: string[]
      ): void {
        console.log('LoginAndLogoutScreen.onThreadEvent: ', event, target, ext);
        this.that.setState({
          listenerStatus:
            'LoginAndLogoutScreen.onThreadEvent: ' + event + target + ext,
        });
      }
      onContactEvent(
        event?: ChatMultiDeviceEvent,
        target?: string,
        ext?: string
      ): void {
        console.log(
          'LoginAndLogoutScreen.onContactEvent: ',
          event,
          target,
          ext
        );
        this.that.setState({
          listenerStatus:
            'LoginAndLogoutScreen.onContactEvent: ' + event + target + ext,
        });
      }
      onGroupEvent(
        event?: ChatMultiDeviceEvent,
        target?: string,
        usernames?: string[]
      ): void {
        console.log(
          'LoginAndLogoutScreen.onGroupEvent: ',
          event,
          target,
          usernames
        );
        this.that.setState({
          listenerStatus:
            'LoginAndLogoutScreen.onGroupEvent: ' + event + target + usernames,
        });
      }
    })(this);
    ChatClient.getInstance().removeAllMultiDeviceListener();
    ChatClient.getInstance().addMultiDeviceListener(multiDeviceListener);
  }

  componentWillUnmount?(): void {
    console.log(`${LoginAndLogoutScreen.TAG}: componentWillUnmount: `);
  }

  render(): ReactNode {
    const { connectStatus, listenerStatus, useName, password, loginStatus } =
      this.state;
    return (
      <ScrollView>
        <View style={styleValues.containerColumn}>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>UseName: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                // console.log(`${LoginAndLogoutScreen.TAG}: `, text);
                this.setState({ useName: text });
              }}
            >
              {useName}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>Password or Token: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) => {
                // console.log(`${LoginAndLogoutScreen.TAG}`);
                this.setState({ password: e.nativeEvent.text });
              }}
            >
              {password}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="login with password"
              onPress={() => {
                // console.log(`${LoginAndLogoutScreen.TAG}`);
                this.login(true);
              }}
            >
              login
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="login with token"
              onPress={() => {
                // console.log(`${LoginAndLogoutScreen.TAG}`);
                this.login(false);
              }}
            >
              login
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="login with agora token"
              onPress={() => {
                // console.log(`${LoginAndLogoutScreen.TAG}`);
                this.login(false, true);
              }}
            >
              login
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="logout"
              onPress={() => {
                // console.log(`${LoginAndLogoutScreen.TAG}`);
                this.logout();
              }}
            >
              logout
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="get login state"
              onPress={() => {
                // console.log(`${LoginAndLogoutScreen.TAG}`);
                this.getLoginState();
              }}
            >
              get login state
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="get connect state"
              onPress={() => {
                // console.log(`${LoginAndLogoutScreen.TAG}`);
                this.getConnectState();
              }}
            >
              get connect state
            </Button>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="get user name"
              onPress={() => {
                // console.log(`${LoginAndLogoutScreen.TAG}`);
                this.getUserName();
              }}
            >
              get user name
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
          <View style={styleValues.containerColumn}>
            <Text style={styleValues.textTipStyle}>
              login status: {loginStatus}
            </Text>
          </View>
          <View style={styleValues.containerColumn}>
            <Text style={styleValues.textTipStyle}>
              user name status: {useName}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }
  getLoginState() {
    ChatClient.getInstance()
      .isLoginBefore()
      .then(
        (value) => {
          this.setState({ loginStatus: value ? 'true' : 'false' });
        },
        (reason) => {
          this.setState({ loginStatus: JSON.stringify(reason) });
        }
      );
  }
  getConnectState() {
    ChatClient.getInstance()
      .isConnected()
      .then(
        (value) => {
          this.setState({ connectStatus: value ? 'true' : 'false' });
        },
        (reason) => {
          this.setState({ connectStatus: JSON.stringify(reason) });
        }
      );
  }
  getUserName() {
    ChatClient.getInstance()
      .getCurrentUsername()
      .then(
        (value) => {
          this.setState({ useName: value });
        },
        (reason) => {
          this.setState({ useName: JSON.stringify(reason) });
        }
      );
  }
}
