import React, { ReactNode } from 'react';
import {
  Button,
  Dimensions,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { styleValues } from './Css';
import { seq } from './Utils';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import type { MediaType } from './Types';
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import type ImagePicker from 'react-native-image-picker';

export interface StateBase {
  sendResult: string;
  recvResult: string;
  exceptResult: string;
}

export interface StatelessBase {}

export abstract class LeafScreenBase<
  S extends StateBase
> extends React.Component<{ navigation: any }, S> {
  public static route = 'LeafScreenBase';
  protected static TAG = 'LeafScreenBase';
  protected navigation: any;
  protected keyPrefix: string;

  constructor(props: { navigation: any; route?: string }) {
    super(props);
    // if (props.route) {
    //   LeafScreenBase.route = props.route;
    //   LeafScreenBase.TAG = LeafScreenBase.route;
    // }
    this.navigation = props.navigation;
    this.keyPrefix = '';
  }

  protected setKeyPrefix(prefix: string): void {
    this.keyPrefix = prefix;
  }

  protected generateKey(type: string, name: string): string {
    return this.keyPrefix + '_' + type + '_' + name;
  }

  protected tryCatch(
    promise: Promise<any>,
    tag: string,
    name: string,
    accept?: (value: any) => void,
    reject?: (reason: any) => void
  ): void {
    promise
      .then(
        (value: any) => {
          let result;
          if (value !== undefined) {
            if (value instanceof Object) {
              if (value instanceof Map) {
                result = value;
              } else {
                result = JSON.stringify(value);
              }
            } else {
              result = value;
            }
          } else {
            result = 'undefined';
          }
          console.log(`${tag}: ${name}: success: `, result);
          this.setState({ sendResult: 'success: ' + result });
          if (accept) {
            accept(result);
          }
        },
        (reason: any) => {
          let result;
          if (reason !== undefined) {
            if (reason instanceof Object) {
              result = JSON.stringify(reason);
            } else {
              result = reason;
            }
          } else {
            result = 'undefined';
          }
          console.log(
            `${tag}: ${name}: onrejected: `,
            result,
            'reason: ',
            reason
          );
          this.setState({ sendResult: 'fail: ' + result });
          if (reject) {
            reject(reason);
          }
        }
      )
      .catch((reason: any) => {
        let result;
        if (reason !== undefined) {
          if (reason instanceof Object) {
            result = JSON.stringify(reason);
          } else {
            result = reason;
          }
        } else {
          result = 'undefined';
        }
        console.log(`${tag}: ${name}: except: `, result);
        this.setState({ exceptResult: 'except: ' + result });
        if (reject) {
          reject(result);
        }
      });
  }

  componentDidMount(): void {
    console.log(`${LeafScreenBase.TAG}: componentDidMount: `);
    this.addListener?.();
  }

  componentWillUnmount(): void {
    console.log(`${LeafScreenBase.TAG}: componentWillUnmount: `);
    this.removeListener?.();
  }

  /**
   *
   * @returns
   *
   * @ref https://github.com/SilenYang/react-native-divider/blob/master/index.js
   * @ref https://github.com/LaoMengFlutter/react-native-divide/blob/master/index.js
   * @ref https://stackoverflow.com/questions/33804500/screen-width-in-react-native
   */
  protected renderDivider(): ReactNode {
    return (
      <View
        key={this.generateKey('', seq().toString())}
        style={styleValues.dividerContainer}
      >
        <View
          style={[
            styleValues.dividerContent,
            { width: Dimensions.get('window').width },
          ]}
        />
      </View>
    );
  }

  protected addSpaces(): ReactNode[] {
    let list = [];
    for (let index = 0; index < 20; index++) {
      list.push(this.renderDivider());
    }
    return list;
  }

  protected renderSendResult(): ReactNode[] {
    const { sendResult } = this.state;
    return [
      <View
        key={this.generateKey('renderSendResult', 'send')}
        style={styleValues.containerRow}
      >
        <Text selectable={true} style={styleValues.textTipStyle}>
          send_result: {sendResult}
        </Text>
      </View>,
    ];
  }

  protected renderRecvResult(): ReactNode[] {
    const { recvResult } = this.state;
    return [
      <View
        key={this.generateKey('renderRecvResult', 'recv')}
        style={styleValues.containerRow}
      >
        <Text selectable={true} style={styleValues.textTipStyle}>
          recv_result: {recvResult}
        </Text>
      </View>,
    ];
  }

  protected renderExceptionResult(): ReactNode[] {
    const { exceptResult } = this.state;
    return [
      <View
        key={this.generateKey('renderExceptionResult', 'exp')}
        style={styleValues.containerRow}
      >
        <Text selectable={true} style={styleValues.textTipStyle}>
          exp_result: {exceptResult}
        </Text>
      </View>,
    ];
  }

  protected renderParamWithText(name: string): ReactNode {
    return (
      <View
        key={this.generateKey('renderParamWithText', name)}
        style={styleValues.containerRow}
      >
        <Text style={styleValues.textTipStyle}>{name}</Text>
      </View>
    );
  }

  protected renderParamWithTextKV(name: string, value: string): ReactNode {
    return (
      <View
        key={this.generateKey('renderParamWithTextKV', name)}
        style={styleValues.containerRow}
      >
        <Text style={styleValues.textTipStyle}>{name}</Text>
        <Text style={styleValues.textTipStyle}>{value}</Text>
      </View>
    );
  }

  protected renderParamWithInput(
    name: string,
    value: string,
    oct?: (text: string) => void,
    multiLine: boolean = true
  ): ReactNode {
    return (
      <View
        key={this.generateKey('renderParamWithInput', name)}
        style={styleValues.containerRow}
      >
        <Text style={styleValues.textTipStyle}>{name}:</Text>
        <TextInput
          style={
            multiLine
              ? styleValues.textInputMultiStyle
              : styleValues.textInputStyle
          }
          multiline={multiLine}
          onChangeText={(text: string) => {
            if (oct) {
              oct(text);
            }
          }}
        >
          {value}
        </TextInput>
      </View>
    );
  }
  protected renderGroupParamWithInput(
    name: string,
    type: string,
    value: string,
    oct?: (inputData: { [index: string]: string }) => void,
    multiLine: boolean = true
  ): ReactNode {
    return (
      <View
        key={this.generateKey('renderGroupParamWithInput', name)}
        style={styleValues.containerRow}
      >
        <Text style={styleValues.textTipStyle}>{name}:</Text>
        <TextInput
          style={
            multiLine
              ? styleValues.textInputMultiStyle
              : styleValues.textInputStyle
          }
          multiline={multiLine}
          onChangeText={(text: string) => {
            if (oct) {
              let obj: { [index: string]: string } = {};
              obj[name] = type === 'json' ? JSON.parse(text) : text;
              oct(obj);
            }
          }}
        >
          {value}
        </TextInput>
      </View>
    );
  }

  protected renderParamWithEnum(
    name: string,
    keys: string[],
    value: string,
    oct?: (index: string, option: any) => void
  ): ReactNode {
    if (keys.length <= 0) {
      throw new Error(`keys is error: ` + keys);
    }
    return (
      <View
        key={this.generateKey('renderParamWithEnum', name)}
        style={styleValues.containerRow}
      >
        <Text style={styleValues.textTipStyle}>{name}:</Text>
        <ModalDropdown
          style={styleValues.dropDownStyle}
          defaultValue={value}
          options={keys}
          onSelect={(index: string, option: any) => {
            if (oct) {
              oct(index, option);
            }
          }}
        />
      </View>
    );
  }

  protected renderGroupParamWithSelectFile(
    name: string,
    value: string,
    oct?: (inputData: { [index: string]: string }) => void
  ): ReactNode {
    return (
      <View
        key={this.generateKey('renderGroupParamWithSelectFile', name)}
        style={styleValues.containerRow}
      >
        <Text style={styleValues.textTipStyle}>{name}:</Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            if (oct) {
              let obj: { [index: string]: string } = {};
              obj[name] = text;
              oct(obj);
            }
          }}
        >
          {value}
        </TextInput>
        <Button
          title="selectFile"
          onPress={() => {
            DocumentPicker.pick({
              type: [DocumentPicker.types.allFiles],
              copyTo: 'cachesDirectory',
            })
              .then((values: DocumentPickerResponse[]) => {
                if (values.length < 1) {
                  return;
                }
                if (Platform.OS === 'ios') {
                  let s = values[0].uri;
                  if (s.startsWith('file://')) {
                    s = s.substring('file://'.length);
                  }
                  if (oct) {
                    let obj: { [index: string]: string } = {};
                    obj[name] = s;
                    oct(obj);
                  }
                } else {
                  let s = values[0].fileCopyUri!;
                  if (s.startsWith('file:')) {
                    s = s.substring('file:'.length);
                  }
                  if (oct) {
                    let obj: { [index: string]: string } = {};
                    obj[name] = s;
                    oct(obj);
                  }
                }
              })
              .catch((reason: any) => {
                if (oct) {
                  let obj: { [index: string]: string } = {};
                  if (reason === undefined) {
                    obj[name] = '';
                  } else {
                    if (reason instanceof Object) {
                      obj[name] = JSON.stringify(reason);
                    } else {
                      obj[name] = reason;
                    }
                  }
                  oct(obj);
                }
              });
          }}
        >
          SF
        </Button>
      </View>
    );
  }

  protected renderParamWithSelectFile(
    name: string,
    value: string,
    oct?: (json: string) => void,
    multiLine: boolean = true
  ): ReactNode {
    return (
      <View
        key={this.generateKey('renderParamWithSelectFile', name)}
        style={styleValues.containerRow}
      >
        <Text style={styleValues.textTipStyle}>{name}:</Text>
        <TextInput
          style={
            multiLine
              ? styleValues.textInputMultiStyle
              : styleValues.textInputStyle
          }
          multiline={multiLine}
          onChangeText={(text: string) => {
            if (oct) {
              oct(text);
            }
          }}
        >
          {value}
        </TextInput>
        <Button
          title="SF"
          onPress={() => {
            DocumentPicker.pick({
              type: [DocumentPicker.types.allFiles],
              copyTo: 'cachesDirectory',
            })
              .then((values: DocumentPickerResponse[]) => {
                if (values.length < 1) {
                  return;
                }
                if (Platform.OS === 'ios') {
                  let s = values[0].uri;
                  if (s.startsWith('file://')) {
                    s = s.substring('file://'.length);
                  }
                  if (oct) {
                    oct(
                      JSON.stringify({
                        localPath: s,
                        name: values[0].name,
                        size: values[0].size,
                        type: values[0].type,
                        uri: values[0].uri,
                      })
                    );
                  }
                } else {
                  let s = values[0].fileCopyUri!;
                  if (s.startsWith('file:')) {
                    s = s.substring('file:'.length);
                  }
                  if (oct) {
                    oct(
                      JSON.stringify({
                        localPath: s,
                        name: values[0].name,
                        size: values[0].size,
                        type: values[0].type,
                        uri: values[0].uri,
                      })
                    );
                  }
                }
              })
              .catch((reason: any) => {
                if (oct) {
                  if (reason === undefined) {
                    oct('null');
                  } else {
                    if (reason instanceof Object) {
                      oct(JSON.stringify(reason));
                    } else {
                      oct(reason);
                    }
                  }
                }
              });
          }}
        >
          SF
        </Button>
      </View>
    );
  }

  protected renderParamWithSelectMediaFile(
    mediaType: MediaType,
    name: string,
    value: string,
    oct?: (json: string) => void
  ): ReactNode {
    return (
      <View
        key={this.generateKey(
          'renderParamWithSelectMediaFile',
          name.concat(mediaType.toString())
        )}
        style={styleValues.containerRow}
      >
        <Text style={styleValues.textTipStyle}>{name}:</Text>
        <TextInput
          style={styleValues.textInputStyle}
          onChangeText={(text: string) => {
            if (oct) {
              oct(text);
            }
          }}
        >
          {value}
        </TextInput>
        <Button
          title="SMF"
          onPress={() => {
            let t: number = 0;
            switch (mediaType) {
              case 'Image':
                t = 1;
                break;
              case 'Video':
                t = 3;
                break;
              case 'Voice':
                throw new Error(`error: ${t}`);
              default:
                throw new Error(`error: ${t}`);
            }
            let options = actions[t].options;
            launchImageLibrary(options, (response: ImagePickerResponse) => {
              if (
                response.didCancel ||
                response.errorCode ||
                response.errorMessage
              ) {
                if (oct) {
                  oct(JSON.stringify(`{ error: 'cancel' }`));
                }
              } else {
                if (response.assets && response.assets?.length > 0) {
                  let s = response.assets[0].uri!;
                  if (s.startsWith('file://')) {
                    s = s.substring('file://'.length);
                  }
                  if (oct) {
                    oct(
                      JSON.stringify(
                        `{
                            localPath: ${s}, 
                            width: ${response.assets[0].width!},
                            height: ${response.assets[0].height!},
                            name: ${response.assets[0].fileName!},
                            size: ${response.assets[0].fileSize!},
                            duration: ${response.assets[0].duration!}
                          }`
                      )
                    );
                  }
                }
              }
            });
          }}
        >
          SMF
        </Button>
      </View>
    );
  }

  protected renderButton(name: string, op?: () => void): ReactNode {
    return (
      <View
        key={this.generateKey('renderButton', name)}
        style={styleValues.containerRow}
      >
        <Button
          title={name}
          onPress={() => {
            if (op) {
              op();
            }
          }}
        >
          {name}
        </Button>
      </View>
    );
  }

  protected renderResult(): ReactNode {
    throw new Error('Please sub class implement.');
  }

  protected renderBody(): ReactNode {
    throw new Error('Please sub class implement.');
  }

  protected addListener?(): void {
    throw new Error('Please sub class implement.');
  }

  protected removeListener?(): void {
    throw new Error('Please sub class implement.');
  }

  /**
   * Subclasses do not need to implement this method.
   * @returns component
   */
  public render(): ReactNode {
    return (
      <View style={styleValues.bottomSpace}>
        <ScrollView style={styleValues.resultDom}>
          {this.renderResult()}
        </ScrollView>
        <ScrollView>{this.renderBody()}</ScrollView>
      </View>
    );
  }

  /**
   * parse api
   */
  protected handleApi(): ReactNode {
    throw new Error('Please sub class implement.');
  }

  protected parseValue(valueType: string, value: any): any {
    if (valueType === 'json') {
      return JSON.stringify(value);
    } else if (valueType === 'object') {
      return 'cannot be displayed';
    } else {
      return value;
    }
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
