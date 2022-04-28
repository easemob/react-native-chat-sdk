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

  private createTextMessage(): ChatMessage {
    const targetId = this.metaData.get(MN.sendMessage)?.params[0]
      .paramDefaultValue;
    const targetType: ChatMessageChatType = this.metaData.get(MN.sendMessage)
      ?.params[1].paramDefaultValue;
    const content: string = Date.now().toString();
    const msg = ChatMessage.createTextMessage(targetId, content, targetType);
    this.statelessData.sendMessage.fail_message = msg;
    return msg;
  }

  /**
   * 调用对应的SDK方法
   * @param name 方法名称
   */
  protected callApi(name: string): void {
    switch (name) {
      case MN.sendMessage:
        {
          const methodName = this.metaData.get(MN.sendMessage)?.methodName!;
          console.log(`${MN.sendMessage} === ${methodName}`);
          let cb = this.createCallback();
          this.tryCatch(
            ChatClient.getInstance().chatManager.sendMessage(
              this.createTextMessage(),
              cb
            ),
            QuickTestScreenChat.TAG,
            MN.sendMessage
          );
        }
        break;
      case MN.resendMessage:
        {
          const methodName = this.metaData.get(MN.resendMessage)?.methodName!;
          console.log(`${MN.resendMessage} === ${methodName}`);
          const msg = this.statelessData.sendMessage.fail_message!;
          let cb = this.createCallback();
          this.tryCatch(
            ChatClient.getInstance().chatManager.resendMessage(msg, cb),
            QuickTestScreenChat.TAG,
            MN.resendMessage
          );
        }
        break;
      case MN.sendMessageReadAck:
        {
          const methodName = this.metaData.get(
            MN.sendMessageReadAck
          )!.methodName;
          console.log(`${MN.sendMessageReadAck} === ${methodName}`);
          const msg = this.statelessData.sendMessage.success_message!;
          this.tryCatch(
            ChatClient.getInstance().chatManager.sendMessageReadAck(msg),
            QuickTestScreenChat.TAG,
            MN.sendMessageReadAck
          );
        }
        break;
      case MN.sendGroupMessageReadAck:
        {
          const methodName = this.metaData.get(
            MN.sendGroupMessageReadAck
          )!.methodName;
          console.log(`${MN.sendGroupMessageReadAck} === ${methodName}`);
          const msgId = this.metaData.get(MN.sendGroupMessageReadAck)!.params[0]
            .paramDefaultValue;
          const groupId = this.metaData.get(MN.sendGroupMessageReadAck)!
            .params[0].paramDefaultValue;
          const opt = this.metaData.get(MN.sendGroupMessageReadAck)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.sendGroupMessageReadAck(
              msgId,
              groupId,
              opt
            ),
            QuickTestScreenChat.TAG,
            MN.sendGroupMessageReadAck
          );
        }
        break;
      case MN.sendConversationReadAck:
        {
          const methodName = this.metaData.get(
            MN.sendConversationReadAck
          )!.methodName;
          console.log(`${MN.sendConversationReadAck} === ${methodName}`);
          const convId = this.metaData.get(MN.sendConversationReadAck)!
            .params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.sendConversationReadAck(
              convId
            ),
            QuickTestScreenChat.TAG,
            MN.sendConversationReadAck
          );
        }
        break;
      case MN.recallMessage:
        {
          const methodName = this.metaData.get(MN.recallMessage)!.methodName;
          console.log(`${MN.recallMessage} === ${methodName}`);
          const msgId = this.metaData.get(MN.recallMessage)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.recallMessage(msgId),
            QuickTestScreenChat.TAG,
            MN.recallMessage
          );
        }
        break;
      case MN.getMessage:
        {
          const methodName = this.metaData.get(MN.getMessage)!.methodName;
          console.log(`${MN.getMessage} === ${methodName}`);
          const msgId = this.metaData.get(MN.getMessage)!.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getMessage(msgId),
            QuickTestScreenChat.TAG,
            MN.getMessage
          );
        }
        break;
      case MN.markAllConversationsAsRead:
        {
          const methodName = this.metaData.get(
            MN.markAllConversationsAsRead
          )!.methodName;
          console.log(`${MN.markAllConversationsAsRead} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().chatManager.markAllConversationsAsRead(),
            QuickTestScreenChat.TAG,
            MN.markAllConversationsAsRead
          );
        }
        break;
      case MN.getUnreadMessageCount:
        {
          const methodName = this.metaData.get(
            MN.getUnreadMessageCount
          )!.methodName;
          console.log(`${MN.getUnreadMessageCount} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().chatManager.getUnreadMessageCount(),
            QuickTestScreenChat.TAG,
            MN.getUnreadMessageCount
          );
        }
        break;
      case MN.updateMessage:
        {
          const methodName = this.metaData.get(MN.updateMessage)!.methodName;
          console.log(`${MN.updateMessage} === ${methodName}`);
          const msg = this.statelessData.sendMessage.fail_message!;
          msg.hasRead = true;
          this.tryCatch(
            ChatClient.getInstance().chatManager.updateMessage(msg),
            QuickTestScreenChat.TAG,
            MN.updateMessage
          );
        }
        break;
      case MN.importMessages:
        {
          const methodName = this.metaData.get(MN.importMessages)!.methodName;
          console.log(`${MN.importMessages} === ${methodName}`);
          const msg = this.createTextMessage();
          this.tryCatch(
            ChatClient.getInstance().chatManager.importMessages([msg]),
            QuickTestScreenChat.TAG,
            MN.importMessages
          );
        }
        break;
      case MN.downloadAttachment:
        {
          const methodName = this.metaData.get(
            MN.downloadAttachment
          )!.methodName;
          console.log(`${MN.downloadAttachment} === ${methodName}`);
          const msg = this.statelessData.sendMessage.success_message!;
          const cb = this.createCallback();
          this.tryCatch(
            ChatClient.getInstance().chatManager.downloadAttachment(msg, cb),
            QuickTestScreenChat.TAG,
            MN.downloadAttachment
          );
        }
        break;
      case MN.downloadThumbnail:
        {
          const methodName = this.metaData.get(
            MN.downloadThumbnail
          )!.methodName;
          console.log(`${MN.downloadThumbnail} === ${methodName}`);
          const msg = this.statelessData.sendMessage.success_message!;
          const cb = this.createCallback();
          this.tryCatch(
            ChatClient.getInstance().chatManager.downloadThumbnail(msg, cb),
            QuickTestScreenChat.TAG,
            MN.downloadThumbnail
          );
        }
        break;
      case MN.fetchHistoryMessages:
        {
          const methodName = this.metaData.get(
            MN.fetchHistoryMessages
          )!.methodName;
          console.log(`${MN.fetchHistoryMessages} === ${methodName}`);
          const convId = this.metaData.get(MN.fetchHistoryMessages)?.params[0]
            .paramDefaultValue;
          const chatType = this.metaData.get(MN.fetchHistoryMessages)?.params[1]
            .paramDefaultValue;
          const pageSize = this.metaData.get(MN.fetchHistoryMessages)?.params[2]
            .paramDefaultValue;
          const startMsgId = this.metaData.get(MN.fetchHistoryMessages)
            ?.params[3].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchHistoryMessages(
              convId,
              chatType,
              pageSize,
              startMsgId
            ),
            QuickTestScreenChat.TAG,
            MN.fetchHistoryMessages
          );
        }
        break;
      case MN.searchMsgFromDB:
        {
          const methodName = this.metaData.get(MN.searchMsgFromDB)!.methodName;
          console.log(`${MN.searchMsgFromDB} === ${methodName}`);
          const keywords = this.metaData.get(MN.searchMsgFromDB)?.params[0]
            .paramDefaultValue;
          const timestamp = this.metaData.get(MN.searchMsgFromDB)?.params[1]
            .paramDefaultValue;
          const maxCount = this.metaData.get(MN.searchMsgFromDB)?.params[2]
            .paramDefaultValue;
          const from = this.metaData.get(MN.searchMsgFromDB)?.params[3]
            .paramDefaultValue;
          const direction = this.metaData.get(MN.searchMsgFromDB)?.params[4]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.searchMsgFromDB(
              keywords,
              timestamp,
              maxCount,
              from,
              direction
            ),
            QuickTestScreenChat.TAG,
            MN.searchMsgFromDB
          );
        }
        break;
      case MN.fetchGroupAcks:
        {
          const methodName = this.metaData.get(MN.fetchGroupAcks)!.methodName;
          console.log(`${MN.fetchGroupAcks} === ${methodName}`);
          const msgId = this.metaData.get(MN.fetchGroupAcks)?.params[0]
            .paramDefaultValue;
          const startAckId = this.metaData.get(MN.fetchGroupAcks)?.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchGroupAcks(
              msgId,
              startAckId
            ),
            QuickTestScreenChat.TAG,
            MN.fetchGroupAcks
          );
        }
        break;
      case MN.deleteRemoteConversation:
        {
          const methodName = this.metaData.get(
            MN.deleteRemoteConversation
          )!.methodName;
          console.log(`${MN.deleteRemoteConversation} === ${methodName}`);
          const convId = this.metaData.get(MN.deleteRemoteConversation)
            ?.params[0].paramDefaultValue;
          const convType = this.metaData.get(MN.deleteRemoteConversation)
            ?.params[1].paramDefaultValue;
          const isDeleteMessage = this.metaData.get(MN.deleteRemoteConversation)
            ?.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.deleteRemoteConversation(
              convId,
              convType,
              isDeleteMessage
            ),
            QuickTestScreenChat.TAG,
            MN.deleteRemoteConversation
          );
        }
        break;
      case MN.getConversation:
        {
          const methodName = this.metaData.get(MN.getConversation)!.methodName;
          console.log(`${MN.getConversation} === ${methodName}`);
          const convId = this.metaData.get(MN.getConversation)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.getConversation)?.params[1]
            .paramDefaultValue;
          const createIfNeed = this.metaData.get(MN.getConversation)?.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getConversation(
              convId,
              convType,
              createIfNeed
            ),
            QuickTestScreenChat.TAG,
            MN.getConversation
          );
        }
        break;
      case MN.loadAllConversations:
        {
          const methodName = this.metaData.get(
            MN.loadAllConversations
          )!.methodName;
          console.log(`${MN.loadAllConversations} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().chatManager.loadAllConversations(),
            QuickTestScreenChat.TAG,
            MN.loadAllConversations
          );
        }
        break;
      case MN.getConversationsFromServer:
        {
          const methodName = this.metaData.get(
            MN.getConversationsFromServer
          )!.methodName;
          console.log(`${MN.getConversationsFromServer} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().chatManager.getConversationsFromServer(),
            QuickTestScreenChat.TAG,
            MN.getConversationsFromServer
          );
        }
        break;
      case MN.deleteConversation:
        {
          const methodName = this.metaData.get(
            MN.deleteConversation
          )!.methodName;
          console.log(`${MN.deleteConversation} === ${methodName}`);
          const convId = this.metaData.get(MN.deleteConversation)?.params[0]
            .paramDefaultValue;
          const withMessage = this.metaData.get(MN.deleteConversation)
            ?.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.deleteConversation(
              convId,
              withMessage
            ),
            QuickTestScreenChat.TAG,
            MN.deleteConversation
          );
        }
        break;
      case MN.getLatestMessage:
        {
          const methodName = this.metaData.get(MN.getLatestMessage)!.methodName;
          console.log(`${MN.getLatestMessage} === ${methodName}`);
          const convId = this.metaData.get(MN.getLatestMessage)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.getLatestMessage)?.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getLatestMessage(
              convId,
              convType
            ),
            QuickTestScreenChat.TAG,
            MN.getLatestMessage
          );
        }
        break;
      case MN.getLastReceivedMessage:
        {
          const methodName = this.metaData.get(
            MN.getLastReceivedMessage
          )!.methodName;
          console.log(`${MN.getLastReceivedMessage} === ${methodName}`);
          const convId = this.metaData.get(MN.getLastReceivedMessage)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.getLastReceivedMessage)
            ?.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getLastReceivedMessage(
              convId,
              convType
            ),
            QuickTestScreenChat.TAG,
            MN.getLastReceivedMessage
          );
        }
        break;
      case MN.unreadCount:
        {
          const methodName = this.metaData.get(MN.unreadCount)!.methodName;
          console.log(`${MN.unreadCount} === ${methodName}`);
          const convId = this.metaData.get(MN.unreadCount)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.unreadCount)?.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.unreadCount(convId, convType),
            QuickTestScreenChat.TAG,
            MN.unreadCount
          );
        }
        break;
      case MN.markMessageAsRead:
        {
          const methodName = this.metaData.get(
            MN.markMessageAsRead
          )!.methodName;
          console.log(`${MN.markMessageAsRead} === ${methodName}`);
          const convId = this.metaData.get(MN.markMessageAsRead)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.markMessageAsRead)?.params[1]
            .paramDefaultValue;
          const msgId = this.metaData.get(MN.markMessageAsRead)?.params[2]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.markMessageAsRead(
              convId,
              convType,
              msgId
            ),
            QuickTestScreenChat.TAG,
            MN.markMessageAsRead
          );
        }
        break;
      case MN.markAllMessagesAsRead:
        {
          const methodName = this.metaData.get(
            MN.markAllMessagesAsRead
          )!.methodName;
          console.log(`${MN.markAllMessagesAsRead} === ${methodName}`);
          const convId = this.metaData.get(MN.markAllMessagesAsRead)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.markAllMessagesAsRead)
            ?.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.markAllMessagesAsRead(
              convId,
              convType
            ),
            QuickTestScreenChat.TAG,
            MN.markAllMessagesAsRead
          );
        }
        break;
      case MN.insertMessage:
        {
          const methodName = this.metaData.get(MN.insertMessage)!.methodName;
          console.log(`${MN.insertMessage} === ${methodName}`);
          const convId = this.metaData.get(MN.insertMessage)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.insertMessage)?.params[1]
            .paramDefaultValue;
          const msg = this.createTextMessage();
          this.tryCatch(
            ChatClient.getInstance().chatManager.insertMessage(
              convId,
              convType,
              msg
            ),
            QuickTestScreenChat.TAG,
            MN.insertMessage
          );
        }
        break;
      case MN.appendMessage:
        {
          const methodName = this.metaData.get(MN.appendMessage)!.methodName;
          console.log(`${MN.appendMessage} === ${methodName}`);
          const convId = this.metaData.get(MN.appendMessage)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.appendMessage)?.params[1]
            .paramDefaultValue;
          const msg = this.createTextMessage();
          this.tryCatch(
            ChatClient.getInstance().chatManager.appendMessage(
              convId,
              convType,
              msg
            ),
            QuickTestScreenChat.TAG,
            MN.appendMessage
          );
        }
        break;
      case MN.updateConversationMessage:
        {
          const methodName = this.metaData.get(
            MN.updateConversationMessage
          )!.methodName;
          console.log(`${MN.updateConversationMessage} === ${methodName}`);
          const convId = this.metaData.get(MN.updateConversationMessage)
            ?.params[0].paramDefaultValue;
          const convType = this.metaData.get(MN.updateConversationMessage)
            ?.params[1].paramDefaultValue;
          const msg = this.statelessData.sendMessage.success_message!;
          this.tryCatch(
            ChatClient.getInstance().chatManager.updateConversationMessage(
              convId,
              convType,
              msg
            ),
            QuickTestScreenChat.TAG,
            MN.updateConversationMessage
          );
        }
        break;
      case MN.deleteMessage:
        {
          const methodName = this.metaData.get(MN.deleteMessage)!.methodName;
          console.log(`${MN.deleteMessage} === ${methodName}`);
          const convId = this.metaData.get(MN.deleteMessage)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.deleteMessage)?.params[1]
            .paramDefaultValue;
          const msgId = this.metaData.get(MN.deleteMessage)?.params[2]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.deleteMessage(
              convId,
              convType,
              msgId
            ),
            QuickTestScreenChat.TAG,
            MN.deleteMessage
          );
        }
        break;
      case MN.deleteAllMessages:
        {
          const methodName = this.metaData.get(
            MN.deleteAllMessages
          )!.methodName;
          console.log(`${MN.deleteAllMessages} === ${methodName}`);
          const convId = this.metaData.get(MN.deleteAllMessages)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.deleteAllMessages)?.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.deleteAllMessages(
              convId,
              convType
            ),
            QuickTestScreenChat.TAG,
            MN.deleteAllMessages
          );
        }
        break;
      case MN.getMessageById:
        {
          const methodName = this.metaData.get(MN.getMessageById)!.methodName;
          console.log(`${MN.getMessageById} === ${methodName}`);
          const convId = this.metaData.get(MN.getMessageById)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.getMessageById)?.params[1]
            .paramDefaultValue;
          const msgId = this.metaData.get(MN.getMessageById)?.params[2]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getMessageById(
              convId,
              convType,
              msgId
            ),
            QuickTestScreenChat.TAG,
            MN.getMessageById
          );
        }
        break;
      case MN.getMessagesWithMsgType:
        {
          const methodName = this.metaData.get(
            MN.getMessagesWithMsgType
          )!.methodName;
          console.log(`${MN.getMessagesWithMsgType} === ${methodName}`);
          const convId = this.metaData.get(MN.getMessagesWithMsgType)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.getMessagesWithMsgType)
            ?.params[1].paramDefaultValue;
          const msgType = this.metaData.get(MN.getMessagesWithMsgType)
            ?.params[2].paramDefaultValue;
          const direction = this.metaData.get(MN.getMessagesWithMsgType)
            ?.params[3].paramDefaultValue;
          const timestamp = this.metaData.get(MN.getMessagesWithMsgType)
            ?.params[4].paramDefaultValue;
          const count = this.metaData.get(MN.getMessagesWithMsgType)?.params[5]
            .paramDefaultValue;
          const sender = this.metaData.get(MN.getMessagesWithMsgType)?.params[6]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getMessagesWithMsgType(
              convId,
              convType,
              msgType,
              direction,
              timestamp,
              count,
              sender
            ),
            QuickTestScreenChat.TAG,
            MN.getMessagesWithMsgType
          );
        }
        break;
      case MN.getMessages:
        {
          const methodName = this.metaData.get(MN.getMessages)!.methodName;
          console.log(`${MN.getMessages} === ${methodName}`);
          const convId = this.metaData.get(MN.getMessages)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.getMessages)?.params[1]
            .paramDefaultValue;
          const direction = this.metaData.get(MN.getMessages)?.params[2]
            .paramDefaultValue;
          const startMsgId = this.metaData.get(MN.getMessages)?.params[3]
            .paramDefaultValue;
          const loadCount = this.metaData.get(MN.getMessages)?.params[4]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getMessages(
              convId,
              convType,
              direction,
              startMsgId,
              loadCount
            ),
            QuickTestScreenChat.TAG,
            MN.getMessages
          );
        }
        break;
      case MN.getMessagesWithKeyword:
        {
          const methodName = this.metaData.get(
            MN.getMessagesWithKeyword
          )!.methodName;
          console.log(`${MN.getMessagesWithKeyword} === ${methodName}`);
          const convId = this.metaData.get(MN.getMessagesWithKeyword)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.getMessagesWithKeyword)
            ?.params[1].paramDefaultValue;
          const keywords = this.metaData.get(MN.getMessagesWithKeyword)
            ?.params[2].paramDefaultValue;
          const direction = this.metaData.get(MN.getMessagesWithKeyword)
            ?.params[3].paramDefaultValue;
          const timestamp = this.metaData.get(MN.getMessagesWithKeyword)
            ?.params[4].paramDefaultValue;
          const count = this.metaData.get(MN.getMessagesWithKeyword)?.params[5]
            .paramDefaultValue;
          const sender = this.metaData.get(MN.getMessagesWithKeyword)?.params[6]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getMessagesWithKeyword(
              convId,
              convType,
              keywords,
              direction,
              timestamp,
              count,
              sender
            ),
            QuickTestScreenChat.TAG,
            MN.getMessagesWithKeyword
          );
        }
        break;
      case MN.getMessagesFromTime:
        {
          const methodName = this.metaData.get(
            MN.getMessagesFromTime
          )!.methodName;
          console.log(`${MN.getMessagesFromTime} === ${methodName}`);
          const convId = this.metaData.get(MN.getMessagesFromTime)?.params[0]
            .paramDefaultValue;
          const convType = this.metaData.get(MN.getMessagesFromTime)?.params[1]
            .paramDefaultValue;
          const startTime = this.metaData.get(MN.getMessagesFromTime)?.params[2]
            .paramDefaultValue;
          const endTime = this.metaData.get(MN.getMessagesFromTime)?.params[3]
            .paramDefaultValue;
          const direction = this.metaData.get(MN.getMessagesFromTime)?.params[4]
            .paramDefaultValue;
          const count = this.metaData.get(MN.getMessagesFromTime)?.params[5]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getMessagesFromTime(
              convId,
              convType,
              startTime,
              endTime,
              direction,
              count
            ),
            QuickTestScreenChat.TAG,
            MN.getMessagesFromTime
          );
        }
        break;
      default:
        break;
    }
  }
}
