import * as React from 'react';
import { Text, View } from 'react-native';
import {
  ChatClient,
  ChatException,
  type ChatExceptionEventListener,
  type ChatMessageEventListener,
} from 'react-native-agora-chat';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: any;
};
type State = {
  params: string;
};
export class UnsupportedScreen extends React.Component<Props, State> {
  public static route = 'Unsupported';
  // private static TAG = 'Unsupported';
  private listener: ChatExceptionEventListener;
  private msgListener: ChatMessageEventListener;
  constructor(props: Props) {
    super(props);
    this.state = {
      params: '',
    };
    this.listener = {
      onExcept: (params: {
        except: ChatException;
        from?: string | undefined;
        extra?: Record<string, string> | undefined;
      }): void => {
        console.log('Unsupported onError', params);
        try {
          this.setState({
            params: JSON.stringify(params),
          });
        } catch (error) {
          console.warn(error);
        }
      },
    };
    this.msgListener = {
      onMessagesReceived: (messages) => {
        console.log('onMessagesReceived', messages);
      },
    };
  }
  init() {
    console.log('Unsupported init');
    ChatClient.getInstance().addExceptListener(this.listener);
    ChatClient.getInstance().chatManager.addMessageListener(this.msgListener);
  }
  unInit() {
    console.log('Unsupported unInit');
    ChatClient.getInstance().removeExceptListener(this.listener);
    ChatClient.getInstance().chatManager.removeMessageListener(
      this.msgListener
    );
  }
  componentDidMount?(): void {
    this.init();
  }
  componentWillUnmount(): void {
    this.unInit();
  }

  render() {
    const { params } = this.state;
    return (
      <SafeAreaProvider>
        <SafeAreaView>
          <View style={{ flex: 1 }}>
            <Text>{'internal error:'}</Text>
            <Text>{params}</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
}
