import type { ChatMessage } from 'react-native-chat-sdk';
import {
  createApiRegistry,
  createInitHandler,
  type AgentSdkDeps,
  type ApiHandler,
} from '../registry';

const EXPECTED_APIS = [
  'ChatClient.loginWithToken',
  'ChatClient.logout',
  'ChatClient.isConnected',
  'ChatClient.getCurrentDeviceId',
  'ChatClient.fetchLoggedInDevices',
  'ChatManager.loadMessage',
  'ChatManager.sendMessage',
  'ChatManager.recallMessage',
  'ChatManager.modifyMessage',
  'ChatContactManager.addContact',
  'ChatContactManager.acceptInvitation',
  'ChatContactManager.deleteContact',
  'ChatContactManager.getAllContactIds',
  'ChatGroupManager.createGroup',
  'ChatGroupManager.destroyGroup',
  'ChatGroupManager.joinPublicGroup',
  'ChatGroupManager.leaveGroup',
  'ChatGroupManager.addMembers',
  'ChatGroupManager.acceptInvitation',
  'ChatGroupManager.fetchMemberListFromServer',
  'ChatGroupManager.fetchGroupInfoFromServer',
  'ChatGroupManager.updateGroupName',
  'ChatGroupManager.updateGroupNamecard',
  'ChatPresenceManager.subscribe',
  'ChatPresenceManager.unsubscribe',
  'ChatPresenceManager.publishPresence',
  'ChatPresenceManager.fetchPresenceStatus',
  'ChatUserInfoManager.fetchOwnInfo',
  'ChatUserInfoManager.updateUserInfo',
  'ChatUserInfoManager.subscribeUsersInfo',
  'ChatUserInfoManager.unsubscribeUsersInfo',
];

function fakeMessage(overrides?: Record<string, unknown>): ChatMessage {
  return {
    msgId: 'server-m1',
    from: 'alice',
    to: 'bob',
    conversationId: 'bob',
    chatType: 0,
    direction: 'send',
    status: 2,
    body: { type: 'txt', content: 'hello' },
    attributes: undefined,
    hasRead: true,
    hasReadAck: false,
    hasDeliverAck: false,
    needGroupAck: false,
    groupAckCount: 0,
    localTime: 0,
    serverTime: 1700000000000,
    isChatThread: false,
    isContentReplaced: false,
    deliverOnlineOnly: false,
    ...overrides,
  } as unknown as ChatMessage;
}

function makeDeps(): {
  deps: AgentSdkDeps;
  calls: Record<string, jest.Mock>;
} {
  const calls: Record<string, jest.Mock> = {};
  const fn = (
    name: string,
    impl?: (...args: never[]) => unknown
  ): jest.Mock => {
    const m = jest.fn(impl);
    calls[name] = m;
    return m;
  };
  const deps = {
    client: {
      init: fn('init'),
      loginWithToken: fn('loginWithToken'),
      logout: fn('logout'),
      isConnected: fn('isConnected', () => Promise.resolve(true)),
      getLoggedInDevicesFromServer: fn('getLoggedInDevicesFromServer', () =>
        Promise.resolve([
          { resource: 'android_a', deviceUUID: 'u1', deviceName: 'Pixel' },
        ])
      ),
      chatManager: {
        getMessage: fn('getMessage'),
        sendMessage: fn('sendMessage'),
        recallMessage: fn('recallMessage'),
        modifyMsgBody: fn('modifyMsgBody'),
      },
      contactManager: {
        addContact: fn('addContact'),
        acceptInvitation: fn('acceptInvitation'),
        deleteContact: fn('deleteContact'),
        getAllContactsFromDB: fn('getAllContactsFromDB', () =>
          Promise.resolve(['bob'])
        ),
      },
      groupManager: {
        createGroupEx: fn('createGroupEx', () =>
          Promise.resolve({
            groupId: 'g1',
            groupName: 'g',
            owner: 'alice',
            permissionType: 2,
            options: { maxCount: 200, isDisabled: false },
          })
        ),
        destroyGroup: fn('destroyGroup'),
        joinPublicGroup: fn('joinPublicGroup'),
        leaveGroup: fn('leaveGroup'),
        addMembers: fn('addMembers'),
        acceptInvitation: fn('groupAcceptInvitation'),
        fetchMemberListFromServer: fn('fetchMemberListFromServer', () =>
          Promise.resolve({ list: ['alice'], cursor: 'c1' })
        ),
        fetchGroupInfoWithoutMembersFromServer: fn(
          'fetchGroupInfoWithoutMembersFromServer'
        ),
        changeGroupName: fn('changeGroupName'),
        updateGroupNamecard: fn('updateGroupNamecard'),
      },
      presenceManager: {
        subscribe: fn('presenceSubscribe', () =>
          Promise.resolve([
            {
              publisher: 'bob',
              statusDescription: '',
              lastTime: 1,
              expiryTime: 2,
              statusDetails: new Map([['ios_x', 1]]),
            },
          ])
        ),
        unsubscribe: fn('presenceUnsubscribe'),
        publishPresence: fn('publishPresence'),
        fetchPresenceStatus: fn('fetchPresenceStatus', () =>
          Promise.resolve([])
        ),
      },
      userManager: {
        fetchOwnInfo: fn('fetchOwnInfo', () =>
          Promise.resolve({ userId: 'alice', nickName: 'A' })
        ),
        updateOwnUserInfo: fn('updateOwnUserInfo'),
        subscribeUsersInfo: fn('subscribeUsersInfo'),
        unsubscribeUsersInfo: fn('unsubscribeUsersInfo'),
      },
    },
    optionsWithAppKey: fn('withAppKey', (p: unknown) => ({
      kind: 'appKey',
      params: p,
    })),
    optionsWithAppId: fn('withAppId', (p: unknown) => ({
      kind: 'appId',
      params: p,
    })),
    createGroupOptions: fn('createGroupOptions', (p: unknown) => p),
    createTextMessage: fn('createTextMessage', () => fakeMessage()),
    createTextBody: fn('createTextBody', (content: unknown) => ({
      type: 'txt',
      content,
    })),
  } as unknown as AgentSdkDeps;
  return { deps, calls };
}

async function run(
  handler: ApiHandler | undefined,
  params: Record<string, unknown> = {}
) {
  if (handler === undefined) {
    throw new Error('api not registered');
  }
  return handler(params);
}

describe('api registry (contract §10)', () => {
  it('registers exactly the contract api vocabulary (init excluded)', () => {
    const { deps } = makeDeps();
    const registry = createApiRegistry(deps);
    expect([...registry.keys()].sort()).toEqual([...EXPECTED_APIS].sort());
    expect(registry.has('ChatClient.init')).toBe(false);
  });

  it('loginWithToken passes userId/token through', async () => {
    const { deps, calls } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatClient.loginWithToken'),
      { userId: 'alice', token: 't' }
    );
    expect(calls.loginWithToken).toHaveBeenCalledWith('alice', 't');
    expect(r).toEqual({ success: true });
  });

  it('logout defaults unbindDeviceToken to true', async () => {
    const { deps, calls } = makeDeps();
    const registry = createApiRegistry(deps);
    await run(registry.get('ChatClient.logout'));
    expect(calls.logout).toHaveBeenCalledWith(true);
    await run(registry.get('ChatClient.logout'), { unbindDeviceToken: false });
    expect(calls.logout).toHaveBeenCalledWith(false);
  });

  it('isConnected returns the boolean as data', async () => {
    const { deps } = makeDeps();
    const r = await run(createApiRegistry(deps).get('ChatClient.isConnected'));
    expect(r).toEqual({ success: true, data: true });
  });

  it('getCurrentDeviceId is a typed stub (contract §13 G1)', async () => {
    const { deps } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatClient.getCurrentDeviceId')
    );
    expect(r).toMatchObject({
      success: false,
      failureKind: 'tool',
      error: { code: -1 },
    });
    expect(r.success === false && r.error.message.includes('G1')).toBe(true);
  });

  it('fetchLoggedInDevices maps to canonical deviceInfo', async () => {
    const { deps, calls } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatClient.fetchLoggedInDevices'),
      { userId: 'alice', token: 't' }
    );
    expect(calls.getLoggedInDevicesFromServer).toHaveBeenCalledWith(
      'alice',
      't',
      false
    );
    expect(r).toEqual({
      success: true,
      data: [{ resource: 'android_a', deviceUUID: 'u1', deviceName: 'Pixel' }],
    });
  });

  it('loadMessage omits data when the message does not exist', async () => {
    const { deps, calls } = makeDeps();
    calls.getMessage?.mockResolvedValue(undefined);
    const r = await run(
      createApiRegistry(deps).get('ChatManager.loadMessage'),
      {
        messageId: 'm1',
      }
    );
    expect(calls.getMessage).toHaveBeenCalledWith('m1');
    expect(r).toEqual({ success: true });
  });

  it('sendMessage builds a text message and resolves with the server message', async () => {
    const { deps, calls } = makeDeps();
    calls.sendMessage?.mockImplementation(
      (_msg: unknown, cb: { onSuccess: (m: unknown) => void }) => {
        cb.onSuccess(fakeMessage({ msgId: 'server-rewritten' }));
        return Promise.resolve();
      }
    );
    const r = await run(
      createApiRegistry(deps).get('ChatManager.sendMessage'),
      {
        to: 'bob',
        chatType: 1,
        body: { type: 0, content: 'hello' },
        attributes: { k: 'v' },
      }
    );
    expect(calls.createTextMessage).toHaveBeenCalledWith('bob', 'hello', 1, {});
    expect(calls.sendMessage).toHaveBeenCalled();
    expect(r).toMatchObject({
      success: true,
      data: { msgId: 'server-rewritten', direction: 0, body: { type: 0 } },
    });
  });

  it('sendMessage rejects non-text bodies as a tool error', async () => {
    const { deps } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatManager.sendMessage'),
      {
        to: 'bob',
        body: { type: 1 },
      }
    );
    expect(r).toMatchObject({ success: false, failureKind: 'tool' });
  });

  it('sendMessage maps onError to an sdk failure', async () => {
    const { deps, calls } = makeDeps();
    calls.sendMessage?.mockImplementation(
      (_msg: unknown, cb: { onError: (id: string, e: unknown) => void }) => {
        cb.onError('local-1', { code: 500, description: 'send failed' });
        return Promise.resolve();
      }
    );
    const r = await run(
      createApiRegistry(deps).get('ChatManager.sendMessage'),
      {
        to: 'bob',
        body: { type: 0, content: 'hi' },
      }
    );
    expect(r).toEqual({
      success: false,
      failureKind: 'sdk',
      error: { code: 500, message: 'send failed' },
    });
  });

  it('modifyMessage maps content->body and attributes->ext', async () => {
    const { deps, calls } = makeDeps();
    calls.modifyMsgBody?.mockResolvedValue(
      fakeMessage({ body: { type: 'txt', content: 'new' } })
    );
    const r = await run(
      createApiRegistry(deps).get('ChatManager.modifyMessage'),
      { messageId: 'm1', content: 'new', attributes: { a: 1 } }
    );
    expect(calls.createTextBody).toHaveBeenCalledWith('new');
    expect(calls.modifyMsgBody).toHaveBeenCalledWith({
      msgId: 'm1',
      body: { type: 'txt', content: 'new' },
      ext: { a: 1 },
    });
    expect(r).toMatchObject({ success: true, data: { msgId: 'server-m1' } });
  });

  it('deleteContact defaults keepConversation to false', async () => {
    const { deps, calls } = makeDeps();
    await run(createApiRegistry(deps).get('ChatContactManager.deleteContact'), {
      userId: 'bob',
    });
    expect(calls.deleteContact).toHaveBeenCalledWith('bob', false);
  });

  it('createGroup maps avatarUrl->groupAvatar and returns canonical group', async () => {
    const { deps, calls } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatGroupManager.createGroup'),
      {
        groupName: 'g',
        avatarUrl: 'http://a',
        configs: { maxCount: 100 },
        inviteMembers: ['bob'],
      }
    );
    expect(calls.createGroupEx).toHaveBeenCalledWith(
      expect.objectContaining({ groupName: 'g', groupAvatar: 'http://a' })
    );
    expect(r).toMatchObject({
      success: true,
      data: { groupId: 'g1', name: 'g', isDisabled: false },
    });
  });

  it('fetchMemberListFromServer adapts to {list, cursor} with pageSize 200 default', async () => {
    const { deps, calls } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatGroupManager.fetchMemberListFromServer'),
      { groupId: 'g1' }
    );
    expect(calls.fetchMemberListFromServer).toHaveBeenCalledWith(
      'g1',
      200,
      undefined
    );
    expect(r).toEqual({
      success: true,
      data: { list: ['alice'], cursor: 'c1' },
    });
  });

  it('updateGroupName delegates to changeGroupName', async () => {
    const { deps, calls } = makeDeps();
    await run(createApiRegistry(deps).get('ChatGroupManager.updateGroupName'), {
      groupId: 'g1',
      name: 'new',
    });
    expect(calls.changeGroupName).toHaveBeenCalledWith('g1', 'new');
  });

  it('presence subscribe converts statusDetails Maps to objects', async () => {
    const { deps, calls } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatPresenceManager.subscribe'),
      { members: ['bob'], expiry: 3600 }
    );
    expect(calls.presenceSubscribe).toHaveBeenCalledWith(['bob'], 3600);
    expect(r).toMatchObject({
      success: true,
      data: [{ publisher: 'bob', statusDetails: { ios_x: 1 } }],
    });
  });

  it('fetchOwnInfo tolerates expireTime and defaults gender to 0', async () => {
    const { deps } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatUserInfoManager.fetchOwnInfo'),
      { expireTime: 60 }
    );
    expect(r).toEqual({
      success: true,
      data: { userId: 'alice', gender: 0, nickName: 'A' },
    });
  });

  it('updateUserInfo renames nickname->nickName and carries no data', async () => {
    const { deps, calls } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatUserInfoManager.updateUserInfo'),
      { nickname: 'A2', gender: 1 }
    );
    expect(calls.updateOwnUserInfo).toHaveBeenCalledWith(
      expect.objectContaining({ nickName: 'A2', gender: 1 })
    );
    expect(r).toEqual({ success: true });
  });

  it('SDK rejections map to failureKind sdk with the SDK error code', async () => {
    const { deps, calls } = makeDeps();
    calls.loginWithToken?.mockRejectedValue({
      code: 202,
      description: 'auth failed',
    });
    const r = await run(
      createApiRegistry(deps).get('ChatClient.loginWithToken'),
      { userId: 'alice', token: 'bad' }
    );
    expect(r).toEqual({
      success: false,
      failureKind: 'sdk',
      error: { code: 202, message: 'auth failed' },
    });
  });

  it('param validation failures map to failureKind tool', async () => {
    const { deps } = makeDeps();
    const r = await run(
      createApiRegistry(deps).get('ChatClient.loginWithToken'),
      {}
    );
    expect(r).toMatchObject({
      success: false,
      failureKind: 'tool',
      error: { code: -1 },
    });
  });
});

describe('init handler (contract §10 ChatClient.init)', () => {
  it('merges config with overrides (overrides win) and registers listeners', async () => {
    const { deps, calls } = makeDeps();
    const registerListeners = jest.fn();
    const handler = createInitHandler(deps, registerListeners);
    const r = await handler({
      config: { appKey: 'org#app', debugModel: false, restServer: 'a' },
      overrides: { debugModel: true },
    });
    expect(calls.withAppKey).toHaveBeenCalledWith({
      appKey: 'org#app',
      debugModel: true,
      restServer: 'a',
    });
    expect(calls.init).toHaveBeenCalledWith({
      kind: 'appKey',
      params: { appKey: 'org#app', debugModel: true, restServer: 'a' },
    });
    expect(registerListeners).toHaveBeenCalledTimes(1);
    expect(r).toEqual({ success: true });
  });

  it('maps canonical debugMode to RN debugModel when debugModel is absent', async () => {
    const { deps, calls } = makeDeps();
    const handler = createInitHandler(deps, jest.fn());
    const r = await handler({
      config: { appKey: 'org#app', debugMode: true },
      overrides: {},
    });
    expect(calls.withAppKey).toHaveBeenCalledWith({
      appKey: 'org#app',
      debugModel: true,
    });
    expect(r).toEqual({ success: true });
  });

  it('uses withAppId when appKey is absent', async () => {
    const { deps, calls } = makeDeps();
    const handler = createInitHandler(deps, jest.fn());
    await handler({ config: { appId: 'app-id' } });
    expect(calls.withAppId).toHaveBeenCalled();
    expect(calls.withAppKey).not.toHaveBeenCalled();
  });

  it('init failure maps to an sdk failure envelope', async () => {
    const { deps, calls } = makeDeps();
    calls.init?.mockRejectedValue({ code: 110, description: 'bad param' });
    const handler = createInitHandler(deps, jest.fn());
    const r = await handler({ config: { appKey: 'k' } });
    expect(r).toEqual({
      success: false,
      failureKind: 'sdk',
      error: { code: 110, message: 'bad param' },
    });
  });
});
