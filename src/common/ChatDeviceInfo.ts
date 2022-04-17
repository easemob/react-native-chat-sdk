export class ChatDeviceInfo {
  resource: string;
  deviceUUID: string;
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
