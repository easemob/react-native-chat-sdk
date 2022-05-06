import React, { ReactNode } from 'react';
import { View } from 'react-native';
import {
  ChatClient,
  ChatGroupMessageAck,
  ChatMessageEventListener,
  ChatMessage,
  ChatMessageStatusCallback,
  ChatMessageType,
  ChatMessageChatType,
  ChatDownloadStatus,
  ChatError,
  ChatMessageTypeFromString,
  ChatConversationTypeFromNumber,
} from 'react-native-chat-sdk';
import { styleValues } from '../__internal__/Css';
import {
  LeafScreenBase,
  StateBase,
  StatelessBase,
} from '../__internal__/LeafScreenBase';
import {
  ChatManagerCache,
  metaDataList,
  MN,
  stateDataValue,
  statelessDataValue,
} from './ChatManagerData';
import type { ApiParams } from '../__internal__/DataTypes';

export interface StateChatMessage extends StateBase {
  sendMessage: {
    targetId: string;
    targetType: ChatMessageChatType;
    content?: Object; // multi use
    messageType: ChatMessageType;
    messageResult?: string;
  };
  resendMessage: {
    message: ChatMessage;
  };
  sendMessageReadAck: {
    message: ChatMessage;
  };
  sendGroupMessageReadAck: {
    msgId: string;
    groupId: string;
    opt?: { content: string };
  };
  sendConversationReadAck: {
    convId: string;
  };
  recallMessage: {
    msgId: string;
  };
  getMessage: {
    msgId: string;
  };
  markAllConversationsAsRead: {};
  getUnreadMessageCount: {};
  updateMessage: {
    message: ChatMessage;
  };
  importMessages: {
    message: ChatMessage;
  };
  downloadAttachment: {
    message: ChatMessage;
    callback: ChatMessageStatusCallback;
  };
  downloadThumbnail: {
    message: ChatMessage;
    callback: ChatMessageStatusCallback;
  };
  fetchHistoryMessages: {
    convId: string;
    chatType: number;
    pageSize: number;
    startMsgId: string;
  };
  searchMsgFromDB: {
    keywords: string;
    timestamp: number;
    maxCount: number;
    from: string;
    direction: number;
  };
  fetchGroupAcks: {
    msgId: string;
    startAckId: string;
    pageSize: number;
    groupId: string;
  };
  deleteRemoteConversation: {
    convId: string;
    convType: number;
    isDeleteMessage: boolean;
  };
  getConversation: {
    convId: string;
    convType: number;
    createIfNeed: boolean;
  };
  loadAllConversations: {};
  getConversationsFromServer: {};
  deleteConversation: {
    convId: string;
    withMessage: boolean;
  };
  getLatestMessage: {
    convId: string;
    convType: number;
  };
  getLastReceivedMessage: {
    convId: string;
    convType: number;
  };
  unreadCount: {
    convId: string;
    convType: number;
  };
  markMessageAsRead: {
    convId: string;
    convType: number;
    msgId: string;
  };
  markAllMessagesAsRead: {
    convId: string;
    convType: number;
  };
  insertMessage: {
    convId: string;
    convType: number;
    msg: ChatMessage;
  };
  appendMessage: {
    convId: string;
    convType: number;
    msg: ChatMessage;
  };
  updateConversationMessage: {
    convId: string;
    convType: number;
    msg: ChatMessage;
  };
  deleteMessage: {
    convId: string;
    convType: number;
    msgId: string;
  };
  deleteAllMessages: {
    convId: string;
    convType: number;
  };
  getMessageById: {
    convId: string;
    convType: number;
    msgId: string;
  };
  getMessagesWithMsgType: {
    convId: string;
    convType: number;
    msgType: string;
    direction: number;
    timestamp: number;
    count: number;
    sender: string;
  };
  getMessages: {
    convId: string;
    convType: number;
    direction: number;
    startMsgId: string;
    loadCount: number;
  };
  getMessagesWithKeyword: {
    convId: string;
    convType: number;
    keywords: string;
    direction: number;
    timestamp: number;
    count: number;
    sender: string;
  };
  getMessagesFromTime: {
    convId: string;
    convType: number;
    startTime: number;
    endTime: number;
    direction: number;
    count: number;
  };
}

export interface StatelessChatMessage extends StatelessBase {
  sendMessage: {
    message?: ChatMessage;
    callback?: ChatMessageStatusCallback;
    lastMessage?: ChatMessage;
  };
  resendMessage: {
    message?: ChatMessage;
  };
  sendMessageReadAck: {
    message?: ChatMessage;
  };
}

/**
 * 一个页面多个api，效率高一些
 */
export class ChatManagerLeafScreen extends LeafScreenBase<StateChatMessage> {
  protected static TAG = 'ChatManagerLeafScreen';
  public static route = 'ChatManagerLeafScreen';
  metaData: Map<string, ApiParams>;
  statelessData: StatelessChatMessage;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaData = metaDataList;
    this.state = stateDataValue;
    this.statelessData = statelessDataValue;
  }

  protected renderResult(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderSendResult()}
        {this.renderRecvResult()}
        {this.renderExceptionResult()}
      </View>
    );
  }

  protected renderBody(): ReactNode {
    console.log(`${ChatManagerLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>
        {this.sendMessage(false)}
        {this.renderApiDom()}
      </View>
    );
  }
  protected renderApiDom(): ReactNode[] {
    const apiList = [
      'resendMessage',
      'sendMessageReadAck',
      'sendGroupMessageReadAck',
      'sendConversationReadAck',
      'recallMessage',
      'getMessage',
      'markAllConversationsAsRead',
      'getUnreadMessageCount',
      'updateMessage',
      'importMessages',
      'downloadAttachment',
      'downloadThumbnail',
      'fetchHistoryMessages',
      'searchMsgFromDB',
      'fetchGroupAcks',
      'deleteRemoteConversation',
      'getConversation',
      'loadAllConversations',
      'getConversationsFromServer',
      'deleteConversation',
      'getLatestMessage',
      'getLastReceivedMessage',
      'unreadCount',
      'markMessageAsRead',
      'markAllMessagesAsRead',
      'insertMessage',
      'appendMessage',
      'updateConversationMessage',
      'deleteMessage',
      'deleteAllMessages',
      'getMessageById',
      'getMessagesWithMsgType',
      'getMessages',
      'getMessagesWithKeyword',
      'getMessagesFromTime',
    ];
    let renderDomAry: ({} | null | undefined)[] = [];
    const data = this.metaData;
    apiList.forEach((apiItem) => {
      this.setKeyPrefix(apiItem);
      renderDomAry.push(
        this.renderParamWithText(data.get(apiItem)!.methodName)
      );
      data.get(apiItem)?.params.forEach((item) => {
        let currentData = data.get(apiItem);
        let itemValue =
          // eslint-disable-next-line no-undef
          this.state[apiItem as keyof typeof this.state][
            item.paramName as keyof typeof currentData
          ];
        let value =
          item.paramType === 'object' ? JSON.stringify(itemValue) : itemValue;
        renderDomAry.push(
          this.renderGroupParamWithInput(
            item.paramName,
            item.paramType,
            value,
            (inputData: { [index: string]: string }) => {
              let paramValue: any = {};
              paramValue[apiItem] = Object.assign(
                {},
                // eslint-disable-next-line no-undef
                this.state[apiItem as keyof typeof this.state],
                inputData
              );
              return this.setState(paramValue);
            }
          )
        );
      });
      renderDomAry.push(
        this.renderButton(data.get(apiItem)!.methodName, () => {
          this.callApi(data.get(apiItem)!.methodName);
        })
      );
      renderDomAry.push(this.renderDivider());
    });
    renderDomAry.push(this.addSpaces());
    return renderDomAry;
  }

  private getContentDefault(bodyType: ChatMessageType): Object {
    if (bodyType === ChatMessageType.TXT) {
      return Date.now().toString();
    } else if (bodyType === ChatMessageType.CMD) {
      return { action: 'drop' };
    } else if (bodyType === ChatMessageType.IMAGE) {
      return {
        localPath: '',
        secret: '',
        remotePath: '',
        fileStatus: '',
        fileSize: 0,
        displayName: '',
        sendOriginalImage: false,
        thumbnailLocalPath: '',
        thumbnailRemotePath: '',
        thumbnailSecret: '',
        thumbnailStatus: ChatDownloadStatus.PENDING,
        width: 100,
        height: 100,
      };
    } else if (bodyType === ChatMessageType.VOICE) {
      return {
        localPath: '',
        secret: '',
        remotePath: '',
        fileStatus: '',
        fileSize: 0,
        displayName: '',
        duration: 5,
      };
    } else if (bodyType === ChatMessageType.VIDEO) {
      return {
        localPath: '',
        secret: '',
        remotePath: '',
        fileStatus: '',
        fileSize: 0,
        displayName: '',
        thumbnailLocalPath: '',
        thumbnailRemotePath: '',
        thumbnailSecret: '',
        thumbnailStatus: ChatDownloadStatus.PENDING,
        width: 100,
        height: 100,
      };
    } else if (bodyType === ChatMessageType.FILE) {
      return {
        localPath: '',
        secret: '',
        remotePath: '',
        fileStatus: '',
        fileSize: 0,
        displayName: '',
      };
    } else if (bodyType === ChatMessageType.LOCATION) {
      return {
        address: 'beijing',
        latitude: '116.323263',
        longitude: '39.965772',
      };
    } else if (bodyType === ChatMessageType.CUSTOM) {
      return { event: 'alert', params: { key: 'value' } };
    } else {
      throw new Error('error: ' + bodyType);
    }
  }
  protected addListener?(): void {
    let msgListener = new (class implements ChatMessageEventListener {
      that: ChatManagerLeafScreen;
      constructor(parent: any) {
        this.that = parent as ChatManagerLeafScreen;
      }
      onMessagesReceived(messages: ChatMessage[]): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onMessagesReceived: `,
          messages
        );
        const { content, targetId, targetType, messageType, messageResult } =
          this.that.state.sendMessage;
        this.that.setState({
          recvResult: `onMessagesReceived: ${messages.length}: ` + messages,
          sendMessage: {
            content: content,
            targetId: targetId,
            targetType: targetType,
            messageType: messageType,
            messageResult: messageResult,
          },
        });
        if (messages.length > 1) {
          ChatManagerCache.getInstance().addRecvMessage(
            messages[messages.length - 1]
          );
        }
      }
      onCmdMessagesReceived(messages: ChatMessage[]): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onCmdMessagesReceived: `,
          messages
        );
        const { content, targetId, targetType, messageType, messageResult } =
          this.that.state.sendMessage;
        this.that.setState({
          recvResult: `onCmdMessagesReceived: ${messages.length}: ` + messages,
          sendMessage: {
            content: content,
            targetId: targetId,
            targetType: targetType,
            messageType: messageType,
            messageResult: messageResult,
          },
        });
        if (messages.length > 1) {
          ChatManagerCache.getInstance().addRecvMessage(
            messages[messages.length - 1]
          );
        }
      }
      onMessagesRead(messages: ChatMessage[]): void {
        console.log(`${ChatManagerLeafScreen.TAG}: onMessagesRead: `, messages);
        this.that.setState({
          recvResult: `onMessagesRead: ${messages.length}: ` + messages,
        });
      }
      onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onGroupMessageRead: `,
          groupMessageAcks
        );
        this.that.setState({
          recvResult:
            `onGroupMessageRead: ${groupMessageAcks.length}: ` +
            groupMessageAcks,
        });
      }
      onMessagesDelivered(messages: ChatMessage[]): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onMessagesDelivered: ${messages.length}: `,
          messages,
          messages
        );
        this.that.setState({
          recvResult: `onMessagesDelivered: ${messages.length}: ` + messages,
        });
      }
      onMessagesRecalled(messages: ChatMessage[]): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onMessagesRecalled: `,
          messages
        );
        this.that.setState({
          recvResult: `onMessagesRecalled: ${messages.length}: ` + messages,
        });
      }
      onConversationsUpdate(): void {
        console.log(`${ChatManagerLeafScreen.TAG}: onConversationsUpdate: `);
        this.that.setState({ recvResult: 'onConversationsUpdate' });
      }
      onConversationRead(from: string, to?: string): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onConversationRead: `,
          from,
          to
        );
        this.that.setState({
          recvResult: `onConversationRead: ${from}, ${to}`,
        });
      }
    })(this);

    ChatClient.getInstance().chatManager.removeAllMessageListener();
    ChatClient.getInstance().chatManager.addMessageListener(msgListener);

    const msgCallback = new (class implements ChatMessageStatusCallback {
      that: ChatManagerLeafScreen;
      constructor(parent: ChatManagerLeafScreen) {
        this.that = parent;
      }
      onProgress(localMsgId: string, progress: number): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onProgress: ${localMsgId}, ${progress}`
        );
      }
      onError(localMsgId: string, error: ChatError): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onError: ${localMsgId}, ${error}`
        );
      }
      onSuccess(message: ChatMessage): void {
        console.log(`${ChatManagerLeafScreen.TAG}: onSuccess: ${message}`);
        ChatManagerCache.getInstance().addSendMessage(message);
      }
    })(this);

    ChatManagerCache.getInstance().removeAllListener();
    ChatManagerCache.getInstance().addListener(msgCallback);
  }

  protected removeListener?(): void {
    ChatClient.getInstance().chatManager.removeAllMessageListener();
  }

  protected renderSendMessageBodyText(): ReactNode[] {
    const { targetId, targetType, messageType, content, messageResult } =
      this.state.sendMessage;

    // content
    const c =
      content === undefined
        ? (this.getContentDefault(ChatMessageType.TXT) as string)
        : (content as string);

    const msg = ChatMessage.createTextMessage(targetId, c, targetType);
    ChatManagerCache.getInstance().addSendMessage(msg);

    return [
      this.renderParamWithInput(ChatMessageType.TXT, c, (text: string) => {
        this.setState({
          sendMessage: {
            targetId,
            targetType,
            content: text,
            messageType,
            messageResult,
          },
        });
      }),
    ];
  }
  protected renderSendMessageBodyCmd(): ReactNode[] {
    const { targetId, targetType, messageType, content, messageResult } =
      this.state.sendMessage;

    const c =
      content === undefined
        ? this.getContentDefault(ChatMessageType.CMD)
        : content;

    const action = (c as any).action;

    const msg = ChatMessage.createCmdMessage(targetId, action, targetType);
    ChatManagerCache.getInstance().addSendMessage(msg);

    return [
      this.renderParamWithInput(
        ChatMessageType.CMD,
        JSON.stringify(c),
        (text: string) => {
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: JSON.parse(text),
              messageType,
              messageResult,
            },
          });
        }
      ),
    ];
  }
  protected renderSendMessageBodyLocation(): ReactNode[] {
    const { targetId, targetType, messageType, content, messageResult } =
      this.state.sendMessage;

    // content
    const c =
      content === undefined
        ? this.getContentDefault(ChatMessageType.LOCATION)
        : content;

    const lat = (c as any).latitude;
    const lon = (c as any).longitude;
    const add = (c as any).address;

    const msg = ChatMessage.createLocationMessage(
      targetId,
      lat,
      lon,
      targetType,
      { address: add }
    );
    ChatManagerCache.getInstance().addSendMessage(msg);

    return [
      this.renderParamWithInput(
        ChatMessageType.LOCATION,
        JSON.stringify(c),
        (text: string) => {
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: JSON.parse(text),
              messageType,
              messageResult,
            },
          });
        }
      ),
    ];
  }

  protected renderSendMessageBodyCustom(): ReactNode[] {
    const { targetId, targetType, messageType, content, messageResult } =
      this.state.sendMessage;

    // content
    const c =
      content === undefined
        ? this.getContentDefault(ChatMessageType.CUSTOM)
        : content;

    const event = (c as any).event;
    const params = (c as any).params;

    const msg = ChatMessage.createCustomMessage(targetId, event, targetType, {
      params,
    });
    ChatManagerCache.getInstance().addSendMessage(msg);

    return [
      this.renderParamWithInput(
        ChatMessageType.CUSTOM,
        JSON.stringify(c),
        (text: string) => {
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: JSON.parse(text),
              messageType,
              messageResult,
            },
          });
        }
      ),
    ];
  }
  protected renderSendMessageBodyFile(): ReactNode[] {
    const { targetId, targetType, messageType, content, messageResult } =
      this.state.sendMessage;

    // content
    const c =
      content === undefined
        ? this.getContentDefault(ChatMessageType.FILE)
        : content;

    const localPath = (c as any).localPath;
    const displayName = (c as any).displayName;

    const msg = ChatMessage.createFileMessage(targetId, localPath, targetType, {
      displayName,
    });
    ChatManagerCache.getInstance().addSendMessage(msg);

    const path =
      content === undefined ? '' : JSON.parse(content as string).localPath;

    return [
      this.renderParamWithInput(
        ChatMessageType.FILE,
        JSON.stringify(c),
        (text: string) => {
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: JSON.parse(text),
              messageType,
              messageResult,
            },
          });
        }
      ),
      this.renderParamWithSelectFile('path', path, (json: string) => {
        let cc = this.getContentDefault(ChatMessageType.FILE);
        const j = JSON.parse(json);
        (cc as any).localPath = j.localPath ?? '';
        (cc as any).displayName = j.name ?? '';
        (cc as any).fileSize = j.size ?? 0;
        this.setState({
          sendMessage: {
            targetId,
            targetType,
            content: cc,
            messageType,
            messageResult,
          },
        });
      }),
    ];
  }
  protected renderSendMessageBodyVoice(): ReactNode[] {
    const { targetId, targetType, messageType, content, messageResult } =
      this.state.sendMessage;

    // content
    const c =
      content === undefined
        ? this.getContentDefault(ChatMessageType.VOICE)
        : content;

    const filePath = (c as any).localPath;
    const displayName = (c as any).displayName;
    const duration = (c as any).duration;

    const msg = ChatMessage.createVoiceMessage(targetId, filePath, targetType, {
      displayName,
      duration,
    });
    ChatManagerCache.getInstance().addSendMessage(msg);

    const path =
      content === undefined ? '' : JSON.parse(content as string).localPath;

    return [
      this.renderParamWithInput(
        ChatMessageType.VOICE,
        JSON.stringify(c),
        (text: string) => {
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: JSON.parse(text),
              messageType,
              messageResult,
            },
          });
        }
      ),
      this.renderParamWithSelectFile('path', path, (json: string) => {
        let cc = this.getContentDefault(ChatMessageType.VOICE);
        const j = JSON.parse(json);
        (cc as any).localPath = j.localPath ?? '';
        (cc as any).displayName = j.name ?? '';
        (cc as any).fileSize = j.size ?? 0;
        this.setState({
          sendMessage: {
            targetId,
            targetType,
            content: cc,
            messageType,
            messageResult,
          },
        });
      }),
    ];
  }
  protected renderSendMessageBodyImage(): ReactNode[] {
    const { targetId, targetType, messageType, content, messageResult } =
      this.state.sendMessage;

    // content
    const c =
      content === undefined
        ? this.getContentDefault(ChatMessageType.IMAGE)
        : content;

    const filePath = (c as any).localPath;
    const displayName = (c as any).displayName;
    const width = (c as any).width;
    const height = (c as any).heigh;
    const thumbnailLocalPath = (c as any).thumbnailLocalPath;
    const sendOriginalImage = (c as any).sendOriginalImage;

    const msg = ChatMessage.createImageMessage(targetId, filePath, targetType, {
      displayName,
      width,
      height,
      thumbnailLocalPath,
      sendOriginalImage,
    });
    ChatManagerCache.getInstance().addSendMessage(msg);

    const path =
      content === undefined ? '' : JSON.parse(content as string).localPath;

    return [
      this.renderParamWithInput(
        ChatMessageType.IMAGE,
        JSON.stringify(c),
        (text: string) => {
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: JSON.parse(text),
              messageType,
              messageResult,
            },
          });
        }
      ),
      this.renderParamWithSelectMediaFile(
        'Image',
        'path',
        path,
        (json: string) => {
          let cc = this.getContentDefault(ChatMessageType.IMAGE);
          const j = JSON.parse(json);
          (cc as any).localPath = j.localPath ?? '';
          (cc as any).displayName = j.name ?? '';
          (cc as any).fileSize = j.size ?? 0;
          (cc as any).thumbnailLocalPath = j.localPath ?? '';
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: cc,
              messageType,
              messageResult,
            },
          });
        }
      ),
    ];
  }
  protected renderSendMessageBodyVideo(): ReactNode[] {
    const { targetId, targetType, messageType, content, messageResult } =
      this.state.sendMessage;

    // content
    const c =
      content === undefined
        ? this.getContentDefault(ChatMessageType.VIDEO)
        : content;

    const filePath = (c as any).localPath;
    const displayName = (c as any).displayName;
    const width = (c as any).width;
    const height = (c as any).heigh;
    const thumbnailLocalPath = (c as any).thumbnailLocalPath;
    const duration = (c as any).duration;

    const msg = ChatMessage.createVideoMessage(targetId, filePath, targetType, {
      displayName,
      width,
      height,
      thumbnailLocalPath,
      duration,
    });
    ChatManagerCache.getInstance().addSendMessage(msg);

    return [
      this.renderParamWithInput(
        ChatMessageType.VIDEO,
        JSON.stringify(c),
        (text: string) => {
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: JSON.parse(text),
              messageType,
              messageResult,
            },
          });
        }
      ),
      this.renderParamWithSelectMediaFile(
        'Video',
        'path',
        filePath,
        (json: string) => {
          let cc = this.getContentDefault(ChatMessageType.VIDEO);
          const j = JSON.parse(json);
          (cc as any).localPath = j.localPath ?? '';
          (cc as any).displayName = j.name ?? '';
          (cc as any).fileSize = j.size ?? 0;
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: cc,
              messageType,
              messageResult,
            },
          });
        }
      ),
      this.renderParamWithSelectMediaFile(
        'Image',
        'path',
        thumbnailLocalPath,
        (json: string) => {
          let cc = this.getContentDefault(ChatMessageType.VIDEO);
          const j = JSON.parse(json);
          (cc as any).thumbnailLocalPath = j.localPath ?? '';
          this.setState({
            sendMessage: {
              targetId,
              targetType,
              content: cc,
              messageType,
              messageResult,
            },
          });
        }
      ),
    ];
  }

  protected renderSendMessageBody(bodyType: ChatMessageType): ReactNode[] {
    if (bodyType === ChatMessageType.TXT) {
      return this.renderSendMessageBodyText();
    } else if (bodyType === ChatMessageType.CMD) {
      return this.renderSendMessageBodyCmd();
    } else if (bodyType === ChatMessageType.IMAGE) {
      return this.renderSendMessageBodyImage();
    } else if (bodyType === ChatMessageType.VOICE) {
      return this.renderSendMessageBodyVoice();
    } else if (bodyType === ChatMessageType.VIDEO) {
      return this.renderSendMessageBodyVideo();
    } else if (bodyType === ChatMessageType.FILE) {
      return this.renderSendMessageBodyFile();
    } else if (bodyType === ChatMessageType.LOCATION) {
      return this.renderSendMessageBodyLocation();
    } else if (bodyType === ChatMessageType.CUSTOM) {
      return this.renderSendMessageBodyCustom();
    } else {
      throw new Error('error: ' + bodyType);
    }
  }

  protected sendMessage(isResend: boolean): ReactNode[] {
    this.setKeyPrefix(MN.sendMessage);
    const data = isResend
      ? this.metaData.get(MN.resendMessage)!
      : this.metaData.get(MN.sendMessage)!;
    const { content, targetId, targetType, messageType, messageResult } =
      this.state.sendMessage;

    const getTargetId = (tt: ChatMessageChatType): string => {
      if (tt === ChatMessageChatType.PeerChat) {
        return 'PeerChat';
      } else if (tt === ChatMessageChatType.GroupChat) {
        return 'GroupChat';
      } else if (tt === ChatMessageChatType.ChatRoom) {
        return 'ChatRoom';
      }
      throw new Error('error: ' + tt);
    };

    return [
      this.renderParamWithText(data.methodName),
      this.renderParamWithInput(data.params[0].paramName, targetId),
      this.renderParamWithEnum(
        data.params[1].paramName,
        ['PeerChat', 'GroupChat', 'ChatRoom'],
        getTargetId(targetType),
        (index: string, option: any) => {
          let tt = ChatMessageChatType.PeerChat;
          if (option === 'PeerChat') {
            tt = ChatMessageChatType.PeerChat;
          } else if (option === 'GroupChat') {
            tt = ChatMessageChatType.GroupChat;
          } else if (option === 'ChatRoom') {
            tt = ChatMessageChatType.ChatRoom;
          } else {
            throw new Error('error: ' + option);
          }
          this.setState({
            sendMessage: {
              content,
              targetId,
              targetType: tt,
              messageType,
              messageResult,
            },
          });
        }
      ),
      this.renderParamWithEnum(
        data.params[3].paramName,
        [
          ChatMessageType.TXT,
          ChatMessageType.CMD,
          ChatMessageType.IMAGE,
          ChatMessageType.VOICE,
          ChatMessageType.VIDEO,
          ChatMessageType.FILE,
          ChatMessageType.LOCATION,
          ChatMessageType.CUSTOM,
        ],
        messageType,
        (index: string, option: any) => {
          let bt = ChatMessageType.TXT;
          if (option === ChatMessageType.TXT) {
            bt = ChatMessageType.TXT;
          } else if (option === ChatMessageType.CMD) {
            bt = ChatMessageType.CMD;
          } else if (option === ChatMessageType.IMAGE) {
            bt = ChatMessageType.IMAGE;
          } else if (option === ChatMessageType.VOICE) {
            bt = ChatMessageType.VOICE;
          } else if (option === ChatMessageType.VIDEO) {
            bt = ChatMessageType.VIDEO;
          } else if (option === ChatMessageType.FILE) {
            bt = ChatMessageType.FILE;
          } else if (option === ChatMessageType.LOCATION) {
            bt = ChatMessageType.LOCATION;
          } else if (option === ChatMessageType.CUSTOM) {
            bt = ChatMessageType.CUSTOM;
          } else {
            throw new Error('error: ' + option);
          }
          this.setState({
            sendMessage: {
              content: undefined, //reset
              targetId,
              targetType,
              messageType: bt,
              messageResult,
            },
          });
        }
      ),
      this.renderSendMessageBody(messageType),
      this.renderButton(data.methodName, () => {
        this.callApi(data.methodName);
      }),
      this.renderDivider(),
    ];
  }

  private callApi(name: string): void {
    console.log(`${ChatManagerLeafScreen.TAG}: callApi: `);
    if (name === MN.sendMessage) {
      const message = ChatManagerCache.getInstance().getLastSendMessage();
      if (message) {
        this.tryCatch(
          ChatClient.getInstance().chatManager.sendMessage(
            message,
            ChatManagerCache.getInstance().createCallback()
          ),
          ChatManagerLeafScreen.TAG,
          this.metaData.get(MN.sendMessage)!.methodName
        );
      }
    } else if (name === MN.resendMessage) {
      const message = ChatManagerCache.getInstance().getLastSendMessage();
      if (message) {
        this.tryCatch(
          ChatClient.getInstance().chatManager.resendMessage(
            message,
            ChatManagerCache.getInstance().createCallback()
          ),
          ChatManagerLeafScreen.TAG,
          this.metaData.get(MN.resendMessage)!.methodName
        );
      }
    } else if (name === MN.sendMessageReadAck) {
      const lastMessage = ChatManagerCache.getInstance().getLastSendMessage();
      if (lastMessage) {
        this.tryCatch(
          ChatClient.getInstance().chatManager.sendMessageReadAck(lastMessage),
          ChatManagerLeafScreen.TAG,
          this.metaData.get(MN.sendMessageReadAck)!.methodName
        );
      }
    } else if (name === MN.sendGroupMessageReadAck) {
      const { msgId, groupId, opt } = this.state.sendGroupMessageReadAck;
      this.tryCatch(
        ChatClient.getInstance().chatManager.sendGroupMessageReadAck(
          msgId,
          groupId,
          opt
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.sendGroupMessageReadAck)!.methodName
      );
    } else if (name === MN.sendConversationReadAck) {
      const { convId } = this.state.sendConversationReadAck;
      this.tryCatch(
        ChatClient.getInstance().chatManager.sendConversationReadAck(convId),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.sendConversationReadAck)!.methodName
      );
    } else if (name === MN.recallMessage) {
      const { msgId } = this.state.recallMessage;
      this.tryCatch(
        ChatClient.getInstance().chatManager.recallMessage(msgId),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.recallMessage)!.methodName
      );
    } else if (name === MN.getMessage) {
      const { msgId } = this.state.getMessage;
      this.tryCatch(
        ChatClient.getInstance().chatManager.getMessage(msgId),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getMessage)!.methodName
      );
    } else if (name === MN.markAllConversationsAsRead) {
      this.tryCatch(
        ChatClient.getInstance().chatManager.markAllConversationsAsRead(),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.markAllConversationsAsRead)!.methodName
      );
    } else if (name === MN.getUnreadMessageCount) {
      this.tryCatch(
        ChatClient.getInstance().chatManager.getUnreadMessageCount(),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getUnreadMessageCount)!.methodName
      );
    } else if (name === MN.updateMessage) {
      const { message } = this.state.updateMessage;
      this.tryCatch(
        ChatClient.getInstance().chatManager.updateMessage(message),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.updateMessage)!.methodName
      );
    } else if (name === MN.importMessages) {
      const { message } = this.state.importMessages;
      this.tryCatch(
        ChatClient.getInstance().chatManager.importMessages([message]),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.importMessages)!.methodName
      );
    } else if (name === MN.downloadAttachment) {
      const { message, callback } = this.state.downloadAttachment;
      this.tryCatch(
        ChatClient.getInstance().chatManager.downloadAttachment(
          message,
          callback
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.downloadAttachment)!.methodName
      );
    } else if (name === MN.downloadThumbnail) {
      const { message, callback } = this.state.downloadThumbnail;
      this.tryCatch(
        ChatClient.getInstance().chatManager.downloadThumbnail(
          message,
          callback
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.downloadThumbnail)!.methodName
      );
    } else if (name === MN.fetchHistoryMessages) {
      const { convId, chatType, pageSize, startMsgId } =
        this.state.fetchHistoryMessages;
      this.tryCatch(
        ChatClient.getInstance().chatManager.fetchHistoryMessages(
          convId,
          ChatConversationTypeFromNumber(chatType),
          pageSize,
          startMsgId
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.fetchHistoryMessages)!.methodName
      );
    } else if (name === MN.searchMsgFromDB) {
      const { keywords, timestamp, maxCount, from, direction } =
        this.state.searchMsgFromDB;
      this.tryCatch(
        ChatClient.getInstance().chatManager.searchMsgFromDB(
          keywords,
          timestamp,
          maxCount,
          from,
          direction
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.searchMsgFromDB)!.methodName
      );
    } else if (name === MN.fetchGroupAcks) {
      const { msgId, startAckId, pageSize, groupId } =
        this.state.fetchGroupAcks;
      this.tryCatch(
        ChatClient.getInstance().chatManager.fetchGroupAcks(
          msgId,
          groupId,
          startAckId,
          pageSize
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.fetchGroupAcks)!.methodName
      );
    } else if (name === MN.deleteRemoteConversation) {
      const { convId, convType, isDeleteMessage } =
        this.state.deleteRemoteConversation;
      this.tryCatch(
        ChatClient.getInstance().chatManager.deleteRemoteConversation(
          convId,
          convType,
          isDeleteMessage
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.deleteRemoteConversation)!.methodName
      );
    } else if (name === MN.getConversation) {
      const { convId, convType, createIfNeed } = this.state.getConversation;
      this.tryCatch(
        ChatClient.getInstance().chatManager.getConversation(
          convId,
          convType,
          createIfNeed
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getConversation)!.methodName
      );
    } else if (name === MN.loadAllConversations) {
      this.tryCatch(
        ChatClient.getInstance().chatManager.loadAllConversations(),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.loadAllConversations)!.methodName
      );
    } else if (name === MN.getConversationsFromServer) {
      this.tryCatch(
        ChatClient.getInstance().chatManager.getConversationsFromServer(),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getConversationsFromServer)!.methodName
      );
    } else if (name === MN.deleteConversation) {
      const { convId, withMessage } = this.state.deleteConversation;
      this.tryCatch(
        ChatClient.getInstance().chatManager.deleteConversation(
          convId,
          withMessage
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.deleteConversation)!.methodName
      );
    } else if (name === MN.getLatestMessage) {
      const { convId, convType } = this.state.getLatestMessage;
      this.tryCatch(
        ChatClient.getInstance().chatManager.getLatestMessage(
          convId,
          ChatConversationTypeFromNumber(convType)
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getLatestMessage)!.methodName
      );
    } else if (name === MN.getLastReceivedMessage) {
      const { convId, convType } = this.state.getLastReceivedMessage;
      this.tryCatch(
        ChatClient.getInstance().chatManager.getLastReceivedMessage(
          convId,
          ChatConversationTypeFromNumber(convType)
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getLastReceivedMessage)!.methodName
      );
    } else if (name === MN.unreadCount) {
      const { convId, convType } = this.state.unreadCount;
      this.tryCatch(
        ChatClient.getInstance().chatManager.unreadCount(
          convId,
          ChatConversationTypeFromNumber(convType)
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.unreadCount)!.methodName
      );
    } else if (name === MN.markMessageAsRead) {
      const { convId, convType, msgId } = this.state.markMessageAsRead;
      this.tryCatch(
        ChatClient.getInstance().chatManager.markMessageAsRead(
          convId,
          ChatConversationTypeFromNumber(convType),
          msgId
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.markMessageAsRead)!.methodName
      );
    } else if (name === MN.markAllMessagesAsRead) {
      const { convId, convType } = this.state.markAllMessagesAsRead;
      this.tryCatch(
        ChatClient.getInstance().chatManager.markAllMessagesAsRead(
          convId,
          ChatConversationTypeFromNumber(convType)
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.markAllMessagesAsRead)!.methodName
      );
    } else if (name === MN.insertMessage) {
      const { convId, convType, msg } = this.state.insertMessage;
      this.tryCatch(
        ChatClient.getInstance().chatManager.insertMessage(
          convId,
          ChatConversationTypeFromNumber(convType),
          msg
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.insertMessage)!.methodName
      );
    } else if (name === MN.appendMessage) {
      const { convId, convType, msg } = this.state.appendMessage;
      this.tryCatch(
        ChatClient.getInstance().chatManager.appendMessage(
          convId,
          ChatConversationTypeFromNumber(convType),
          msg
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.appendMessage)!.methodName
      );
    } else if (name === MN.updateConversationMessage) {
      const { convId, convType, msg } = this.state.updateConversationMessage;
      this.tryCatch(
        ChatClient.getInstance().chatManager.updateConversationMessage(
          convId,
          ChatConversationTypeFromNumber(convType),
          msg
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.updateConversationMessage)!.methodName
      );
    } else if (name === MN.deleteMessage) {
      const { convId, convType, msgId } = this.state.deleteMessage;
      this.tryCatch(
        ChatClient.getInstance().chatManager.deleteMessage(
          convId,
          ChatConversationTypeFromNumber(convType),
          msgId
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.deleteMessage)!.methodName
      );
    } else if (name === MN.deleteAllMessages) {
      const { convId, convType } = this.state.deleteAllMessages;
      this.tryCatch(
        ChatClient.getInstance().chatManager.deleteAllMessages(
          convId,
          ChatConversationTypeFromNumber(convType)
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.deleteAllMessages)!.methodName
      );
    } else if (name === MN.getMessageById) {
      const { convId, convType, msgId } = this.state.getMessageById;
      this.tryCatch(
        ChatClient.getInstance().chatManager.getMessageById(
          convId,
          ChatConversationTypeFromNumber(convType),
          msgId
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getMessageById)!.methodName
      );
    } else if (name === MN.getMessagesWithMsgType) {
      const { convId, convType, msgType, direction, timestamp, count, sender } =
        this.state.getMessagesWithMsgType;
      this.tryCatch(
        ChatClient.getInstance().chatManager.getMessagesWithMsgType(
          convId,
          ChatConversationTypeFromNumber(convType),
          ChatMessageTypeFromString(msgType),
          direction,
          timestamp,
          count,
          sender
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getMessagesWithMsgType)!.methodName
      );
    } else if (name === MN.getMessages) {
      const { convId, convType, startMsgId, direction, loadCount } =
        this.state.getMessages;
      this.tryCatch(
        ChatClient.getInstance().chatManager.getMessages(
          convId,
          ChatConversationTypeFromNumber(convType),
          startMsgId,
          direction,
          loadCount
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getMessages)!.methodName
      );
    } else if (name === MN.getMessagesWithKeyword) {
      const {
        convId,
        convType,
        keywords,
        direction,
        timestamp,
        count,
        sender,
      } = this.state.getMessagesWithKeyword;
      this.tryCatch(
        ChatClient.getInstance().chatManager.getMessagesWithKeyword(
          convId,
          ChatConversationTypeFromNumber(convType),
          keywords,
          direction,
          timestamp,
          count,
          sender
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getMessagesWithKeyword)!.methodName
      );
    } else if (name === MN.getMessagesFromTime) {
      const { convId, convType, startTime, endTime, direction, count } =
        this.state.getMessagesFromTime;
      this.tryCatch(
        ChatClient.getInstance().chatManager.getMessagesFromTime(
          convId,
          ChatConversationTypeFromNumber(convType),
          startTime,
          endTime,
          direction,
          count
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData.get(MN.getMessagesFromTime)!.methodName
      );
    }
  }
}
