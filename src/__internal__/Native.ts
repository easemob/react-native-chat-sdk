/**
 * Call native api
 */

import { ExtSdkApiRN } from '../__specs__';
import { ChatError } from '../common/ChatError';

export class Native {
  protected static checkErrorFromResult(result: any): void {
    if (result?.error) {
      throw new ChatError(result.error);
    }
  }
  protected static _callMethod<T>(method: string, args?: Object): Promise<T> {
    return ExtSdkApiRN.callMethod(method, args);
  }
}
