/**
 * ROOM domain CI cases (`RN-ROOM-*`): chat room APIs.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerRoomCases` is wired into the
 * `logged_in_base` entry; `registerRoomLoggedOutCases` collects the
 * no-login negative cases for the `logged_out` entry.
 */

import { ciTest, type CiCaseContext } from '../harness';
import {
  assertEqual,
  assertNotNull,
  assertTrue,
  expectCiError,
} from '../support/expect';

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
}

/** No-login chat room negative cases (`logged_out` entry). */
export function registerRoomLoggedOutCases(ctx: CiCaseContext): void {
  // Mirrors no_login_smoke.json room.fetchPublicChatRoomsFromServer
  // (pageNum 1, pageSize 20; errorCode 201).
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
