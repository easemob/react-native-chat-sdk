import {
  QuickTestScreenBase,
  QuickTestState,
  QuickTestStateless,
  registerStateDataList,
} from './QuickTestScreenBase';
import { MN, metaDataList } from './QuickTestPresenceData';
import { ChatClient, ChatMessage } from 'react-native-chat-sdk';

export interface QuickTestPresenceState extends QuickTestState {}

export interface QuickTestPresenceStateless extends QuickTestStateless {
  sendMessage: {
    success_message?: ChatMessage;
    fail_message?: ChatMessage;
  };
}

export class QuickTestScreenPresence extends QuickTestScreenBase<
  QuickTestPresenceState,
  QuickTestPresenceStateless
> {
  protected static TAG = 'QuickTestScreenPresence';
  public static route = 'QuickTestScreenPresence';
  statelessData: QuickTestPresenceStateless;

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
    this.statelessData = {
      sendMessage: {},
    };
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
      case MN.publishPresence:
        {
          const methodName = this.metaData.get(MN.publishPresence)?.methodName!;
          console.log(`${MN.publishPresence} === ${methodName}`);
          const description = this.metaData.get(MN.publishPresence)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().presenceManager.publishPresence(
              description
            ),
            QuickTestScreenPresence.TAG,
            MN.publishPresence
          );
        }
        break;
      case MN.presenceSubscribe:
        {
          const methodName = this.metaData.get(MN.presenceSubscribe)
            ?.methodName!;
          console.log(`${MN.presenceSubscribe} === ${methodName}`);
          const members = this.metaData.get(MN.presenceSubscribe)!.params[0]
            .paramDefaultValue;
          const expiry = this.metaData.get(MN.presenceSubscribe)!.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().presenceManager.subscribe(members, expiry),
            QuickTestScreenPresence.TAG,
            MN.presenceSubscribe
          );
        }
        break;
      case MN.presenceUnsubscribe:
        {
          const methodName = this.metaData.get(MN.presenceUnsubscribe)
            ?.methodName!;
          console.log(`${MN.presenceUnsubscribe} === ${methodName}`);
          const members = this.metaData.get(MN.presenceUnsubscribe)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().presenceManager.unsubscribe(members),
            QuickTestScreenPresence.TAG,
            MN.presenceUnsubscribe
          );
        }
        break;
      case MN.fetchSubscribedMembersWithPageNum:
        {
          const methodName = this.metaData.get(
            MN.fetchSubscribedMembersWithPageNum
          )?.methodName!;
          console.log(
            `${MN.fetchSubscribedMembersWithPageNum} === ${methodName}`
          );
          const pageNum = this.metaData.get(
            MN.fetchSubscribedMembersWithPageNum
          )!.params[0].paramDefaultValue;
          const pageSize = this.metaData.get(
            MN.fetchSubscribedMembersWithPageNum
          )!.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().presenceManager.fetchSubscribedMembers(
              pageNum,
              pageSize
            ),
            QuickTestScreenPresence.TAG,
            MN.fetchSubscribedMembersWithPageNum
          );
        }
        break;
      case MN.fetchPresenceStatus:
        {
          const methodName = this.metaData.get(MN.fetchPresenceStatus)
            ?.methodName!;
          console.log(`${MN.fetchPresenceStatus} === ${methodName}`);
          const members = this.metaData.get(MN.fetchPresenceStatus)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().presenceManager.fetchPresenceStatus(
              members
            ),
            QuickTestScreenPresence.TAG,
            MN.fetchPresenceStatus
          );
        }
        break;
      default:
        break;
    }
  }
}
