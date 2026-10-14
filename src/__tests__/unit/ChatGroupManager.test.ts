/**
 * Contract test for `ChatGroupManager.fetchGroupInfoWithoutMembersFromServer`:
 * verifies the MT constant, the nested `{ groupId }` payload shape, and that
 * the native payload is decoded into a `ChatGroup` instance.
 */

import { ChatGroupManager } from '../../ChatGroupManager';
import { ChatError } from '../../common/ChatError';
import { ChatGroup } from '../../common/ChatGroup';
import { MTgetGroupSpecificationFromServer } from '../../__internal__/Consts';
import { getLastCall, mockCallMethodOnce } from '../helpers/nativeMock';

describe('ChatGroupManager call-method contract', () => {
  const manager = new ChatGroupManager();

  test('fetchGroupInfoWithoutMembersFromServer calls MTgetGroupSpecificationFromServer with { groupId } and decodes ChatGroup', async () => {
    mockCallMethodOnce({
      [MTgetGroupSpecificationFromServer]: {
        groupId: 'g1',
        groupName: 'group-one',
        owner: 'alice',
        permissionType: 0,
      },
    });

    const group = await manager.fetchGroupInfoWithoutMembersFromServer('g1');

    const last = getLastCall();
    expect(last?.method).toBe(MTgetGroupSpecificationFromServer);
    expect(last?.args).toMatchObject({
      [MTgetGroupSpecificationFromServer]: {
        groupId: 'g1',
      },
    });
    expect(group).toBeInstanceOf(ChatGroup);
    expect(group?.groupId).toBe('g1');
    expect(group?.groupName).toBe('group-one');
    expect(group?.owner).toBe('alice');
  });

  test('fetchGroupInfoWithoutMembersFromServer rejects with ChatError when native returns { error }', async () => {
    mockCallMethodOnce({
      error: { code: 404, description: 'group not found' },
    });

    const p = manager.fetchGroupInfoWithoutMembersFromServer('g1');

    await expect(p).rejects.toBeInstanceOf(ChatError);
    await expect(p).rejects.toMatchObject({
      code: 404,
      description: 'group not found',
    });
  });
});
