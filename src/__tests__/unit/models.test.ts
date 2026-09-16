import {
  ChatConversation,
  ChatConversationMarkType,
  ChatConversationType,
  ChatConversationTypeFromNumber,
} from '../../common/ChatConversation';
import {
  ChatGroup,
  ChatGroupConfigs,
  ChatGroupPermissionType,
  ChatGroupPermissionTypeFromNumber,
} from '../../common/ChatGroup';
import {
  ChatRoom,
  ChatRoomPermissionType,
  ChatRoomPermissionTypeFromNumber,
} from '../../common/ChatRoom';
import { ChatPushRemindType } from '../../common/ChatSilentMode';
import { ChatUserInfo } from '../../common/ChatUserInfo';

describe('ChatConversationTypeFromNumber', () => {
  test.each([
    [0, ChatConversationType.PeerChat],
    [1, ChatConversationType.GroupChat],
    [2, ChatConversationType.RoomChat],
  ])('maps native int %i to %s', (input, expected) => {
    expect(ChatConversationTypeFromNumber(input)).toBe(expected);
  });

  test('passes unknown values through unchanged', () => {
    expect(ChatConversationTypeFromNumber(99)).toBe(99);
  });
});

describe('ChatConversation constructor', () => {
  test('decodes native-shaped raw data with a numeric convType', () => {
    const conv = new ChatConversation({ convId: 'group1', convType: 1 });

    expect(conv.convId).toBe('group1');
    expect(conv.convType).toBe(ChatConversationType.GroupChat);
  });

  test('applies defaults for missing optional fields', () => {
    const conv = new ChatConversation({
      convId: 'peer1',
      convType: ChatConversationType.PeerChat,
    });

    expect(conv.isChatThread).toBe(false);
    expect(conv.isPinned).toBe(false);
    expect(conv.pinnedTime).toBe(0);
    expect(conv.remindType).toBe(ChatPushRemindType.ALL);
    expect(conv.ext).toBeUndefined();
    expect(conv.marks).toBeUndefined();
  });

  test('preserves explicitly provided optional fields', () => {
    const conv = new ChatConversation({
      convId: 'group1',
      convType: ChatConversationType.GroupChat,
      isChatThread: true,
      ext: { key: 'value' },
      isPinned: true,
      pinnedTime: 1720000000000,
      marks: [ChatConversationMarkType.Type0, ChatConversationMarkType.Type3],
      remindType: ChatPushRemindType.MENTION_ONLY,
    });

    expect(conv.isChatThread).toBe(true);
    expect(conv.ext).toEqual({ key: 'value' });
    expect(conv.isPinned).toBe(true);
    expect(conv.pinnedTime).toBe(1720000000000);
    expect(conv.marks).toEqual([
      ChatConversationMarkType.Type0,
      ChatConversationMarkType.Type3,
    ]);
    expect(conv.remindType).toBe(ChatPushRemindType.MENTION_ONLY);
  });
});

describe('ChatRoomPermissionTypeFromNumber', () => {
  test.each([
    [-1, ChatRoomPermissionType.None],
    [0, ChatRoomPermissionType.Member],
    [1, ChatRoomPermissionType.Admin],
    [2, ChatRoomPermissionType.Owner],
  ])('maps native int %i to %s', (input, expected) => {
    expect(ChatRoomPermissionTypeFromNumber(input)).toBe(expected);
  });

  test('passes unknown values through unchanged', () => {
    expect(ChatRoomPermissionTypeFromNumber(42)).toBe(42);
  });
});

describe('ChatRoom constructor', () => {
  test('copies fields and converts permissionType from native int', () => {
    const room = new ChatRoom({
      roomId: 'room1',
      roomName: 'Room One',
      owner: 'user1',
      memberCount: 10,
      maxUsers: 100,
      adminList: ['user2'],
      muteKVList: { user3: 1720000000000 },
      isAllMemberMuted: false,
      permissionType: 2,
      isInWhitelist: true,
    });

    expect(room.roomId).toBe('room1');
    expect(room.roomName).toBe('Room One');
    expect(room.owner).toBe('user1');
    expect(room.memberCount).toBe(10);
    expect(room.maxUsers).toBe(100);
    expect(room.adminList).toEqual(['user2']);
    expect(room.muteKVList).toEqual({ user3: 1720000000000 });
    expect(room.permissionType).toBe(ChatRoomPermissionType.Owner);
    expect(room.isInWhitelist).toBe(true);
  });

  test('leaves absent optional fields undefined', () => {
    const room = new ChatRoom({
      roomId: 'room1',
      owner: 'user1',
      permissionType: 0,
    });

    expect(room.permissionType).toBe(ChatRoomPermissionType.Member);
    expect(room.roomName).toBeUndefined();
    expect(room.description).toBeUndefined();
    expect(room.announcement).toBeUndefined();
    expect(room.memberList).toBeUndefined();
    expect(room.muteKVList).toBeUndefined();
    expect(room.createTimestamp).toBeUndefined();
  });
});

describe('ChatGroupPermissionTypeFromNumber', () => {
  test.each([
    [-1, ChatGroupPermissionType.None],
    [0, ChatGroupPermissionType.Member],
    [1, ChatGroupPermissionType.Admin],
    [2, ChatGroupPermissionType.Owner],
  ])('maps native int %i to %s', (input, expected) => {
    expect(ChatGroupPermissionTypeFromNumber(input)).toBe(expected);
  });

  test('passes unknown values through unchanged', () => {
    expect(ChatGroupPermissionTypeFromNumber(42)).toBe(42);
  });
});

describe('ChatGroup constructor', () => {
  test('applies defaults for missing optional fields', () => {
    const group = new ChatGroup({
      groupId: 'g1',
      owner: 'user1',
      permissionType: 2,
    });

    expect(group.groupId).toBe('g1');
    expect(group.groupName).toBe('');
    expect(group.groupAvatar).toBe('');
    expect(group.description).toBe('');
    expect(group.announcement).toBe('');
    expect(group.memberCount).toBe(0);
    expect(group.memberList).toEqual([]);
    expect(group.adminList).toEqual([]);
    expect(group.blockList).toEqual([]);
    expect(group.muteList).toEqual([]);
    expect(group.messageBlocked).toBe(false);
    expect(group.isAllMemberMuted).toBe(false);
    expect(group.permissionType).toBe(ChatGroupPermissionType.Owner);
    expect(group.configs).toBeUndefined();
    expect(group.isDisabled).toBe(false);
  });

  test('builds nested ChatGroupConfigs only when configs are present', () => {
    const group = new ChatGroup({
      groupId: 'g1',
      owner: 'user1',
      permissionType: 0,
      isDisabled: true,
      configs: {
        maxCount: 500,
        inviteNeedConfirm: true,
        isPublic: true,
        joinApprovalRequired: true,
        allowInvites: true,
        ext: 'ext-content',
      },
    });

    expect(group.permissionType).toBe(ChatGroupPermissionType.Member);
    expect(group.isDisabled).toBe(true);
    expect(group.configs).toBeInstanceOf(ChatGroupConfigs);
    expect(group.configs?.maxCount).toBe(500);
    expect(group.configs?.inviteNeedConfirm).toBe(true);
    expect(group.configs?.isPublic).toBe(true);
    expect(group.configs?.joinApprovalRequired).toBe(true);
    expect(group.configs?.allowInvites).toBe(true);
    expect(group.configs?.ext).toBe('ext-content');
  });
});

describe('ChatGroupConfigs constructor', () => {
  test('applies defaults when fields are missing', () => {
    const configs = new ChatGroupConfigs({});

    expect(configs.maxCount).toBe(200);
    expect(configs.inviteNeedConfirm).toBe(false);
    expect(configs.isPublic).toBe(false);
    expect(configs.joinApprovalRequired).toBe(false);
    expect(configs.allowInvites).toBe(false);
    expect(configs.ext).toBeUndefined();
  });
});

describe('ChatUserInfo constructor', () => {
  test('copies all provided fields', () => {
    const info = new ChatUserInfo({
      userId: 'user1',
      nickName: 'Nick',
      avatarUrl: 'https://example.com/a.png',
      mail: 'user1@example.com',
      phone: '123456',
      gender: 1,
      sign: 'hello',
      birth: '2000-01-01',
      ext: '{"key":"value"}',
    });

    expect(info.userId).toBe('user1');
    expect(info.nickName).toBe('Nick');
    expect(info.avatarUrl).toBe('https://example.com/a.png');
    expect(info.mail).toBe('user1@example.com');
    expect(info.phone).toBe('123456');
    expect(info.gender).toBe(1);
    expect(info.sign).toBe('hello');
    expect(info.birth).toBe('2000-01-01');
    expect(info.ext).toBe('{"key":"value"}');
  });

  test('leaves absent optional fields undefined', () => {
    const info = new ChatUserInfo({ userId: 'user1' });

    expect(info.userId).toBe('user1');
    expect(info.nickName).toBeUndefined();
    expect(info.avatarUrl).toBeUndefined();
    expect(info.gender).toBeUndefined();
    expect(info.ext).toBeUndefined();
  });
});
