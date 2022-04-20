import React, { Component, ReactNode } from 'react';
import { Button, Platform, Text, TextInput, View } from 'react-native';
import { styleValues } from '../Utils';
import ModalDropdown from 'react-native-modal-dropdown';
import type ImagePicker from 'react-native-image-picker';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {
  ChatClient,
  ChatError,
  ChatGroupMessageAck,
  ChatManagerListener,
  ChatMessage,
  ChatMessageBodyType,
  ChatMessageChatType,
  ChatMessageStatusCallback,
} from 'react-native-chat-sdk';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import RNFS from 'react-native-fs';

interface State {
  messageType: ChatMessageBodyType;

  targetId: string;
  chatType: ChatMessageChatType;

  // text messge body
  content: string;

  // file message body
  filePath: string;
  displayName: string;
  width: number;
  height: number;
  fileSize: number;
  duration: number;
  thumbnailLocalPath: string;

  // localtion message body
  latitude: string;
  longitude: string;
  address: string;

  // cmd message body
  action: string;

  // custom message body
  event: string;
  ext: string;

  // result
  messageResult: string;
  listenerResult: string;
}

export class SendMessageScreen extends Component<
  { navigation: any },
  State,
  any
> {
  private static TAG = 'SendMessageScreen';
  private static messageType = [
    ChatMessageBodyType.TXT,
    ChatMessageBodyType.IMAGE,
    ChatMessageBodyType.CMD,
    ChatMessageBodyType.CUSTOM,
    ChatMessageBodyType.FILE,
    ChatMessageBodyType.LOCATION,
    ChatMessageBodyType.VIDEO,
    ChatMessageBodyType.VOICE,
  ];
  private static messageChatType = [
    'ChatMessageChatType.PeerChat',
    'ChatMessageChatType.GroupChat',
    'ChatMessageChatType.ChatRoom',
  ];
  public static route = 'SendMessageScreen';
  navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
    this.state = {
      messageType: ChatMessageBodyType.TXT,
      targetId: 'asteriskhx2',
      chatType: ChatMessageChatType.PeerChat,
      messageResult: '',
      listenerResult: '',
      content: '',
      filePath: '',
      displayName: '',
      thumbnailLocalPath: '',
      width: 0,
      height: 0,
      fileSize: 0,
      duration: 0.0,
      latitude: '0.0',
      longitude: '0.0',
      address: 'beijing',
      action: 'action',
      event: 'event',
      ext: '{ "key": "value" }',
    };
  }

  componentDidMount?(): void {
    console.log(`${SendMessageScreen.TAG}: componentDidMount: `);
    let msgListener = new (class implements ChatManagerListener {
      that: SendMessageScreen;
      constructor(parent: any) {
        this.that = parent as SendMessageScreen;
      }
      onMessagesReceived(messages: ChatMessage[]): void {
        console.log(`${SendMessageScreen.TAG}: onMessagesReceived: `, messages);
        this.that.setState({
          listenerResult: `onMessagesReceived: ${messages.length}`,
        });
      }
      onCmdMessagesReceived(messages: ChatMessage[]): void {
        console.log(
          `${SendMessageScreen.TAG}: onCmdMessagesReceived: `,
          messages
        );
        this.that.setState({
          listenerResult: `onCmdMessagesReceived: ${messages.length}`,
        });
      }
      onMessagesRead(messages: ChatMessage[]): void {
        console.log(`${SendMessageScreen.TAG}: onMessagesRead: `, messages);
        this.that.setState({
          listenerResult: `onMessagesRead: ${messages.length}`,
        });
      }
      onGroupMessageRead(groupMessageAcks: ChatGroupMessageAck[]): void {
        console.log(
          `${SendMessageScreen.TAG}: onGroupMessageRead: `,
          groupMessageAcks
        );
        this.that.setState({
          listenerResult: `onGroupMessageRead: ${groupMessageAcks.length}`,
        });
      }
      onMessagesDelivered(messages: ChatMessage[]): void {
        console.log(
          `${SendMessageScreen.TAG}: onMessagesDelivered: `,
          messages
        );
        this.that.setState({
          listenerResult: `onMessagesDelivered: ${messages.length}`,
        });
      }
      onMessagesRecalled(messages: ChatMessage[]): void {
        console.log(`${SendMessageScreen.TAG}: onMessagesRecalled: `, messages);
        this.that.setState({
          listenerResult: `onMessagesRecalled: ${messages.length}`,
        });
      }
      onConversationsUpdate(): void {
        console.log(`${SendMessageScreen.TAG}: onConversationsUpdate: `);
        this.that.setState({ listenerResult: 'onConversationsUpdate' });
      }
      onConversationRead(from: string, to?: string): void {
        console.log(`${SendMessageScreen.TAG}: onConversationRead: `, from, to);
        this.that.setState({
          listenerResult: `onConversationRead: ${from}, ${to}`,
        });
      }
    })(this);

    ChatClient.getInstance().chatManager.removeAllListener();
    ChatClient.getInstance().chatManager.addListener(msgListener);
  }

  componentWillUnmount?(): void {
    console.log(`${SendMessageScreen.TAG}: componentWillUnmount: `);
  }

  private sendMessage(): void {
    console.log(`${SendMessageScreen.TAG}: sendMessage: `);
    const { messageType, targetId, chatType } = this.state;
    let msg: ChatMessage;
    if (messageType === ChatMessageBodyType.TXT) {
      const { content } = this.state;
      msg = ChatMessage.createTextMessage(targetId, content, chatType);
    } else if (messageType === ChatMessageBodyType.IMAGE) {
      const { filePath, width, height, displayName } = this.state;
      msg = ChatMessage.createImageMessage(targetId, filePath, chatType, {
        displayName,
        width,
        height,
      });
    } else if (messageType === ChatMessageBodyType.CMD) {
      const { action } = this.state;
      msg = ChatMessage.createCmdMessage(targetId, action, chatType);
    } else if (messageType === ChatMessageBodyType.CUSTOM) {
      const { event, ext } = this.state;
      console.log(ext);
      msg = ChatMessage.createCustomMessage(targetId, event, chatType, {
        params: JSON.parse(ext),
      });
    } else if (messageType === ChatMessageBodyType.FILE) {
      const { filePath, displayName } = this.state;
      msg = ChatMessage.createFileMessage(targetId, filePath, chatType, {
        displayName,
      });
    } else if (messageType === ChatMessageBodyType.LOCATION) {
      const { latitude, longitude, address } = this.state;
      msg = ChatMessage.createLocationMessage(
        targetId,
        latitude,
        longitude,
        chatType,
        { address }
      );
    } else if (messageType === ChatMessageBodyType.VIDEO) {
      const {
        filePath,
        width,
        height,
        displayName,
        thumbnailLocalPath,
        duration,
      } = this.state;
      msg = ChatMessage.createVideoMessage(targetId, filePath, chatType, {
        displayName,
        thumbnailLocalPath,
        duration,
        width,
        height,
      });
    } else if (messageType === ChatMessageBodyType.VOICE) {
      const { filePath, displayName, duration } = this.state;
      msg = ChatMessage.createVoiceMessage(targetId, filePath, chatType, {
        displayName,
        duration,
      });
    } else {
      throw new Error('Not implemented.');
    }
    const s = new (class implements ChatMessageStatusCallback {
      that: SendMessageScreen;
      constructor(t: SendMessageScreen) {
        this.that = t;
      }
      onProgress(localMsgId: string, progress: number): void {
        console.log(
          `${SendMessageScreen.TAG}: sendMessage: onProgress: `,
          localMsgId,
          progress
        );
        this.that.setState({
          messageResult: `onProgress: ${localMsgId}, ${progress}`,
        });
      }
      onError(localMsgId: string, error: ChatError): void {
        console.log(
          `${SendMessageScreen.TAG}: sendMessage: onError: `,
          localMsgId,
          error
        );
        this.that.setState({
          messageResult: `onError: ${localMsgId}, ${error.code} ${error.description}`,
        });
      }
      onSuccess(message: ChatMessage): void {
        console.log(
          `${SendMessageScreen.TAG}: sendMessage: onSuccess: `,
          message
        );
        this.that.setState({
          messageResult: `onSuccess: ${message.localMsgId}`,
        });
      }
    })(this);
    ChatClient.getInstance()
      .chatManager.sendMessage(msg!, s)
      .then(() => {
        console.log(`${SendMessageScreen.TAG}: sendMessage: success`);
      })
      .catch((reason: any) => {
        console.log(`${SendMessageScreen.TAG}: sendMessage: `, reason);
      });
  }

  private renderMessage(messageType: ChatMessageBodyType): ReactNode {
    let ret: ReactNode;
    switch (messageType) {
      case ChatMessageBodyType.TXT:
        ret = this.renderTextMessage();
        break;
      case ChatMessageBodyType.IMAGE:
        ret = this.renderImageMessage();
        break;
      case ChatMessageBodyType.CMD:
        ret = this.renderCmdMessage();
        break;
      case ChatMessageBodyType.CUSTOM:
        ret = this.renderCustomMessage();
        break;
      case ChatMessageBodyType.FILE:
        ret = this.renderFileMessage();
        break;
      case ChatMessageBodyType.LOCATION:
        ret = this.renderLocationMessage();
        break;
      case ChatMessageBodyType.VIDEO:
        ret = this.renderVideoMessage();
        break;
      case ChatMessageBodyType.VOICE:
        ret = this.renderVoiceMessage();
        break;
      default:
        ret = <View />;
        break;
    }
    return ret;
  }

  private renderTextMessage(): ReactNode {
    const { targetId, content } = this.state;
    return [
      <View style={styleValues.containerRow} key="targetId">
        <Text style={styleValues.textStyle}>TargetId: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ targetId: text });
          }}
        >
          {targetId}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="content">
        <Text style={styleValues.textStyle}>Content: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ content: text });
          }}
        >
          {content}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="sendMessage">
        <Button
          title="sendMessage"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            this.sendMessage();
          }}
        >
          sendMessage
        </Button>
      </View>,
    ];
  }

  private renderImageMessage(): ReactNode {
    const { targetId, filePath, displayName } = this.state;
    return [
      <View style={styleValues.containerRow} key="targetId">
        <Text style={styleValues.textStyle}>TargetId: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ targetId: text });
          }}
        >
          {targetId}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="filePath">
        <Text style={styleValues.textStyle}>FilePath: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ filePath: text });
          }}
        >
          {filePath}
        </TextInput>
        <Button
          title="selectImage"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            const f = (
              type: string,
              options:
                | ImagePicker.CameraOptions
                | ImagePicker.ImageLibraryOptions
            ) => {
              if (type === 'capture') {
                launchCamera(options, (response: ImagePickerResponse) => {
                  console.log(`${SendMessageScreen.TAG}: `, response);
                  if (
                    response.didCancel ||
                    response.errorCode ||
                    response.errorMessage
                  ) {
                    console.log('cancel');
                  } else {
                    if (response.assets && response.assets?.length > 0) {
                      this.setState({
                        filePath: response.assets[0].uri!,
                        width: response.assets[0].width!,
                        height: response.assets[0].height!,
                        displayName: response.assets[0].fileName!,
                        fileSize: response.assets[0].fileSize!,
                      });
                    }
                  }
                });
              } else {
                launchImageLibrary(options, (response: ImagePickerResponse) => {
                  console.log(`${SendMessageScreen.TAG}: `, response);
                  if (
                    response.didCancel ||
                    response.errorCode ||
                    response.errorMessage
                  ) {
                    console.log('cancel');
                  } else {
                    if (response.assets && response.assets?.length > 0) {
                      let s = response.assets[0].uri!;
                      if (s.startsWith('file://')) {
                        s = s.substring('file://'.length);
                      }
                      this.setState({
                        // filePath: response.assets[0].uri!,
                        filePath: s,
                        width: response.assets[0].width!,
                        height: response.assets[0].height!,
                        displayName: response.assets[0].fileName!,
                        fileSize: response.assets[0].fileSize!,
                      });
                    }
                  }
                });
              }
            };
            let title = actions[1].title;
            let type = actions[1].type;
            let options = actions[1].options;
            console.log(`${SendMessageScreen.TAG}: `, title, type, options);
            f(type, options);
          }}
        >
          select
        </Button>
      </View>,
      <View style={styleValues.containerRow} key="displayName">
        <Text style={styleValues.textStyle}>DisplayName: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ displayName: text });
          }}
        >
          {displayName}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="sendMessage">
        <Button
          title="sendMessage"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            this.sendMessage();
          }}
        >
          sendMessage
        </Button>
      </View>,
    ];
  }

  private renderVideoMessage(): ReactNode {
    const { targetId, filePath, displayName, thumbnailLocalPath } = this.state;
    return [
      <View style={styleValues.containerRow} key="targetId">
        <Text style={styleValues.textStyle}>TargetId: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ targetId: text });
          }}
        >
          {targetId}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="filePath">
        <Text style={styleValues.textStyle}>FilePath: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ filePath: text });
          }}
        >
          {filePath}
        </TextInput>
        <Button
          title="selectVideo"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            let title = actions[3].title;
            let type = actions[3].type;
            let options = actions[3].options;
            console.log(`${SendMessageScreen.TAG}: `, title, type, options);
            launchImageLibrary(options, (response: ImagePickerResponse) => {
              console.log(`${SendMessageScreen.TAG}: `, response);
              if (
                response.didCancel ||
                response.errorCode ||
                response.errorMessage
              ) {
                console.log('cancel');
              } else {
                if (response.assets && response.assets?.length > 0) {
                  let s = response.assets[0].uri!;
                  if (s.startsWith('file://')) {
                    s = s.substring('file://'.length);
                  }
                  this.setState({
                    // filePath: response.assets[0].uri!,
                    filePath: s,
                    width: response.assets[0].width!,
                    height: response.assets[0].height!,
                    displayName: response.assets[0].fileName!,
                    fileSize: response.assets[0].fileSize!,
                    duration: response.assets[0].duration!,
                    thumbnailLocalPath: '',
                  });
                }
              }
            });
          }}
        >
          select
        </Button>
      </View>,
      <View style={styleValues.containerRow} key="thumbImage">
        <Text style={styleValues.textStyle}>ThumbImage: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ thumbnailLocalPath: text });
          }}
        >
          {thumbnailLocalPath}
        </TextInput>
        <Button
          title="selectVideoThumb"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            let title = actions[1].title;
            let type = actions[1].type;
            let options = actions[1].options;
            console.log(`${SendMessageScreen.TAG}: `, title, type, options);
            launchImageLibrary(options, (response: ImagePickerResponse) => {
              console.log(`${SendMessageScreen.TAG}: `, response);
              if (
                response.didCancel ||
                response.errorCode ||
                response.errorMessage
              ) {
                console.log('cancel');
              } else {
                if (response.assets && response.assets?.length > 0) {
                  let s = response.assets[0].uri!;
                  if (s.startsWith('file://')) {
                    s = s.substring('file://'.length);
                  }
                  this.setState({
                    thumbnailLocalPath: s,
                  });
                }
              }
            });
          }}
        >
          select
        </Button>
      </View>,
      <View style={styleValues.containerRow} key="displayName">
        <Text style={styleValues.textStyle}>DisplayName: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ displayName: text });
          }}
        >
          {displayName}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="sendMessage">
        <Button
          title="sendMessage"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            this.sendMessage();
          }}
        >
          sendMessage
        </Button>
      </View>,
    ];
  }

  renderVoiceMessage(): React.ReactNode {
    const { targetId, filePath, displayName, duration } = this.state;
    return [
      <View style={styleValues.containerRow} key="targetId">
        <Text style={styleValues.textStyle}>TargetId: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ targetId: text });
          }}
        >
          {targetId}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="filePath">
        <Text style={styleValues.textStyle}>FilePath: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ filePath: text });
          }}
        >
          {filePath}
        </TextInput>
        <Button
          title="selectVoice"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            DocumentPicker.pick({ type: [DocumentPicker.types.audio] })
              .then((values: DocumentPickerResponse[]) => {
                // todo: 需要优化
                // console.log(values);
                // console.log(RNFS.ExternalStorageDirectoryPath);
                // console.log(decodeURI(values[0].uri));
                if (values.length < 1) {
                  return;
                }
                if (Platform.OS === 'ios') {
                  let s = values[0].uri;
                  if (s.startsWith('file://')) {
                    s = s.substring('file://'.length);
                  }
                  this.setState({
                    filePath: s,
                    displayName: values[0].name,
                    duration: 20,
                  });
                } else {
                  // todo: content:// 太麻烦
                  let s =
                    RNFS.ExternalStorageDirectoryPath +
                    '/Recorder/' +
                    values[0].name;
                  this.setState({
                    filePath: s,
                    displayName: values[0].name,
                    duration: 20,
                  });
                }
              })
              .catch((reason: any) => {
                console.log(reason);
              });
          }}
        >
          select
        </Button>
      </View>,
      <View style={styleValues.containerRow} key="duration">
        <Text style={styleValues.textStyle}>Duration: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ duration: parseInt(text, 10) });
          }}
        >
          {duration}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="displayName">
        <Text style={styleValues.textStyle}>DisplayName: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ displayName: text });
          }}
        >
          {displayName}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="sendMessage">
        <Button
          title="sendMessage"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            this.sendMessage();
          }}
        >
          sendMessage
        </Button>
      </View>,
    ];
  }
  renderLocationMessage(): React.ReactNode {
    const { targetId, latitude, longitude, address } = this.state;
    return [
      <View style={styleValues.containerRow} key="targetId">
        <Text style={styleValues.textStyle}>TargetId: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ targetId: text });
          }}
        >
          {targetId}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="latitude">
        <Text style={styleValues.textStyle}>Latitude: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ latitude: text });
          }}
        >
          {latitude}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="longitude">
        <Text style={styleValues.textStyle}>Longitude: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ longitude: text });
          }}
        >
          {longitude}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="address">
        <Text style={styleValues.textStyle}>Address: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ address: text });
          }}
        >
          {address}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="sendMessage">
        <Button
          title="sendMessage"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            this.sendMessage();
          }}
        >
          sendMessage
        </Button>
      </View>,
    ];
  }
  renderFileMessage(): React.ReactNode {
    const { targetId, filePath, displayName } = this.state;
    return [
      <View style={styleValues.containerRow} key="targetId">
        <Text style={styleValues.textStyle}>TargetId: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ targetId: text });
          }}
        >
          {targetId}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="filePath">
        <Text style={styleValues.textStyle}>FilePath: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ filePath: text });
          }}
        >
          {filePath}
        </TextInput>
        <Button
          title="selectFile"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            DocumentPicker.pick({ type: [DocumentPicker.types.allFiles] })
              .then((values: DocumentPickerResponse[]) => {
                // todo: 需要优化
                // console.log(values);
                // console.log(RNFS.ExternalStorageDirectoryPath);
                // console.log(decodeURI(values[0].uri));
                if (values.length < 1) {
                  return;
                }
                if (Platform.OS === 'ios') {
                  let s = values[0].uri;
                  if (s.startsWith('file://')) {
                    s = s.substring('file://'.length);
                  }
                  this.setState({
                    filePath: s,
                    displayName: values[0].name,
                  });
                } else {
                  // todo: content:// 太麻烦
                  let s =
                    RNFS.ExternalStorageDirectoryPath +
                    '/Recorder/' +
                    values[0].name;
                  this.setState({
                    filePath: s,
                    displayName: values[0].name,
                  });
                }
              })
              .catch((reason: any) => {
                console.log(reason);
              });
          }}
        >
          select
        </Button>
      </View>,
      <View style={styleValues.containerRow} key="displayName">
        <Text style={styleValues.textStyle}>DisplayName: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ displayName: text });
          }}
        >
          {displayName}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="sendMessage">
        <Button
          title="sendMessage"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            this.sendMessage();
          }}
        >
          sendMessage
        </Button>
      </View>,
    ];
  }
  renderCustomMessage(): React.ReactNode {
    const { targetId, event, ext } = this.state;
    return [
      <View style={styleValues.containerRow} key="targetId">
        <Text style={styleValues.textStyle}>TargetId: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ targetId: text });
          }}
        >
          {targetId}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="event">
        <Text style={styleValues.textStyle}>Event: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ event: text });
          }}
        >
          {event}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="ext">
        <Text style={styleValues.textStyle}>Ext: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ ext: text });
          }}
        >
          {ext}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="sendMessage">
        <Button
          title="sendMessage"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            this.sendMessage();
          }}
        >
          sendMessage
        </Button>
      </View>,
    ];
  }
  renderCmdMessage(): React.ReactNode {
    const { targetId, action } = this.state;
    return [
      <View style={styleValues.containerRow} key="targetId">
        <Text style={styleValues.textStyle}>TargetId: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ targetId: text });
          }}
        >
          {targetId}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="action">
        <Text style={styleValues.textStyle}>Action: </Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            // console.log(`${SendMessageScreen.TAG}: `, text);
            this.setState({ action: text });
          }}
        >
          {action}
        </TextInput>
      </View>,
      <View style={styleValues.containerRow} key="sendMessage">
        <Button
          title="sendMessage"
          onPress={() => {
            // console.log(`${SendMessageScreen.TAG}`);
            this.sendMessage();
          }}
        >
          sendMessage
        </Button>
      </View>,
    ];
  }

  render(): ReactNode {
    const { messageType, messageResult, listenerResult } = this.state;
    return (
      <View style={styleValues.containerColumn}>
        <View style={styleValues.containerRow}>
          <Text style={styleValues.textStyle}>Message type: </Text>
          <ModalDropdown
            style={styleValues.dropDownStyle}
            defaultValue={ChatMessageBodyType.TXT}
            options={SendMessageScreen.messageType}
            onSelect={(index: string, option: any) => {
              console.log(`${SendMessageScreen.TAG}: `, index, option);
              this.setState({ messageType: option });
            }}
          />
        </View>
        <View style={styleValues.containerRow} key="targetType">
          <Text style={styleValues.textStyle}>Target type: </Text>
          <ModalDropdown
            style={styleValues.dropDownStyle}
            defaultValue={'ChatMessageChatType.PeerChat'}
            options={SendMessageScreen.messageChatType}
            onSelect={(index: string, option: any) => {
              console.log(`${SendMessageScreen.TAG}: `, index, option);
              let r = ChatMessageChatType.PeerChat;
              if (option === 'ChatMessageChatType.PeerChat') {
                r = ChatMessageChatType.PeerChat;
              } else if (option === 'ChatMessageChatType.GroupChat') {
                r = ChatMessageChatType.GroupChat;
              } else {
                r = ChatMessageChatType.ChatRoom;
              }
              this.setState({ chatType: r });
            }}
          />
        </View>

        {this.renderMessage(messageType)}

        <View style={styleValues.containerRow}>
          <Text style={styleValues.textTipStyle}>
            Send result: {messageResult}
          </Text>
        </View>
        <View style={styleValues.containerRow}>
          <Text style={styleValues.textTipStyle}>
            Listener result: {listenerResult}
          </Text>
        </View>
      </View>
    );
  }
}

interface Action {
  title: string;
  type: 'capture' | 'library';
  options: ImagePicker.CameraOptions | ImagePicker.ImageLibraryOptions;
}

const includeExtra = true;

const actions: Action[] = [
  {
    title: 'Take Image',
    type: 'capture',
    options: {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false,
      includeExtra,
    },
  },
  {
    title: 'Select Image',
    type: 'library',
    options: {
      maxHeight: 200,
      maxWidth: 200,
      selectionLimit: 0,
      mediaType: 'photo',
      includeBase64: false,
      includeExtra,
    },
  },
  {
    title: 'Take Video',
    type: 'capture',
    options: {
      saveToPhotos: true,
      mediaType: 'video',
      includeExtra,
    },
  },
  {
    title: 'Select Video',
    type: 'library',
    options: {
      selectionLimit: 0,
      mediaType: 'video',
      includeExtra,
    },
  },
  {
    title: `Select Image or Video\n(mixed)`,
    type: 'library',
    options: {
      selectionLimit: 0,
      mediaType: 'mixed',
      includeExtra,
    },
  },
];
