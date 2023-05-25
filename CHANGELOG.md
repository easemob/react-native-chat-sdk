_English | [Chinese](./CHANGELOG.zh.md)_

# Update Log

## 1.1.2

New features

- Dependent native SDK upgraded to version 4.0.2 ('iOS' and 'Android').
- Added the api to get the current SDK version.
- Adds the `setMemberAttribute` group manager api.
- Adds the `fetchMemberAttributes` group manager api.
- Adds the `fetchMembersAttributes` group manager api.
- Adds the `fetchHistoryMessagesByOptions` chat manager api.
- Adds the `deleteMessagesWithTimestamp` chat manager api.

Improvements

- Remove sensitive information.
- Improve log.
- Add `ChatGroupEventListener.onMemberAttributesChanged` notification.
- Adds the `fetchHistoryMessages` chat manager api.

Issues fixed

- `renewAgoraToken`: Repair update token interface.
- Fixed failure to send video messages on android.

## 1.1.1

Issues fixed

- 'fetchJoinedGroupsFromServer' fixed the issue that the extended attribute of fetching joined public groups was empty.

---

## 1.1.0

New features

- Upgrades the native platforms `iOS` and `Android` to 1.1.0.
- Adds the function of managing custom chat room attributes.
- Adds the `fetchConversationsFromServerWithPage` method to allow users to get the conversation list from the server with pagination.
- Adds the `ChatMessage#messagePriority` method to implement the chat room message priority.
- Adds the `removeMessagesFromServerWithTimestamp` and `removeMessagesFromServerWithMsgIds` methods to allow users to delete messages on the server in a unidirectional way.

Improvements

- Removed the sensitive information from the test data.
- Changed the `inviterUser` method in the `ChatGroupManager` class to `inviteUser`.
- Changed `GROUP_ADD_USER_WHITE_LIST` in the enumeration type `ChatMultiDeviceEvent` to `GROUP_ADD_USER_ALLOW_LIST`.
- Changed `GROUP_REMOVE_USER_WHITE_LIST` in the enumeration type `ChatMultiDeviceEvent` to `GROUP_REMOVE_USER_ALLOW_LIST`.

Issues fixed

- Some insecure code of native platforms was fixed.
- An issue where getting a session might fail.
- The potential deadlock issue caused by a callback method that repeatedly enters the main thread for execution. This issue occurs only on the iOS platform.

---

## 1.0.11

What's new

- Dependent native SDK upgraded to version 3.9.9 ('iOS' and 'Android').

Issues fixed

- Fixed SDK crash in extreme cases.
- Other fixes, see versions 3.9.8 and 3.9.9 ('iOS' and 'Android').

---

## 1.0.10

Issues fixed

- json conversion on the android platform may have an overlimit problem. If more than 50 data elements are returned, an exception will be thrown. An interface that involves returning arrays.

---

## 1.0.9

Improvements

- The dependent native SDK iOS is upgraded to V3.9.7.1.

Issues fixed

- Fixed the chat room attribute bug.
- Updated the group listener.

The following Object are updated:

- `ChatGroupEventListener` add `onDetailChanged` notification.
- `ChatGroupEventListener` add `onStateChanged` notification.

---

## 1.0.8

Improvements

- The dependent native SDK (iOS and Android) is upgraded to V3.9.7.
- Added chat room custom attribute function.
- Added group disabled status in group details: isDisabled property, which needs to be set by the developer on the server side.
- Optimized the performance of getting roaming messages.
- Added area code for server.

Issues fixed

- Fixed the problem that in a few scenarios, when the message volume is large when synchronizing or pulling messages, the collection fails.
- Fixed incorrect data statistics.
- Fixed a crash caused by printing logs on rare occasions.

The following APIs are added:

- `updatePushNickname`: update push display name.
- `updatePushDisplayStyle`: update push display style.
- `fetchPushOptionFromServer`: get push option from server.
- `fetchChatRoomAttributes`: get chat room custom attributes.
- `addAttributes`: add chat room custom attributes.
- `removeAttributes`: remove chat rom custom attributes.
- `ChatPushDisplayStyle`: the push display style.
- `ChatPushOption`: the push display option.
- `ChatAreaCode`: the area code.

The following APIs are renamed:

- `ChatGroupPermissionType` is renamed `ChatGroupType`.

The following Object are updated:

- `ChatGroupOptions` add `isDisabled` attribute.
- `ChatRoomEventListener` add `onSpecificationChanged`, `onAttributesUpdated`, `onAttributesRemoved` attribute.

---

## 1.0.7

Improvements

- The dependent native SDK (iOS and Android) is upgraded to V3.9.5.
- Support push notification settings operation. see {@link ChatPushManager}
- Support push config setting for FCM. see {@link ChatPushConfig}
- Support push initialization Settings. see {@link ChatOptions#pushConfig}
- Support push config setting update. see {@link ChatClient#updatePushConfig}
- The listener method has been made optional.
- Update the release script.
- sync update demonstration app.

Issues fixed

- Fix bug: Json parse error for type field.

The following APIs are added:

- `setConversationExtension`: set conversation extension.
- `insertMessage`: insert a message.
- `deleteMessagesBeforeTimestamp`: Deletes messages before the specified timestamp.
- `getThreadConversation`: Gets or creates a conversation for thread.

The following APIs are renamed:

- `unSubscribe` is renamed `unsubscribe`.

The following Object are updated:

- `ChatConversation` add `isChatThread` attribute.

---

## 1.0.6

New features

- Add a field {@link ChatMessage#isOnline} in chat messages.

Improvements

- The API reference example is updated.
- The dependent native SDK (iOS and Android) is upgraded to V3.9.4.
- React-Native upgrade to 0.66.4 LTS version.
- The android platform no longer needs to perform additional operations.
- agora-react-native-chat was changed to react-native-agora-chat.

The following APIs are renamed:

- `deleteRemoteConversation` is renamed `removeConversationFromServer`.
- `loadAllConversations` is renamed `getAllConversations`.
- `getConversationsFromServer` is renamed `fetchAllConversations`.
- `getUnreadMessageCount` is renamed `getUnreadCount`.
- `fetchLatestMessage` is renamed `getLatestMessage`.
- `fetchLastReceivedMessage` is renamed `getLatestReceivedMessage`.
- `unreadCount` is renamed `getConversationUnreadCount`.
- `getMessagesFromTime` is renamed `getMessageWithTimestamp`.
- `WhiteList` is renamed `AllowList`.
- `BlackList` is renamed `BlockList`.

The following API are deprecated and removed:

- `getMessageById`
- `insertMessage`
- `appendMessage`

Issues fixed

- Fix bug: Type declaration entry point is incorrect
- Optimize: The android platform no longer needs to perform additional operations.

---

## 1.0.5

- Implement IM foundation functions.
- Implement base message send and receive functions.
- Implement group functions.
- Implement chat room functions.
- Implement contact functions.
- Implement user functions.
- Implement user presence functions.
- Implement message moderation functions.
- Implement message translation functions.
- Implement message reaction functions.
- Implement message thread functions.
- The dependent native SDK (ios and android) was upgraded to version 3.9.3.
