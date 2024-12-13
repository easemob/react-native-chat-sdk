更新日期: 2024-11-21

离线消息接收，需要设置离线推送配置。

```tsx
ChatClient.getInstance()
  .init(
    ChatOptions.withAppKey({
      appKey: appKey,
      pushConfig: new ChatPushConfig({
        deviceId: '<your device id>', // The data comes from the push configuration of the console.
        deviceToken: '<device token>', // Provided by various vendors. See `react-native-push-collection` npm for details.
      }),
    })
  )
  .then(() => {
    this.setState({ result: 'success' });
  })
  .catch((reason) => {
    console.error(reason);
    this.setState({ result: reason.toString() });
  });
```

[详见 pushkit](https://github.com/easemob/react-native-push-collection)
