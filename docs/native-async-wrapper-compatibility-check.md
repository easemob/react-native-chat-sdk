# Native Async Wrapper Compatibility Check

- Date: 2026-06-15
- Scope: Android high-confidence items from `docs/native-async-wrapper-audit.md`
- Goal: before replacing synchronous Android native SDK calls with async calls, verify whether the async API can preserve the current wrapper input and output semantics.
- Reference SDK source: `/Users/asterisk/Codes/easemob/emclient-android/hyphenatechatsdk/src/com/hyphenate/chat/`

## Compatibility Rule

A wrapper method is directly safe to convert only when the replacement preserves both:

- Input semantics: all current wrapper parameters are passed to an async SDK API with equivalent meaning.
- Output semantics: the JS-facing success value remains exactly what the current wrapper returns.

If an async SDK API changes input semantics, output semantics, or both, report the difference for project-owner decision before implementation. Do not assume that a deprecated async overload is acceptable, and do not assume that the synchronous call should be kept, unless that decision has been made explicitly.

For parameter differences already approved by the project owner:

- `deleteContact` should use `asyncDeleteContact`; ignore `keepConversation`.
- `fetchChatRoomInfoFromServer` should use `asyncFetchChatRoomFromServer`; ignore `fetchMembers`.
- `addMembers` should use `asyncAddUsersToGroup`; ignore `welcome`.
- `getGroupSpecificationFromServer` should use `asyncGetGroupFromServer`; ignore `fetchMembers`.
- Methods with no matching Android async API should stay unchanged for now.

When inputs differ but conversion has been approved, still verify the return value. If the async result can be converted to the original JS-facing return value, document the conversion. If it cannot be converted, stop and ask for a decision.

Implementation style should match existing async wrapper code:

- Use `EMCallBack` for SDK async methods with `onSuccess()` and return the same value the wrapper returned before.
- Use `EMValueCallBack<T>` for SDK async methods with `onSuccess(T value)` and keep the existing helper conversion or value trimming.
- Use `ExtSdkWrapper.onError(result, code, errorMsg)` in callback failures.

## Can Convert Directly

These methods have async SDK APIs with matching inputs and a callback result that can preserve the current success value.

### Contact

| Wrapper method | Async SDK API | Current success value | Compatibility |
|---|---|---|---|
| `addContact` | `asyncAddContact(username, reason, EMCallBack)` | `username` | Async has same inputs. Return `username` manually in `onSuccess()`. |
| `getAllContactsFromServer` | `asyncGetAllContactsFromServer(EMValueCallBack<List<String>>)` | contact list | Same output list. |
| `addUserToBlockList` | `asyncAddUserToBlackList(username, false, EMCallBack)` | `username` | Same inputs. Return `username` manually. |
| `removeUserFromBlockList` | `asyncRemoveUserFromBlackList(username, EMCallBack)` | `username` | Same input. Return `username` manually. |
| `getBlockListFromServer` | `asyncGetBlackListFromServer(EMValueCallBack<List<String>>)` | block list | Same output list. |
| `acceptInvitation` | `asyncAcceptInvitation(username, EMCallBack)` | `username` | Same input. Return `username` manually. |
| `declineInvitation` | `asyncDeclineInvitation(username, EMCallBack)` | `username` | Same input. Return `username` manually. |
| `getSelfIdsOnOtherPlatform` | `asyncGetSelfIdsOnOtherPlatform(EMValueCallBack<List<String>>)` | platform ID list | Same output list. |

### Chat Room

| Wrapper method | Async SDK API | Current success value | Compatibility |
|---|---|---|---|
| `createChatRoom` | `asyncCreateChatRoom(subject, description, welcomeMessage, maxUserCount, members, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `destroyChatRoom` | `asyncDestroyChatRoom(roomId, EMCallBack)` | `null` | Same input. |
| `changeChatRoomSubject` | `asyncChangeChatRoomSubject(roomId, subject, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `changeChatRoomDescription` | `asyncChangeChatroomDescription(roomId, description, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `fetchChatRoomMembers` | `asyncFetchChatRoomMembers(roomId, cursor, pageSize, EMValueCallBack<EMCursorResult<String>>)` | `ExtSdkCursorResultHelper.toJson(cursorResult)` | Same inputs and cursor output. |
| `muteChatRoomMembers` | `asyncMuteChatRoomMembers(roomId, members, duration, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `unMuteChatRoomMembers` | `asyncUnMuteChatRoomMembers(roomId, members, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `changeChatRoomOwner` | `asyncChangeOwner(roomId, newOwner, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `addChatRoomAdmin` | `asyncAddChatRoomAdmin(roomId, admin, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `removeChatRoomAdmin` | `asyncRemoveChatRoomAdmin(roomId, admin, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `removeChatRoomMembers` | `asyncRemoveChatRoomMembers(roomId, members, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `blockChatRoomMembers` | `asyncBlockChatroomMembers(roomId, members, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `unBlockChatRoomMembers` | `asyncUnBlockChatRoomMembers(roomId, members, EMValueCallBack<EMChatRoom>)` | `ExtSdkChatRoomHelper.toJson(room)` | Same inputs and room output. |
| `fetchChatRoomBlockList` | `asyncFetchChatRoomBlackList(roomId, pageNum, pageSize, EMValueCallBack<List<String>>)` | block list | Same inputs and list output. |
| `updateChatRoomAnnouncement` | `asyncUpdateChatRoomAnnouncement(roomId, announcement, EMCallBack)` | `null` | Same inputs. |
| `fetchChatRoomAnnouncement` | `asyncFetchChatRoomAnnouncement(roomId, EMValueCallBack<String>)` | announcement string | Same input and string output. |

### Chat And Push

| Wrapper method | Async SDK API | Current success value | Compatibility |
|---|---|---|---|
| `recallMessage` | `asyncRecallMessage(message, ext, EMCallBack)` | `null` | Same message and `ext` inputs. |
| `updatePushNickname` | `asyncUpdatePushNickname(nickname, EMCallBack)` | `nickname` | Same input. Return `nickname` manually. |

## Can Convert With Special Handling

These methods can be converted, but only with the handling listed below. Some rows use an async overload whose input shape differs from the current wrapper; those rows are included only because the project owner explicitly approved that behavior change.

| Wrapper method | Issue / approved difference | Required handling |
|---|---|---|
| `deleteContact` | Approved input difference: `asyncDeleteContact(username, EMCallBack)` does not accept `keepConversation`. | Ignore `keepConversation`. Return `username` manually in `onSuccess()` to preserve the current JS success value. |
| `fetchChatRoomInfoFromServer` | Approved input difference: `asyncFetchChatRoomFromServer(roomId, EMValueCallBack<EMChatRoom>)` does not accept `fetchMembers`. | Ignore `fetchMembers`. Convert the returned `EMChatRoom` with `ExtSdkChatRoomHelper.toJson(value)` to preserve the current JS success value. |
| `addMembers` | Approved input difference: `asyncAddUsersToGroup(groupId, members, EMCallBack)` does not accept `welcome`. | Ignore `welcome`. Return `null` in `onSuccess()` to preserve the current JS success value. |
| `getGroupSpecificationFromServer` | Approved input difference: `asyncGetGroupFromServer(groupId, EMValueCallBack<EMGroup>)` does not accept `fetchMembers`. | Ignore `fetchMembers`. Convert the returned `EMGroup` with `ExtSdkGroupHelper.toJson(value)` to preserve the current JS success value. |
| `fetchConversationsFromServer` | The newest async API `asyncFetchConversationsFromServer(limit, cursor, callback)` returns `EMCursorResult<EMConversation>`, but the current wrapper returns a sorted `List<Conversation>` built from `Map<String, EMConversation>`. | Needs project-owner decision before implementation: either use a contract-compatible deprecated overload or choose a new JS return contract. |
| `fetchHistoryMessages` | The newest async API `asyncFetchHistoryMessages(..., EMFetchMessageOption, callback)` uses an options object, while the current wrapper uses `direction`. | Needs project-owner decision before implementation: either use the deprecated direction-based async overload or choose the newer option-based behavior. |
| `fetchChatRoomMuteList` | Native async returns `Map<String, Long>`, but the current wrapper returns only `map.keySet().toArray()`. | Use `asyncFetchChatRoomMuteList(...)`, but keep returning `map.keySet().toArray()` to preserve JS output. This converts the async result by dropping mute durations, matching the current wrapper behavior. |
| `EMCallBack` methods returning identifiers | SDK `EMCallBack.onSuccess()` has no value, while current wrappers often return `username` or `nickname`. | Return the original wrapper value manually in `onSuccess()`, not `null`, unless the old wrapper returned `null`. |

## No Matching Android Async API

These methods have no matching Android async API in the checked SDK source. They should stay unchanged for now per project-owner decision.

| Wrapper method | Reason |
|---|---|
| `updateGroupExt` | No async equivalent found in the checked Android SDK source. |
| `getPushConfigsFromServer` | No async equivalent found in the checked Android SDK source. |

## Implementation Notes

- Do not change TypeScript APIs or method constants for this task.
- Do not modify iOS wrappers for this task.
- Do not modify generated `lib/` output.
- Keep wrapper callback style consistent with existing methods such as `removeReaction` and `fetchReactionDetail`.
- Prefer using `ExtSdkWrapper.onSuccess(...)` and `ExtSdkWrapper.onError(...)` explicitly inside async callbacks, matching nearby code.
- After implementation, run at least `yarn typecheck` and a targeted Android compile check if available. Native wrapper behavior still needs manual example-app validation because these wrappers are not covered by unit tests.
