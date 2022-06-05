import {
  QuickTestScreenBase,
  QuickTestState,
  QuickTestStateless,
  registerStateDataList,
} from './QuickTestScreenBase';
import { MN, metaDataList } from './QuickTestUserData';
import { ChatClient } from 'react-native-chat-sdk';

export interface QuickTestUserState extends QuickTestState {}

export interface QuickTestUserStateless extends QuickTestStateless {}

export class QuickTestScreenUser extends QuickTestScreenBase<
  QuickTestUserState,
  QuickTestUserStateless
> {
  protected static TAG = 'QuickTestScreenUser';
  public static route = 'QuickTestScreenUser';
  statelessData: QuickTestUserStateless;

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
      presence_listener: '',
      sendResult: '',
      recvResult: '',
      exceptResult: '',
      cb_result: '',
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
    super.callApi(name);
    switch (name) {
      case MN.updateOwnUserInfo:
        {
          const methodName = this.metaData.get(
            MN.updateOwnUserInfo
          )!.methodName;
          console.log(`${MN.updateOwnUserInfo} === ${methodName}`);
          const nickName = this.metaData.get(MN.updateOwnUserInfo)!.params[0]
            .paramDefaultValue;
          const avatarUrl = this.metaData.get(MN.updateOwnUserInfo)!.params[1]
            .paramDefaultValue;
          const mail = this.metaData.get(MN.updateOwnUserInfo)!.params[2]
            .paramDefaultValue;
          const phone = this.metaData.get(MN.updateOwnUserInfo)!.params[3]
            .paramDefaultValue;
          const gender = this.metaData.get(MN.updateOwnUserInfo)!.params[4]
            .paramDefaultValue;
          const sign = this.metaData.get(MN.updateOwnUserInfo)!.params[5]
            .paramDefaultValue;
          const birth = this.metaData.get(MN.updateOwnUserInfo)!.params[6]
            .paramDefaultValue;
          const ext = this.metaData.get(MN.updateOwnUserInfo)!.params[7]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().userManager.updateOwnUserInfo({
              nickName,
              avatarUrl,
              mail,
              phone,
              gender,
              sign,
              birth,
              ext,
            }),
            QuickTestScreenUser.TAG,
            MN.updateOwnUserInfo
          );
        }
        break;
      case MN.fetchUserInfoById:
        {
          const methodName = this.metaData.get(
            MN.fetchUserInfoById
          )!.methodName;
          console.log(`${MN.fetchUserInfoById} === ${methodName}`);
          const userIds = this.metaData.get(MN.fetchUserInfoById)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().userManager.fetchUserInfoById(userIds),
            QuickTestScreenUser.TAG,
            MN.fetchUserInfoById
          );
        }
        break;
      case MN.fetchOwnInfo:
        {
          const methodName = this.metaData.get(MN.fetchOwnInfo)!.methodName;
          console.log(`${MN.fetchOwnInfo} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().userManager.fetchOwnInfo(),
            QuickTestScreenUser.TAG,
            MN.fetchOwnInfo
          );
        }
        break;
      case MN.clearUserInfo:
        {
          const methodName = this.metaData.get(MN.clearUserInfo)!.methodName;
          console.log(`${MN.clearUserInfo} === ${methodName}`);
          // ChatClient.getInstance().userManager.clearUserInfo();
        }
        break;
      default:
        console.log(`${name}`);
        break;
    }
  }
}
