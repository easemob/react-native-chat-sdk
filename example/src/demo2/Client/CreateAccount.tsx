import React, { Component, type ReactNode } from 'react';
import {
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  type TextInputChangeEventData,
  View,
} from 'react-native';
import { ChatClient } from 'react-native-agora-chat';

import { styleValues } from '../__internal__/Css';
import { Button } from '../__internal__/Button';

interface State {
  result: string;
  useName: string;
  password: string;
}

export class CreateAccountScreen extends Component<
  { navigation: any },
  State,
  any
> {
  public static route = 'CreateAccountScreen';
  private static TAG = 'CreateAccountScreen';
  navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      result: '...',
      useName: 'asteriskhx1',
      password: 'qwer',
    };
  }

  componentDidMount?(): void {
    console.log(`${CreateAccountScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount?(): void {
    console.log(`${CreateAccountScreen.TAG}: componentWillUnmount: `);
  }

  private createAccount(): void {
    console.log(`${CreateAccountScreen.TAG}: createAccount: `);
    ChatClient.getInstance()
      .createAccount(this.state.useName, this.state.password)
      .then((value: any) => {
        console.log('CreateAccountScreen: createAccount: success', value);
        this.setState({ result: 'createAccount: success' });
      })
      .catch((reason: any) => {
        console.log('CreateAccountScreen: createAccount: fail', reason);
        this.setState({
          result: `createAccount: fail: ${reason.code} ${reason.description}`,
        });
      });
  }

  render(): ReactNode {
    const { result, useName, password } = this.state;
    return (
      <ScrollView>
        <View style={styleValues.containerColumn}>
          <View style={styleValues.containerRow}>
            <Text style={styleValues.textStyle}>UseName: </Text>
            <TextInput
              style={styleValues.textInputStyle}
              onChangeText={(text: string) => {
                // console.log(`${CreateAccountScreen.TAG}: `, text);
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
                // console.log(`${CreateAccountScreen.TAG}`);
                this.setState({ password: e.nativeEvent.text });
              }}
            >
              {password}
            </TextInput>
          </View>
          <View style={styleValues.containerRow}>
            <Button
              title="create account"
              onPress={() => {
                // console.log(`${CreateAccountScreen.TAG}`);
                this.createAccount();
              }}
            />
          </View>
          <View style={styleValues.containerColumn}>
            <Text style={styleValues.textTipStyle}>
              click button result: {result}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
