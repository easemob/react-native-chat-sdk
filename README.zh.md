_Chinese | [English](./README.md)_

_Update time: 2024-12-19_

- [ChatSDK 介绍](#chatsdk-介绍)
  - [开发环境要求](#开发环境要求)
  - [集成 ChatSDK](#集成-chatsdk)
  - [快速开始](#快速开始)
  - [贡献](#贡献)
  - [许可证](#许可证)

# ChatSDK 介绍

即时通讯 SDK（软件开发工具包）是一组工具、库和 API，旨在将实时消息传递功能集成到应用程序中。它允许开发人员轻松地将文本、语音和视频通信功能添加到移动应用、网站或其他平台，而无需从头构建通信基础设施。

## 开发环境要求

- MacOS 12 或更高版本
- React-Native 0.66 或更高版本
- NodeJs 16.18 或更高版本

对于 iOS 应用：

- Xcode 13 或更高版本及其相关的依赖工具。

对于 Android 应用：

- Android Studio 2021 或更高版本及其相关的依赖工具。

## 集成 ChatSDK

```sh
npm install react-native-chat-sdk
# 或
yarn add react-native-chat-sdk
```

## 快速开始

1. 初始化 SDK

   ```typescript
   // 请使用appkey或appId进行初始化。
   const appKey = '<您的app key>';
   const appId = '<您的app ID>';
   ChatClient.getInstance()
     .init(
       appKey !== undefined
         ? ChatOptions.withAppKey({
             appKey: appKey,
             autoLogin: false,
           })
         : ChatOptions.withAppId({
             appId: appId,
             autoLogin: false,
           })
     )
     .then(() => {
       console.log('初始化成功');
     })
     .catch((reason) => {
       console.error(reason);
     });
   ```

2. 连接到服务器

   ```typescript
   // 连接到服务器
   const userId = '<您的用户ID>';
   const userToken = '<您的用户令牌>';
   ChatClient.getInstance()
     .loginWithToken(userId, userToken)
     .then((value) => {
       console.log(`登录成功`, value);
     })
     .catch((reason) => {
       console.error(reason);
     });
   ```

3. 发送消息

   ```typescript
   // 发送消息
   ChatClient.getInstance()
     .chatManager.sendMessage(message, {
       onError: (localMsgId: string, error: ChatError) => {
         console.error(error);
       },
       onSuccess: (message: ChatMessage) => {
         console.log(`发送成功`, message);
       },
     })
     .catch((reason) => {
       console.error(reason);
     });
   ```

## 贡献

请参阅[贡献指南](CONTRIBUTING.md)，了解如何为该仓库和开发流程做出贡献。

## 许可证

MIT
