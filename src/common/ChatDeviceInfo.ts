/**
 * 设备信息类，包含登录设备的信息。
 */
export class ChatDeviceInfo {
  /**
   * 登录设备的信息。
   */
  resource: string;
  /**
   * 设备的 UUID（唯一标识码）。
   */
  deviceUUID: string;
  /**
   * 设备型号，如 "Pixel 6 Pro"。
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
