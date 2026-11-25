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

import RNFS from 'react-native-fs';
import {
  ChatCustomMessageBody,
  ChatError,
  ChatFileMessageBody,
  ChatImageMessageBody,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageDirection,
  ChatMessageStatus,
  ChatMessageType,
  ChatSearchDirection,
  ChatTextMessageBody,
  ChatConversationType,
} from 'react-native-chat-sdk';
import type {
  ChatManager,
  ChatMessageStatusCallback,
} from 'react-native-chat-sdk';

import { addTearDown, ciTest, type CiCaseContext } from '../harness';
import {
  assertDeepEqual,
  assertEqual,
  assertNotNull,
  assertNull,
  assertTrue,
  expectCiError,
} from '../support/expect';
import { uniqueCiName } from '../support/unique';
import { waitForCi, withCiTimeout } from '../support/wait_for';

type SendOutcome =
  | { kind: 'success'; message: ChatMessage }
  | { kind: 'error'; error: ChatError; localMsgId: string };

/**
 * Starts a send/download operation and waits for the final callback. The
 * method result only acknowledges submission, so the callback is the only
 * completion evidence. A method rejection is re-thrown after the callback
 * wait, so it can never replace the callback contract.
 */
async function awaitFinalCallback(
  start: (callback: ChatMessageStatusCallback) => Promise<void>,
  what: string
): Promise<SendOutcome> {
  let settle!: (outcome: SendOutcome) => void;
  const outcome = new Promise<SendOutcome>((resolve) => {
    settle = resolve;
  });
  let completed = false;
  const callback: ChatMessageStatusCallback = {
    onSuccess: (message) => {
      if (completed) {
        return;
      }
      completed = true;
      settle({ kind: 'success', message });
    },
    onError: (localMsgId, error) => {
      if (completed) {
        return;
      }
      completed = true;
      settle({ kind: 'error', error, localMsgId });
    },
  };

  let submissionError: unknown;
  try {
    await withCiTimeout(start(callback), 30000, `${what} submission`);
  } catch (e) {
    submissionError = e;
  }
  const result = await withCiTimeout(outcome, 30000, `${what} final callback`);
  if (submissionError) {
    throw submissionError;
  }
  return result;
}

async function sendAndAwaitSuccess(
  manager: ChatManager,
  message: ChatMessage,
  what: string
): Promise<ChatMessage> {
  const outcome = await awaitFinalCallback(
    (callback) => manager.sendMessage(message, callback),
    what
  );
  if (outcome.kind === 'error') {
    throw new Error(
      `${what} was rejected with ChatError ${outcome.error.code}: ` +
        outcome.error.description
    );
  }
  return outcome.message;
}

async function sendAndExpectCallbackError(
  manager: ChatManager,
  message: ChatMessage,
  code: number,
  what: string
): Promise<void> {
  const recipient = message.to;
  const outcome = await awaitFinalCallback(
    (callback) => manager.sendMessage(message, callback),
    what
  );
  if (outcome.kind === 'success') {
    throw new Error(`${what} unexpectedly succeeded`);
  }
  assertTrue(
    outcome.error instanceof ChatError,
    `${what} callback did not report a ChatError`
  );
  assertEqual(
    outcome.localMsgId,
    message.localMsgId,
    `${what} callback was correlated to a different local message`
  );
  assertEqual(
    outcome.error.code,
    code,
    `${what} returned ChatError ${outcome.error.code}: ` +
      outcome.error.description
  );
  assertEqual(message.to, recipient, `${what} did not preserve the recipient`);
}

function requireMessageLogin(ctx: CiCaseContext): {
  userId: string;
  peerId: string;
} {
  const userId =
    ctx.config.accounts?.[0]?.id ?? ctx.client.currentUserName ?? '';
  if (!userId) {
    throw new Error('message CI case requires a logged-in account');
  }
  const peerId = ctx.config.peerId ?? '';
  if (!peerId) {
    throw new Error('message CI case requires a prepared peerId');
  }
  assertTrue(
    peerId !== userId,
    'the prepared peerId must differ from the logged-in user'
  );
  return { userId, peerId };
}

let localTimeOffset = 0;

/** Unique local timestamp base so imported local IDs cannot collide. */
function nextLocalTimeBase(): number {
  localTimeOffset += 10000;
  return Date.now() - 600000 + localTimeOffset;
}

function ownedConversation(ctx: CiCaseContext, label: string): string {
  const id = uniqueCiName('msg', label);
  addTearDown(async () => {
    await ctx.client.chatManager.deleteConversation(id, true);
    assertNull(
      await ctx.client.chatManager.getConversation(
        id,
        ChatConversationType.PeerChat,
        false
      ),
      `owned conversation ${id} was not deleted`
    );
  });
  return id;
}

function buildLocalMessage(params: {
  conversationId: string;
  msgId: string;
  from: string;
  to: string;
  timestamp: number;
  outgoing: boolean;
  text?: string;
  customEvent?: string;
}): ChatMessage {
  const body = params.customEvent
    ? new ChatCustomMessageBody({ event: params.customEvent })
    : new ChatTextMessageBody({ content: params.text ?? '' });
  return new ChatMessage({
    msgId: params.msgId,
    conversationId: params.conversationId,
    from: params.from,
    to: params.to,
    localTime: params.timestamp,
    serverTime: params.timestamp,
    chatType: ChatMessageChatType.PeerChat,
    direction: params.outgoing
      ? ChatMessageDirection.SEND
      : ChatMessageDirection.RECEIVE,
    status: ChatMessageStatus.SUCCESS,
    attributes: {
      fixture: params.conversationId,
      ciStamp: `ci-${params.timestamp}`,
    },
    body,
  });
}

function assertMessage(actual: ChatMessage | undefined, expected: ChatMessage) {
  assertNotNull(actual, `message ${expected.msgId} was not found`);
  assertEqual(actual.msgId, expected.msgId);
  assertEqual(actual.conversationId, expected.conversationId);
  assertEqual(actual.from, expected.from);
  assertEqual(actual.to, expected.to);
  assertEqual(actual.direction, expected.direction);
  assertEqual(actual.body.type, expected.body.type);
  if (expected.body instanceof ChatTextMessageBody) {
    assertEqual(
      (actual.body as ChatTextMessageBody).content,
      expected.body.content
    );
  } else if (expected.body instanceof ChatCustomMessageBody) {
    assertEqual(
      (actual.body as ChatCustomMessageBody).event,
      expected.body.event
    );
  }
  assertDeepEqual(actual.attributes, expected.attributes);
}

function sortedIds(messages: ChatMessage[]): string[] {
  return messages.map((message) => message.msgId).sort();
}

function assertMessages(
  actual: ChatMessage[],
  expected: ChatMessage[],
  what: string
) {
  assertEqual(
    actual.length,
    expected.length,
    `${what}: expected ${expected.length} messages, got ${actual.length}`
  );
  assertDeepEqual(sortedIds(actual), sortedIds(expected), what);
  for (const message of expected) {
    assertMessage(
      actual.find((item) => item.msgId === message.msgId),
      message
    );
  }
}

function assertSameStrings(actual: string[], expected: string[], what: string) {
  assertDeepEqual(
    [...actual].sort(),
    [...expected].sort(),
    `${what}: got ${actual.join(', ')}, expected ${expected.join(', ')}`
  );
}

async function prepareStoredMessage(
  ctx: CiCaseContext,
  userId: string,
  label: string
): Promise<{
  conversationId: string;
  stored: ChatMessage;
  absent: ChatMessage;
}> {
  const conversationId = ownedConversation(ctx, label);
  const base = nextLocalTimeBase();
  const stored = buildLocalMessage({
    conversationId,
    msgId: uniqueCiName('msg', `${label}_stored`),
    from: userId,
    to: conversationId,
    timestamp: base + 1000,
    outgoing: true,
    text: 'stored',
  });
  const absent = buildLocalMessage({
    conversationId,
    msgId: uniqueCiName('msg', `${label}_absent`),
    from: userId,
    to: conversationId,
    timestamp: base + 2000,
    outgoing: true,
    text: 'absent',
  });
  await ctx.client.chatManager.insertMessage(stored);
  assertMessage(await ctx.client.chatManager.getMessage(stored.msgId), stored);
  const conversation = await ctx.client.chatManager.getConversation(
    conversationId,
    ChatConversationType.PeerChat,
    true
  );
  assertNotNull(conversation, `conversation ${conversationId} was not created`);
  assertEqual(
    await conversation.getMessageCount(),
    1,
    'stored-message preparation must leave exactly one message'
  );
  return { conversationId, stored, absent };
}

const ONE_PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8' +
  'z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/** Logged-in message cases (`logged_in_base` entry). */
export function registerMessageCases(ctx: CiCaseContext): void {
  const manager = ctx.client.chatManager;

  // Test: Prepare an unblocked friend, send text with attributes, and wait for
  // the correlated final server callback. Restore the original friendship and
  // both blocklists afterwards.
  // Expected: The final callback succeeds with SUCCESS and a server ID; the
  // message fields, local persistence, conversation, and conversation list are
  // all readable. This proves server send confirmation, not peer delivery.
  ciTest(
    'RN-MSG-002',
    'send text and receive the final server confirmation callback',
    async () => {
      const { userId, peerId } = requireMessageLogin(ctx);
      assertEqual(ctx.client.currentUserName, userId);

      const relationship = await ctx.rest.snapshotContacts(userId, peerId);
      const userBlocks = await ctx.rest.blockIds(userId);
      const peerBlocks = await ctx.rest.blockIds(peerId);

      // Restore the relationship before restoring blocks: teardowns run LIFO,
      // so contacts must be registered last to run first.
      addTearDown(async () => {
        await ctx.rest.setBlocked(peerId, userId, peerBlocks.includes(userId));
        await waitForCi(
          'peer blocklist restored',
          () => ctx.rest.blockIds(peerId),
          (ids) => {
            try {
              assertSameStrings(ids, peerBlocks, 'peer blocklist');
              return true;
            } catch {
              return false;
            }
          }
        );
      });
      addTearDown(async () => {
        await ctx.rest.setBlocked(userId, peerId, userBlocks.includes(peerId));
        await waitForCi(
          'sender blocklist restored',
          () => ctx.rest.blockIds(userId),
          (ids) => {
            try {
              assertSameStrings(ids, userBlocks, 'sender blocklist');
              return true;
            } catch {
              return false;
            }
          }
        );
        await waitForCi(
          'local blocklist restored',
          () => ctx.client.contactManager.getBlockListFromServer(),
          (ids) => {
            try {
              assertSameStrings(ids, userBlocks, 'local blocklist');
              return true;
            } catch {
              return false;
            }
          }
        );
      });
      addTearDown(async () => {
        await ctx.rest.restoreContacts(userId, peerId, relationship);
      });

      await ctx.rest.setBlocked(userId, peerId, false);
      await ctx.rest.setBlocked(peerId, userId, false);
      const unblockedUser = userBlocks.filter((id) => id !== peerId);
      const unblockedPeer = peerBlocks.filter((id) => id !== userId);
      assertSameStrings(
        unblockedUser,
        await ctx.rest.blockIds(userId),
        'sender blocklist after unblocking the peer'
      );
      assertSameStrings(
        unblockedPeer,
        await ctx.rest.blockIds(peerId),
        'peer blocklist after unblocking the user'
      );
      await waitForCi(
        'local blocklist excludes the peer',
        () => ctx.client.contactManager.getBlockListFromServer(),
        (ids) => !ids.includes(peerId)
      );
      await ctx.rest.setContacts(userId, peerId, true);
      assertSameStrings(
        [...relationship.userIds.filter((id) => id !== peerId), peerId],
        await ctx.rest.contactIds(userId),
        'sender contacts after ensuring friendship'
      );
      assertSameStrings(
        [...relationship.peerIds.filter((id) => id !== userId), userId],
        await ctx.rest.contactIds(peerId),
        'peer contacts after ensuring friendship'
      );
      const run = uniqueCiName('msg', 'send');
      const message = ChatMessage.createTextMessage(peerId, run);
      message.attributes = { ciCase: 'RN-MSG-002', run };
      const confirmed = await sendAndAwaitSuccess(
        manager,
        message,
        'RN-MSG-002 send'
      );
      assertEqual(confirmed.status, ChatMessageStatus.SUCCESS);
      assertTrue(confirmed.msgId.length > 0, 'server message ID is empty');
      assertEqual(confirmed.from, userId);
      assertEqual(confirmed.to, peerId);
      assertEqual(confirmed.conversationId, peerId);
      assertEqual(
        (confirmed.body as ChatTextMessageBody).content,
        run,
        'confirmed text content changed'
      );
      assertDeepEqual(
        confirmed.attributes,
        message.attributes,
        'confirmed attributes changed'
      );

      const conversation = await manager.getConversation(
        peerId,
        ChatConversationType.PeerChat,
        false
      );
      assertNotNull(conversation, 'peer conversation was not created locally');
      assertEqual(conversation.convId, peerId);
      assertMessage(await manager.getMessage(confirmed.msgId), confirmed);
      const conversations = await manager.getAllConversations();
      assertTrue(
        conversations.some((item) => item.convId === peerId),
        'peer conversation is missing from getAllConversations'
      );
      // The peer can have preexisting history; do not delete its conversation.
    },
    { timeoutMs: 90000 }
  );

  // Test: Import three local messages into an owned conversation, read two by
  // ID, then update the outgoing message's body and full attributes map.
  // Expected: Reads match only the requested messages, and the update keeps
  // the same ID while leaving the other messages unchanged.
  ciTest(
    'RN-MSG-003',
    'import, read, and update owned local messages',
    async () => {
      const { userId } = requireMessageLogin(ctx);
      const conversationId = ownedConversation(ctx, 'import');
      const base = nextLocalTimeBase();
      const first = buildLocalMessage({
        conversationId,
        msgId: uniqueCiName('msg', 'import_first'),
        from: conversationId,
        to: userId,
        timestamp: base + 1000,
        outgoing: false,
        text: 'import incoming',
      });
      const second = buildLocalMessage({
        conversationId,
        msgId: uniqueCiName('msg', 'import_second'),
        from: userId,
        to: conversationId,
        timestamp: base + 2000,
        outgoing: true,
        text: 'import outgoing',
      });
      const unselected = buildLocalMessage({
        conversationId,
        msgId: uniqueCiName('msg', 'import_unselected'),
        from: conversationId,
        to: userId,
        timestamp: base + 3000,
        outgoing: false,
        text: 'not requested',
      });

      await manager.importMessages([first, second, unselected]);
      assertMessage(await manager.getMessage(first.msgId), first);
      assertMessage(await manager.getMessage(second.msgId), second);
      assertMessages(
        await manager.getMessagesWithIds({
          convId: conversationId,
          convType: ChatConversationType.PeerChat,
          msgIds: [second.msgId, first.msgId],
        }),
        [first, second],
        'getMessagesWithIds'
      );

      const originalId = second.msgId;
      second.body = new ChatTextMessageBody({ content: 'updated outgoing' });
      second.attributes = {
        ...second.attributes,
        editStamp: `ci-${base + 2001}`,
        revision: 2,
      };
      await manager.updateMessage(second);
      const updated = await manager.getMessage(originalId);
      assertMessage(updated, second);
      assertEqual(
        updated?.msgId,
        originalId,
        'updateMessage changed the message ID'
      );
      assertMessage(await manager.getMessage(first.msgId), first);
      assertMessage(await manager.getMessage(unselected.msgId), unselected);
    }
  );

  // Test: Import matching and nonmatching messages across two conversations,
  // then query local keyword search with sender and direction filters.
  // Expected: Only keyword matches are returned; the sender filter keeps the
  // incoming matches and the timestamp filter keeps one side of the boundary.
  ciTest(
    'RN-MSG-004',
    'keyword search filters by sender and timestamp direction',
    async () => {
      const { userId } = requireMessageLogin(ctx);
      const a = ownedConversation(ctx, 'keyword_a');
      const b = ownedConversation(ctx, 'keyword_b');
      const base = nextLocalTimeBase();
      const keyword = uniqueCiName('needle', 'keyword');
      const first = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'keyword_first'),
        from: a,
        to: userId,
        timestamp: base + 1000,
        outgoing: false,
        text: `${keyword} alpha`,
      });
      const unrelated = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'keyword_unrelated'),
        from: a,
        to: userId,
        timestamp: base + 2000,
        outgoing: false,
        text: 'ordinary content',
      });
      const otherSender = buildLocalMessage({
        conversationId: b,
        msgId: uniqueCiName('msg', 'keyword_other'),
        from: b,
        to: userId,
        timestamp: base + 3000,
        outgoing: false,
        text: `${keyword} beta`,
      });
      const outgoing = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'keyword_outgoing'),
        from: userId,
        to: a,
        timestamp: base + 4000,
        outgoing: true,
        text: `${keyword} gamma`,
      });
      await manager.importMessages([first, unrelated, otherSender, outgoing]);

      assertMessages(
        await manager.getMsgsWithKeyword({ keywords: keyword, maxCount: 10 }),
        [first, otherSender, outgoing],
        'keyword search'
      );
      assertMessages(
        await manager.getMsgsWithKeyword({
          keywords: keyword,
          from: a,
          maxCount: 10,
        }),
        [first],
        'keyword search filtered by sender'
      );
      assertMessages(
        await manager.getMsgsWithKeyword({
          keywords: keyword,
          timestamp: base + 2500,
          direction: ChatSearchDirection.UP,
          maxCount: 10,
        }),
        [first],
        'keyword search older than the boundary'
      );
      assertMessages(
        await manager.getMsgsWithKeyword({
          keywords: keyword,
          timestamp: base + 2500,
          direction: ChatSearchDirection.DOWN,
          maxCount: 10,
        }),
        [otherSender, outgoing],
        'keyword search newer than the boundary'
      );
      assertEqual(
        (
          await manager.getMsgsWithKeyword({
            keywords: uniqueCiName('needle', 'absent'),
          })
        ).length,
        0,
        'an absent keyword returned messages'
      );
    }
  );

  // Test: Import text and custom messages from two senders, then query the
  // options search with message-type sets, sender, timestamp, and direction.
  // Expected: Results contain exactly the matching messages; other senders,
  // other message types, and the opposite time direction are excluded.
  ciTest(
    'RN-MSG-005',
    'options search filters message type, sender, and timestamp',
    async () => {
      const { userId } = requireMessageLogin(ctx);
      const a = ownedConversation(ctx, 'options_a');
      const b = ownedConversation(ctx, 'options_b');
      const base = nextLocalTimeBase();
      const first = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'options_first'),
        from: a,
        to: userId,
        timestamp: base + 1000,
        outgoing: false,
        text: 'first text',
      });
      const second = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'options_second'),
        from: a,
        to: userId,
        timestamp: base + 2000,
        outgoing: false,
        text: 'second text',
      });
      const custom = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'options_custom'),
        from: a,
        to: userId,
        timestamp: base + 3000,
        outgoing: false,
        customEvent: 'ci_custom',
      });
      const outgoing = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'options_outgoing'),
        from: userId,
        to: a,
        timestamp: base + 4000,
        outgoing: true,
        text: 'outgoing text',
      });
      const otherSender = buildLocalMessage({
        conversationId: b,
        msgId: uniqueCiName('msg', 'options_other'),
        from: b,
        to: userId,
        timestamp: base + 5000,
        outgoing: false,
        text: 'other sender',
      });
      await manager.importMessages([
        first,
        second,
        custom,
        outgoing,
        otherSender,
      ]);

      assertMessages(
        await manager.searchMessages({
          msgTypes: [ChatMessageType.TXT],
          timestamp: -1,
          count: 10,
          from: a,
        }),
        [first, second],
        'text search filtered by sender'
      );
      assertMessages(
        await manager.searchMessages({
          msgTypes: [ChatMessageType.CUSTOM],
          timestamp: -1,
          count: 10,
          from: a,
        }),
        [custom],
        'custom search filtered by sender'
      );
      assertMessages(
        await manager.searchMessages({
          msgTypes: [ChatMessageType.TXT, ChatMessageType.CUSTOM],
          timestamp: -1,
          count: 10,
          from: a,
        }),
        [first, second, custom],
        'text and custom search filtered by sender'
      );
      assertMessages(
        await manager.searchMessages({
          msgTypes: [ChatMessageType.TXT],
          timestamp: base + 1500,
          count: 10,
          from: a,
          direction: ChatSearchDirection.UP,
        }),
        [first],
        'text search older than the boundary'
      );
      assertMessages(
        await manager.searchMessages({
          msgTypes: [ChatMessageType.TXT],
          timestamp: base + 1500,
          count: 10,
          from: a,
          direction: ChatSearchDirection.DOWN,
        }),
        [second],
        'text search newer than the boundary'
      );
    }
  );

  // Test: Seed matching and nonmatching messages in three conversations, then
  // query the aggregated local keyword search.
  // Expected: The map keys and message IDs contain only matches; the sender
  // and timestamp filters narrow the same map, and an absent keyword is empty.
  ciTest(
    'RN-MSG-006',
    'aggregated keyword search maps conversation IDs to message IDs',
    async () => {
      const { userId } = requireMessageLogin(ctx);
      const a = ownedConversation(ctx, 'aggregate_a');
      const b = ownedConversation(ctx, 'aggregate_b');
      const c = ownedConversation(ctx, 'aggregate_nonmatching');
      const base = nextLocalTimeBase();
      const keyword = uniqueCiName('aggregate_needle', 'keyword');
      const first = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'aggregate_first'),
        from: a,
        to: userId,
        timestamp: base + 1000,
        outgoing: false,
        text: `${keyword} alpha`,
      });
      const second = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'aggregate_second'),
        from: a,
        to: userId,
        timestamp: base + 2000,
        outgoing: false,
        text: `${keyword} beta`,
      });
      const third = buildLocalMessage({
        conversationId: b,
        msgId: uniqueCiName('msg', 'aggregate_third'),
        from: b,
        to: userId,
        timestamp: base + 3000,
        outgoing: false,
        text: `${keyword} gamma`,
      });
      const sameConversationNonmatch = buildLocalMessage({
        conversationId: a,
        msgId: uniqueCiName('msg', 'aggregate_nonmatch_a'),
        from: a,
        to: userId,
        timestamp: base + 4000,
        outgoing: false,
        text: 'ordinary',
      });
      const nonmatching = buildLocalMessage({
        conversationId: c,
        msgId: uniqueCiName('msg', 'aggregate_nonmatch_c'),
        from: c,
        to: userId,
        timestamp: base + 5000,
        outgoing: false,
        text: 'ordinary',
      });
      await manager.importMessages([
        first,
        second,
        third,
        sameConversationNonmatch,
        nonmatching,
      ]);

      const matches = await manager.getConvsMsgsWithKeyword({
        keywords: keyword,
      });
      assertSameStrings(
        Array.from(matches.keys()),
        [a, b],
        'matching conversations'
      );
      assertSameStrings(
        matches.get(a) ?? [],
        [first.msgId, second.msgId],
        'matches in conversation a'
      );
      assertSameStrings(
        matches.get(b) ?? [],
        [third.msgId],
        'matches in conversation b'
      );

      const senderMatches = await manager.getConvsMsgsWithKeyword({
        keywords: keyword,
        from: a,
      });
      assertSameStrings(
        Array.from(senderMatches.keys()),
        [a],
        'sender-filtered conversations'
      );
      assertSameStrings(
        senderMatches.get(a) ?? [],
        [first.msgId, second.msgId],
        'sender-filtered matches'
      );

      const older = await manager.getConvsMsgsWithKeyword({
        keywords: keyword,
        timestamp: base + 1500,
        direction: ChatSearchDirection.UP,
      });
      assertSameStrings(
        Array.from(older.keys()),
        [a],
        'older-match conversations'
      );
      assertSameStrings(older.get(a) ?? [], [first.msgId], 'older matches');

      const absent = await manager.getConvsMsgsWithKeyword({
        keywords: uniqueCiName('aggregate_absent', 'keyword'),
      });
      assertEqual(
        absent.size,
        0,
        'an absent keyword returned conversation matches'
      );
    }
  );

  // Test: A logged-in user sends text to an empty recipient.
  // Expected: onError reports ChatError 500 and preserves the empty recipient.
  // RN's error callback exposes only the local message ID and ChatError, so the
  // native message status is not observable here.
  ciTest(
    'RN-MSG-008',
    'send text to an empty recipient reports 500 through the final callback',
    async () => {
      const { userId } = requireMessageLogin(ctx);
      assertEqual(ctx.client.currentUserName, userId);
      const message = ChatMessage.createTextMessage('', 'must not be sent');
      await sendAndExpectCallbackError(
        ctx.client.chatManager,
        message,
        500,
        'RN-MSG-008 send'
      );
    },
    { timeoutMs: 90000 }
  );

  // Test: Import one stored message into an owned conversation and read a
  // missing ID alone and mixed with the stored ID.
  // Expected: Missing-only reads are null/empty, the mixed read returns only
  // the stored message, and the conversation still contains one message.
  ciTest(
    'RN-MSG-009',
    'missing message IDs never return unrelated messages',
    async () => {
      const { userId } = requireMessageLogin(ctx);
      const { conversationId, stored, absent } = await prepareStoredMessage(
        ctx,
        userId,
        'missing'
      );
      assertNull(
        await manager.getMessage(absent.msgId),
        'a missing message was returned by getMessage'
      );
      assertEqual(
        (
          await manager.getMessagesWithIds({
            convId: conversationId,
            convType: ChatConversationType.PeerChat,
            msgIds: [absent.msgId],
          })
        ).length,
        0,
        'a missing-only ID list returned messages'
      );
      assertMessages(
        await manager.getMessagesWithIds({
          convId: conversationId,
          convType: ChatConversationType.PeerChat,
          msgIds: [absent.msgId, stored.msgId],
        }),
        [stored],
        'mixed missing and stored IDs'
      );
      const conversation = await manager.getConversation(
        conversationId,
        ChatConversationType.PeerChat,
        false
      );
      assertNotNull(conversation);
      assertEqual(await conversation.getMessageCount(), 1);
    }
  );

  // Test: With one stored local message, update a different message that has
  // never been persisted.
  // Expected: ChatError 500; the missing ID stays absent, the count stays one,
  // and the stored message keeps its original ID and content.
  ciTest(
    'RN-MSG-010',
    'updating a missing message reports 500 without inserting it',
    async () => {
      const { userId } = requireMessageLogin(ctx);
      const { conversationId, stored, absent } = await prepareStoredMessage(
        ctx,
        userId,
        'update_missing'
      );
      assertNull(await manager.getMessage(absent.msgId));
      await expectCiError(() => manager.updateMessage(absent), 500);
      assertNull(
        await manager.getMessage(absent.msgId),
        'the failed update inserted the missing message'
      );
      const conversation = await manager.getConversation(
        conversationId,
        ChatConversationType.PeerChat,
        false
      );
      assertNotNull(conversation);
      assertEqual(await conversation.getMessageCount(), 1);
      assertMessage(await manager.getMessage(stored.msgId), stored);
    }
  );

  // RN-MSG-011 (FL-MSG-010) is intentionally not registered: CiRestFixture
  // cannot send a group message or query group members, so the offline-peer
  // delivery and membership preparation cannot be reproduced safely here.

  // Test: Upload one real file and one real image to the prepared peer and
  // await each correlated final callback.
  // Expected: Both callbacks succeed with server IDs; the bodies carry the
  // server path, secret, and size, and loading them back preserves those
  // fields. This is upload confirmation, not delivery to another client.
  ciTest(
    'RN-MSG-012',
    'file and image uploads expose server attachment fields',
    async () => {
      const { peerId } = requireMessageLogin(ctx);
      const dir = `${RNFS.CachesDirectoryPath}/${uniqueCiName('msg', 'upload')}`;
      await RNFS.mkdir(dir);
      addTearDown(async () => {
        try {
          await RNFS.unlink(dir);
        } catch {
          // Best effort: the temp directory may already be gone.
        }
      });
      const run = uniqueCiName('msg', 'upload_file');
      const filePath = `${dir}/${run}.txt`;
      const payload = 'a'.repeat(512);
      await RNFS.writeFile(filePath, payload, 'utf8');

      const fileMessage = ChatMessage.createFileMessage(
        peerId,
        filePath,
        ChatMessageChatType.PeerChat,
        { displayName: `${run}.txt`, fileSize: payload.length }
      );
      const fileConfirmed = await sendAndAwaitSuccess(
        manager,
        fileMessage,
        'RN-MSG-012 file upload'
      );
      assertEqual(fileConfirmed.status, ChatMessageStatus.SUCCESS);
      assertTrue(
        fileConfirmed.msgId.length > 0,
        'file message has no server ID'
      );
      assertEqual(fileConfirmed.body.type, ChatMessageType.FILE);
      const fileBody = fileConfirmed.body as ChatFileMessageBody;
      assertEqual(fileBody.displayName, `${run}.txt`);
      assertEqual(fileBody.fileSize, payload.length);
      assertTrue(fileBody.remotePath.length > 0, 'file remotePath is empty');
      assertTrue(fileBody.secret.length > 0, 'file secret is empty');
      const storedFile = await manager.getMessage(fileConfirmed.msgId);
      assertNotNull(storedFile, 'uploaded file message was not persisted');
      assertEqual(storedFile.body.type, ChatMessageType.FILE);
      const storedFileBody = storedFile.body as ChatFileMessageBody;
      assertEqual(storedFileBody.remotePath, fileBody.remotePath);
      assertEqual(storedFileBody.secret, fileBody.secret);
      assertEqual(storedFileBody.fileSize, payload.length);

      const imagePath = `${dir}/${run}.png`;
      await RNFS.writeFile(imagePath, ONE_PIXEL_PNG_BASE64, 'base64');
      const imageMessage = ChatMessage.createImageMessage(
        peerId,
        imagePath,
        ChatMessageChatType.PeerChat,
        {
          displayName: `${run}.png`,
          fileSize: 68,
          width: 1,
          height: 1,
        }
      );
      const imageConfirmed = await sendAndAwaitSuccess(
        manager,
        imageMessage,
        'RN-MSG-012 image upload'
      );
      assertEqual(imageConfirmed.status, ChatMessageStatus.SUCCESS);
      assertTrue(
        imageConfirmed.msgId.length > 0,
        'image message has no server ID'
      );
      assertEqual(imageConfirmed.body.type, ChatMessageType.IMAGE);
      const imageBody = imageConfirmed.body as ChatImageMessageBody;
      assertTrue(
        imageBody.fileSize > 0,
        'image fileSize must stay positive after native normalization'
      );
      assertTrue(imageBody.remotePath.length > 0, 'image remotePath is empty');
      assertTrue(imageBody.secret.length > 0, 'image secret is empty');
      assertEqual(imageBody.width, 1);
      assertEqual(imageBody.height, 1);
    },
    { timeoutMs: 180000 }
  );

  // Test: Deliver five one-to-one messages from the offline peer over REST,
  // then page server history with pageSize 2 until the empty cursor.
  // Expected: Each delivered ID appears exactly once, pages respect the limit,
  // cursors never repeat, the traversal spans multiple pages, and timestamps
  // stay monotonic across page boundaries.
  ciTest(
    'RN-MSG-014',
    'server history pagination is complete and ordered',
    async () => {
      const { userId, peerId } = requireMessageLogin(ctx);
      const run = uniqueCiName('msg', 'history_page');
      const ids: string[] = [];
      for (let index = 0; index < 5; index++) {
        ids.push(
          await ctx.rest.sendTextMessage({
            from: peerId,
            to: userId,
            text: `${run} ${index}`,
          })
        );
      }
      assertEqual(new Set(ids).size, 5, 'REST message IDs are not unique');
      await waitForCi(
        'server history contains all five delivered messages',
        async () => {
          const page = await manager.fetchHistoryMessagesByOptions(
            peerId,
            ChatConversationType.PeerChat,
            { pageSize: 25 }
          );
          const seen = new Set((page.list ?? []).map((item) => item.msgId));
          return ids.every((id) => seen.has(id));
        },
        (value) => value
      );

      const seen = new Set<string>();
      const ordered: ChatMessage[] = [];
      let cursor = '';
      let reachedEnd = false;
      let pageCount = 0;
      for (let index = 0; index < 200; index++) {
        const page = await manager.fetchHistoryMessagesByOptions(
          peerId,
          ChatConversationType.PeerChat,
          cursor === '' ? { pageSize: 2 } : { cursor, pageSize: 2 }
        );
        pageCount += 1;
        const pageMessages = page.list ?? [];
        assertTrue(
          pageMessages.length <= 2,
          `server history page ${pageCount} exceeded pageSize 2`
        );
        for (const message of pageMessages) {
          assertTrue(
            !seen.has(message.msgId),
            `server history repeated ${message.msgId}`
          );
          seen.add(message.msgId);
          ordered.push(message);
        }
        const nextCursor = page.cursor ?? '';
        if (nextCursor.length === 0) {
          reachedEnd = true;
          break;
        }
        assertTrue(nextCursor !== cursor, 'server history repeated a cursor');
        cursor = nextCursor;
      }
      assertTrue(
        reachedEnd,
        'server history did not terminate within 200 pages'
      );
      assertTrue(pageCount > 1, 'fixture must span more than one server page');
      assertEqual(
        ordered.filter((message) => ids.includes(message.msgId)).length,
        5,
        'not every delivered message appeared once in server history'
      );

      let descending = true;
      let ascending = true;
      for (let index = 1; index < ordered.length; index++) {
        const previous = ordered[index - 1]!;
        const current = ordered[index]!;
        if (current.serverTime > previous.serverTime) {
          descending = false;
        }
        if (current.serverTime < previous.serverTime) {
          ascending = false;
        }
      }
      assertTrue(
        descending || ascending,
        'server history pages interleaved timestamps'
      );
    },
    { timeoutMs: 180000 }
  );

  // Test: Send one real message, pin it, read the server pinned list and pin
  // metadata, then unpin it.
  // Expected: The pinned list reports the message with this operator and a
  // positive pin time, and drops it after unpinning.
  ciTest(
    'RN-MSG-015',
    'pin and unpin a server message',
    async () => {
      const { userId, peerId } = requireMessageLogin(ctx);
      const sent = await sendAndAwaitSuccess(
        manager,
        ChatMessage.createTextMessage(peerId, uniqueCiName('msg', 'pin_text')),
        'RN-MSG-015 send'
      );
      const id = sent.msgId;
      let pinned = false;
      addTearDown(async () => {
        if (!pinned) {
          return;
        }
        try {
          await manager.unpinMessage(id);
        } catch {
          // Best effort; the primary assertion already ran.
        }
      });

      await manager.pinMessage(id);
      pinned = true;
      const pinnedList = await waitForCi(
        'server pinned list contains the sent message',
        () =>
          manager.fetchPinnedMessages(peerId, ChatConversationType.PeerChat),
        (list) => list.some((message) => message.msgId === id)
      );
      const stored = pinnedList.find((message) => message.msgId === id);
      assertNotNull(stored, 'pinned message is missing from the pinned list');
      const info = await manager.getMessagePinInfo(id);
      assertNotNull(info, 'pinned message has no pin metadata');
      assertEqual(info.operatorId, userId);
      assertTrue(info.pinTime > 0, 'pinTime must be positive');

      await manager.unpinMessage(id);
      pinned = false;
      await waitForCi(
        'server pinned list drops the unpinned message',
        () =>
          manager.fetchPinnedMessages(peerId, ChatConversationType.PeerChat),
        (list) => !list.some((message) => message.msgId === id)
      );
    },
    { timeoutMs: 120000 }
  );

  // Test: Send one real message, add a Reaction, read it through the server
  // list, the detail page, and the loaded local message, then remove it.
  // Expected: The Reaction is reported once as added by this user with the
  // user in the detail page, and disappears from the server list on removal.
  ciTest(
    'RN-MSG-016',
    'add and remove a message Reaction',
    async () => {
      const { userId, peerId } = requireMessageLogin(ctx);
      const reaction = 'ci_like';
      const sent = await sendAndAwaitSuccess(
        manager,
        ChatMessage.createTextMessage(
          peerId,
          uniqueCiName('msg', 'reaction_text')
        ),
        'RN-MSG-016 send'
      );
      const id = sent.msgId;
      let added = false;
      addTearDown(async () => {
        if (!added) {
          return;
        }
        try {
          await manager.removeReaction(reaction, id);
        } catch {
          // Best effort; the primary assertion already ran.
        }
      });

      await manager.addReaction(reaction, id);
      added = true;
      const reactions = await waitForCi(
        'server reaction list reports the added Reaction',
        () => manager.fetchReactionList([id], '', ChatMessageChatType.PeerChat),
        (map) =>
          (map.get(id) ?? []).some(
            (item) =>
              item.reaction === reaction &&
              item.isAddedBySelf &&
              item.count >= 1
          )
      );
      const item = (reactions.get(id) ?? []).find(
        (entry) => entry.reaction === reaction
      );
      assertNotNull(item, 'added Reaction is missing from the server list');
      assertTrue(item.count >= 1, 'Reaction count must be at least one');

      const detail = await manager.fetchReactionDetail(id, reaction);
      assertNotNull(detail.list, 'Reaction detail page has no list');
      assertTrue(
        detail.list.some((entry) => entry.reaction === reaction),
        'Reaction detail does not contain the added Reaction'
      );
      assertTrue(
        detail.list.some((entry) => entry.userList.includes(userId)),
        'Reaction detail does not contain the current user'
      );

      const local = await manager.getMessage(id);
      assertNotNull(local, 'sent message is missing from the local database');
      const localReactions = await local.reactionList;
      assertTrue(
        localReactions.some((entry) => entry.reaction === reaction),
        'loaded message does not report the added Reaction'
      );

      await manager.removeReaction(reaction, id);
      added = false;
      await waitForCi(
        'server reaction list drops the removed Reaction',
        () => manager.fetchReactionList([id], '', ChatMessageChatType.PeerChat),
        (map) =>
          !(map.get(id) ?? []).some(
            (entry) => entry.reaction === reaction && entry.isAddedBySelf
          )
      );
    },
    { timeoutMs: 120000 }
  );

  // Test: Import a local message carrying a text body and a custom body, read
  // it back, then update its attributes and read it back again.
  // Expected: Both bodies keep their type, content and order through the
  // import, the read-back and the update (updateMessage must not collapse the
  // message to a single body); contentType is MULTIBODY and `body` is the
  // first body.
  ciTest(
    'RN-MSG-017',
    'multi-body message keeps every body through import, read-back and update',
    async () => {
      const { userId } = requireMessageLogin(ctx);
      const conversationId = ownedConversation(ctx, 'multi_body');
      const message = buildLocalMessage({
        conversationId,
        msgId: uniqueCiName('msg', 'multi_body'),
        from: conversationId,
        to: userId,
        timestamp: nextLocalTimeBase() + 1000,
        outgoing: false,
        text: 'multi first',
      });
      message.bodies = [
        new ChatTextMessageBody({ content: 'multi first' }),
        new ChatCustomMessageBody({ event: 'multi_second' }),
      ];

      const assertBodies = (actual: ChatMessage | undefined, what: string) => {
        assertNotNull(actual, `${what}: message was not found`);
        assertEqual(actual.bodies.length, 2, `${what}: expected 2 bodies`);
        assertEqual(
          actual.contentType,
          ChatMessageType.MULTIBODY,
          `${what}: contentType must be MULTIBODY`
        );
        assertEqual(actual.body.type, ChatMessageType.TXT);
        assertEqual(actual.bodies[0]?.type, ChatMessageType.TXT);
        assertEqual(
          (actual.bodies[0] as ChatTextMessageBody).content,
          'multi first'
        );
        assertEqual(actual.bodies[1]?.type, ChatMessageType.CUSTOM);
        assertEqual(
          (actual.bodies[1] as ChatCustomMessageBody).event,
          'multi_second'
        );
      };

      await manager.importMessages([message]);
      assertBodies(await manager.getMessage(message.msgId), 'read-back');

      message.attributes = { ...message.attributes, revision: 2 };
      await manager.updateMessage(message);
      assertBodies(
        await manager.getMessage(message.msgId),
        'after updateMessage'
      );
    }
  );

  // Test: Send one real message carrying two text bodies to the peer.
  // Expected: The server-confirmed message and the locally stored copy keep
  // both text bodies in order, contentType is MULTIBODY and `body` is the
  // first body. Image bodies are intentionally not covered: they need sample
  // files that differ between local and cloud runs.
  ciTest(
    'RN-MSG-018',
    'send a multi-body text message and keep both bodies',
    async () => {
      const { userId, peerId } = requireMessageLogin(ctx);
      const run = uniqueCiName('msg', 'multi_send');
      const first = `${run}_first`;
      const second = `${run}_second`;
      const message = ChatMessage.createSendMessage({
        bodies: [
          new ChatTextMessageBody({ content: first }),
          new ChatTextMessageBody({ content: second }),
        ],
        targetId: peerId,
        chatType: ChatMessageChatType.PeerChat,
      });
      const confirmed = await sendAndAwaitSuccess(
        manager,
        message,
        'RN-MSG-018 send'
      );
      assertEqual(confirmed.status, ChatMessageStatus.SUCCESS);
      assertTrue(confirmed.msgId.length > 0, 'server message ID is empty');
      assertEqual(confirmed.from, userId);
      assertEqual(confirmed.to, peerId);

      const assertBodies = (actual: ChatMessage | undefined, what: string) => {
        assertNotNull(actual, `${what}: message was not found`);
        assertEqual(actual.bodies.length, 2, `${what}: expected 2 bodies`);
        assertEqual(
          actual.contentType,
          ChatMessageType.MULTIBODY,
          `${what}: contentType must be MULTIBODY`
        );
        assertEqual(actual.bodies[0]?.type, ChatMessageType.TXT);
        assertEqual(actual.bodies[1]?.type, ChatMessageType.TXT);
        assertEqual((actual.bodies[0] as ChatTextMessageBody).content, first);
        assertEqual((actual.bodies[1] as ChatTextMessageBody).content, second);
        assertEqual((actual.body as ChatTextMessageBody).content, first);
      };

      assertBodies(confirmed, 'confirmed message');
      assertBodies(await manager.getMessage(confirmed.msgId), 'stored message');
      // The peer can have preexisting history; do not delete its conversation.
    },
    { timeoutMs: 90000 }
  );
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

  // Test: Send text to a nonempty recipient while logged out. The per-send
  // callback is registered before submission and correlated by local message
  // ID, because the method result only acknowledges submission.
  // Expected: onError reports ChatError 201 and preserves the recipient.
  // RN's error callback exposes only the local message ID and ChatError, so
  // the native message status is not observable here.
  ciTest(
    'RN-MSG-007',
    'send text while logged out reports 201 through the final callback',
    async () => {
      const target = 'rn-ci-logged-out-peer';
      assertTrue(
        !ctx.client.currentUserName,
        'the logged-out message entry must not have a current user'
      );
      const message = ChatMessage.createTextMessage(
        target,
        'must not be sent while logged out'
      );
      await sendAndExpectCallbackError(
        ctx.client.chatManager,
        message,
        201,
        'RN-MSG-007 send'
      );
    },
    { timeoutMs: 90000 }
  );
}
