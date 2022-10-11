_English | [Chinese](./CHANGELOG.zh.md)_

# Update Log

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
