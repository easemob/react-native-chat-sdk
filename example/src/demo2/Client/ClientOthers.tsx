import React, { Component, type ReactNode } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import {
  ChatClient,
  ChatMessage,
  ChatPushConfig,
  ChatTextMessageBody,
} from 'react-native-chat-sdk';

// import messaging from '@react-native-firebase/messaging';
import { datasheet } from '../__default__/Datasheet';
import { styleValues } from '../__internal__/Css';
import { Button } from '../__internal__/Button';

interface State {
  result: string;
  newAppKey: string;
  username: string;
  password: string;
  agoraToken: string;
  devices: string;
  deviceId: string;
  deviceToken: string;
  version: string;
  token: string;
  tokenMap: number[];
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
      username: datasheet.accounts[0]!.id,
      password: datasheet.accounts[0]!.mm,
      devices: '',
      deviceId: '',
      deviceToken: '',
      version: '',
      token: '',
      tokenMap: [],
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
    // const fcmToken = await messaging().getToken();
    // console.log('fcm token: ', fcmToken);
    // return fcmToken;
    return 'pseudo';
  }

  private async updatePush(): Promise<void> {
    const deviceId =
      ChatClient.getInstance().options?.pushConfig?.deviceId ?? 'test_name';
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

  private getVersion(): void {
    this.setState({ version: ChatClient.getInstance().version });
  }

  private customAction(): void {
    const newMsg2 = ChatMessage.createTextMessage('zuoyu2', "I'm fine", 0);
    ChatClient.getInstance()
      .chatManager.sendMessage(newMsg2, {
        onSuccess: (message) => {
          ChatClient.getInstance()
            .chatManager.translateMessage(message, ['zh-Hans'])
            .then((msg) => {
              msg.attributes = { test: 'test' };
              ChatClient.getInstance()
                .chatManager.updateMessage(msg)
                .then((_) => {
                  const text = msg.body as ChatTextMessageBody;
                  const body = {
                    ...text,
                    content: 'test111',
                  } as ChatTextMessageBody;
                  ChatClient.getInstance()
                    .chatManager.modifyMessageBody(msg.msgId, body)
                    .then()
                    .catch();
                })
                .catch();
            });
        },
        onError: (localMsgId, error) => {
          console.log('dev:sendMessage:error', error, localMsgId);
        },
      })
      .then(() => {})
      .catch();
  }

  private getToken(): void {
    // test get user token
    const { token } = this.state;
    ChatClient.getInstance()
      .getRTCTokenInfoWithChannelName(token)
      .then((info) => {
        console.log('dev:getRTCTokenInfoWithChannelName:info', info);
        this.setState({
          result:
            `getRTCTokenInfoWithChannelName: success` + JSON.stringify(info),
        });
      })
      .catch((error) => {
        console.log('dev:getRTCTokenInfoWithChannelName:error', error);
      });
  }

  private getTokenMap(): void {
    // test get user ids with rtc uids
    const { tokenMap } = this.state;
    ChatClient.getInstance()
      .getUserIdsWithRTCUids(tokenMap)
      .then((map) => {
        console.log('dev:getUserIdsWithRTCUids:map', map);
        let mapToString = '';
        map.forEach((value, key) => {
          mapToString += `{ ${key}: ${value}, }`;
        });
        this.setState({
          result: `getUserIdsWithRTCUids: success` + mapToString,
        });
      })
      .catch((error) => {
        console.log('dev:getUserIdsWithRTCUids:error', error);
      });
  }

  componentDidMount?(): void {
    console.log(`${ClientOthersScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount?(): void {
    console.log(`${ClientOthersScreen.TAG}: componentWillUnmount: `);
  }

  render(): ReactNode {
    const {
      result,
      agoraToken,
      newAppKey,
      deviceId,
      deviceToken,
      token,
      tokenMap,
    } = this.state;
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
            />
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
            />
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>compressLogs: </Text>
            <Button
              title="compressLogs"
              onPress={() => {
                this.compressLogs();
              }}
            />
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
            />
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>deviceToken: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({ token: text });
              }}
            >
              {token}
            </TextInput>
            <Button
              title="getToken"
              onPress={() => {
                this.getToken();
              }}
            />
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>deviceToken: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({ tokenMap: [Number(text)] });
              }}
            >
              {tokenMap}
            </TextInput>
            <Button
              title="getTokenMap"
              onPress={() => {
                this.getTokenMap();
              }}
            />
          </View>

          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>
              version: {this.state.version}
            </Text>
            <Button
              title="version"
              onPress={() => {
                this.getVersion();
              }}
            />
          </View>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>custom</Text>
            <Button
              title="custom"
              onPress={() => {
                this.customAction();
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
