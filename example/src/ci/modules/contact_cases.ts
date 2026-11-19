/**
 * CONTACT domain CI cases (`RN-CONTACT-*`): contact APIs.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerContactCases` is wired into
 * the `logged_in_contact` entry (contact sync enabled);
 * `registerContactLoggedOutCases` collects the no-login negative cases for
 * the `logged_out` entry.
 */

import { addTearDown, ciTest, type CiCaseContext } from '../harness';
import { assertEqual, expectCiError } from '../support/expect';
import { loginForCi } from '../support/login';
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

/**
 * The contact peer: the second configured account when available, otherwise
 * `config.peerId`; it must differ from the logged-in account (mirrors the
 * Flutter seed, which requires a distinct peer).
 */
function requirePeer(ctx: CiCaseContext, userId: string): string {
  const peer = ctx.config.accounts?.[1]?.id ?? ctx.config.peerId;
  if (peer == null || peer.length === 0 || peer === userId) {
    throw new Error(
      'ci_run.json: contact cases need a peer (config.accounts[1].id or ' +
        'config.peerId) different from config.accounts[0].id'
    );
  }
  return peer;
}

/** Logged-in contact cases (`logged_in_contact` entry). */
export function registerContactCases(ctx: CiCaseContext): void {
  // Test: Snapshot both accounts' contact lists through REST, add the
  // friendship through REST, re-login so the Contacts data sync refreshes
  // the local contact list (getAllContacts reads the local database; the
  // Flutter seed syncs REST-side changes the same way), then prove the SDK
  // list contains the peer exactly once. Cleanup restores the snapshot;
  // the body restores it too.
  ciTest(
    'RN-CONTACT-001',
    'REST-added contact appears in the SDK contact list, snapshot restored',
    async () => {
      const { userId, token } = requireLogin(ctx);
      const peer = requirePeer(ctx, userId);
      const snapshot = await ctx.rest.snapshotContacts(userId, peer);
      addTearDown(() => ctx.rest.restoreContacts(userId, peer, snapshot));

      await ctx.rest.setContacts(userId, peer, true);
      await ctx.client.logout(false);
      await loginForCi(ctx.client, userId, token);
      const contacts = await waitForCi(
        `SDK contact list contains ${peer}`,
        () => ctx.client.contactManager.getAllContacts(),
        (list) => list.some((contact) => contact.userId === peer)
      );
      assertEqual(
        contacts.filter((contact) => contact.userId === peer).length,
        1,
        `the SDK contact list must contain ${peer} exactly once`
      );

      await ctx.rest.restoreContacts(userId, peer, snapshot);
    }
  );
}

/** No-login contact negative cases (`logged_out` entry). */
export function registerContactLoggedOutCases(ctx: CiCaseContext): void {
  // Unauthenticated addContact (userId "rn-ci-nonexistent-user",
  // reason "rn-ci") must throw errorCode 201.
  ciTest(
    'RN-CONTACT-002',
    'addContact while logged out throws 201',
    async () => {
      await expectCiError(
        () =>
          ctx.client.contactManager.addContact(
            'rn-ci-nonexistent-user',
            'rn-ci'
          ),
        201
      );
    }
  );
}
