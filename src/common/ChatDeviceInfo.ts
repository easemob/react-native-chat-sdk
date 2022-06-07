/**
 * The device information class, which contains the information of logged-in devices.
 */
export class ChatDeviceInfo {
  /**
   * The information of logged-in devices.
   */
  resource: string;
  /**
   * The UUID of the device.
   */
  deviceUUID: string;
  /**
   * The device type, such as "Pixel 6 Pro".
   */
  deviceName: string;

  constructor(params: {
    resource: string;
    deviceUUID: string;
    deviceName: string;
  }) {
    this.resource = params.resource;
    this.deviceName = params.deviceName;
    this.deviceUUID = params.deviceUUID;
  }
}
