# 环信即时通讯 IM React-Native 快速入门

更新时间：2022-04-14

本文介绍如何快速集成环信即时通讯 IM React-Native SDK 实现单聊。

## 环境要求

- MacOS 10.15.7 或以上版本
- Xcode 12.4 或以上版本，包括命令行工具
- Android Studio 4.0 或以上版本，包括 JDK1.8 以上版本
- NodeJs 16 或以上版本，包含 npm 包管理工具
- Cocoapods 包管理工具
- Yarn 编译运行工具
- Watchman 调试工具
- react-native-cli 命令行工具
- ios-deploy 非Xcode编译react-native工具（可选）
- react 版本不低于16.13.1
- react-native 版本不低于0.63.4

### 配置环境

[配置开发或者运行环境如果遇到问题，请参考这里](./docs/developer.md)

## 注册开发者账号

注册开发者账号，以及获取`appkey`获取，[传送门](https://console.easemob.com/user/login)。

## 创建`react-native app`项目

```sh
npx react-native init rn_demo
cd rn_demo
yarn
```

## 集成`IM react-native SDK`

```sh
yarn add react-native-chat-sdk
```
如果是第一次运行`yarn`则还是额外执行一下命令:   
```sh
cd node_modules/react-native-chat-sdk/native_src/cpp 
sh generate.sh --type rn
```

## API实现样例

1. 初始化

```typescript
ChatClient.getInstance().init(
  new ChatOptions({ appKey: 'xxx', autoLogin: false })
);
```

2. 用户登录

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

3. 接收消息（可选）

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

4. 发送文本消息

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

5. 退出登录

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

## demo代码样例

1. 添加依赖导入
```typescript
import {ChatClient, ChatOptions} from 'react-native-chat-sdk';
```

2. 可以点击登录的按钮
```typescript
<Button
  title="test"
  onPress={() => {
    let o = new ChatOptions({
      autoLogin: false,
      appKey: 'easemob-demo#easeim',
    });
    ChatClient.getInstance()
      .init(o)
      .then(() => {
        console.log('success');
        let listener = {
          onTokenWillExpire() {
            console.log('ClientScreen.onTokenWillExpire');
          },
          onTokenDidExpire() {
            console.log('ClientScreen.onTokenDidExpire');
          },
          onConnected() {
            console.log('ClientScreen.onConnected');
          },
          onDisconnected(errorCode) {
            console.log('ClientScreen.onDisconnected: ', errorCode);
          },
        };
        ChatClient.getInstance().removeAllConnectionListener();
        ChatClient.getInstance().addConnectionListener(listener);
        ChatClient.getInstance()
          .login('asteriskhx1', 'qwer')
          .then(() => {
            console.log('ClientScreen.login: success');
          })
          .catch(reason => {
            console.log('ClientScreen.login: fail', reason);
          });
      })
      .catch(() => {
        console.log('error');
      });
  }}
/>
```

3. 编译构建和运行
  * android设备: 6.0或以上的真机
    1. 设置真机为开发者的可调式模式
    2. 连接android真机设备到Mac系统
    3. 启动`android studio app`，打开`android`文件夹的`rn_demo`项目，等待sync完成
    4. 在`android/app/src/main/AndroidManifest.xml`文件中，设置权限: 包括网络权限、文件读写、录音、相册等。
    5. 在`terminal`命令行执行`adb reverse tcp:8081 tcp:8081`，开启数据转发
    6. 手动启动服务(android项目构建一般会不自动启动服务) 所以执行命令 `yarn start`
    7. 使用android studio app 构建并运行`rn_demo`。
  * ios设备: 11.0版本或以上的真机
    1. iphone真机设置为开发者模式，
    2. 连接ios真机设备到Mac系统，选择信任该Mac系统
    3. 第一次或者更新项目之后，需要执行`cd ios && pod install --repo-update`
    4. 启动`xcode app`，打开`ios`文件夹下的`rn_demo`项目
    5. 在`info`中添加相应权限: 包括网络权限、文件读写、录音、相册等。
    6. 由于是真机，需要设置app签名
    7. 在`general`中设置`iphone`开发目标平台`12.0`
    8. 在`xcode app`中，构建并运行`rn_demo`项目。
  * 使用vscode app进行构建和运行，上面的需求条件也必须满足，不然也无法正常构建和运行。
    1. 在命令行执行`yarn start`启动服务
    2. 构建并运行android: 设置数据转发，然后在`terminal`执行`yarn android`命令。(android自动选择已连接的真机)
    3. 构建并运行ios: 在`terminal`执行`npx react-native run-ios --device ${iphone-name}`命令。(ios默认不会选择已连接的真机，所以不能使用命令`yarn ios`)

## 快速 demo 体验

可以下载源码运行 example 下的 demo，进行体验。 [传送门](https://github.com/easemob/react-native-chat-sdk)。
可以下载 单独运行的 demo，进行体验。[传送门](https://github.com/AsteriskZuo/test_chat_sdk)。    

## Contributing

See the [contributing guide](../CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

## Q&A

[如果遇到问题可以参考这里](./docs/others.md)
