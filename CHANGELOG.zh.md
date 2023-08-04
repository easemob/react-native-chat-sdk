_Chinese | [English](./CHANGELOG.md)_

# Update Log

## 1.2.0

新功能

- React-Native 从 0.66.5 升级到 0.71.11

改进

- 依赖的原生 SDK 升级到版本 4.1.1（“iOS”和“Android”）。 添加原生 SDK 提供的新功能。
- 优化断线通知，分离出服务器主动断线的通知，用户可以具体处理服务器主动断线的原因。
- 使用 commitlint 优化 git 提交规范。 不符合规范的代码不能提交。
- 使用 lefthook 优化 git commit。 添加使用 gitleaks 检查敏感信息。
- 新增合并类型消息体，创建合并消息方法，以及获取合并消息内容方法。
- 支持修改文本消息内容，新增修改属性。
- 新增消息修改回调通知。
- 新增设置自定义当前设备类型和名称。
- 新增使用 token 踢指定设备和踢所有设备。
- 新增使用 token 获取在线设备列表。
- 更新多设备通知事件。
- 更新连接状态通知事件。
- 更新消息通知事件。
- 更新聊天室通知事件。

问题已修复

- 修复 android 平台下由于添加表情响应导致应用程序崩溃的问题。

### 细节

重命名 API

- `deleteConversationAllMessages` 更名为 `deleteAllMessages`。

更新的 API

- `getLoggedInDevicesFromServer`：添加令牌支持。
- `kickDevice`：添加令牌支持。
- `kickAllDevices`：添加令牌支持。

添加了 API

- `fetchConversationsFromServerWithCursor`：从服务器获取带分页的对话列表。
- `fetchPinnedConversationsFromServerWithCursor`：通过分页从服务器获取固定对话列表。
- `pinConversation`：设置是否固定对话。
- `modifyMessageBody`：修改本地消息或服务器端消息。
- `fetchCombineMessageDetail`：获取有关组合类型消息的信息。
- `selectPushTemplate`：选择带有模板名称的推送模板进行离线推送。
- `fetchSelectedPushTemplate`：获取选定的推送模板以进行离线推送。

已弃用的 API

- fetchAllConversations：请改用“fetchConversationsFromServerWithCursor”。

更新数据对象

- `ChatConversation`：添加 `isPinned` 和 `pinnedTime` 属性。
- `ChatMessageType`：添加`COMBINE`类型消息正文。
- `ChatMessage`：添加`receiverList`属性。
- 创建发送消息：添加“secret”参数。
- `ChatMessageBody`：添加 `lastModifyOperatorId`、`lastModifyTime` 和 `modifyCount` 属性。
- `ChatOptions`：添加 `enableEmptyConversation`、`customDeviceName` 和 `customOSType` 属性。
- `ChatMultiDeviceEvent`：添加 `CONVERSATION_PINNED`、`CONVERSATION_UNPINNED` 和 `CONVERSATION_DELETED`。

添加数据对象

- `ChatCombineMessageBody`：添加组合消息正文对象。

更新监听器

- `ChatConnectEventListener.onUserDidLoginFromOtherDevice`：添加`deviceName`参数。
- `ChatConnectEventListener`：添加 `onUserDidRemoveFromServer`、`onUserDidForbidByServer`、`onUserDidChangePassword`、`onUserDidLoginTooManyDevice`、`onUserKickedByOtherDevice`、`onUserAuthenticationFailed` 事件通知。
- `ChatConnectEventListener.onDisconnected`：删除代码参数。
- `ChatMultiDeviceEventListener`：添加`onMessageRemoved`事件通知。
- `ChatMultiDeviceEventListener`：添加`onConversationEvent`事件通知。
- `ChatMessageEventListener`：添加`onMessageContentChanged`事件通知。
- `ChatRoomEventListener.onRemoved`：添加`reason`参数。

## 1.1.2

新功能

- 原生 SDK 升级到版本 4.0.2（“iOS”和“Android”）。
- 添加获取当前 SDK 版本的 api。
- 添加 `setMemberAttribute` 组管理器 api。
- 添加 `fetchMemberAttributes` 组管理器 api。
- 添加 `fetchMembersAttributes` 组管理器 api。
- 添加 `fetchHistoryMessagesByOptions` 聊天管理器 api。
- 添加 `deleteMessagesWithTimestamp` 聊天管理器 api。

改进

- 删除敏感信息。
- 改进日志。
- 添加 `ChatGroupEventListener.onMemberAttributesChanged` 通知。
- 更新 `fetchHistoryMessages` 聊天管理器 api。
- 添加 `ChatConnectEventListener.onAppActiveNumberReachLimit` 通知。
- 优化 iOS 文件类型的消息。

问题修复

- `renewAgoraToken`: 修复更新 token 接口。
- 安卓平台：修复发送视频消息失败的问题。

## 1.1.1

修复：

- `fetchJoinedGroupsFromServer` 修复获取加入的公开群的扩展属性为空的问题。

---

## 1.1.0

新增特性：

- 依赖的原生 SDK 升级为 4.0.0 版本 (`iOS` 和 `Android`)。
- 新增实现聊天室属性自定义功能。
- 新增 `fetchConversationsFromServerWithPage` 实现从服务器分页获取会话列表。
- 新增 `ChatMessage#messagePriority` 实现聊天室消息优先级功能。
- 新增 `removeMessagesFromServerWithTimestamp` 和 `removeMessagesFromServerWithMsgIds` 实现单向删除服务端历史消息。

优化：

- 去除测试数据的敏感信息。
- ChatGroupManager 类方法 `inviterUser` 更名为 `inviteUser`
- ChatMultiDeviceEvent 枚举类型 `GROUP_ADD_USER_WHITE_LIST` 更名为 `GROUP_ADD_USER_ALLOW_LIST`
- ChatMultiDeviceEvent 枚举类型 `GROUP_REMOVE_USER_WHITE_LIST` 更名为 `GROUP_REMOVE_USER_ALLOW_LIST`

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
