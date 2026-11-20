/**
 * Log in with a token and wait until the target SDK is connected and its
 * local stores needed by CI are explicitly loaded.
 *
 * RN SDK 1.21.0 has no public dataSyncType or onDataSyncStart/Finish API.
 * The readiness proof therefore uses the target's observable connection and
 * explicit contact/group fetch APIs instead of asserting a source-only sync
 * event contract.
 */

import type { ChatClient } from 'react-native-chat-sdk';
import { waitForCi, withCiTimeout } from './wait_for';

const CI_LOGIN_BUDGET_MS = 45 * 1000;

export async function loginForCi(
  client: ChatClient,
  userId: string,
  token: string
): Promise<void> {
  const start = Date.now();
  const remaining = (): number => {
    const left = CI_LOGIN_BUDGET_MS - (Date.now() - start);
    if (left <= 0) {
      throw new Error(
        `CI login not ready within ${CI_LOGIN_BUDGET_MS}ms: user=${userId}`
      );
    }
    return left;
  };

  await withCiTimeout(
    client.loginWithToken(userId, token),
    remaining(),
    'CI loginWithToken'
  );
  await waitForCi(
    'SDK connected after token login',
    () => client.isConnected(),
    (connected) => connected,
    remaining()
  );
  await withCiTimeout(
    client.contactManager.fetchAllContacts(),
    remaining(),
    'CI contact store load'
  );
  await withCiTimeout(
    client.groupManager.fetchJoinedGroupsFromServer(20, 0),
    remaining(),
    'CI joined-group store load'
  );
}
