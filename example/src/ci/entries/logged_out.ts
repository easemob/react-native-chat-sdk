/**
 * Entry `logged_out`: no-login precondition (unauthenticated lane; needs no
 * account).
 *
 * Loading contract: `ci_mode.ts` calls the exported `registerEntry(ctx)`
 * once per cold start after `ci_run.json` selects this entry; the function
 * only registers the suite/cases with the harness, execution happens later
 * in `runCiSuites`.
 *
 * Init options are explicit per the spec §5.5 table (SDK defaults are never
 * relied upon); credentials come only from `ci_run.json`. This entry never
 * logs in.
 */

import { ChatOptions } from 'react-native-chat-sdk';
import { beforeAll, suite, type CiCaseContext } from '../harness';
import { withCiTimeout } from '../support/wait_for';
import {
  registerAppCases,
  registerAppLoggedOutCases,
} from '../modules/app_cases';
import { registerAuthLoggedOutCases } from '../modules/auth_cases';
import { registerConversationLoggedOutCases } from '../modules/conversation_cases';
import { registerMessageLoggedOutCases } from '../modules/message_cases';
import { registerGroupLoggedOutCases } from '../modules/group_cases';
import { registerContactLoggedOutCases } from '../modules/contact_cases';
import { registerPresenceLoggedOutCases } from '../modules/presence_cases';
import { registerRoomLoggedOutCases } from '../modules/room_cases';
import { registerUserInfoLoggedOutCases } from '../modules/user_info_cases';

const INIT_TIMEOUT_MS = 30 * 1000;

export function registerEntry(ctx: CiCaseContext): void {
  suite('logged_out', () => {
    beforeAll(async (c) => {
      const options = ChatOptions.withAppKey({
        appKey: c.config.appKey,
        debugModel: false,
        autoLoadConversations: true,
        enableChatroomConversation: false,
        enableUserInfo: false,
      });
      await withCiTimeout(c.client.init(options), INIT_TIMEOUT_MS, 'CI init');
    });

    registerAppCases(ctx);
    registerAppLoggedOutCases(ctx);
    registerAuthLoggedOutCases(ctx);
    registerConversationLoggedOutCases(ctx);
    registerMessageLoggedOutCases(ctx);
    registerGroupLoggedOutCases(ctx);
    registerContactLoggedOutCases(ctx);
    registerPresenceLoggedOutCases(ctx);
    registerRoomLoggedOutCases(ctx);
    registerUserInfoLoggedOutCases(ctx);
  });
}
