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

import { Platform } from 'react-native';
import {
  ChatConnectionState,
  ChatDataSyncType,
  type ChatConnectEventListener,
} from 'react-native-chat-sdk';

import { addTearDown, ciTest, type CiCaseContext } from '../harness';
import {
  assertEqual,
  assertNotNull,
  assertTrue,
  expectCiError,
} from '../support/expect';
import { loginForCi } from '../support/login';
import { waitForCi, withCiTimeout } from '../support/wait_for';

/** The logged-in account, required by every logged-in case. */
function requireAccountId(ctx: CiCaseContext): string {
  const userId = ctx.config.accounts?.[0]?.id;
  if (userId == null || userId.length === 0) {
    throw new Error('ci_run.json: config.accounts[0].id is required');
  }
  return userId;
}

/** The logged-in account and its token, required by cases that relogin. */
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
 * Restores the entry's logged-in precondition after a case disturbed it.
 * A cached user that matches is only re-checked for connection; otherwise
 * the client logs out (when needed) and logs in through `loginForCi`.
 */
async function restoreLogin(
  ctx: CiCaseContext,
  userId: string,
  token: string
): Promise<void> {
  if (ctx.client.currentUserName === userId) {
    await waitForCi(
      'login restored: connected',
      () => ctx.client.isConnected(),
      (connected) => connected
    );
    return;
  }
  if (ctx.client.currentUserName.length > 0) {
    await ctx.client.logout(false);
  }
  await loginForCi(ctx.client, userId, token);
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
      assertEqual(
        await ctx.client.getConnectionState(),
        ChatConnectionState.CONNECTED
      );
    }
  );

  // Test: Log out and log in again with the configured account and token.
  // Expected: logout clears the cached user and disconnects; relogin restores
  // the cached user, an active connection, and a nonempty access token.
  // Cleanup restores the login state even if an intermediate assertion fails.
  ciTest(
    'RN-AUTH-003',
    'logout clears the current user and relogin restores the session',
    async () => {
      const { userId, token } = requireLogin(ctx);
      addTearDown(() => restoreLogin(ctx, userId, token));

      await ctx.client.logout(false);
      assertEqual(ctx.client.currentUserName, '');
      await waitForCi(
        'SDK disconnected after logout',
        () => ctx.client.isConnected(),
        (connected) => !connected
      );

      await loginForCi(ctx.client, userId, token);
      assertEqual(ctx.client.currentUserName, userId);
      await waitForCi(
        'SDK connected after relogin',
        () => ctx.client.isConnected(),
        (connected) => connected
      );
      const accessToken = await ctx.client.getAccessToken();
      assertTrue(
        accessToken.length > 0,
        'getAccessToken must return a nonempty token after relogin'
      );
    }
  );

  // Test: Call loginWithToken again for the already connected user.
  // Expected: ChatError 200; the cached user and connection remain unchanged.
  // Cleanup restores the original session if it was disrupted.
  ciTest(
    'RN-AUTH-006',
    'loginWithToken for the already logged-in user throws 200 and keeps the session',
    async () => {
      const { userId, token } = requireLogin(ctx);
      assertEqual(ctx.client.currentUserName, userId);
      assertEqual(await ctx.client.isConnected(), true);
      addTearDown(() => restoreLogin(ctx, userId, token));

      await expectCiError(() => ctx.client.loginWithToken(userId, token), 200);
      assertEqual(ctx.client.currentUserName, userId);
      assertEqual(await ctx.client.isConnected(), true);
    }
  );

  // Test: Log out, register connection/sync listeners, and log in again with
  // the conversation-only data sync mask configured by the entry.
  // Expected: onDataSyncStart/onDataSyncFinish report only Conversations,
  // finish without an error, and the client is connected as the configured
  // user. Cleanup restores the login state and removes the listener.
  ciTest(
    'RN-AUTH-007',
    'explicit conversation sync starts and finishes with the conversation mask',
    async () => {
      const { userId, token } = requireLogin(ctx);
      const options = ctx.client.options;
      assertNotNull(options, 'client.options must be available after init');
      assertEqual(options.dataSyncType, ChatDataSyncType.Conversations);

      const started: ChatDataSyncType[] = [];
      const finished: ChatDataSyncType[] = [];
      const syncErrors: number[] = [];
      let finishSync: (() => void) | null = null;
      const syncDone = new Promise<void>((resolve) => {
        finishSync = resolve;
      });
      const listener: ChatConnectEventListener = {
        onDataSyncStart(type: ChatDataSyncType) {
          started.push(type);
        },
        onDataSyncFinish(type: ChatDataSyncType, errorCode: number) {
          finished.push(type);
          if (errorCode !== 0) {
            syncErrors.push(errorCode);
          }
          finishSync?.();
        },
      };
      ctx.client.addConnectionListener(listener);
      addTearDown(async () => {
        ctx.client.removeConnectionListener(listener);
        await restoreLogin(ctx, userId, token);
      });

      const deadline = Date.now() + 75 * 1000;
      const remaining = (): number => {
        const left = deadline - Date.now();
        if (left <= 0) {
          throw new Error(
            'RN-AUTH-007 conversation sync budget exhausted: ' +
              `started=${started.join(',')} finished=${finished.join(',')}`
          );
        }
        return left;
      };

      await ctx.client.logout(false);
      await waitForCi(
        'SDK disconnected before explicit sync login',
        () => ctx.client.isConnected(),
        (connected) => !connected
      );
      assertEqual(ctx.client.currentUserName, '');

      await withCiTimeout(
        ctx.client.loginWithToken(userId, token),
        remaining(),
        'RN-AUTH-007 loginWithToken'
      );
      await withCiTimeout(
        syncDone,
        remaining(),
        `RN-AUTH-007 conversation sync: started=${started.join(
          ','
        )} finished=${finished.join(',')}`
      );
      await waitForCi(
        'SDK connected after conversation sync',
        () => ctx.client.isConnected(),
        (connected) => connected,
        remaining()
      );
      assertTrue(
        started.length > 0,
        'expected at least one onDataSyncStart event'
      );
      assertTrue(
        finished.length > 0,
        'expected at least one onDataSyncFinish event'
      );
      for (const type of started) {
        assertEqual(type, ChatDataSyncType.Conversations);
      }
      for (const type of finished) {
        assertEqual(type, ChatDataSyncType.Conversations);
      }
      assertEqual(
        syncErrors.length,
        0,
        `conversation sync must finish without errors, got ${syncErrors.join(
          ','
        )}`
      );
      assertEqual(ctx.client.currentUserName, userId);
      assertEqual(await ctx.client.getCurrentUsername(), userId);
    }
  );
}

/** No-login authentication negative cases (`logged_out` entry). */
export function registerAuthLoggedOutCases(ctx: CiCaseContext): void {
  // Test: Call loginWithToken with an empty user ID while logged out.
  // Expected: ChatError 110 on Android or 101 on iOS; the cached user stays
  // empty and the client remains disconnected.
  ciTest(
    'RN-AUTH-004',
    'loginWithToken with an empty user while logged out throws the platform code',
    async () => {
      assertEqual(ctx.client.currentUserName, '');
      assertEqual(await ctx.client.isConnected(), false);
      await expectCiError(
        () => ctx.client.loginWithToken('', 'unused-token'),
        Platform.OS === 'android' ? 110 : 101
      );
      assertEqual(ctx.client.currentUserName, '');
      assertEqual(await ctx.client.isConnected(), false);
    }
  );

  // Test: While logged out, call loginWithToken with a nonempty user ID and an
  // empty token. Expected: ChatError 110 on Android or 104 on iOS; the cached
  // user stays empty and the client remains disconnected.
  ciTest(
    'RN-AUTH-005',
    'loginWithToken with an empty token while logged out throws the platform code',
    async () => {
      assertEqual(ctx.client.currentUserName, '');
      assertEqual(await ctx.client.isConnected(), false);
      await expectCiError(
        () => ctx.client.loginWithToken('rn-ci-peer', ''),
        Platform.OS === 'android' ? 110 : 104
      );
      assertEqual(ctx.client.currentUserName, '');
      assertEqual(await ctx.client.isConnected(), false);
    }
  );
}
