import type { NativeEventEmitter } from 'react-native';
import { chatlog } from './common/ChatLog';
import { Native } from './__internal__/Native';

/**
 * The message push configuration options.
 */
export class ChatPushManager extends Native {
  private static TAG = 'ChatPushManager';
  constructor() {
    super();
  }

  public setNativeListener(_event: NativeEventEmitter): void {
    chatlog.log(`${ChatPushManager.TAG}: setNativeListener: `);
  }
}
