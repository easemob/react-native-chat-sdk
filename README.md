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

## 代码实现

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

6. 运行
```sh
# 运行服务
yarn start

# 运行android
# 如果是第一次运行android 则需要注意，需要手机和电脑在同一个网络，并且设置端口数据转发`adb reverse tcp:8081 tcp:8081`
yarn android

# 运行ios，默认是模拟器但react-native部分组件可能不支持
yarn ios

# 运行ios真机 需要使用xcode打开设置好签名, 并且运行`cd ios && pod install`
npx react-native run-ios --device ${iphone-name}
```

## 快速 demo 体验

可以下载源码运行 example 下的 demo，进行体验。 [传送门](https://github.com/easemob/react-native-chat-sdk)。

## Contributing

See the [contributing guide](../CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

## Q&A

[如果遇到问题可以参考这里](./docs/others.md)
