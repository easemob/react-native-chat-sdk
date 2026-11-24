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

import type { ChatPresence } from 'react-native-chat-sdk';

import { addTearDown, ciTest, type CiCaseContext } from '../harness';
import {
  assertEqual,
  assertNotNull,
  assertTrue,
  expectCiError,
} from '../support/expect';
import { uniqueCiName } from '../support/unique';
import { waitForCi, withCiTimeout } from '../support/wait_for';

/** The logged-in account, required by every logged-in case. */
function requireAccountId(ctx: CiCaseContext): string {
  const userId = ctx.config.accounts?.[0]?.id;
  if (userId == null || userId.length === 0) {
    throw new Error('ci_run.json: config.accounts[0].id is required');
  }
  return userId;
}

/**
 * The offline presence peer: the second configured account when available,
 * otherwise `config.peerId`; it must differ from the logged-in account.
 */
function requirePeer(ctx: CiCaseContext, userId: string): string {
  const peer = ctx.config.accounts?.[1]?.id ?? ctx.config.peerId;
  if (peer == null || peer.length === 0 || peer === userId) {
    throw new Error(
      'ci_run.json: presence cases need a peer (config.accounts[1].id or ' +
        'config.peerId) different from config.accounts[0].id'
    );
  }
  return peer;
}

/** Reads exactly one presence for the account and returns it. */
async function fetchOwnPresence(
  ctx: CiCaseContext,
  userId: string
): Promise<ChatPresence> {
  const presences = await withCiTimeout(
    ctx.client.presenceManager.fetchPresenceStatus([userId]),
    20 * 1000,
    'fetch own presence'
  );
  assertEqual(presences.length, 1, `expected one presence for ${userId}`);
  const presence = presences[0];
  assertNotNull(presence);
  assertEqual(presence.publisher, userId);
  return presence;
}

async function expectOwnDescription(
  ctx: CiCaseContext,
  userId: string,
  description: string
): Promise<void> {
  const presence = await waitForCi(
    `own presence description is ${description}`,
    () => fetchOwnPresence(ctx, userId),
    (value) => value.statusDescription === description,
    20 * 1000
  );
  assertEqual(presence.statusDescription, description);
}

/**
 * Reads the complete paged subscription list, rejecting duplicate IDs and
 * bounding pagination in case a faulty implementation ignores `pageNum`.
 */
async function readSubscribedMembers(ctx: CiCaseContext): Promise<string[]> {
  const manager = ctx.client.presenceManager;
  const ids: string[] = [];
  for (let pageNum = 1; pageNum <= 50; pageNum++) {
    const page =
      (await withCiTimeout(
        manager.fetchSubscribedMembers(pageNum, 100),
        10 * 1000,
        `fetchSubscribedMembers page ${pageNum}`
      )) ?? [];
    assertTrue(
      page.length <= 100,
      `presence subscription page ${pageNum} exceeds the page size`
    );
    ids.push(...page);
    assertEqual(
      new Set(ids).size,
      ids.length,
      'presence subscription pages must not duplicate user IDs'
    );
    if (page.length < 100) {
      return ids;
    }
  }
  throw new Error(
    'presence subscription list exceeded the CI pagination bound'
  );
}

async function expectSubscription(
  ctx: CiCaseContext,
  peer: string,
  present: boolean
): Promise<void> {
  const ids = await waitForCi(
    `presence subscription contains ${peer} = ${present}`,
    () => readSubscribedMembers(ctx),
    (list) => list.includes(peer) === present,
    20 * 1000
  );
  assertEqual(
    ids.filter((id) => id === peer).length,
    present ? 1 : 0,
    `presence subscription must contain ${peer} ${
      present ? 'once' : 'zero times'
    }`
  );
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

  // Test: Snapshot our own presence description, publish a unique value, and
  // fetch it. Expected: the returned publisher and description match; cleanup
  // restores the original description. Delivery to another client is not
  // asserted.
  ciTest(
    'RN-PRESENCE-007',
    'published own description is returned by the presence status fetch',
    async () => {
      const userId = requireAccountId(ctx);
      const original = await fetchOwnPresence(ctx, userId);
      addTearDown(async () => {
        await withCiTimeout(
          ctx.client.presenceManager.publishPresence(
            original.statusDescription
          ),
          20 * 1000,
          'restore own presence description'
        );
        await expectOwnDescription(ctx, userId, original.statusDescription);
      });

      const description = uniqueCiName('presence', 'desc');
      await withCiTimeout(
        ctx.client.presenceManager.publishPresence(description),
        20 * 1000,
        'publish own presence description'
      );
      await expectOwnDescription(ctx, userId, description);
    }
  );

  // Test: Subscribe to the configured offline peer, query the complete paged
  // subscription list, then unsubscribe and query again. No second logged-in
  // client is needed. The RN fixture has no user-creation helper, so a
  // leftover subscription for the provisioned peer is cleared first.
  ciTest(
    'RN-PRESENCE-008',
    'subscription list includes and removes the configured offline peer',
    async () => {
      const userId = requireAccountId(ctx);
      const peer = requirePeer(ctx, userId);
      let subscribed = false;
      addTearDown(async () => {
        if (!subscribed) {
          return;
        }
        await withCiTimeout(
          ctx.client.presenceManager.unsubscribe([peer]),
          20 * 1000,
          'unsubscribe the presence peer during cleanup'
        );
        await expectSubscription(ctx, peer, false);
      });

      if ((await readSubscribedMembers(ctx)).includes(peer)) {
        await withCiTimeout(
          ctx.client.presenceManager.unsubscribe([peer]),
          20 * 1000,
          'clear a leftover presence subscription'
        );
      }
      await expectSubscription(ctx, peer, false);

      subscribed = true;
      const subscribedPresences = await withCiTimeout(
        ctx.client.presenceManager.subscribe([peer], 3600),
        20 * 1000,
        'subscribe to the presence peer'
      );
      assertEqual(subscribedPresences.length, 1);
      const presence = subscribedPresences[0];
      assertNotNull(presence);
      assertEqual(presence.publisher, peer);
      await expectSubscription(ctx, peer, true);

      await withCiTimeout(
        ctx.client.presenceManager.unsubscribe([peer]),
        20 * 1000,
        'unsubscribe from the presence peer'
      );
      await expectSubscription(ctx, peer, false);
      subscribed = false;
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

  // Unauthenticated fetchPresenceStatus must throw errorCode 201.
  ciTest(
    'RN-PRESENCE-003',
    'fetchPresenceStatus while logged out throws 201',
    async () => {
      await expectCiError(
        () =>
          ctx.client.presenceManager.fetchPresenceStatus([
            'rn-ci-nonexistent-user',
          ]),
        201
      );
    }
  );

  // Unauthenticated subscribe must throw errorCode 201.
  ciTest(
    'RN-PRESENCE-004',
    'subscribe while logged out throws 201',
    async () => {
      await expectCiError(
        () =>
          ctx.client.presenceManager.subscribe(['rn-ci-nonexistent-user'], 60),
        201
      );
    }
  );

  // Unauthenticated unsubscribe must throw errorCode 201.
  ciTest(
    'RN-PRESENCE-005',
    'unsubscribe while logged out throws 201',
    async () => {
      await expectCiError(
        () =>
          ctx.client.presenceManager.unsubscribe(['rn-ci-nonexistent-user']),
        201
      );
    }
  );

  // Unauthenticated fetchSubscribedMembers must throw errorCode 201.
  ciTest(
    'RN-PRESENCE-006',
    'fetchSubscribedMembers while logged out throws 201',
    async () => {
      await expectCiError(
        () => ctx.client.presenceManager.fetchSubscribedMembers(1, 20),
        201
      );
    }
  );
}
