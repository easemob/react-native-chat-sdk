import { Platform } from 'react-native';

/**
 * The push styles.
 */
export enum ChatPushDisplayStyle {
  /**
   * The push message presentation style: SimpleBanner represents the presentation of a simple message.
   */
  Simple = 0,
  /**
   * The push message presentation style: MessageSummary represents the presentation of message content.
   */
  Summary,
}

/**
 * The push configuration class.
 *
 * For Google Firebase Cloud Messaging (FCM), see {@url https://firebase.google.com/docs/cloud-messaging/concept-options}.
 * For the Apple Push Notification service (APNs), see {@url https://developer.apple.com/documentation/usernotifications}.
 * For platform information of React Native, see {@url https://reactnative.dev/docs/platform}.
 * For example:
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
   * The device ID.
   * For FCM, the field is the user ID of the push notification sender.
   * For APNs, this field is the certificate name of the push service.
   */
  deviceId?: string;
  /**
   * The device token.
   * The device token is indicated in the callback or method provided by the push vendor.
   * For details, see the push SDK instructions of the respective push vendors.
   */
  deviceToken?: string;
  /**
   * The device vendor. See {@link Platform#constants#Manufacturer}
   */
  manufacturer?: string;
  /**
   * Constructs a push configuration object.
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
 * The push option class.
 */
export class ChatPushOption {
  /**
   * The display type of push notifications.
   */
  displayStyle?: ChatPushDisplayStyle;
  /**
   * The user's nickname to be displayed in the notification.
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
