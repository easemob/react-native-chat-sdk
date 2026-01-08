import React, { Component, type ReactNode } from 'react';
import { ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { ChatClient, ChatOptions, ChatPushConfig } from 'react-native-chat-sdk';

import { datasheet } from '../__default__/Datasheet';
import { styleValues } from '../__internal__/Css';
import { Button } from '../__internal__/Button';
import { restServers, webSocketServers } from '../../env';
// import messaging from '@react-native-firebase/messaging';

interface State {
  result: string;
  appKey: string;
  appId: string;
  useAppId: boolean;
  enablePush: boolean;
  messagesReceiveCallbackIncludeSend: boolean;
  regardImportMessagesAsRead: boolean;
  useReplacedMessageContents: boolean;
  webSocketServer?: string;
  webSocketPort?: number;
  enableDNSConfig?: boolean;
  restServer?: string;
  enableTLS?: boolean;
}

let gAppkey = datasheet.AppKey[1] ?? '';
let gAppId = datasheet.AppId[1] ?? '';
let gUseAppId = false;
let gWebSocketServer = webSocketServers[1] ?? undefined;
let gWebSocketPort = 80;
let gEnableDNSConfig = false;
let gRestServer = restServers[1] ?? undefined;
let gEnableTLS = false;
let gEnablePush = false;
let gUseReplacedMessageContents = false;
let gMessagesReceiveCallbackIncludeSend = false;
let gRegardImportMessagesAsRead = false;

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
      enablePush: gEnablePush,
      useReplacedMessageContents: gUseReplacedMessageContents,
      enableTLS: gEnableTLS,
      messagesReceiveCallbackIncludeSend: gMessagesReceiveCallbackIncludeSend,
      regardImportMessagesAsRead: gRegardImportMessagesAsRead,
      webSocketServer: gWebSocketServer,
      webSocketPort: gWebSocketPort,
      enableDNSConfig: gEnableDNSConfig,
      restServer: gRestServer,
    };
  }

  private async initSDK(): Promise<void> {
    // from: https://console.firebase.google.com/project/test-push-6b4b6/settings/cloudmessaging/ios:com.easemob.reactnativechatsdk?hl=zh-cn
    console.log('initSDK: ', this.state);
    // await this.requestUserPermission();
    // await this.checkApplicationPermission();
    // let fcmToken: string;
    let pushConfig: any;
    if (this.state.enablePush) {
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
      webSocketPort,
      webSocketServer,
      restServer,
      enableDNSConfig,
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
              useReplacedMessageContents,
              messagesReceiveCallbackIncludeSend,
              regardImportMessagesAsRead,
              pushConfig: pushConfig,
              loginExtraInfo: 'rn-test',
              webSocketServer,
              webSocketPort,
              enableDNSConfig,
              enableTLS,
              restServer,
            })
          : ChatOptions.withAppId({
              appId: appId,
              autoLogin: false,
              debugModel: true,
              enableEmptyConversation: false,
              requireAck: false,
              requireDeliveryAck: false,
              autoAcceptGroupInvitation: true,
              enableTLS,
              useReplacedMessageContents,
              messagesReceiveCallbackIncludeSend,
              regardImportMessagesAsRead,
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
        gWebSocketServer =
          ChatClient.getInstance().options?.webSocketServer ?? undefined;
        gWebSocketPort = ChatClient.getInstance().options?.webSocketPort ?? 80;
        gEnableDNSConfig =
          ChatClient.getInstance().options?.enableDNSConfig ?? false;
        gRestServer = ChatClient.getInstance().options?.restServer ?? undefined;
        gEnableTLS = ChatClient.getInstance().options?.enableTLS ?? false;
        gEnablePush = ChatClient.getInstance().options?.pushConfig
          ? true
          : false;
        gUseReplacedMessageContents =
          ChatClient.getInstance().options?.useReplacedMessageContents ?? false;
        gMessagesReceiveCallbackIncludeSend =
          ChatClient.getInstance().options
            ?.messagesReceiveCallbackIncludeSend ?? false;
        gRegardImportMessagesAsRead =
          ChatClient.getInstance().options?.regardImportMessagesAsRead ?? false;
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
      restServer,
      webSocketServer,
      webSocketPort,
      enableDNSConfig,
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
              autoCapitalize={'none'}
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
              autoCapitalize={'none'}
              onChangeText={(text: string) => {
                this.setState({ enablePush: text !== '0' ? true : false });
              }}
            >
              {enablePush ? '1' : '0'}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>messagesReceiveCallback: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              autoCapitalize={'none'}
              onChangeText={(text: string) => {
                this.setState({
                  messagesReceiveCallbackIncludeSend:
                    text !== '0' ? true : false,
                });
              }}
            >
              {messagesReceiveCallbackIncludeSend ? '1' : '0'}
            </TextInput>
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>
              regardImportMessagesAsRead:{' '}
            </Text>
            <TextInput
              style={styleValues.textInputStyle}
              autoCapitalize={'none'}
              onChangeText={(text: string) => {
                this.setState({
                  regardImportMessagesAsRead: text !== '0' ? true : false,
                });
              }}
            >
              {regardImportMessagesAsRead ? '1' : '0'}
            </TextInput>
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>
              useReplacedMessageContents:{' '}
            </Text>
            <TextInput
              style={styleValues.textInputStyle}
              autoCapitalize={'none'}
              onChangeText={(text: string) => {
                this.setState({
                  useReplacedMessageContents: text !== '0' ? true : false,
                });
              }}
            >
              {useReplacedMessageContents ? '1' : '0'}
            </TextInput>
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>webSocketServer: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              autoCapitalize={'none'}
              onChangeText={(text: string) => {
                this.setState({
                  webSocketServer: text,
                });
              }}
            >
              {webSocketServer}
            </TextInput>
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>webSocketPort: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              autoCapitalize={'none'}
              onChangeText={(text: string) => {
                this.setState({
                  webSocketPort: text === '' ? 0 : Number(text),
                });
              }}
            >
              {String(webSocketPort)}
            </TextInput>
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>restServer: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              autoCapitalize={'none'}
              onChangeText={(text: string) => {
                this.setState({
                  restServer: text,
                });
              }}
            >
              {restServer}
            </TextInput>
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>enableTLS: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              autoCapitalize={'none'}
              onChangeText={(text: string) => {
                this.setState({
                  enableTLS: text !== '0' ? true : false,
                });
              }}
            >
              {enableTLS ? '1' : '0'}
            </TextInput>
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>enableDNSConfig: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              autoCapitalize={'none'}
              onChangeText={(text: string) => {
                this.setState({
                  enableDNSConfig: text !== '0' ? true : false,
                });
              }}
            >
              {enableDNSConfig ? '1' : '0'}
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
