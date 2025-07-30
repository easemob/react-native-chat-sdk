import { Platform } from 'react-native';

/**
 * 推送消息的展示样式。
 */
export enum ChatPushDisplayStyle {
  /**
   * 显示”你有一条新消息“。默认的样式。
   */
  Simple = 0,
  /**
   * 消息内容的样式。例如：显示消息内容。
   */
  Summary,
}

/**
 * The push configuration class.
 *
 * 谷歌的 Firebase 云信息传递 (FCM) 服务，详见 {@url https://firebase.google.com/docs/cloud-messaging/concept-options}。
 * 苹果的推送通知服务（APNs），详见 {@url https://developer.apple.com/documentation/usernotifications}。
 * 关于 React Native 平台的信息，详见 {@url https://reactnative.dev/docs/platform}。
 *
 * 例如：
 *    ```console.log('android: ext: ', Platform.OS, (Platform as any).constants);```
 * Print result:
 *    ```
 *    [
 *       {"Brand": "google", "Fingerprint": "google/walleye/walleye:11/RP1A.200720.009/6720564:user/release-keys", "Manufacturer": "Google", "Model": "Pixel 2", "Release": "11", "Serial": "unknown", "Version": 30, "isTesting": false, "reactNativeVersion": {"major": 0, "minor": 66, "patch": 4, "prerelease": null}, "uiMode": "normal"}
 *   ]
 *    ```
 */
export class ChatPushConfig {
  /**
   * 设备 ID。
   * 对于 FCM，该参数为发送方的ID；对于 APNs，该参数为证书名称。
   */
  deviceId?: string;
  /**
   * 设备 token。
   * 设备 token 来自第三方推送服务商的回调或主动调用方法。
   * 详见具体推送服务商的 SDK 说明。
   */
  deviceToken?: string;
  /**
   * 设备生产商，详见 {@link Platform.constants.Manufacturer}。
   */
  manufacturer?: string;
  /**
   * 构建一个推送配置实例。
   */
  constructor(params?: { deviceId?: string; deviceToken?: string }) {
    this.deviceToken = params?.deviceToken;
    this.deviceId = params?.deviceId;
    if (Platform.OS === 'ios') {
    } else if (Platform.OS === 'android') {
      this.manufacturer = (
        Platform as any
      ).constants.Manufacturer.toLowerCase();
    }
  }
}

/**
 * 推送选项类。
 */
export class ChatPushOption {
  /**
   * 推送通知的显示样式。
   */
  displayStyle?: ChatPushDisplayStyle;
  /**
   * 推送通知的显示昵称。
   */
  displayName?: string;
  constructor(params: {
    displayStyle?: ChatPushDisplayStyle;
    displayName?: string;
  }) {
    this.displayStyle = params?.displayStyle;
    this.displayName = params?.displayName;
  }
}
