import React, { Component, ReactNode } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
import { ChatClient, ChatOptions } from 'react-native-chat-sdk';

import { datasheet } from '../__default__/Datasheet';
import { styleValues } from '../__internal__/Css';
// import messaging from '@react-native-firebase/messaging';

interface State {
  result: string;
  appKey: string;
  enablePush: string;
  enableTLS: string;
  messagesReceiveCallbackIncludeSend: string;
  regardImportMessagesAsRead: string;
  useReplacedMessageContents: string;
}

let gAppkey = datasheet.AppKey[1] ?? '';

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
    // let pushConfig: any;
    // if (this.state.enablePush === '1') {
    //   // fcmToken = await this.requestFcmToken();
    //   pushConfig = new ChatPushConfig({
    //     deviceId: datasheet.PushInfo.sendId,
    //     deviceToken: fcmToken,
    //   });
    //   // this.onListenerNotification();
    // }

    const {
      appKey,
      enableTLS,
      useReplacedMessageContents,
      messagesReceiveCallbackIncludeSend,
      regardImportMessagesAsRead,
    } = this.state;

    ChatClient.getInstance()
      .init(
        new ChatOptions({
          appKey: appKey,
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
          // pushConfig: pushConfig,
          loginExtraInfo: 'rn-test',
        })
      )
      .then(() => {
        this.setState({ result: 'success' });
      })
      .catch((reason) => {
        console.error(reason);
        this.setState({ result: reason.toString() });
      });
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
            <Text style={styleValues.textStyle}>agoraToken: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({ appKey: text });
                gAppkey = appKey;
              }}
            >
              {appKey}
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

          <View style={styleValues.containerRow}>
            <Button
              title="appKey"
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
