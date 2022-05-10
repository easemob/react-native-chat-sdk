_Chinese | [English](./quick-start.md)_

# 环信即时通讯 IM React-Native 快速入门

更新时间：2022-05-10

通过本文可以实现一个集成聊天 SDK 的简单 app。

## 实现原理

下图展示在客户端发送和接收一对一文本消息的工作流程。
![工作流程图](https://web-cdn.agora.io/docs-files/1644379153389)

## 编译运行的条件要求

- MacOS 10.15.7 或以上版本
- Xcode 12.4 或以上版本，包括命令行工具
- Android Studio 4.0 或以上版本，包括 JDK 1.8 或以上版本
- NodeJs 16 或以上版本，包含 npm 包管理工具
- CocoaPods 包管理工具
- Yarn 编译运行工具
- Watchman 调试工具
- react-native-cli 命令行工具
- react 16.13.1 或以上版本
- react-native 0.63.4 或以上版本

### 条件的具体说明

[配置开发或者运行环境如果遇到问题，请参考这里](./docs/developer.md)

## 注册开发者账号

注册开发者账号以及获取 App Key，[传送门](https://console.easemob.com/user/login)。

### 关于注册

SDK 也提供了注册方式，建议在正式的环境中使用。

## 创建个人的发送文本消息的 demo 项目

### 使用命令创建项目

打开终端，进入需要创建项目的目录，输入命令进行`react-native`项目创建:

```bash
npx react-native init simple_demo
cd simple_demo
yarn
```

### 集成 SDK

在终端命令行，输入命令添加依赖:

```bash
yarn add react-native-chat-sdk
```

### android 平台需要执行脚本

对于 android 平台，需要执行预构建脚本生成需要的文件。

```bash
cd node_modules/react-native-chat-sdk/native_src/cpp
sh generate.sh --type rn
cd ../../../..
```

### ios 平台需要执行 pod 工具

在终端命令行，输入命令执行 pod:

```bash
cd ios
pod install
cd ..
```

### 添加示例代码

建议使用`visual studio code`打开文件夹`simple_demo`.  
打开文件`App.js`
删除全部内容，添加如下内容:

```typescript
import React from 'react';
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
  const title = 'AgoraChatQuickstart';
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [content, setContent] = React.useState('');
  const [logText, setWarnText] = React.useState('Show log area');

  const setListener = () => {
    let msgListener = {
      onMessagesReceived(messages) {
        console.log('onMessagesReceived: ', messages);
        setWarnText('onMessagesReceived: ' + JSON.stringify(messages));
      },
      onCmdMessagesReceived: messages => {
        console.log('onCmdMessagesReceived: ', messages);
      },
      onMessagesRead: messages => {
        console.log('onMessagesRead: ', messages);
      },
      onGroupMessageRead: groupMessageAcks => {
        console.log('onGroupMessageRead: ', groupMessageAcks);
      },
      onMessagesDelivered: messages => {
        console.log(`onMessagesDelivered: ${messages.length}: `, messages);
      },
      onMessagesRecalled: messages => {
        console.log('onMessagesRecalled: ', messages);
      },
      onConversationsUpdate: () => {
        console.log('onConversationsUpdate: ');
      },
      onConversationRead: (from, to) => {
        console.log('onConversationRead: ', from, to);
      },
    };

    ChatClient.getInstance().chatManager.removeAllMessageListener();
    ChatClient.getInstance().chatManager.addMessageListener(msgListener);
  };

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
        setListener();
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
        setWarnText('onSuccess: ' + message.localMsgId);
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
  },
  btn2: {
    height: 40,
    width: '45%',
    lineHeight: 40,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#6200ED',
  },
  logText: {
    padding: 10,
    marginTop: 10,
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
});

(function init() {
  let o = new ChatOptions({
    autoLogin: false,
    appKey: 'easemob-demo#easeim',
  });
  ChatClient.getInstance()
    .init(o)
    .then(() => {
      console.log('success');
    })
    .catch(() => {
      console.log('error');
    });
})();

export default App;
```

### 编译并在 ios 真机运行

> 1. 连接 iphone 手机，设置为开发者模式；
> 2. 打开`ios`文件夹，使用`xcode`打开`simple_demo.xcworkspace`工程文件；
> 3. 在`xcode`中，在签名选项下设置应用签名；
> 4. 点击构建并运行按钮；
> 5. 程序构建完成后，自动安装和运行，并显示应用界面。
>    ![](./res/ios-1.png)

### 编译并在 ios 模拟器中运行

> 1. 打开`ios`文件夹，使用`xcode`打开`simple_demo.xcworkspace`工程文件；
> 2. 在`xcode`中，选择模拟器`iphone13`；
> 3. 点击构建并运行按钮；
> 4. 程序构建完成后，自动安装和运行，并显示应用界面。
>    ![](./res/ios-2.png)

### 编译并在 android 真机运行

> 1. 使用`android studio`打开`android`文件夹；
> 2. 连接 android 系统手机，设置为开发者模式，并且设置 usb 可调式；
> 3. 设置数据转发: 在终端命令行输入`adb reverse tcp:8081 tcp:8081`；
> 4. 启动服务: 执行`package.json`里面的命令: `"start": "react-native start"`, 在终端中运行命令`yarn start`；
> 5. 点击构建并运行按钮；
> 6. 程序构建完成后，自动安装和运行，并显示应用界面。
>    ![](./res/android-1.png)

### 验证 SDK

#### 验证登录

> 1. 输入用户名 和 密码；
> 2. 点击 登录 按钮；
> 3. 界面下方会提示登录结果。

#### 验证退出

> 1. 点击 退出 按钮；
> 2. 界面下方会提示退出结果。

#### 验证注册

没有注册的用户无法登录。所以，可以在该界面进行注册，或者[在控制台进行注册](https://console.easemob.com/user/login)。

> 1. 输入 用户名 和 密码；
> 2. 点击 注册 按钮；
> 3. 界面下面提示注册结果。

#### 验证发送消息

登录成功之后就可以发送消息。

> 1. 输入发送内容；
> 2. 点击 发送 按钮；
> 3. 界面下方提示发送结果。

#### 验证接收消息

登录成功之后就可以接收消息。可以使用另外一台设备进行消息发送。

> 1. 另外设备登录并发送消息；
> 2. 该设备收到消息并提示接收结果。
