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
```bash
# if bash, open ~/.bashrc
# if zsh, open ~/.zshrc
export JAVA_HOME="/Applications/Android Studio.app/Contents/jre/Contents/Home"
export ANDROID_HOME="/Users/${foo}/Library/Android/sdk"
```

### Dependencies: Xcode
> macos10.15.7 can only install xcode up to version 12.4.
> If it is an arm64 chip mac, it is recommended to keep the latest version.
> Please install the command line tool that matches xcode: xcode-select, if it is the first installation, you may need to activate it.
```bash
xcode-select --install
```

### Dependencies: Android Studio
> android studio recommends using 2020.3.1patch4 or above.
> If it is a mac with an arm64 chip, it is recommended to install the arm version.
> It is recommended to run it after the installation is complete, and it is recommended to run the project to ensure that all required dependencies are downloaded.
[download address](https://developer.android.google.cn/studio/)  

### Dependencies: Visual Studio Code
> visual studio code recommends installing and keeping the latest version.
> Required plugin: react-native-tool. By Microsoft.
[download address](https://code.visualstudio.com/)  

### Dependencies: Brew
> It is recommended to install or update to the latest version.
[install instructor](https://docs.brew.sh/Installation)  

### Dependencies: Git
> The git version that comes with the mac system is relatively old. It is recommended to use brew to upgrade to the latest, or the official dmg installation.
> Please configure ssh information, because ssh is used for management in sub-projects.
```bash
brew install git
```

### Dependencies: JDK
> Java recommends installing java8 (alias 1.8) or above
> If it is an arm64 chip mac, it is recommended to install the arm64 version. You can also use the JDK that comes with android studio.
[download address](https://www.oracle.com/java/technologies/downloads/)  

### Dependencies: NodeJs
> It is recommended to use the official download package to install, or use brew to install.
> NodeJs recommends version 16 (Long Term Support version) or above.
[download address](https://nodejs.org/en/)  
```bash
brew install node
```

### Dependencies: Cocoapods
> Cocoapods recommends using brew to install the latest version or upgrade to the latest.
> Cocoapods depends on ruby, and ruby comes with gems.
> The ruby version of the mac system is 2.6.x, which may report an error. Therefore, it is recommended to upgrade to the latest version and set the PATH environment variable.
```bash
brew install cocoapods
```

### Dependencies: Watchman
> Watchman is a react-native debugging tool. It is recommended to install the latest version using brew.
```bash
brew install watchman
```

### Dependencies: npm
> npm is a javascript package management tool, which will be installed when installing nodejs.

### Dependencies: yarn
> Please use npm to install yarn tool globally.
```bash
npx install -g yarn
```

### Dependencies: react-native-cli
> Please use npm for global installation of react-native-cli tool.
```bash
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

## publish
```sh
npm version prerelease --preid=beta
npm publish --tag=beta
git push --tags
```

## Q & A