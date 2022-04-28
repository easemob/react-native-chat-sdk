import {
  QuickTestScreenBase,
  QuickTestState,
  QuickTestStateless,
  registerStateDataList,
} from './QuickTestScreenBase';
import { MN, metaDataList } from './QuickTestGroupData';
import { ChatClient, ChatGroupOptions } from 'react-native-chat-sdk';

export interface QuickTestGroupState extends QuickTestState {}

export interface QuickTestGroupStateless extends QuickTestStateless {}

export class QuickTestScreenGroup extends QuickTestScreenBase<
  QuickTestGroupState,
  QuickTestGroupStateless
> {
  protected static TAG = 'QuickTestScreenGroup';
  public static route = 'QuickTestScreenGroup';
  statelessData: QuickTestGroupStateless;

  constructor(props: { navigation: any }) {
    super(props);
    this.state = {
      cmd: '',
      connect_listener: '',
      multi_listener: '',
      custom_listener: '',
      chat_listener: '',
      contact_listener: '',
      conv_listener: '',
      group_listener: '',
      room_listener: '',
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
      case MN.createGroup:
        {
          const methodName = this.metaData.get(MN.createGroup)?.methodName!;
          const groupName = this.metaData.get(MN.createGroup)?.params[0]
            .paramDefaultValue;
          const desc = this.metaData.get(MN.createGroup)?.params[1]
            .paramDefaultValue;
          const allMembers: Array<string> = this.metaData.get(MN.createGroup)
            ?.params[2].paramDefaultValue;
          const reason = this.metaData.get(MN.createGroup)?.params[3]
            .paramDefaultValue;
          const option: ChatGroupOptions = this.metaData.get(MN.createGroup)
            ?.params[4].paramDefaultValue;

          this.tryCatch(
            ChatClient.getInstance().groupManager.createGroup(
              option,
              groupName,
              desc,
              allMembers,
              reason
            ),
            QuickTestScreenGroup.TAG,
            methodName
          );
        }
        break;

      default:
        break;
    }
  }
}
