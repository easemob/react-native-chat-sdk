/**
 * Contract test for `ChatPresenceManager.publishPresence`: verifies the MT
 * constant, the nested `{ desc }` payload shape (note: the source maps the
 * `description` parameter to the `desc` field), and that a void-returning
 * method resolves on success without throwing.
 */

import { ChatPresenceManager } from '../../ChatPresenceManager';
import { ChatError } from '../../common/ChatError';
import { MTpublishPresenceWithDescription } from '../../__internal__/Consts';
import { getLastCall, mockCallMethodOnce } from '../helpers/nativeMock';

describe('ChatPresenceManager call-method contract', () => {
  const manager = new ChatPresenceManager();

  test('publishPresence calls MTpublishPresenceWithDescription with { desc } and resolves void', async () => {
    mockCallMethodOnce({});

    const result = await manager.publishPresence('away');

    const last = getLastCall();
    expect(last?.method).toBe(MTpublishPresenceWithDescription);
    expect(last?.args).toMatchObject({
      [MTpublishPresenceWithDescription]: {
        desc: 'away',
      },
    });
    expect(result).toBeUndefined();
  });

  test('publishPresence rejects with ChatError when native returns { error }', async () => {
    mockCallMethodOnce({
      error: { code: 503, description: 'presence unavailable' },
    });

    const p = manager.publishPresence('away');

    await expect(p).rejects.toBeInstanceOf(ChatError);
    await expect(p).rejects.toMatchObject({
      code: 503,
      description: 'presence unavailable',
    });
  });
});
