_Chinese | [English](./CHANGELOG.md)_

# Update Log

## 1.1.0

新增特性：

- 依赖的原生 SDK 升级为 4.0.0 版本 (`iOS` 和 `Android`)。
- 新增实现聊天室属性自定义功能。
- 新增 `fetchConversationsFromServerWithPage` 实现从服务器分页获取会话列表。
- 新增 `ChatMessage#messagePriority` 实现聊天室消息优先级功能。
- 新增 `removeMessagesFromServerWithTimestamp` 和 `removeMessagesFromServerWithMsgIds` 实现单向删除服务端历史消息。

优化：

- 去除测试数据的敏感信息。

修复：

- 原生部分修复不安全代码。
- 获取会话可能失败的问题。
- 解决回调方法可能多次进入主线程导致死锁的问题。该问题只可能发生在 iOS 平台。

---

## 1.0.11

更新内容：

- 依赖的原生 SDK 升级为 3.9.9 版本 (`iOS` 和 `Android`)。

修复内容：

- 修复极端情况下 SDK 崩溃的问题。
- 其它修复内容，详见 3.9.8 和 3.9.9 版本(`iOS` 和 `Android`)。

---

## 1.0.10

修复内容：

- android 平台进行 json 转换可能出现超限问题，返回结果的数据元素超过 50 个会抛出异常。涉及返回数组的接口。

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
