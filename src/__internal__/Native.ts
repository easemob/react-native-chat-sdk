/**
 * Call native api
 */

import { ExtSdkApiRN, isTurboModuleEnabled } from '../__specs__';
import { ChatError } from '../common/ChatError';

export class Native {
  protected static checkErrorFromResult(result: any): void {
    if (result?.error) {
      throw new ChatError(result.error);
    }
  }
  protected static _callMethod<T>(method: string, args?: Object): Promise<T> {
    if (isTurboModuleEnabled === true) {
      // return ExtSdkApiRN.callMethodA({ method, args });
      return ExtSdkApiRN.callMethodB(method, args);
    } else {
      return ExtSdkApiRN.callMethod(method, args);
    }
  }
}
