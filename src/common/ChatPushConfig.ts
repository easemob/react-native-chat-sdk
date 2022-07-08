import { Platform } from 'react-native';

/**
 * The push configuration class.
 * Google Firebase Cloud Messaging information. See {@url https://firebase.google.com/docs/cloud-messaging/concept-options}
 * Apple devices, See {@url https://developer.apple.com/documentation/usernotifications}
 * React Native identifies platform information, See {@url https://reactnative.dev/docs/platform}
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
   * If it is google, the field is FCM send ID.
   * If it is Apple, this field is the certificate name.
   */
  deviceId?: string;
  /**
   * The device token.
   * The device token comes from the callback or method provided by the push vendor.
   * For details, please refer to the push SDK instructions of the respective manufacturers.
   */
  deviceToken?: string;
  /**
   * Equipment manufactory. See {@link Platform#constants#Manufacturer}
   */
  manufacturer?: string;
  /**
   * constructor a ChatPushConfig object.
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
