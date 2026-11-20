import {
  ChatMessage,
  ChatMessageDirection,
  ChatTextMessageBody,
} from 'react-native-chat-sdk';

import {
  addTearDown,
  ciTest,
  type CiCaseBody,
  type CiCaseContext,
} from '../harness';
import { registerConversationCases } from '../modules/conversation_cases';
import { waitForCi, withCiTimeout } from '../support/wait_for';

jest.mock(
  'react-native-chat-sdk',
  () => jest.requireActual('../../../../src'),
  { virtual: true }
);

jest.mock('../harness', () => ({
  addTearDown: jest.fn(),
  ciTest: jest.fn(),
}));

jest.mock('../support/wait_for', () => ({
  waitForCi: jest.fn(),
  withCiTimeout: jest.fn((promise: Promise<unknown>) => promise),
}));

function registerCase(ctx: CiCaseContext, caseId: string): CiCaseBody {
  registerConversationCases(ctx);
  const registration = jest
    .mocked(ciTest)
    .mock.calls.find(([registeredId]) => registeredId === caseId);
  expect(registration).toBeDefined();
  return registration![2];
}

async function runTearDowns(): Promise<void> {
  for (const [cleanup] of [...jest.mocked(addTearDown).mock.calls].reverse()) {
    await cleanup();
  }
}

async function executeCase(ctx: CiCaseContext, caseId: string): Promise<void> {
  const body = registerCase(ctx, caseId);
  try {
    await body(ctx);
  } finally {
    await runTearDowns();
  }
}

function latestFixture(unread: number) {
  const messages: ChatMessage[] = [];
  let exists = false;
  const conversation = {
    getMessageCount: jest.fn(async () => messages.length),
    getMsgs: jest.fn(async () => [...messages]),
    getLatestMessage: jest.fn(async () => messages[messages.length - 1]),
    getLatestReceivedMessage: jest.fn(async () =>
      [...messages]
        .reverse()
        .find((message) => message.direction === ChatMessageDirection.RECEIVE)
    ),
    getUnreadCount: jest.fn(async () => unread),
  };
  const manager = {
    getConversation: jest.fn(
      async (_convId: string, _convType: number, create: boolean) => {
        exists ||= create;
        return exists ? conversation : null;
      }
    ),
    insertMessage: jest.fn(async (message: ChatMessage) => {
      messages.push(message);
    }),
    getMessage: jest.fn(async (msgId: string) =>
      messages.find((message) => message.msgId === msgId)
    ),
    deleteConversation: jest.fn(async () => {
      exists = false;
      messages.length = 0;
    }),
    sendConversationReadAck: jest.fn(),
  };
  const ctx = {
    client: { currentUserName: 'self', chatManager: manager },
    config: { peerId: 'peer' },
  } as unknown as CiCaseContext;
  return { ctx, manager, conversation, messages };
}

function unreadFixture(options: { initialUnread?: number; failSend?: number }) {
  const events: string[] = [];
  const unrelatedUnread = 7;
  let exists = options.initialUnread != null;
  let unread = options.initialUnread ?? 0;
  let sendCount = 0;
  const pending = new Set<string>();
  const delivered = new Set<string>();
  const deliverPending = (): void => {
    for (const msgId of pending) {
      exists = true;
      unread++;
      delivered.add(msgId);
      events.push(`receive:${msgId}`);
    }
    pending.clear();
  };
  const conversation = {
    getUnreadCount: jest.fn(async () => unread),
    markAllMessagesAsRead: jest.fn(async () => {
      events.push('markAllMessagesAsRead');
      unread = 0;
    }),
  };
  const manager = {
    getConversation: jest.fn(
      async (_convId: string, _convType: number, _create: boolean) => {
        deliverPending();
        return exists ? conversation : null;
      }
    ),
    getUnreadCount: jest.fn(async () => unrelatedUnread + unread),
    getMessage: jest.fn(async (msgId: string) => {
      deliverPending();
      return delivered.has(msgId) ? { msgId } : null;
    }),
    sendConversationReadAck: jest.fn(),
  };
  const rest = {
    snapshotContacts: jest.fn(async () => ({ before: true })),
    restoreContacts: jest.fn(async () => {
      events.push('restoreContacts');
    }),
    setContacts: jest.fn(async () => {}),
    sendTextMessage: jest.fn(async () => {
      sendCount++;
      events.push(`send:${sendCount}`);
      if (sendCount === options.failSend) {
        throw new Error('REST send failed');
      }
      const msgId = `incoming-${sendCount}`;
      pending.add(msgId);
      return msgId;
    }),
  };
  const ctx = {
    client: { currentUserName: 'self', chatManager: manager },
    config: { peerId: 'peer' },
    rest,
  } as unknown as CiCaseContext;
  return { ctx, manager, conversation, rest, events, unrelatedUnread };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(waitForCi)
    .mockImplementation(async (description, read, matches) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        const value = await read();
        if (matches(value)) {
          return value;
        }
      }
      throw new Error(`host observations did not match: ${description}`);
    });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('RN-CONV-005 host case behavior (not native unread timing)', () => {
  it.each([0, 1, 2])(
    'accepts unread %i without any artificial wait',
    async (unread) => {
      jest.useFakeTimers();
      const timer = jest.spyOn(global, 'setTimeout');
      const { ctx, manager, conversation } = latestFixture(unread);

      await executeCase(ctx, 'RN-CONV-005');

      expect(conversation.getLatestMessage).toHaveBeenCalledTimes(1);
      expect(conversation.getLatestReceivedMessage).toHaveBeenCalledTimes(1);
      expect(conversation.getUnreadCount).toHaveBeenCalledTimes(3);
      expect(manager.sendConversationReadAck).toHaveBeenCalledTimes(2);
      expect(waitForCi).not.toHaveBeenCalled();
      expect(withCiTimeout).not.toHaveBeenCalled();
      expect(timer).not.toHaveBeenCalled();
      expect(manager.deleteConversation).toHaveBeenCalledTimes(1);
    }
  );

  it.each([-1, 3, 0.5, NaN])(
    'rejects invalid unread %s outside integer 0..2',
    async (unread) => {
      const { ctx, manager } = latestFixture(unread);

      await expect(executeCase(ctx, 'RN-CONV-005')).rejects.toThrow(
        `expected 0..2, got ${unread}`
      );
      expect(manager.deleteConversation).toHaveBeenCalledTimes(1);
    }
  );

  it('still rejects an incorrect latest message', async () => {
    const { ctx, conversation, messages } = latestFixture(1);
    conversation.getLatestMessage.mockImplementation(async () => messages[0]);

    await expect(executeCase(ctx, 'RN-CONV-005')).rejects.toThrow(
      'latest message: msgId'
    );
  });

  it('keeps checking the bounded snapshot after a read acknowledgement', async () => {
    const { ctx, manager, conversation } = latestFixture(0);
    conversation.getUnreadCount
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(3);

    await expect(executeCase(ctx, 'RN-CONV-005')).rejects.toThrow(
      'expected 0..2, got 3'
    );
    expect(manager.sendConversationReadAck).toHaveBeenCalledTimes(1);
    expect(manager.deleteConversation).toHaveBeenCalledTimes(1);
  });

  it('does not hide a read acknowledgement failure behind the known issue', async () => {
    const { ctx, manager } = latestFixture(2);
    manager.sendConversationReadAck.mockRejectedValueOnce(
      new Error('read acknowledgement failed')
    );

    await expect(executeCase(ctx, 'RN-CONV-005')).rejects.toThrow(
      'read acknowledgement failed'
    );
    expect(manager.deleteConversation).toHaveBeenCalledTimes(1);
  });

  it('still rejects changed stored text content', async () => {
    const { ctx, manager } = latestFixture(1);
    const getMessage = manager.getMessage.getMockImplementation()!;
    manager.getMessage.mockImplementation(async (msgId) => {
      const message = await getMessage(msgId);
      return message == null
        ? undefined
        : new ChatMessage({
            ...message,
            body: new ChatTextMessageBody({ content: 'corrupted' }),
          });
    });

    await expect(executeCase(ctx, 'RN-CONV-005')).rejects.toThrow(
      'message loaded by ID: text content'
    );
  });
});

describe('RN-CONV-019 host case lifecycle (not native unread behavior)', () => {
  it('clears an existing peer before the baseline, after receive, and in teardown', async () => {
    const { ctx, manager, conversation, rest, events, unrelatedUnread } =
      unreadFixture({ initialUnread: 4 });

    await executeCase(ctx, 'RN-CONV-019');

    expect(conversation.markAllMessagesAsRead).toHaveBeenCalledTimes(3);
    expect(events).toEqual([
      'markAllMessagesAsRead',
      'send:1',
      'send:2',
      'receive:incoming-1',
      'receive:incoming-2',
      'markAllMessagesAsRead',
      'markAllMessagesAsRead',
      'restoreContacts',
    ]);
    expect(await conversation.getUnreadCount()).toBe(0);
    expect(await manager.getUnreadCount()).toBe(unrelatedUnread);
    expect(manager.sendConversationReadAck).not.toHaveBeenCalled();
    expect(rest.restoreContacts).toHaveBeenCalledWith('self', 'peer', {
      before: true,
    });
  });

  it('handles a nonexistent fresh conversation without creating one for setup', async () => {
    const { ctx, manager, conversation, events, unrelatedUnread } =
      unreadFixture({});

    await executeCase(ctx, 'RN-CONV-019');

    expect(events[0]).toBe('send:1');
    expect(conversation.markAllMessagesAsRead).toHaveBeenCalledTimes(2);
    expect(
      manager.getConversation.mock.calls.every(([, , create]) => !create)
    ).toBe(true);
    expect(await conversation.getUnreadCount()).toBe(0);
    expect(await manager.getUnreadCount()).toBe(unrelatedUnread);
    expect(manager.sendConversationReadAck).not.toHaveBeenCalled();
  });

  it('waits for the accepted first message before cleanup when the second REST send fails', async () => {
    const { ctx, manager, conversation, events, unrelatedUnread } =
      unreadFixture({ failSend: 2 });

    await expect(executeCase(ctx, 'RN-CONV-019')).rejects.toThrow(
      'REST send failed'
    );

    expect(events).toEqual([
      'send:1',
      'send:2',
      'receive:incoming-1',
      'markAllMessagesAsRead',
      'restoreContacts',
    ]);
    expect(manager.getMessage).toHaveBeenCalledWith('incoming-1');
    expect(await conversation.getUnreadCount()).toBe(0);
    expect(await manager.getUnreadCount()).toBe(unrelatedUnread);
    expect(manager.sendConversationReadAck).not.toHaveBeenCalled();
  });

  it('does not clear a nonexistent conversation when the first REST send fails', async () => {
    const { ctx, conversation, rest } = unreadFixture({ failSend: 1 });

    await expect(executeCase(ctx, 'RN-CONV-019')).rejects.toThrow(
      'REST send failed'
    );

    expect(conversation.markAllMessagesAsRead).not.toHaveBeenCalled();
    expect(rest.restoreContacts).toHaveBeenCalledTimes(1);
  });

  it('does not swallow a baseline clearing failure for an existing conversation', async () => {
    const { ctx, conversation, rest } = unreadFixture({ initialUnread: 4 });
    conversation.markAllMessagesAsRead.mockRejectedValueOnce(
      new Error('clear failed')
    );

    await expect(executeCase(ctx, 'RN-CONV-019')).rejects.toThrow(
      'clear failed'
    );

    expect(rest.sendTextMessage).not.toHaveBeenCalled();
    expect(conversation.markAllMessagesAsRead).toHaveBeenCalledTimes(2);
    expect(rest.restoreContacts).toHaveBeenCalledTimes(1);
  });
});
