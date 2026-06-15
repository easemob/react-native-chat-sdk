# Android Native Async Wrapper Design

- Date: 2026-06-15
- Status: design approved for spec review
- Scope: Android native wrappers under `modules/java/com/chatsdk/dispatch/`

## Goal

Replace Android synchronous Hyphenate SDK calls for server/network operations with asynchronous SDK calls, so React Native promises resolve or reject from the native async callback result.

The change must preserve the current JS-facing API contract for TypeScript APIs that are still active.

## Inputs

This design is based on:

- `docs/native-async-wrapper-audit.md`
- `docs/native-async-wrapper-compatibility-check.md`
- TypeScript API deprecation markers in `src/`
- Android wrapper implementations in `modules/java/com/chatsdk/dispatch/`
- Android Hyphenate SDK source under `/Users/asterisk/Codes/easemob/emclient-android`

## Core Rules

Only process Android wrapper methods whose corresponding TypeScript API is not deprecated.

Do not process a wrapper method when the corresponding TypeScript API is explicitly marked with `@deprecated`, or when its method constant is explicitly marked deprecated and no active TypeScript API uses that wrapper contract.

Do not change:

- TypeScript public APIs
- method name constants
- iOS wrappers
- generated `lib/` output
- Flutter wrapper directories

Preserve the current JS-facing success value and error behavior unless a specific parameter difference has already been approved.

If implementation reveals an uncertain SDK API mapping, uncertain return conversion, uncertain TypeScript deprecation relationship, or a major case not covered by this design, stop and ask the project owner before changing behavior.

## Explicit Exclusions

Do not convert these Android sync calls in this task:

- `getConversationsFromServer`: TypeScript `ChatManager.fetchAllConversations()` is deprecated.
- `fetchHistoryMessages`: TypeScript `ChatManager.fetchHistoryMessages()` is deprecated.
- `updateGroupExt`: no matching Android async API found in the checked SDK source.
- `getPushConfigsFromServer`: no matching Android async API found in the checked SDK source.

Deprecated TypeScript methods do not drive parameter compatibility requirements for this task. For example, `ChatGroupManager.fetchGroupInfoFromServer(groupId, isFetchMembers)` is deprecated, so its `fetchMembers` behavior is not preserved as a requirement. The same native wrapper method is still used by active `fetchGroupInfoWithoutMembersFromServer(groupId)`, so the Android wrapper can use the async SDK API that only accepts `groupId`.

## Android Wrapper Scope

### Contact

Convert active contact server operations in `ExtSdkContactManagerWrapper.java`:

- `addContact`
- `deleteContact`
- `getAllContactsFromServer`
- `addUserToBlockList`
- `removeUserFromBlockList`
- `getBlockListFromServer`
- `acceptInvitation`
- `declineInvitation`
- `getSelfIdsOnOtherPlatform`

Use `EMCallBack` methods when the SDK async API has no result value, and return the old success identifier manually when the old wrapper returned one.

Use `EMValueCallBack<List<String>>` methods for list-returning server queries and return the list unchanged.

Approved parameter difference:

- `deleteContact` should use `asyncDeleteContact(username, EMCallBack)` and ignore `keepConversation`.

### Chat Room

Convert active chat room server operations in `ExtSdkChatRoomManagerWrapper.java`:

- `fetchChatRoomInfoFromServer`
- `createChatRoom`
- `destroyChatRoom`
- `changeChatRoomSubject`
- `changeChatRoomDescription`
- `fetchChatRoomMembers`
- `muteChatRoomMembers`
- `unMuteChatRoomMembers`
- `changeChatRoomOwner`
- `addChatRoomAdmin`
- `removeChatRoomAdmin`
- `fetchChatRoomMuteList`
- `removeChatRoomMembers`
- `blockChatRoomMembers`
- `unBlockChatRoomMembers`
- `fetchChatRoomBlockList`
- `updateChatRoomAnnouncement`
- `fetchChatRoomAnnouncement`

Preserve existing success conversions:

- `EMChatRoom` to `ExtSdkChatRoomHelper.toJson(value)`
- `EMCursorResult<String>` to `ExtSdkCursorResultHelper.toJson(value)`
- `List<String>` returned unchanged
- mute-list `Map<String, Long>` converted to `value.keySet().toArray()` to match current JS output
- `EMCallBack` mutation methods returning `null` when the old wrapper returned `null`

Approved parameter difference:

- `fetchChatRoomInfoFromServer` should use `asyncFetchChatRoomFromServer(roomId, EMValueCallBack<EMChatRoom>)` and ignore legacy `fetchMembers`.

Implementation note:

- The checked Android SDK source uses `asyncUnBlockChatRoomMembers` for the unblock method name.

### Group

Convert active group server operations in `ExtSdkGroupManagerWrapper.java`:

- `getGroupSpecificationFromServer`
- `addMembers`

Preserve existing success conversions:

- `EMGroup` to `ExtSdkGroupHelper.toJson(value)`
- `addMembers` returns `null` on success

Approved parameter differences:

- `getGroupSpecificationFromServer` should use `asyncGetGroupFromServer(groupId, EMValueCallBack<EMGroup>)` and ignore legacy `fetchMembers`.
- `addMembers` should use `asyncAddUsersToGroup(groupId, members, EMCallBack)` and ignore `welcome`.

### Chat

Convert active chat server operations in `ExtSdkChatManagerWrapper.java` that have matching async APIs and are not TypeScript-deprecated:

- `recallMessage`

Preserve existing success conversion:

- return `null` on async success

Do not convert `getConversationsFromServer` or `fetchHistoryMessages` because their TypeScript APIs are deprecated.

### Push

Convert active push server operations in `ExtSdkPushManagerWrapper.java`:

- `updatePushNickname`

Preserve existing success conversion:

- return `nickname` manually from `EMCallBack.onSuccess()`.

## Error Handling

For async callback failures, call:

```java
ExtSdkWrapper.onError(result, code, error);
```

or:

```java
ExtSdkWrapper.onError(result, error, errorMsg);
```

matching the callback parameter names and nearby wrapper style.

For synchronous JSON parameter parsing, keep current method signatures and existing exception flow. Do not add broad catch blocks around async API invocation unless a nearby method already uses that pattern and the SDK call is documented to throw synchronously.

## Verification

Run local validation after implementation:

- `yarn typecheck`
- `yarn example build:android`

Run `yarn test --no-watchman` if practical, but it is not expected to cover Java wrapper behavior directly.

Native wrapper behavior still requires manual example-app validation for affected features before release because these Java wrappers are not covered by automated native tests.
