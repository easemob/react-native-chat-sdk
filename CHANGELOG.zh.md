_Chinese | [English](./CHANGELOG.md)_

# Update Log

---

## 1.0.9

主要变更：

- 依赖的原生 SDK 升级为 3.9.7.1 版本 (仅升级 `iOS` 版本)。

修复内容：

- 修复聊天室属性相关问题。
- 更新群组监听器。

更新内容：

- `ChatGroupEventListener` add `onDetailChanged` notification.
- `ChatGroupEventListener` add `onStateChanged` notification.

---

## 1.0.8

主要变更:

- 依赖的原生 SDK 升级为 3.9.7 版本。
- 新增聊天室自定义属性功能。
- 新增限制连接边缘节点的范围。
- 群组属性添加禁用状态，需要开发者在服务端设置。

修复内容:

- 修复极少数场景下，从服务器获取较大数量的消息时失败的问题。
- 修复数据统计不正确的问题。
- 修复极少数场景下打印日志导致的崩溃。

增加内容:

- `updatePushNickname`: 更新推送显示标题。
- `updatePushDisplayStyle`: 更新推送显示的样式。
- `fetchPushOptionFromServer`: 获取推送样式配置信息。
- `fetchChatRoomAttributes`: 获取聊天室自定义属性。
- `addAttributes`: 添加聊天室自定义属性。
- `removeAttributes`: 删除聊天室自定义属性。
- `ChatPushDisplayStyle`: 推送显示样式类型。
- `ChatPushOption`: 推送选项类型。
- `ChatAreaCode`: 区域代码类型。

重命名内容:

- `ChatGroupPermissionType` 是 `ChatGroupType` 的新名字。

更新内容:

- `ChatGroupOptions` 增加 `isDisabled` 属性。
- `ChatRoomEventListener` 增加 `onSpecificationChanged`, `onAttributesUpdated`, `onAttributesRemoved` 通知。

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
