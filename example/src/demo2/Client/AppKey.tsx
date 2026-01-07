import React, { Component, type ReactNode } from 'react';
import { ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { ChatClient, ChatOptions, ChatPushConfig } from 'react-native-chat-sdk';

import { datasheet } from '../__default__/Datasheet';
import { styleValues } from '../__internal__/Css';
import { Button } from '../__internal__/Button';
import { restServer, webSocketServer } from '../../env';
// import messaging from '@react-native-firebase/messaging';

interface State {
  result: string;
  appKey: string;
  appId: string;
  useAppId: boolean;
  enablePush: string;
  enableTLS: string;
  messagesReceiveCallbackIncludeSend: string;
  regardImportMessagesAsRead: string;
  useReplacedMessageContents: string;
}

let gAppkey = datasheet.AppKey[1] ?? '';
let gAppId = datasheet.AppId[1] ?? '';
let gUseAppId = false;

export class AppKeyScreen extends Component<{ navigation: any }, State, any> {
  public static route = 'AppKeyScreen';
  private static TAG = 'AppKeyScreen';
  navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      result: '',
      appKey: gAppkey,
      appId: gAppId,
      useAppId: gUseAppId,
      enablePush: '0',
      useReplacedMessageContents: '0',
      enableTLS: '0',
      messagesReceiveCallbackIncludeSend: '0',
      regardImportMessagesAsRead: '0',
    };
  }

  // private async requestUserPermission(): Promise<void> {
  //   const authStatus = await messaging().requestPermission({
  //     announcement: true,
  //   });
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.log('Authorization status:', authStatus);
  //   }
  // }

  // private async checkApplicationPermission(): Promise<void> {
  //   const authorizationStatus = await messaging().requestPermission();

  //   if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
  //     console.log('User has notification permissions enabled.');
  //   } else if (
  //     authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
  //   ) {
  //     console.log('User has provisional notification permissions.');
  //   } else {
  //     console.log('User has notification permissions disabled');
  //   }
  // }

  // private async requestFcmToken() {
  //   // https://rnfirebase.io/reference/messaging#getToken
  //   // await messaging().registerDeviceForRemoteMessages();
  //   const fcmToken = await messaging().getToken();
  //   console.log('fcm token: ', fcmToken);
  //   return fcmToken;
  // }

  // private onListenerNotification(): void {
  //   console.log('fcm message listener:');
  //   messaging().onMessage(async (remoteMessage) => {
  //     const l = 'init: onMessage:' + JSON.stringify(remoteMessage);
  //     Alert.alert(l);
  //     console.log(l);
  //   });
  //   messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  //     const l =
  //       'init: setBackgroundMessageHandler: ' + JSON.stringify(remoteMessage);
  //     Alert.alert(l);
  //     console.log(l);
  //   });
  // }

  private async initSDK(): Promise<void> {
    // from: https://console.firebase.google.com/project/test-push-6b4b6/settings/cloudmessaging/ios:com.easemob.reactnativechatsdk?hl=zh-cn
    console.log('initSDK: ', this.state);
    // await this.requestUserPermission();
    // await this.checkApplicationPermission();
    // let fcmToken: string;
    let pushConfig: any;
    if (this.state.enablePush === '1') {
      // fcmToken = await this.requestFcmToken();
      pushConfig = new ChatPushConfig({
        deviceId: 'test_device_id',
        deviceToken:
          'a215705b9bff79748cfb5ae73560c1b204c403344608b8ff40bf829c44d56a03',
      });
      // this.onListenerNotification();
    }

    const {
      appKey,
      appId,
      useAppId,
      enableTLS,
      useReplacedMessageContents,
      messagesReceiveCallbackIncludeSend,
      regardImportMessagesAsRead,
    } = this.state;

    ChatClient.getInstance()
      .init(
        useAppId !== true
          ? ChatOptions.withAppKey({
              appKey: appKey,
              autoLogin: false,
              debugModel: true,
              enableEmptyConversation: false,
              requireAck: false,
              requireDeliveryAck: false,
              autoAcceptGroupInvitation: true,
              // enableTLS: enableTLS === '0' ? false : true,
              useReplacedMessageContents:
                useReplacedMessageContents === '0' ? false : true,
              messagesReceiveCallbackIncludeSend:
                messagesReceiveCallbackIncludeSend === '0' ? false : true,
              regardImportMessagesAsRead:
                regardImportMessagesAsRead === '0' ? false : true,
              pushConfig: pushConfig,
              loginExtraInfo: 'rn-test',
              webSocketServer: webSocketServer[1],
              webSocketPort: 80,
              enableDNSConfig: false,
              enableTLS: false,
              restServer: restServer[1],
            })
          : ChatOptions.withAppId({
              appId: appId,
              autoLogin: false,
              debugModel: true,
              enableEmptyConversation: false,
              requireAck: false,
              requireDeliveryAck: false,
              autoAcceptGroupInvitation: true,
              enableTLS: enableTLS === '0' ? false : true,
              useReplacedMessageContents:
                useReplacedMessageContents === '0' ? false : true,
              messagesReceiveCallbackIncludeSend:
                messagesReceiveCallbackIncludeSend === '0' ? false : true,
              regardImportMessagesAsRead:
                regardImportMessagesAsRead === '0' ? false : true,
              pushConfig: pushConfig,
              loginExtraInfo: 'rn-test',
            })
      )
      .then(() => {
        console.log(
          `dev: initSDK: success: useAppId=${useAppId}, appId=${appId}, appKey=${appKey}`
        );
        this.setState({ result: 'success' });
        gUseAppId = useAppId;
        if (useAppId) {
          gAppId = appId;
        } else {
          gAppkey = appKey;
        }
      })
      .catch((reason) => {
        console.error(reason);
        this.setState({ result: reason.toString() });
      });
  }

  onChangeAppId(useAppId: boolean): void {
    console.log('dev: onChangeAppId: ', useAppId, gAppId, gAppkey);
    if (useAppId) {
      this.setState({ useAppId: useAppId, appId: gAppId, appKey: '' });
    } else {
      this.setState({ useAppId: useAppId, appId: '', appKey: gAppkey });
    }
  }

  componentDidMount?(): void {
    console.log(`${AppKeyScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount?(): void {
    console.log(`${AppKeyScreen.TAG}: componentWillUnmount: `);
  }

  render(): ReactNode {
    const {
      result,
      appKey,
      appId,
      useAppId,
      enablePush,
      enableTLS,
      useReplacedMessageContents,
      messagesReceiveCallbackIncludeSend,
      regardImportMessagesAsRead,
    } = this.state;
    return (
      <ScrollView>
        <View style={styleValues.containerColumn}>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>
              {useAppId ? 'current is appId' : 'current is appkey'}
            </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                if (useAppId) {
                  this.setState({ appId: text });
                } else {
                  this.setState({ appKey: text });
                }
              }}
            >
              {useAppId ? appId : appKey}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>enablePushConfig: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({ enablePush: text === '1' ? '1' : '0' });
              }}
            >
              {enablePush}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>enableTLS: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({ enableTLS: text === '1' ? '1' : '0' });
              }}
            >
              {enableTLS}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>messagesReceiveCallback: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({
                  messagesReceiveCallbackIncludeSend: text === '1' ? '1' : '0',
                });
              }}
            >
              {messagesReceiveCallbackIncludeSend}
            </TextInput>
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>
              regardImportMessagesAsRead:{' '}
            </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({
                  regardImportMessagesAsRead: text === '1' ? '1' : '0',
                });
              }}
            >
              {regardImportMessagesAsRead}
            </TextInput>
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>
              useReplacedMessageContents:{' '}
            </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({
                  useReplacedMessageContents: text === '1' ? '1' : '0',
                });
              }}
            >
              {useReplacedMessageContents}
            </TextInput>
          </View>

          <View
            style={{ flexDirection: 'row', height: 80, alignItems: 'center' }}
          >
            <Text>{'use app id'}</Text>
            <Switch
              value={useAppId}
              onValueChange={this.onChangeAppId.bind(this)}
            />
          </View>

          <View style={styleValues.containerRow}>
            <Button
              title="init sdk"
              onPress={() => {
                this.initSDK();
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
