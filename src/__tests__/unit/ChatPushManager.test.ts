/**
 * Contract test for `ChatPushManager.fetchPushOptionFromServer`: verifies
 * the MT constant, that the method is invoked with no payload (parameterless),
 * and that the native payload is decoded into a `ChatPushOption` instance.
 */

import { ChatPushManager } from '../../ChatPushManager';
import { ChatPushOption } from '../../common/ChatPushConfig';
import { MTgetImPushConfigFromServer } from '../../__internal__/Consts';
import { getLastCall, mockCallMethodOnce } from '../helpers/nativeMock';

describe('ChatPushManager call-method contract', () => {
  const manager = new ChatPushManager();

  test('fetchPushOptionFromServer calls MTgetImPushConfigFromServer and decodes ChatPushOption', async () => {
    mockCallMethodOnce({
      [MTgetImPushConfigFromServer]: {
        displayStyle: 1,
        displayName: 'alice',
      },
    });

    const opt = await manager.fetchPushOptionFromServer();

    const last = getLastCall();
    expect(last?.method).toBe(MTgetImPushConfigFromServer);
    // Parameterless call — second positional arg is undefined.
    expect(last?.args).toBeUndefined();
    expect(opt).toBeInstanceOf(ChatPushOption);
    expect(opt.displayName).toBe('alice');
    expect(opt.displayStyle).toBe(1);
  });
});
