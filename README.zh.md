_Chinese | [English](README.md)_

# 环信即时通讯 IM React-Native 快速入门

更新时间：2022-04-14

本文介绍如何快速集成环信即时通讯 IM React-Native SDK 实现单聊。

## 环境要求

- MacOS 10.15.7 或以上版本
- Xcode 12.4 或以上版本，包括命令行工具
- Android Studio 4.0 或以上版本，包括 JDK 1.8 或以上版本
- NodeJs 16 或以上版本，包含 npm 包管理工具
- CocoaPods 包管理工具
- Yarn 编译运行工具
- Watchman 调试工具
- react-native-cli 命令行工具
- （可选）ios-deploy，iOS 平台的编译工具
- react 16.13.1 或以上版本
- react-native 0.63.4 或以上版本

### 配置环境

[配置开发或者运行环境如果遇到问题，请参考这里](./docs/developer.md)

## 注册开发者账号

注册开发者账号以及获取 App Key，[传送门](https://console.easemob.com/user/login)。

## 创建 `react-native app` 项目

```sh
npx react-native init rn_demo
cd rn_demo
yarn
```

## 集成 `IM react-native SDK`

```sh
yarn add react-native-chat-sdk
```
如果是第一次运行 `yarn` 则还需执行以下命令:   
```sh
cd node_modules/react-native-chat-sdk/native_src/cpp 
sh generate.sh --type rn
```

## API 实现样例

1. 初始化。

```typescript
ChatClient.getInstance().init(
  new ChatOptions({ appKey: 'xxx', autoLogin: false })
);
```

2. 用户登录。

```typescript
ChatClient.getInstance()
  .login('xxx', 'yyy')
  .then(() => {
    console.log('login: success');
  })
  .catch((reason: any) => {
    console.log('login: fail');
  });
```

3. （可选）接收消息。

```typescript
let msgListener = new (class ss implements ChatManagerListener {
  that: ConnectScreen;
  constructor(parent: any) {
    this.that = parent as ConnectScreen;
  }
  onMessagesReceived(messages: ChatMessage[]): void {
    console.log('onMessagesReceived', messages);
    this.that.msgId = (++count).toString();
  }
  onCmdMessagesReceived(messages: ChatMessage[]): void {
    console.log('onCmdMessagesReceived', messages);
  }
  onMessagesRead(messages: ChatMessage[]): void {
    console.log('onMessagesRead', messages);
  }
  onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
    console.log('onGroupMessageRead', groupMessageAcks);
  }
  onMessagesDelivered(messages: ChatMessage[]): void {
    console.log('onMessagesDelivered', messages);
  }
  onMessagesRecalled(messages: ChatMessage[]): void {
    console.log('onMessagesRecalled', messages);
  }
  onConversationsUpdate(): void {
    console.log('onConversationsUpdate');
  }
  onConversationRead(from: string, to?: string): void {
    console.log('onConversationRead', from, to);
  }
})(this);

ChatClient.getInstance().chatManager.addListener(msgListener);
```

4. 发送文本消息。

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
    console.log('onProgress ', locaMsgId, progress);
  }
  onError(locaMsgId: string, error: ChatError): void {
    console.log('onError ', locaMsgId, error);
    if (this.that.messages.has(locaMsgId)) {
      let m = this.that.messages.get(locaMsgId);
      if (m) {
        m.status = ChatMessageStatus.FAIL;
      }
      this.that.updateMessageStatus(ChatMessageStatus.FAIL);
    }
  }
  onSuccess(message: ChatMessage): void {
    console.log('onSuccess', message.localMsgId);
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

5. 退出登录。

```typescript
ChatClient.getInstance()
  .logout()
  .then(() => {
    console.log('logout: success');
  })
  .catch((reason: any) => {
    console.log('logout: fail');
  });
```

6. 注册用户。

```typescript
ChatClient.getInstance()
  .createAccount('useName', 'password')
  .then((value: any) => {
    console.log('createAccount: success', value);
  })
  .catch((reason: any) => {
    console.log('createAccount: fail', reason);
  });
```

## demo 代码样例

1. 删除文件 `App.js` 中的所有源码。
   
2. 导入依赖。 
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

3. 添加 app。

```typescript
const App = () => {
  // TODO: 添加私有数据。
  const title = 'AgoraChatQuickstart';
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [content, setContent] = React.useState('');
  const [logText, setWarnText] = React.useState('Show log area');

  // TODO: 添加调用接口。

  // TODO: 添加 UI 界面。

}
```

4. 在 `App` 对象里面添加 UI 代码。
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

3. 在 `App` 对象中添加调用接口。
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

4. 编译构建和运行。
  * Android 设备: **6.0**或以上的**真机**
    1. 设置真机为开发者模式。
    2. 连接 android 真机设备到 Mac 系统。
    3. 启动 `android studio app`，打开 `android` 文件夹的 `rn_demo` 项目，等待 sync 完成。
    4. 在 `android/app/src/main/AndroidManifest.xml` 文件中，设置权限: 包括网络权限、文件读写、录音、相册等。
    5. 在 `terminal` 命令行执行`adb reverse tcp:8081 tcp:8081`，开启数据转发。
    6. 运行 `yarn start` 命令启动服务。Android 项目构建一般会不自动启动服务。
    7. 使用 Android Studio app 构建并运行 `rn_demo`。

  * iOS 设备：**11.0** 或以上**真机**
    1. iPhone 真机设置为开发者模式。 
    2. 连接 iOS 真机设备到 Mac 系统，选择信任该 Mac 系统。
    3. 首次创建或者更新项目，需要执行 `cd ios && pod install --repo-update`。
    4. 启动 `xcode app`，打开 `ios` 文件夹下的 `rn_demo` 项目。
    5. 在 `info` 中添加相应权限: 网络权限、文件读写、录音、相册权限等。
    6. 由于是真机，需要设置 app 签名。
    7. 在 `general` 中设置 `iphone` 开发目标平台 `11.0`.
    8. 在`xcode app`中，构建并运行`rn_demo`项目。

  * 使用 vscode app 进行构建和运行。这种情况下，某些操作仍需在 Xcode 或 Android Studio 中执行。
    1. 在命令行界面执行 `yarn start` 启动服务。
    2. 构建并运行 android 的 `rn_demo`项目: 设置数据转发，然后在命令行界面执行 `yarn android` 命令。对于 Android，自动选择已连接的真机。
    3. 构建并运行 ios 的 `rn_demo`项目: 在在命令行界面运行 `npx react-native run-ios --device ${iphone-name}` 命令。iOS 默认不会选择已连接的真机，所以不能使用命令 `yarn ios`。

## 快速 demo 体验

可以下载源码运行 example 下的 demo，进行 **`api references`** 体验。 [传送门](https://github.com/easemob/react-native-chat-sdk)。  
可以下载单独运行的 demo，进行 **集成** 体验。[传送门](https://github.com/AsteriskZuo/test_chat_sdk)。    

## Contributing

See the [contributing guide](./CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## Changelog
See the [change log](./CHANGELOG.md).  

## License

MIT

## Q&A

[如果遇到问题可以参考这里](./docs/others.md)
