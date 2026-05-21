/**
 * Contract test for `ChatUserInfoManager.fetchUserInfoById`.
 *
 * Substitution note: the task originally suggested `fetchOwnInfo`, but that
 * method calls `Factory.getChatClient().getCurrentUsername()` first (a second
 * async dependency) and then delegates to `fetchUserInfoById`. The latter is
 * the underlying native-bridge call that carries the real contract, so it is
 * the more representative method for a one-test-per-Manager contract check.
 *
 * Verifies the MT constant, the nested `{ userIds }` payload shape, and that
 * the native payload (keyed by user id) is decoded into a `Map<string,
 * ChatUserInfo>`.
 */

import { ChatUserInfoManager } from '../../ChatUserInfoManager';
import { ChatError } from '../../common/ChatError';
import { ChatUserInfo } from '../../common/ChatUserInfo';
import { MTfetchUserInfoById } from '../../__internal__/Consts';
import { getLastCall, mockCallMethodOnce } from '../helpers/nativeMock';

describe('ChatUserInfoManager call-method contract', () => {
  const manager = new ChatUserInfoManager();

  test('fetchUserInfoById calls MTfetchUserInfoById with { userIds } and decodes a Map<string, ChatUserInfo>', async () => {
    mockCallMethodOnce({
      [MTfetchUserInfoById]: {
        u1: { userId: 'u1', nickName: 'Alice' },
        u2: { userId: 'u2', nickName: 'Bob' },
      },
    });

    const ret = await manager.fetchUserInfoById(['u1', 'u2']);

    const last = getLastCall();
    expect(last?.method).toBe(MTfetchUserInfoById);
    expect(last?.args).toMatchObject({
      [MTfetchUserInfoById]: {
        userIds: ['u1', 'u2'],
      },
    });
    expect(ret.size).toBe(2);
    expect(ret.get('u1')).toBeInstanceOf(ChatUserInfo);
    expect(ret.get('u1')?.nickName).toBe('Alice');
    expect(ret.get('u2')?.userId).toBe('u2');
  });

  test('fetchUserInfoById rejects with ChatError when native returns { error }', async () => {
    mockCallMethodOnce({
      error: { code: 404, description: 'user not found' },
    });

    const p = manager.fetchUserInfoById(['u1']);

    await expect(p).rejects.toBeInstanceOf(ChatError);
    await expect(p).rejects.toMatchObject({
      code: 404,
      description: 'user not found',
    });
  });
});
