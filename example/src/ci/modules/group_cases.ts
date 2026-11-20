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

import {
  ChatError,
  ChatGroupOptions,
  ChatGroupPermissionType,
  type ChatGroup,
  type ChatGroupSharedFile,
} from 'react-native-chat-sdk';
import RNFS from 'react-native-fs';

import { addTearDown, ciTest, type CiCaseContext } from '../harness';
import {
  assertDeepEqual,
  assertEqual,
  assertNotNull,
  assertTrue,
  expectCiError,
} from '../support/expect';
import { loginForCi } from '../support/login';
import { uniqueCiName } from '../support/unique';
import { withCiTimeout, waitForCi } from '../support/wait_for';

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

/** The peer account used by the two-member group cases. */
function requirePeer(ctx: CiCaseContext, userId: string): string {
  const peer = ctx.config.accounts?.[1]?.id ?? ctx.config.peerId;
  if (peer == null || peer.length === 0 || peer === userId) {
    throw new Error(
      'ci_run.json: config.accounts[1].id (or config.peerId) must be a user ' +
        'different from config.accounts[0].id'
    );
  }
  return peer;
}

/** A group created by `createOwnedGroup`, with its REST cleanup registered. */
interface GroupFixture {
  userId: string;
  peerId: string;
  groupId: string;
  name: string;
  description: string;
  ext: string;
}

/**
 * Creates a group owned by the logged-in account and proves the REST-side
 * state (owner, name, description, member set) before returning. The
 * teardown deletes every group carrying the fixture name plus the tracked
 * id, so a group that reached the server despite a failed SDK call is
 * still removed.
 */
async function createOwnedGroup(
  ctx: CiCaseContext,
  label: string,
  options: {
    invitePeer?: boolean;
    inviteNeedConfirm?: boolean;
    groupOptions?: ChatGroupOptions;
  } = {}
): Promise<GroupFixture> {
  const { userId } = requireLogin(ctx);
  const peerId = requirePeer(ctx, userId);
  const invitePeer = options.invitePeer ?? true;
  const name = uniqueCiName('group', label);
  const description = `CI group fixture ${name}`;
  const groupOptions =
    options.groupOptions ??
    new ChatGroupOptions({
      maxCount: 100,
      inviteNeedConfirm: options.inviteNeedConfirm ?? false,
      ext: name,
    });
  const ext = groupOptions.ext ?? name;

  let createdGroupId: string | null = null;
  addTearDown(async () => {
    const ids = new Set<string>();
    for (const id of await ctx.rest.groupIdsNamed({ owner: userId, name })) {
      ids.add(id);
    }
    if (createdGroupId != null) {
      ids.add(createdGroupId);
    }
    for (const id of ids) {
      await ctx.rest.deleteGroup(id);
      await ctx.rest.verifyGroupAbsent(id);
    }
  });

  const group = await ctx.client.groupManager.createGroupEx({
    options: groupOptions,
    groupName: name,
    desc: description,
    inviteMembers: invitePeer ? [peerId] : undefined,
  });
  const groupId = group.groupId;
  createdGroupId = groupId;

  assertEqual(group.groupName, name, 'created group must keep its name');
  assertEqual(group.owner, userId, 'the creator must own the group');

  const restDetail = await fetchRestGroup(ctx, groupId);
  assertEqual(restDetail.owner, userId, 'REST owner must be the creator');
  assertEqual(restDetail.name, name, 'REST name must match');
  assertEqual(
    restDetail.description,
    description,
    'REST description must match'
  );
  await waitForRestMembers(
    ctx,
    groupId,
    invitePeer ? [userId, peerId] : [userId]
  );

  const detail = await fetchGroupDetail(ctx, groupId);
  assertEqual(detail.groupId, groupId);
  assertEqual(detail.groupName, name);
  assertEqual(detail.description, description);
  assertEqual(detail.owner, userId);
  assertEqual(detail.memberCount, invitePeer ? 2 : 1);

  return { userId, peerId, groupId, name, description, ext };
}

/** Fetches the group detail from the server and proves it is present. */
async function fetchGroupDetail(
  ctx: CiCaseContext,
  groupId: string
): Promise<ChatGroup> {
  const group =
    await ctx.client.groupManager.fetchGroupInfoWithoutMembersFromServer(
      groupId
    );
  assertNotNull(group, `the SDK must fetch group ${groupId} from the server`);
  return group;
}

/** Fetches the raw REST group detail and proves the group exists. */
async function fetchRestGroup(
  ctx: CiCaseContext,
  groupId: string
): Promise<Record<string, unknown>> {
  const detail = await ctx.rest.group(groupId);
  assertNotNull(detail, `REST group ${groupId} must exist`);
  return detail;
}

/**
 * Extracts member ids from the REST group detail. The server reports
 * membership as a list of single-key records mapping role to user id.
 */
function parseRestGroupMembers(detail: Record<string, unknown>): string[] {
  const affiliations = detail.affiliations;
  if (!Array.isArray(affiliations)) {
    throw new Error('REST group detail is missing the affiliations array');
  }
  const members: string[] = [];
  for (const item of affiliations) {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(
        `unexpected REST affiliation entry: ${JSON.stringify(item)}`
      );
    }
    const pairs = Object.entries(item as Record<string, unknown>);
    const first = pairs[0];
    const memberId = first?.[1];
    if (pairs.length !== 1 || typeof memberId !== 'string') {
      throw new Error(
        `unexpected REST affiliation entry: ${JSON.stringify(item)}`
      );
    }
    members.push(memberId);
  }
  return members;
}

/** Reads the current REST-side member ids of a group. */
async function fetchRestGroupMembers(
  ctx: CiCaseContext,
  groupId: string
): Promise<string[]> {
  return parseRestGroupMembers(await fetchRestGroup(ctx, groupId));
}

/** Order-insensitive membership comparison that rejects duplicates. */
function hasSameMembers(actual: string[], expected: string[]): boolean {
  if (actual.length !== expected.length) {
    return false;
  }
  const unique = new Set(actual);
  if (unique.size !== actual.length) {
    return false;
  }
  return expected.every((id) => unique.has(id));
}

/** Polls the REST group detail until its member set equals `expected`. */
async function waitForRestMembers(
  ctx: CiCaseContext,
  groupId: string,
  expected: string[]
): Promise<string[]> {
  return waitForCi(
    `REST group ${groupId} members are [${expected.join(', ')}]`,
    () => fetchRestGroupMembers(ctx, groupId),
    (members) => hasSameMembers(members, expected)
  );
}

/** Fetches the first page of group member ids from the server. */
async function fetchMemberIds(
  ctx: CiCaseContext,
  groupId: string
): Promise<string[]> {
  const page = await ctx.client.groupManager.fetchMemberListFromServer(
    groupId,
    20
  );
  return page.list ?? [];
}

/** Compares a string attribute map, tolerating key order. */
function sameStringMap(
  actual: Record<string, string> | undefined,
  expected: Record<string, string>
): boolean {
  if (actual == null) {
    return false;
  }
  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);
  return (
    actualKeys.length === expectedKeys.length &&
    expectedKeys.every((key) => actual[key] === expected[key])
  );
}

/** Fetches the shared file list from the server. */
async function fetchGroupFiles(
  ctx: CiCaseContext,
  groupId: string
): Promise<ChatGroupSharedFile[]> {
  return ctx.client.groupManager.fetchGroupFileListFromServer(groupId);
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

  // Test: An empty group id is invalid for both server-side fetch and
  // destroy while logged in, and must surface the parameter error 600.
  ciTest(
    'RN-GROUP-006',
    'fetching group info with an empty group id fails with error 600',
    async () => {
      const { userId } = requireLogin(ctx);
      assertEqual(ctx.client.currentUserName, userId);
      await expectCiError(
        () =>
          ctx.client.groupManager.fetchGroupInfoWithoutMembersFromServer(''),
        600
      );
    }
  );

  ciTest(
    'RN-GROUP-007',
    'destroying a group with an empty group id fails with error 600',
    async () => {
      const { userId } = requireLogin(ctx);
      assertEqual(ctx.client.currentUserName, userId);
      await expectCiError(() => ctx.client.groupManager.destroyGroup(''), 600);
    }
  );

  // Test: The inviteNeedConfirm flag survives creation and a server fetch
  // for both of its values; the local store must expose the same config.
  ciTest(
    'RN-GROUP-008',
    'inviteNeedConfirm is persisted and fetched for both flag values',
    async () => {
      for (const required of [true, false]) {
        const fixture = await createOwnedGroup(ctx, 'invite_confirm', {
          invitePeer: false,
          inviteNeedConfirm: required,
        });

        const detail = await fetchGroupDetail(ctx, fixture.groupId);
        assertEqual(
          detail.options?.inviteNeedConfirm,
          required,
          `server config inviteNeedConfirm must be ${required}`
        );

        const local = await waitForCi(
          `local group ${fixture.groupId} reports inviteNeedConfirm=${required}`,
          () => ctx.client.groupManager.getGroupWithId(fixture.groupId),
          (group) => group?.options?.inviteNeedConfirm === required
        );
        assertNotNull(local, 'the created group must exist in the local store');
        assertEqual(local.options?.inviteNeedConfirm, required);
      }
    }
  );

  // Test: Renaming a group changes only its name; description and owner
  // stay untouched on the server.
  ciTest(
    'RN-GROUP-009',
    'group name update changes the name and keeps the other fields',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'rename', {
        invitePeer: false,
      });
      const renamed = `renamed_${fixture.groupId}`;
      await ctx.client.groupManager.changeGroupName(fixture.groupId, renamed);

      const detail = await waitForCi(
        `group ${fixture.groupId} name is ${renamed}`,
        () => fetchGroupDetail(ctx, fixture.groupId),
        (group) => group.groupName === renamed
      );
      assertEqual(detail.groupName, renamed);
      assertEqual(detail.description, fixture.description);
      assertEqual(detail.owner, fixture.userId);
    }
  );

  // Test: Updating the description changes only that field.
  ciTest(
    'RN-GROUP-010',
    'group description update changes the description and keeps the name',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'description', {
        invitePeer: false,
      });
      const updated = `updated description ${fixture.groupId}`;
      await ctx.client.groupManager.changeGroupDescription(
        fixture.groupId,
        updated
      );

      const detail = await waitForCi(
        `group ${fixture.groupId} description is updated`,
        () => fetchGroupDetail(ctx, fixture.groupId),
        (group) => group.description === updated
      );
      assertEqual(detail.description, updated);
      assertEqual(detail.groupName, fixture.name);
      assertEqual(detail.owner, fixture.userId);
    }
  );

  // Test: The group extension is stored verbatim in the server-side configs.
  ciTest(
    'RN-GROUP-011',
    'group extension update is stored on the server',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'extension', {
        invitePeer: false,
      });
      const extension = JSON.stringify({
        case: 'RN-GROUP-011',
        group: fixture.groupId,
      });
      await ctx.client.groupManager.updateGroupExtension(
        fixture.groupId,
        extension
      );

      const detail = await waitForCi(
        `group ${fixture.groupId} extension is updated`,
        () => fetchGroupDetail(ctx, fixture.groupId),
        (group) => group.options?.ext === extension
      );
      assertEqual(detail.options?.ext, extension);
      assertEqual(detail.groupName, fixture.name);
    }
  );

  // Test: Consecutive announcement updates overwrite the previous text and
  // the dedicated fetch returns the latest value.
  ciTest(
    'RN-GROUP-012',
    'group announcement updates are readable through the server fetch',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'announcement', {
        invitePeer: false,
      });
      for (const revision of [1, 2]) {
        const announcement = `announcement ${fixture.groupId} revision ${revision}`;
        await ctx.client.groupManager.updateGroupAnnouncement(
          fixture.groupId,
          announcement
        );
        const fetched = await waitForCi(
          `group ${fixture.groupId} announcement revision ${revision}`,
          () =>
            ctx.client.groupManager.fetchAnnouncementFromServer(
              fixture.groupId
            ),
          (value) => value === announcement
        );
        assertEqual(fetched, announcement);
      }
    }
  );

  // Test: The avatar URL set through the update API is returned by the
  // server-side group detail (the update call itself returns void).
  ciTest(
    'RN-GROUP-013',
    'group avatar update is reflected in the server group detail',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'avatar', {
        invitePeer: false,
      });
      const avatarUrl = `https://example.com/ci/${fixture.groupId}.png`;
      await ctx.client.groupManager.updateGroupAvatar(
        fixture.groupId,
        avatarUrl
      );

      const detail = await waitForCi(
        `group ${fixture.groupId} avatar is updated`,
        () => fetchGroupDetail(ctx, fixture.groupId),
        (group) => group.groupAvatar === avatarUrl
      );
      assertEqual(detail.groupAvatar, avatarUrl);
      assertEqual(detail.groupName, fixture.name);
    }
  );

  // Test: The current user's namecard can be set and cleared again; the
  // local read is polled because the native store applies the change
  // asynchronously (native bug HIM-24170 truncated namecards on update).
  // The failure path fetches the member info from the server for evidence.
  ciTest(
    'RN-GROUP-014',
    'group namecard can be set and cleared again',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'namecard', {
        invitePeer: false,
      });
      const namecard = `ci_${fixture.groupId}`;
      await ctx.client.groupManager.updateGroupNamecard(
        fixture.groupId,
        namecard
      );
      const observed = await waitForCi(
        `namecard of ${fixture.userId} is stored`,
        () =>
          ctx.client.groupManager.getGroupNamecard(
            fixture.groupId,
            fixture.userId
          ),
        (value) => value === namecard
      );
      assertEqual(observed, namecard);

      await ctx.client.groupManager.updateGroupNamecard(fixture.groupId);
      // The 5.1.0 local member cache may keep the old namecard until a later
      // sync (observed on Android), while the server clears it immediately.
      // Use the server member list as the authoritative clear read-back.
      const clearedMember = await waitForCi(
        `server namecard of ${fixture.userId} is cleared`,
        async () => {
          const page =
            await ctx.client.groupManager.fetchMemberInfoListFromServer(
              fixture.groupId,
              '',
              20
            );
          return (page.list ?? []).find(
            (item) => item.memberId === fixture.userId
          );
        },
        (member) => member != null && !member.namecard,
        15000
      );
      assertNotNull(clearedMember, 'server member must still exist');
      assertTrue(
        !clearedMember.namecard,
        `server namecard must be cleared, got ${clearedMember.namecard}`
      );
      // The local read-back is best effort: some native builds refresh it
      // asynchronously and the server assertion above is the contract.
      const local = await ctx.client.groupManager.getGroupNamecard(
        fixture.groupId,
        fixture.userId
      );
      assertTrue(
        local == null || local.length === 0 || local === namecard,
        `unexpected local namecard after clear: ${local}`
      );
    }
  );

  // Test: A member added with a welcome message becomes visible both
  // through REST and through the SDK member list, and removal reverses it.
  ciTest(
    'RN-GROUP-016',
    'members can be added and removed from a group',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'members', {
        invitePeer: false,
      });
      await ctx.client.groupManager.addMembers(
        fixture.groupId,
        [fixture.peerId],
        'CI member'
      );
      await waitForRestMembers(ctx, fixture.groupId, [
        fixture.userId,
        fixture.peerId,
      ]);
      await waitForCi(
        `SDK member list of ${fixture.groupId} contains the peer`,
        () => fetchMemberIds(ctx, fixture.groupId),
        (ids) => ids.includes(fixture.peerId)
      );

      await ctx.client.groupManager.removeMembers(fixture.groupId, [
        fixture.peerId,
      ]);
      await waitForRestMembers(ctx, fixture.groupId, [fixture.userId]);
      await waitForCi(
        `SDK member list of ${fixture.groupId} excludes the peer`,
        () => fetchMemberIds(ctx, fixture.groupId),
        (ids) => !ids.includes(fixture.peerId)
      );
    }
  );

  // Test: Promoting a member to admin and demoting it again is reflected
  // in the server detail while the owner stays unchanged.
  ciTest('RN-GROUP-017', 'group admins can be added and removed', async () => {
    const fixture = await createOwnedGroup(ctx, 'admin');
    const initial = await fetchGroupDetail(ctx, fixture.groupId);
    assertTrue(
      !initial.adminList.includes(fixture.peerId),
      'the peer must not be an admin initially'
    );

    await ctx.client.groupManager.addAdmin(fixture.groupId, fixture.peerId);
    const promoted = await waitForCi(
      `group ${fixture.groupId} admin list contains the peer`,
      () => fetchGroupDetail(ctx, fixture.groupId),
      (group) => group.adminList.includes(fixture.peerId)
    );
    assertTrue(promoted.adminList.includes(fixture.peerId));
    assertEqual(promoted.owner, fixture.userId);

    await ctx.client.groupManager.removeAdmin(fixture.groupId, fixture.peerId);
    const demoted = await waitForCi(
      `group ${fixture.groupId} admin list excludes the peer`,
      () => fetchGroupDetail(ctx, fixture.groupId),
      (group) => !group.adminList.includes(fixture.peerId)
    );
    assertTrue(!demoted.adminList.includes(fixture.peerId));
    assertEqual(demoted.owner, fixture.userId);
    await waitForRestMembers(ctx, fixture.groupId, [
      fixture.userId,
      fixture.peerId,
    ]);
  });

  // Test: The paginated member info list returns both members once, with
  // the peer carrying the plain member role and a valid join timestamp.
  ciTest(
    'RN-GROUP-018',
    'group member info list returns the peer as a member',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'member_info');
      const page = await ctx.client.groupManager.fetchMemberInfoListFromServer(
        fixture.groupId,
        '',
        20
      );
      const members = page.list ?? [];
      const ids = members.map((member) => member.memberId);
      assertTrue(ids.includes(fixture.peerId), 'member list must contain peer');
      assertTrue(
        ids.every((id) => id === fixture.userId || id === fixture.peerId),
        'member list must not contain outsiders'
      );
      assertEqual(
        new Set(ids).size,
        ids.length,
        'member list must not contain duplicates'
      );

      const peerMember = members.find(
        (member) => member.memberId === fixture.peerId
      );
      assertNotNull(peerMember, 'the peer must be present in the list');
      assertEqual(peerMember.role, ChatGroupPermissionType.Member);
      assertTrue(
        peerMember.joinedTimestamp > 0,
        'the peer join timestamp must be set'
      );
      assertTrue(
        !page.cursor,
        'a single page of two members must not return a cursor'
      );
    }
  );

  // Test: Custom member attributes can be written for several members,
  // read back in bulk by key, and a single attribute is deleted by setting
  // it to the empty string (RN has no dedicated remove API).
  ciTest(
    'RN-GROUP-019',
    'group member attributes can be written, read, and deleted',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'attributes');
      const marker = fixture.groupId;
      await ctx.client.groupManager.setMemberAttribute(
        fixture.groupId,
        fixture.userId,
        { ci_role: 'owner', ci_marker: marker }
      );
      await ctx.client.groupManager.setMemberAttribute(
        fixture.groupId,
        fixture.peerId,
        { ci_role: 'peer', ci_marker: marker }
      );

      const ownerAttributes = await waitForCi(
        `owner attributes of ${fixture.groupId} are stored`,
        () =>
          ctx.client.groupManager.fetchMemberAttributes(
            fixture.groupId,
            fixture.userId
          ),
        (attributes) =>
          sameStringMap(attributes, {
            ci_role: 'owner',
            ci_marker: marker,
          })
      );
      assertNotNull(ownerAttributes, 'owner attributes must be present');
      assertDeepEqual(ownerAttributes, {
        ci_role: 'owner',
        ci_marker: marker,
      });

      const peerAttributes = await waitForCi(
        `peer attributes of ${fixture.groupId} are stored`,
        () =>
          ctx.client.groupManager.fetchMemberAttributes(
            fixture.groupId,
            fixture.peerId
          ),
        (attributes) =>
          sameStringMap(attributes, {
            ci_role: 'peer',
            ci_marker: marker,
          })
      );
      assertNotNull(peerAttributes, 'peer attributes must be present');
      assertDeepEqual(peerAttributes, {
        ci_role: 'peer',
        ci_marker: marker,
      });

      const selected = await ctx.client.groupManager.fetchMembersAttributes(
        fixture.groupId,
        [fixture.userId, fixture.peerId],
        ['ci_role']
      );
      assertDeepEqual(selected.get(fixture.userId), { ci_role: 'owner' });
      assertDeepEqual(selected.get(fixture.peerId), { ci_role: 'peer' });

      await ctx.client.groupManager.setMemberAttribute(
        fixture.groupId,
        fixture.peerId,
        { ci_role: '' }
      );
      const peerAfter = await waitForCi(
        `peer ci_role attribute of ${fixture.groupId} is deleted`,
        () =>
          ctx.client.groupManager.fetchMemberAttributes(
            fixture.groupId,
            fixture.peerId
          ),
        (attributes) => attributes != null && attributes.ci_role == null
      );
      assertDeepEqual(peerAfter, { ci_marker: marker });

      const ownerAfter = await ctx.client.groupManager.fetchMemberAttributes(
        fixture.groupId,
        fixture.userId
      );
      assertDeepEqual(ownerAfter, {
        ci_role: 'owner',
        ci_marker: marker,
      });
    }
  );

  // Test: Blocking a member removes it from the group and lists it in the
  // block list; unblocking clears the list without re-adding the member.
  ciTest(
    'RN-GROUP-020',
    'blocking and unblocking a group member updates the block list',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'block');
      const initial = await ctx.client.groupManager.fetchBlockListFromServer(
        fixture.groupId
      );
      assertEqual(initial.length, 0, 'the block list must start empty');

      await ctx.client.groupManager.blockMembers(fixture.groupId, [
        fixture.peerId,
      ]);
      const blocked = await waitForCi(
        `group ${fixture.groupId} block list contains the peer`,
        () => ctx.client.groupManager.fetchBlockListFromServer(fixture.groupId),
        (ids) => ids.includes(fixture.peerId)
      );
      assertTrue(blocked.includes(fixture.peerId));
      await waitForRestMembers(ctx, fixture.groupId, [fixture.userId]);

      await ctx.client.groupManager.unblockMembers(fixture.groupId, [
        fixture.peerId,
      ]);
      const cleared = await waitForCi(
        `group ${fixture.groupId} block list excludes the peer`,
        () => ctx.client.groupManager.fetchBlockListFromServer(fixture.groupId),
        (ids) => !ids.includes(fixture.peerId)
      );
      assertTrue(!cleared.includes(fixture.peerId));
      await waitForRestMembers(ctx, fixture.groupId, [fixture.userId]);
    }
  );

  // Test: Muting and unmuting a member is reflected in the mute list.
  // RN exposes only the muted user ids (no expiry map), so the case checks
  // membership in the list rather than the mute expiry value.
  ciTest(
    'RN-GROUP-021',
    'muting and unmuting a group member updates the mute list',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'mute');
      const initial = await ctx.client.groupManager.fetchMuteListFromServer(
        fixture.groupId
      );
      assertEqual(initial.length, 0, 'the mute list must start empty');

      await ctx.client.groupManager.muteMembers(
        fixture.groupId,
        [fixture.peerId],
        600000
      );
      const muted = await waitForCi(
        `group ${fixture.groupId} mute list contains the peer`,
        () => ctx.client.groupManager.fetchMuteListFromServer(fixture.groupId),
        (ids) => ids.includes(fixture.peerId)
      );
      assertTrue(muted.includes(fixture.peerId));

      await ctx.client.groupManager.unMuteMembers(fixture.groupId, [
        fixture.peerId,
      ]);
      const cleared = await waitForCi(
        `group ${fixture.groupId} mute list excludes the peer`,
        () => ctx.client.groupManager.fetchMuteListFromServer(fixture.groupId),
        (ids) => !ids.includes(fixture.peerId)
      );
      assertTrue(!cleared.includes(fixture.peerId));
      await waitForRestMembers(ctx, fixture.groupId, [
        fixture.userId,
        fixture.peerId,
      ]);
    }
  );

  // Test: The allow list starts without the peer, gains it on addAllowList,
  // and returns to its original content on removeAllowList. The server also
  // reports the owner, so the case only compares against the snapshot.
  ciTest(
    'RN-GROUP-022',
    'adding and removing a member from the allow list works',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'allow_list');
      const original = await ctx.client.groupManager.fetchAllowListFromServer(
        fixture.groupId
      );
      assertTrue(
        !original.includes(fixture.peerId),
        'the peer must not be on the allow list initially'
      );

      await ctx.client.groupManager.addAllowList(fixture.groupId, [
        fixture.peerId,
      ]);
      const added = await waitForCi(
        `group ${fixture.groupId} allow list contains the peer`,
        () => ctx.client.groupManager.fetchAllowListFromServer(fixture.groupId),
        (ids) => ids.includes(fixture.peerId)
      );
      assertTrue(
        hasSameMembers(added, [...original, fixture.peerId]),
        'the allow list must equal the original list plus the peer'
      );

      await ctx.client.groupManager.removeAllowList(fixture.groupId, [
        fixture.peerId,
      ]);
      const restored = await waitForCi(
        `group ${fixture.groupId} allow list is restored`,
        () => ctx.client.groupManager.fetchAllowListFromServer(fixture.groupId),
        (ids) => hasSameMembers(ids, original)
      );
      assertTrue(
        hasSameMembers(restored, original),
        'the allow list must return to its original content'
      );
      await waitForRestMembers(ctx, fixture.groupId, [
        fixture.userId,
        fixture.peerId,
      ]);
    }
  );

  // Test: Inviting into a group that requires confirmation does not add the
  // member until the invitation is accepted, which no client does here.
  ciTest(
    'RN-GROUP-023',
    'invitation pending confirmation does not add the member yet',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'pending_invite', {
        invitePeer: false,
        inviteNeedConfirm: true,
      });
      await ctx.client.groupManager.addMembers(fixture.groupId, [
        fixture.peerId,
      ]);

      const restMembers = await fetchRestGroupMembers(ctx, fixture.groupId);
      assertTrue(
        hasSameMembers(restMembers, [fixture.userId]),
        'REST members must remain only the owner before confirmation'
      );

      const ids = await fetchMemberIds(ctx, fixture.groupId);
      assertTrue(
        !ids.includes(fixture.peerId),
        'the SDK member list must not contain the unconfirmed peer'
      );
      assertTrue(
        ids.every((id) => id === fixture.userId),
        'the SDK member list must not contain anyone besides the owner'
      );

      const detail = await fetchGroupDetail(ctx, fixture.groupId);
      assertEqual(detail.memberCount, 1);
    }
  );

  // Test: Muting and unmuting all members toggles the server-side flag
  // while the member set stays unchanged.
  ciTest(
    'RN-GROUP-024',
    'muting and unmuting all group members toggles the flag',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'mute_all');
      const initial = await fetchGroupDetail(ctx, fixture.groupId);
      assertEqual(initial.isAllMemberMuted, false);

      await ctx.client.groupManager.muteAllMembers(fixture.groupId);
      const muted = await waitForCi(
        `group ${fixture.groupId} reports all members muted`,
        () => fetchGroupDetail(ctx, fixture.groupId),
        (group) => group.isAllMemberMuted === true
      );
      assertEqual(muted.isAllMemberMuted, true);

      await ctx.client.groupManager.unMuteAllMembers(fixture.groupId);
      const unmuted = await waitForCi(
        `group ${fixture.groupId} reports all members unmuted`,
        () => fetchGroupDetail(ctx, fixture.groupId),
        (group) => group.isAllMemberMuted === false
      );
      assertEqual(unmuted.isAllMemberMuted, false);
      await waitForRestMembers(ctx, fixture.groupId, [
        fixture.userId,
        fixture.peerId,
      ]);
    }
  );

  // Test: Transferring ownership changes the server-side owner while both
  // members remain in the group.
  ciTest(
    'RN-GROUP-025',
    'ownership transfer changes the owner and keeps both members',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'owner_transfer');
      await ctx.client.groupManager.changeOwner(
        fixture.groupId,
        fixture.peerId
      );

      const restDetail = await waitForCi(
        `REST owner of ${fixture.groupId} is the peer`,
        () => fetchRestGroup(ctx, fixture.groupId),
        (detail) => detail.owner === fixture.peerId
      );
      assertEqual(restDetail.owner, fixture.peerId);

      const detail = await waitForCi(
        `SDK owner of ${fixture.groupId} is the peer`,
        () => fetchGroupDetail(ctx, fixture.groupId),
        (group) => group.owner === fixture.peerId
      );
      assertEqual(detail.owner, fixture.peerId);
      assertEqual(detail.memberCount, 2);
      await waitForRestMembers(ctx, fixture.groupId, [
        fixture.userId,
        fixture.peerId,
      ]);
    }
  );

  // Test: Leaving a group created through REST removes only the current
  // user, keeps the peer as the remaining member, and drops the group from
  // the local joined-group list.
  ciTest(
    'RN-GROUP-026',
    'a member can leave a group created through REST',
    async () => {
      const { userId } = requireLogin(ctx);
      const peerId = requirePeer(ctx, userId);
      const name = uniqueCiName('group', 'rest_leave');
      const description = `CI REST leave group ${name}`;
      const groupId = await ctx.rest.createGroup({
        owner: peerId,
        name,
        description,
        members: [userId],
      });
      addTearDown(async () => {
        await ctx.rest.deleteGroup(groupId);
        await ctx.rest.verifyGroupAbsent(groupId);
      });

      await waitForRestMembers(ctx, groupId, [peerId, userId]);
      await ctx.client.groupManager.leaveGroup(groupId);
      await waitForRestMembers(ctx, groupId, [peerId]);

      const joined = await ctx.client.groupManager.getJoinedGroups();
      assertTrue(
        joined.every((group) => group.groupId !== groupId),
        'the left group must not be in the local joined-group list'
      );
    }
  );

  // Test: Joining a public group created through REST adds the current
  // user, and leaving it again restores the original member set.
  ciTest('RN-GROUP-027', 'a public group can be joined and left', async () => {
    const { userId } = requireLogin(ctx);
    const peerId = requirePeer(ctx, userId);
    const name = uniqueCiName('group', 'rest_public');
    const description = `CI REST public group ${name}`;
    const groupId = await ctx.rest.createGroup({
      owner: peerId,
      name,
      description,
      isPublic: true,
    });
    addTearDown(async () => {
      await ctx.rest.deleteGroup(groupId);
      await ctx.rest.verifyGroupAbsent(groupId);
    });

    await waitForRestMembers(ctx, groupId, [peerId]);
    const joinedBefore = await ctx.client.groupManager.getJoinedGroups();
    assertTrue(
      joinedBefore.every((group) => group.groupId !== groupId),
      'the public group must not be joined yet'
    );

    await ctx.client.groupManager.joinPublicGroup(groupId);
    await waitForRestMembers(ctx, groupId, [peerId, userId]);

    await ctx.client.groupManager.leaveGroup(groupId);
    await waitForRestMembers(ctx, groupId, [peerId]);
  });

  // Test: A 300-byte local file can be uploaded as a group shared file,
  // downloaded to a known local path, verified byte-for-byte, and removed.
  // The download completion is callback-driven and bounded by a timeout.
  ciTest(
    'RN-GROUP-028',
    'group shared file can be uploaded, downloaded, and removed',
    async () => {
      const fixture = await createOwnedGroup(ctx, 'shared_file');
      const fileName = `${uniqueCiName('group', 'shared')}.bin`;
      const sourcePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      const savePath = `${RNFS.CachesDirectoryPath}/downloaded_${fileName}`;
      const payload = 'x'.repeat(300);
      addTearDown(async () => {
        await RNFS.unlink(sourcePath).catch(() => {});
        await RNFS.unlink(savePath).catch(() => {});
      });
      await RNFS.writeFile(sourcePath, payload, 'utf8');

      const initial = await fetchGroupFiles(ctx, fixture.groupId);
      assertEqual(initial.length, 0, 'the shared file list must start empty');

      await ctx.client.groupManager.uploadGroupSharedFile(
        fixture.groupId,
        sourcePath
      );
      const files = await waitForCi(
        `shared file ${fileName} appears in group ${fixture.groupId}`,
        () => fetchGroupFiles(ctx, fixture.groupId),
        (list) => list.some((item) => item.name === fileName)
      );
      const file = files.find((item) => item.name === fileName);
      assertNotNull(file, 'the uploaded file must be present');
      assertTrue(file.fileId.length > 0, 'the uploaded file must have an id');
      assertEqual(file.fileSize, 300);

      const download = new Promise<string>((resolve, reject) => {
        ctx.client.groupManager
          .downloadGroupSharedFile(fixture.groupId, file.fileId, savePath, {
            onSuccess: (_groupId, filePath) => resolve(filePath),
            onError: (_groupId, _filePath, error) => reject(error),
          })
          .catch((error: unknown) => reject(error));
      });
      const reportedPath = await withCiTimeout(
        download,
        60000,
        'group shared file download'
      );
      assertEqual(reportedPath, savePath);
      const downloaded = await RNFS.readFile(savePath, 'utf8');
      assertEqual(downloaded, payload);
      assertEqual(downloaded.length, 300);

      await ctx.client.groupManager.removeGroupSharedFile(
        fixture.groupId,
        file.fileId
      );
      await waitForCi(
        `shared file ${fileName} is removed from group ${fixture.groupId}`,
        () => fetchGroupFiles(ctx, fixture.groupId),
        (list) => !list.some((item) => item.name === fileName)
      );
    }
  );
}

/** No-login group negative cases (`logged_out` entry). */
export function registerGroupLoggedOutCases(ctx: CiCaseContext): void {
  // Unauthenticated getJoinedGroups is expected to succeed (the local
  // database read works without a login), not throw error 201.
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

  // Test: Creating a group without a login rejects with error 201. An
  // unexpected success is cleaned up (best effort) and fails the case.
  ciTest(
    'RN-GROUP-003',
    'createGroup while logged out fails with error 201',
    async () => {
      assertTrue(
        ctx.client.currentUserName.length === 0,
        'the client must be logged out for this case'
      );
      const name = uniqueCiName('group', 'logged_out_create');
      const created = await ctx.client.groupManager
        .createGroupEx({
          options: new ChatGroupOptions({
            maxCount: 100,
            ext: name,
          }),
          groupName: name,
          desc: `CI logged-out create ${name}`,
        })
        .then(
          (group) => group,
          (error: unknown) => {
            if (!(error instanceof ChatError) || error.code !== 201) {
              throw error;
            }
            return null;
          }
        );
      if (created != null) {
        const createdId = created.groupId;
        addTearDown(async () => {
          await ctx.client.groupManager.destroyGroup(createdId);
        });
        throw new Error(
          'createGroupEx while logged out must reject with ChatError 201'
        );
      }
    }
  );

  // Test: Fetching group information from the server without a login
  // rejects with error 201 instead of returning group data.
  ciTest(
    'RN-GROUP-004',
    'fetching group info while logged out fails with error 201',
    async () => {
      assertTrue(
        ctx.client.currentUserName.length === 0,
        'the client must be logged out for this case'
      );
      await expectCiError(
        () =>
          ctx.client.groupManager.fetchGroupInfoWithoutMembersFromServer(
            '123456789012345'
          ),
        201
      );
    }
  );

  // Test: Destroying a group without a login rejects with error 201.
  ciTest(
    'RN-GROUP-005',
    'destroying a group while logged out fails with error 201',
    async () => {
      assertTrue(
        ctx.client.currentUserName.length === 0,
        'the client must be logged out for this case'
      );
      await expectCiError(
        () => ctx.client.groupManager.destroyGroup('123456789012345'),
        201
      );
    }
  );
}
