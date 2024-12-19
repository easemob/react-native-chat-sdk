_English | [Chinese](./README.zh.md)_

_Update time: 2024-12-19_

- [Introduction to ChatSDK](#introduction-to-chatsdk)
  - [Development environment requirements](#development-environment-requirements)
  - [Integrate ChatSDK](#integrate-chatsdk)
  - [Quick start](#quick-start)
  - [Contributing](#contributing)
  - [License](#license)

# Introduction to ChatSDK

An Instant Messaging SDK (Software Development Kit) is a collection of tools, libraries, and APIs designed to integrate real-time messaging capabilities into applications. It allows developers to easily add text, voice, and video communication features into mobile apps, websites, or other platforms without having to build the communication infrastructure from scratch.

## Development environment requirements

- MacOS 12 or higher
- React-Native 0.66 or higher
- NodeJs 16.18 or higher

For iOS app:

- Xcode 13 or higher and its related dependency tool.

For the Android app:

- Android Studio 2021 or higher and its related dependency tool.

## Integrate ChatSDK

```sh
npm install react-native-chat-sdk
# or
yarn add react-native-chat-sdk
```

## Quick start

1. Initialize SDK

    ```typescript
    // Please use appkey or appId for initialization.
    const appKey = '<your app key>';
    const appId = '<your app ID>';
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
        console.log('initialization success');
      })
      .catch((reason) => {
        console.error(reason);
      });
    ```

2. Connect to server

    ```typescript
    // Connect to server
    const userId = '<your user ID>';
    const userToken = '<your user token>';
    ChatClient.getInstance()
      .loginWithToken(userId, userToken)
      .then((value) => {
        console.log(`login success`, value);
      })
      .catch((reason) => {
        console.error(reason);
      });
    ```

3. Send message

    ```typescript
    // Send a message
    ChatClient.getInstance()
      .chatManager.sendMessage(message, {
        onError: (localMsgId: string, error: ChatError) => {
          console.error(error);
        },
        onSuccess: (message: ChatMessage) => {
          console.log(`send success`, message);
        },
      })
      .catch((reason) => {
        console.error(reason);
      });
    ```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
