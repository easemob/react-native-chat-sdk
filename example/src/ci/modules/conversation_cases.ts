/**
 * CONV domain CI cases (`RN-CONV-*`): conversation APIs and the local
 * database behavior behind them.
 *
 * Both registrars share the uniform harness contract: they only collect
 * `ciTest` registrations while the owning entry module loads; nothing
 * executes until `runCiSuites` runs. `registerConversationCases` is wired
 * into the `logged_in_base` entry; `registerConversationLoggedOutCases`
 * collects the no-login negative cases for the `logged_out` entry.
 *
 * ChatPushManager has no dedicated CI module (the module domains in spec
 * §5.7 define no PUSH prefix); its cases are hosted here because the
 * silent mode is conversation notification state.
 */

import {
  ChatConversationMarkType,
  ChatConversationType,
  ChatLocationMessageBody,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageDirection,
  ChatMessageStatus,
  ChatMessageType,
  ChatSearchDirection,
  ChatTextMessageBody,
  type ChatConversation,
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

const PEER_CHAT = ChatConversationType.PeerChat;

/**
 * The conversation peer: the second configured account when available,
 * otherwise `config.peerId`; it must differ from the logged-in account.
 */
function requirePeerId(ctx: CiCaseContext): string {
  const userId = ctx.client.currentUserName;
  const peer = ctx.config.accounts?.[1]?.id ?? ctx.config.peerId;
  if (peer == null || peer.length === 0 || peer === userId) {
    throw new Error(
      'ci_run.json: conversation cases need a peer ' +
        '(config.accounts[1].id or config.peerId) different from ' +
        'config.accounts[0].id'
    );
  }
  return peer;
}

let fixtureSequence = 0;

interface ConversationFixture {
  convId: string;
  conversation: ChatConversation;
  /** Builds an outgoing or incoming text message fixture. */
  text(content: string, timestamp: number, outgoing?: boolean): ChatMessage;
  /** Builds an incoming or outgoing location message fixture. */
  location(timestamp: number, outgoing?: boolean): ChatMessage;
}

/**
 * Creates a unique local conversation and registers a fail-safe teardown
 * that recreates it when needed and deletes it with its messages.
 */
async function prepareConversation(
  ctx: CiCaseContext,
  label: string
): Promise<ConversationFixture> {
  const manager = ctx.client.chatManager;
  const convId = uniqueCiName('conv', `${label}_${++fixtureSequence}`);

  const absent = await manager.getConversation(convId, PEER_CHAT, false);
  assertNull(absent, `conversation ${convId} must not exist before setup`);

  const conversation = await manager.getConversation(convId, PEER_CHAT, true);
  assertNotNull(conversation, `conversation ${convId} must be created`);

  addTearDown(async () => {
    await deleteConversationFixture(ctx, convId);
  });

  let messageSequence = 0;
  const build = (
    body: ChatTextMessageBody | ChatLocationMessageBody,
    timestamp: number,
    outgoing: boolean
  ): ChatMessage =>
    new ChatMessage({
      msgId: `${convId}_${++messageSequence}`,
      conversationId: convId,
      from: outgoing ? ctx.client.currentUserName : convId,
      to: outgoing ? convId : ctx.client.currentUserName,
      localTime: timestamp,
      serverTime: timestamp,
      chatType: ChatMessageChatType.PeerChat,
      direction: outgoing
        ? ChatMessageDirection.SEND
        : ChatMessageDirection.RECEIVE,
      status: ChatMessageStatus.SUCCESS,
      attributes: { fixture: convId, ciStamp: `ci-${timestamp}` },
      body,
    });

  return {
    convId,
    conversation,
    text: (content, timestamp, outgoing = false) =>
      build(new ChatTextMessageBody({ content }), timestamp, outgoing),
    location: (timestamp, outgoing = false) =>
      build(
        new ChatLocationMessageBody({
          latitude: '39.9',
          longitude: '116.4',
          address: 'ci place',
        }),
        timestamp,
        outgoing
      ),
  };
}

/** Recreates the conversation when necessary, then deletes it and checks it. */
async function deleteConversationFixture(
  ctx: CiCaseContext,
  convId: string
): Promise<void> {
  const manager = ctx.client.chatManager;
  try {
    await manager.getConversation(convId, PEER_CHAT, true);
  } finally {
    await manager.deleteConversation(convId, true);
  }
  const remaining = await manager.getConversation(convId, PEER_CHAT, false);
  assertNull(remaining, `cleanup must delete conversation ${convId}`);
}

/** Loads every message of a conversation in ascending timestamp order. */
async function loadAllMessages(
  conversation: ChatConversation
): Promise<ChatMessage[]> {
  return conversation.getMsgs({
    startMsgId: '',
    direction: ChatSearchDirection.DOWN,
    loadCount: 20,
  });
}

function messageIds(messages: ChatMessage[]): string[] {
  return messages.map((message) => message.msgId);
}

/** Compares message IDs as a set: same members, no duplicates, any order. */
function assertUnorderedMessageIds(
  actual: ChatMessage[],
  expected: ChatMessage[],
  what: string
): void {
  assertEqual(
    actual.length,
    expected.length,
    `${what}: expected ${expected.length} messages, got ${actual.length}`
  );
  assertDeepEqual(
    [...messageIds(actual)].sort(),
    [...messageIds(expected)].sort(),
    `${what}: expected [${messageIds(expected).join(', ')}], got [${messageIds(actual).join(', ')}]`
  );
}

/** Compares message IDs in order. */
function assertOrderedMessageIds(
  actual: ChatMessage[],
  expected: ChatMessage[],
  what: string
): void {
  assertDeepEqual(
    messageIds(actual),
    messageIds(expected),
    `${what}: expected [${messageIds(expected).join(', ')}], got [${messageIds(actual).join(', ')}]`
  );
}

function sortByServerTime(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => a.serverTime - b.serverTime);
}

/**
 * Asserts that the stored message keeps its identity, routing fields and
 * attributes; text bodies also keep their content.
 */
function assertStoredMessage(
  actual: ChatMessage | null | undefined,
  expected: ChatMessage,
  what: string
): void {
  assertNotNull(actual, `${what}: message not found`);
  assertEqual(actual.msgId, expected.msgId, `${what}: msgId`);
  assertEqual(
    actual.conversationId,
    expected.conversationId,
    `${what}: conversationId`
  );
  assertEqual(actual.from, expected.from, `${what}: from`);
  assertEqual(actual.to, expected.to, `${what}: to`);
  assertEqual(actual.direction, expected.direction, `${what}: direction`);
  assertDeepEqual(
    actual.attributes,
    expected.attributes,
    `${what}: attributes`
  );
  assertEqual(actual.body.type, expected.body.type, `${what}: body type`);
  if (expected.body.type === ChatMessageType.TXT) {
    assertEqual(
      (actual.body as ChatTextMessageBody).content,
      (expected.body as ChatTextMessageBody).content,
      `${what}: text content`
    );
  }
}

/** Asserts the message count and the exact (unordered) message set. */
async function expectConversationMessages(
  conversation: ChatConversation,
  expected: ChatMessage[],
  what: string
): Promise<void> {
  assertEqual(
    await conversation.getMessageCount(),
    expected.length,
    `${what}: message count`
  );
  assertUnorderedMessageIds(
    await loadAllMessages(conversation),
    expected,
    what
  );
}

/** Logged-in conversation cases (`logged_in_base` entry). */
export function registerConversationCases(ctx: CiCaseContext): void {
  // Test: Fetch all conversations, mirroring single_account.json
  // chat.getAllConversations. Expected: a successful read-only fetch with a
  // list shape; the case asserts no specific data.
  ciTest(
    'RN-CONV-001',
    'getAllConversations returns a conversation list',
    async () => {
      const conversations = await ctx.client.chatManager.getAllConversations();
      assertTrue(
        Array.isArray(conversations),
        'getAllConversations must resolve to a list'
      );
      for (const conversation of conversations) {
        assertTrue(
          conversation.convId.length > 0,
          'a conversation needs a nonempty convId'
        );
      }
    }
  );

  // Test: Fetch the app-wide silent mode, mirroring single_account.json
  // push.fetchSilentModeForAll. Expected: a successful read-only fetch with
  // a result object.
  ciTest(
    'RN-CONV-002',
    'fetchSilentModeForAll returns the silent mode result',
    async () => {
      const result = await ctx.client.pushManager.fetchSilentModeForAll();
      assertNotNull(result);
      assertEqual(typeof result.conversationId, 'string');
    }
  );

  // Port of FL-CONV-001: setting the conversation extension replaces the
  // stored value; deleting the conversation with messages removes both the
  // conversation and its history.
  ciTest(
    'RN-CONV-004',
    'setConversationExtension replaces ext and deletion removes history',
    async () => {
      const manager = ctx.client.chatManager;
      const fixture = await prepareConversation(ctx, 'extension');
      const base = Date.now();
      const seed = fixture.text('extension seed', base + 1000);
      await ctx.client.chatManager.insertMessage(seed);

      const firstExt = { owner: 'rn-ci', run: fixture.convId };
      await manager.setConversationExtension(
        fixture.convId,
        PEER_CHAT,
        firstExt
      );
      let reread = await manager.getConversation(
        fixture.convId,
        PEER_CHAT,
        false
      );
      assertNotNull(reread);
      assertEqual(reread.convId, fixture.convId);
      assertEqual(reread.convType, ChatConversationType.PeerChat);
      assertDeepEqual(reread.ext, firstExt, 'first extension value');

      const secondExt = { replacement: 'second value' };
      await manager.setConversationExtension(
        fixture.convId,
        PEER_CHAT,
        secondExt
      );
      reread = await manager.getConversation(fixture.convId, PEER_CHAT, false);
      assertNotNull(reread);
      assertEqual(reread.convId, fixture.convId);
      assertEqual(reread.convType, ChatConversationType.PeerChat);
      assertDeepEqual(reread.ext, secondExt, 'second extension value');

      let all = await manager.getAllConversations();
      assertTrue(
        all.some((conversation) => conversation.convId === fixture.convId),
        'the prepared conversation must be listed'
      );

      await manager.deleteConversation(fixture.convId, true);
      assertNull(
        await manager.getConversation(fixture.convId, PEER_CHAT, false),
        'the deleted conversation must be gone'
      );
      all = await manager.getAllConversations();
      assertTrue(
        all.every((conversation) => conversation.convId !== fixture.convId),
        'the deleted conversation must not be listed'
      );

      const recreated = await manager.getConversation(
        fixture.convId,
        PEER_CHAT,
        true
      );
      assertNotNull(recreated);
      assertEqual(await recreated.getMessageCount(), 0);
    }
  );

  // Port of FL-CONV-002: latest message, latest received message, loading a
  // message by ID and clearing an already-clear unread count.
  ciTest(
    'RN-CONV-005',
    'latest messages and unread state reflect stored messages',
    async () => {
      const manager = ctx.client.chatManager;
      const fixture = await prepareConversation(ctx, 'latest');
      const base = Date.now();
      const first = fixture.text('first received', base + 1000);
      const lastReceived = fixture.text('last received', base + 2000);
      const sent = fixture.text('latest sent', base + 3000, true);
      await ctx.client.chatManager.insertMessage(first);
      await ctx.client.chatManager.insertMessage(lastReceived);
      await ctx.client.chatManager.insertMessage(sent);

      await expectConversationMessages(
        fixture.conversation,
        [first, lastReceived, sent],
        'stored messages'
      );

      assertStoredMessage(
        await fixture.conversation.getLatestMessage(),
        sent,
        'latest message'
      );
      assertStoredMessage(
        await fixture.conversation.getLatestReceivedMessage(),
        lastReceived,
        'latest received message'
      );
      assertStoredMessage(
        await manager.getMessage(first.msgId),
        first,
        'message loaded by ID'
      );
      assertEqual(await fixture.conversation.getUnreadCount(), 0);

      await manager.clearConversationUnreadMessageCount(fixture.convId);
      assertEqual(await fixture.conversation.getUnreadCount(), 0);
      await manager.clearConversationUnreadMessageCount(fixture.convId);
      assertEqual(await fixture.conversation.getUnreadCount(), 0);
    }
  );

  // Port of FL-CONV-003: updating a message body and attributes persists
  // both, and deleting it leaves the other message intact.
  ciTest(
    'RN-CONV-006',
    'updateMessage persists body and attributes, deleteMessage keeps others',
    async () => {
      const manager = ctx.client.chatManager;
      const fixture = await prepareConversation(ctx, 'update');
      const base = Date.now();
      const beforeUpdate = fixture.text('before update', base + 1000);
      const control = fixture.text('keep this message', base + 2000);
      await ctx.client.chatManager.insertMessage(beforeUpdate);
      await ctx.client.chatManager.insertMessage(control);

      const update = await manager.getMessage(beforeUpdate.msgId);
      assertNotNull(update);
      update.body = new ChatTextMessageBody({ content: 'after update' });
      update.attributes = {
        ...update.attributes,
        ciStamp: `ci-${base + 1001}`,
        updated: true,
        version: 2,
      };
      await fixture.conversation.updateMessage(update);

      const reread = await manager.getMessage(beforeUpdate.msgId);
      assertNotNull(reread);
      assertEqual(reread.msgId, beforeUpdate.msgId);
      assertEqual(reread.body.type, ChatMessageType.TXT);
      assertEqual((reread.body as ChatTextMessageBody).content, 'after update');
      assertDeepEqual(reread.attributes, {
        fixture: fixture.convId,
        ciStamp: `ci-${base + 1001}`,
        updated: true,
        version: 2,
      });

      await fixture.conversation.deleteMessage(beforeUpdate.msgId);
      await expectConversationMessages(
        fixture.conversation,
        [control],
        'after deleting the updated message'
      );
      assertStoredMessage(
        await manager.getMessage(control.msgId),
        control,
        'remaining control message'
      );
    }
  );

  // Port of FL-CONV-004: cursor-based paging excludes the cursor message,
  // reaches both ends and covers the full history.
  ciTest(
    'RN-CONV-007',
    'getMsgs pages around a cursor and reaches both ends',
    async () => {
      const fixture = await prepareConversation(ctx, 'paging');
      const base = Date.now();
      const seed1 = fixture.text('page 1', base + 1000);
      const seed2 = fixture.text('page 2', base + 2000);
      const seed3 = fixture.text('page 3', base + 3000);
      const seed4 = fixture.text('page 4', base + 4000);
      const seed5 = fixture.text('page 5', base + 5000);
      const seeds = [seed1, seed2, seed3, seed4, seed5];
      for (const seed of seeds) {
        await ctx.client.chatManager.insertMessage(seed);
      }

      const upFirst = await fixture.conversation.getMsgs({
        startMsgId: '',
        direction: ChatSearchDirection.UP,
        loadCount: 2,
      });
      assertUnorderedMessageIds(upFirst, [seed5, seed4], 'UP first page');

      const upSecond = await fixture.conversation.getMsgs({
        startMsgId: seed4.msgId,
        direction: ChatSearchDirection.UP,
        loadCount: 2,
      });
      assertUnorderedMessageIds(upSecond, [seed3, seed2], 'UP second page');

      const upThird = await fixture.conversation.getMsgs({
        startMsgId: seed2.msgId,
        direction: ChatSearchDirection.UP,
        loadCount: 2,
      });
      assertUnorderedMessageIds(upThird, [seed1], 'UP third page');

      assertOrderedMessageIds(
        sortByServerTime([...upFirst, ...upSecond, ...upThird]),
        seeds,
        'UP pages cover the history'
      );

      const beforeOldest = await fixture.conversation.getMsgs({
        startMsgId: seed1.msgId,
        direction: ChatSearchDirection.UP,
        loadCount: 2,
      });
      assertEqual(beforeOldest.length, 0, 'UP before the oldest is empty');

      const downFirst = await fixture.conversation.getMsgs({
        startMsgId: seed1.msgId,
        direction: ChatSearchDirection.DOWN,
        loadCount: 3,
      });
      assertOrderedMessageIds(
        downFirst,
        [seed2, seed3, seed4],
        'DOWN first page'
      );

      const downSecond = await fixture.conversation.getMsgs({
        startMsgId: seed4.msgId,
        direction: ChatSearchDirection.DOWN,
        loadCount: 3,
      });
      assertOrderedMessageIds(downSecond, [seed5], 'DOWN second page');

      assertOrderedMessageIds(
        sortByServerTime([...downFirst, ...downSecond]),
        [seed2, seed3, seed4, seed5],
        'DOWN pages cover the newer history'
      );

      const afterNewest = await fixture.conversation.getMsgs({
        startMsgId: seed5.msgId,
        direction: ChatSearchDirection.DOWN,
        loadCount: 3,
      });
      assertEqual(afterNewest.length, 0, 'DOWN after the newest is empty');
    }
  );

  // Port of FL-CONV-005: keyword, message-type, sender, timestamp and local
  // count queries over a mixed text/location history.
  ciTest(
    'RN-CONV-008',
    'message search filters by keyword, type, sender and time',
    async () => {
      const fixture = await prepareConversation(ctx, 'search');
      const base = Date.now();
      const alpha = fixture.text('needle alpha', base + 1000);
      const beta = fixture.text('ordinary beta', base + 2000);
      const own = fixture.text('needle own', base + 3000, true);
      const place = fixture.location(base + 4000);
      const later = fixture.text('needle later', base + 5000);
      for (const seed of [alpha, beta, own, place, later]) {
        await ctx.client.chatManager.insertMessage(seed);
      }

      assertUnorderedMessageIds(
        await fixture.conversation.getMsgsWithKeyword({
          keywords: 'needle',
          count: 10,
          timestamp: base + 60_000,
        }),
        [alpha, own, later],
        'keyword needle'
      );
      assertUnorderedMessageIds(
        await fixture.conversation.getMsgsWithKeyword({
          keywords: 'needle',
          count: 10,
          senders: [fixture.convId],
          timestamp: base + 60_000,
        }),
        [alpha, later],
        'keyword needle from the peer'
      );
      assertEqual(
        (
          await fixture.conversation.getMsgsWithKeyword({
            keywords: 'absent-keyword',
            count: 10,
            timestamp: base + 60_000,
          })
        ).length,
        0,
        'absent keyword'
      );

      assertUnorderedMessageIds(
        await fixture.conversation.getMsgsWithMsgType({
          msgType: ChatMessageType.TXT,
          count: 10,
          timestamp: base + 60_000,
        }),
        [alpha, beta, own, later],
        'text messages'
      );
      assertUnorderedMessageIds(
        await fixture.conversation.getMsgsWithMsgType({
          msgType: ChatMessageType.LOCATION,
          count: 10,
          timestamp: base + 60_000,
        }),
        [place],
        'location messages'
      );
      assertUnorderedMessageIds(
        await fixture.conversation.getMsgsWithMsgType({
          msgType: ChatMessageType.TXT,
          count: 10,
          sender: fixture.convId,
          timestamp: base + 60_000,
        }),
        [alpha, beta, later],
        'text messages from the peer'
      );

      assertUnorderedMessageIds(
        await fixture.conversation.searchMessages({
          msgTypes: [ChatMessageType.TXT],
          from: fixture.convId,
          timestamp: base + 3500,
          count: 10,
          direction: ChatSearchDirection.UP,
        }),
        [alpha, beta],
        'search before the outgoing text'
      );
      assertEqual(
        (
          await fixture.conversation.getMsgsWithMsgType({
            msgType: ChatMessageType.VOICE,
            count: 10,
            timestamp: base + 60_000,
          })
        ).length,
        0,
        'no voice messages'
      );

      assertUnorderedMessageIds(
        await fixture.conversation.getMsgWithTimestamp({
          startTime: base + 500,
          endTime: base + 3500,
          count: 10,
        }),
        [alpha, beta, own],
        'messages in the first time window'
      );
      assertEqual(
        (
          await fixture.conversation.getMsgWithTimestamp({
            startTime: base + 6000,
            endTime: base + 7000,
            count: 10,
          })
        ).length,
        0,
        'empty time window'
      );
      assertEqual(
        await fixture.conversation.getMessageCountWithTimestamp(
          base + 500,
          base + 2500
        ),
        2,
        'count in the first time window'
      );
      assertEqual(
        await fixture.conversation.getMessageCountWithTimestamp(
          base + 6000,
          base + 7000
        ),
        0,
        'count in the empty time window'
      );
    }
  );

  // Port of FL-CONV-006: deleting by ID, by timestamp range and by
  // conversation, with the message count settling after the final delete.
  ciTest(
    'RN-CONV-009',
    'deleteMessage, deleteMessagesWithTimestamp and deleteAllMessages',
    async () => {
      const manager = ctx.client.chatManager;
      const fixture = await prepareConversation(ctx, 'delete');
      const base = Date.now();
      const seed1 = fixture.text('delete 1', base + 1000);
      const seed2 = fixture.text('delete 2', base + 2000);
      const seed3 = fixture.text('delete 3', base + 3000);
      const seed4 = fixture.text('delete 4', base + 4000);
      for (const seed of [seed1, seed2, seed3, seed4]) {
        await ctx.client.chatManager.insertMessage(seed);
      }
      await expectConversationMessages(
        fixture.conversation,
        [seed1, seed2, seed3, seed4],
        'all delete fixtures'
      );

      await fixture.conversation.deleteMessage(seed1.msgId);
      await fixture.conversation.deleteMessage(seed3.msgId);
      await expectConversationMessages(
        fixture.conversation,
        [seed2, seed4],
        'after deleting two messages'
      );

      await fixture.conversation.deleteMessagesWithTimestamp({
        startTs: base + 1500,
        endTs: base + 2500,
      });
      await expectConversationMessages(
        fixture.conversation,
        [seed4],
        'after deleting the timestamp range'
      );
      assertStoredMessage(
        await manager.getMessage(seed4.msgId),
        seed4,
        'message outside the deleted range'
      );

      await fixture.conversation.deleteAllMessages();
      await waitForCi(
        'message count reaches zero',
        () => fixture.conversation.getMessageCount(),
        (count) => count === 0,
        5_000
      );
      assertEqual((await loadAllMessages(fixture.conversation)).length, 0);
    }
  );

  // Port of FL-CONV-007: deleting a conversation without its messages keeps
  // the history available after the conversation is recreated.
  ciTest(
    'RN-CONV-010',
    'deleteConversation without messages retains local history',
    async () => {
      const manager = ctx.client.chatManager;
      const fixture = await prepareConversation(ctx, 'retain');
      const base = Date.now();
      const seed = fixture.text('retained history', base + 1000);
      await ctx.client.chatManager.insertMessage(seed);

      await manager.deleteConversation(fixture.convId, false);
      const all = await manager.getAllConversations();
      assertTrue(
        all.every((conversation) => conversation.convId !== fixture.convId),
        'the deleted conversation must not be listed'
      );
      assertStoredMessage(
        await manager.getMessage(seed.msgId),
        seed,
        'message kept after conversation deletion'
      );

      const reopened = await manager.getConversation(
        fixture.convId,
        PEER_CHAT,
        true
      );
      assertNotNull(reopened);
      await expectConversationMessages(reopened, [seed], 'reopened history');
    }
  );

  // Port of FL-CONV-008: batch deletion removes the listed conversations
  // only and keeps the control conversation and its messages.
  ciTest(
    'RN-CONV-011',
    'deleteConversations removes only the listed conversations',
    async () => {
      const manager = ctx.client.chatManager;
      const first = await prepareConversation(ctx, 'batch_first');
      const second = await prepareConversation(ctx, 'batch_second');
      const control = await prepareConversation(ctx, 'batch_control');
      const base = Date.now();
      const firstSeed = first.text('batch deletion seed', base + 1000);
      const secondSeed = second.text('batch deletion seed', base + 2000);
      const controlSeed = control.text('batch deletion seed', base + 3000);
      await ctx.client.chatManager.insertMessage(firstSeed);
      await ctx.client.chatManager.insertMessage(secondSeed);
      await ctx.client.chatManager.insertMessage(controlSeed);

      await manager.deleteConversations([
        first.convId,
        second.convId,
        `${first.convId}_absent`,
      ]);

      const all = await manager.getAllConversations();
      assertTrue(
        all.every(
          (conversation) =>
            conversation.convId !== first.convId &&
            conversation.convId !== second.convId
        ),
        'deleted conversations must not be listed'
      );
      assertTrue(
        all.some((conversation) => conversation.convId === control.convId),
        'the control conversation must remain listed'
      );
      await expectConversationMessages(
        control.conversation,
        [controlSeed],
        'control conversation history'
      );
      assertStoredMessage(
        await manager.getMessage(controlSeed.msgId),
        controlSeed,
        'control message'
      );

      for (const fixture of [first, second]) {
        assertNull(
          await manager.getConversation(fixture.convId, PEER_CHAT, false),
          `conversation ${fixture.convId} must be deleted`
        );
        const reopened = await manager.getConversation(
          fixture.convId,
          PEER_CHAT,
          true
        );
        assertNotNull(reopened);
        assertEqual(await reopened.getMessageCount(), 0);
      }
    }
  );

  // Port of FL-CONV-009: updating a message that was never stored fails with
  // 500 and does not change the stored message set.
  ciTest(
    'RN-CONV-012',
    'updating an absent message throws 500 and leaves storage unchanged',
    async () => {
      const manager = ctx.client.chatManager;
      const fixture = await prepareConversation(ctx, 'absent_update');
      const base = Date.now();
      const stored = fixture.text('stored', base + 1000, true);
      const absent = fixture.text('absent', base + 2000, true);
      await ctx.client.chatManager.insertMessage(stored);

      assertEqual(await fixture.conversation.getMessageCount(), 1);
      assertNull(await manager.getMessage(absent.msgId));
      await expectCiError(
        () => fixture.conversation.updateMessage(absent),
        500
      );
      assertNull(await manager.getMessage(absent.msgId));
      assertEqual(await fixture.conversation.getMessageCount(), 1);

      await expectConversationMessages(
        fixture.conversation,
        [stored],
        'storage after the failed update'
      );
      assertStoredMessage(
        await manager.getMessage(stored.msgId),
        stored,
        'stored message after the failed update'
      );
    }
  );

  // Port of FL-CONV-010: getAllConversations sorts newest first by default
  // and when asked, while the unsorted variant keeps the same members.
  ciTest(
    'RN-CONV-013',
    'getAllConversations sort flag changes order, not membership',
    async () => {
      const manager = ctx.client.chatManager;
      const first = await prepareConversation(ctx, 'sort_first');
      const second = await prepareConversation(ctx, 'sort_second');
      const third = await prepareConversation(ctx, 'sort_third');
      const base = Date.now();
      const firstSeed = first.text('sort seed', base + 1000);
      const secondSeed = second.text('sort seed', base + 2000);
      const thirdSeed = third.text('sort seed', base + 3000);
      await ctx.client.chatManager.insertMessage(firstSeed);
      await ctx.client.chatManager.insertMessage(secondSeed);
      await ctx.client.chatManager.insertMessage(thirdSeed);

      const ids = new Set([first.convId, second.convId, third.convId]);
      const expected = [third.convId, second.convId, first.convId];
      const checks = [
        {
          label: 'default sort',
          conversations: await manager.getAllConversations(),
          ordered: true,
        },
        {
          label: 'sorted',
          conversations: await manager.getAllConversations(true),
          ordered: true,
        },
        {
          label: 'unsorted',
          conversations: await manager.getAllConversations(false),
          ordered: false,
        },
      ];

      for (const check of checks) {
        const own = check.conversations.filter((conversation) =>
          ids.has(conversation.convId)
        );
        assertEqual(own.length, 3, `${check.label}: owned conversations`);
        for (const conversation of own) {
          assertEqual(
            conversation.isPinned,
            false,
            `${check.label}: ${conversation.convId} is not pinned`
          );
        }
        if (check.ordered) {
          assertDeepEqual(
            own.map((conversation) => conversation.convId),
            expected,
            `${check.label}: newest first`
          );
        } else {
          assertDeepEqual(
            [...own.map((conversation) => conversation.convId)].sort(),
            [...expected].sort(),
            `${check.label}: same members`
          );
        }
      }
    }
  );

  // Port of FL-CONV-014: pinning and unpinning a conversation is visible on
  // the conversation object and in the sorted list, without touching other
  // conversations or their messages.
  ciTest(
    'RN-CONV-017',
    'pinConversation toggles isPinned without changing messages',
    async () => {
      const manager = ctx.client.chatManager;
      const fixture = await prepareConversation(ctx, 'pin');
      const control = await prepareConversation(ctx, 'pin_control');
      const base = Date.now();
      const seed = fixture.text('pin seed', base + 1000);
      const controlSeed = control.text('pin control seed', base + 2000);
      await ctx.client.chatManager.insertMessage(seed);
      await ctx.client.chatManager.insertMessage(controlSeed);

      let pinAttempted = false;
      addTearDown(async () => {
        if (!pinAttempted) {
          return;
        }
        await manager.pinConversation(fixture.convId, false);
        const restored = await manager.getConversation(
          fixture.convId,
          PEER_CHAT,
          false
        );
        assertNotNull(restored);
        assertEqual(restored.isPinned, false);
      });

      for (const pinned of [true, false]) {
        pinAttempted = true;
        await manager.pinConversation(fixture.convId, pinned);
        const reread = await manager.getConversation(
          fixture.convId,
          PEER_CHAT,
          false
        );
        assertNotNull(reread);
        assertEqual(reread.isPinned, pinned, `isPinned must be ${pinned}`);

        const all = await manager.getAllConversations();
        const own = all.filter(
          (conversation) => conversation.convId === fixture.convId
        );
        assertEqual(own.length, 1, 'the pinned conversation is listed once');
        assertEqual(own[0]?.isPinned, pinned);
        const controlConversation = all.find(
          (conversation) => conversation.convId === control.convId
        );
        assertNotNull(controlConversation);
        assertEqual(controlConversation.isPinned, false);

        await expectConversationMessages(
          fixture.conversation,
          [seed],
          `messages while isPinned is ${pinned}`
        );
        await expectConversationMessages(
          control.conversation,
          [controlSeed],
          `control messages while isPinned is ${pinned}`
        );
      }
    }
  );

  // Port of FL-CONV-016: receiving messages increments the peer conversation
  // and account unread counts; clearing the conversation restores both.
  ciTest(
    'RN-CONV-019',
    'incoming messages increase and clearing resets unread counts',
    async () => {
      const manager = ctx.client.chatManager;
      const userId = ctx.client.currentUserName;
      const peerId = requirePeerId(ctx);

      const snapshot = await ctx.rest.snapshotContacts(userId, peerId);
      addTearDown(() => ctx.rest.restoreContacts(userId, peerId, snapshot));
      addTearDown(async () => {
        try {
          await withCiTimeout(
            manager.clearConversationUnreadMessageCount(peerId),
            15_000,
            'clear peer conversation unread'
          );
        } catch {
          // The peer conversation may not exist on a fresh account.
        }
      });

      await ctx.rest.setContacts(userId, peerId, true);
      try {
        await withCiTimeout(
          manager.clearConversationUnreadMessageCount(peerId),
          15_000,
          'clear peer conversation unread'
        );
      } catch {
        // A conversation is only created once the peer's message arrives.
      }
      const baseline = await manager.getUnreadCount();

      const run = uniqueCiName('conv', 'unread');
      await ctx.rest.sendTextMessage({
        from: peerId,
        to: userId,
        text: `${run} first`,
      });
      await ctx.rest.sendTextMessage({
        from: peerId,
        to: userId,
        text: `${run} second`,
      });

      const unread = await waitForCi(
        'peer conversation unread count reaches 2',
        async () => {
          const conversation = await manager.getConversation(
            peerId,
            PEER_CHAT,
            false
          );
          return conversation == null
            ? -1
            : await conversation.getUnreadCount();
        },
        (value) => value === 2
      );
      assertEqual(unread, 2);
      assertTrue(
        (await manager.getUnreadCount()) >= baseline + 2,
        'account unread count must grow by at least two'
      );

      await manager.clearConversationUnreadMessageCount(peerId);
      const cleared = await manager.getConversation(peerId, PEER_CHAT, false);
      assertNotNull(cleared);
      assertEqual(await cleared.getUnreadCount(), 0);
      await waitForCi(
        'account unread count returns to the baseline',
        () => manager.getUnreadCount(),
        (value) => value === baseline
      );
    }
  );

  // Port of FL-CONV-017: a message sent to the peer is visible in server
  // history and locally, and removing it on the server clears both copies.
  ciTest(
    'RN-CONV-020',
    'removeMessagesFromServerWithMsgIds clears local and server copies',
    async () => {
      const manager = ctx.client.chatManager;
      const peerId = requirePeerId(ctx);
      const run = uniqueCiName('conv', 'server_delete');
      const draft = ChatMessage.createTextMessage(
        peerId,
        run,
        ChatMessageChatType.PeerChat
      );
      let sentMsgId: string | undefined;
      addTearDown(async () => {
        if (sentMsgId == null) {
          return;
        }
        try {
          await manager.removeMessagesFromServerWithMsgIds(peerId, PEER_CHAT, [
            sentMsgId,
          ]);
        } catch {
          // Best effort cleanup after a failed case.
        }
      });

      const confirmed = await withCiTimeout(
        new Promise<ChatMessage>((resolve, reject) => {
          manager
            .sendMessage(draft, {
              onSuccess: (message) => resolve(message),
              onError: (_localMsgId, error) => reject(error),
            })
            .catch(reject);
        }),
        30_000,
        'send message to peer'
      );
      sentMsgId = confirmed.msgId;
      assertEqual(confirmed.status, ChatMessageStatus.SUCCESS);
      assertTrue(confirmed.msgId.length > 0, 'the sent message needs an ID');

      const inServerHistory = async (): Promise<boolean> => {
        const page = await manager.fetchHistoryMessagesByOptions(
          peerId,
          PEER_CHAT,
          { pageSize: 50 }
        );
        return (page.list ?? []).some(
          (message) => message.msgId === confirmed.msgId
        );
      };

      await waitForCi(
        'server history contains the sent message',
        inServerHistory,
        (found) => found
      );
      assertNotNull(
        await manager.getMessage(confirmed.msgId),
        'the sent message must be stored locally'
      );
      assertNotNull(
        await manager.getConversation(peerId, PEER_CHAT, false),
        'the peer conversation must exist locally'
      );

      await manager.removeMessagesFromServerWithMsgIds(peerId, PEER_CHAT, [
        confirmed.msgId,
      ]);
      await waitForCi(
        'local copy is removed',
        () => manager.getMessage(confirmed.msgId),
        (message) => message == null
      );
      await waitForCi(
        'server history drops the message',
        inServerHistory,
        (found) => !found
      );
      sentMsgId = undefined;
    }
  );

  // Port of FL-CONV-018: the conversation mark APIs add and remove a mark
  // reported by the peer conversation object.
  ciTest(
    'RN-CONV-021',
    'conversation marks are added to and removed from the peer conversation',
    async () => {
      const manager = ctx.client.chatManager;
      const userId = ctx.client.currentUserName;
      const peerId = requirePeerId(ctx);
      const mark = ChatConversationMarkType.Type0;

      const snapshot = await ctx.rest.snapshotContacts(userId, peerId);
      addTearDown(() => ctx.rest.restoreContacts(userId, peerId, snapshot));
      addTearDown(async () => {
        try {
          await manager.deleteRemoteAndLocalConversationsMark([peerId], mark);
        } catch {
          // Best effort cleanup after a failed case.
        }
      });

      await ctx.rest.setContacts(userId, peerId, true);
      const run = uniqueCiName('conv', 'mark');
      await ctx.rest.sendTextMessage({
        from: peerId,
        to: userId,
        text: run,
      });

      await waitForCi(
        'peer conversation exists locally',
        async () =>
          (await manager.getConversation(peerId, PEER_CHAT, false))?.convId,
        (value) => value === peerId
      );
      const before = await manager.getConversation(peerId, PEER_CHAT, false);
      assertNotNull(before);
      assertTrue(
        !(before.marks ?? []).includes(mark),
        'the peer conversation must start without the mark'
      );

      await manager.addRemoteAndLocalConversationsMark([peerId], mark);
      await waitForCi(
        'peer conversation reports the mark',
        async () =>
          (await manager.getConversation(peerId, PEER_CHAT, false))?.marks ??
          [],
        (marks) => marks.includes(mark)
      );

      await manager.deleteRemoteAndLocalConversationsMark([peerId], mark);
      await waitForCi(
        'peer conversation drops the mark',
        async () =>
          (await manager.getConversation(peerId, PEER_CHAT, false))?.marks ??
          [],
        (marks) => !marks.includes(mark)
      );
    }
  );
}

/** No-login conversation negative cases (`logged_out` entry). */
export function registerConversationLoggedOutCases(ctx: CiCaseContext): void {
  // Unauthenticated push.fetchSilentModeForAll must throw errorCode 201;
  // hosted here for the reason documented in the file header.
  ciTest(
    'RN-CONV-003',
    'fetchSilentModeForAll while logged out throws 201',
    async () => {
      await expectCiError(
        () => ctx.client.pushManager.fetchSilentModeForAll(),
        201
      );
    }
  );
}
