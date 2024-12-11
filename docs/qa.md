# Frequently asked questions

1.  `react-native-modal-dropdown` may be error.

        https://github.com/siemiatj/react-native-modal-dropdown/issues/81

2.  Creation of .xcode.env.local points to a temp file for node when run using yarn
    [ref](https://github.com/facebook/react-native/issues/43285)
    Delete `.xcode.env.local` if it exists, and then run `bundle exec pod install` directly, not using yarn, or run `npx expo prebuild` if you're using a recent expo project that uses prebuild. This should generate the `.xcode.env.local` file correctly.

3.  How to check the project environment.
    `yarn react-native doctor`
4.  How to view project information.
    `yarn react-native info`
5.  In debug mode, after the Android platform is started, no page is displayed and a prompt is displayed to run `react-native start`.
    Earlier versions of `react-native` may require manual data forwarding, `adb reverse tcp:8081 tcp:8081`.
6.  Compilation error for lower version ios. (react native version <= 0.67)
    https://gist.github.com/AsteriskZuo/70cd2a4e0515e2f44f151b66187c819b

7.  /Users/asterisk/Library/Caches/CocoaPods/Pods/Release/Flipper-Glog/0.3.6-1dfd6/missing: Unknown `--is-lightweight' option. Try `/Users/asterisk/Library/Caches/CocoaPods/Pods/Release/Flipper-Glog/0.3.6-1dfd6/missing --help' for more information.
    Upgrade `Flipper-Glog` to 0.3.9
