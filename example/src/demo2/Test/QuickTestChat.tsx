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
  ChatGroupMessageAck,
  ChatMessage,
  ChatMessageEventListener,
  ChatMessageReactionEvent,
  ChatMessageStatusCallback,
  ChatMessageThreadEvent,
  ChatMessageType,
  ChatMessageChatType,
  ChatCmdMessageBody,
} from 'react-native-chat-sdk';
import { ChatManagerCache } from './ChatManagerCache';

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
      let msgListener = new (class implements ChatMessageEventListener {
        that: QuickTestScreenChat;
        constructor(parent: any) {
          this.that = parent as QuickTestScreenChat;
        }
        onMessageReactionDidChange(
          list: Array<ChatMessageReactionEvent>
        ): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onMessageReactionDidChange: `,
            JSON.stringify(list)
          );
        }
        onChatMessageThreadCreated(msgThread: ChatMessageThreadEvent): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onChatMessageThreadCreated: `,
            msgThread
          );
        }
        onChatMessageThreadUpdated(msgThread: ChatMessageThreadEvent): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onChatMessageThreadUpdated: `,
            msgThread
          );
        }
        onChatMessageThreadDestroyed(msgThread: ChatMessageThreadEvent): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onChatMessageThreadDestroyed: `,
            msgThread
          );
        }
        onChatMessageThreadUserRemoved(
          msgThread: ChatMessageThreadEvent
        ): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onChatMessageThreadUserRemoved: `,
            msgThread
          );
        }
        onMessagesReceived(messages: ChatMessage[]): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onMessagesReceived: `,
            messages
          );
          this.that.setState({
            chat_listener:
              `onMessagesReceived: ${messages.length}: ` +
              JSON.stringify(messages),
          });
          if (messages.length > 0) {
            ChatManagerCache.getInstance().addRecvMessage(
              messages[messages.length - 1]
            );
          }
        }
        onCmdMessagesReceived(messages: ChatMessage[]): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onCmdMessagesReceived: `,
            messages
          );
          if (
            messages.length <= 0 ||
            messages[0].body.type !== ChatMessageType.CMD
          ) {
            return;
          }
          let r = messages[0].body;
          let rr = (r as ChatCmdMessageBody).action;
          console.log(
            `${QuickTestScreenChat.TAG}: onMessagesReceived: cmd:`,
            rr
          );
          this.that.setState({ cmd: rr });
          this.that.parseCmd(rr);
        }
        onMessagesRead(messages: ChatMessage[]): void {
          console.log(`${QuickTestScreenChat.TAG}: onMessagesRead: `, messages);
          this.that.setState({
            chat_listener:
              `onMessagesRead: ${messages.length}: ` + JSON.stringify(messages),
          });
        }
        onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onGroupMessageRead: `,
            groupMessageAcks
          );
          this.that.setState({
            chat_listener:
              `onGroupMessageRead: ${groupMessageAcks.length}: ` +
              JSON.stringify(groupMessageAcks),
          });
        }
        onMessagesDelivered(messages: ChatMessage[]): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onMessagesDelivered: ${messages.length}: `,
            messages,
            messages
          );
          this.that.setState({
            chat_listener:
              `onMessagesDelivered: ${messages.length}: ` +
              JSON.stringify(messages),
          });
        }
        onMessagesRecalled(messages: ChatMessage[]): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onMessagesRecalled: `,
            messages
          );
          this.that.setState({
            chat_listener:
              `onMessagesRecalled: ${messages.length}: ` +
              JSON.stringify(messages),
          });
        }
        onConversationsUpdate(): void {
          console.log(`${QuickTestScreenChat.TAG}: onConversationsUpdate: `);
          this.that.setState({ conv_listener: 'onConversationsUpdate' });
        }
        onConversationRead(from: string, to?: string): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onConversationRead: `,
            from,
            to
          );
          this.that.setState({
            conv_listener: `onConversationRead: ${from}, ${to}`,
          });
        }
      })(this);

      ChatClient.getInstance().chatManager.removeAllMessageListener();
      ChatClient.getInstance().chatManager.addMessageListener(msgListener);

      const msgCallback = new (class implements ChatMessageStatusCallback {
        that: QuickTestScreenChat;
        constructor(parent: QuickTestScreenChat) {
          this.that = parent;
        }
        onProgress(localMsgId: string, progress: number): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onProgress: ${localMsgId}, ${progress}`
          );
          this.that.setState({
            cb_result: `onProgress: ${localMsgId}, ${progress}`,
          });
        }
        onError(localMsgId: string, error: ChatError): void {
          console.log(
            `${QuickTestScreenChat.TAG}: onError: ${localMsgId}` + error
          );
          this.that.setState({ cb_result: `onError:` + JSON.stringify(error) });
        }
        onSuccess(message: ChatMessage): void {
          console.log(`${QuickTestScreenChat.TAG}: onSuccess: `, message);
          ChatManagerCache.getInstance().addSendMessage(message);
          this.that.setState({
            cb_result: `onSuccess:` + JSON.stringify(message),
          });
        }
      })(this);

      ChatManagerCache.getInstance().removeAllListener();
      ChatManagerCache.getInstance().addListener(msgCallback);
    }
  }

  protected removeListener?(): void {
    if (super.removeListener) {
      super.removeListener();
    }
  }

  private createFileCallback(): ChatMessageStatusCallback {
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
        this.that.setState({
          cb_result: `onProgress: ${localMsgId}, ${progress}`,
        });
      }
      onError(localMsgId: string, error: ChatError): void {
        console.log(`${QuickTestScreenChat.TAG}: onError: `, localMsgId, error);
        this.that.setState({ cb_result: `onError: ${localMsgId}` + error });
      }
      onSuccess(message: ChatMessage): void {
        console.log(`${QuickTestScreenChat.TAG}: onSuccess: `, message);
        this.that.setState({ cb_result: `onSuccess: ` + message });
      }
    })(this);
    return ret;
  }

  /**
   * 调用对应的SDK方法
   * @param name 方法名称
   */
  protected callApi(name: string): void {
    super.callApi(name);
    switch (name) {
      case MN.sendMessage:
        {
          const methodName = this.metaData.get(MN.sendMessage)?.methodName!;
          console.log(`${MN.sendMessage} === ${methodName}`);
          // const msg =
          //   ChatManagerCache.getInstance().createTextMessageWithParams(
          //     '183504266657793',
          //     'test',
          //     ChatMessageChatType.GroupChat
          //   );
          const msg =
            ChatManagerCache.getInstance().createTextMessageWithTranslate(
              '183504266657793',
              '中国人的节日',
              ChatMessageChatType.GroupChat,
              ['en', 'fr']
            );
          if (msg) {
            this.tryCatch(
              ChatClient.getInstance().chatManager.sendMessage(
                msg,
                ChatManagerCache.getInstance().createCallback()
              ),
              QuickTestScreenChat.TAG,
              MN.sendMessage
            );
          }
        }
        break;
      case MN.resendMessage:
        {
          const methodName = this.metaData.get(MN.resendMessage)?.methodName!;
          console.log(`${MN.resendMessage} === ${methodName}`);
          const msg = ChatManagerCache.getInstance().createTextMessage();
          if (msg) {
            this.tryCatch(
              ChatClient.getInstance().chatManager.resendMessage(
                msg,
                ChatManagerCache.getInstance().createCallback()
              ),
              QuickTestScreenChat.TAG,
              MN.resendMessage
            );
          }
        }
        break;
      case MN.sendMessageReadAck:
        {
          const methodName = this.metaData.get(
            MN.sendMessageReadAck
          )!.methodName;
          console.log(`${MN.sendMessageReadAck} === ${methodName}`);
          const msg = ChatManagerCache.getInstance().getLastRecvMessage();
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
          // const opt = this.metaData.get(MN.sendGroupMessageReadAck)!.params[0]
          //   .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.sendGroupMessageReadAck(
              msgId,
              groupId
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
      case MN.getUnreadCount:
        {
          const methodName = this.metaData.get(MN.getUnreadCount)!.methodName;
          console.log(`${MN.getUnreadCount} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().chatManager.getUnreadCount(),
            QuickTestScreenChat.TAG,
            MN.getUnreadCount
          );
        }
        break;
      case MN.updateMessage:
        {
          const methodName = this.metaData.get(MN.updateMessage)!.methodName;
          console.log(`${MN.updateMessage} === ${methodName}`);
          const msg = ChatManagerCache.getInstance().getLastRecvMessage();
          const newMsg = new ChatMessage(msg);
          newMsg.localMsgId = '1';
          this.tryCatch(
            ChatClient.getInstance().chatManager.updateMessage(newMsg),
            QuickTestScreenChat.TAG,
            MN.updateMessage
          );
        }
        break;
      case MN.importMessages:
        {
          const methodName = this.metaData.get(MN.importMessages)!.methodName;
          console.log(`${MN.importMessages} === ${methodName}`);
          const msg = ChatManagerCache.getInstance().createTextMessage();
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
          this.tryCatch(
            ChatClient.getInstance().chatManager.downloadAttachment(
              ChatManagerCache.getInstance().getLastRecvMessage(),
              this.createFileCallback()
            ),
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
          this.tryCatch(
            ChatClient.getInstance().chatManager.downloadThumbnail(
              ChatManagerCache.getInstance().getLastRecvMessage(),
              this.createFileCallback()
            ),
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
          const pageSize = this.metaData.get(MN.fetchGroupAcks)?.params[2]
            .paramDefaultValue;
          const groupId = this.metaData.get(MN.fetchGroupAcks)?.params[3]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchGroupAcks(
              msgId,
              groupId,
              startAckId,
              pageSize
            ),
            QuickTestScreenChat.TAG,
            MN.fetchGroupAcks
          );
        }
        break;
      case MN.removeConversationFromServer:
        {
          const methodName = this.metaData.get(
            MN.removeConversationFromServer
          )!.methodName;
          console.log(`${MN.removeConversationFromServer} === ${methodName}`);
          const convId = this.metaData.get(MN.removeConversationFromServer)
            ?.params[0].paramDefaultValue;
          const convType = this.metaData.get(MN.removeConversationFromServer)
            ?.params[1].paramDefaultValue;
          const isDeleteMessage = this.metaData.get(
            MN.removeConversationFromServer
          )?.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.removeConversationFromServer(
              convId,
              convType,
              isDeleteMessage
            ),
            QuickTestScreenChat.TAG,
            MN.removeConversationFromServer
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
          const createIfNeed = this.metaData.get(MN.getConversation)?.params[2]
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
      case MN.getAllConversations:
        {
          const methodName = this.metaData.get(
            MN.getAllConversations
          )!.methodName;
          console.log(`${MN.getAllConversations} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().chatManager.getAllConversations(),
            QuickTestScreenChat.TAG,
            MN.getAllConversations
          );
        }
        break;
      case MN.fetchAllConversations:
        {
          const methodName = this.metaData.get(
            MN.fetchAllConversations
          )!.methodName;
          console.log(`${MN.fetchAllConversations} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchAllConversations(),
            QuickTestScreenChat.TAG,
            MN.fetchAllConversations
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
            ChatClient.getInstance().chatManager.getLatestReceivedMessage(
              convId,
              convType
            ),
            QuickTestScreenChat.TAG,
            MN.getLastReceivedMessage
          );
        }
        break;
      case MN.getConversationUnreadCount:
        {
          const methodName = this.metaData.get(
            MN.getConversationUnreadCount
          )!.methodName;
          console.log(`${MN.getConversationUnreadCount} === ${methodName}`);
          const convId = this.metaData.get(MN.getConversationUnreadCount)
            ?.params[0].paramDefaultValue;
          const convType = this.metaData.get(MN.getConversationUnreadCount)
            ?.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getConversationUnreadCount(
              convId,
              convType
            ),
            QuickTestScreenChat.TAG,
            MN.getConversationUnreadCount
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
          const msg = ChatManagerCache.getInstance().createTextMessage();
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
              startMsgId,
              direction,
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
      case MN.getMessageWithTimestamp:
        {
          const methodName = this.metaData.get(
            MN.getMessageWithTimestamp
          )!.methodName;
          console.log(`${MN.getMessageWithTimestamp} === ${methodName}`);
          const convId = this.metaData.get(MN.getMessageWithTimestamp)
            ?.params[0].paramDefaultValue;
          const convType = this.metaData.get(MN.getMessageWithTimestamp)
            ?.params[1].paramDefaultValue;
          const startTime = this.metaData.get(MN.getMessageWithTimestamp)
            ?.params[2].paramDefaultValue;
          const endTime = this.metaData.get(MN.getMessageWithTimestamp)
            ?.params[3].paramDefaultValue;
          const direction = this.metaData.get(MN.getMessageWithTimestamp)
            ?.params[4].paramDefaultValue;
          const count = this.metaData.get(MN.getMessageWithTimestamp)?.params[5]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getMessageWithTimestamp(
              convId,
              convType,
              startTime,
              endTime,
              direction,
              count
            ),
            QuickTestScreenChat.TAG,
            MN.getMessageWithTimestamp
          );
        }
        break;
      case MN.translateMessage:
        {
          const methodName = this.metaData.get(MN.translateMessage)!.methodName;
          console.log(`${MN.translateMessage} === ${methodName}`);
          let msg = this.metaData.get(MN.translateMessage)?.params[0]
            .paramDefaultValue;
          if (this.metaData.get(MN.translateMessage)?.params[0].paramValue) {
            msg = this.metaData
              .get(MN.translateMessage)
              ?.params[0].paramValue?.();
            msg = ChatManagerCache.getInstance().getLastSendMessage();
          }
          const languages = this.metaData.get(MN.translateMessage)?.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.translateMessage(
              msg,
              languages
            ),
            QuickTestScreenChat.TAG,
            MN.translateMessage
          );
        }
        break;
      case MN.fetchSupportLanguages:
        {
          const methodName = this.metaData.get(
            MN.fetchSupportLanguages
          )!.methodName;
          console.log(`${MN.fetchSupportLanguages} === ${methodName}`);
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchSupportedLanguages(),
            QuickTestScreenChat.TAG,
            MN.fetchSupportLanguages
          );
        }
        break;
      case MN.addReaction:
        {
          const methodName = this.metaData.get(MN.addReaction)!.methodName;
          console.log(`${MN.addReaction} === ${methodName}`);
          const reaction = this.metaData.get(MN.addReaction)?.params[0]
            .paramDefaultValue;
          const msgId = this.metaData.get(MN.addReaction)?.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.addReaction(reaction, msgId),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.removeReaction:
        {
          const methodName = this.metaData.get(MN.removeReaction)!.methodName;
          console.log(`${MN.removeReaction} === ${methodName}`);
          const reaction = this.metaData.get(MN.removeReaction)?.params[0]
            .paramDefaultValue;
          const msgId = this.metaData.get(MN.removeReaction)?.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.removeReaction(
              reaction,
              msgId
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.fetchReactionList:
        {
          const methodName = this.metaData.get(
            MN.fetchReactionList
          )!.methodName;
          console.log(`${MN.fetchReactionList} === ${methodName}`);
          const msgIds = this.metaData.get(MN.fetchReactionList)?.params[0]
            .paramDefaultValue;
          const groupId = this.metaData.get(MN.fetchReactionList)?.params[1]
            .paramDefaultValue;
          const chatType = this.metaData.get(MN.fetchReactionList)?.params[2]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchReactionList(
              msgIds,
              groupId,
              chatType
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.fetchReactionDetail:
        {
          const methodName = this.metaData.get(
            MN.fetchReactionDetail
          )!.methodName;
          console.log(`${MN.fetchReactionDetail} === ${methodName}`);
          const msgId = this.metaData.get(MN.fetchReactionDetail)?.params[0]
            .paramDefaultValue;
          const reaction = this.metaData.get(MN.fetchReactionDetail)?.params[1]
            .paramDefaultValue;
          const cursor = this.metaData.get(MN.fetchReactionDetail)?.params[2]
            .paramDefaultValue;
          const pageSize = this.metaData.get(MN.fetchReactionDetail)?.params[3]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchReactionDetail(
              msgId,
              reaction,
              cursor,
              pageSize
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.reportMessage:
        {
          const methodName = this.metaData.get(MN.reportMessage)!.methodName;
          console.log(`${MN.reportMessage} === ${methodName}`);
          const msgId = this.metaData.get(MN.reportMessage)?.params[0]
            .paramDefaultValue;
          const tag = this.metaData.get(MN.reportMessage)?.params[1]
            .paramDefaultValue;
          const reason = this.metaData.get(MN.reportMessage)?.params[2]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.reportMessage(
              msgId,
              tag,
              reason
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.getReactionList:
        {
          const methodName = this.metaData.get(MN.getReactionList)!.methodName;
          console.log(`${MN.getReactionList} === ${methodName}`);
          const msgId = this.metaData.get(MN.getReactionList)?.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getReactionList(msgId),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.groupAckCount:
        {
          const methodName = this.metaData.get(MN.groupAckCount)!.methodName;
          console.log(`${MN.groupAckCount} === ${methodName}`);
          const msgId = this.metaData.get(MN.groupAckCount)?.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.groupAckCount(msgId),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.createChatThread:
        {
          const methodName = this.metaData.get(MN.createChatThread)!.methodName;
          console.log(`${MN.createChatThread} === ${methodName}`);
          const threadName = this.metaData.get(MN.createChatThread)?.params[0]
            .paramDefaultValue;
          const msgId = this.metaData.get(MN.createChatThread)?.params[1]
            .paramDefaultValue;
          const parentId = this.metaData.get(MN.createChatThread)?.params[2]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.createChatThread(
              threadName,
              msgId,
              parentId
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.joinChatThread:
        {
          const methodName = this.metaData.get(MN.joinChatThread)!.methodName;
          console.log(`${MN.joinChatThread} === ${methodName}`);
          const chatThreadId = this.metaData.get(MN.joinChatThread)?.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.joinChatThread(chatThreadId),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.leaveChatThread:
        {
          const methodName = this.metaData.get(MN.leaveChatThread)!.methodName;
          console.log(`${MN.leaveChatThread} === ${methodName}`);
          const chatThreadId = this.metaData.get(MN.leaveChatThread)?.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.leaveChatThread(chatThreadId),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.destroyChatThread:
        {
          const methodName = this.metaData.get(
            MN.destroyChatThread
          )!.methodName;
          console.log(`${MN.destroyChatThread} === ${methodName}`);
          const chatThreadId = this.metaData.get(MN.destroyChatThread)
            ?.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.destroyChatThread(
              chatThreadId
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.updateChatThreadName:
        {
          const methodName = this.metaData.get(
            MN.updateChatThreadName
          )!.methodName;
          console.log(`${MN.updateChatThreadName} === ${methodName}`);
          const chatThreadId = this.metaData.get(MN.updateChatThreadName)
            ?.params[0].paramDefaultValue;
          const newName = this.metaData.get(MN.updateChatThreadName)?.params[1]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.updateChatThreadName(
              chatThreadId,
              newName
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.removeMemberWithChatThread:
        {
          const methodName = this.metaData.get(
            MN.removeMemberWithChatThread
          )!.methodName;
          console.log(`${MN.removeMemberWithChatThread} === ${methodName}`);
          const chatThreadId = this.metaData.get(MN.removeMemberWithChatThread)
            ?.params[0].paramDefaultValue;
          const memberId = this.metaData.get(MN.removeMemberWithChatThread)
            ?.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.removeMemberWithChatThread(
              chatThreadId,
              memberId
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.fetchMembersWithChatThreadFromServer:
        {
          const methodName = this.metaData.get(
            MN.fetchMembersWithChatThreadFromServer
          )!.methodName;
          console.log(
            `${MN.fetchMembersWithChatThreadFromServer} === ${methodName}`
          );
          const chatThreadId = this.metaData.get(
            MN.fetchMembersWithChatThreadFromServer
          )?.params[0].paramDefaultValue;
          const cursor = this.metaData.get(
            MN.fetchMembersWithChatThreadFromServer
          )?.params[1].paramDefaultValue;
          const pageSize = this.metaData.get(
            MN.fetchMembersWithChatThreadFromServer
          )?.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchMembersWithChatThreadFromServer(
              chatThreadId,
              cursor,
              pageSize
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.fetchJoinedChatThreadFromServer:
        {
          const methodName = this.metaData.get(
            MN.fetchJoinedChatThreadFromServer
          )!.methodName;
          console.log(
            `${MN.fetchJoinedChatThreadFromServer} === ${methodName}`
          );
          const cursor = this.metaData.get(MN.fetchJoinedChatThreadFromServer)
            ?.params[0].paramDefaultValue;
          const pageSize = this.metaData.get(MN.fetchJoinedChatThreadFromServer)
            ?.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchJoinedChatThreadFromServer(
              cursor,
              pageSize
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.fetchJoinedChatThreadWithParentFromServer:
        {
          const methodName = this.metaData.get(
            MN.fetchJoinedChatThreadWithParentFromServer
          )!.methodName;
          console.log(
            `${MN.fetchJoinedChatThreadWithParentFromServer} === ${methodName}`
          );
          const parentId = this.metaData.get(
            MN.fetchJoinedChatThreadWithParentFromServer
          )?.params[0].paramDefaultValue;
          const cursor = this.metaData.get(
            MN.fetchJoinedChatThreadWithParentFromServer
          )?.params[1].paramDefaultValue;
          const pageSize = this.metaData.get(
            MN.fetchJoinedChatThreadWithParentFromServer
          )?.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchJoinedChatThreadWithParentFromServer(
              parentId,
              cursor,
              pageSize
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.fetchChatThreadWithParentFromServer:
        {
          const methodName = this.metaData.get(
            MN.fetchChatThreadWithParentFromServer
          )!.methodName;
          console.log(
            `${MN.fetchChatThreadWithParentFromServer} === ${methodName}`
          );
          const chatThreadId = this.metaData.get(
            MN.fetchChatThreadWithParentFromServer
          )?.params[0].paramDefaultValue;
          const cursor = this.metaData.get(
            MN.fetchChatThreadWithParentFromServer
          )?.params[1].paramDefaultValue;
          const pageSize = this.metaData.get(
            MN.fetchChatThreadWithParentFromServer
          )?.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchChatThreadWithParentFromServer(
              chatThreadId,
              cursor,
              pageSize
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.fetchLastMessageWithChatThread:
        {
          const methodName = this.metaData.get(
            MN.fetchLastMessageWithChatThread
          )!.methodName;
          console.log(`${MN.fetchLastMessageWithChatThread} === ${methodName}`);
          const chatThreadIds = this.metaData.get(
            MN.fetchLastMessageWithChatThread
          )?.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchLastMessageWithChatThread(
              chatThreadIds
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.fetchChatThreadFromServer:
        {
          const methodName = this.metaData.get(
            MN.fetchChatThreadFromServer
          )!.methodName;
          console.log(`${MN.fetchChatThreadFromServer} === ${methodName}`);
          const chatThreadId = this.metaData.get(MN.fetchChatThreadFromServer)
            ?.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchChatThreadFromServer(
              chatThreadId
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.getMessageThread:
        {
          const methodName = this.metaData.get(MN.getMessageThread)!.methodName;
          console.log(`${MN.getMessageThread} === ${methodName}`);
          const msgId = this.metaData.get(MN.getMessageThread)?.params[0]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getMessageThread(msgId),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.setConversationExtension:
        {
          const methodName = this.metaData.get(
            MN.setConversationExtension
          )!.methodName;
          console.log(`${MN.setConversationExtension} === ${methodName}`);
          const convId = this.metaData.get(MN.setConversationExtension)
            ?.params[0].paramDefaultValue;
          const convType = this.metaData.get(MN.setConversationExtension)
            ?.params[1].paramDefaultValue;
          const ext = this.metaData.get(MN.setConversationExtension)?.params[2]
            .paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.setConversationExtension(
              convId,
              convType,
              ext
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.insertMessage:
        {
          const methodName = this.metaData.get(MN.insertMessage)!.methodName;
          console.log(`${MN.insertMessage} === ${methodName}`);
          const msg = this.metaData
            .get(MN.insertMessage)
            ?.params[0].paramValue?.();
          this.tryCatch(
            ChatClient.getInstance().chatManager.insertMessage(msg),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.deleteMessagesBeforeTimestamp:
        {
          const methodName = this.metaData.get(
            MN.deleteMessagesBeforeTimestamp
          )!.methodName;
          console.log(`${MN.deleteMessagesBeforeTimestamp} === ${methodName}`);
          const timestamp = this.metaData.get(MN.deleteMessagesBeforeTimestamp)
            ?.params[0].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.deleteMessagesBeforeTimestamp(
              timestamp
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.getThreadConversation:
        {
          const methodName = this.metaData.get(
            MN.getThreadConversation
          )!.methodName;
          console.log(`${MN.getThreadConversation} === ${methodName}`);
          const convId = this.metaData.get(MN.getThreadConversation)?.params[0]
            .paramDefaultValue;
          const createIfNeed = this.metaData.get(MN.getThreadConversation)
            ?.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.getThreadConversation(
              convId,
              createIfNeed
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.fetchConversationsFromServerWithPage:
        {
          const methodName = this.metaData.get(
            MN.fetchConversationsFromServerWithPage
          )!.methodName;
          console.log(
            `${MN.fetchConversationsFromServerWithPage} === ${methodName}`
          );
          const pageSize = this.metaData.get(
            MN.fetchConversationsFromServerWithPage
          )?.params[0].paramDefaultValue;
          const pageNum = this.metaData.get(
            MN.fetchConversationsFromServerWithPage
          )?.params[1].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.fetchConversationsFromServerWithPage(
              pageSize,
              pageNum
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.removeMessagesFromServerWithMsgIds:
        {
          const methodName = this.metaData.get(
            MN.removeMessagesFromServerWithMsgIds
          )!.methodName;
          console.log(
            `${MN.removeMessagesFromServerWithMsgIds} === ${methodName}`
          );
          const convId = this.metaData.get(
            MN.removeMessagesFromServerWithMsgIds
          )?.params[0].paramDefaultValue;
          const convType = this.metaData.get(
            MN.removeMessagesFromServerWithMsgIds
          )?.params[1].paramDefaultValue;
          const msgIds = this.metaData.get(
            MN.removeMessagesFromServerWithMsgIds
          )?.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.removeMessagesFromServerWithMsgIds(
              convId,
              convType,
              msgIds
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      case MN.removeMessagesFromServerWithTimestamp:
        {
          const methodName = this.metaData.get(
            MN.removeMessagesFromServerWithTimestamp
          )!.methodName;
          console.log(
            `${MN.removeMessagesFromServerWithTimestamp} === ${methodName}`
          );
          const convId = this.metaData.get(
            MN.removeMessagesFromServerWithTimestamp
          )?.params[0].paramDefaultValue;
          const convType = this.metaData.get(
            MN.removeMessagesFromServerWithTimestamp
          )?.params[1].paramDefaultValue;
          const timestamp = this.metaData.get(
            MN.removeMessagesFromServerWithTimestamp
          )?.params[2].paramDefaultValue;
          this.tryCatch(
            ChatClient.getInstance().chatManager.removeMessagesFromServerWithTimestamp(
              convId,
              convType,
              timestamp
            ),
            QuickTestScreenChat.TAG,
            name
          );
        }
        break;
      default:
        break;
    }
  }
}
