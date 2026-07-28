/**
 * Contract test for `ChatRoomManager.joinChatRoom`: verifies the MT
 * constant, the nested `{ roomId }` payload shape, and that a
 * void-returning method resolves on success without throwing.
 */

import { ChatRoomManager } from '../../ChatRoomManager';
import { ChatError } from '../../common/ChatError';
import { MTjoinChatRoom } from '../../__internal__/Consts';
import { getLastCall, mockCallMethodOnce } from '../helpers/nativeMock';

describe('ChatRoomManager call-method contract', () => {
  const manager = new ChatRoomManager();

  test('joinChatRoom calls MTjoinChatRoom with { roomId } and resolves void', async () => {
    mockCallMethodOnce({});

    const result = await manager.joinChatRoom('room-42');

    const last = getLastCall();
    expect(last?.method).toBe(MTjoinChatRoom);
    expect(last?.args).toMatchObject({
      [MTjoinChatRoom]: {
        roomId: 'room-42',
      },
    });
    expect(result).toBeUndefined();
  });

  test('joinChatRoom rejects with ChatError when native returns { error }', async () => {
    mockCallMethodOnce({
      error: { code: 404, description: 'room not found' },
    });

    const p = manager.joinChatRoom('room-42');

    await expect(p).rejects.toBeInstanceOf(ChatError);
    await expect(p).rejects.toMatchObject({
      code: 404,
      description: 'room not found',
    });
  });
});
