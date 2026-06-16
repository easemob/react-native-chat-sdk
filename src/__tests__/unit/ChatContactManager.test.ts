/**
 * Contract test for `ChatContactManager.addContact`: verifies the MT
 * constant, the nested `{ username, reason }` payload shape, and that a
 * void-returning method resolves on success without throwing.
 */

import { ChatContactManager } from '../../ChatContactManager';
import { ChatError } from '../../common/ChatError';
import { MTaddContact } from '../../__internal__/Consts';
import { getLastCall, mockCallMethodOnce } from '../helpers/nativeMock';

describe('ChatContactManager call-method contract', () => {
  const manager = new ChatContactManager();

  test('addContact calls MTaddContact with { username, reason } and resolves void', async () => {
    mockCallMethodOnce({});

    const result = await manager.addContact('alice', 'hello');

    const last = getLastCall();
    expect(last?.method).toBe(MTaddContact);
    expect(last?.args).toMatchObject({
      [MTaddContact]: {
        username: 'alice',
        reason: 'hello',
      },
    });
    expect(result).toBeUndefined();
  });

  test('addContact rejects with ChatError when native returns { error }', async () => {
    mockCallMethodOnce({
      error: { code: 403, description: 'contact denied' },
    });

    const p = manager.addContact('alice', 'hello');

    await expect(p).rejects.toBeInstanceOf(ChatError);
    await expect(p).rejects.toMatchObject({
      code: 403,
      description: 'contact denied',
    });
  });
});
