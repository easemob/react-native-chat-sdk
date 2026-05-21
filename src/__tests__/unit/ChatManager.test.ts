/**
 * Contract tests for `ChatManager`: verifies that `getUnreadCount` routes
 * through `Native._callMethod` with the expected MT constant, has no payload
 * args (parameterless call), and decodes the native return value into a
 * primitive number.
 *
 * Also covers the cross-Manager "native error -> ChatError" contract by
 * exercising a representative failure path through `ChatManager`. This is
 * intentionally NOT duplicated in the other Manager test files.
 */

import { ChatManager } from '../../ChatManager';
import { ChatError } from '../../common/ChatError';
import { MTgetUnreadMessageCount } from '../../__internal__/Consts';
import {
  getCallMethodMock,
  getLastCall,
  mockCallMethodOnce,
} from '../helpers/nativeMock';

describe('ChatManager call-method contract', () => {
  const manager = new ChatManager();

  test('getUnreadCount calls MTgetUnreadMessageCount and decodes the count', async () => {
    mockCallMethodOnce({ [MTgetUnreadMessageCount]: 42 });

    const count = await manager.getUnreadCount();

    const last = getLastCall();
    expect(last?.method).toBe(MTgetUnreadMessageCount);
    // The implementation calls Native._callMethod(MT, /* no args */) so the
    // second positional arg is undefined.
    expect(last?.args).toBeUndefined();
    expect(count).toBe(42);
  });

  test('getUnreadCount rejects with ChatError when native returns { error }', async () => {
    mockCallMethodOnce({
      error: { code: 500, description: 'native boom' },
    });

    const p = manager.getUnreadCount();

    await expect(p).rejects.toBeInstanceOf(ChatError);
    await expect(p).rejects.toMatchObject({
      code: 500,
      description: 'native boom',
    });
    // Even on failure, the bridge was called with the expected method name.
    expect(getCallMethodMock()).toHaveBeenCalledWith(
      MTgetUnreadMessageCount,
      undefined
    );
  });
});
