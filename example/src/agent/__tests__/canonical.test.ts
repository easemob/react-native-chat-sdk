import type {
  ChatGroup,
  ChatMessage,
  ChatMessageReadReceipt,
  ChatPresence,
  ChatRecalledMessageInfo,
  ChatUserInfo,
} from 'react-native-chat-sdk';
import {
  canonicalDeviceInfo,
  canonicalGroup,
  canonicalMessage,
  canonicalMessageBody,
  canonicalPresence,
  canonicalReadReceipt,
  canonicalRecallInfo,
  canonicalUserInfo,
  errorToJson,
} from '../canonical';

describe('canonicalMessageBody (contract §12.2)', () => {
  it('maps the text body type string to 0 and keeps content', () => {
    expect(
      canonicalMessageBody({ type: 'txt', content: 'hi', translations: null })
    ).toEqual({ type: 0, content: 'hi' });
  });

  it('maps the known body type strings to their canonical ints', () => {
    for (const [t, n] of [
      ['txt', 0],
      ['img', 1],
      ['video', 2],
      ['loc', 3],
      ['voice', 4],
      ['file', 5],
      ['cmd', 6],
      ['custom', 7],
      ['combine', 8],
    ] as const) {
      expect(canonicalMessageBody({ type: t }).type).toBe(n);
    }
  });

  it('passes non-text body fields through (pending T11)', () => {
    const out = canonicalMessageBody({ type: 'img', remotePath: '/p/a.png' });
    expect(out).toEqual({ type: 1, remotePath: '/p/a.png' });
  });
});

describe('canonicalMessage (contract §12.1)', () => {
  const msg = {
    msgId: 'm123',
    from: 'alice',
    to: 'bob',
    conversationId: 'bob',
    chatType: 0,
    direction: 'send',
    status: 2,
    body: { type: 'txt', content: 'hello' },
    attributes: { k: 'v' },
    isRead: true,
    isPeerRead: false,
    hasDeliverAck: false,
    isNeedReadReceipt: false,
    groupReadReceiptCount: 0,
    localTime: 0,
    serverTime: 1700000000000,
    isChatThread: false,
    isContentReplaced: false,
    deliverOnlineOnly: false,
    receiverList: undefined,
  } as unknown as ChatMessage;

  it('renames convId/isThread and maps direction to int', () => {
    expect(canonicalMessage(msg)).toEqual({
      msgId: 'm123',
      from: 'alice',
      to: 'bob',
      convId: 'bob',
      chatType: 0,
      direction: 0,
      status: 2,
      body: { type: 0, content: 'hello' },
      attributes: { k: 'v' },
      isRead: true,
      isPeerRead: false,
      hasDeliverAck: false,
      isNeedReadReceipt: false,
      groupReadReceiptCount: 0,
      localTime: 0,
      serverTime: 1700000000000,
      isThread: false,
      isContentReplaced: false,
      deliverOnlineOnly: false,
    });
  });

  it('maps receive direction to 1', () => {
    const received = { ...msg, direction: 'rec' } as unknown as ChatMessage;
    expect(canonicalMessage(received).direction).toBe(1);
  });

  it('omits bodies for a single-body message', () => {
    const single = {
      ...msg,
      bodies: [{ type: 'txt', content: 'hello' }],
    } as unknown as ChatMessage;
    expect(canonicalMessage(single)).not.toHaveProperty('bodies');
  });

  it('emits every body in order for a multi-body message', () => {
    const multi = {
      ...msg,
      bodies: [
        { type: 'txt', content: 'first' },
        { type: 'txt', content: 'second' },
      ],
      body: { type: 'txt', content: 'first' },
    } as unknown as ChatMessage;
    const out = canonicalMessage(multi);
    expect(out.body).toEqual({ type: 0, content: 'first' });
    expect(out.bodies).toEqual([
      { type: 0, content: 'first' },
      { type: 0, content: 'second' },
    ]);
  });
});

describe('canonicalGroup (contract §12.4)', () => {
  it('renames fields and lifts booleans out of configs', () => {
    const group = {
      groupId: 'g1',
      groupName: 'name',
      groupAvatar: 'http://a',
      description: 'd',
      owner: 'alice',
      announcement: '',
      memberCount: 2,
      memberList: ['alice', 'bob'],
      adminList: [],
      blockList: [],
      muteList: [],
      messageBlocked: false,
      isDisabled: false,
      isAllMemberMuted: false,
      permissionType: 2,
      configs: {
        maxCount: 200,
        inviteNeedConfirm: false,
        isPublic: true,
        joinApprovalRequired: false,
        allowInvites: true,
        ext: 'x',
      },
    } as unknown as ChatGroup;
    const out = canonicalGroup(group);
    expect(out).toMatchObject({
      groupId: 'g1',
      name: 'name',
      avatarUrl: 'http://a',
      desc: 'd',
      owner: 'alice',
      memberCount: 2,
      isPublic: true,
      isJoinApprovalRequired: false,
      isMemberAllowToInvite: true,
      ext: 'x',
      permissionType: 2,
      configs: { maxCount: 200, isPublic: true, allowInvites: true, ext: 'x' },
    });
  });
});

describe('canonicalPresence (contract §12.6)', () => {
  it('converts the statusDetails Map to a plain object', () => {
    const p = {
      publisher: 'alice',
      statusDescription: 'busy',
      lastTime: 1700000000,
      expiryTime: 1700003600,
      statusDetails: new Map([['android_abc', 1]]),
    } as unknown as ChatPresence;
    expect(canonicalPresence(p)).toEqual({
      publisher: 'alice',
      statusDescription: 'busy',
      lastTime: 1700000000,
      expiryTime: 1700003600,
      statusDetails: { android_abc: 1 },
    });
  });
});

describe('canonicalUserInfo (contract §12.7)', () => {
  it('keeps userId and gender, omits null fields', () => {
    const u = { userId: 'bob' } as unknown as ChatUserInfo;
    expect(canonicalUserInfo(u)).toEqual({ userId: 'bob', gender: 0 });
  });
});

describe('canonicalReadReceipt (contract §12.9)', () => {
  it('renames msgId/convId', () => {
    const r = {
      msgId: 'm1',
      convId: 'c1',
      isPeerReceipt: true,
      readCount: 0,
    } as unknown as ChatMessageReadReceipt;
    expect(canonicalReadReceipt(r)).toEqual({
      messageId: 'm1',
      conversationId: 'c1',
      isPeerReceipt: true,
      readCount: 0,
    });
  });
});

describe('canonicalRecallInfo (contract §12.10)', () => {
  it('always emits all five keys, nullable fields stay null', () => {
    const r = {
      recalledMessageId: 'm1',
      recalledBy: 'alice',
    } as unknown as ChatRecalledMessageInfo;
    expect(canonicalRecallInfo(r)).toEqual({
      recallMsgId: 'm1',
      recallBy: 'alice',
      convId: null,
      msg: null,
      ext: null,
    });
  });
});

describe('canonicalDeviceInfo (contract §12.11)', () => {
  it('keeps the field names', () => {
    expect(
      canonicalDeviceInfo({
        resource: 'android_abc',
        deviceUUID: 'uuid',
        deviceName: 'Pixel',
      })
    ).toEqual({
      resource: 'android_abc',
      deviceUUID: 'uuid',
      deviceName: 'Pixel',
    });
  });
});

describe('errorToJson (contract §12.8)', () => {
  it('maps ChatError-like values to {code, message: description}', () => {
    expect(errorToJson({ code: 303, description: 'server error' })).toEqual({
      code: 303,
      message: 'server error',
    });
  });

  it('maps anything else to a tool error with code -1', () => {
    expect(errorToJson(new Error('boom'))).toEqual({
      code: -1,
      message: 'boom',
    });
    expect(errorToJson('plain')).toEqual({ code: -1, message: 'plain' });
  });
});
