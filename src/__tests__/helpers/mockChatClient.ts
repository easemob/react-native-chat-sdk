/**
 * Helpers for installing a fake `ChatClient` into the `Factory` singleton
 * so tests that depend on `Factory.getChatClient()` can run without a real
 * client instance.
 */

import type { ChatClient } from '../../ChatClient';
import { Factory } from '../../__internal__/Factory';

export interface FakeChatClientOverrides {
  currentUserName?: string;
  [key: string]: unknown;
}

/**
 * Install a minimal fake `ChatClient` on `Factory`. Provide `overrides` to
 * customize fields; defaults to `currentUserName='u1'`.
 *
 * The cast goes through `unknown` so callers do not have to satisfy the full
 * `ChatClient` shape — tests only use whatever fields they need.
 */
export function installFakeChatClient(
  overrides?: FakeChatClientOverrides
): ChatClient {
  const fake = {
    currentUserName: 'u1',
    ...overrides,
  } as unknown as ChatClient;
  Factory.setChatClient(fake);
  return fake;
}

/**
 * Reset `Factory.client` and `Factory.t` so the next test starts from a clean
 * slate. `t` is the name-keyed registry mutated by `Factory.set` — tests for
 * `Factory.set/get` need it cleared between runs to avoid cross-test pollution.
 */
export function resetChatClient(): void {
  const f = Factory as unknown as {
    client: ChatClient | undefined;
    t: Set<unknown> | undefined;
  };
  f.client = undefined;
  f.t = undefined;
}
