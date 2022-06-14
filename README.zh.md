_Chinese | [English](./README.md)_

# 即时通讯 IM React-Native 说明

更新时间：2022-05-10

此 SDK 基于 React Native 和 Chat Android 和 iOS 的 SDK 实现。

## 目录说明

├── CHANGELOG.md // 发版说明文档  
├── CONTRIBUTING.md // 贡献者说明文档  
├── LICENSE // 许可证文件  
├── README.md // 项目帮助文档  
├── README.zh.md // 项目帮助文档（中文版本）  
├── android // react native SDK android 平台文件夹  
├── docs // 文档文件夹  
├── example // 项目内置 demo  
├── examples // 项目外置的独立 demo  
├── ios // react native SDK ios 平台文件夹  
├── lib // react native SDK 生成产品文件夹  
├── native_src // react native SDK native 源码文件夹  
├── node_modules // react native depends 文件夹，通过`yarn`或者`npm`命令生成  
├── package.json // react native project 管理文件  
├── react-native-chat-sdk.podspec // react native ios cocoapods 配置文件，ios 平台使用。  
├── scripts // react native 脚本文件夹  
├── src // react native 源码文件夹  
├── tsconfig.build.json // typescript 语言构建配置文件  
├── tsconfig.json // typescript 语言配置文件  
└── yarn.lock // yarn 项目依赖版本配置文件

## 项目准备

使用 git 命令下载

```bash
git clone --recurse-submodules git@github.com:easemob/react-native-chat-sdk.git
```

## 编译运行条件

具体要求请参见这里。[传送门](./docs/quick-start.zh.md)

## 项目编译

打开终端，运行`yarn` 或者 `yarn install` 命令

## 构建 ios 平台

- 使用`xcode`打开文件`example/ios/ChatSdkExample.xcworkspace`;
- 连接 ios 设备，或者选择模拟器;
- 设置签名（如果是真机）;
- 执行编译、安装并运行 demo。
- **注意** 运行`yarn`的命令时候已经执行了`pod install`命令，否则，需要手动运行。

## 构建 android 平台

- 使用`android studio`打开文件夹`example/android`;
- 如果是首次运行请先运行`sync`命令;
- 执行编译、安装并运行 demo;
- 在 demo 运行之前，先启动服务: `cd example && yarn start`。
- **注意** 在构建之前确保执行了如下命令: `cd native_src/cpp && sh generate.sh --type rn`
- **注意** android5.0 或以上的版本，需要进行数据转发: `adb reverse tcp:8081 tcp:8081`

## 快速开始

请查看具体文档。 [传送门](./docs/quick-start.zh.md)

## demo 体验

可以运行体验 api 级别的 demo。 [传送门](./example/package.json)。  
可以运行体验简单 demo。[传送门](./examples/simple_demo/package.json)。

## 贡献者

详见 [contributing guide](./CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## 发版说明

详见 [change log](./CHANGELOG.md).

## 发版类型说明

详见 [version types](./docs/version-types.zh.md).

## License

MIT

## Q&A

[如果遇到问题可以参考这里](./docs/others.md)
