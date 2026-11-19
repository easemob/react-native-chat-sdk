/**
 * CONV domain CI cases (`RN-CONV-*`): conversation APIs and the local
 * database behavior behind them.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerConversationCases` is wired
 * into the `logged_in_base` entry; `registerConversationLoggedOutCases`
 * collects the no-login negative cases for the `logged_out` entry.
 *
 * ChatPushManager has no dedicated CI module (the module domains in spec
 * §5.7 define no PUSH prefix); its cases are hosted here because the
 * silent mode is conversation notification state.
 */

import { ciTest, type CiCaseContext } from '../harness';
import {
  assertEqual,
  assertNotNull,
  assertTrue,
  expectCiError,
} from '../support/expect';

/** Logged-in conversation cases (`logged_in_base` entry). */
export function registerConversationCases(ctx: CiCaseContext): void {
  // Test: Fetch all conversations, mirroring single_account.json
  // chat.getAllConversations. Expected: a successful read-only fetch with a
  // list shape; the case asserts no specific data.
  ciTest(
    'RN-CONV-001',
    'getAllConversations returns a conversation list',
    async () => {
      const conversations = await ctx.client.chatManager.getAllConversations();
      assertTrue(
        Array.isArray(conversations),
        'getAllConversations must resolve to a list'
      );
      for (const conversation of conversations) {
        assertTrue(
          conversation.convId.length > 0,
          'a conversation needs a nonempty convId'
        );
      }
    }
  );

  // Test: Fetch the app-wide silent mode, mirroring single_account.json
  // push.fetchSilentModeForAll. Expected: a successful read-only fetch with
  // a result object.
  ciTest(
    'RN-CONV-002',
    'fetchSilentModeForAll returns the silent mode result',
    async () => {
      const result = await ctx.client.pushManager.fetchSilentModeForAll();
      assertNotNull(result);
      assertEqual(typeof result.conversationId, 'string');
    }
  );
}

/** No-login conversation negative cases (`logged_out` entry). */
export function registerConversationLoggedOutCases(ctx: CiCaseContext): void {
  // Unauthenticated push.fetchSilentModeForAll must throw errorCode 201;
  // hosted here for the reason documented in the file header.
  ciTest(
    'RN-CONV-003',
    'fetchSilentModeForAll while logged out throws 201',
    async () => {
      await expectCiError(
        () => ctx.client.pushManager.fetchSilentModeForAll(),
        201
      );
    }
  );
}
