更新日期: 2026-09-23

离线消息接收需要设置离线推送配置。5.0.0 起推送配置分为两部分：**初始化时配置 iOS 证书名**，**运行时绑定设备推送 token**。

## 初始化：配置 iOS 证书名

`ChatOptions.apnsCertName` 与 `ChatOptions.pushKitCertName` 仅在 iOS 生效，其他平台忽略；两者只在 `ChatClient.init` 时下发给原生，运行时不可修改（详见[迁移指南](./5.0.0-migration-guide/2026-09-23-rn-4.x-to-5.0.0-migration-guide.md) 的「推送与设备 Token」一节）。

```tsx
ChatClient.getInstance()
  .init(
    ChatOptions.withAppKey({
      appKey: appKey,
      // 控制台配置的 APNs 证书名，仅 iOS 生效
      apnsCertName: '<your apns cert name>',
      // 需要 VoIP 推送时再配置，同样仅 iOS 生效
      pushKitCertName: '<your pushkit cert name>',
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

## 运行时：绑定设备推送 token

拿到推送 SDK 返回的 device token 后调用 `ChatClient.bindDeviceToken`：

```tsx
await ChatClient.getInstance().bindDeviceToken({
  // 推送 SDK 或 APNs 回调返回的 token
  deviceToken: '<device token>',
  // Android 必填的厂商推送凭据（例如 FCM Sender ID、小米 App ID、OPPO App Key），iOS 忽略
  notifierName: '<vendor push credential>',
});
```

Android 厂商推送的依赖、manifest 配置与 `EMPushConfig` 初始化需要在原生工程侧完成，SDK 只负责上报 token；各厂商 token 的获取可参考：
[react-native-push-collection](https://github.com/easemob/react-native-push-collection)

## VoIP 推送（仅 iOS）

VoIP 推送使用独立的 PushKit 证书与 token，需要业务侧实现 `PKPushRegistry` 拿到十六进制 token 后绑定；`ChatClient.logout(unbindDeviceToken: true)` 会同时解绑 PushKit token：

```tsx
await ChatClient.getInstance().bindPushKitToken({
  deviceToken: '<pushkit token in hexadecimal>',
});

// 仅在保持登录状态、需要单独解绑时调用
await ChatClient.getInstance().unbindPushKitToken();
```
