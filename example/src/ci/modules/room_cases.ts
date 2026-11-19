/**
 * ROOM domain CI cases (`RN-ROOM-*`): chat room APIs.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerRoomCases` is wired into the
 * `logged_in_base` entry; `registerRoomLoggedOutCases` collects the
 * no-login negative cases for the `logged_out` entry.
 */

import { addTearDown, ciTest, type CiCaseContext } from '../harness';
import {
  assertEqual,
  assertNotNull,
  assertTrue,
  expectCiError,
} from '../support/expect';
import { uniqueCiName } from '../support/unique';
import { waitForCi, withCiTimeout } from '../support/wait_for';

function requireRoomLogin(ctx: CiCaseContext): {
  userId: string;
  peerId: string;
} {
  const userId =
    ctx.config.accounts?.[0]?.id ?? ctx.client.currentUserName ?? '';
  if (!userId) {
    throw new Error('chat-room CI case requires a logged-in account');
  }
  const peerId = ctx.config.peerId ?? '';
  if (!peerId) {
    throw new Error('chat-room CI case requires a prepared peerId');
  }
  assertTrue(
    peerId !== userId,
    'the prepared peerId must differ from the logged-in user'
  );
  return { userId, peerId };
}

async function prepareRoom(
  ctx: CiCaseContext,
  caseId: string
): Promise<{ id: string; name: string; userId: string; peerId: string }> {
  const { userId, peerId } = requireRoomLogin(ctx);
  const name = uniqueCiName('room', caseId.toLowerCase());
  const id = await ctx.rest.createChatRoom({
    owner: userId,
    name,
    description: `CI ${caseId} room`,
    members: [peerId],
  });

  addTearDown(async () => {
    try {
      await withCiTimeout(
        ctx.client.roomManager.leaveChatRoom(id),
        15000,
        `leave chat room ${id}`
      );
    } catch {
      // Leaving is best effort; REST deletion below is authoritative.
    }
    await ctx.rest.deleteChatRoom(id);
    await ctx.rest.verifyChatRoomAbsent(id);
  });

  await withCiTimeout(
    ctx.client.roomManager.joinChatRoomEx({ roomId: id }),
    30000,
    `join chat room ${id}`
  );
  return { id, name, userId, peerId };
}

/** Logged-in chat room cases (`logged_in_base` entry). */
export function registerRoomCases(ctx: CiCaseContext): void {
  // Test: Fetch the first public chat room page, mirroring
  // single_account.json room.fetchPublicChatRoomsFromServer (pageNum 1,
  // pageSize 20). Expected: a successful read-only fetch whose page count
  // matches the returned list; no specific data is asserted.
  ciTest(
    'RN-ROOM-001',
    'fetchPublicChatRoomsFromServer returns a page result',
    async () => {
      const page = await ctx.client.roomManager.fetchPublicChatRoomsFromServer(
        1,
        20
      );
      assertNotNull(page.list);
      assertEqual(page.list.length, page.pageCount);
      for (const room of page.list) {
        assertTrue(room.roomId.length > 0, 'a chat room needs a roomId');
      }
    }
  );

  const manager = ctx.client.roomManager;

  // Test: Create a room through REST with the owner and prepared peer as
  // members, join it, then read its server detail, local cache, and members.
  // Expected: Server and local reads report the created room, the member list
  // includes the peer, and leaving then rejoining restores the local room.
  ciTest(
    'RN-ROOM-003',
    'join a room, read its detail and members, then rejoin',
    async () => {
      const room = await prepareRoom(ctx, 'RN-ROOM-003');
      const info = await withCiTimeout(
        manager.fetchChatRoomInfoFromServer(room.id),
        30000,
        'fetch room detail'
      );
      assertNotNull(info, 'server room detail is missing');
      assertEqual(info.roomId, room.id);
      assertEqual(info.roomName, room.name);
      assertEqual(info.owner, room.userId);

      const local = await waitForCi(
        'local room cache contains the joined room',
        () => manager.getChatRoomWithId(room.id),
        (value) => value != null
      );
      assertNotNull(local, 'local room cache is missing after joining');
      assertEqual(local.roomId, room.id);

      const members = await manager.fetchChatRoomMembers(room.id);
      assertNotNull(members.list, 'room member page has no list');
      assertTrue(
        members.list.includes(room.peerId),
        'prepared peer is missing from the room member list'
      );

      await withCiTimeout(
        manager.leaveChatRoom(room.id),
        15000,
        'leave room before rejoining'
      );
      await withCiTimeout(
        manager.joinChatRoomEx({ roomId: room.id }),
        30000,
        'rejoin room'
      );
      const rejoined = await waitForCi(
        'local room cache is restored after rejoining',
        () => manager.getChatRoomWithId(room.id),
        (value) => value != null
      );
      assertNotNull(rejoined, 'local room cache is missing after rejoining');
      assertEqual(rejoined.roomId, room.id);
    },
    { timeoutMs: 120000 }
  );

  // Test: As the room owner, write one announcement, read it, replace it with
  // a newer one, and read again.
  // Expected: Each fetch returns the most recently written announcement; the
  // second write replaces the first instead of appending.
  ciTest(
    'RN-ROOM-004',
    'update and fetch the room announcement',
    async () => {
      const room = await prepareRoom(ctx, 'RN-ROOM-004');
      const first = `announcement one ${room.name}`;
      const second = `announcement two ${room.name}`;
      await manager.updateChatRoomAnnouncement(room.id, first);
      assertEqual(await manager.fetchChatRoomAnnouncement(room.id), first);
      await manager.updateChatRoomAnnouncement(room.id, second);
      assertEqual(await manager.fetchChatRoomAnnouncement(room.id), second);
    },
    { timeoutMs: 120000 }
  );

  // Test: Use one room to remove the peer and another to block and unblock the
  // peer, so a block-induced membership change cannot mask the removal check.
  // Expected: Removal drops the peer from the member list without changing the
  // owner; blocking adds the peer to the blocklist and unblocking removes it.
  ciTest(
    'RN-ROOM-005',
    'remove a member and manage the room blocklist',
    async () => {
      const removal = await prepareRoom(ctx, 'RN-ROOM-005a');
      const before = await manager.fetchChatRoomMembers(removal.id);
      assertNotNull(before.list, 'room member page has no list');
      assertTrue(
        before.list.includes(removal.peerId),
        'prepared peer is missing before removal'
      );
      await manager.removeChatRoomMembers(removal.id, [removal.peerId]);
      const after = await manager.fetchChatRoomMembers(removal.id);
      assertNotNull(after.list, 'room member page has no list after removal');
      assertTrue(
        !after.list.includes(removal.peerId),
        'removed peer is still in the room member list'
      );
      const info = await manager.fetchChatRoomInfoFromServer(removal.id);
      assertNotNull(info, 'server room detail is missing after removal');
      assertEqual(info.owner, removal.userId);

      const blocking = await prepareRoom(ctx, 'RN-ROOM-005b');
      assertTrue(
        !(await manager.fetchChatRoomBlockList(blocking.id)).includes(
          blocking.peerId
        ),
        'peer was already on the room blocklist'
      );
      await manager.blockChatRoomMembers(blocking.id, [blocking.peerId]);
      assertTrue(
        (await manager.fetchChatRoomBlockList(blocking.id)).includes(
          blocking.peerId
        ),
        'blocked peer is missing from the room blocklist'
      );
      await manager.unBlockChatRoomMembers(blocking.id, [blocking.peerId]);
      assertTrue(
        !(await manager.fetchChatRoomBlockList(blocking.id)).includes(
          blocking.peerId
        ),
        'unblocked peer remains on the room blocklist'
      );
    },
    { timeoutMs: 180000 }
  );

  // Test: In a fresh room, mute and unmute the peer, then mute and unmute all
  // members, reading the mute list and server detail after each step.
  // Expected: The mute list contains the peer only while muted; the room-level
  // isAllMemberMuted flag follows the mute-all calls.
  ciTest(
    'RN-ROOM-006',
    'mute a member and all room members',
    async () => {
      const room = await prepareRoom(ctx, 'RN-ROOM-006');
      await manager.muteChatRoomMembers(room.id, [room.peerId], 600000);
      assertTrue(
        (await manager.fetchChatRoomMuteList(room.id)).includes(room.peerId),
        'muted peer is missing from the room mute list'
      );
      await manager.unMuteChatRoomMembers(room.id, [room.peerId]);
      assertTrue(
        !(await manager.fetchChatRoomMuteList(room.id)).includes(room.peerId),
        'unmuted peer remains on the room mute list'
      );
      const beforeMuteAll = await manager.fetchChatRoomInfoFromServer(room.id);
      assertNotNull(beforeMuteAll, 'server room detail is missing');
      assertEqual(beforeMuteAll.isAllMemberMuted, false);

      await manager.muteAllChatRoomMembers(room.id);
      const mutedAll = await manager.fetchChatRoomInfoFromServer(room.id);
      assertNotNull(mutedAll, 'server room detail is missing after mute-all');
      assertEqual(mutedAll.isAllMemberMuted, true);

      await manager.unMuteAllChatRoomMembers(room.id);
      const unmutedAll = await manager.fetchChatRoomInfoFromServer(room.id);
      assertNotNull(
        unmutedAll,
        'server room detail is missing after unmute-all'
      );
      assertEqual(unmutedAll.isAllMemberMuted, false);
    },
    { timeoutMs: 120000 }
  );

  // Test: As the room owner, promote the peer to admin, read the server detail,
  // then demote it and read again.
  // Expected: adminList contains the peer only while promoted; membership and
  // ownership stay unchanged.
  ciTest(
    'RN-ROOM-007',
    'promote and demote a room admin',
    async () => {
      const room = await prepareRoom(ctx, 'RN-ROOM-007');
      const initial = await manager.fetchChatRoomInfoFromServer(room.id);
      assertNotNull(initial, 'server room detail is missing');
      assertTrue(
        !(initial.adminList ?? []).includes(room.peerId),
        'peer was already a room admin'
      );
      assertEqual(initial.owner, room.userId);

      await manager.addChatRoomAdmin(room.id, room.peerId);
      const promoted = await manager.fetchChatRoomInfoFromServer(room.id);
      assertNotNull(promoted, 'server room detail is missing after promotion');
      assertTrue(
        (promoted.adminList ?? []).includes(room.peerId),
        'promoted peer is missing from adminList'
      );
      assertEqual(promoted.owner, room.userId);

      await manager.removeChatRoomAdmin(room.id, room.peerId);
      const demoted = await manager.fetchChatRoomInfoFromServer(room.id);
      assertNotNull(demoted, 'server room detail is missing after demotion');
      assertTrue(
        !(demoted.adminList ?? []).includes(room.peerId),
        'demoted peer remains in adminList'
      );
      assertEqual(demoted.owner, room.userId);
    },
    { timeoutMs: 120000 }
  );
}

/** No-login chat room negative cases (`logged_out` entry). */
export function registerRoomLoggedOutCases(ctx: CiCaseContext): void {
  // Unauthenticated fetchPublicChatRoomsFromServer (pageNum 1, pageSize 20)
  // must throw errorCode 201.
  ciTest(
    'RN-ROOM-002',
    'fetchPublicChatRoomsFromServer while logged out throws 201',
    async () => {
      await expectCiError(
        () => ctx.client.roomManager.fetchPublicChatRoomsFromServer(1, 20),
        201
      );
    }
  );
}
