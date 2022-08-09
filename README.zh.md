_Chinese | [English](./README.md)_

更新时间：2022-06-16

# react-native-chat-sdk

即时通讯 SDK 通过实时的消息的双向传递完成信息交换。

## 目录说明

├── CHANGELOG.md // 发版说明文档  
├── CONTRIBUTING.md // 贡献者说明文档  
├── LICENSE // 许可证文件  
├── README.md // 项目介绍文档  
├── README.zh.md // 项目介绍文档（中文版本）  
├── android // react native SDK android 平台文件夹  
├── docs // 文档文件夹  
├── example // 项目内置 demo  
├── examples // 项目外置的独立 demo  
├── ios // react native SDK ios 平台文件夹  
├── lib // react native SDK 生成产品文件夹  
├── native_src // react native SDK native 源码文件夹  
├── node_modules // react native depends 文件夹，通过`yarn`或者`npm`命令生成  
├── package.json // react native project 管理文件  
├── scripts // react native 脚本文件夹  
├── src // react native 源码文件夹  
├── tsconfig.build.json // typescript 语言构建配置文件  
├── tsconfig.json // typescript 语言配置文件  
└── yarn.lock // yarn 项目依赖版本配置文件

## 项目开发环境要求

要求如下：

- React Native 0.63.4 or above
- NodeJs 16 or above
- Xcode 12.4 or above for iOS application
- Android Studio 4.2 or above for Android application

有关详细信息，请参阅快速入门演示。 [Portal](./docs/quick-start.md)

## 添加 SDK 到现有项目

打开终端，进入现有项目文件夹添加 SDK 依赖：

```sh
yarn add react-native-chat-sdk
```

or

```sh
npm i --save react-native-chat-sdk
```

## 习惯用法

### 初始化 SDK

```typescript
ChatClient.getInstance()
  .init(
    new ChatOptions({
      appKey: '<your app key>',
    })
  )
  .then(() => {
    console.log('init success');
  })
  .catch((reason) => {
    console.log('init fail:', reason);
  });
```

### 登录

```typescript
ChatClient.getInstance()
  .loginWithAgoraToken('<your account ID>', '<your token>')
  .then((value: any) => {
    console.log(`login success`, value);
  })
  .catch((reason: any) => {
    console.log(`login fail:`, reason);
  });
```

### 其它

请参考相应的示例或方法说明。

## 快速开始

详见快速开始文档。 [传送门](./docs/quick-start.zh.md)

## demo 体验

详见运行体验 api 的 demo。 [传送门](./example/package.json)。  
详见运行体验登录、退出、发送、接收消息的 demo。[传送门](./examples/simple_demo/package.json)。

## 贡献者

详见贡献者向导。[传送门](./CONTRIBUTING.md)。

## 发版说明

详见更新日志。 [传送门](./CHANGELOG.md)。

## 发版类型说明

详见版本类型说明。 [传送门](./docs/version-types.zh.md)。

## 开发者说明

详见开发者说明。 [传送门](./docs/developer.zh.md)。

## 使用者说明

详见使用者说明 [传送门](./docs/user.md)。

## License

MIT

## Q&A

如果遇到问题可以参考这里。[传送门](./docs/others.md)。
