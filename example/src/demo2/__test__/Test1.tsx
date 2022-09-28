import React, { ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Button,
  Platform,
  Dimensions,
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { styleValues } from '../__internal__/Css';
import { seq } from '../__internal__/Utils';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import type ImagePicker from 'react-native-image-picker';
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import type { MediaType } from '../__internal__/Types';
import { ChatClient, ChatConnectEventListener } from 'react-native-chat-sdk';

export interface StateBase {
  sendResult: string;
  recvResult: string;
}

// export abstract class LeafComponentBaseScreen<
//   S extends StateBase
// > extends React.Component<{ navigation: any }, S> {
//   protected static TAG = 'LeafComponentBaseScreen';
//   protected navigation: any;

//   constructor(props: { navigation: any }) {
//     super(props);
//     this.navigation = props.navigation;
//   }

//   protected tryCatch(
//     promise: Promise<any>,
//     tag: string,
//     name: string,
//     accept?: (value: any) => void,
//     reject?: (reason: any) => void
//   ): void {
//     promise
//       .then((value: any) => {
//         let result;
//         if (value !== undefined && value instanceof Object) {
//           result = JSON.stringify(value);
//         } else {
//           result = 'none';
//         }
//         console.log(`${tag}: ${name}: success: `, result);
//         this.setState({ sendResult: 'success: ' + result });
//         if (accept) {
//           accept(value);
//         }
//       })
//       .catch((reason: any) => {
//         console.log(`${tag}: ${name}: fail: `, reason);
//         this.setState({ sendResult: 'fail: ' + reason });
//         if (reject) {
//           reject(reason);
//         }
//       });
//   }

//   componentDidMount(): void {
//     console.log(`${LeafComponentBaseScreen.TAG}: componentDidMount: `);
//   }

//   componentWillUnmount(): void {
//     console.log(`${LeafComponentBaseScreen.TAG}: componentWillUnmount: `);
//   }

//   protected renderResult(): ReactNode[] {
//     const { sendResult, recvResult } = this.state;
//     return [
//       <View key="sendResult" style={styleValues.containerRow}>
//         <Text style={styleValues.textTipStyle}>send_result: {sendResult}</Text>
//       </View>,
//       <View key="recvResult" style={styleValues.containerRow}>
//         <Text style={styleValues.textTipStyle}>recv_result: {recvResult}</Text>
//       </View>,
//     ];
//   }

//   render(): ReactNode {
//     throw new Error('Please sub class implement.');
//   }
// }

interface ParamPair {
  paramName: string;
  paramType:
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function';
  paramValue?: any;
  paramDefaultValue: any;
}
export interface ApiParams {
  methodName: string;
  params: ParamPair[];
}

// type ss = 'ssss';
// if (typeof ss === 's') {
// }

export abstract class LeafScreenBase<
  S extends StateBase
> extends React.Component<{ navigation: any }, S> {
  public static route = 'LeafScreenBase';
  protected static TAG = 'LeafScreenBase';
  protected navigation: any;

  constructor(props: { navigation: any; route?: string }) {
    super(props);
    if (props.route) {
      LeafScreenBase.route = props.route;
      LeafScreenBase.TAG = LeafScreenBase.route;
    }
    this.navigation = props.navigation;
  }

  protected tryCatch(
    promise: Promise<any>,
    tag: string,
    name: string,
    accept?: (value: any) => void,
    reject?: (reason: any) => void
  ): void {
    promise
      .then((value: any) => {
        let result;
        if (value !== undefined && value instanceof Object) {
          result = JSON.stringify(value);
        } else {
          result = 'none';
        }
        console.log(`${tag}: ${name}: success: `, result);
        this.setState({ sendResult: 'success: ' + result });
        if (accept) {
          accept(value);
        }
      })
      .catch((reason: any) => {
        let result;
        if (reason !== undefined && reason instanceof Object) {
          result = JSON.stringify(reason);
        } else {
          result = 'none';
        }
        console.log(`${tag}: ${name}: fail: `, result);
        this.setState({ sendResult: 'fail: ' + result });
        if (reject) {
          reject(reason);
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
      <View key={seq()} style={styleValues.dividerContainer}>
        <View
          style={[
            styleValues.dividerContent,
            { width: Dimensions.get('window').width },
          ]}
        />
      </View>
    );
  }

  protected renderSendResult(): ReactNode[] {
    const { sendResult } = this.state;
    return [
      <View key={seq()} style={styleValues.containerRow}>
        <Text selectable={true} style={styleValues.textTipStyle}>
          send_result: {sendResult}
        </Text>
      </View>,
    ];
  }

  protected renderRecvResult(): ReactNode[] {
    const { recvResult } = this.state;
    return [
      <View key={seq()} style={styleValues.containerRow}>
        <Text selectable={true} style={styleValues.textTipStyle}>
          recv_result: {recvResult}
        </Text>
      </View>,
    ];
  }

  protected renderParamWithText(name: string): ReactNode {
    return (
      <View key={seq()} style={styleValues.containerRow}>
        <Text style={styleValues.textTipStyle}>{name}</Text>
      </View>
    );
  }

  protected renderParamWithInput(
    name: string,
    value: string,
    oct?: (text: string) => void
  ): ReactNode {
    return (
      <View key={seq()} style={styleValues.containerRow}>
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
      <View key={seq()} style={styleValues.containerRow}>
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

  protected renderParamWithSelectFile(
    name: string,
    value: string,
    oct?: (text: string) => void
  ): ReactNode {
    return (
      <View key="recvResult" style={styleValues.containerRow}>
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
          title="SF"
          onPress={() => {
            DocumentPicker.pick({ type: [DocumentPicker.types.allFiles] })
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
                    oct(s);
                  }
                } else {
                  // todo: android有问题
                  let s =
                    RNFS.ExternalStorageDirectoryPath +
                    '/Recorder/' +
                    values[0].name;
                  if (oct) {
                    oct(s);
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
    oct?: (text: string) => void
  ): ReactNode {
    return (
      <View key="recvResult" style={styleValues.containerRow}>
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
                  oct('cancel');
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
                          filePath: ${s}, 
                          width: ${response.assets[0].width!},
                          height: ${response.assets[0].height!},
                          displayName: ${response.assets[0].fileName!},
                          fileSize: ${response.assets[0].fileSize!},
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
      <View key={seq()} style={styleValues.containerRow}>
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
      <View>
        {this.renderResult()}
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

interface StateTest extends StateBase {
  userName: string;
  pwdOrToken: string;
  isPassword: boolean;
}

/**
 * 这样的做法效率很低，一个api一个页面
 * 后面可考虑脚本生成代码
 */
export class LeafScreenTest extends LeafScreenBase<StateTest> {
  protected static TAG = 'LeafScreenTest';
  public static route = 'LeafScreenTest';
  iniData: ApiParams;
  constructor(props: { navigation: any; route?: string }) {
    if (props.route === undefined) {
      props.route = 'LeafScreenTest';
    }
    super(props);
    this.iniData = {
      methodName: 'login',
      params: [
        {
          paramName: 'userName',
          paramType: 'string',
          paramDefaultValue: 'asteriskhx1',
        },
        {
          paramName: 'pwdOrToken',
          paramType: 'string',
          paramDefaultValue: 'qwer',
        },
        {
          paramName: 'isPassword',
          paramType: 'boolean',
          paramDefaultValue: true,
        },
      ],
    };
    this.state = {
      userName:
        this.iniData.params[0].paramValue ??
        this.iniData.params[0].paramDefaultValue,
      pwdOrToken:
        this.iniData.params[1].paramValue ??
        this.iniData.params[1].paramDefaultValue,
      isPassword:
        this.iniData.params[2].paramValue ??
        this.iniData.params[2].paramDefaultValue,
      sendResult: '',
      recvResult: '',
    };
  }
  protected renderResult(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderSendResult()}
        {this.renderRecvResult()}
      </View>
    );
  }
  protected renderBody(): ReactNode {
    console.log(`${LeafScreenBase.TAG}: renderBody: `);
    // example: login
    // public async login(
    //   userName: string,
    //   pwdOrToken: string,
    //   isPassword: boolean = true
    // )
    return <View style={styleValues.containerColumn}>{this.handleApi()}</View>;
  }
  protected handleApi(): ReactNode {
    const data = this.iniData;
    console.log(`${LeafScreenBase.TAG}: handleApi: `, data);
    const { userName, pwdOrToken, isPassword } = this.state;
    return (
      <View style={styleValues.containerColumn}>
        {this.renderParamWithText(data.methodName)}
        {this.renderParamWithInput(
          data.params[0].paramName,
          userName,
          (text: string) => {
            this.setState({ userName: text });
          }
        )}
        {this.renderParamWithInput(
          data.params[1].paramName,
          pwdOrToken,
          (text: string) => {
            this.setState({ pwdOrToken: text });
          }
        )}
        {this.renderParamWithEnum(
          data.params[2].paramName,
          ['true', 'false'],
          isPassword ? 'true' : 'false',
          (index: string, option: any) => {
            this.setState({ isPassword: option === 'true' ? true : false });
          }
        )}
        {this.renderButton(data.methodName, () => {
          this.callApi();
        })}
      </View>
    );
  }
  private callApi(): void {
    console.log(`${LeafScreenBase.TAG}: callApi: `);
    this.tryCatch(
      ChatClient.getInstance().login(
        this.state.userName,
        this.state.pwdOrToken,
        this.state.isPassword
      ),
      LeafScreenBase.TAG,
      this.iniData.methodName
    );
  }
}

interface StateClient extends StateBase {
  login: {
    userName: string;
    pwdOrToken: string;
    isPassword: boolean;
  };
  loginWithAgoraToken: {
    userName: string;
    agoraToken: string;
  };
}

export class LeafScreenClient extends LeafScreenBase<StateClient> {
  protected static TAG = 'LeafScreenClient';
  public static route = 'LeafScreenClient';
  iniData: ApiParams[];
  constructor(props: { navigation: any }) {
    super(props);
    this.iniData = [
      {
        methodName: 'login',
        params: [
          {
            paramName: 'userName',
            paramType: 'string',
            paramDefaultValue: 'asteriskhx1',
          },
          {
            paramName: 'pwdOrToken',
            paramType: 'string',
            paramDefaultValue: 'qwer',
          },
          {
            paramName: 'isPassword',
            paramType: 'boolean',
            paramDefaultValue: true,
          },
        ],
      },
      {
        methodName: 'loginWithAgoraToken',
        params: [
          {
            paramName: 'userName',
            paramType: 'string',
            paramDefaultValue: 'asteriskhx1',
          },
          {
            paramName: 'agoraToken',
            paramType: 'string',
            paramDefaultValue: 'qwer',
          },
        ],
      },
    ];
    this.state = {
      login: {
        userName:
          this.iniData[0].params[0].paramValue ??
          this.iniData[0].params[0].paramDefaultValue,
        pwdOrToken:
          this.iniData[0].params[1].paramValue ??
          this.iniData[0].params[1].paramDefaultValue,
        isPassword:
          this.iniData[0].params[2].paramValue ??
          this.iniData[0].params[2].paramDefaultValue,
      },
      loginWithAgoraToken: {
        userName:
          this.iniData[1].params[0].paramValue ??
          this.iniData[1].params[0].paramDefaultValue,
        agoraToken:
          this.iniData[1].params[1].paramValue ??
          this.iniData[1].params[1].paramDefaultValue,
      },
      sendResult: '',
      recvResult: '',
    };
  }
  protected addListener?(): void {
    let listener = new (class s implements ChatConnectEventListener {
      that: LeafScreenClient;
      constructor(parent: any) {
        this.that = parent as LeafScreenClient;
      }
      onTokenWillExpire(): void {
        console.log('LeafScreenClient.onTokenWillExpire');
        this.that.setState({ recvResult: 'onTokenWillExpire' });
      }
      onTokenDidExpire(): void {
        console.log('LeafScreenClient.onTokenDidExpire');
        this.that.setState({ recvResult: 'onTokenDidExpire' });
      }
      onConnected(): void {
        console.log('LeafScreenClient.onConnected');
        this.that.setState({ recvResult: 'onConnected' });
      }
      onDisconnected(errorCode?: number): void {
        console.log('LeafScreenClient.onDisconnected: ', errorCode);
        this.that.setState({ recvResult: 'onDisconnected' });
      }
    })(this);
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance().addConnectionListener(listener);
  }

  protected removeListener?(): void {
    ChatClient.getInstance().removeAllConnectionListener();
  }

  protected renderResult(): ReactNode {
    return (
      <View style={styleValues.containerColumn}>
        {this.renderSendResult()}
        {this.renderRecvResult()}
      </View>
    );
  }
  protected renderBody(): ReactNode {
    console.log(`${LeafScreenBase.TAG}: renderBody: `);
    // example: login
    // public async login(
    //   userName: string,
    //   pwdOrToken: string,
    //   isPassword: boolean = true
    // )
    return (
      <View style={styleValues.containerColumn}>
        {this.handleLogin()}
        {this.handleLoginWithAgoraToken()}
      </View>
    );
  }
  protected handleLogin(): ReactNode[] {
    const data = this.iniData;
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
  protected handleLoginWithAgoraToken(): ReactNode[] {
    const data = this.iniData;
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
    console.log(`${LeafScreenBase.TAG}: callApi: `);
    if (name === 'login') {
      this.tryCatch(
        ChatClient.getInstance().login(
          this.state.login.userName,
          this.state.login.pwdOrToken,
          this.state.login.isPassword
        ),
        LeafScreenBase.TAG,
        this.iniData[0].methodName
      );
    } else if (name === 'loginWithAgoraToken') {
      this.tryCatch(
        ChatClient.getInstance().loginWithAgoraToken(
          this.state.loginWithAgoraToken.userName,
          this.state.loginWithAgoraToken.agoraToken
        ),
        LeafScreenBase.TAG,
        this.iniData[1].methodName
      );
    }
  }
}

// export const screenList: React.ComponentClass<{ navigation: any }, any>[] = [];
// export function registerComponents(): void {
//   registerComponent(null);
// }
// function registerComponent(_p: any): void {
//   // screenList.push(ReactComponent2);
//   screenList.push(
//     class extends LeafScreenBase<StateTest> {
//       // protected static TAG = 'LeafScreenTest';
//       iniData: ApiParams;
//       constructor(props: { navigation: any; route?: string }) {
//         if (props.route === undefined) {
//           props.route = 'LeafScreenTest';
//         }
//         super(props);
//         this.iniData = {
//           methodName: 'login',
//           params: [
//             {
//               paramName: 'userName',
//               paramType: 'string',
//               paramDefaultValue: 'asteriskhx1',
//             },
//             {
//               paramName: 'pwdOrToken',
//               paramType: 'string',
//               paramDefaultValue: 'qwer',
//             },
//             {
//               paramName: 'isPassword',
//               paramType: 'boolean',
//               paramDefaultValue: true,
//             },
//           ],
//         };
//         this.state = {
//           userName:
//             this.iniData.params[0].paramValue ??
//             this.iniData.params[0].paramDefaultValue,
//           pwdOrToken:
//             this.iniData.params[1].paramValue ??
//             this.iniData.params[1].paramDefaultValue,
//           isPassword:
//             this.iniData.params[2].paramValue ??
//             this.iniData.params[2].paramDefaultValue,
//           sendResult: '',
//           recvResult: '',
//         };
//       }
//       protected renderBody(): ReactNode {
//         console.log(`${LeafScreenBase.TAG}: renderBody: `);
//         // example: login
//         // public async login(
//         //   userName: string,
//         //   pwdOrToken: string,
//         //   isPassword: boolean = true
//         // )
//         return (
//           <View style={styleValues.containerColumn}>
//             {this.handleApi()}
//             {this.renderSendResult()}
//             {this.renderRecvResult()}
//           </View>
//         );
//       }
//       protected handleApi(): ReactNode {
//         const data = this.iniData;
//         console.log(`${LeafScreenBase.TAG}: handleApi: `, data);
//         const { userName, pwdOrToken, isPassword } = this.state;
//         return (
//           <View style={styleValues.containerColumn}>
//             {this.renderParamWithText(data.methodName)}
//             {this.renderParamWithInput(
//               data.params[0].paramName,
//               userName,
//               (text: string) => {
//                 this.setState({ userName: text });
//               }
//             )}
//             {this.renderParamWithInput(
//               data.params[1].paramName,
//               pwdOrToken,
//               (text: string) => {
//                 this.setState({ pwdOrToken: text });
//               }
//             )}
//             {this.renderParamWithEnum(
//               data.params[2].paramName,
//               ['true', 'false'],
//               isPassword ? 'true' : 'false',
//               (index: string, option: any) => {
//                 this.setState({ isPassword: option === 'true' ? true : false });
//               }
//             )}
//             {this.renderButton(data.methodName, () => {
//               this.callApi();
//             })}
//           </View>
//         );
//       }
//       private callApi(): void {
//         console.log(`${LeafScreenBase.TAG}: callApi: `);
//         this.tryCatch(
//           ChatClient.getInstance().login(
//             this.state.userName,
//             this.state.pwdOrToken,
//             this.state.isPassword
//           ),
//           LeafScreenBase.TAG,
//           this.iniData.methodName
//         );
//       }
//     }
//   );
// }

// interface MyComponent {
//   className: string;
//   state: StateBase;
//   component: React.ComponentClass<{ navigation: any }, any>;
// }

// export interface StateTest3 extends StateBase {
//   value: string;
// }

// const ssssss: StateTest3 = {
//   sendResult: '',
//   recvResult: '',
//   value: '',
// };

// type StateTest4 = {
//   sendResult: string;
//   recvResult: string;
//   userName: string;
//   pwdOrToken: string;
//   isPassword: boolean;
// };

// type XXX = StateTest | StateTest4;

// const XXXClassName = 'sdf';

// export const screenList2: MyComponent[] = [];
// export function registerComponent2(_p: any): void {
//   screenList2.push({
//     className: 'LeafScreenTest',
//     state: ssssss,
//     component: class extends LeafScreenBase<XXX> {
//       // protected static TAG = 'LeafScreenTest';
//       iniData: ApiParams;
//       constructor(props: { navigation: any; route?: string }) {
//         if (props.route === undefined) {
//           props.route = `${XXXClassName}`;
//         }
//         super(props);
//         this.iniData = {
//           methodName: 'login',
//           params: [
//             {
//               paramName: 'userName',
//               paramType: 'string',
//               paramDefaultValue: 'asteriskhx1',
//             },
//             {
//               paramName: 'pwdOrToken',
//               paramType: 'string',
//               paramDefaultValue: 'qwer',
//             },
//             {
//               paramName: 'isPassword',
//               paramType: 'boolean',
//               paramDefaultValue: true,
//             },
//           ],
//         };
//         this.state = {
//           userName:
//             this.iniData.params[0].paramValue ??
//             this.iniData.params[0].paramDefaultValue,
//           pwdOrToken:
//             this.iniData.params[1].paramValue ??
//             this.iniData.params[1].paramDefaultValue,
//           isPassword:
//             this.iniData.params[2].paramValue ??
//             this.iniData.params[2].paramDefaultValue,
//           sendResult: '',
//           recvResult: '',
//         };
//       }
//       protected renderBody(): ReactNode {
//         console.log(`${LeafScreenBase.TAG}: renderBody: `);
//         // example: login
//         // public async login(
//         //   userName: string,
//         //   pwdOrToken: string,
//         //   isPassword: boolean = true
//         // )
//         return (
//           <View style={styleValues.containerColumn}>
//             {this.handleApi()}
//             {this.renderSendResult()}
//             {this.renderRecvResult()}
//           </View>
//         );
//       }
//       protected handleApi(): ReactNode {
//         const data = this.iniData;
//         console.log(`${LeafScreenBase.TAG}: handleApi: `, data);
//         const { userName, pwdOrToken, isPassword } = this.state;
//         return (
//           <View style={styleValues.containerColumn}>
//             {this.renderParamWithText(data.methodName)}
//             {this.renderParamWithInput(
//               data.params[0].paramName,
//               userName,
//               (text: string) => {
//                 this.setState({ userName: text });
//               }
//             )}
//             {this.renderParamWithInput(
//               data.params[1].paramName,
//               pwdOrToken,
//               (text: string) => {
//                 this.setState({ pwdOrToken: text });
//               }
//             )}
//             {this.renderParamWithEnum(
//               data.params[2].paramName,
//               ['true', 'false'],
//               isPassword ? 'true' : 'false',
//               (index: string, option: any) => {
//                 this.setState({ isPassword: option === 'true' ? true : false });
//               }
//             )}
//             {this.renderButton(data.methodName, () => {
//               this.callApi();
//             })}
//           </View>
//         );
//       }
//       private callApi(): void {
//         console.log(`${LeafScreenBase.TAG}: callApi: `);
//         this.tryCatch(
//           ChatClient.getInstance().login(
//             this.state.userName,
//             this.state.pwdOrToken,
//             this.state.isPassword
//           ),
//           LeafScreenBase.TAG,
//           this.iniData.methodName
//         );
//       }
//     },
//   });
// }

// interface State extends StateBase {}

// export function LeafComponentScreenFactory(
//   params: any
// ): LeafComponentBaseScreen<StateBase> {
//   return new (class s extends LeafComponentBaseScreen<State> {
//     public static route = 'SendMessageScreen';
//     protected static TAG = 'SendMessageScreen';
//     constructor(props: { navigation: any }) {
//       super(props);
//     }
//     componentDidMount(): void {
//       super.componentDidMount();
//     }
//     componentWillUnmount(): void {
//       super.componentWillUnmount();
//     }
//     render(): ReactNode {
//       const { sendResult } = this.state;
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerColumn}>
//             <Text style={styleValues.textTipStyle}>result: {sendResult}</Text>
//           </View>
//         </View>
//       );
//     }
//   })({ navigation: params });
// }

// type ssss<S extends StateBase> = LeafComponentBaseScreen<S>;

// export function LeafComponentScreenFactory2<S extends StateBase>(): Promise<
//   LeafComponentBaseScreen<S>
// > {
//   const s = `class s extends LeafComponentBaseScreen<S> {
//     public static route = 'SendMessageScreen';
//     protected static TAG = 'SendMessageScreen';
//     constructor(props: { navigation: any }) {
//       super(props);
//     }
//     componentDidMount(): void {
//       super.componentDidMount();
//     }
//     componentWillUnmount(): void {
//       super.componentWillUnmount();
//     }
//     render(): ReactNode {
//       const { sendResult } = this.state;
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerColumn}>
//             <Text style={styleValues.textTipStyle}>result: {sendResult}</Text>
//           </View>
//         </View>
//       );
//     }
//   };`;
//   // eslint-disable-next-line no-eval
//   return eval(s);
// }

// class TestExportClass {
//   value: any;
//   constructor(props: { navigation: any }) {
//     this.value = props.navigation;
//   }
// }

// export function LeafComponentScreenFactory3(): TestExportClass {
//   return new TestExportClass({ navigation: 's' });
// }

// export function LeafComponentScreenFactory4<S extends StateBase>(props: {
//   navigation: any;
// }): React.Component<{ navigation: any }, S> {
//   return new (class s extends React.Component<{ navigation: any }, S> {
//     public static route = 'SendMessageScreen';
//     protected static TAG = 'SendMessageScreen';
//     constructor(props: { navigation: any }) {
//       super(props);
//     }
//     componentDidMount(): void {}
//     componentWillUnmount(): void {}
//     render(): ReactNode {
//       const { sendResult } = this.state;
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerColumn}>
//             <Text style={styleValues.textTipStyle}>result: {sendResult}</Text>
//           </View>
//         </View>
//       );
//     }
//   })(props);
// }

// export function LeafComponentScreenFactory5<S extends StateBase>(props: {
//   navigation: any;
// }): React.Component<{ navigation: any }, S> {
//   return new (class s extends React.Component<{ navigation: any }, S> {
//     public static route = 'SendMessageScreen';
//     protected static TAG = 'SendMessageScreen';
//     constructor(props: { navigation: any }) {
//       super(props);
//     }
//     componentDidMount(): void {}
//     componentWillUnmount(): void {}
//     render(): ReactNode {
//       const { sendResult } = this.state;
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerColumn}>
//             <Text style={styleValues.textTipStyle}>result: {sendResult}</Text>
//           </View>
//         </View>
//       );
//     }
//   })(props);
// }

// type ParamsType = {
//   props: {
//     navigation: any;
//   };
// };

// export const LeafComponentScreenFactory6: LeafComponentType = (props: {
//   navigation: any;
// }): any => {
//   class _s<P extends { navigation: any }, S> extends React.Component<P, S, any> {
//     public static route = 'LeafScreenClient';
//     private static TAG = 'LeafScreenClient';
//     navigation: any;

//     constructor(_props: P) {
//       super(_props);
//       this.navigation = props.navigation;
//     }

//     render(): ReactNode {
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerRow}>
//             <Text style={styleValues.textStyle}>UseName: </Text>
//           </View>
//         </View>
//       );
//     }
//   }

//   class _ss<P extends { navigation: any }, S = any>
//     implements React.ComponentClass<P, S>
//   {
//     component: _s<P, S>;
//     constructor(_props: P, _context?: any) {
//       this.component = new _s(_props);
//     }
//     // new (props: P, context?: any): React.Component<P, S>;
//     propTypes?: React.WeakValidationMap<P> | undefined;
//     contextType?: React.Context<any> | undefined;
//     contextTypes?: ValidationMap<any> | undefined;
//     childContextTypes?: ValidationMap<any> | undefined;
//     defaultProps?: Partial<P> | undefined;
//     displayName?: string | undefined;
//     getDerivedStateFromProps?: React.GetDerivedStateFromProps<P, S> | undefined;
//     getDerivedStateFromError?: React.GetDerivedStateFromError<P, S> | undefined;
//   }
//   return new _ss(props);
// };

// const ReactComponent2: React.ComponentClass<{
//   navigation: any;
// }> = class extends React.Component<{ navigation: any }, any> {
//   static displayName = 'ReactComponent2';
//   public static route = 'ReactComponent2';
//   render(): ReactNode {
//     return (
//       <View style={styleValues.containerColumn}>
//         <View style={styleValues.containerRow}>
//           <Text style={styleValues.textStyle}>UseName: </Text>
//         </View>
//       </View>
//     );
//   }
// };
// const sss: React.ComponentClass<{
//   navigation: any;
// }>[] = [];
// sss.push(ReactComponent2);

// export const LeafComponentScreenFactory7: LeafComponentType = ReactComponent2;

// export function LeafComponentScreenFactory8(): React.ComponentClass {
//   const ret: React.ComponentClass = class extends React.React.Component {
//     static displayName = 'ReactComponent2';
//     public static route = 'ReactComponent2';
//     // new (props: {}, context?: any): React.Component<{}, any, any>
//     render(): ReactNode {
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerRow}>
//             <Text style={styleValues.textStyle}>UseName: </Text>
//           </View>
//         </View>
//       );
//     }
//   };
//   return ret;
// }

// export const ReactComponent3: React.ComponentClass =
//   LeafComponentScreenFactory8();

const key: string = '';
const value: string = '';
const KV = { [key]: value };
const kv: typeof KV = { '1': '2' };
let kv2: typeof KV;
kv2 = { '2': '3' };
console.log(kv, kv2);

let kv3: { [x: string]: string }[] = [{ key1: 'value1' }, { key2: 'value2' }];
console.log(kv3);
