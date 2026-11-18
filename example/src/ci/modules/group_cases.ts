/**
 * GROUP domain CI cases (`RN-GROUP-*`): group APIs.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerGroupCases` is wired into
 * the `logged_in_group` entry (joined-group sync enabled);
 * `registerGroupLoggedOutCases` collects the no-login negative cases for
 * the `logged_out` entry.
 */

import { addTearDown, ciTest, type CiCaseContext } from '../harness';
import { assertEqual, assertNotNull, assertTrue } from '../support/expect';
import { loginForCi } from '../support/login';
import { uniqueCiName } from '../support/unique';
import { waitForCi } from '../support/wait_for';

/** The logged-in account and its token, required by every logged-in case. */
function requireLogin(ctx: CiCaseContext): { userId: string; token: string } {
  const account = ctx.config.accounts?.[0];
  const token = ctx.config.loginToken ?? account?.token;
  if (account == null || account.id.length === 0 || token == null) {
    throw new Error(
      'ci_run.json: config.accounts[0].id and a token ' +
        '(config.loginToken or config.accounts[0].token) are required'
    );
  }
  return { userId: account.id, token };
}

/** Logged-in group cases (`logged_in_group` entry). */
export function registerGroupCases(ctx: CiCaseContext): void {
  // Test: Create a group through REST owned by the logged-in account, prove
  // the SDK fetches it by id, re-login so the JoinedGroups data sync
  // refreshes the local joined-group list (getJoinedGroups reads the local
  // database; REST-side changes reach it only through a fresh sync, the
  // same pattern as the Flutter contact seed), then delete it through REST
  // and prove absence with 404 semantics. Cleanup deletes the group and
  // verifies absence when the body fails midway.
  ciTest(
    'RN-GROUP-001',
    'REST-created group is fetched by the SDK and deleted with 404 proof',
    async () => {
      const { userId, token } = requireLogin(ctx);
      const name = uniqueCiName('group', 'seed');
      const description = `CI seed group ${name}`;
      let groupId: string | null = null;
      addTearDown(async () => {
        if (groupId != null) {
          await ctx.rest.deleteGroup(groupId);
          await ctx.rest.verifyGroupAbsent(groupId);
        }
      });

      groupId = await ctx.rest.createGroup({
        owner: userId,
        name,
        description,
      });

      const group =
        await ctx.client.groupManager.fetchGroupInfoWithoutMembersFromServer(
          groupId
        );
      assertNotNull(group, 'the SDK must fetch the REST-created group by id');
      assertEqual(group.groupId, groupId);
      assertEqual(group.groupName, name);
      assertEqual(group.description, description);
      assertEqual(group.owner, userId);

      await ctx.client.logout(false);
      await loginForCi(ctx.client, userId, token);
      await waitForCi(
        'SDK joined groups contain the created group',
        () => ctx.client.groupManager.getJoinedGroups(),
        (groups) => groups.some((g) => g.groupId === groupId)
      );

      await ctx.rest.deleteGroup(groupId);
      await ctx.rest.verifyGroupAbsent(groupId);
      groupId = null;
    }
  );
}

/** No-login group negative cases (`logged_out` entry). */
export function registerGroupLoggedOutCases(ctx: CiCaseContext): void {
  // Mirrors no_login_smoke.json group.getJoinedGroups, which expects
  // success (the local-database read works without a login), not error 201.
  ciTest(
    'RN-GROUP-002',
    'getJoinedGroups while logged out resolves with a list',
    async () => {
      const groups = await ctx.client.groupManager.getJoinedGroups();
      assertTrue(
        Array.isArray(groups),
        'getJoinedGroups must resolve to a list'
      );
    }
  );
}
