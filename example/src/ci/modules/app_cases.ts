/**
 * APP domain CI cases (`RN-APP-*`): SDK init and client-level behavior.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerAppCases` is wired into the
 * `logged_out` entry (init succeeds without an account);
 * `registerAppLoggedOutCases` collects the client-level no-login negative
 * cases for the `logged_out` entry.
 */

import { ChatDataSyncType } from 'react-native-chat-sdk';
import { ciTest, type CiCaseContext } from '../harness';
import { assertEqual, assertNotNull } from '../support/expect';

/** Init / client-level cases that run without login (`logged_out` entry). */
export function registerAppCases(ctx: CiCaseContext): void {
  // Test: Read the client state after the entry's explicit init, before any
  // login. Expected: the options echo the entry's init table (spec §5.5),
  // no user is reported and the client is disconnected. Like the Flutter
  // FL-APP-001 seed, this assumes a clean install or a previous entry that
  // logged out: a persisted last-login user (Android) makes the empty-user
  // assertion fail even though the SDK holds no session.
  ciTest(
    'RN-APP-001',
    'init succeeds with the explicit CI options and no login state',
    async () => {
      const options = ctx.client.options;
      assertNotNull(options, 'client.options must be available after init');
      assertEqual(options.appKey, ctx.config.appKey);
      assertEqual(options.debugModel, false);
      assertEqual(options.autoLoadConversations, true);
      assertEqual(options.enableChatroomConversation, false);
      assertEqual(options.enableUserInfo, false);
      assertEqual(options.dataSyncType, ChatDataSyncType.Conversations);
      assertEqual(ctx.client.currentUserName, '');
      assertEqual(await ctx.client.isConnected(), false);
    }
  );
}

/** Client-level no-login negative cases (`logged_out` entry). */
export function registerAppLoggedOutCases(_ctx: CiCaseContext): void {
  // No cases registered yet: no client-level API has a no-login expectation
  // to pin.
}
