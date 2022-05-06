
_English | [中文](README.zh.md)_
# Getting Started with the Chat Service Built upon React Native

This page describes how to integrate the chat service built with React Native to implement peer-to-peer messaging. 

## Environment Requirements

- MacOS 10.15.7 or later
- Xcode 12.4 or later, including CLI tools.
- Android Studio 4.0 or later, including JDK 1.8 or later
- NodeJs 16 or later, including npm
- CocoaPods
- Yarn
- Watchman
- React Native CLI
- (Optional) ios-deploy, a compilation tool for the iOS platform
- react 16.13.1 or later
- react-native 0.63.4 or later

### Configuration Environment

If you have any problems when configuring the development environment or operating environment, see (./docs/developer.md).

## Register a developer account

Register a developer account and get an App Key. See [Log into Console](https://console.easemob.com/user/login).


## Create the `react-native app` project

```sh
npx react-native init rn_demo
cd rn_demo
yarn
```

## Integrate the Chat React Native SDK

```sh
yarn add react-native-chat-sdk
```
If you run `yarn` for the first time, you also need to run the following command:

```sh
cd node_modules/react-native-chat-sdk/native_src/cpp 
sh generate.sh --type rn
```

## Implement APIs    

1. Initialize the chat React Native SDK.

```typescript
ChatClient.getInstance().init(
  new ChatOptions({ appKey: 'xxx', autoLogin: false })
);
```

2. Log into the chat app.

```typescript
ChatClient.getInstance()
  .login('xxx', 'yyy')
  .then(() => {
    console.log('ClientScreen.login: success');
  })
  .catch((reason: any) => {
    console.log('ClientScreen.login: fail');
  });
```

3. (Optional) Receive a message.

```typescript
let msgListener = new (class ss implements ChatManagerListener {
  that: ConnectScreen;
  constructor(parent: any) {
    this.that = parent as ConnectScreen;
  }
  onMessagesReceived(messages: ChatMessage[]): void {
    console.log('ConnectScreen.onMessagesReceived', messages);
    this.that.msgId = (++ConnectScreen.count).toString();
  }
  onCmdMessagesReceived(messages: ChatMessage[]): void {
    console.log('ConnectScreen.onCmdMessagesReceived', messages);
  }
  onMessagesRead(messages: ChatMessage[]): void {
    console.log('ConnectScreen.onMessagesRead', messages);
  }
  onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
    console.log('ConnectScreen.onGroupMessageRead', groupMessageAcks);
  }
  onMessagesDelivered(messages: ChatMessage[]): void {
    console.log('ConnectScreen.onMessagesDelivered', messages);
  }
  onMessagesRecalled(messages: ChatMessage[]): void {
    console.log('ConnectScreen.onMessagesRecalled', messages);
  }
  onConversationsUpdate(): void {
    console.log('ConnectScreen.onConversationsUpdate');
  }
  onConversationRead(from: string, to?: string): void {
    console.log('ConnectScreen.onConversationRead', from, to);
  }
})(this);

ChatClient.getInstance().chatManager.addListener(msgListener);
```

4. Send a text message.

```typescript
let msg = ChatMessage.createTextMessage(
  'yyy',
  Date.now().toString(),
  ChatMessageChatType.PeerChat
);
const callback = new (class s implements ChatMessageStatusCallback {
  that: ConnectScreen;
  constructor(cs: ConnectScreen) {
    this.that = cs;
  }
  onProgress(locaMsgId: string, progress: number): void {
    console.log('ConnectScreen.sendMessage.onProgress ', locaMsgId, progress);
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
```

5. Log out of the chat app.

```typescript
ChatClient.getInstance()
  .logout()
  .then(() => {
    console.log('ClientScreen.logout: success');
  })
  .catch((reason: any) => {
    console.log('ClientScreen.logout: fail');
  });
```

## Implement the demo

1. Delete all source code from the `App.js` file.
   
2. Import dependencies. 
```typescript
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ChatClient,
  ChatOptions,
  ChatMessageChatType,
  ChatMessage,
} from 'react-native-chat-sdk';
```

3. Add the app.
```typescript
const App = () => {
  // TODO: Add private data.
  const title = 'AgoraChatQuickstart';
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [content, setContent] = React.useState('');
  const [logText, setWarnText] = React.useState('Show log area');

  // TODO: Add methods.

  // TODO: Add the UI code.

}
```

4. Add the UI code to the `App` object.
```typescript
  return (
    <SafeAreaView>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView>
        <View style={styles.inputCon}>
          <TextInput
            multiline
            style={styles.inputBox}
            placeholder="Enter username"
            onChangeText={text => setUsername(text)}
            value={username}
          />
        </View>
        <View style={styles.inputCon}>
          <TextInput
            multiline
            style={styles.inputBox}
            placeholder="Enter password"
            onChangeText={text => setPassword(text)}
            value={password}
          />
        </View>
        <View style={styles.buttonCon}>
          <Text style={styles.eachBtn} onPress={registerAccount}>
            SIGN UP
          </Text>
          <Text style={styles.eachBtn} onPress={login}>
            SIGN IN
          </Text>
          <Text style={styles.eachBtn} onPress={logout}>
            SIGN OUT
          </Text>
        </View>
        <View style={styles.inputCon}>
          <TextInput
            multiline
            style={styles.inputBox}
            placeholder="Enter the username you want to send"
            onChangeText={text => setUserId(text)}
            value={userId}
          />
        </View>
        <View style={styles.inputCon}>
          <TextInput
            multiline
            style={styles.inputBox}
            placeholder="Enter content"
            onChangeText={text => setContent(text)}
            value={content}
          />
        </View>
        <View style={styles.buttonCon}>
          <Text style={styles.btn2} onPress={sendmsg}>
            SEND TEXT
          </Text>
        </View>
        <View>
          <Text style={styles.logText}>{logText}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
```

3. Add methods to the `App` object.
```typescript
  const registerAccount = () => {
    ChatClient.getInstance()
      .createAccount(username, password)
      .then(() => {
        console.log('register: success');
        setWarnText('register: success');
      })
      .catch(reason => {
        console.log('register: fail', reason);
        setWarnText('register: fail' + reason);
      });
  };

  const login = () => {
    setWarnText(`username:${username},password:${password}`);
    let listener = {
      onTokenWillExpire() {
        console.log('onTokenWillExpire');
        setWarnText('onTokenWillExpire');
      },
      onTokenDidExpire() {
        console.log('onTokenDidExpire');
        setWarnText('onTokenDidExpire');
      },
      onConnected() {
        console.log('onConnected');
        setWarnText('onConnected');
      },
      onDisconnected(errorCode) {
        console.log('onDisconnected: ', errorCode);
        setWarnText('onDisconnected' + errorCode);
      },
    };
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance().addConnectionListener(listener);
    ChatClient.getInstance()
      .login('asteriskhx1', 'qwer')
      .then(() => {
        console.log('login: success');
        setWarnText('login: success');
      })
      .catch(reason => {
        console.log('login: fail', reason);
        setWarnText('login: fail' + JSON.stringify(reason));
      });
  };

  const logout = () => {
    ChatClient.getInstance()
      .logout()
      .then(() => {
        console.log('logout: success');
        setWarnText('logout: success');
      })
      .catch(reason => {
        console.log('logout: fail', reason);
        setWarnText('logout: fail' + reason);
      });
  };

  const sendmsg = () => {
    let msg = ChatMessage.createTextMessage(
      userId,
      content,
      ChatMessageChatType.PeerChat,
    );
    const callback = new (class {
      onProgress(locaMsgId, progress) {
        console.log('onProgress ', locaMsgId, progress);
        setWarnText('onProgress: ' + locaMsgId + progress);
      }
      onError(locaMsgId, error) {
        console.log('onError ', locaMsgId, error);
        setWarnText('onError: ' + locaMsgId + error);
      }
      onSuccess(message) {
        console.log('onSuccess', message.localMsgId);
        setWarnText('onError: ' + message.localMsgId);
      }
    })();
    ChatClient.getInstance()
      .chatManager.sendMessage(msg, callback)
      .then(() => {
        console.log('send success');
        setWarnText('send success: ' + msg.localMsgId);
      })
      .catch(reason => {
        console.log('send failed');
        setWarnText('send fail: ' + reason);
      });
  };
```

4. Compile, build, and run the chat service.

* Android: **Real devices** with Android **6.0** or later
    1. Enable the developer mode for the device.
    2. Connect the Android device to the Mac system.
    3. Start `android studio app` and open the `rn_demo` project in the `android` folder. Wait for the sync server ti 
    4. Set permissions in the `android/app/src/main/AndroidManifest.xml` file, including network permissions, file read/write permissions, and recording and album permissions.
    5. On Terminal, run `adb reverse tcp:8081 tcp:8081` to enable data forwarding.   
    6. Run the `yarn start` command to start the service. Generally, the service does not start automatically upon the creation of an Android project.
    7. Build and run `rn_demo` with the Android Studio app.
    
* iOS: **Real devices** with iOS **11.0** or later
    1. Enable the developer mode mode for a real iPhone device.
    2. Connect the iOS device to the Mac system and choose to trust the system. 
    3. Run the `cd ios && pod install --repo-update` command for when you create or update the `rn_demo` project for the first time.
    4. Start `xcode app` and open the `rn_demo` project in the `ios` folder.
    5. Set permissions in `info`, including network permissions, file read/write permissions, and recording and album permissions.
    6. Set the app signature. This is required for real devices.
    7. Set the target `iphone` version to `11.0` in `general`.
    8. Build and run the `rn_demo` project on the `xcode app`.

*  Create and build the `rn_demo` project with Visual Studio Code. In this case, some operations still need to be done in Xcode or Android Studio.
   1. On Terminal, run the `yarn start` command to start the service.
   2. Build and run `rn_demo` on an Android device: Enable data forwarding and run the `yarn android` command on Terminal. The connected real device is selected automatically.
   3. Build and run `rn_demo` on an iOS device: Run the `npx react-native run-ios --device ${iphone-name}` on Terminal. As the connected real device is not selected automatically, you cannot use the `yarn ios` command.


## Run the demo

You can [download the source code](https://github.com/easemob/react-native-chat-sdk) to run the demo in the `example` folder and experience **`api references`**.
You can [download a separate demo](https://github.com/AsteriskZuo/test_chat_sdk) and integrate it.

## Windows developer
Windows developer, see [here](./docs/windows.md).  

## Contributing

For how to contribute to the repository and the development workflow, see [contributing guide](./CONTRIBUTING.md).

## Changelog

See the [change log](./CHANGELOG.md).  

## License

MIT

## Q&A

For any problems, see (./docs/others.md).
