import { Platform } from 'react-native';

/**
 * The push configuration class.
 * Google Firebase Cloud Messaging information. See {@url https://firebase.google.com/docs/cloud-messaging/concept-options}
 * Xiaomi devices, See {@url https://dev.mi.com/console/doc/detail?pId=863}
 * Oppo devices, See {@url https://open.oppomobile.com/new/introduction?page_name=oppopush}
 * Vivo devices, See {@url https://dev.vivo.com.cn/documentCenter/doc/541}
 * Meizu devices, See {@url https://open.flyme.cn/open-web/views/push.html}
 * Huawei devices, See {@url https://developer.huawei.com/consumer/cn/doc/development/HMSCore-Guides/service-introduction-0000001050040060}
 * Apple devices, See {@url https://developer.apple.com/documentation/usernotifications}
 * React Native identifies platform information, See {@url https://reactnative.dev/docs/platform}
 * For example:
 *    ```console.log('android: ext: ', Platform.OS, (Platform as any).constants);```
 * Print result:
 *    ```
 *    [
 *       {"Brand": "Meizu", "Fingerprint": "Meizu/meizu_MX6/MX6:6.0/MRA58K/1474961742:user/release-keys", "Manufacturer": "Meizu", "Model": "MX6", "Release": "6.0", "Serial": "M95QACPC6LD49", "Version": 23, "isTesting": false, "reactNativeVersion": {"major": 0, "minor": 66, "patch": 4, "prerelease": null}, "uiMode": "normal"},
 *       {"Brand": "HUAWEI", "Fingerprint": "HUAWEI/ELE-AL00/HWELE:10/HUAWEIELE-AL00/10.1.0.162C00:user/release-keys", "Manufacturer": "HUAWEI", "Model": "ELE-AL00", "Release": "10", "Serial": "unknown", "Version": 29, "isTesting": false, "reactNativeVersion": {"major": 0, "minor": 66, "patch": 4, "prerelease": null}, "uiMode": "normal"},
 *       {"Brand": "google", "Fingerprint": "google/walleye/walleye:11/RP1A.200720.009/6720564:user/release-keys", "Manufacturer": "Google", "Model": "Pixel 2", "Release": "11", "Serial": "unknown", "Version": 30, "isTesting": false, "reactNativeVersion": {"major": 0, "minor": 66, "patch": 4, "prerelease": null}, "uiMode": "normal"}
 *   ]
 *    ```
 */
export class ChatPushConfig {
  /**
   * The device ID.
   * If it is google, the field is FCM send ID.
   * If it is Apple, this field is the certificate name.
   * If it is Huawei, this field is App ID.
   * If it is Xiaomi, the field is App ID.
   * If it is Oppo, this field is App Key.
   * If it is Meizu, the field is App ID.
   * If it is Vivo, this field is App ID.
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
