import React, { Component } from 'react';
import { View, Button, ScrollView, ViewStyle, Text } from 'react-native';
import {
  ChatClient,
  ChatConnectionListener,
  ChatError,
  ChatGroupMessageAck,
  ChatManagerListener,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageStatus,
  ChatMessageStatusCallback,
} from 'react-native-chat-sdk';

const styleValue: ViewStyle = {
  alignItems: 'stretch',
  justifyContent: 'center',
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 8,
  paddingBottom: 8,
};

interface State {
  status: string;
  message: string;
}

if (module.exports.hot) {
  module.exports.hot.accept(() => {
    console.log('test hot reload');
  });
}
console.log(`test: `, module.exports);

export class ConnectScreen extends Component<{}, State, any> {
  static route = 'ConnectScreen';
  navigation: any;
  msgId?: string;
  static count = 1;
  messages: Map<string, ChatMessage> = new Map();

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      status: '',
      message: '',
    };
  }

  componentDidMount?(): void {
    console.log('ConnectScreen.componentDidMount');
    let listener = new (class s implements ChatConnectionListener {
      that: ConnectScreen;
      constructor(parent: any) {
        this.that = parent as ConnectScreen;
      }
      onTokenWillExpire(): void {
        console.log('ConnectScreen.onTokenWillExpire');
        this.that.setState({ status: 'onTokenWillExpire' });
      }
      onTokenDidExpire(): void {
        console.log('ConnectScreen.onTokenDidExpire');
        this.that.setState({ status: 'onTokenDidExpire' });
      }
      onConnected(): void {
        console.log('ConnectScreen.onConnected');
        this.that.setState({ status: 'onConnected' });
      }
      onDisconnected(errorCode?: number): void {
        console.log('ConnectScreen.onDisconnected', errorCode);
        this.that.setState({ status: 'onDisconnected' });
      }
    })(this);
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance().addConnectionListener(listener);

    let msgListener = new (class ss implements ChatManagerListener {
      that: ConnectScreen;
      constructor(parent: any) {
        this.that = parent as ConnectScreen;
      }
      onMessagesReceived(messages: ChatMessage[]): void {
        console.log('ConnectScreen.onMessagesReceived', messages);
        this.that.msgId = (++ConnectScreen.count).toString();
        this.that.setState({ message: 'onMessagesReceived' });
      }
      onCmdMessagesReceived(messages: ChatMessage[]): void {
        console.log('ConnectScreen.onCmdMessagesReceived', messages);
        this.that.setState({ message: 'onCmdMessagesReceived' });
      }
      onMessagesRead(messages: ChatMessage[]): void {
        console.log('ConnectScreen.onMessagesRead', messages);
        this.that.setState({ message: 'onMessagesRead' });
      }
      onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
        console.log('ConnectScreen.onGroupMessageRead', groupMessageAcks);
        this.that.setState({ message: 'onGroupMessageRead' });
      }
      onMessagesDelivered(messages: ChatMessage[]): void {
        console.log('ConnectScreen.onMessagesDelivered', messages);
        this.that.setState({ message: 'onMessagesDelivered' });
      }
      onMessagesRecalled(messages: ChatMessage[]): void {
        console.log('ConnectScreen.onMessagesRecalled', messages);
        this.that.setState({ message: 'onMessagesRecalled' });
      }
      onConversationsUpdate(): void {
        console.log('ConnectScreen.onConversationsUpdate');
        this.that.setState({ message: 'onConversationsUpdate' });
      }
      onConversationRead(from: string, to?: string): void {
        console.log('ConnectScreen.onConversationRead', from, to);
        this.that.setState({ message: 'onConversationRead' });
      }
    })(this);

    ChatClient.getInstance().chatManager.addListener(msgListener);
  }

  componentWillUnmount?(): void {
    console.log('ConnectScreen.componentWillUnmount');
  }

  connect(): void {
    console.log('ConnectScreen.connect');
    ChatClient.getInstance()
      .login('asteriskhx1', 'qwer')
      .then(() => {
        console.log('ConnectScreen.connect: success');
        this.setState({ status: 'connect: success' });
      })
      .catch(() => {
        console.log('ConnectScreen.connect: fail');
        this.setState({ status: 'connect: fail' });
      });
  }

  disconnect(): void {
    console.log('ConnectScreen.disconnect');
    ChatClient.getInstance()
      .logout()
      .then(() => {
        console.log('ConnectScreen.disconnect: success');
        this.setState({ status: 'disconnect: success' });
      })
      .catch(() => {
        console.log('ConnectScreen.disconnect: fail');
        this.setState({ status: 'disconnect: fail' });
      });
  }

  sendMessage() {
    console.log('ConnectScreen.sendMessage');
    let msg = ChatMessage.createTextMessage(
      'asteriskhx2',
      Date.now().toString(),
      ChatMessageChatType.PeerChat
    );
    const callback = new (class s implements ChatMessageStatusCallback {
      that: ConnectScreen;
      constructor(cs: ConnectScreen) {
        this.that = cs;
      }
      onProgress(locaMsgId: string, progress: number): void {
        console.log(
          'ConnectScreen.sendMessage.onProgress ',
          locaMsgId,
          progress
        );
      }
      onError(locaMsgId: string, error: ChatError): void {
        console.log('ConnectScreen.sendMessage.onError ', locaMsgId, error);
        if (this.that.messages.has(locaMsgId)) {
          let m = this.that.messages.get(locaMsgId);
          if (m) {
            m.status = ChatMessageStatus.FAIL;
          }
          this.that.updateMessageStatus(ChatMessageStatus.FAIL);
        }
      }
      onSuccess(message: ChatMessage): void {
        console.log('ConnectScreen.sendMessage.onSuccess', message.localMsgId);
        if (this.that.messages.has(message.localMsgId)) {
          this.that.messages.set(message.localMsgId, message);

          const m = this.that.messages.get(message.localMsgId);
          if (m) {
            m.status = ChatMessageStatus.SUCCESS;
          }

          this.that.updateMessageStatus(message.status);
        }
      }
    })(this);
    this.messages.set(msg.localMsgId, msg);
    ChatClient.getInstance()
      .chatManager.sendMessage(msg, callback)
      .then(() => console.log('send success'))
      .catch(() => console.log('send failed'));
  }

  updateMessageStatus(status: ChatMessageStatus): void {
    this.setState({ message: status.valueOf().toString() });
  }

  render() {
    const { status, message } = this.state;
    return (
      <ScrollView>
        <View style={styleValue}>
          <Button
            title="连接服务器"
            onPress={() => {
              this.connect();
            }}
          />
        </View>
        <View style={styleValue}>
          <Button
            title="从服务器断开"
            onPress={() => {
              this.disconnect();
            }}
          />
        </View>
        <View style={styleValue}>
          <Button
            title="发送消息"
            onPress={() => {
              this.sendMessage();
            }}
          />
        </View>
        <Text>连接状态: {status}</Text>
        <Text>消息状态: {message}</Text>
      </ScrollView>
    );
  }
}
