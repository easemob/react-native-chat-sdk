_English | [Chinese](./quick-start.zh.md)_

# Huanxin IM React-Native Quick Start

Update time: 2022-05-10

Through this article, a simple app that integrates the chat SDK can be implemented.

## Implementation principle

The following diagram shows the workflow for sending and receiving one-to-one text messages on the client side.
![Workflow diagram](https://web-cdn.agora.io/docs-files/1643335864426)

## Conditional requirements for compilation and running

- MacOS 10.15.7 or above
- Xcode 12.4 or above, including command line tools
- Android Studio 4.0 or above, including JDK 1.8 or above
- NodeJs 16 or above, including npm package management tool
- CocoaPods package management tool
- Yarn compile and run tool
- Watchman debugging tool
- react-native-cli command line tool
- react 16.13.1 or above
- react-native 0.63.4 or above

### Condition specification

[If you encounter problems configuring the development or runtime environment, please refer to here](./docs/developer.md)

## Register a developer account

Register a developer account and get the App Key, [Portal](https://console.easemob.com/user/login).

### About registration

The SDK also provides a registration method, which is recommended to be used in a formal environment.

## Create a personal demo project for sending text messages

### Create project using command

Open the terminal, enter the directory where the project needs to be created, and enter the command to create the `react-native` project:

```bash
npx react-native init simple_demo
cd simple_demo
yarn
```

### Integrated SDK

At the terminal command line, enter the command to add dependencies:

```bash
yarn add react-native-chat-sdk
```

### android platform needs to execute scripts

For the android platform, a pre-build script needs to be executed to generate the required files.

```bash
cd node_modules/react-native-chat-sdk/native_src/cpp && sh generate.sh --type rn && cd ../../../..
```

### The ios platform needs to execute the pod tool

At the terminal command line, enter the command to execute the pod:

```bash
cd ios
pod install
cd..
```

### Add sample code

It is recommended to use `visual studio code` to open the folder `simple_demo`.
Open the file `App.js`
Delete everything and add the following:

```typescript
import React, {useEffect} from 'react';
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

const App = () => {
  const title = 'ChatQuickstart';
  const [appKey, setAppKey] = React.useState('easemob-demo#easeim');
  const [username, setUsername] = React.useState('asterisk001');
  const [password, setPassword] = React.useState('qwer');
  const [userId, setUserId] = React.useState('');
  const [content, setContent] = React.useState('');
  const [logText, setWarnText] = React.useState('Show log area');

  useEffect(() => {
    logText.split('\n').forEach((value, index, array) => {
      if (index === 0) {
        console.log(value);
      }
    });
  }, [logText]);

  const rollLog = text => {
    setWarnText(preLogText => {
      let newLogText = text;
      preLogText
        .split('\n')
        .filter((value, index, array) => {
          if (index > 8) {
            return false;
          }
          return true;
        })
        .forEach((value, index, array) => {
          newLogText += '\n' + value;
        });
      return newLogText;
    });
  };

  const setMessageListener = () => {
    let msgListener = {
      onMessagesReceived(messages) {
        for (let index = 0; index < messages.length; index++) {
          rollLog('received msgId: ' + messages[index].msgId);
        }
      },
      onCmdMessagesReceived: messages => {},
      onMessagesRead: messages => {},
      onGroupMessageRead: groupMessageAcks => {},
      onMessagesDelivered: messages => {},
      onMessagesRecalled: messages => {},
      onConversationsUpdate: () => {},
      onConversationRead: (from, to) => {},
    };

    ChatClient.getInstance().chatManager.removeAllMessageListener();
    ChatClient.getInstance().chatManager.addMessageListener(msgListener);
  };

  const init = () => {
    let o = new ChatOptions({
      autoLogin: false,
      appKey: appKey,
    });
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance()
      .init(o)
      .then(() => {
        rollLog('init success');
        this.isInitialized = true;
        let listener = {
          onTokenWillExpire() {
            rollLog('token expire.');
          },
          onTokenDidExpire() {
            rollLog('token did expire');
          },
          onConnected() {
            rollLog('login success.');
            setMessageListener();
          },
          onDisconnected(errorCode) {
            rollLog('login fail: ' + errorCode);
          },
        };
        ChatClient.getInstance().addConnectionListener(listener);
      })
      .catch(error => {
        rollLog(
          'init fail: ' +
            (error instanceof Object ? JSON.stringify(error) : error),
        );
      });
  };

  const registerAccount = () => {
    if (this.isInitialized === false || this.isInitialized === undefined) {
      rollLog('Perform initialization first.');
      return;
    }
    rollLog('start register account ...');
    ChatClient.getInstance()
      .createAccount(username, password)
      .then(response => {
        rollLog(`register success: userName = ${username}, password = ******`);
      })
      .catch(error => {
        rollLog('register fail: ' + JSON.stringify(error));
      });
  };

  const loginWithPassword = () => {
    if (this.isInitialized === false || this.isInitialized === undefined) {
      rollLog('Perform initialization first.');
      return;
    }
    rollLog('start login ...');
    ChatClient.getInstance()
      .login(username, password)
      .then(() => {
        rollLog('login operation success.');
      })
      .catch(reason => {
        rollLog('login fail: ' + JSON.stringify(reason));
      });
  };

  const logout = () => {
    if (this.isInitialized === false || this.isInitialized === undefined) {
      rollLog('Perform initialization first.');
      return;
    }
    rollLog('start logout ...');
    ChatClient.getInstance()
      .logout()
      .then(() => {
        rollLog('logout success.');
      })
      .catch(reason => {
        rollLog('logout fail:' + JSON.stringify(reason));
      });
  };

  const sendmsg = () => {
    if (this.isInitialized === false || this.isInitialized === undefined) {
      rollLog('Perform initialization first.');
      return;
    }
    let msg = ChatMessage.createTextMessage(
      userId,
      content,
      ChatMessageChatType.PeerChat,
    );
    const callback = new (class {
      onProgress(locaMsgId, progress) {
        rollLog(`send message process: ${locaMsgId}, ${progress}`);
      }
      onError(locaMsgId, error) {
        rollLog(`send message fail: ${locaMsgId}, ${JSON.stringify(error)}`);
      }
      onSuccess(message) {
        rollLog('send message success: ' + message.localMsgId);
      }
    })();
    rollLog('start send message ...');
    ChatClient.getInstance()
      .chatManager.sendMessage(msg, callback)
      .then(() => {
        rollLog('send message: ' + msg.localMsgId);
      })
      .catch(reason => {
        rollLog('send fail: ' + JSON.stringify(reason));
      });
  };

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
            placeholder="Enter appkey"
            onChangeText={text => setAppKey(text)}
            value={appKey}
          />
        </View>
        <View style={styles.buttonCon}>
          <Text style={styles.btn2} onPress={init}>
            INIT SDK
          </Text>
        </View>
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
          <Text style={styles.eachBtn} onPress={loginWithPassword}>
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
          <Text style={styles.logText} multiline={true}>
            {logText}
          </Text>
        </View>
        <View>
          <Text style={styles.logText}>{}</Text>
        </View>
        <View>
          <Text style={styles.logText}>{}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    height: 60,
    backgroundColor: '#6200ED',
  },
  title: {
    lineHeight: 60,
    paddingLeft: 15,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  inputCon: {
    marginLeft: '5%',
    width: '90%',
    height: 60,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  inputBox: {
    marginTop: 15,
    width: '100%',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonCon: {
    marginLeft: '2%',
    width: '96%',
    flexDirection: 'row',
    marginTop: 20,
    height: 26,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  eachBtn: {
    height: 40,
    width: '28%',
    lineHeight: 40,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#6200ED',
    borderRadius: 5,
  },
  btn2: {
    height: 40,
    width: '45%',
    lineHeight: 40,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#6200ED',
    borderRadius: 5,
  },
  logText: {
    padding: 10,
    marginTop: 10,
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default App;
```

### Compile and run on ios real machine

> 1. Connect the iphone and set it to developer mode;
> 2. Open the `ios` folder and use `xcode` to open the `simple_demo.xcworkspace` project file;
> 3. In `xcode`, set the application signature under the signature option;
> 4. Click the Build and Run button;
> 5. After the program is built, it will be installed and run automatically, and the application interface will be displayed.
>    ![](./res/ios-1.png)

### Compile and run in ios simulator

> 1. Open the `ios` folder and use `xcode` to open the `simple_demo.xcworkspace` project file;
> 2. In `xcode`, select the simulator `iphone13`;
> 3. Click the Build and Run button;
> 4. After the program is built, it will be automatically installed and run, and the application interface will be displayed.
>    ![](./res/ios-2.png)

### Compile and run on android real machine

> 1. Use `android studio` to open the `android` folder;
> 2. Connect to android phone, set to developer mode, and set usb adjustable;
> 3. Set data forwarding: enter `adb reverse tcp:8081 tcp:8081` in the terminal command line;
> 4. Start the service: execute the command in `package.json`: `"start": "react-native start"`, run the command `yarn start` in the terminal;
> 5. Click the Build and Run button;
> 6. After the program is built, it will be installed and run automatically, and the application interface will be displayed.
>    ![](./res/android-1.png)

### Verify SDK

#### Verify login

> 1. Enter username and password;
> 2. Click the Login button;
> 3. The login result will be prompted at the bottom of the interface.

#### verify exit

> 1. Click the Exit button;
> 2. The bottom of the interface will prompt the exit result.

#### Verify registration

Unregistered users cannot log in. So, you can register in this interface, or [register in console](https://console.easemob.com/user/login).

> 1. Enter username and password;
> 2. Click the Register button;
> 3. The registration result is prompted at the bottom of the interface.

#### Verify sending message

After logging in successfully, you can send messages.

> 1. Enter the content to send;
> 2. Click the Send button;
> 3. At the bottom of the interface, you will be prompted to send the result.

#### Verify received message

After successful login, you can receive messages. Messages can be sent using another device.

> 1. Another device logs in and sends a message;
> 2. The device receives a message and prompts the reception result.
