# Deprecated API Leftover Audit (src + native wiring)

Date: 2026-09-21
Scope: `react-native-chat-sdk` 5.0.0 worktree — `src/` (public API, internal consts, events,
models) plus the corresponding leftover wiring in `modules/java`, `modules/objc`, `modules/cpp`.
Example app (`example/src`, `example/ci`) and `docs/` were cross-checked for references.

## Method

1. Searched `src/` for deprecation markers (`@deprecated`, `// deprecated`, `作废/废弃`).
2. Cross-checked the 2026-08-26 audit (`docs/deprecated-api-ts-annotation-audit.md`) item by item
   against current `src/`.
3. Scanned all 278 `MT*` consts in `src/__internal__/Consts.ts` for references anywhere else in
   `src/` (symbol and string value), then checked each unreferenced const against
   `modules/java`, `modules/objc`, `modules/cpp`, `example/`, and `docs/`.
4. Used `git log -S` to date the disappearance of each TS-side reference.

## Headline result

The **public TS API surface is clean**: no `@deprecated` JSDoc tags remain, no deprecated public
method, property, or event survives in `src/`, and every item flagged by the 2026-08-26 audit was
removed during the 5.0.0 cleanup. What remains is **dead internal plumbing**: 23 method-name
constants whose TS APIs are gone, still wired through the Android/iOS/C++ layers, plus one
commented-out model field.

## A. Explicitly marked `// deprecated` — 9 method consts not cleaned

All nine carry a `// deprecated <date>` marker in `src/__internal__/Consts.ts` but still exist
there, and none is referenced anywhere else in `src/`. The contract-test parser
(`src/__tests__/contract/parsers.ts`) strips `// deprecated` lines, which is why these pass CI
despite being dead.

| Method | Marked | TS leftover | Android leftover (Java) | iOS leftover (ObjC) | C++ leftover |
|---|---|---|---|---|---|
| `updateCurrentUserNick` | 2026-05-21 | `Consts.ts:11` | const + dispatch case | none | const |
| `syncConversationName` | 2022.05.05 | `Consts.ts:132` | const + dispatch case | key/value/methodMap + dispatch case | const |
| `setNoDisturbUsers` | 2022.05.04 | `Consts.ts:263` | const + dispatch case | key/value/methodMap | none |
| `getNoDisturbUsersFromServer` | 2022.05.04 | `Consts.ts:264` | const + dispatch case | key/value/methodMap | none |
| `updateHMSPushToken` | 2026-05-21 | `Consts.ts:266` | const + dispatch case + wrapper (`ExtSdkPushManagerWrapper.updateHMSPushToken`) | none (Android-only) | const |
| `updateFCMPushToken` | 2026-05-21 | `Consts.ts:267` | const + dispatch case + wrapper (`ExtSdkPushManagerWrapper.updateFCMPushToken`) | none (Android-only) | const |
| `updateAPNsPushToken` | 2026-05-21 | `Consts.ts:268` | none (iOS-only) | key/value/methodMap + dispatch case; wrapper body already commented out (`ExtSdkClientWrapper.m:261`) | none |
| `imPushNoDisturb` | 2022.05.04 | `Consts.ts:270` | const + dispatch case | key/value/methodMap + dispatch case | const |
| `getNoDisturbGroups` | 2022.05.04 | `Consts.ts:273` | const + dispatch case | key/value/methodMap + dispatch case | const |

Java locations: `modules/java/com/chatsdk/common/ExtSdkMethodType.java` (consts),
`modules/java/com/chatsdk/dispatch/ExtSdkDispatch.java` (cases). ObjC locations:
`modules/objc/common/ExtSdkMethodTypeObjc.h/.m` (keys, values, methodMap),
`modules/objc/dispatch/ExtSdkDispatch.m` (cases), `modules/objc/rn/ExtSdkApiObjcRN.mm`
(supported-method list). C++ locations: `modules/cpp/common/ExtSdkMethodType.h/.cpp`.

## B. Unmarked but equally dead — 14 method consts from 2022-era TS removals

These have **no** deprecation marker, yet no reference (symbol or string value) exists in `src/`
outside `Consts.ts`, nor in `example/` or `docs/`. `git log -S` dates the TS-side disappearance
to 2022 (API renames and the 3.9.x cleanup). They are the same kind of leftover as
`MTgetAllChatRooms`, which was deliberately scrubbed in 5.0.0 — these were missed.

| Method | TS reference gone | Android leftover | iOS leftover | C++ leftover |
|---|---|---|---|---|
| `getGroupsWithoutPushNotification` | 2022-04-25 | const + dispatch + wrapper (`ExtSdkGroupManagerWrapper`) | key/value/methodMap + dispatch | const |
| `uploadLog` | 2022-04-25 | const + dispatch + wrapper (`ExtSdkClientWrapper`) | key/value/methodMap + dispatch + wrapper (`ExtSdkClientWrapper`) | const |
| `loadMsgWithId` | 2022-07-19 (api rename) | const + dispatch + wrapper (`ExtSdkConversationWrapper`) | key/value/methodMap + dispatch + wrapper (`ExtSdkConversationWrapper`) | const |
| `appendMessage` | 2022-07-20 | const + dispatch + wrapper (`ExtSdkConversationWrapper`) | wrapper string remnant only (`ExtSdkConversationWrapper.m`) | const |
| `fetchChatRoomAllAttributes` | 2022-09-28 (3.9.6.2 upgrade) | const + dispatch + wrapper (`ExtSdkChatRoomManagerWrapper`) | dispatch + wrapper (`ExtSdkChatroomManagerWrapper.h/.m`) | none |
| `enableOfflinePush` | 2022-06-16 | const + dispatch + wrapper (`ExtSdkPushManagerWrapper`) | wrapper string remnant only (`ExtSdkPushManagerWrapper.m`) | none |
| `disableOfflinePush` | 2022-06-16 | const + dispatch + wrapper (`ExtSdkPushManagerWrapper`) | wrapper string remnant only (`ExtSdkPushManagerWrapper.m`) | none |
| `getNoPushGroups` | 2022-06-16 | const + dispatch + wrapper | key/value/methodMap + dispatch + wrapper | none |
| `updateGroupPushService` | 2022-06-16 | const + dispatch + wrapper | key/value/methodMap + dispatch + wrapper | const |
| `updateUserPushService` | 2022-06-16 | const + dispatch + wrapper | key/value/methodMap + dispatch + wrapper | none |
| `getNoPushUsers` | 2022-06-16 | const + dispatch + wrapper | key/value/methodMap + dispatch + wrapper | none |
| `reportPushAction` | 2022-07-15 | const + dispatch + wrapper | key/value/methodMap + dispatch + wrapper | none |
| `updateOwnUserInfoWithType` | 2022-04-25 | const + dispatch + wrapper (`ExtSdkUserInfoManagerWrapper`) | key/value/methodMap + dispatch + wrapper | const |
| `fetchUserInfoByIdWithType` | 2022-04-25 | const + dispatch + wrapper (`ExtSdkUserInfoManagerWrapper`) | key/value/methodMap + dispatch + wrapper | const |

Note: `getGroupsWithoutPushNotification` was already called out as leftover dead code in the
2026-08-26 audit; the native SDKs deprecated/removed it long ago (iOS `EM_DEPRECATED_IOS(3_3_2,
3_8_3)`), and the iOS wrapper was deleted in 5.0.0 — but the ObjC key/value/methodMap/dispatch
entries and the full Android chain remain.

## C. Deprecated property leftover

- ~~`src/common/ChatMessageStreamChunk.ts:53` — commented-out field
  `// sequenceNumber: number; // deprecated` inside the `ChatStreamChunk` interface.~~
  **Resolved 2026-09-21**: the commented line was removed.

No other deprecated properties survive: `ChatFetchMessageOptions.from` (→ `senders`),
`ChatRoom.muteList` (→ `muteKVList`), and `ChatImageMessageBody.thumbnailSecret`
(→ `ChatFileMessageBody.secret`) are all gone from `src/`.

## Verified clean (for the record)

Everything the 2026-08-26 audit listed as "annotated in TS" was removed in the 5.0.0 cleanup —
none of the following exists in `src/` anymore:

- Methods: `ChatClient.login` (password), `ChatClient.loginWithAgoraToken`,
  `ChatManager.fetchAllConversations`, `fetchConversationsFromServerWithPage`,
  `fetchHistoryMessages`, `modifyMessage`, `getMessagesWithKeyword` (`sender` param),
  `ChatRoomManager.getAllChatRooms` (never public in TS; const scrubbed in 5.0.0).
- Events: group `onMemberJoined`/`onMemberExited` (→ `onMembersJoined`/`onMembersExited`),
  chat-room `onMuteListAdded` (→ `onMuteListAddedV2`), `onMessagesRecalled`,
  `onMessageReadAck`/`onMessageDeliveryAck`, `onMessageStatusChanged`.
  `UNWIRED_EVENT_ALLOWLIST` in `src/__tests__/contract/eventWiring.test.ts` is empty.
- Properties: see section C.

The surviving lookalikes are **not** deprecated: group `ChatGroupEventListener.onMuteListAdded`
(`ChatEvents.ts:961`), chat-room `onMemberJoined`/`onMemberExited` (`ChatEvents.ts:1220/1232`),
`ChatGroup.muteList`, and `ChatVideoMessageBody.thumbnailSecret` (the Android SDK deprecates the
*image* body's thumbnail secret only, not the video body's).

## Cleanup recommendation

~~**Decision (2026-09-21): the method-name contract keys are intentionally retained**~~
**Superseded 2026-09-23: the cleanup was executed.** All section A/B method-name contracts
were removed across every layer — `src/__internal__/Consts.ts` (23 consts, including
`MTgetImPushConfig`, which was missed by this audit), `modules/cpp/common/ExtSdkMethodType.h/.cpp`,
`modules/java` (consts + dispatch cases + wrapper methods), and `modules/objc` (keys, values,
methodMap, dispatch cases, the RN supported-method list, wrapper methods). The sweep additionally
removed native-only leftovers not covered by sections A/B: `modifyMessage`, `ignoreGroupPush`,
and the ObjC-only dead entries `currentUser` (deprecated alias of `getCurrentUser`),
`updateConversationsName`, and `fetchChatThread`. Verified with `yarn typecheck`, `yarn lint`,
and `yarn test --no-watchman` (19 suites / 116 tests, contract tests included). Known issue left
untouched: ObjC `renewToken` has a wrapper implementation and a methodMap entry but no dispatch
case in `ExtSdkDispatch.m`, so it falls through to "not implement" — a functional gap reported
separately, not part of this cleanup. The inventory below is kept as historical record.

<details>
<summary>Original removal plan (superseded by the decision above)</summary>

No user-facing breakage is involved — none of the 23 methods is reachable from the RN side, so
removal is internal dead-code deletion only:

1. `src/__internal__/Consts.ts`: delete the 23 `MT*` consts (9 marked + 14 unmarked).
2. `modules/cpp/common/ExtSdkMethodType.h/.cpp`: delete the matching string constants.
3. `modules/java/com/chatsdk/common/ExtSdkMethodType.java`: delete the consts;
   `modules/java/com/chatsdk/dispatch/ExtSdkDispatch.java`: delete the dispatch cases;
   delete the wrapper methods listed in sections A/B.
4. `modules/objc/common/ExtSdkMethodTypeObjc.h/.m`: delete keys, int values, and methodMap
   entries; `modules/objc/dispatch/ExtSdkDispatch.m`: delete cases;
   `modules/objc/rn/ExtSdkApiObjcRN.mm`: remove from the supported-method list; delete the
   wrapper methods / string remnants listed in sections A/B (including the commented-out
   `asyncBindDeviceToken` body in `ExtSdkClientWrapper.m`).
5. `src/common/ChatMessageStreamChunk.ts`: delete the commented `sequenceNumber` line.
6. Re-run `yarn typecheck`, `yarn lint`, `yarn test --no-watchman`. The contract tests strip
   `// deprecated` lines, so deleting those consts cannot regress them; the event-wiring test is
   unaffected (no `MTon*` involved).

Precedent: the 5.0.0 `getAllChatRooms` scrub did exactly this six-file ObjC + three-file Java +
C++ + TS sweep (see `docs/porting/5.0.0/03-implementation.md`), so the pattern and the
verification path are already proven in this repo.

</details>
