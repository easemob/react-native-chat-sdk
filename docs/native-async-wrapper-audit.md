# Native Async Wrapper Audit

- Date: 2026-06-12
- Status: initial audit
- Scope: native wrappers under `modules/java/com/chatsdk/dispatch/` and `modules/objc/dispatch/`
- Current dependency versions observed in this repo:
  - Android Gradle dependency: `io.hyphenate:hyphenate-chat:4.19.2`
  - iOS Podfile.lock: `HyphenateChat 4.19.1`
- Reference SDK source:
  - Android: `/Users/asterisk/Codes/easemob/emclient-android`
  - iOS: `/Users/asterisk/Codes/easemob/emclient-ios`
- Additional Android verification source:
  - Local Gradle cache: `hyphenate-chat-4.19.3-sources.jar`

## Background

Some Hyphenate native SDK APIs provide both synchronous and asynchronous forms. For SDK operations that send network requests, the React Native wrapper should prefer the native asynchronous API and resolve or reject the JS promise from the native callback.

The concrete example is `addContact` on Android. The current wrapper calls:

```java
EMClient.getInstance().contactManager().addContact(username, reason);
```

The reference Android SDK also exposes:

```java
asyncAddContact(username, reason, EMCallBack)
```

For this kind of API, the asynchronous callback is a better signal for JS because it is invoked after the native request has completed and can carry the real success or failure result. A synchronous call wrapped in `try/catch` can only report exceptions thrown by that call path and is easier to misinterpret as request success.

## Audit Rule

Flag a wrapper method when all of these are true:

- The SDK operation is a server or network operation.
- The Android or iOS wrapper currently calls a synchronous native SDK API.
- The reference native SDK exposes an asynchronous completion/callback alternative.
- The JS method expects a promise-style success or error result.

Do not flag purely local DB/cache operations just because they are synchronous.

## Android Audit

### High-Confidence Android Items

These Android wrapper methods currently use synchronous native SDK APIs even though the reference Android SDK exposes async equivalents.

| JS API / wrapper method | Current Android native call | Preferred Android native call | Notes |
|---|---|---|---|
| `addContact` | `contactManager().addContact(username, reason)` | `asyncAddContact(username, reason, EMCallBack)` | Highest priority. Matches the reported bug. |
| `getAllContactsFromServer` | `getAllContactsFromServer()` | `asyncGetAllContactsFromServer(EMValueCallBack<List<String>>)` | Server query. |
| `addUserToBlockList` | `addUserToBlackList(username, false)` | `asyncAddUserToBlackList(username, false, EMCallBack)` | Server operation. |
| `removeUserFromBlockList` | `removeUserFromBlackList(username)` | `asyncRemoveUserFromBlackList(username, EMCallBack)` | Server operation. |
| `getBlockListFromServer` | `getBlackListFromServer()` | `asyncGetBlackListFromServer(EMValueCallBack<List<String>>)` | Server query. |
| `acceptInvitation` | `acceptInvitation(username)` | `asyncAcceptInvitation(username, EMCallBack)` | Server operation. |
| `declineInvitation` | `declineInvitation(username)` | `asyncDeclineInvitation(username, EMCallBack)` | Server operation. |
| `getSelfIdsOnOtherPlatform` | `getSelfIdsOnOtherPlatform()` | `asyncGetSelfIdsOnOtherPlatform(EMValueCallBack<List<String>>)` | Server query. |
| `createChatRoom` | `createChatRoom(...)` | `asyncCreateChatRoom(..., EMValueCallBack<EMChatRoom>)` | Server operation. |
| `destroyChatRoom` | `destroyChatRoom(roomId)` | `asyncDestroyChatRoom(roomId, EMCallBack)` | Server operation. |
| `changeChatRoomSubject` | `changeChatRoomSubject(roomId, subject)` | `asyncChangeChatRoomSubject(roomId, subject, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `changeChatRoomDescription` | `changeChatroomDescription(roomId, description)` | `asyncChangeChatroomDescription(roomId, description, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `fetchChatRoomMembers` | `fetchChatRoomMembers(roomId, cursor, pageSize)` | `asyncFetchChatRoomMembers(roomId, cursor, pageSize, EMValueCallBack<EMCursorResult<String>>)` | Server query. |
| `muteChatRoomMembers` | `muteChatRoomMembers(roomId, members, duration)` | `asyncMuteChatRoomMembers(roomId, members, duration, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `unMuteChatRoomMembers` | `unMuteChatRoomMembers(roomId, members)` | `asyncUnMuteChatRoomMembers(roomId, members, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `changeChatRoomOwner` | `changeOwner(roomId, newOwner)` | `asyncChangeOwner(roomId, newOwner, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `addChatRoomAdmin` | `addChatRoomAdmin(roomId, admin)` | `asyncAddChatRoomAdmin(roomId, admin, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `removeChatRoomAdmin` | `removeChatRoomAdmin(roomId, admin)` | `asyncRemoveChatRoomAdmin(roomId, admin, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `fetchChatRoomMuteList` | `fetchChatRoomMuteList(roomId, pageNum, pageSize)` | `asyncFetchChatRoomMuteList(roomId, pageNum, pageSize, EMValueCallBack<Map<String, Long>>)` | Server query. |
| `removeChatRoomMembers` | `removeChatRoomMembers(roomId, members)` | `asyncRemoveChatRoomMembers(roomId, members, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `blockChatRoomMembers` | `blockChatroomMembers(roomId, members)` | `asyncBlockChatroomMembers(roomId, members, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `unBlockChatRoomMembers` | `unblockChatRoomMembers(roomId, members)` | `asyncUnblockChatRoomMembers(roomId, members, EMValueCallBack<EMChatRoom>)` | Server operation. |
| `fetchChatRoomBlockList` | `fetchChatRoomBlackList(roomId, pageNum, pageSize)` | `asyncFetchChatRoomBlackList(roomId, pageNum, pageSize, EMValueCallBack<List<String>>)` | Server query. |
| `updateChatRoomAnnouncement` | `updateChatRoomAnnouncement(roomId, announcement)` | `asyncUpdateChatRoomAnnouncement(roomId, announcement, EMCallBack)` | Server operation. |
| `fetchChatRoomAnnouncement` | `fetchChatRoomAnnouncement(roomId)` | `asyncFetchChatRoomAnnouncement(roomId, EMValueCallBack<String>)` | Server query. |
| `recallMessage` | `chatManager().recallMessage(msg, ext)` | `asyncRecallMessage(msg, ext, EMCallBack)` | Server operation. |
| `fetchConversationsFromServer` | `fetchConversationsFromServer()` | `asyncFetchConversationsFromServer(...)` | Current Android call uses a deprecated sync API in the reference SDK. |
| `fetchHistoryMessages` | `fetchHistoryMessages(...)` | `asyncFetchHistoryMessages(...)` | Android wrapper already has another async history API; this should be aligned. |
| `updatePushNickname` | `pushManager().updatePushNickname(nickname)` | `asyncUpdatePushNickname(nickname, EMCallBack)` | Reference Android SDK documents the async equivalent. |

### Android Sync Items Confirmed Without Equivalent Async API

These methods are still synchronous, but Android 4.19.3 source does not expose an equivalent public async API that preserves the current wrapper semantics. Keep them marked for future SDK review, but do not include them in the current async-replacement candidate list.

| JS API / wrapper method | Current Android native call | 4.19.3 API finding | Audit status |
|---|---|---|---|
| `deleteContact` | `deleteContact(username, keepConversation)` | Async API exists only as `asyncDeleteContact(username, EMCallBack)` and does not expose `keepConversation`. | Keep sync for now; revisit on SDK upgrade. |
| `fetchChatRoomInfoFromServer` | `fetchChatRoomFromServer(roomId, fetchMembers)` | Async API exists only as `asyncFetchChatRoomFromServer(roomId, EMValueCallBack<EMChatRoom>)` and does not expose `fetchMembers`; the sync overload with `fetchMembers` is deprecated. | Keep sync for now; revisit on SDK upgrade. |
| `addMembers` | `groupManager().addUsersToGroup(groupId, members, welcome)` | Async API exists only as `asyncAddUsersToGroup(groupId, members, EMCallBack)` and does not expose `welcome`. | Keep sync for now; revisit on SDK upgrade. |
| `getGroupSpecificationFromServer` | `getGroupFromServer(groupId, fetchMembers)` | Async API exists only as `asyncGetGroupFromServer(groupId, EMValueCallBack<EMGroup>)` and does not expose `fetchMembers`; the sync overload with `fetchMembers` is deprecated. | Keep sync for now; revisit on SDK upgrade. |
| `updateGroupExt` | `updateGroupExtension(groupId, ext)` | No async equivalent found in Android 4.19.3 source. | Keep sync for now; revisit on SDK upgrade. |
| `getPushConfigsFromServer` | `getPushConfigsFromServer()` | No async equivalent found in Android 4.19.3 source. | Keep sync for now; revisit on SDK upgrade. |

## iOS Audit

### iOS Sync Items Reviewed And Not Flagged

These iOS wrapper methods use synchronous native SDK APIs, but they are not flagged as async-wrapper issues in this audit because the current implementation appears tied to platform threading or push-registration requirements. If they are changed later, preserve that constraint in the design.

| JS API / wrapper method | Current iOS native call | Audit status | Notes |
|---|---|---|---|
| `updateImPushStyle` | `pushManager updatePushDisplayStyle:` inside `dispatch_async` | Not flagged for this audit. | The call pattern appears intentional for thread handling. Record this if revisited. |
| `bindDeviceToken` | `EMClient.sharedClient bindDeviceToken:` inside `dispatch_async` | Not flagged for this audit. | Push token registration may have main-thread or platform-call constraints. Record this if revisited. |

### iOS Items Requiring SDK-Version Confirmation

No iOS server-operation wrapper has been classified as "needs version confirmation" in this pass.

### iOS Areas Checked With Completion APIs

The following iOS wrapper areas were checked and already use completion APIs for server/network operations:

- `ExtSdkContactManagerWrapper.m`
  - `addContact`
  - `deleteContact`
  - `getAllContactsFromServer`
  - `addUserToBlockList`
  - `removeUserFromBlockList`
  - `getBlockListFromServer`
  - `acceptInvitation`
  - `declineInvitation`
  - `getSelfIdsOnOtherPlatform`
- `ExtSdkGroupManagerWrapper.m`
  - `getGroupSpecificationFromServer`
  - `addMembers`
  - `updateGroupExt`
- `ExtSdkClientWrapper.m`
  - `createAccount`
  - `kickDevice`
  - `kickAllDevices`
  - `getLoggedInDevicesFromServer`
- `ExtSdkChatManagerWrapper.m`
  - `sendMessage`
  - `resendMessage`
  - `ackMessageRead`
  - `ackGroupMessageRead`
  - `ackConversationRead`
  - `recallMessage`
  - `getConversationsFromServer`
  - `fetchHistoryMessages`
  - `fetchGroupReadAck`
  - `deleteRemoteConversation`
- `ExtSdkChatroomManagerWrapper.m`
  - Server query and mutation methods found in this wrapper use completion callbacks.
- `ExtSdkPresenceManagerWrapper.m`
  - Presence publish, subscribe, unsubscribe, and fetch methods use completion callbacks.
- `ExtSdkChatThreadManagerWrapper.m`
  - Thread server query and mutation methods use completion callbacks.

### iOS Local/Non-Network Sync Calls

These iOS calls are synchronous but are currently treated as local DB/cache/config operations, not the network-result issue in this audit:

| Wrapper area | Examples |
|---|---|
| Contact local data | `getContacts`, `getAllContacts`, `getContact:` |
| Chat local data | `getMessageWithMessageId:`, `getAllConversations`, unread count aggregation |
| Conversation local data | `EMConversation` local message operations |
| Client config | `changeAppkey:`, `changeAppId:` |
| Chat local read marker | `markAllConversationsAsRead` |

## Items Excluded From This Audit

These methods are synchronous but appear to be local DB/cache/memory operations, not server requests. They are not part of the async-network-wrapper issue unless later evidence shows they can block on network or lose server errors.

| Wrapper area | Examples |
|---|---|
| Contact local data | `getAllContactsFromDB`, `getBlockListFromDB`, `getAllContacts`, `getContact` |
| Chat local data | `getMessage`, `getConversation`, `markAllChatMsgAsRead`, `getUnreadMessageCount`, local message update/import paths |
| Chat room local data | `getChatRoom`, `getAllChatRooms` |
| Group local data | `getGroupWithId`, `getJoinedGroups`, local group cache reads |
| Listener registration | `add*Listener`, `remove*Listener`, delegate registration methods |

## Suggested Fix Order

1. Start with Android `ExtSdkContactManagerWrapper.java` high-confidence items, especially `addContact`.
2. Leave the Android sync items confirmed without equivalent async API unchanged for this pass.
3. Leave the reviewed iOS push sync items unchanged for this pass.
4. Continue with Android `ExtSdkChatRoomManagerWrapper.java` high-confidence items in batches.
5. Continue with Android chat and push high-confidence items.
6. Add focused wrapper-level tests where practical, and manually exercise native wrapper changes in the example app because native wrapper code is not covered by automated tests.
