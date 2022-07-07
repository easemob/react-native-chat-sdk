Update time: 2022-06-16

# Instructions for developers.

    Audience: code contributors, test contributors, problem finders, interested learners, etc.

---

## The development environment

### The operating system

> 建议 macos: 10.15.7
> 如果是 m1 芯片: 建议 macos: 最新

### The environment variable

> JAVA_HOME
> ANDROID_HOME

### Dependencies: Xcode

> macos10.15.7 只能安装最高 12.4 版本的 xcode
> 如果是 m1 芯片: 建议升级到最新
> 安装完成，需要安装命令行 Dependencies。
> 建议安装完成运行一下，权限或者秘钥是需要激活或者处理的。

### Dependencies: Android Studio

> 建议使用 2020.3.1 或以上版本
> 如果是 m1 芯片: 建议安装 arm64 版本
> 建议安装完成运行一下，最好是运行该项目，这样保证需要下载的依赖全部下载。

### Dependencies: Visual Studio Code

> 建议安装最新版本
> 必须安装的插件: react-native-tools 微软出品。

### Dependencies: Brew

> 建议安装最新，或者升级到最新
> 如果是国内用户，可以参考 gitee 上的安装方法[reference](https://gitee.com/cunkai/HomebrewCN)

### Dependencies: Git

> mac 系统自带，建议使用 brew 升级到最新，或者官方安装
> 要求是配置 ssh 信息，因为项目里面使用 ssh 进行子项目管理。

### Dependencies: JDK

> 建议安装 java8(别名 1.8)或以上版本
> 如果是 m1 芯片: 建议使用 arm64 版本，android studio 自带的也行。

### Dependencies: NodeJs

> 建议使用官方下载包安装，或者使用 brew 安装
> 建议版本 16(长期支持版本)以上

### Dependencies: Cocoapods

> 建议使用 brew 安装最新版本或者升级到最新
> 该 Dependencies 依赖 ruby，ruby 自带 gem
> 如果是国内用户，建议更换国内源，下载速度快稳定。
> 如果是 m1 芯片，安装出现报错，可能是 ruby2.6.x 版本导致的，需要升级

### Dependencies: Watchman

> 这是调试 Dependencies。
> 建议使用 brew 安装最新，或者升级到最新。

### Dependencies: npm

> 这是 js 的包管理 Dependencies。
> 安装 nodejs 的使用自带安装。

### Dependencies: yarn

> 这是项目编译构建 Dependencies。
> 使用 npm 进行全局安装。

### Dependencies: react-native-cli

> 这是 react-native 的命令行 Dependencies。
> 使用 npm 进行全局安装。不建议全局安装 react-native。

### Dependencies: create-react-native-library

> 这是 npm 包，创建 react-native 项目的 Dependencies。
> 使用 npm 进行安装，可以不用全局安装。

---

## Download sub module

```sh
git submodule update --init
git submodule foreach "git checkout dev"
git submodule foreach "git pull"
```

## Preprocessing

Execute it before using the yarn command.

```sh
cd native_src/cpp
generate.sh --type rn
```

## Processing

```sh
yarn install
```

## Start serivces

```sh
ce example && yarn start
```

## Run ios app

```sh
cd example && yarn ios
```

## Run android app

```sh
cd example && yarn android
```

---

## Q & A
