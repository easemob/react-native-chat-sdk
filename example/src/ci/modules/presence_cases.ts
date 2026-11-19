/**
 * PRESENCE domain CI cases (`RN-PRESENCE-*`): presence publish/subscribe
 * APIs.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerPresenceCases` is wired into
 * the `logged_in_base` entry; `registerPresenceLoggedOutCases` collects
 * the no-login negative cases for the `logged_out` entry.
 */

import { ciTest, type CiCaseContext } from '../harness';
import { assertEqual, assertTrue, expectCiError } from '../support/expect';

/** The logged-in account, required by every logged-in case. */
function requireAccountId(ctx: CiCaseContext): string {
  const userId = ctx.config.accounts?.[0]?.id;
  if (userId == null || userId.length === 0) {
    throw new Error('ci_run.json: config.accounts[0].id is required');
  }
  return userId;
}

/** Logged-in presence cases (`logged_in_base` entry). */
export function registerPresenceCases(ctx: CiCaseContext): void {
  // Test: Fetch the presence status of the configured account, mirroring
  // single_account.json presence.fetchPresenceStatus (userIds
  // [$config.accounts.0.id]). Expected: a successful read-only fetch with a
  // list shape; every returned presence belongs to the requested account.
  ciTest(
    'RN-PRESENCE-001',
    'fetchPresenceStatus for the configured account succeeds',
    async () => {
      const userId = requireAccountId(ctx);
      const list = await ctx.client.presenceManager.fetchPresenceStatus([
        userId,
      ]);
      assertTrue(
        Array.isArray(list),
        'fetchPresenceStatus must resolve to a list'
      );
      for (const presence of list) {
        assertEqual(presence.publisher, userId);
      }
    }
  );
}

/** No-login presence negative cases (`logged_out` entry). */
export function registerPresenceLoggedOutCases(ctx: CiCaseContext): void {
  // Unauthenticated publishPresence (description "rn-ci") must throw
  // errorCode 201.
  ciTest(
    'RN-PRESENCE-002',
    'publishPresence while logged out throws 201',
    async () => {
      await expectCiError(
        () => ctx.client.presenceManager.publishPresence('rn-ci'),
        201
      );
    }
  );
}
