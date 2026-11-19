/**
 * AUTH domain CI cases (`RN-AUTH-*`): login readiness, token renewal and
 * other authentication behavior.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerAuthCases` is wired into the
 * `logged_in_base` entry; `registerAuthLoggedOutCases` collects the
 * no-login negative cases for the `logged_out` entry.
 */

import { ciTest, type CiCaseContext } from '../harness';
import { assertEqual } from '../support/expect';

/** The logged-in account, required by every logged-in case. */
function requireAccountId(ctx: CiCaseContext): string {
  const userId = ctx.config.accounts?.[0]?.id;
  if (userId == null || userId.length === 0) {
    throw new Error('ci_run.json: config.accounts[0].id is required');
  }
  return userId;
}

/** Logged-in authentication cases (`logged_in_base` entry). */
export function registerAuthCases(ctx: CiCaseContext): void {
  // Test: Read the client state after the entry logged in the configured
  // account. Expected: the cached current user matches
  // config.accounts[0].id and the connection is active (the entry's
  // beforeAll already proved readiness through loginForCi).
  ciTest(
    'RN-AUTH-001',
    'login ready: current user matches the configured account, connected',
    async () => {
      assertEqual(ctx.client.currentUserName, requireAccountId(ctx));
      assertEqual(await ctx.client.isConnected(), true);
    }
  );
}

/** No-login authentication negative cases (`logged_out` entry). */
export function registerAuthLoggedOutCases(_ctx: CiCaseContext): void {
  // No cases registered yet: no auth API has a no-login expectation to pin.
}
