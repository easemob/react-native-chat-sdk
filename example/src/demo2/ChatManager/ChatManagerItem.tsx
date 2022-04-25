import React, { ReactNode } from 'react';
import { View } from 'react-native';
import {
  ChatClient,
  ChatError,
  ChatGroupMessageAck,
  ChatManagerListener,
  ChatMessage,
  ChatMessageStatus,
  ChatMessageStatusCallback,
  ChatMessageType,
  ChatMessageChatType,
  ChatDownloadStatus,
} from 'react-native-chat-sdk';
import { styleValues } from '../__internal__/Css';
import {
  LeafScreenBase,
  StateBase,
  StatelessBase,
} from '../__internal__/LeafScreenBase';
import { metaData, MN, stateData, statelessData } from './ChatManagerData';
import type { ApiParams } from '../__internal__/DataTypes';

export interface StateChatMessage extends StateBase {
  login: {
    userName: string;
    pwdOrToken: string;
    isPassword: boolean;
  };
  loginWithAgoraToken: {
    userName: string;
    agoraToken: string;
  };
  sendMessage: {
    targetId: string;
    targetType: ChatMessageChatType;
    content?: Object; // multi use
    messageType: ChatMessageType;
    messageResult?: string;
  };
  sendGroupMessageReadAck: {
    msgId: string;
    groupId: string;
    opt?: { content: string };
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
  metaData: ApiParams[];
  statelessData: StatelessChatMessage;
  constructor(props: { navigation: any }) {
    super(props);
    this.metaData = metaData;
    this.state = stateData;
    this.statelessData = statelessData;
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
  private createTextMessageDefault(
    targetId: string,
    targetType: ChatMessageChatType,
    content: string
  ): ChatMessage {
    const ret = ChatMessage.createTextMessage(targetId, content, targetType);
    console.log('createTextMessageDefault: ', ret);
    return ret;
  }
  protected addListener?(): void {
    let msgListener = new (class implements ChatManagerListener {
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
        this.that.statelessData.sendMessage.lastMessage =
          messages.length > 0 ? messages[messages.length - 1] : undefined;
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
        this.that.statelessData.sendMessage.lastMessage =
          messages.length > 0 ? messages[messages.length - 1] : undefined;
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

    ChatClient.getInstance().chatManager.removeAllListener();
    ChatClient.getInstance().chatManager.addListener(msgListener);
  }

  protected removeListener?(): void {
    ChatClient.getInstance().chatManager.removeAllListener();
  }

  protected renderResult(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderSendResult()}
        {this.renderRecvResult()}
      </View>
    );
  }
  /**
   * Too many components, poor performance.
   * @returns ReactNode
   */
  protected renderBody(): ReactNode {
    console.log(`${ChatManagerLeafScreen.TAG}: renderBody: `);
    return (
      <View style={styleValues.containerColumn}>
        {this.login()}
        {this.loginWithAgoraToken()}
        {this.sendMessage(false)}
        {this.resendMessage(false)}
        {this.sendMessageReadAck()}

        {this.addSpaces()}
      </View>
    );
  }

  private createCallback(): ChatMessageStatusCallback {
    const ret = new (class implements ChatMessageStatusCallback {
      that: ChatManagerLeafScreen;
      constructor(t: ChatManagerLeafScreen) {
        this.that = t;
      }
      onProgress(localMsgId: string, progress: number): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onProgress: `,
          localMsgId,
          progress
        );
      }
      onError(localMsgId: string, error: ChatError): void {
        console.log(
          `${ChatManagerLeafScreen.TAG}: onError: `,
          localMsgId,
          error
        );
        const msg = this.that.statelessData.sendMessage.message;
        if (msg?.localMsgId === localMsgId) {
          // msg.status = ChatMessageStatus.FAIL;
        }
      }
      onSuccess(message: ChatMessage): void {
        console.log(`${ChatManagerLeafScreen.TAG}: onSuccess: `, message);
        const msg = this.that.statelessData.sendMessage.message;
        if (msg?.localMsgId === message.localMsgId) {
          msg.status = ChatMessageStatus.SUCCESS;
          msg.body = message.body;
        }
      }
    })(this);
    return ret;
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
    this.statelessData.sendMessage.message = msg;

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
    this.statelessData.sendMessage.message = msg;

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
    this.statelessData.sendMessage.message = msg;

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
    this.statelessData.sendMessage.message = msg;

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
    this.statelessData.sendMessage.message = msg;

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
    this.statelessData.sendMessage.message = msg;

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
    this.statelessData.sendMessage.message = msg;

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
    this.statelessData.sendMessage.message = msg;

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
    const data = isResend ? this.metaData[3] : this.metaData[2];
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
  protected resendMessage(isNewMessage: boolean): ReactNode[] {
    const data = this.metaData[3];
    const { message } = this.statelessData.sendMessage;
    const msg = isNewMessage
      ? message === undefined
        ? this.createTextMessageDefault(
            'asteriskhx1',
            ChatMessageChatType.PeerChat,
            Date.now().toString()
          )
        : message
      : message;
    return [
      this.renderParamWithText(data.methodName),
      this.renderParamWithInput(
        data.params[0].paramName,
        JSON.stringify(msg),
        (text: string) => {
          this.statelessData.sendMessage.message = JSON.parse(text);
        }
      ),
      this.renderButton(data.methodName),
      this.renderDivider(),
    ];
  }
  protected sendMessageReadAck(): ReactNode[] {
    const data = this.metaData[4];
    const { lastMessage } = this.statelessData.sendMessage;
    return [
      this.renderParamWithText(data.methodName),
      this.renderParamWithInput(
        data.params[0].paramName,
        JSON.stringify(lastMessage),
        (text: string) => {
          this.statelessData.sendMessage.lastMessage = JSON.parse(text);
        }
      ),
      this.renderButton(data.methodName),
      this.renderDivider(),
    ];
  }
  protected login(): ReactNode[] {
    const data = this.metaData;
    const {
      login: { userName, pwdOrToken, isPassword },
    } = this.state;
    return [
      this.renderParamWithText(data[0].methodName),
      this.renderParamWithInput(
        data[0].params[0].paramName,
        userName,
        (text: string) => {
          this.setState({ login: { userName: text, pwdOrToken, isPassword } });
        }
      ),
      this.renderParamWithInput(
        data[0].params[1].paramName,
        pwdOrToken,
        (text: string) => {
          this.setState({ login: { userName, pwdOrToken: text, isPassword } });
        }
      ),
      this.renderParamWithEnum(
        data[0].params[2].paramName,
        ['true', 'false'],
        isPassword ? 'true' : 'false',
        (index: string, option: any) => {
          this.setState({
            login: {
              userName,
              pwdOrToken,
              isPassword: option === 'true' ? true : false,
            },
          });
        }
      ),
      this.renderButton(data[0].methodName, () => {
        this.callApi(data[0].methodName);
      }),
      this.renderDivider(),
    ];
  }
  protected loginWithAgoraToken(): ReactNode[] {
    const data = this.metaData;
    const {
      loginWithAgoraToken: { userName, agoraToken },
    } = this.state;
    return [
      this.renderParamWithText(data[1].methodName),
      this.renderParamWithInput(
        data[1].params[0].paramName,
        userName,
        (text: string) => {
          this.setState({
            loginWithAgoraToken: { userName: text, agoraToken },
          });
        }
      ),
      this.renderParamWithInput(
        data[1].params[1].paramName,
        agoraToken,
        (text: string) => {
          this.setState({
            loginWithAgoraToken: { userName, agoraToken: text },
          });
        }
      ),
      this.renderButton(data[1].methodName, () => {
        this.callApi(data[1].methodName);
      }),
      this.renderDivider(),
    ];
  }
  private callApi(name: string): void {
    console.log(`${ChatManagerLeafScreen.TAG}: callApi: `);
    if (name === MN.login) {
      this.tryCatch(
        ChatClient.getInstance().login(
          this.state.login.userName,
          this.state.login.pwdOrToken,
          this.state.login.isPassword
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData[0].methodName
      );
    } else if (name === MN.loginWithAgoraToken) {
      this.tryCatch(
        ChatClient.getInstance().loginWithAgoraToken(
          this.state.loginWithAgoraToken.userName,
          this.state.loginWithAgoraToken.agoraToken
        ),
        ChatManagerLeafScreen.TAG,
        this.metaData[1].methodName
      );
    } else if (name === MN.sendMessage) {
      const { message } = this.statelessData.sendMessage;
      if (message) {
        this.tryCatch(
          ChatClient.getInstance().chatManager.sendMessage(
            message,
            this.createCallback()
          ),
          ChatManagerLeafScreen.TAG,
          this.metaData[2].methodName,
          (_value: any) => {
            this.statelessData.sendMessage.lastMessage = message;
          }
        );
      }
    } else if (name === MN.resendMessage) {
      const { message } = this.statelessData.sendMessage;
      if (message) {
        this.tryCatch(
          ChatClient.getInstance().chatManager.resendMessage(
            message,
            this.createCallback()
          ),
          ChatManagerLeafScreen.TAG,
          this.metaData[3].methodName
        );
      }
    } else if (name === MN.sendMessageReadAck) {
      const { lastMessage } = this.statelessData.sendMessage;
      if (lastMessage) {
        this.tryCatch(
          ChatClient.getInstance().chatManager.sendMessageReadAck(lastMessage),
          ChatManagerLeafScreen.TAG,
          this.metaData[4].methodName
        );
      }
    }
  }
}
