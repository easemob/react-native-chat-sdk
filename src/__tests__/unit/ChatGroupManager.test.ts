/**
 * Contract test for `ChatGroupManager.fetchGroupInfoFromServer`: verifies
 * the MT constant, the nested `{ groupId, fetchMembers }` payload shape,
 * and that the native payload is decoded into a `ChatGroup` instance.
 */

import { ChatGroupManager } from '../../ChatGroupManager';
import { ChatGroup } from '../../common/ChatGroup';
import { MTgetGroupSpecificationFromServer } from '../../__internal__/Consts';
import { getLastCall, mockCallMethodOnce } from '../helpers/nativeMock';

describe('ChatGroupManager call-method contract', () => {
  const manager = new ChatGroupManager();

  test('fetchGroupInfoFromServer calls MTgetGroupSpecificationFromServer with { groupId, fetchMembers } and decodes ChatGroup', async () => {
    mockCallMethodOnce({
      [MTgetGroupSpecificationFromServer]: {
        groupId: 'g1',
        groupName: 'group-one',
        owner: 'alice',
        permissionType: 0,
      },
    });

    const group = await manager.fetchGroupInfoFromServer('g1', true);

    const last = getLastCall();
    expect(last?.method).toBe(MTgetGroupSpecificationFromServer);
    expect(last?.args).toMatchObject({
      [MTgetGroupSpecificationFromServer]: {
        groupId: 'g1',
        fetchMembers: true,
      },
    });
    expect(group).toBeInstanceOf(ChatGroup);
    expect(group?.groupId).toBe('g1');
    expect(group?.groupName).toBe('group-one');
    expect(group?.owner).toBe('alice');
  });
});
