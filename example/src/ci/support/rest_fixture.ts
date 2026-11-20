/**
 * `CiRestFixture`: REST-side resource preparation, verification and
 * restoration for CI cases, based on the built-in `fetch` (no new
 * dependencies). REST observations are independent of the SDK under test:
 * REST arranges preconditions and proves cleanup; it never replaces SDK
 * assertions.
 *
 * The base URL is `<restApi>/<org>/<app>` derived from `appKey`
 * (`orgName#appName`), authenticated with the app token from `CiConfig`.
 */

import { waitForCi } from './wait_for';

const REQUEST_TIMEOUT_MS = 15 * 1000;

export interface CiRestFixtureParams {
  restApi: string;
  appKey: string;
  appToken: string;
}

/** HTTP-level REST failure, carrying the server error payload fields. */
export class CiRestError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly description: string;
  public readonly operation: string;

  constructor(
    status: number,
    code: string,
    description: string,
    operation: string
  ) {
    super(`REST ${operation}: HTTP ${status} ${code} ${description}`.trim());
    this.name = 'CiRestError';
    this.status = status;
    this.code = code;
    this.description = description;
    this.operation = operation;
  }
}

/** Server-side contact lists of both accounts, captured before a case. */
export interface ContactRelationSnapshot {
  userIds: string[];
  peerIds: string[];
}

export interface CreateGroupParams {
  owner: string;
  name: string;
  description?: string;
  members?: string[];
  isPublic?: boolean;
  inviteNeedConfirm?: boolean;
}

export interface CreateChatRoomParams {
  owner: string;
  name: string;
  description: string;
  members?: string[];
}

function path(value: string): string {
  return encodeURIComponent(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function requireStringList(data: unknown, what: string): string[] {
  if (!Array.isArray(data) || data.some((v) => typeof v !== 'string')) {
    throw new Error(`${what} must be a list of strings`);
  }
  return data as string[];
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v) => b.includes(v));
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export class CiRestFixture {
  private readonly base: string;
  private readonly appToken: string;

  constructor(params: CiRestFixtureParams) {
    const [org, app] = params.appKey.split('#');
    if (org == null || app == null || org.length === 0 || app.length === 0) {
      throw new Error(
        `CiRestFixture: invalid appKey (expect orgName#appName): ${params.appKey}`
      );
    }
    const restApi = params.restApi.replace(/\/+$/, '');
    if (restApi.length === 0) {
      throw new Error('CiRestFixture: restApi is required');
    }
    if (params.appToken.length === 0) {
      throw new Error('CiRestFixture: appToken is required');
    }
    this.base = `${restApi}/${path(org)}/${path(app)}`;
    this.appToken = params.appToken;
  }

  // ---- contacts --------------------------------------------------------

  /** Friend user ids of `userId` (server-side view). */
  public async contactIds(userId: string): Promise<string[]> {
    const response = await this.request(
      'GET',
      `users/${path(userId)}/contacts/users`
    );
    return requireStringList(response.data, 'REST contacts');
  }

  /**
   * Captures both accounts' contact lists. An asymmetric original
   * friendship means the accounts' state is broken; the snapshot refuses to
   * proceed so no fixture mutation is made on a bad baseline.
   */
  public async snapshotContacts(
    user: string,
    peer: string
  ): Promise<ContactRelationSnapshot> {
    const userIds = await this.contactIds(user);
    const peerIds = await this.contactIds(peer);
    if (userIds.includes(peer) !== peerIds.includes(user)) {
      throw new Error(
        `asymmetric original friendship: ${user} / ${peer}; ` +
          'no fixture mutation was made'
      );
    }
    return { userIds, peerIds };
  }

  private async areContacts(a: string, b: string): Promise<boolean> {
    return (await this.contactIds(a)).includes(b);
  }

  /** Makes `a` and `b` friends server-side (idempotent). */
  private async addContacts(a: string, b: string): Promise<void> {
    if (await this.areContacts(a, b)) {
      return;
    }
    await this.request('POST', `users/${path(a)}/contacts/users/${path(b)}`);
  }

  /** Removes the friendship both ways (idempotent). */
  private async removeContacts(a: string, b: string): Promise<void> {
    const removeOneWay = async (owner: string, friend: string) => {
      if (!(await this.areContacts(owner, friend))) {
        return;
      }
      await this.request(
        'DELETE',
        `users/${path(owner)}/contacts/users/${path(friend)}`
      );
    };
    await removeOneWay(a, b);
    await removeOneWay(b, a);
  }

  /** Sets the bilateral friendship state and verifies it via REST. */
  public async setContacts(
    user: string,
    peer: string,
    present: boolean
  ): Promise<void> {
    if (present) {
      await this.addContacts(user, peer);
    } else {
      await this.removeContacts(user, peer);
    }
    await this.verifyContacts(user, peer, present);
  }

  public async verifyContacts(
    user: string,
    peer: string,
    present: boolean
  ): Promise<void> {
    await waitForCi(
      `REST bilateral friendship ${user} / ${peer} = ${present}`,
      async () => [
        (await this.contactIds(user)).includes(peer),
        (await this.contactIds(peer)).includes(user),
      ],
      (values) => values.every((value) => value === present)
    );
  }

  /**
   * Restores the bilateral friendship captured by `snapshotContacts` and
   * verifies both accounts' lists match the snapshot exactly.
   */
  public async restoreContacts(
    user: string,
    peer: string,
    snapshot: ContactRelationSnapshot
  ): Promise<void> {
    await this.setContacts(user, peer, snapshot.userIds.includes(peer));
    const actualUser = await this.contactIds(user);
    const actualPeer = await this.contactIds(peer);
    if (
      !sameSet(actualUser, snapshot.userIds) ||
      !sameSet(actualPeer, snapshot.peerIds)
    ) {
      throw new Error(
        `friendship restoration differs from the original lists for ${user} / ${peer}`
      );
    }
  }

  // ---- blocklist ---------------------------------------------------------

  /** Blocked user ids of `user` (server-side view). */
  public async blockIds(user: string): Promise<string[]> {
    const response = await this.request(
      'GET',
      `users/${path(user)}/blocks/users`
    );
    return requireStringList(response.data, 'REST blocklist');
  }

  /** Sets the block state of `peer` for `user` and verifies it via REST. */
  public async setBlocked(
    user: string,
    peer: string,
    present: boolean
  ): Promise<void> {
    const current = await this.blockIds(user);
    if (current.includes(peer) !== present) {
      if (present) {
        await this.request('POST', `users/${path(user)}/blocks/users`, {
          body: { usernames: [peer] },
        });
      } else {
        await this.request(
          'DELETE',
          `users/${path(user)}/blocks/users/${path(peer)}`
        );
      }
    }
    await waitForCi(
      `REST blocklist ${user} / ${peer} = ${present}`,
      () => this.blockIds(user),
      (ids) => ids.includes(peer) === present
    );
  }

  // ---- groups ------------------------------------------------------------

  /**
   * Creates a group through REST so cases can prepare a group owned by an
   * account that is not logged in on this device.
   */
  public async createGroup(params: CreateGroupParams): Promise<string> {
    const response = await this.request('POST', 'chatgroups', {
      body: {
        groupname: params.name,
        description: params.description ?? '',
        public: params.isPublic ?? false,
        maxusers: 200,
        allowinvites: false,
        membersonly: false,
        invite_need_confirm: params.inviteNeedConfirm ?? false,
        owner: params.owner,
        ...(params.members != null && params.members.length > 0
          ? { members: params.members }
          : {}),
      },
    });
    const data = asRecord(response.data);
    if (typeof data?.groupid !== 'string' || data.groupid.length === 0) {
      throw new Error('REST createGroup response missing data.groupid');
    }
    return data.groupid;
  }

  public async deleteGroup(groupId: string): Promise<void> {
    await this.request('DELETE', `chatgroups/${path(groupId)}`, {
      ignoreNotFound: true,
    });
  }

  /** Ids of groups named `name` that `owner` has joined (server-side). */
  public async groupIdsNamed(options: {
    owner: string;
    name: string;
  }): Promise<string[]> {
    const response = await this.request(
      'GET',
      `users/${path(options.owner)}/joined_chatgroups`
    );
    if (!Array.isArray(response.data)) {
      throw new Error('REST joined groups must be a list');
    }
    const ids: string[] = [];
    for (const item of response.data) {
      const record = asRecord(item);
      if (record == null) {
        throw new Error('REST joined groups must be a list of objects');
      }
      if (record.groupname !== options.name) {
        continue;
      }
      if (typeof record.groupid !== 'string' || record.groupid.length === 0) {
        throw new Error('REST joined group missing groupid');
      }
      ids.push(record.groupid);
    }
    return ids;
  }

  /**
   * Group detail, or `null` when the group is gone. Only a resource-specific
   * missing response (404 with the group error codes) proves absence; any
   * other failure is rethrown so transport errors never masquerade as
   * successful cleanup.
   */
  public async group(groupId: string): Promise<Record<string, unknown> | null> {
    let response: Record<string, unknown>;
    try {
      response = await this.request('GET', `chatgroups/${path(groupId)}`);
    } catch (e) {
      if (
        e instanceof CiRestError &&
        e.status === 404 &&
        (e.code === 'group_not_found' ||
          (e.code === 'service_resource_not_found' &&
            e.description === `do not find this group:${groupId}`))
      ) {
        return null;
      }
      throw e;
    }
    if (!Array.isArray(response.data) || response.data.length !== 1) {
      throw new Error('REST group detail must contain one object');
    }
    const value = asRecord(response.data[0]);
    if (value == null) {
      throw new Error('REST group detail must contain one object');
    }
    const id = value.id ?? value.groupid;
    if (id !== groupId) {
      throw new Error(
        `REST group ID mismatch: expected ${groupId}, got ${String(id)}`
      );
    }
    if (value.error === "group id doesn't exist") {
      return null;
    }
    if (value.error != null) {
      throw new Error(`REST group ${groupId}: ${String(value.error)}`);
    }
    if (typeof value.name !== 'string' || typeof value.owner !== 'string') {
      throw new Error('REST group detail missing name or owner');
    }
    return value;
  }

  public async verifyGroupAbsent(groupId: string): Promise<void> {
    await waitForCi(
      `REST group ${groupId} absent`,
      () => this.group(groupId),
      (value) => value == null
    );
  }

  // ---- chat rooms --------------------------------------------------------

  public async createChatRoom(params: CreateChatRoomParams): Promise<string> {
    const response = await this.request('POST', 'chatrooms', {
      body: {
        name: params.name,
        description: params.description,
        maxusers: 1000,
        owner: params.owner,
        ...(params.members != null && params.members.length > 0
          ? { members: params.members }
          : {}),
      },
    });
    const data = asRecord(response.data);
    if (typeof data?.id !== 'string' || data.id.length === 0) {
      throw new Error('REST createChatRoom response missing data.id');
    }
    return data.id;
  }

  public async deleteChatRoom(roomId: string): Promise<void> {
    await this.request('DELETE', `chatrooms/${path(roomId)}`, {
      ignoreNotFound: true,
    });
  }

  /** Chat room detail, or `null` when the room is gone (404 semantics). */
  public async chatRoom(
    roomId: string
  ): Promise<Record<string, unknown> | null> {
    let response: Record<string, unknown>;
    try {
      response = await this.request('GET', `chatrooms/${path(roomId)}`);
    } catch (e) {
      if (
        e instanceof CiRestError &&
        e.status === 404 &&
        (e.code === 'chatroom_not_found' ||
          (e.code === 'service_resource_not_found' &&
            e.description === `do not find this group:${roomId}`))
      ) {
        return null;
      }
      throw e;
    }
    if (!Array.isArray(response.data) || response.data.length !== 1) {
      throw new Error('REST chatroom detail must contain one object');
    }
    const value = asRecord(response.data[0]);
    if (value == null) {
      throw new Error('REST chatroom detail must contain one object');
    }
    if (value.id !== roomId) {
      throw new Error(
        `REST chatroom ID mismatch: expected ${roomId}, got ${String(value.id)}`
      );
    }
    if (value.error === "chatroom id doesn't exist") {
      return null;
    }
    if (value.error != null) {
      throw new Error(`REST chatroom ${roomId}: ${String(value.error)}`);
    }
    if (typeof value.name !== 'string' || typeof value.owner !== 'string') {
      throw new Error('REST chatroom detail missing name or owner');
    }
    return value;
  }

  public async verifyChatRoomAbsent(roomId: string): Promise<void> {
    await waitForCi(
      `REST chatroom ${roomId} absent`,
      () => this.chatRoom(roomId),
      (value) => value == null
    );
  }

  // ---- messages ----------------------------------------------------------

  /**
   * Sends a one-to-one text message as `from`, which may be an offline peer.
   * Returns the server message id.
   */
  public async sendTextMessage(options: {
    from: string;
    to: string;
    text: string;
  }): Promise<string> {
    const response = await this.request('POST', 'messages/users', {
      body: {
        from: options.from,
        to: [options.to],
        type: 'txt',
        body: { msg: options.text },
      },
    });
    const data = asRecord(response.data);
    const msgId = data?.[options.to];
    if (typeof msgId !== 'string' || msgId.length === 0) {
      throw new Error('REST message response missing msgId');
    }
    return msgId;
  }

  // ---- transport -----------------------------------------------------------

  private async request(
    method: string,
    requestPath: string,
    options?: { body?: Record<string, unknown>; ignoreNotFound?: boolean }
  ): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(`${this.base}/${requestPath}`, {
        method,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.appToken}`,
          ...(options?.body != null
            ? { 'Content-Type': 'application/json' }
            : {}),
        },
        body: options?.body != null ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
    } catch (e) {
      throw new Error(
        `REST ${method} ${requestPath}: request failed: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    } finally {
      clearTimeout(timer);
    }
    const text = await response.text();
    let decoded: unknown = {};
    if (text.length > 0) {
      try {
        decoded = JSON.parse(text);
      } catch {
        throw new Error(
          `REST ${method} ${requestPath}: HTTP ${response.status}: ` +
            'invalid JSON response'
        );
      }
    }
    if (response.status === 404 && options?.ignoreNotFound === true) {
      return asRecord(decoded) ?? {};
    }
    if (response.status < 200 || response.status >= 300) {
      const payload = asRecord(decoded);
      throw new CiRestError(
        response.status,
        str(payload?.error),
        str(payload?.error_description),
        `${method} ${requestPath}`
      );
    }
    const record = asRecord(decoded);
    if (record == null) {
      throw new Error(`REST ${method} ${requestPath} returned a non-object`);
    }
    return record;
  }
}
