/**
 * Call native api
 */

import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-chat-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
export const isTurboModuleEnabled = global.__turboModuleProxy != null;

const ChatSdkModule = isTurboModuleEnabled
  ? require('./NativeChatSdk').default
  : NativeModules.ChatSdk;

export const ExtSdkApiRN = ChatSdkModule
  ? ChatSdkModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const eventEmitter = new NativeEventEmitter(ExtSdkApiRN);
