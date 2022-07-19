Update time: 2022-06-16

# Instructions for developers.

    Audience: code contributors, test contributors, problem finders, interested learners, etc.

---

## The development environment

### The operating system

> Recommendation: macOS 10.15.7 or above.
> If it is an arm64 chip mac, it is recommended to keep the latest system.

### The environment variable

> JAVA_HOME
> ANDROID_HOME

```sh
# if bash, open ~/.bashrc
# if zsh, open ~/.zshrc
export JAVA_HOME="/Applications/Android Studio.app/Contents/jre/Contents/Home"
export ANDROID_HOME="/Users/${foo}/Library/Android/sdk"
```

### Dependencies: Xcode

> macos10.15.7 can only install xcode up to version 12.4.
> If it is an arm64 chip mac, it is recommended to keep the latest version.
> Please install the command line tool that matches xcode: xcode-select, if it is the first installation, you may need to activate it.

```sh
xcode-select --install
```

### Dependencies: Android Studio

> android studio recommends using 2020.3.1patch4 or above.
> If it is a mac with an arm64 chip, it is recommended to install the arm version.
> It is recommended to run it after the installation is complete, and it is recommended to run the project to ensure that all required dependencies are downloaded.
> [download address](https://developer.android.google.cn/studio/)

### Dependencies: Visual Studio Code

> visual studio code recommends installing and keeping the latest version.
> Required plugin: react-native-tool. By Microsoft.
> [download address](https://code.visualstudio.com/)

### Dependencies: Brew

> It is recommended to install or update to the latest version.
> [install instructor](https://docs.brew.sh/Installation)

### Dependencies: Git

> The git version that comes with the mac system is relatively old. It is recommended to use brew to upgrade to the latest, or the official dmg installation.
> Please configure ssh information, because ssh is used for management in sub-projects.

```sh
brew install git
```

### Dependencies: JDK

> Java recommends installing java8 (alias 1.8) or above
> If it is an arm64 chip mac, it is recommended to install the arm64 version. You can also use the JDK that comes with android studio.
> [download address](https://www.oracle.com/java/technologies/downloads/)

### Dependencies: NodeJs

> It is recommended to use the official download package to install, or use brew to install.
> NodeJs recommends version 16 (Long Term Support version) or above.
> [download address](https://nodejs.org/en/)

```sh
brew install node
```

### Dependencies: Cocoapods

> Cocoapods recommends using brew to install the latest version or upgrade to the latest.
> Cocoapods depends on ruby, and ruby comes with gems.
> The ruby version of the mac system is 2.6.x, which may report an error. Therefore, it is recommended to upgrade to the latest version and set the PATH environment variable.

```sh
brew install cocoapods
```

### Dependencies: Watchman

> Watchman is a react-native debugging tool. It is recommended to install the latest version using brew.

```sh
brew install watchman
```

### Dependencies: npm

> npm is a javascript package management tool, which will be installed when installing nodejs.

### Dependencies: yarn

> Please use npm to install yarn tool globally.

```sh
npx install -g yarn
```

### Dependencies: react-native-cli

> Please use npm for global installation of react-native-cli tool.

```sh
npx install -g react-native-cli
```

### Dependencies: create-react-native-library

> create-react-native-library is a tool for creating react-native library projects. Optional installation.

---

## Download sub module

```sh
git submodule update --init
git submodule foreach "git checkout dev"
git submodule foreach "git pull"
```

## Preprocessing

```sh
# for MacOS platform
yarn cpp

# for Windows platform
yarn cpp_win
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

## publish

```sh
npm version prerelease --preid=beta
npm publish --tag=beta
git push --tags
sh scripts/publish_agora_package.sh 1.0.5-rc.1 rc ~/Output/agora
```

## generate docs

```sh
npx typedoc --out ./docs/typedoc --json ./docs/typedoc/typedoc.json --tsconfig ./tsconfig.json ./src/index.ts
```

The solution to the problem that uploading to the server causes the icon to be too large:

find and remove `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-link" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5"></path><path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5"></path></svg>`

---

## Q & A
