# Deprecated Native API → TypeScript Annotation Audit

Date: 2026-08-26
Scope: react-native-chat-sdk 1.20.0 (iOS SDK 4.x / Android SDK `io.hyphenate:hyphenate-chat:4.24.1`)

## Background

The CI job `Scan deprecated iOS/Android APIs` (`.github/workflows/ci.yml`) collects compiler
deprecation warnings from the example build and emits
`build/reports/deprecated-ios.json` / `deprecated-android.json`. This document audits every
warning against the TypeScript public API (`src/`), checking whether the corresponding TS API
carries an `@deprecated` tag with a documented replacement.

## Audit result: already annotated in TS

| Native warning | TS API | Annotation |
|---|---|---|
| `getConversationsFromServer:` / `fetchConversationsFromServer()` | `ChatManager.fetchAllConversations` | `ChatManager.ts:1525` → `fetchConversationsFromServerWithCursor` |
| `getConversationsFromServerByPage:` / `asyncFetchConversationsFromServer` | `ChatManager.fetchConversationsFromServerWithPage` | `ChatManager.ts:3296` → `fetchConversationsFromServerWithCursor` |
| `asyncFetchHistoryMessagesFromServer:...` / `fetchHistoryMessages(...)` | `ChatManager.fetchHistoryMessages` | `ChatManager.ts:1135` → `fetchHistoryMessagesByOptions` |
| `asyncModifyMessage` | `ChatManager.modifyMessage` | `ChatManager.ts:3555` → `modifyMsgBody` |
| `loginWithUsername:password:` / `login(String,String)` | `ChatClient.login` | `ChatClient.ts:622` → `loginWithToken` |
| `loginWithUsername:agoraToken:` / `loginWithAgoraToken` | `ChatClient.loginWithAgoraToken` | `ChatClient.ts:678` → `login` |
| `loadMessagesWithKeyword:...fromUser:` / `searchMsgFromDB(...,String,...)` | `ChatManager.getMessagesWithKeyword` (`sender` param) | `ChatManager.ts:2264` → `getConvMsgsWithKeyword` (`senders` param) |
| `muteList` (toJson) / `onMuteListAdded` | `ChatRoom.muteList` / `ChatRoomEventListener.onMuteListAdded` | `ChatRoom.ts:107` → `muteKVList`; `ChatEvents.ts:1197` → `onMuteListAddedV2` |
| `from` (toJson) / `EMFetchMessageOption.setFrom` | `ChatFetchMessageOptions.from` | `ChatMessage.ts:1737` → `senders` |
| `onMemberJoined` / `onMemberExited` | Same-named group events | `ChatEvents.ts:917/935` → `onMembersJoined` / `onMembersExited` |

## Annotation added by this audit

- `ChatImageMessageBody.thumbnailSecret` (`src/common/ChatMessage.ts`): the Android SDK
  deprecates `EMImageMessageBody.setThumbnailSecret/getThumbnailSecret` with the replacement
  `setSecret/getSecret`. Tagged `@deprecated`, pointing to `ChatFileMessageBody.secret`.
  - Android-only deprecation: iOS `thumbnailSecretKey` is NOT deprecated by the iOS SDK.
  - The video body `ChatVideoMessageBody.thumbnailSecret` is NOT deprecated in the Android
    SDK (`EMVideoMessageBody` has no such annotation) and was left untouched.

## Warnings that need no TS annotation

- `getAllChatRooms()` / `getGroupsWithoutPushNotification:` — the corresponding TS APIs have
  already been removed from `src/`. Leftover dead code: unused `MTgetAllChatRooms` and
  `MTgetGroupsWithoutPushNotification` constants in `src/__internal__/Consts.ts`, plus the
  native wrapper implementations.
- `onLogout(int, String)` (Android) — deprecated listener overload; the wrapper also
  implements the new `onLogout(int, EMLoginExtensionInfo)` overload. No corresponding TS API.
- `onRequestToJoinDeclined` (deprecated 4-arg overload) — the TS event already matches the
  new 5-arg signature (`applicant` included); the wrapper's old 4-arg override is an empty
  method body.
- `EMGroupMemberInfo.getMemberId()` → `getUserId()` — a pure native rename. The TS field
  `ChatGroupMember.memberId` remains semantically valid and must not be deprecated; the fix
  belongs to the Android wrapper (call `getUserId()` instead).
- `EMImageMessageBody.isSendOriginalImage()` → `isOriginalImage()` — only the *getter* is
  deprecated; the setter `setSendOriginalImage` is not. The TS `sendOriginalImage` field is
  the send-direction flag and stays valid; the read-direction replacement `isOriginalImage`
  already exists in TS. The wrapper's `imageBodyToJson` read path is a native-side concern.
- `TurboReactPackage` / `ReactModuleInfo(String,...)` — React Native framework deprecations,
  unrelated to the TS public API.

## Follow-ups (not in scope of this audit)

- Remove dead code: unused MT constants and the native `getAllChatRooms` /
  `getGroupsWithoutPushNotification` wrapper implementations.
- Android wrapper cleanups that would silence remaining warnings: use
  `EMGroupMemberInfo.getUserId()`, read the original-image flag via `isOriginalImage()`,
  drop the empty deprecated `onRequestToJoinDeclined` 4-arg override.
