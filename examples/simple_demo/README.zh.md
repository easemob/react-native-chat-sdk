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
cd node_modules/react-native-chat-sdk/native_src/cpp && sh generate.sh --type rn && cd ../../../..
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
