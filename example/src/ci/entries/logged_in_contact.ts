/**
 * Entry `logged_in_contact`: contact sync enabled (contact APIs).
 *
 * Loading contract: `ci_mode.ts` calls the exported `registerEntry(ctx)`
 * once per cold start after `ci_run.json` selects this entry; the function
 * only registers the suite/cases with the harness, execution happens later
 * in `runCiSuites`.
 *
 * Init options are explicit per the spec §5.5 table (SDK defaults are never
 * relied upon); credentials come only from `ci_run.json`.
 */

import { ChatOptions } from 'react-native-chat-sdk';
import { afterAll, beforeAll, suite, type CiCaseContext } from '../harness';
import { loginForCi } from '../support/login';
import { waitForCi, withCiTimeout } from '../support/wait_for';
import { registerContactCases } from '../modules/contact_cases';

const INIT_TIMEOUT_MS = 30 * 1000;
const LOGOUT_TIMEOUT_MS = 30 * 1000;

function resolveLogin(ctx: CiCaseContext): { userId: string; token: string } {
  const account = ctx.config.accounts?.[0];
  const userId = account?.id;
  const token = ctx.config.loginToken ?? account?.token;
  if (userId == null || userId.length === 0 || token == null) {
    throw new Error(
      'ci_run.json: logged-in entries need config.accounts[0].id and a ' +
        'token (config.loginToken or config.accounts[0].token)'
    );
  }
  return { userId, token };
}

async function logout(ctx: CiCaseContext): Promise<void> {
  if (ctx.client.currentUserName.length === 0) {
    return;
  }
  await withCiTimeout(ctx.client.logout(false), LOGOUT_TIMEOUT_MS, 'CI logout');
  await waitForCi(
    'SDK disconnected after logout',
    () => ctx.client.isConnected(),
    (connected) => !connected
  );
}

export function registerEntry(ctx: CiCaseContext): void {
  suite('logged_in_contact', () => {
    beforeAll(async (c) => {
      const options = ChatOptions.withAppKey({
        appKey: c.config.appKey,
        debugModel: false,
        autoLoadConversations: true,
        enableChatroomConversation: false,
        enableUserInfo: false,
      });
      await withCiTimeout(c.client.init(options), INIT_TIMEOUT_MS, 'CI init');
      const { userId, token } = resolveLogin(c);
      await loginForCi(c.client, userId, token);
    });
    afterAll(logout);

    registerContactCases(ctx);
  });
}
