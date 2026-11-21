/**
 * `loginForCi`: login with readiness proof for CI cases.
 *
 * Readiness is event-correlated, never a fixed sleep: the data-sync types
 * required by the entry's explicit `ChatOptions.dataSyncType` mask must all
 * report `onDataSyncFinish` with `errorCode === 0` (note: RN reports a
 * NUMBER, unlike Flutter's error object), and `isConnected` must become
 * true afterwards. The whole procedure has a 45s total budget; the
 * connection listener is always removed in `finally`.
 *
 * The final database probe defends against the Android HyphenateChat
 * 4.25.x failure mode seen on the 1.21.0 branch: `login` can report
 * success while `onDatabaseOpened` has not fired yet, and in that window
 * `EMChatManager.deleteConversation` returns false without reaching the
 * native core (mapped to ChatError 1). See
 * docs/testing/2026-11-21-ci-device-regression-analysis.md.
 */

/* eslint-disable no-bitwise -- dataSyncType is a bitmask by design */
import {
  ChatConversationType,
  ChatDataSyncType,
  type ChatClient,
  type ChatConnectEventListener,
} from 'react-native-chat-sdk';
import { waitForCi, withCiTimeout } from './wait_for';

const CI_LOGIN_BUDGET_MS = 45 * 1000;
const CI_DB_PROBE_CONV_ID = 'ci_db_ready_probe';

const SUPPORTED_SYNC_MASK =
  ChatDataSyncType.Conversations |
  ChatDataSyncType.Contacts |
  ChatDataSyncType.JoinedGroups;

export async function loginForCi(
  client: ChatClient,
  userId: string,
  token: string
): Promise<void> {
  const required = client.options?.dataSyncType;
  if (
    required == null ||
    required === ChatDataSyncType.None ||
    (required & ~SUPPORTED_SYNC_MASK) !== 0
  ) {
    throw new Error(
      `loginForCi requires an explicit supported dataSyncType mask ` +
        `(conversations|contacts|joinedGroups), got ${String(required)}`
    );
  }

  const start = Date.now();
  let started = 0;
  let completed = 0;
  let syncFailure: { type: number; errorCode: number } | null = null;

  const remaining = (): number => {
    const left = CI_LOGIN_BUDGET_MS - (Date.now() - start);
    if (left <= 0) {
      throw new Error(
        `CI login not ready within ${CI_LOGIN_BUDGET_MS}ms: ` +
          `required=${required}, started=${started}, completed=${completed}`
      );
    }
    return left;
  };

  // The sync result is carried as a VALUE (Error | null), so a data-sync
  // event arriving before login's promise settles cannot produce an
  // unhandled rejection.
  let finishSync: ((failure: Error | null) => void) | null = null;
  const syncDone = new Promise<Error | null>((resolve) => {
    finishSync = resolve;
  });

  // Register before loginWithToken: native callbacks can arrive earlier
  // than the login method result.
  const listener: ChatConnectEventListener = {
    onDataSyncStart(type: ChatDataSyncType) {
      started |= type & required;
    },
    onDataSyncFinish(type: ChatDataSyncType, errorCode: number) {
      if ((type & required) === 0) {
        return;
      }
      if (errorCode !== 0) {
        syncFailure ??= { type, errorCode };
        finishSync?.(
          new Error(
            `CI data sync failed: type=${type}, errorCode=${errorCode}, ` +
              `required=${required}, started=${started}, completed=${completed}`
          )
        );
        return;
      }
      completed |= type & required;
      if ((completed & required) === required) {
        finishSync?.(null);
      }
    },
  };
  client.addConnectionListener(listener);

  try {
    await withCiTimeout(
      client.loginWithToken(userId, token),
      remaining(),
      'CI loginWithToken'
    );
    const failure = await withCiTimeout(
      syncDone,
      remaining(),
      `CI data sync incomplete: required=${required}, ` +
        `started=${started}, completed=${completed}`
    );
    if (failure != null) {
      throw failure;
    }
    await waitForCi(
      'CI connected after data sync',
      () => {
        if (syncFailure != null) {
          throw new Error(
            `CI data sync failed while waiting for connection: ` +
              `type=${syncFailure.type}, errorCode=${syncFailure.errorCode}`
          );
        }
        return client.isConnected();
      },
      (connected) => connected,
      remaining()
    );
    await waitForCi(
      'native conversation database opened',
      async () => {
        try {
          await client.chatManager.getConversation(
            CI_DB_PROBE_CONV_ID,
            ChatConversationType.PeerChat,
            true
          );
          await client.chatManager.deleteConversation(
            CI_DB_PROBE_CONV_ID,
            true
          );
          return true;
        } catch {
          return false;
        }
      },
      (ready) => ready,
      remaining()
    );
  } finally {
    client.removeConnectionListener(listener);
  }
}
