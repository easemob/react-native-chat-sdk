_English | [Chinese](./CHANGELOG.zh.md)_

# Update Log

## 1.11.1

- Fix the data conversion issue of session types on the ios platform.

## 1.11.0

- Dependent native SDKs are upgraded to versions (iOS 4.15.1 and Android 4.15.2).
- Updated message modification: `modifyMessageBody` is deprecated, and `modifyMsgBody` is added. For text and custom messages, both the message body and extension information can be modified. For file, video, audio, image, location, and merged forward messages, only extension information can be modified.
- Image messages now support GIF format. For details, see the `ChatImageMessageBody` type.
- Update on the group creation interface: The `createGroup` interface is deprecated, and a new `createGroupEx` interface is added as a replacement. The new interface supports custom group avatars.
- Attachment-type messages support authentication, which is disabled by default. If enabled, you need to call relevant download interfaces to download attachments. For details, see `_ChatFileMessageBody.secret`.
- Supports pulling only messages sent by specified group members when fetching roaming messages. For details, see the `ChatFetchMessageOptions` parameter of the `fetchHistoryMessagesByOptions` interface.
- Supports loading only messages sent by specified group members when loading local conversation messages. For details, see the `getMsgsWithMsgType` interface.
- Added a group interface, `fetchMemberInfoListFromServer`, which retrieves the group member list including member roles and join times.
- Added a group interface, `updateGroupAvatar`, to update the group avatar.
- Updated the login token expiration reminder mechanism, which is changed from reminding when 50% of the validity period has passed to 80%.
- Modified message revocation to allow group administrators, creators, and chat room creators to revoke messages sent by other users.
- Modified group member notification events, changing from notifying for each member's entry or exit to one-time notification. For details, see the `onMembersJoined` and `onMembersExited` methods in the `ChatGroupEventListener` type; the original `onMemberJoined` and `onMemberExited` are deprecated.
- Added a message search interface `getConvsMsgsWithKeyword` to search for message ID lists of specified conversation lists locally by keyword.
- Added a message search interface `getMessagesWithIds` to search for messages locally by message ID list.
- Updated the message search interface `getConvMsgsWithKeyword`, deprecating the `sender` parameter and adding the `senders` parameter.

## 1.8.2

- Fixed an issue where applications using React Native versions 0.77, 0.78, 0.79, 0.80 failed to compile when integrating the chat SDK.

## 1.8.1

- Use `fetchGroupInfoWithoutMembersFromServer` to replace `fetchGroupInfoFromServer`.

## 1.8.0

- Update `ChatOptions`, deprecate the constructor, and add static constructors `withAppId` and `withAppKey`.
- Added `ChatClient` api `changeAppId`.
- Added `changeAppId` interface to `ChatClient`.
- Updated ChatRoom object properties, added isInWhitelist, createTimestamp, muteExpireTimestamp.

## 1.7.0

- Upgraded the dependent native SDK to version (iOS 4.11.0 and Android 4.11.0).
- Updated the server connection status listener `ChatConnectEventListener`, added `onOfflineMessageSyncStart` and `onOfflineMessageSyncFinish`.
- Updated the chat room listener `ChatRoomEventListener`, deprecated `onMuteListAdded`, replaced with `onMuteListAddedV2`.
- Updated the message listener `ChatMessageEventListener`, removed the deprecated interface `onMessagesRecalled`.
- Added the message manager `ChatManager` interface `getMessageCount`.

## 1.6.2

- Fixed the issue of data conversion error in push notification type on the Android platform.

## 1.6.1

- Fixed the issue of compilation error on the Android platform where `CMakeLists.txt` could not be found.

## 1.6.0

- Upgraded the dependent native SDK to version (iOS 4.8.1 and Android 4.8.2).
- Added login with extended information, other devices being kicked out will receive this extended information. (See ChatOptions.loginExtraInfo, ChatConnectEventListener.onUserDidLoginFromOtherDeviceWithInfo)
- Added search message interface: supports searching multiple types of messages at once. (See ChatManager.searchMessages)
- Added interface to search messages in a specified conversation: supports searching multiple types of messages at once. (See ChatManager.searchMessagesInConversation)
- Added the ability to delete chat room messages only on the server side. (See ChatManager.removeMessagesWithTimestamp)
- Added interface to join chat rooms with extended information, can decide to exit all chat rooms. Users joining chat rooms with extended information will notify others. (See ChatRoomManager.joinChatRoomEx, ChatRoomEventListener.onMemberJoined)
- Added conversation interface: get the number of messages in a specified time period from the database. (See ChatManager.getMessageCountWithTimestamp)
- native: Added error code 407.
- native: Fixed the issue where the second request to get the friend list (including friend remarks) from the server would not get data if there was no change in the friend list.
- native: Fixed the issue where the message would still be sent successfully when the attachment failed to send under special circumstances.
- native: Fixed the issue of incorrect nextkey when pulling roaming messages.
- native: Optimized the success rate of server connection under weak network conditions.
- native: Fixed the issue where the cache was not updated in time when blacklisting contacts.
- native: Fixed the issue where push notifications might not work after logging out and logging back in.
- Updated `ChatConnectEventListener` interface: deprecated `onUserDidLoginFromOtherDevice`, replaced with `onUserDidLoginFromOtherDeviceWithInfo`.
- Deprecated `fetchHistoryMessages`, replaced with `fetchHistoryMessagesByOptions`.
- Deprecated `joinChatRoom`, replaced with `joinChatRoomEx`.

## 1.5.1

- Upgraded the dependent native SDK to version (iOS 4.7.0 and Android 4.7.0). Only resolved issues that occurred in the native SDK.

## 1.5.0

- Upgraded the dependent native SDK to version (iOS 4.6.1 and Android 4.6.1).
- Added new features and fixed issues provided by the native SDK.
- Updated the interface `recallMessage`, added extended parameters.
- Added message recall notification `onMessagesRecalledInfo`, deprecated the original notification `onMessagesRecalled`.
- native: Fixed the issue where the second request to get the friend list (including friend remarks) from the server would not get data if there was no change in the friend list.
- native: Fixed the issue where the message would still be sent successfully when the attachment failed to send under special circumstances.
- native: Fixed the issue of incorrect nextkey when pulling roaming messages.

## 1.4.0

- The dependent native SDKs are upgraded to versions (`iOS` 4.5.0 and `Android` 4.5.0). Adds new features and fixed issues provided by the native SDK.
- Added global configuration options
  - `enableTLS`: Whether to enable security policy. Off by default.
  - `messagesReceiveCallbackIncludeSend`: Whether the message listener receives callback notifications for sent messages. Off by default.
  - `regardImportMessagesAsRead`: Whether to set messages imported by the server as read.
  - `useReplacedMessageContents`: When the content of the sent text message is replaced by the text moderation (Moderation) service, whether it needs to be returned to the sender.
- Added message callback notification
  - `onMessagePinChanged`: Receive notification of pinned message.
- Added multi-device events
  - `CONVERSATION_UPDATE_MARK`: Multi-device session mark update notification.
- Added message manager related interfaces
  - `addRemoteAndLocalConversationsMark`: Add conversation mark.
  - `deleteRemoteAndLocalConversationsMark`: Delete the conversation mark.
  - `fetchConversationsByOptions`: Get the conversation list with specified conditions.
  - `deleteAllMessageAndConversation`: Delete all conversations and messages of the conversation.
  - `pinMessage`: pinned message.
  - `unpinMessage`: Unpin the message.
  - `fetchPinnedMessages`: Get the pinned messages of the specified session.
  - `getPinnedMessages`: Get the local pinned messages of the specified session.
  - `getMessagePinInfo`: Get the pinned message details.
- Added message attributes
  - `isContentReplaced`: Whether the message content has been modified. Main user server-side message auditing. Requires global configuration of `useReplacedMessageContents`.
  - `getPinInfo`: Get the pinned details of the message.
- Obsolete interface description
  - `getMessagesWithKeyword`: `getMsgsWithKeyword` replaces this interface.
  - `getMessages`: `getMsgs` replaces this interface.
  - `getMessageWithTimestamp`: `getMsgWithTimestamp` replaces this interface.
  - `getMessagesWithMsgType`: `getConvMsgsWithMsgType` replaces this interface.
  - `searchMsgFromDB`: `getMsgsWithMsgType` replaces this interface.

## 1.3.1

Issues fixed

- Program crash caused by receiving unsupported multi-device event notifications. Solution: Wrap the unsupported type into an except object and notify the caller through the listener. The modifications involve the Contact Manager, Group Manager, and Chat Room Manager. Related types `ChatMultiDeviceEvent`.
- Receiving an unsupported message body type causes the program to crash. Wrap unsupported types into except objects and notify the caller through the listener. Related types `ChatMessageType`.
- `getConversation、getLatestMessage、getLatestReceivedMessage、getConversationUnreadCount、getConversationMessageCount、markMessageAsRead、markAllMessagesAsRead、 updateConversationMessage、deleteMessage、deleteMessagesWithTimestamp、deleteConversationAllMessages、getMessagesWithMsgType、getMessages、getMessagesWithKeyword、 getMessageWithTimestamp, setConversationExtension, removeMessagesFromServerWithMsgIds, removeMessagesFromServerWithTimestamp, increment parameter ` isChatThread`defaults to`false`.
- The `createSendMessage` interface has changed from a private claim to a public one.
- `fetchMembersWithChatThreadFromServer` changes the return value type
- `ChatTextMessageBody` changed the property name from `targetLanguages` to `targetLanguageCodes`
- Add `downloadAttachmentInCombine` and `downloadThumbnailInCombine` api.
- Supports log output in multi-tag mode.

## 1.3.0

New Features

- The dependent native SDK has been upgraded to version (iOS 4.2.0 and Android 4.2.1). Added new features provided by the native SDK.
- Added friend remarks. See `ChatContact`
- Added global broadcast. See `ChatMessage.isBroadcast`
- Added the ability to get the number of joined groups. See `ChatGroupManager.fetchJoinedGroupCount`
- Updated the callback notification when a group application is declined. See `ChatGroupEventListener.onRequestToJoinDeclined`

## 1.2.2

Issues fixed

- An issue with the `permissionType` property during the construction of a `ChatGroup` object.
- Added the missing method of `getConversationMessageCount` API in `ChatManager`.

## 1.2.1

Issues fixed

- create send message: remove `secret` parameter. `secret` parameter is generated by server.

## 1.2.0

New features

- React-Native upgrade to 0.71.11 from 0.66.5

Improvements

- Dependent native SDK upgraded to version 4.1.1 (`iOS` and `Android`). Add new features provided by the native SDK.
- Optimize the disconnection notification, separate the notification of the server`s active disconnection, and the user can specifically deal with the reason for the server`s active disconnection.
- Optimize git commit specification with commitlint. Code cannot be submitted if it is not in accordance with the specification.
- Optimize git commit with lefthook. Add sensitive information check with gitleaks.
- Add merge type message body, create merge message method, and get merge message content method.
- Support for modifying the content of text messages and adding modification attributes.
- Added message modification callback notification.
- Added settings to customize the current device type and name.
- Added the use of tokens to kick specified devices and kick all devices.
- Added the use of token to get the list of online devices.
- Update multi-device notification events.
- Update connection status notification event.
- Update message notification event.
- Update chat room notification event.

Issues fixed

- Fix the problem that the application crashes due to the addition of emoticon responses under the android platform.

### Detail

Rename API

- `deleteAllMessages` is renamed `deleteConversationAllMessages`.
- `onRemoved` is renamed `onMemberRemoved` in `ChatRoomEventListener`.
- `onUserRemoved` is renamed `onMemberRemoved` in `ChatGroupEventListener`.
- `onChatRoomDestroyed` is renamed `onDestroyed` in `ChatRoomEventListener`.
- `onGroupDestroyed` is renamed `onDestroyed` in `ChatGroupEventListener`.

Updated API

- `getLoggedInDevicesFromServer`: add token support.
- `kickDevice`: add token support.
- `kickAllDevices`: add token support.

Added API

- `fetchConversationsFromServerWithCursor`: Get the list of conversations from the server with pagination.
- `fetchPinnedConversationsFromServerWithCursor`: Get the list of pinned conversations from the server with pagination.
- `pinConversation`: Sets whether to pin a conversation.
- `modifyMessageBody`: Modifies a local message or a message at the server side.
- `fetchCombineMessageDetail`: Get information about combine type messages.
- `selectPushTemplate`: Select the push template with template name for offline push.
- `fetchSelectedPushTemplate`: Get selected push template for offline push.

Deprecated API

- fetchAllConversations: please use `fetchConversationsFromServerWithCursor` instead.

Update Data Object

- `ChatConversation`: add `isPinned` and `pinnedTime` properties.
- `ChatMessageType`: add `COMBINE` type message body.
- `ChatMessage`: add `receiverList` property.
- create send message: add `secret` parameter.
- `ChatMessageBody`: add `lastModifyOperatorId`, `lastModifyTime` and `modifyCount` properties.
- `ChatOptions`: add `enableEmptyConversation`, `customDeviceName` and `customOSType` properties.
- `ChatMultiDeviceEvent`：添加 `CONVERSATION_PINNED`、`CONVERSATION_UNPINNED` 和 `CONVERSATION_DELETED`。

Add Data Object

- `ChatCombineMessageBody`: add combine message body object.

Update Listener

- `ChatConnectEventListener.onUserDidLoginFromOtherDevice`: add `deviceName` parameter.
- `ChatConnectEventListener`: add `onUserDidRemoveFromServer`, `onUserDidForbidByServer`, `onUserDidChangePassword`, `onUserDidLoginTooManyDevice`, `onUserKickedByOtherDevice`, `onUserAuthenticationFailed` event notifications.
- `ChatConnectEventListener.onDisconnected`: remove code parameter.
- `ChatMultiDeviceEventListener`: add `onMessageRemoved` event notification.
- `ChatMultiDeviceEventListener`: add `onConversationEvent` event notification.
- `ChatMessageEventListener`: add `onMessageContentChanged` event notification.
- `ChatRoomEventListener.onRemoved`: add `reason` parameter.

## 1.1.2

New features

- Dependent native SDK upgraded to version 4.0.2 (`iOS` and `Android`).
- Added the api to get the current SDK version.
- Adds the `setMemberAttribute` group manager api.
- Adds the `fetchMemberAttributes` group manager api.
- Adds the `fetchMembersAttributes` group manager api.
- Adds the `fetchHistoryMessagesByOptions` chat manager api.
- Adds the `deleteMessagesWithTimestamp` chat manager api.

Improvements

- Remove sensitive information.
- Improve log.
- Adds `ChatGroupEventListener.onMemberAttributesChanged` notification.
- Updates the `fetchHistoryMessages` chat manager api.
- Adds `ChatConnectEventListener.onAppActiveNumberReachLimit` notification.
- Optimized file types messages for iOS.

Issues fixed

- `renewAgoraToken`: Repair update token interface.
- Fixed failure to send video messages on android.

## 1.1.1

Issues fixed

- `fetchJoinedGroupsFromServer` fixed the issue that the extended attribute of fetching joined public groups was empty.

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

What`s new

- Dependent native SDK upgraded to version 3.9.9 (`iOS` and `Android`).

Issues fixed

- Fixed SDK crash in extreme cases.
- Other fixes, see versions 3.9.8 and 3.9.9 (`iOS` and `Android`).

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
