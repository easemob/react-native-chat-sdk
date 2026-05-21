/**
 * Contract test for `ChatContactManager.addContact`: verifies the MT
 * constant, the nested `{ username, reason }` payload shape, and that a
 * void-returning method resolves on success without throwing.
 */

import { ChatContactManager } from '../../ChatContactManager';
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
});
