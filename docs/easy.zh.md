更新日期: 2022-08-15

# 5 分钟就搞定

## 配置环境要求

在 MacOS 系统中，需要安装几个辅助工具，这些工具直接或者间接的被 `React-Native` 用到。

**MacOS**: 建议 `10.15.7` 或以上版本。

**NodeJs**: 建议通过 `brew` 工具安装。 也直接官网下载安装。
**注意** 安装版本建议 16 或者 17, 不要安装 18。

**npm**: 在安装 `NodeJs` 的时候，会携带安装，还有 `npx` 工具。

**yarn**: 使用 `npm` 安装。

**watchman**: 使用 `brew` 工具安装。

**brew**: 如果是中国大陆，建议使用下列方法安装。

- [安装方法地址](https://gitee.com/cunkai/HomebrewCN)
- [官方安装方法地址](https://brew.sh/)

**cocoapods**: 建议 `brew -cask` 安装。
**注意** 他需要依赖 ruby 相关工具。

**ruby**: 建议安装新版本。
**注意** 如果是 `m1/m2` 芯片的设备需要安装最新版本。2.6 版本会报错。

**gem**: 在安装 `ruby` 的时候，会携带安装。

**xcode**: app store 安装
**注意** 建议安装 13 版本

**Android studio**: 建议官网下载安装最新稳定版本。

- [官网下载地址](https://developer.android.google.cn/studio/)

**adb**: android 工具，需要额外配置。

## 安装示例顺序以及命令

```sh
# 安装brew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装之前查看brew已安装列表
brew list
# 或者通过搜索也可以看出来是否安装
# 如果安装会显示绿色的✔️
brew search node

# 安装 ruby
brew install ruby

# 安装 cocoapods
brew install --cask cocoapods

# 安装 node
brew install node@16

# 安装 watchman
brew install watchman

# 安装 yarn
npm install --global yarn

```

## 设置环境变量

MacOS 默认命令使用 `zsh`，所以配置文件为 `.zshrc`，如果是`bash`，配置文件为 `.bashrc`。

**注意** 更新文件之后，需要使用命令 `source ~/.zshrc` 生效。

```sh
# 安装配置
export JAVA_HOME="/Applications/Android Studio.app/Contents/jre/Contents/Home"
export ANDROID_HOME="/Users/asterisk/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/ndk-bundle"

# cocoapods
export PATH="/opt/homebrew/opt/cocoapods/bin:$PATH"

# ruby
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

# node
export PATH="/opt/homebrew/opt/node@16/bin:$PATH"
```

## 安装完成检查

```sh
asterisk@asterisk ~ % brew --version
Homebrew 3.5.3-6-g86fe1f9
Homebrew/homebrew-core (git revision d3781ffb533; last commit 2022-06-29)
Homebrew/homebrew-cask (git revision cae8b51751; last commit 2022-06-29)
asterisk@asterisk ~ % node -v
v16.15.1
asterisk@asterisk ~ % ruby -v
ruby 3.1.2p20 (2022-04-12 revision 4491bb740a) [arm64-darwin21]
asterisk@asterisk ~ % pod --version
1.11.3
asterisk@asterisk ~ % watchman --version
2022.06.27.00
asterisk@asterisk ~ % npm -v
8.11.0
asterisk@asterisk ~ % yarn -v
1.22.18
```

## 项目检查

```sh
npx react-native info
```

## 医生检查

**注意** 这仅仅是参考，由于软件更新太快，该软件包可能太老，检查的不准确。

```sh
npx react-native doctor
```

## 创建 app 项目

**注意** 由于 `node` `18` 版本和 之前版本不兼容，所以，建议使用 `18` 以下版本。同时 `react-native` 依赖 `react`，`react` 有同样的版本问题。

```sh
# 创建 react-native js版本的项目
npx react-native init rn_demo

# 创建指定 react-native 版本的项目
# 如果不指定版本 默认使用最新版本
npx react-native init rn_demo --version 0.68.2

# 创建 react-native 的 ts 版本的项目
npx react-native init rn_wayang --template react-native-template-typescript@6.8.4
```

### 集成 SDK

完成项目创建集成 SDK

```sh
yarn add react-native-chat-sdk
```

### 编写代码

导入 SDK 对象

```typescript
import {
  ChatClient,
  ChatOptions,
  ChatMessageChatType,
  ChatMessage,
} from 'react-native-chat-sdk';
```

调用 SDK 初始化接口

```typescript
ChatClient.getInstance()
  .init(
    new ChatOptions({
      appKey: appKey,
    })
  )
  .then(() => {
    console.log('init success');
  })
  .catch((error) => {
    console.log('init fail');
  });
```

调用其他接口

```typescript
ChatClient.getInstance()
  .login(username, password)
  .then(() => {
    console.log('login success.');
  })
  .catch((reason) => {
    console.log('login fail: ' + JSON.stringify(reason));
  });
```

## 创建 plugin 项目

// todo:

## 运行 app 项目

当创建项目完成之后，可以使用模拟器或者真机运行 `app` 程序。

react-native 分为上下两层。上层是由 `javascript` 或者 `typescript` 实现，下层由 `ios` 或者 `android` 实现。

编译、构建、运行可以使用终端命令完成，也可以使用 `xcode` 和 `android` 完成。 建议使用 `xcode`和 `android`。

假设创建的项目名称为 `rn_demo`。

编译并在 iOS 真机运行：

1. 连接苹果手机，设置为开发者模式；
2. 打开 `rn_demo/ios`，使用 `xcode` 打开 `rn_demo.xcworkspace`；
3. 依次点击 **Targets** > **rn_demo** > **Signing & Capabilities** 在签名选项下设置应用签名；
4. 点击 `Build` 构建并运行项目。程序构建完成后，自动安装和运行，并显示应用界面。

编译并在 Android 真机运行：

1. 在 Android Studio 中打开 `rn_demo/android`；
2. 连接 Android 系统手机，设置为开发者模式，并且设置 USB 可调式；
3. 设置数据转发：在终端命令行输入 `adb reverse tcp:8081 tcp:8081`；
4. 启动服务：执行 `package.json` 里面的命令：`"start": "react-native start"`，在终端中运行命令 `yarn start`：

   ```sh
   yarn start
   ```

5. 程序构建完成后，自动安装和运行，并显示应用界面。

由于程序是由两部分组成，静态部分和动态部分。静态部分为 `ios` 或者 `android`， 动态部分为 `javascript` 或者 `typescript`。为了让程序正常运行，需要两部分结合在一起。

动态部分在调试模式可以启动服务。 `yarn start`。
对于 android 设备版本在 5.0 版本以上需要端口映射。 `adb reverse tcp:8081 tcp:8081`。

更多详情参考[这里](https://reactnative.cn/docs/running-on-device)

## 简单调试

动态部分可以动态加载更新，在调试模式下，可以使用快捷键等方式进行操作。 可以参考[这里](https://reactnative.cn/docs/debugging)

## 代码开发

动态部分需要掌握 `javascript` 或者 `typescript`。
静态部分需要掌握 `objective-c` `swift` `java` `kotlin`。

## 更多参考

[1.英文官网](https://reactnative.cn/)
[2.中文官网](https://reactnative.dev/)
[3.github 仓库](https://github.com/facebook/react-native)
