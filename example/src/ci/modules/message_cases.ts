/**
 * MSG domain CI cases (`RN-MSG-*`): message send/receive and message
 * history behavior.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerMessageCases` is wired into
 * the `logged_in_base` entry; `registerMessageLoggedOutCases` collects the
 * no-login negative cases for the `logged_out` entry.
 */

import { ciTest, type CiCaseContext } from '../harness';
import { expectCiError } from '../support/expect';

/** Logged-in message cases (`logged_in_base` entry). */
export function registerMessageCases(_ctx: CiCaseContext): void {
  // No cases registered yet: single_account.json's only ChatManager case
  // (getAllConversations) is hosted in the CONV module.
}

/** No-login message negative cases (`logged_out` entry). */
export function registerMessageLoggedOutCases(ctx: CiCaseContext): void {
  // Unauthenticated searchMessagesFromServer (keywordList ["rn-ci"],
  // pageSize 10, pageNum 1) must throw errorCode 201.
  ciTest(
    'RN-MSG-001',
    'searchMessagesFromServer while logged out throws 201',
    async () => {
      await expectCiError(
        () =>
          ctx.client.chatManager.searchMessagesFromServer({
            option: { keywordList: ['rn-ci'] },
            pageSize: 10,
            pageNum: 1,
          }),
        201
      );
    }
  );
}
