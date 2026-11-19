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

import { ChatContact } from 'react-native-chat-sdk';

import { addTearDown, ciTest, type CiCaseContext } from '../harness';
import {
  assertEqual,
  assertNotNull,
  assertNull,
  assertTrue,
  expectCiError,
} from '../support/expect';
import { loginForCi } from '../support/login';
import { uniqueCiName } from '../support/unique';
import { waitForCi, withCiTimeout } from '../support/wait_for';

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

function sameStringSet(actual: string[], expected: string[]): boolean {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  return (
    actualSet.size === expectedSet.size &&
    [...actualSet].every((value) => expectedSet.has(value))
  );
}

/** Reads the local blocklist, normalizing an empty native response to []. */
async function readLocalBlocklist(ctx: CiCaseContext): Promise<string[]> {
  const ids: string[] | null | undefined =
    await ctx.client.contactManager.getBlockListFromDB();
  return ids ?? [];
}

/** Waits until both local contact views agree on the peer's presence. */
async function observeContactRelation(
  ctx: CiCaseContext,
  peer: string,
  present: boolean
): Promise<void> {
  await waitForCi(
    `SDK contact lists contain ${peer} = ${present}`,
    async () => {
      const ids = await ctx.client.contactManager.getAllContactsFromDB();
      const records = await ctx.client.contactManager.getAllContacts();
      return [
        ids.includes(peer),
        records.some((contact) => contact.userId === peer),
      ];
    },
    (values) => values.every((value) => value === present)
  );
}

/** Re-logs in so the Contacts data sync refreshes the local contact list. */
async function reloadContactRelation(
  ctx: CiCaseContext,
  userId: string,
  token: string,
  peer: string,
  present: boolean
): Promise<void> {
  await withCiTimeout(
    ctx.client.logout(false),
    30 * 1000,
    'logout before contact resync'
  );
  await loginForCi(ctx.client, userId, token);
  await observeContactRelation(ctx, peer, present);
}

/**
 * Captures the friendship and both accounts' blocklists, clears the
 * peer-related block entries, and registers independent restoration
 * callbacks (blocklists first, then the friendship).
 */
async function prepareContactRelation(
  ctx: CiCaseContext,
  userId: string,
  token: string,
  peer: string,
  syncLocalOnRestore: boolean = true
): Promise<void> {
  const snapshot = await ctx.rest.snapshotContacts(userId, peer);
  const userBlocks = await ctx.rest.blockIds(userId);
  const peerBlocks = await ctx.rest.blockIds(peer);
  // Register separate callbacks so one cleanup failure cannot prevent another.
  addTearDown(async () => {
    await ctx.rest.setBlocked(userId, peer, userBlocks.includes(peer));
    assertTrue(
      sameStringSet(await ctx.rest.blockIds(userId), userBlocks),
      `blocklist restoration differs from the original for ${userId}`
    );
    const fetched = await ctx.client.contactManager.getBlockListFromServer();
    assertTrue(
      sameStringSet(fetched, userBlocks),
      `SDK server blocklist differs from the original for ${userId}`
    );
  });
  addTearDown(async () => {
    await ctx.rest.setBlocked(peer, userId, peerBlocks.includes(userId));
    assertTrue(
      sameStringSet(await ctx.rest.blockIds(peer), peerBlocks),
      `blocklist restoration differs from the original for ${peer}`
    );
  });
  addTearDown(async () => {
    await ctx.rest.restoreContacts(userId, peer, snapshot);
    if (syncLocalOnRestore) {
      await reloadContactRelation(
        ctx,
        userId,
        token,
        peer,
        snapshot.userIds.includes(peer)
      );
    }
  });
  await ctx.rest.setBlocked(userId, peer, false);
  await ctx.rest.setBlocked(peer, userId, false);
  await ctx.client.contactManager.getBlockListFromServer();
}

/** Deletes a prepared friend; the local roster is not asserted afterwards. */
async function deletePreparedContact(
  ctx: CiCaseContext,
  keepConversation: boolean
): Promise<void> {
  const { userId, token } = requireLogin(ctx);
  const peer = requirePeer(ctx, userId);
  await prepareContactRelation(ctx, userId, token, peer, false);
  await ctx.rest.setContacts(userId, peer, true);
  await withCiTimeout(
    ctx.client.contactManager.deleteContact(peer, keepConversation),
    30 * 1000,
    `deleteContact keepConversation=${keepConversation}`
  );
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

  // Test: Delete a prepared friend with keepConversation=true (RN-CONTACT-003)
  // or false (RN-CONTACT-004), then restore the friendship and blocklists.
  // Expected: deleteContact completes successfully within 30 seconds. The
  // local roster and conversation state are deliberately not asserted.
  ciTest(
    'RN-CONTACT-003',
    'deleteContact with keepConversation=true succeeds',
    async () => {
      await deletePreparedContact(ctx, true);
    }
  );

  ciTest(
    'RN-CONTACT-004',
    'deleteContact with keepConversation=false succeeds',
    async () => {
      await deletePreparedContact(ctx, false);
    }
  );

  // Test: Start with the peer unblocked, add it to the blocklist, then remove
  // it. Expected: REST, the server fetch, and the local blocklist all match
  // the exact member set after each operation, preserving unrelated entries.
  // Cleanup restores and verifies the original blocklist.
  ciTest(
    'RN-CONTACT-005',
    'blocklist add, query, and remove preserve unrelated entries',
    async () => {
      const { userId } = requireLogin(ctx);
      const peer = requirePeer(ctx, userId);
      const original = await ctx.rest.blockIds(userId);
      const withoutPeer = original.filter((value) => value !== peer);
      addTearDown(async () => {
        // The REST write only changes server state; drive the SDK operation as
        // well so the local blocklist is restored when the body left it dirty.
        const originalHasPeer = original.includes(peer);
        const local = await readLocalBlocklist(ctx);
        try {
          if (local.includes(peer) !== originalHasPeer) {
            if (originalHasPeer) {
              await ctx.client.contactManager.addUserToBlockList(peer);
            } else {
              await ctx.client.contactManager.removeUserFromBlockList(peer);
            }
          }
        } finally {
          // The REST write is the authoritative server-side cleanup even if
          // the SDK call above failed.
          await ctx.rest.setBlocked(userId, peer, originalHasPeer);
        }
        assertTrue(
          sameStringSet(await ctx.rest.blockIds(userId), original),
          `REST blocklist restoration differs from the original for ${userId}`
        );
        const fetched =
          (await ctx.client.contactManager.getBlockListFromServer()) ?? [];
        assertTrue(
          sameStringSet(fetched, original),
          `SDK server blocklist differs from the original for ${userId}`
        );
        await waitForCi(
          'SDK local blocklist restored',
          () => readLocalBlocklist(ctx),
          (ids) => sameStringSet(ids, original),
          20 * 1000
        );
      });

      await ctx.rest.setBlocked(userId, peer, false);
      const prepared =
        (await ctx.client.contactManager.getBlockListFromServer()) ?? [];
      assertTrue(
        sameStringSet(prepared, withoutPeer),
        `target must be absent from the SDK blocklist: ${prepared.join(',')}`
      );

      const verify = async (expected: string[]): Promise<void> => {
        await waitForCi(
          'REST blocklist has the exact expected members',
          () => ctx.rest.blockIds(userId),
          (ids) => sameStringSet(ids, expected),
          20 * 1000
        );
        const fetched =
          (await ctx.client.contactManager.getBlockListFromServer()) ?? [];
        assertTrue(
          sameStringSet(fetched, expected),
          `SDK server blocklist mismatch: expected ${expected.join(
            ','
          )}, got ${fetched.join(',')}`
        );
        const local = await waitForCi(
          'SDK local blocklist has the exact expected members',
          () => readLocalBlocklist(ctx),
          (ids) => sameStringSet(ids, expected),
          20 * 1000
        );
        assertTrue(
          sameStringSet(local, expected),
          `SDK local blocklist mismatch: expected ${expected.join(
            ','
          )}, got ${local.join(',')}`
        );
      };

      await ctx.client.contactManager.addUserToBlockList(peer);
      await verify([...withoutPeer, peer]);
      await ctx.client.contactManager.removeUserFromBlockList(peer);
      await verify(withoutPeer);
    }
  );

  // Test: Query a user ID that cannot exist in the local contact database.
  // Expected: the ID is absent from the local ID list and the contact records,
  // getContact resolves without a contact, and the lists stay unchanged.
  ciTest(
    'RN-CONTACT-011',
    'a missing contact ID is absent from every local contact view',
    async () => {
      const absent = uniqueCiName('contact', 'absent');
      const ids = await ctx.client.contactManager.getAllContactsFromDB();
      assertEqual(
        ids.includes(absent),
        false,
        `missing contact ${absent} must be absent from the ID list`
      );
      const records = await ctx.client.contactManager.getAllContacts();
      assertEqual(
        records.some((contact) => contact.userId === absent),
        false,
        `missing contact ${absent} must be absent from the contact records`
      );
      assertNull(
        await ctx.client.contactManager.getContact(absent),
        `getContact(${absent}) must resolve without a contact`
      );
      const idsAfter = await ctx.client.contactManager.getAllContactsFromDB();
      assertEqual(idsAfter.includes(absent), false);
      const recordsAfter = await ctx.client.contactManager.getAllContacts();
      assertEqual(
        recordsAfter.some((contact) => contact.userId === absent),
        false
      );
    }
  );

  // Test: Prepare a friend, read its original remark, write a unique remark,
  // and verify both the contact detail and the contact list. Cleanup restores
  // the original remark before the friendship restoration callbacks run.
  ciTest(
    'RN-CONTACT-012',
    'contact remark is written and read back from detail and list',
    async () => {
      const { userId, token } = requireLogin(ctx);
      const peer = requirePeer(ctx, userId);
      await prepareContactRelation(ctx, userId, token, peer);
      await ctx.rest.setContacts(userId, peer, true);
      await reloadContactRelation(ctx, userId, token, peer, true);

      const original = await withCiTimeout(
        ctx.client.contactManager.getContact(peer),
        20 * 1000,
        'read the original contact remark'
      );
      assertNotNull(original, `contact ${peer} must exist after sync`);
      const originalRemark = original.remark ?? '';

      const verifyRemark = async (expected: string): Promise<void> => {
        const detail = await waitForCi(
          `contact ${peer} detail has the expected remark`,
          () => ctx.client.contactManager.getContact(peer),
          (contact) => contact?.userId === peer && contact.remark === expected,
          20 * 1000
        );
        assertEqual(detail?.remark, expected);
        const records = await waitForCi(
          `contact ${peer} list has the expected remark`,
          () => ctx.client.contactManager.getAllContacts(),
          (list) =>
            list.some(
              (contact) =>
                contact.userId === peer && contact.remark === expected
            ),
          20 * 1000
        );
        assertEqual(
          records.filter((contact) => contact.userId === peer).length,
          1
        );
        const record = records.find((contact) => contact.userId === peer);
        assertNotNull(record);
        assertEqual(record.remark, expected);
      };

      addTearDown(async () => {
        await withCiTimeout(
          ctx.client.contactManager.setContactRemark(
            new ChatContact({ userId: peer, remark: originalRemark })
          ),
          20 * 1000,
          'restore the original contact remark'
        );
        await verifyRemark(originalRemark);
      });

      const remark = uniqueCiName('contact', 'remark');
      await withCiTimeout(
        ctx.client.contactManager.setContactRemark(
          new ChatContact({ userId: peer, remark })
        ),
        20 * 1000,
        'set the contact remark'
      );
      await verifyRemark(remark);
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

  // Unauthenticated deleteContact with keepConversation=true must throw
  // errorCode 201.
  ciTest(
    'RN-CONTACT-006',
    'deleteContact with keepConversation=true while logged out throws 201',
    async () => {
      await expectCiError(
        () =>
          ctx.client.contactManager.deleteContact(
            'rn-ci-nonexistent-user',
            true
          ),
        201
      );
    }
  );

  // Unauthenticated deleteContact with keepConversation=false must throw
  // errorCode 201.
  ciTest(
    'RN-CONTACT-007',
    'deleteContact with keepConversation=false while logged out throws 201',
    async () => {
      await expectCiError(
        () =>
          ctx.client.contactManager.deleteContact(
            'rn-ci-nonexistent-user',
            false
          ),
        201
      );
    }
  );

  // Unauthenticated addUserToBlockList must throw errorCode 201.
  ciTest(
    'RN-CONTACT-008',
    'addUserToBlockList while logged out throws 201',
    async () => {
      await expectCiError(
        () =>
          ctx.client.contactManager.addUserToBlockList(
            'rn-ci-nonexistent-user'
          ),
        201
      );
    }
  );

  // Unauthenticated removeUserFromBlockList must throw errorCode 201.
  ciTest(
    'RN-CONTACT-009',
    'removeUserFromBlockList while logged out throws 201',
    async () => {
      await expectCiError(
        () =>
          ctx.client.contactManager.removeUserFromBlockList(
            'rn-ci-nonexistent-user'
          ),
        201
      );
    }
  );

  // Unauthenticated getBlockListFromServer must throw errorCode 201. The
  // Flutter case calls the same native fetch API (fetchBlockIds).
  ciTest(
    'RN-CONTACT-010',
    'getBlockListFromServer while logged out throws 201',
    async () => {
      await expectCiError(
        () => ctx.client.contactManager.getBlockListFromServer(),
        201
      );
    }
  );
}
