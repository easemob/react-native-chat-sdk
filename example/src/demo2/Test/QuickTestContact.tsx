import {
  QuickTestScreenBase,
  QuickTestState,
  QuickTestStateless,
  registerStateDataList,
} from './QuickTestScreenBase';
import { MN, metaDataList } from './QuickTestContactData';
import { ChatClient } from 'react-native-chat-sdk';

export interface QuickTestContactState extends QuickTestState {}

export interface QuickTestContactStateless extends QuickTestStateless {}

export class QuickTestScreenContact extends QuickTestScreenBase<
  QuickTestContactState,
  QuickTestContactStateless
> {
  protected static TAG = 'QuickTestScreenContact';
  public static route = 'QuickTestScreenContact';
  statelessData: QuickTestContactStateless;

  constructor(props: { navigation: any }) {
    super(props);
    this.state = {
      cmd: '',
      connect_listener: '',
      multi_listener: '',
      custom_listener: '',
      chat_result: '',
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
      case MN.addContact:
        {
          const methodName = this.metaData.get(MN.addContact)!.methodName;
          console.log(`${MN.addContact} === ${methodName}`);
          const username = this.metaData.get(MN.addContact)!.params[0]
            .paramDefaultValue;
          const reason = this.metaData.get(MN.addContact)!.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().contactManager.addContact(
              username,
              reason
            ),
            QuickTestScreenContact.TAG,
            MN.addContact
          );
        }
        break;
      case MN.deleteContact:
        {
          const methodName = this.metaData.get(MN.deleteContact)!.methodName;
          console.log(`${MN.deleteContact} === ${methodName}`);
          const username = this.metaData.get(MN.deleteContact)!.params[0]
            .paramDefaultValue;
          const keepConversation = this.metaData.get(MN.deleteContact)!
            .params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().contactManager.deleteContact(
              username,
              keepConversation
            ),
            QuickTestScreenContact.TAG,
            MN.deleteContact
          );
        }
        break;
      case MN.getAllContactsFromServer:
        {
          const methodName = this.metaData.get(
            MN.getAllContactsFromServer
          )!.methodName;
          console.log(`${MN.getAllContactsFromServer} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().contactManager.getAllContactsFromServer(),
            QuickTestScreenContact.TAG,
            MN.getAllContactsFromServer
          );
        }
        break;
      case MN.getAllContactsFromDB:
        {
          const methodName = this.metaData.get(
            MN.getAllContactsFromDB
          )!.methodName;
          console.log(`${MN.getAllContactsFromDB} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().contactManager.getAllContactsFromDB(),
            QuickTestScreenContact.TAG,
            MN.getAllContactsFromDB
          );
        }
        break;
      case MN.addUserToBlockList:
        {
          const methodName = this.metaData.get(
            MN.addUserToBlockList
          )!.methodName;
          console.log(`${MN.addUserToBlockList} === ${methodName}`);
          const username = this.metaData.get(MN.addUserToBlockList)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().contactManager.addUserToBlockList(
              username
            ),
            QuickTestScreenContact.TAG,
            MN.addUserToBlockList
          );
        }
        break;
      case MN.removeUserFromBlockList:
        {
          const methodName = this.metaData.get(
            MN.removeUserFromBlockList
          )!.methodName;
          console.log(`${MN.removeUserFromBlockList} === ${methodName}`);
          const username = this.metaData.get(MN.removeUserFromBlockList)!
            .params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().contactManager.removeUserFromBlockList(
              username
            ),
            QuickTestScreenContact.TAG,
            MN.removeUserFromBlockList
          );
        }
        break;
      case MN.getBlockListFromServer:
        {
          const methodName = this.metaData.get(
            MN.getBlockListFromServer
          )!.methodName;
          console.log(`${MN.getBlockListFromServer} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().contactManager.getBlockListFromServer(),
            QuickTestScreenContact.TAG,
            MN.getBlockListFromServer
          );
        }
        break;
      case MN.getBlockListFromDB:
        {
          const methodName = this.metaData.get(
            MN.getBlockListFromDB
          )!.methodName;
          console.log(`${MN.getBlockListFromDB} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().contactManager.getBlockListFromDB(),
            QuickTestScreenContact.TAG,
            MN.getBlockListFromDB
          );
        }
        break;
      case MN.acceptInvitation:
        {
          const methodName = this.metaData.get(MN.acceptInvitation)!.methodName;
          const username = this.metaData.get(MN.acceptInvitation)!.params[0]
            .paramDefaultValue;
          console.log(`${MN.acceptInvitation} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().contactManager.acceptInvitation(username),
            QuickTestScreenContact.TAG,
            MN.acceptInvitation
          );
        }
        break;
      case MN.declineInvitation:
        {
          const methodName = this.metaData.get(
            MN.declineInvitation
          )!.methodName;
          const username = this.metaData.get(MN.declineInvitation)!.params[0]
            .paramDefaultValue;
          console.log(`${MN.declineInvitation} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().contactManager.declineInvitation(username),
            QuickTestScreenContact.TAG,
            MN.declineInvitation
          );
        }
        break;
      case MN.getSelfIdsOnOtherPlatform:
        {
          const methodName = this.metaData.get(
            MN.getSelfIdsOnOtherPlatform
          )!.methodName;
          console.log(`${MN.getSelfIdsOnOtherPlatform} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().contactManager.getSelfIdsOnOtherPlatform(),
            QuickTestScreenContact.TAG,
            MN.getSelfIdsOnOtherPlatform
          );
        }
        break;
      default:
        console.log(`${name}`);
        break;
    }
  }
}
