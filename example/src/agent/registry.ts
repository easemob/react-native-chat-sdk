/**
 * SDK command registry (contract §10): api string -> handler. The registry is
 * SDK-free for testability — all SDK touch points are injected via
 * [AgentSdkDeps]; production wiring lives in agent_mode.ts.
 *
 * Error mapping (contract §10/§12.8): SDK business errors keep their code
 * (failureKind 'sdk'); agent/adaptation errors use code -1 ('tool').
 */

import type {
  ChatClient,
  ChatGroupConfigs,
  ChatMessage,
  ChatMessageChatType as ChatMessageChatTypeT,
  ChatMessageStatusCallback,
  ChatOptions,
  ChatTextMessageBody,
} from 'react-native-chat-sdk';
import {
  canonicalDeviceInfo,
  canonicalGroup,
  canonicalMessage,
  canonicalPresence,
  canonicalUserInfo,
  errorToJson,
  isChatErrorLike,
} from './canonical';
import { TOOL_ERROR_CODE, type AgentErrorJson } from './types';
import type { ExecResult } from './command_service';

type Json = Record<string, unknown>;

/** Everything the registry needs from the SDK, injected for testability. */
export interface AgentSdkDeps {
  client: ChatClient;
  /** ChatOptions.withAppKey / withAppId */
  optionsWithAppKey: (params: Json) => ChatOptions;
  optionsWithAppId: (params: Json) => ChatOptions;
  /** ChatMessage.createTextMessage */
  createTextMessage: (
    targetId: string,
    content: string,
    chatType: ChatMessageChatTypeT,
    opt?: Json
  ) => ChatMessage;
  /** ChatTextMessageBody constructor for text-only modify */
  createTextBody: (content: string) => ChatTextMessageBody;
  /** ChatMessage.createSendMessage with a bodies list (multi-body, 5.2.0) */
  createMultiBodyMessage: (
    targetId: string,
    bodies: ChatTextMessageBody[],
    chatType: ChatMessageChatTypeT,
    opt?: Json
  ) => ChatMessage;
}

export type ApiHandler = (params: Json) => Promise<ExecResult>;

function toolError(message: string): ExecResult {
  return {
    success: false,
    failureKind: 'tool',
    error: { code: TOOL_ERROR_CODE, message },
  };
}

function failFromUnknown(e: unknown): ExecResult {
  const error: AgentErrorJson = errorToJson(e);
  return {
    success: false,
    failureKind: isChatErrorLike(e) ? 'sdk' : 'tool',
    error,
  };
}

/** Wrap one promise-based SDK call into an ExecResult. `map` converts the
 * resolved value into canonical JSON; `undefined`/void resolves omit `data`. */
async function sdkCall<T>(
  fn: () => Promise<T>,
  map?: (value: T) => unknown
): Promise<ExecResult> {
  try {
    const value = await fn();
    const data = map !== undefined ? map(value) : value;
    if (data === undefined) {
      return { success: true };
    }
    return { success: true, data };
  } catch (e) {
    return failFromUnknown(e);
  }
}

function requireString(params: Json, key: string): string {
  const v = params[key];
  if (typeof v !== 'string' || v.length === 0) {
    throw new Error(`params.${key} must be a non-empty string`);
  }
  return v;
}

function stringArray(params: Json, key: string): string[] {
  const v = params[key];
  if (!Array.isArray(v)) {
    throw new Error(`params.${key} must be an array`);
  }
  return v.map(String);
}

function optionalBool(params: Json, key: string): boolean | undefined {
  const v = params[key];
  return typeof v === 'boolean' ? v : undefined;
}

/** ChatClient.init special case (contract §10 row 1): merge config (env) with
 * overrides (overrides win), assemble ChatOptions, init, register listeners. */
export function createInitHandler(
  deps: AgentSdkDeps,
  registerListeners: () => void
): (params: Json) => Promise<ExecResult> {
  return async (params: Json) => {
    try {
      const config =
        typeof params.config === 'object' && params.config !== null
          ? (params.config as Json)
          : {};
      const overrides =
        typeof params.overrides === 'object' && params.overrides !== null
          ? (params.overrides as Json)
          : {};
      const merged: Json = { ...config, ...overrides };
      // Canonical case config follows the Flutter naming (`debugMode`); RN
      // ChatOptions exposes it as `debugModel`. Map it here so the forwarder
      // gate (native console logs) follows the shared cases.
      const rnMerged: Json = { ...merged };
      if (
        rnMerged.debugModel === undefined &&
        rnMerged.debugMode !== undefined
      ) {
        rnMerged.debugModel = rnMerged.debugMode;
        delete rnMerged.debugMode;
      }
      const options =
        typeof rnMerged.appKey === 'string' && rnMerged.appKey !== ''
          ? deps.optionsWithAppKey(rnMerged)
          : deps.optionsWithAppId(rnMerged);
      await deps.client.init(options);
      registerListeners();
      return { success: true };
    } catch (e) {
      return failFromUnknown(e);
    }
  };
}

/** sendMessage: build the message from canonical JSON, register the status
 * callback before sending (onSuccess may fire early), resolve with the
 * server-rewritten message (contract §10). Text bodies only; other body
 * types are rejected as tool errors until needed. */
function makeSendMessage(deps: AgentSdkDeps): ApiHandler {
  return async (params: Json) => {
    try {
      const to = requireString(params, 'to');
      const chatTypeRaw = params.chatType;
      const chatType =
        typeof chatTypeRaw === 'number'
          ? (chatTypeRaw as ChatMessageChatTypeT)
          : (0 as ChatMessageChatTypeT);
      // `bodies` (multi-body, 5.2.0) takes precedence over the single `body`.
      const multiBodies = Array.isArray(params.bodies)
        ? (params.bodies as Json[])
        : undefined;
      const body =
        typeof params.body === 'object' && params.body !== null
          ? (params.body as Json)
          : {};
      for (const b of multiBodies ?? [body]) {
        if (b.type !== 0) {
          return toolError(
            `sendMessage: unsupported body.type ${String(b.type)} (text only)`
          );
        }
      }
      const content = typeof body.content === 'string' ? body.content : '';
      const opt: Json = {};
      if (typeof params.isThread === 'boolean') {
        opt.isChatThread = params.isThread;
      }
      if (typeof params.deliverOnlineOnly === 'boolean') {
        opt.deliverOnlineOnly = params.deliverOnlineOnly;
      }
      if (Array.isArray(params.receiverList)) {
        opt.receiverList = params.receiverList;
      }
      const msg =
        multiBodies !== undefined
          ? deps.createMultiBodyMessage(
              to,
              multiBodies.map((b) =>
                deps.createTextBody(
                  typeof b.content === 'string' ? b.content : ''
                )
              ),
              chatType,
              opt
            )
          : deps.createTextMessage(to, content, chatType, opt);
      if (typeof params.attributes === 'object' && params.attributes !== null) {
        msg.attributes = params.attributes as Record<string, unknown>;
      }
      return await new Promise<ExecResult>((resolve) => {
        const callback: ChatMessageStatusCallback = {
          onSuccess: (message) => {
            resolve({ success: true, data: canonicalMessage(message) });
          },
          onError: (_localMsgId, error) => {
            resolve({
              success: false,
              failureKind: 'sdk',
              error: errorToJson(error),
            });
          },
        };
        deps.client.chatManager.sendMessage(msg, callback).catch((e) => {
          resolve(failFromUnknown(e));
        });
      });
    } catch (e) {
      return failFromUnknown(e);
    }
  };
}

function makeModifyMessage(deps: AgentSdkDeps): ApiHandler {
  return async (params: Json) => {
    try {
      const messageId = requireString(params, 'messageId');
      const content =
        typeof params.content === 'string' ? params.content : undefined;
      const attributes =
        typeof params.attributes === 'object' && params.attributes !== null
          ? (params.attributes as Record<string, unknown>)
          : undefined;
      return await sdkCall(
        () =>
          deps.client.chatManager.modifyMsgBody({
            msgId: messageId,
            body:
              content === undefined ? undefined : deps.createTextBody(content),
            ext: attributes,
          }),
        (m) => canonicalMessage(m)
      );
    } catch (e) {
      return failFromUnknown(e);
    }
  };
}

/** ChatClient.getCurrentDeviceId has no public RN implementation
 * (contract §13 G1): typed stub, reported as a tool error. */
function notImplemented(api: string): ApiHandler {
  return () =>
    Promise.resolve(
      toolError(
        `${api}: not implemented — no public RN SDK API (contract §13 G1)`
      )
    );
}

/** The full contract §10 api vocabulary for the 13 shared scenarios. */
export function createApiRegistry(deps: AgentSdkDeps): Map<string, ApiHandler> {
  const client = deps.client;
  const registry = new Map<string, ApiHandler>();

  // --- ChatClient ---
  registry.set('ChatClient.loginWithToken', (p) =>
    sdkCall(() =>
      client.loginWithToken(
        requireString(p, 'userId'),
        requireString(p, 'token')
      )
    )
  );
  registry.set('ChatClient.logout', (p) =>
    sdkCall(() => client.logout(optionalBool(p, 'unbindDeviceToken') ?? true))
  );
  registry.set('ChatClient.isConnected', () =>
    sdkCall(() => client.isConnected())
  );
  registry.set(
    'ChatClient.getCurrentDeviceId',
    notImplemented('ChatClient.getCurrentDeviceId')
  );
  registry.set('ChatClient.fetchLoggedInDevices', (p) =>
    sdkCall(
      () =>
        client.getLoggedInDevicesFromServer(
          requireString(p, 'userId'),
          requireString(p, 'token')
        ),
      (list) => list.map(canonicalDeviceInfo)
    )
  );

  // --- ChatManager ---
  registry.set('ChatManager.loadMessage', (p) =>
    sdkCall(
      () => client.chatManager.getMessage(requireString(p, 'messageId')),
      (m) => (m === undefined ? undefined : canonicalMessage(m))
    )
  );
  registry.set('ChatManager.sendMessage', makeSendMessage(deps));
  registry.set('ChatManager.recallMessage', (p) =>
    sdkCall(() =>
      client.chatManager.recallMessage(
        requireString(p, 'messageId'),
        typeof p.ext === 'string' ? { ext: p.ext } : undefined
      )
    )
  );
  registry.set('ChatManager.modifyMessage', makeModifyMessage(deps));
  registry.set('ChatManager.sendMessageReadReceipts', (p) =>
    sdkCall(() => {
      const messages = p.messages;
      if (!Array.isArray(messages)) {
        throw new Error('params.messages must be an array of message JSON');
      }
      const msgIds = messages.map((m) => {
        const msgId =
          typeof m === 'object' && m !== null ? (m as Json).msgId : undefined;
        if (typeof msgId !== 'string') {
          throw new Error('params.messages[*].msgId must be a string');
        }
        return msgId;
      });
      return client.chatManager.sendMessageReadReceipts(msgIds);
    })
  );

  // --- ChatContactManager ---
  registry.set('ChatContactManager.addContact', (p) =>
    sdkCall(() =>
      client.contactManager.addContact(
        requireString(p, 'userId'),
        typeof p.reason === 'string' ? p.reason : undefined
      )
    )
  );
  registry.set('ChatContactManager.acceptInvitation', (p) =>
    sdkCall(() =>
      client.contactManager.acceptInvitation(requireString(p, 'userId'))
    )
  );
  registry.set('ChatContactManager.deleteContact', (p) =>
    sdkCall(() =>
      client.contactManager.deleteContact(
        requireString(p, 'userId'),
        optionalBool(p, 'keepConversation') ?? false
      )
    )
  );
  registry.set('ChatContactManager.getAllContactIds', () =>
    sdkCall(() => client.contactManager.getAllContactsFromDB())
  );

  // --- ChatGroupManager ---
  registry.set('ChatGroupManager.createGroup', (p) =>
    sdkCall(
      () =>
        client.groupManager.createGroupEx({
          // the native bridge serializes plain objects; the canonical
          // groupConfigs shape (§12.5) matches ChatGroupConfigs field names
          configs: (p.configs ?? {}) as unknown as ChatGroupConfigs,
          groupName: requireString(p, 'groupName'),
          groupAvatar:
            typeof p.avatarUrl === 'string' ? p.avatarUrl : undefined,
          desc: typeof p.desc === 'string' ? p.desc : undefined,
          inviteMembers: Array.isArray(p.inviteMembers)
            ? (p.inviteMembers as string[]).map(String)
            : undefined,
          inviteReason:
            typeof p.inviteReason === 'string' ? p.inviteReason : undefined,
        }),
      canonicalGroup
    )
  );
  registry.set('ChatGroupManager.destroyGroup', (p) =>
    sdkCall(() => client.groupManager.destroyGroup(requireString(p, 'groupId')))
  );
  registry.set('ChatGroupManager.joinPublicGroup', (p) =>
    sdkCall(() =>
      client.groupManager.joinPublicGroup(requireString(p, 'groupId'))
    )
  );
  registry.set('ChatGroupManager.leaveGroup', (p) =>
    sdkCall(() => client.groupManager.leaveGroup(requireString(p, 'groupId')))
  );
  registry.set('ChatGroupManager.addMembers', (p) =>
    sdkCall(() =>
      client.groupManager.addMembers(
        requireString(p, 'groupId'),
        stringArray(p, 'members'),
        typeof p.welcome === 'string' ? p.welcome : undefined
      )
    )
  );
  registry.set('ChatGroupManager.acceptInvitation', (p) =>
    // RN returns void; success carries no data (contract §10).
    sdkCall(() =>
      client.groupManager.acceptInvitation(
        requireString(p, 'groupId'),
        requireString(p, 'inviter')
      )
    )
  );
  registry.set('ChatGroupManager.fetchMemberListFromServer', (p) =>
    sdkCall(
      () =>
        client.groupManager.fetchMemberListFromServer(
          requireString(p, 'groupId'),
          typeof p.pageSize === 'number' ? p.pageSize : 200,
          typeof p.cursor === 'string' ? p.cursor : undefined
        ),
      (r) => ({ list: r.list ?? [], cursor: r.cursor })
    )
  );
  registry.set('ChatGroupManager.fetchGroupInfoFromServer', (p) =>
    sdkCall(
      () =>
        client.groupManager.fetchGroupInfoWithoutMembersFromServer(
          requireString(p, 'groupId')
        ),
      (g) => (g === undefined ? undefined : canonicalGroup(g))
    )
  );
  registry.set('ChatGroupManager.updateGroupName', (p) =>
    sdkCall(() =>
      client.groupManager.changeGroupName(
        requireString(p, 'groupId'),
        requireString(p, 'name')
      )
    )
  );
  registry.set('ChatGroupManager.updateGroupNamecard', (p) =>
    sdkCall(() =>
      client.groupManager.updateGroupNamecard(
        requireString(p, 'groupId'),
        typeof p.namecard === 'string' ? p.namecard : undefined
      )
    )
  );

  // --- ChatPresenceManager ---
  registry.set('ChatPresenceManager.subscribe', (p) =>
    sdkCall(
      () =>
        client.presenceManager.subscribe(
          stringArray(p, 'members'),
          typeof p.expiry === 'number' ? p.expiry : 0
        ),
      (list) => list.map(canonicalPresence)
    )
  );
  registry.set('ChatPresenceManager.unsubscribe', (p) =>
    sdkCall(() => client.presenceManager.unsubscribe(stringArray(p, 'members')))
  );
  registry.set('ChatPresenceManager.publishPresence', (p) =>
    sdkCall(() =>
      client.presenceManager.publishPresence(
        typeof p.desc === 'string' ? p.desc : undefined
      )
    )
  );
  registry.set('ChatPresenceManager.fetchPresenceStatus', (p) =>
    sdkCall(
      () =>
        client.presenceManager.fetchPresenceStatus(stringArray(p, 'members')),
      (list) => list.map(canonicalPresence)
    )
  );

  // --- ChatUserInfoManager ---
  registry.set('ChatUserInfoManager.fetchOwnInfo', () =>
    // RN has no expireTime parameter; the extra param is tolerated (§10).
    sdkCall(
      () => client.userManager.fetchOwnInfo(),
      (u) => (u === undefined ? undefined : canonicalUserInfo(u))
    )
  );
  registry.set('ChatUserInfoManager.updateUserInfo', (p) =>
    // RN returns void; success carries no data — the cases assert via events
    // and follow-up queries (contract §10, pending T11 calibration).
    sdkCall(() =>
      client.userManager.updateOwnUserInfo({
        nickName: typeof p.nickname === 'string' ? p.nickname : undefined,
        avatarUrl: typeof p.avatarUrl === 'string' ? p.avatarUrl : undefined,
        mail: typeof p.mail === 'string' ? p.mail : undefined,
        phone: typeof p.phone === 'string' ? p.phone : undefined,
        gender: typeof p.gender === 'number' ? p.gender : undefined,
        sign: typeof p.sign === 'string' ? p.sign : undefined,
        birth: typeof p.birth === 'string' ? p.birth : undefined,
        ext: typeof p.ext === 'string' ? p.ext : undefined,
      })
    )
  );
  registry.set('ChatUserInfoManager.subscribeUsersInfo', (p) =>
    sdkCall(() =>
      client.userManager.subscribeUsersInfo(stringArray(p, 'userIds'))
    )
  );
  registry.set('ChatUserInfoManager.unsubscribeUsersInfo', (p) =>
    sdkCall(() =>
      client.userManager.unsubscribeUsersInfo(stringArray(p, 'userIds'))
    )
  );

  return registry;
}
