/**
 * SDK model -> canonical JSON converters (contract §12). The canonical shapes
 * are the cross-platform baseline shared with the Flutter agent; field
 * renames and enum normalizations happen here and nowhere else.
 *
 * `putIfNotNull` semantics: null/undefined fields do not appear in the output.
 */

import type {
  ChatDeviceInfo,
  ChatError,
  ChatGroup,
  ChatMessage,
  ChatPresence,
  ChatRecalledMessageInfo,
  ChatUserInfo,
} from 'react-native-chat-sdk';

type Json = Record<string, unknown>;

function put(target: Json, key: string, value: unknown): void {
  if (value !== undefined && value !== null) {
    target[key] = value;
  }
}

/** contract §12.8: SDK business error keeps its code; anything else is a
 * tool-layer error with code -1. */
export function errorToJson(e: unknown): { code: number; message: string } {
  if (isChatErrorLike(e)) {
    return { code: e.code, message: e.description };
  }
  return { code: -1, message: e instanceof Error ? e.message : String(e) };
}

export function isChatErrorLike(e: unknown): e is ChatError {
  return (
    typeof e === 'object' &&
    e !== null &&
    typeof (e as { code?: unknown }).code === 'number' &&
    typeof (e as { description?: unknown }).description === 'string'
  );
}

const MESSAGE_TYPE_TO_INT: Record<string, number> = {
  txt: 0,
  img: 1,
  video: 2,
  loc: 3,
  voice: 4,
  file: 5,
  cmd: 6,
  custom: 7,
  combine: 8,
};

/** contract §12.2; only the text body is fully shaped (13 scenarios), other
 * body types pass through their own enumerable fields pending T11. */
export function canonicalMessageBody(body: unknown): Json {
  if (typeof body !== 'object' || body === null) {
    return { type: -1 };
  }
  const b = body as { type?: unknown } & Json;
  const type =
    typeof b.type === 'string'
      ? (MESSAGE_TYPE_TO_INT[b.type] ?? -1)
      : typeof b.type === 'number'
        ? b.type
        : -1;
  if (type === 0) {
    const out: Json = { type };
    put(out, 'content', b.content);
    put(out, 'translations', b.translations);
    return out;
  }
  const out: Json = { type };
  for (const [k, v] of Object.entries(b)) {
    if (k !== 'type' && v !== undefined && v !== null) {
      out[k] = v;
    }
  }
  return out;
}

/** contract §12.1 */
export function canonicalMessage(msg: ChatMessage): Json {
  const out: Json = {};
  put(out, 'msgId', msg.msgId);
  put(out, 'from', msg.from);
  put(out, 'to', msg.to);
  put(out, 'convId', msg.conversationId);
  put(out, 'chatType', msg.chatType);
  put(out, 'direction', msg.direction === 'send' ? 0 : 1);
  put(out, 'status', msg.status);
  out.body = canonicalMessageBody(msg.body);
  put(out, 'attributes', msg.attributes);
  put(out, 'isRead', msg.hasRead);
  put(out, 'isPeerRead', msg.hasReadAck);
  put(out, 'hasDeliverAck', msg.hasDeliverAck);
  put(out, 'isNeedReadReceipt', msg.needGroupAck);
  put(out, 'groupReadReceiptCount', msg.groupAckCount);
  put(out, 'localTime', msg.localTime);
  put(out, 'serverTime', msg.serverTime);
  put(out, 'isThread', msg.isChatThread);
  put(out, 'isContentReplaced', msg.isContentReplaced);
  put(out, 'deliverOnlineOnly', msg.deliverOnlineOnly);
  put(out, 'receiverList', msg.receiverList);
  return out;
}

/** contract §12.4/§12.5 */
export function canonicalGroup(group: ChatGroup): Json {
  const out: Json = {};
  put(out, 'groupId', group.groupId);
  put(out, 'name', group.groupName);
  put(out, 'avatarUrl', group.groupAvatar);
  put(out, 'desc', group.description);
  put(out, 'owner', group.owner);
  put(out, 'announcement', group.announcement);
  put(out, 'memberCount', group.memberCount);
  put(out, 'memberList', group.memberList);
  put(out, 'adminList', group.adminList);
  put(out, 'blockList', group.blockList);
  put(out, 'muteList', group.muteList);
  put(out, 'messageBlocked', group.messageBlocked);
  put(out, 'isDisabled', group.options?.isDisabled);
  put(out, 'isAllMemberMuted', group.isAllMemberMuted);
  put(out, 'permissionType', group.permissionType);
  const options = group.options;
  if (options) {
    put(out, 'ext', options.ext);
    const c: Json = {
      maxCount: options.maxCount,
      inviteNeedConfirm: options.inviteNeedConfirm,
      isDisabled: options.isDisabled,
    };
    put(c, 'ext', options.ext);
    out.configs = c;
  }
  return out;
}

function mapToObject(value: unknown): unknown {
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }
  return value;
}

/** contract §12.6 */
export function canonicalPresence(p: ChatPresence): Json {
  const out: Json = {};
  put(out, 'publisher', p.publisher);
  put(out, 'statusDescription', p.statusDescription);
  put(out, 'lastTime', p.lastTime);
  put(out, 'expiryTime', p.expiryTime);
  out.statusDetails = mapToObject(p.statusDetails) ?? {};
  return out;
}

/** contract §12.7: userId and gender always present. */
export function canonicalUserInfo(u: ChatUserInfo): Json {
  const out: Json = { userId: u.userId, gender: u.gender ?? 0 };
  put(out, 'nickName', u.nickName);
  put(out, 'avatarUrl', u.avatarUrl);
  put(out, 'mail', u.mail);
  put(out, 'phone', u.phone);
  put(out, 'sign', u.sign);
  put(out, 'birth', u.birth);
  put(out, 'ext', u.ext);
  return out;
}

/** contract §12.10: all five keys always present, nullable fields stay null. */
export function canonicalRecallInfo(r: ChatRecalledMessageInfo): Json {
  return {
    recallMsgId: r.recalledMessageId,
    recallBy: r.recalledBy,
    convId: r.recalledConvId ?? null,
    msg: r.recalledMessage ? canonicalMessage(r.recalledMessage) : null,
    ext: r.recalledExt ?? null,
  };
}

/** contract §12.11 */
export function canonicalDeviceInfo(d: ChatDeviceInfo): Json {
  return {
    resource: d.resource,
    deviceUUID: d.deviceUUID,
    deviceName: d.deviceName,
  };
}
