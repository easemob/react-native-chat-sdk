/**
 * USERINFO domain CI cases (`RN-USERINFO-*`): user profile APIs.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerUserInfoCases` is wired into
 * the `logged_in_user_info` entry (`enableUserInfo: true`);
 * `registerUserInfoLoggedOutCases` collects the no-login negative cases
 * for the `logged_out` entry.
 */

import { ciTest, type CiCaseContext } from '../harness';
import {
  assertEqual,
  assertNotNull,
  assertTrue,
  expectCiError,
} from '../support/expect';

/** The logged-in account, required by every logged-in case. */
function requireAccountId(ctx: CiCaseContext): string {
  const userId = ctx.config.accounts?.[0]?.id;
  if (userId == null || userId.length === 0) {
    throw new Error('ci_run.json: config.accounts[0].id is required');
  }
  return userId;
}

/** Logged-in user info cases (`logged_in_user_info` entry). */
export function registerUserInfoCases(ctx: CiCaseContext): void {
  // Test: Fetch the logged-in account's own user info in the
  // enableUserInfo entry. Expected: a complete structure whose userId is
  // present and matches the configured account.
  ciTest(
    'RN-USERINFO-001',
    'fetchOwnInfo returns the complete own user info',
    async () => {
      const userId = requireAccountId(ctx);
      const info = await ctx.client.userManager.fetchOwnInfo();
      assertNotNull(info, 'fetchOwnInfo must return the current user info');
      assertEqual(info.userId, userId);
    }
  );

  // Test: Fetch the subscribed user list, mirroring single_account.json
  // userInfo.fetchSubscribedUsers. Expected: a successful read-only fetch
  // with a list shape; no specific data is asserted.
  ciTest(
    'RN-USERINFO-002',
    'fetchSubscribedUsers returns a user info list',
    async () => {
      const users = await ctx.client.userManager.fetchSubscribedUsers();
      assertTrue(
        Array.isArray(users),
        'fetchSubscribedUsers must resolve to a list'
      );
      for (const user of users) {
        assertTrue(user.userId.length > 0, 'a user info needs a userId');
      }
    }
  );
}

/** No-login user info negative cases (`logged_out` entry). */
export function registerUserInfoLoggedOutCases(ctx: CiCaseContext): void {
  // Unauthenticated fetchSubscribedUsers must throw errorCode 201.
  ciTest(
    'RN-USERINFO-003',
    'fetchSubscribedUsers while logged out throws 201',
    async () => {
      await expectCiError(
        () => ctx.client.userManager.fetchSubscribedUsers(),
        201
      );
    }
  );
}
