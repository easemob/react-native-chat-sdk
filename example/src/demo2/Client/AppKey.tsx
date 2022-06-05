import React, { Component, ReactNode } from 'react';
import { View, Button, Text, TextInput, ScrollView } from 'react-native';
import { ChatClient, ChatOptions } from 'react-native-chat-sdk';
import { datasheet } from '../__default__/Datasheet';
import { styleValues } from '../__internal__/Css';

interface State {
  result: string;
  appKey: string;
}

export class AppKeyScreen extends Component<{ navigation: any }, State, any> {
  public static route = 'AppKeyScreen';
  private static TAG = 'AppKeyScreen';
  navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      result: '',
      appKey: datasheet.AppKey[4],
    };
  }

  private initSDK(): void {
    ChatClient.getInstance()
      .init(
        new ChatOptions({
          appKey: this.state.appKey,
          autoLogin: false,
          debugModel: true,
        })
      )
      .then(() => {
        this.setState({ result: 'success' });
      })
      .catch((reason) => {
        this.setState({ result: reason });
      });
  }

  componentDidMount?(): void {
    console.log(`${AppKeyScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount?(): void {
    console.log(`${AppKeyScreen.TAG}: componentWillUnmount: `);
  }

  render(): ReactNode {
    const { result, appKey: appKey } = this.state;
    return (
      <ScrollView>
        <View style={styleValues.containerColumn}>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>agoraToken: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                this.setState({ appKey: text });
              }}
            >
              {appKey}
            </TextInput>
            <Button
              title="appKey"
              onPress={() => {
                this.initSDK();
              }}
            >
              agoraToken
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
