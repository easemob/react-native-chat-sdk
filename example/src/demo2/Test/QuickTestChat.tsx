import {
  QuickTestScreenBase,
  QuickTestState,
  QuickTestStateless,
  registerStateDataList,
} from './QuickTestScreenBase';
import { MN, metaDataList } from './QuickTestChatData';
import {
  ChatClient,
  ChatError,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageStatusCallback,
} from 'react-native-chat-sdk';

export interface QuickTestChatState extends QuickTestState {}

export interface QuickTestChatStateless extends QuickTestStateless {
  sendMessage: {
    success_message?: ChatMessage;
    fail_message?: ChatMessage;
  };
}

export class QuickTestScreenChat extends QuickTestScreenBase<
  QuickTestChatState,
  QuickTestChatStateless
> {
  protected static TAG = 'QuickTestScreenChat';
  public static route = 'QuickTestScreenChat';
  statelessData: QuickTestChatStateless;

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

  private createCallback(): ChatMessageStatusCallback {
    const ret = new (class implements ChatMessageStatusCallback {
      that: QuickTestScreenChat;
      constructor(t: QuickTestScreenChat) {
        this.that = t;
      }
      onProgress(localMsgId: string, progress: number): void {
        console.log(
          `${QuickTestScreenChat.TAG}: onProgress: `,
          localMsgId,
          progress
        );
      }
      onError(localMsgId: string, error: ChatError): void {
        console.log(`${QuickTestScreenChat.TAG}: onError: `, localMsgId, error);
      }
      onSuccess(message: ChatMessage): void {
        console.log(`${QuickTestScreenChat.TAG}: onSuccess: `, message);
        this.that.statelessData.sendMessage.success_message = message;
      }
    })(this);
    return ret;
  }

  /**
   * 调用对应的SDK方法
   * @param name 方法名称
   */
  protected callApi(name: string): void {
    switch (name) {
      case MN.sendMessage:
        const methodName = this.metaData.get(MN.sendMessage)?.methodName!;
        const targetId = this.metaData.get(MN.sendMessage)?.params[0]
          .paramDefaultValue;
        const targetType: ChatMessageChatType = this.metaData.get(
          MN.sendMessage
        )?.params[1].paramDefaultValue;
        const content: string = Date.now().toString();
        const msg = ChatMessage.createTextMessage(
          targetId,
          content,
          targetType
        );
        this.statelessData.sendMessage.fail_message = msg;
        let cb = this.createCallback();
        this.tryCatch(
          ChatClient.getInstance().chatManager.sendMessage(msg, cb),
          QuickTestScreenChat.TAG,
          methodName
        );
        break;
      case MN.resendMessage:
        break;
      case MN.sendMessageReadAck:
        break;
      case MN.sendGroupMessageReadAck:
        break;
      case MN.sendConversationReadAck:
        break;
      case MN.recallMessage:
        break;
      case MN.getMessage:
        break;
      case MN.markAllConversationsAsRead:
        break;
      case MN.getUnreadMessageCount:
        break;
      case MN.updateMessage:
        break;
      case MN.importMessages:
        break;
      case MN.downloadAttachment:
        break;
      case MN.downloadThumbnail:
        break;
      case MN.fetchHistoryMessages:
        break;
      case MN.searchMsgFromDB:
        break;
      case MN.fetchGroupAcks:
        break;
      case MN.deleteRemoteConversation:
        break;
      case MN.getConversation:
        break;
      case MN.loadAllConversations:
        break;
      case MN.getConversationsFromServer:
        break;
      case MN.deleteConversation:
        break;
      case MN.getLatestMessage:
        break;
      case MN.getLastReceivedMessage:
        break;
      case MN.unreadCount:
        break;
      case MN.markMessageAsRead:
        break;
      case MN.markAllMessagesAsRead:
        break;
      case MN.insertMessage:
        break;
      case MN.appendMessage:
        break;
      case MN.updateConversationMessage:
        break;
      case MN.deleteMessage:
        break;
      case MN.deleteAllMessages:
        break;
      case MN.getMessageById:
        break;
      case MN.getMessagesWithMsgType:
        break;
      case MN.getMessages:
        break;
      case MN.getMessagesWithKeyword:
        break;
      case MN.getMessagesFromTime:
        break;
      default:
        break;
    }
  }
}
