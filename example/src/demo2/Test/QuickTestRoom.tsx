import {
  QuickTestScreenBase,
  QuickTestState,
  QuickTestStateless,
  registerStateDataList,
} from './QuickTestScreenBase';
import { MN, metaDataList } from './QuickTestChatData';

export interface QuickTestRoomState extends QuickTestState {}

export interface QuickTestRoomStateless extends QuickTestStateless {}

export class QuickTestScreenRoom extends QuickTestScreenBase<
  QuickTestRoomState,
  QuickTestRoomStateless
> {
  protected static TAG = 'QuickTestScreenRoom';
  public static route = 'QuickTestScreenRoom';
  statelessData: QuickTestRoomStateless;

  constructor(props: { navigation: any }) {
    super(props);
    this.state = {
      connect_result: '',
      multiDevice_result: '',
      custom_result: '',
      contact_result: '',
      conversation_result: '',
      groupEvent_result: '',
      roomEvent_result: '',
      sendResult: '',
      recvResult: '',
      exceptResult: '',
    };
    this.statelessData = {};
    registerStateDataList(metaDataList);
  }

  /**
   * 如果有特殊需求，可以将监听器移动到各个子类里面进行处理。
   */
  protected addListener?(): void {
    if (super.addListener) {
      super.addListener();
    }
  }

  protected removeListener?(): void {
    if (super.removeListener) {
      super.removeListener();
    }
  }

  /**
   * 调用对应的SDK方法
   * @param name 方法名称
   */
  protected callApi(name: string): void {
    switch (name) {
      case MN.sendMessage:
        break;

      default:
        break;
    }
  }
}
