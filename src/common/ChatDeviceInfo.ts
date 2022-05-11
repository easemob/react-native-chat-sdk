/**
 * The ChatDeviceInfo class, which contains the multi-device information.
 */
export class ChatDeviceInfo {
  /**
   * The information of other login devices.
   */
  resource: string;
  /**
   * The UUID of the device.
   */
  deviceUUID: string;
  /**
   * The device type. For example: "Pixel 6 Pro".
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
