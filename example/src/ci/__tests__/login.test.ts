import type { ChatClient } from 'react-native-chat-sdk';

import { loginForCi } from '../support/login';

jest.mock(
  'react-native-chat-sdk',
  () => jest.requireActual('../../../../src'),
  { virtual: true }
);

function createClient(options: { deleteFailuresBeforeSuccess: number }): {
  client: ChatClient;
  deleteConversation: jest.Mock;
} {
  let deleteCalls = 0;
  const deleteConversation = jest.fn(async () => {
    deleteCalls += 1;
    if (deleteCalls <= options.deleteFailuresBeforeSuccess) {
      throw new Error('[1] remove conversation is failed.');
    }
  });
  const client = {
    loginWithToken: jest.fn(async () => undefined),
    isConnected: jest.fn(async () => true),
    contactManager: {
      fetchAllContacts: jest.fn(async () => []),
    },
    groupManager: {
      fetchJoinedGroupsFromServer: jest.fn(async () => []),
    },
    chatManager: {
      getConversation: jest.fn(async () => undefined),
      deleteConversation,
    },
  } as unknown as ChatClient;
  return { client, deleteConversation };
}

describe('loginForCi', () => {
  it('resolves when the database probe succeeds on the first try', async () => {
    const { client, deleteConversation } = createClient({
      deleteFailuresBeforeSuccess: 0,
    });
    await expect(loginForCi(client, 'user', 'token')).resolves.toBeUndefined();
    expect(deleteConversation).toHaveBeenCalledTimes(1);
    expect(deleteConversation).toHaveBeenCalledWith('ci_db_ready_probe', true);
  });

  it('retries the database probe until deleteConversation succeeds', async () => {
    const { client, deleteConversation } = createClient({
      deleteFailuresBeforeSuccess: 2,
    });
    await expect(loginForCi(client, 'user', 'token')).resolves.toBeUndefined();
    expect(deleteConversation).toHaveBeenCalledTimes(3);
  });
});
