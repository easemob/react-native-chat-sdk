import {
  QuickTestScreenBase,
  QuickTestState,
  QuickTestStateless,
  registerStateDataList,
} from './QuickTestScreenBase';
import { MN, metaDataList } from './QuickTestPushData';
import { ChatClient } from 'react-native-chat-sdk';

export interface QuickTestPushState extends QuickTestState {}

export interface QuickTestPushStateless extends QuickTestStateless {}

export class QuickTestScreenPush extends QuickTestScreenBase<
  QuickTestPushState,
  QuickTestPushStateless
> {
  protected static TAG = 'QuickTestScreenPush';
  public static route = 'QuickTestScreenPush';
  statelessData: QuickTestPushStateless;

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
      case MN.setConversationSilentMode:
        {
          const methodName = this.metaData.get(
            MN.setConversationSilentMode
          )!.methodName;
          console.log(`${MN.setConversationSilentMode} === ${methodName}`);
          const convId = this.metaData.get(MN.setConversationSilentMode)!
            .params[0].paramDefaultValue;
          const convType = this.metaData.get(MN.setConversationSilentMode)!
            .params[1].paramDefaultValue;
          const option = this.metaData.get(MN.setConversationSilentMode)!
            .params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().pushManager.setConversationSilentMode({
              convId,
              convType,
              option,
            }),
            QuickTestScreenPush.TAG,
            name
          );
        }
        break;
      case MN.removeConversationSilentMode:
        {
          const methodName = this.metaData.get(
            MN.removeConversationSilentMode
          )!.methodName;
          console.log(`${MN.removeConversationSilentMode} === ${methodName}`);
          const convId = this.metaData.get(MN.removeConversationSilentMode)!
            .params[0].paramDefaultValue;
          const convType = this.metaData.get(MN.removeConversationSilentMode)!
            .params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().pushManager.removeConversationSilentMode({
              convId,
              convType,
            }),
            QuickTestScreenPush.TAG,
            name
          );
        }
        break;
      case MN.fetchConversationSilentMode:
        {
          const methodName = this.metaData.get(
            MN.fetchConversationSilentMode
          )!.methodName;
          console.log(`${MN.fetchConversationSilentMode} === ${methodName}`);
          const convId = this.metaData.get(MN.fetchConversationSilentMode)!
            .params[0].paramDefaultValue;
          const convType = this.metaData.get(MN.fetchConversationSilentMode)!
            .params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().pushManager.fetchConversationSilentMode({
              convId,
              convType,
            }),
            QuickTestScreenPush.TAG,
            name
          );
        }
        break;
      case MN.setSilentModeForAll:
        {
          const methodName = this.metaData.get(
            MN.setSilentModeForAll
          )!.methodName;
          console.log(`${MN.setSilentModeForAll} === ${methodName}`);
          const option = this.metaData.get(MN.setSilentModeForAll)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().pushManager.setSilentModeForAll(option),
            QuickTestScreenPush.TAG,
            name
          );
        }
        break;
      case MN.fetchSilentModeForAll:
        {
          const methodName = this.metaData.get(
            MN.fetchSilentModeForAll
          )!.methodName;
          console.log(`${MN.fetchSilentModeForAll} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().pushManager.fetchSilentModeForAll(),
            QuickTestScreenPush.TAG,
            name
          );
        }
        break;
      case MN.fetchSilentModeForConversations:
        {
          const methodName = this.metaData.get(
            MN.fetchSilentModeForConversations
          )!.methodName;
          console.log(
            `${MN.fetchSilentModeForConversations} === ${methodName}`
          );
          const conversations = this.metaData.get(
            MN.fetchSilentModeForConversations
          )!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().pushManager.fetchSilentModeForConversations(
              conversations
            ),
            QuickTestScreenPush.TAG,
            name
          );
        }
        break;
      case MN.setPreferredNotificationLanguage:
        {
          const methodName = this.metaData.get(
            MN.setPreferredNotificationLanguage
          )!.methodName;
          console.log(
            `${MN.setPreferredNotificationLanguage} === ${methodName}`
          );
          const languageCode = this.metaData.get(
            MN.setPreferredNotificationLanguage
          )!.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().pushManager.setPreferredNotificationLanguage(
              languageCode
            ),
            QuickTestScreenPush.TAG,
            name
          );
        }
        break;
      case MN.fetchPreferredNotificationLanguage:
        {
          const methodName = this.metaData.get(
            MN.fetchPreferredNotificationLanguage
          )!.methodName;
          console.log(
            `${MN.fetchPreferredNotificationLanguage} === ${methodName}`
          );
          this.tryCatch(
            ChatClient.getInstance().pushManager.fetchPreferredNotificationLanguage(),
            QuickTestScreenPush.TAG,
            name
          );
        }
        break;

      default:
        console.log(`${name}`);
        break;
    }
  }
}
