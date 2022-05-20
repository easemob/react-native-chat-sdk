/**
 * Call native api
 */

import { ChatError } from '../common/ChatError';
import { NativeModules } from 'react-native';

const { ExtSdkApiRN } = NativeModules;

export class Native {
  protected static checkErrorFromResult(result: any): void {
    if (result?.error) {
      throw new ChatError(result.error);
    }
  }
  protected static _callMethod<T>(method: string, args?: {}): Promise<T> {
    return ExtSdkApiRN.callMethod(method, args);
  }
}
