Update time: 2022-06-16

# Instructions

Here is a supplementary description of the relevant content, if other topics do not find relevant content, you can refer to this document.

## download project

```
# Download with subprojects.
git clone --recurse-submodules git@github.com:easemob/react-native-chat-sdk.git

# Initialize subprojects (if the Clone main project does not include subprojects).
git submodule update --init --recursive
git submodule foreach "git checkout dev"
```

## npm repository

[reference](https://www.npmjs.com/package/react-native-chat-sdk)

## Development environment review.

```sh
npx react-native doctor
```

or

```sh
npx react-native info
```

## Android devices review

```sh
# review tcp port list
adb reverse --list

# review android devices list
adb devices --list
```

## Common commands

```sh
# you can run watch mode to automatically rebuild the changes
yarn watch
# fix watchman question
$ watchman watch-del-all

# make sure your code passes TypeScript and ESLint. Run the following to verify:
$ yarn typescript
$ yarn lint

# fix formatting errors, run the following
$ yarn lint --fix

# clean watchman for ios
watchman watch-del-all
rm -rf node_modules
yarn install
rm -rf /tmp/metro-*


# Show the development menu
# ios emulator `command` + `D`
# android emulator`command` + `M`
# shake your phone

# Display box window
# LogBox
import { LogBox } from 'react-native';
# Ignore log notification by message:
LogBox.ignoreLogs(['Warning: ...']);
# Ignore all log notifications:
LogBox.ignoreAllLogs();


# browser debugging
# or install react-devtools debugging
$ npm install -g react-devtools

```

## Possible problems

1. Use vscode to debug the necessary plug-ins.
   vscode plugin `React Native Tools` `https://github.com/microsoft/vscode-react-native`

2. Could not find entry function problem.
   add file `example/index.js`， original file `example/index.tsx`

3. `No toolchains found in the NDK toolchains folder for ABI with prefix: arm-linux-androideabi`
   udpate gradle version. 3.5.3 to 4.2.2

4. `Typedef redefinition with different types ('uint8_t' (aka 'unsigned char') vs 'enum clockid_t')`
   The Flipper version is too low. 0.80.0 to 0.142.0

5. Android debugging could not find the service.
   - The phone is not properly connected to the computer.
   - You need your phone and your computer on the same network.
   - For versions 5.0 or later, data forwarding is required: `adb reverse tcp:8081 tcp:8081`
   -
6. `watchman watch-del '/Users/asterisk/Codes/rn/react-native-chat-sdk' ; watchman watch-project '/Users/asterisk/Codes/rn/react-native-chat-sdk'`

   - `watchman watch-del-all`

7. editorconfig 影响第三方代码格式

   - Add ignore folder: https://stackoverflow.com/questions/30310396/possible-to-ignore-exclude-file-folder-from-editorconfig

8. Iso real machine debugging using vscode.
   - `brew install ios-deploy`
   - `npx react-native run-ios --device "xxx's iPhone"`

## eslint

[eslint en](https://eslint.org/docs/rules/no-shadow)  
[eslint cn](http://eslint.cn/docs/rules/no-shadow)

---

## 参考资料

[react native website](https://reactnative.dev/)  
[react native website cn](https://reactnative.cn/)

---

## Q & A

[others references](https://note.youdao.com/s/5eHWCnPb)

# install depends

```sh
brew install node
npm install -g yarn
npm install -g react-native-cli
```
