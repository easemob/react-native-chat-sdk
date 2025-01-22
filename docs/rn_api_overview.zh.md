ChatSDK 是一个高度可靠的全球交流平台，您的用户可以在其中进行一对一、群组或聊天室聊天。用户通过短信进行交流，共享图像、音频、视频、文件、表情符号和位置。 ChatSDK 提供开箱即用的打字指示器。

- ChatClient类是聊天SDK的入口。它提供了允许您登录和注销聊天应用程序以及管理 SDK 和聊天服务器之间的连接的方法。
- ChatManager 类提供允许您发送和接收消息、管理对话和下载附件的方法。
- ChatMessage 类定义消息属性。
- ChatConversation 类提供对话管理方法。
- ChatContactManager 类提供聊天联系人管理方法，例如添加、检索、修改和删除联系人。
- ChatGroupManager 类提供群组管理方法，如群组创建和销毁以及成员管理。
- ChatRoomManager 类提供聊天室管理方法，如加入和离开聊天室和检索聊天室列表，并管理成员权限。
- ChatPresenceManager 类提供了设置消息推送配置选项的方法。
- ChatPushManager 类提供了允许您管理离线推送服务的方法。
- ChatUserInfoManager 类提供了用户属性管理方法，包括获取和更新用户属性。

## ChatClient
| Method | Description |
| :----- | :---------- |
| {@link ChatClient.getInstance getInstance} | Chat 客户端类。该类是 Chat SDK 的入口，负责登录、登出及管理 SDK 与 chat 服务器之间的连接。 |
| {@link ChatClient.getEventEmitter getEventEmitter} | Chat 客户端类。该类是 Chat SDK 的入口，负责登录、登出及管理 SDK 与 chat 服务器之间的连接。 |
| {@link ChatClient.setNativeListener setNativeListener} | Chat 客户端类。该类是 Chat SDK 的入口，负责登录、登出及管理 SDK 与 chat 服务器之间的连接。 |
| {@link ChatClient.version version} | Chat 客户端类。该类是 Chat SDK 的入口，负责登录、登出及管理 SDK 与 chat 服务器之间的连接。 |
| {@link ChatClient.options options} | 获取 SDK 配置项。 |
| {@link ChatClient.currentUserName currentUserName} | 获取当前登录用户的用户 ID。 |
| {@link ChatClient.init init} | 初始化 SDK。 |
| {@link ChatClient.isConnected isConnected} | 检查 SDK 是否连接到 Chat 服务器。 |
| {@link ChatClient.getCurrentUsername getCurrentUsername} | 从服务器获取当前登录用户的用户 ID。 |
| {@link ChatClient.isLoginBefore isLoginBefore} | 检查当前用户是否登录。 |
| {@link ChatClient.getAccessToken getAccessToken} | 获取登录 token。 |
| {@link ChatClient.createAccount createAccount} | 注册新用户（开放注册）。 |
| {@link ChatClient.login login} | 通过密码或环信 token 登录 Chat 服务器。 |
| {@link ChatClient.loginWithToken loginWithToken} | 通过用户ID和token登录。 |
| {@link ChatClient.loginWithAgoraToken loginWithAgoraToken} | 通过用户ID和token登录。 |
| {@link ChatClient.renewAgoraToken renewAgoraToken} | 更新声网 token。 |
| {@link ChatClient.logout logout} | 退出登录。 |
| {@link ChatClient.changeAppKey changeAppKey} | 修改 App Key。 |
| {@link ChatClient.changeAppId changeAppId} | 更新 app iD。 |
| {@link ChatClient.compressLogs compressLogs} | 压缩日志文件。 |
| {@link ChatClient.getLoggedInDevicesFromServer getLoggedInDevicesFromServer} | 获取指定账号下登录的在线设备列表。 |
| {@link ChatClient.kickDevice kickDevice} | 将特定账号登录的指定设备下线。 |
| {@link ChatClient.kickAllDevices kickAllDevices} | 将指定账号登录的所有设备都踢下线。 |
| {@link ChatClient.updatePushConfig updatePushConfig} | 更新推送设置。 |
| {@link ChatClient.addConnectionListener addConnectionListener} | 设置连接状态监听器。 |
| {@link ChatClient.removeConnectionListener removeConnectionListener} | 移除连接状态监听器。 |
| {@link ChatClient.removeAllConnectionListener removeAllConnectionListener} | 移除所有连接状态监听器。 |
| {@link ChatClient.addMultiDeviceListener addMultiDeviceListener} | 添加多设备监听器。 |
| {@link ChatClient.removeMultiDeviceListener removeMultiDeviceListener} | 移除指定多设备监听器。 |
| {@link ChatClient.removeAllMultiDeviceListener removeAllMultiDeviceListener} | 移除所有多设备监听器。 |
| {@link ChatClient.addCustomListener addCustomListener} | 添加自定义监听器，接收 Android 或者 iOS 设备发到 React Native 层的数据。 |
| {@link ChatClient.removeCustomListener removeCustomListener} | 移除自定义监听，不再接收 Android 或者 iOS 设备发到 React Native 层的数据。 |
| {@link ChatClient.removeAllCustomListener removeAllCustomListener} | 移除所有自定义监听器。 |
| {@link ChatClient.addExceptListener addExceptListener} | 增加错误监听器。 |
| {@link ChatClient.removeExceptListener removeExceptListener} | 移除错误监听器。 |
| {@link ChatClient.removeAllExceptListener removeAllExceptListener} | 移除所有错误监听器。 |
| {@link ChatClient.chatManager chatManager} | 获取聊天管理器对象 |
| {@link ChatClient.groupManager groupManager} | 获取群组管理器类。 |
| {@link ChatClient.contactManager contactManager} | 获取联系人管理器类。 |
| {@link ChatClient.pushManager pushManager} | 获取推送管理器类。 |
| {@link ChatClient.userManager userManager} | 获取用户信息管理器类。 |
| {@link ChatClient.roomManager roomManager} | 获取聊天室管理器类。 |
| {@link ChatClient.presenceManager presenceManager} | 获取在线状态管理器类。 |

| Event | Description |
| :----- | :---------- |
| {@link ChatConnectEventListener.onConnected onConnected} | 成功连接到 chat 服务器时触发的回调。 |
| {@link ChatConnectEventListener.onDisconnected onDisconnected} | 和 chat 服务器断开连接时触发的回调。 |
| {@link ChatConnectEventListener.onTokenWillExpire onTokenWillExpire} | Agora token 即将过期时触发。 |
| {@link ChatConnectEventListener.onTokenDidExpire onTokenDidExpire} | Agora token 已过期时触发。 |
| {@link ChatConnectEventListener.onAppActiveNumberReachLimit onAppActiveNumberReachLimit} | 应用程序的日活跃用户数量（DAU）或月活跃用户数量（MAU）达到上限时回调。 |
| {@link ChatConnectEventListener.onOfflineMessageSyncStart onOfflineMessageSyncStart} | 开始接收离线消息的时候触发。 |
| {@link ChatConnectEventListener.onOfflineMessageSyncFinish onOfflineMessageSyncFinish} | 结束接收离线消息的时候触发。 |
| {@link ChatConnectEventListener.onUserDidLoginFromOtherDevice onUserDidLoginFromOtherDevice} | 其他设备登录通知。 |
| {@link ChatConnectEventListener.onUserDidLoginFromOtherDeviceWithInfo onUserDidLoginFromOtherDeviceWithInfo} | 用户在其它设备登录。 |
| {@link ChatConnectEventListener.onUserDidRemoveFromServer onUserDidRemoveFromServer} | 用户被移除通知。 |
| {@link ChatConnectEventListener.onUserDidForbidByServer onUserDidForbidByServer} | 被服务器禁止连接通知。 |
| {@link ChatConnectEventListener.onUserDidChangePassword onUserDidChangePassword} | 用户密码变更通知。 |
| {@link ChatConnectEventListener.onUserDidLoginTooManyDevice onUserDidLoginTooManyDevice} | 登录设备数量超限通知。 |
| {@link ChatConnectEventListener.onUserKickedByOtherDevice onUserKickedByOtherDevice} | 被其他设备踢掉通知。 |
| {@link ChatConnectEventListener.onUserAuthenticationFailed onUserAuthenticationFailed} | 鉴权失败通知。 典型触发通知场景：token 过期、token 验证失败。 |

| Event | Description |
| :----- | :---------- |
| {@link ChatMultiDeviceEventListener.onContactEvent onContactEvent} | 联系人事件监听回调。 |
| {@link ChatMultiDeviceEventListener.onGroupEvent onGroupEvent} | 群组事件监听回调。 |
| {@link ChatMultiDeviceEventListener.onThreadEvent onThreadEvent} | 子区事件监听回调。 |
| {@link ChatMultiDeviceEventListener.onMessageRemoved onMessageRemoved} | 会话删除漫游消息后，其他设备收到该通知。 |
| {@link ChatMultiDeviceEventListener.onConversationEvent onConversationEvent} | 会话操作发生后，其他设备收到该通知。 |

| Event | Description |
| :----- | :---------- |
| {@link ChatCustomEventListener.onDataReceived onDataReceived} | 自定义事件监听器。 |
## ChatManager
| Method | Description |
| :----- | :---------- |
| {@link ChatManager.setNativeListener setNativeListener} | 聊天管理类，该类负责收发消息、管理会话（加载，删除等）、下载消息附件等。 |
| {@link ChatManager.addMessageListener addMessageListener} | 添加消息监听器。 |
| {@link ChatManager.removeMessageListener removeMessageListener} | 移除消息监听器。 |
| {@link ChatManager.removeAllMessageListener removeAllMessageListener} | 移除所有消息监听器。 |
| {@link ChatManager.sendMessage sendMessage} | 发送一条消息。 |
| {@link ChatManager.resendMessage resendMessage} | 重发消息。 |
| {@link ChatManager.sendMessageReadAck sendMessageReadAck} | 发送消息的已读回执。 |
| {@link ChatManager.sendGroupMessageReadAck sendGroupMessageReadAck} | 发送群消息已读回执。 |
| {@link ChatManager.sendConversationReadAck sendConversationReadAck} | 发送会话的已读回执。 |
| {@link ChatManager.recallMessage recallMessage} | 撤回发送成功的消息。 |
| {@link ChatManager.getMessage getMessage} | 从本地数据库获取指定 ID 的消息对象。 |
| {@link ChatManager.markAllConversationsAsRead markAllConversationsAsRead} | 将所有的会话都设成已读。 |
| {@link ChatManager.getUnreadCount getUnreadCount} | 获取未读消息数。 |
| {@link ChatManager.insertMessage insertMessage} | 在本地会话中插入一条消息。 |
| {@link ChatManager.updateMessage updateMessage} | 更新本地消息。 |
| {@link ChatManager.importMessages importMessages} | 将消息导入本地数据库。 |
| {@link ChatManager.downloadAttachmentInCombine downloadAttachmentInCombine} | 下载消息附件。 |
| {@link ChatManager.downloadThumbnailInCombine downloadThumbnailInCombine} | 下载消息缩略图。 |
| {@link ChatManager.downloadAttachment downloadAttachment} | 下载消息附件。 |
| {@link ChatManager.downloadThumbnail downloadThumbnail} | 下载消息的缩略图。 |
| {@link ChatManager.fetchHistoryMessages fetchHistoryMessages} | 分页获取指定会话的历史消息。 |
| {@link ChatManager.fetchHistoryMessagesByOptions fetchHistoryMessagesByOptions} | 根据消息拉取参数配置从服务器分页获取指定会话的历史消息。 |
| {@link ChatManager.searchMsgFromDB searchMsgFromDB} | 从本地数据库获取指定会话中包含特定关键字的消息。 |
| {@link ChatManager.getMsgsWithKeyword getMsgsWithKeyword} | 获取所有会话在一定时间内的会话中发送的消息。 |
| {@link ChatManager.fetchGroupAcks fetchGroupAcks} | Uses the pagination to get read receipts for group messages from the server. |
| {@link ChatManager.removeConversationFromServer removeConversationFromServer} | 删除服务端的指定会话及其历史消息。 |
| {@link ChatManager.getConversation getConversation} | 根据会话ID和会话类型获取会话。 |
| {@link ChatManager.getAllConversations getAllConversations} | 获取本地数据库中所有会话。 |
| {@link ChatManager.fetchAllConversations fetchAllConversations} | 从服务器获取会话列表。 |
| {@link ChatManager.deleteConversation deleteConversation} | 删除指定会话及其本地历史消息。 |
| {@link ChatManager.getLatestMessage getLatestMessage} | 从会话中获取最新消息。 |
| {@link ChatManager.getLatestReceivedMessage getLatestReceivedMessage} | 获取最新收到的会话消息。 |
| {@link ChatManager.getConversationUnreadCount getConversationUnreadCount} | 获取会话未读消息数。 |
| {@link ChatManager.getConversationMessageCount getConversationMessageCount} | 获取会话的消息数。 |
| {@link ChatManager.markMessageAsRead markMessageAsRead} | 将消息标记为已读。 |
| {@link ChatManager.markAllMessagesAsRead markAllMessagesAsRead} | 将所有消息标记为已读。 |
| {@link ChatManager.updateConversationMessage updateConversationMessage} | 更新本地数据库中的消息。 |
| {@link ChatManager.deleteMessage deleteMessage} | 从本地数据库中删除一条消息。 |
| {@link ChatManager.deleteMessagesWithTimestamp deleteMessagesWithTimestamp} | 从本地数据库中删除一段时间内发送或接收的消息。 |
| {@link ChatManager.deleteConversationAllMessages deleteConversationAllMessages} | 从内存和本地数据库中删除会话中的所有消息。 |
| {@link ChatManager.deleteMessagesBeforeTimestamp deleteMessagesBeforeTimestamp} | 删除指定时间戳之前的所有本地消息。 |
| {@link ChatManager.getMessagesWithMsgType getMessagesWithMsgType} | 从本地数据库中检索会话中某种类型的消息。 |
| {@link ChatManager.getMsgsWithMsgType getMsgsWithMsgType} | 从本地数据库中检索会话中某种类型的消息。 |
| {@link ChatManager.getMessages getMessages} | 从本地数据库中检索会话中指定数量的消息。 |
| {@link ChatManager.getMsgs getMsgs} | 从本地数据库中检索会话中指定数量的消息。 |
| {@link ChatManager.getMessagesWithKeyword getMessagesWithKeyword} | 获取指定用户在一定时间内的会话中发送的消息。 |
| {@link ChatManager.getConvMsgsWithKeyword getConvMsgsWithKeyword} | 获取指定用户在一定时间内的会话中发送的消息。 |
| {@link ChatManager.getMessageWithTimestamp getMessageWithTimestamp} | 检索本地数据库中某个会话在一定时间内发送和接收的消息。 |
| {@link ChatManager.getMsgWithTimestamp getMsgWithTimestamp} | 检索本地数据库中某个会话在一定时间内发送和接收的消息。 |
| {@link ChatManager.translateMessage translateMessage} | 翻译消息。 |
| {@link ChatManager.fetchSupportedLanguages fetchSupportedLanguages} | 查询翻译服务支持的语言。 |
| {@link ChatManager.setConversationExtension setConversationExtension} | 设置会话的扩展信息。 |
| {@link ChatManager.addReaction addReaction} | 添加 Reaction。 |
| {@link ChatManager.removeReaction removeReaction} | 删除 Reaction。 |
| {@link ChatManager.fetchReactionList fetchReactionList} | 获取 Reaction 列表。 |
| {@link ChatManager.fetchReactionDetail fetchReactionDetail} | 获取 Reaction 详情。 |
| {@link ChatManager.reportMessage reportMessage} | 举报消息。 |
| {@link ChatManager.getReactionList getReactionList} | 获取指定消息的 Reaction 列表。 |
| {@link ChatManager.groupAckCount groupAckCount} | 获取群组消息的已读人数。 |
| {@link ChatManager.createChatThread createChatThread} | 创建子区。 |
| {@link ChatManager.joinChatThread joinChatThread} | 加入子区。 |
| {@link ChatManager.leaveChatThread leaveChatThread} | 退出子区。 |
| {@link ChatManager.destroyChatThread destroyChatThread} | 解散子区。 |
| {@link ChatManager.updateChatThreadName updateChatThreadName} | 修改子区名称。 |
| {@link ChatManager.removeMemberWithChatThread removeMemberWithChatThread} | 移除子区成员。 |
| {@link ChatManager.fetchMembersWithChatThreadFromServer fetchMembersWithChatThreadFromServer} | 分页获取子区成员。 |
| {@link ChatManager.fetchJoinedChatThreadFromServer fetchJoinedChatThreadFromServer} | 分页从服务器获取当前用户加入的子区列表。 |
| {@link ChatManager.fetchJoinedChatThreadWithParentFromServer fetchJoinedChatThreadWithParentFromServer} | 分页从服务器获取当前用户加入指定群组的子区列表。 |
| {@link ChatManager.fetchChatThreadWithParentFromServer fetchChatThreadWithParentFromServer} | 分页从服务器端获取指定群组的子区列表。 |
| {@link ChatManager.fetchLastMessageWithChatThread fetchLastMessageWithChatThread} | 从服务器批量获取指定子区中的最新一条消息。 |
| {@link ChatManager.fetchChatThreadFromServer fetchChatThreadFromServer} | 从服务器获取子区详情。 |
| {@link ChatManager.getMessageThread getMessageThread} | 获取本地子区详情。 |
| {@link ChatManager.getThreadConversation getThreadConversation} | 根据指定会话 ID 获取本地子区会话对象。 |
| {@link ChatManager.fetchConversationsFromServerWithPage fetchConversationsFromServerWithPage} | 从服务器分页获取会话列表。 |
| {@link ChatManager.removeMessagesFromServerWithMsgIds removeMessagesFromServerWithMsgIds} | 从会话中删除消息（从本地存储和服务器）。 |
| {@link ChatManager.removeMessagesFromServerWithTimestamp removeMessagesFromServerWithTimestamp} | 从会话中删除消息（从本地存储和服务器）。 |
| {@link ChatManager.fetchConversationsFromServerWithCursor fetchConversationsFromServerWithCursor} | 分页从服务器获取会话列表。 |
| {@link ChatManager.fetchPinnedConversationsFromServerWithCursor fetchPinnedConversationsFromServerWithCursor} | 分页从服务器获取置顶会话。 |
| {@link ChatManager.pinConversation pinConversation} | 设置会话是否置顶。 |
| {@link ChatManager.modifyMessageBody modifyMessageBody} | 修改文本消息。 |
| {@link ChatManager.fetchCombineMessageDetail fetchCombineMessageDetail} | 获取合并类型消息中的原始消息列表。 |
| {@link ChatManager.addRemoteAndLocalConversationsMark addRemoteAndLocalConversationsMark} | 标记会话。 |
| {@link ChatManager.deleteRemoteAndLocalConversationsMark deleteRemoteAndLocalConversationsMark} | 取消标记会话。 |
| {@link ChatManager.fetchConversationsByOptions fetchConversationsByOptions} | 按会话过滤选项从服务端获取会话。 |
| {@link ChatManager.deleteAllMessageAndConversation deleteAllMessageAndConversation} | 清空所有会话及其消息。 |
| {@link ChatManager.pinMessage pinMessage} | 置顶消息。 |
| {@link ChatManager.unpinMessage unpinMessage} | 取消置顶消息。 |
| {@link ChatManager.fetchPinnedMessages fetchPinnedMessages} | 从服务端获取指定会话中的置顶消息。 |
| {@link ChatManager.getPinnedMessages getPinnedMessages} | 从本地获取指定会话中的置顶消息。 |
| {@link ChatManager.getMessagePinInfo getMessagePinInfo} | 获取单条消息的置顶详情。 |
| {@link ChatManager.searchMessages searchMessages} | 搜索消息。 |
| {@link ChatManager.searchMessagesInConversation searchMessagesInConversation} | 搜索指定会话的消息。 |
| {@link ChatManager.removeMessagesWithTimestamp removeMessagesWithTimestamp} | 从本地和服务器端删除指定会话的消息。 |
| {@link ChatManager.getMessageCountWithTimestamp getMessageCountWithTimestamp} | 获取消息数量。 |
| {@link ChatManager.getMessageCount getMessageCount} | 获取本地消息数量。 |

| Event | Description |
| :----- | :---------- |
| {@link ChatMessageEventListener.onMessagesReceived onMessagesReceived} | 收到消息回调。 |
| {@link ChatMessageEventListener.onCmdMessagesReceived onCmdMessagesReceived} | 收到命令消息回调。 |
| {@link ChatMessageEventListener.onMessagesRead onMessagesRead} | 收到单聊消息已读回执的回调。 |
| {@link ChatMessageEventListener.onGroupMessageRead onGroupMessageRead} | 收到群组消息的已读回执的回调。 |
| {@link ChatMessageEventListener.onMessagesDelivered onMessagesDelivered} | 收到消息已送达回执的回调。 |
| {@link ChatMessageEventListener.onMessagesRecalledInfo onMessagesRecalledInfo} | 收到消息撤销通知的回调。 |
| {@link ChatMessageEventListener.onConversationsUpdate onConversationsUpdate} | 会话更新事件回调。 |
| {@link ChatMessageEventListener.onConversationRead onConversationRead} | 收到会话已读回执的回调。 |
| {@link ChatMessageEventListener.onMessageReactionDidChange onMessageReactionDidChange} | 消息表情回复（Reaction）变化监听器。 |
| {@link ChatMessageEventListener.onChatMessageThreadCreated onChatMessageThreadCreated} | 子区创建回调。 |
| {@link ChatMessageEventListener.onChatMessageThreadUpdated onChatMessageThreadUpdated} | 子区更新回调。 |
| {@link ChatMessageEventListener.onChatMessageThreadDestroyed onChatMessageThreadDestroyed} | 子区移除回调。 |
| {@link ChatMessageEventListener.onChatMessageThreadUserRemoved onChatMessageThreadUserRemoved} | 管理员移除子区用户的回调。 |
| {@link ChatMessageEventListener.onMessageContentChanged onMessageContentChanged} | 文本消息内容更改，其它设备收到该通知。 |
| {@link ChatMessageEventListener.onMessagePinChanged onMessagePinChanged} | 收到消息置顶状态变更回调。 |
## ChatContactManager
| Method | Description |
| :----- | :---------- |
| {@link ChatContactManager.setNativeListener setNativeListener} | 联系人管理类，用于添加、查询和删除联系人。 |
| {@link ChatContactManager.addContactListener addContactListener} | 添加联系人监听器。 |
| {@link ChatContactManager.removeContactListener removeContactListener} | 移除联系人监听器。 |
| {@link ChatContactManager.removeAllContactListener removeAllContactListener} | 移除所有联系人监听器。 |
| {@link ChatContactManager.addContact addContact} | 添加好友。 |
| {@link ChatContactManager.deleteContact deleteContact} | 删除联系人及其相关的会话。 |
| {@link ChatContactManager.getAllContactsFromServer getAllContactsFromServer} | 从服务器获取联系人列表。 |
| {@link ChatContactManager.getAllContactsFromDB getAllContactsFromDB} | 从本地数据库获取联系人列表。 |
| {@link ChatContactManager.addUserToBlockList addUserToBlockList} | 将指定用户加入黑名单。 |
| {@link ChatContactManager.removeUserFromBlockList removeUserFromBlockList} | 将指定用户移除黑名单。 |
| {@link ChatContactManager.getBlockListFromServer getBlockListFromServer} | 从服务器获取黑名单列表。 |
| {@link ChatContactManager.getBlockListFromDB getBlockListFromDB} | 从本地数据库获取黑名单列表。 |
| {@link ChatContactManager.acceptInvitation acceptInvitation} | 接受加好友的邀请。 |
| {@link ChatContactManager.declineInvitation declineInvitation} | 拒绝加好友的邀请。 |
| {@link ChatContactManager.getSelfIdsOnOtherPlatform getSelfIdsOnOtherPlatform} | 获取登录用户在其他登录设备上唯一 ID，该 ID 由 user ID + "/" + resource 组成。 |
| {@link ChatContactManager.getAllContacts getAllContacts} | 从本地数据库获取所有所有联系人。 |
| {@link ChatContactManager.getContact getContact} | 从本地数据库获取指定联系人备注信息。 |
| {@link ChatContactManager.fetchAllContacts fetchAllContacts} | 从服务器获取所有联系人。 |
| {@link ChatContactManager.fetchContacts fetchContacts} | 从服务器分页获取联系人 |
| {@link ChatContactManager.setContactRemark setContactRemark} | 设置联系人备注。 |

| Event | Description |
| :----- | :---------- |
| {@link ChatContactEventListener.onContactAdded onContactAdded} | 好友请求被接受的回调。 |
| {@link ChatContactEventListener.onContactDeleted onContactDeleted} | 好友请求被拒绝的回调。 |
| {@link ChatContactEventListener.onContactInvited onContactInvited} | 当前用户收到好友请求的回调。 |
| {@link ChatContactEventListener.onFriendRequestAccepted onFriendRequestAccepted} | 当前用户同意好友请求的回调。 |
| {@link ChatContactEventListener.onFriendRequestDeclined onFriendRequestDeclined} | 拒绝好友请求的回调。 |
## ChatGroupManager
| Method | Description |
| :----- | :---------- |
| {@link ChatGroupManager.setNativeListener setNativeListener} | 群组管理类，用于管理群组的创建，删除及成员管理等操作。 |
| {@link ChatGroupManager.getGroupWithId getGroupWithId} | 根据群组 ID，从内存中获取群组对象。 |
| {@link ChatGroupManager.getJoinedGroups getJoinedGroups} | 从本地数据库获取当前用户已加入的群组。 |
| {@link ChatGroupManager.fetchJoinedGroupsFromServer fetchJoinedGroupsFromServer} | 以分页方式从服务器获取当前用户已加入的群组。 |
| {@link ChatGroupManager.fetchPublicGroupsFromServer fetchPublicGroupsFromServer} | 分页从服务器获取公开群组。 |
| {@link ChatGroupManager.createGroup createGroup} | 创建群组。 |
| {@link ChatGroupManager.fetchGroupInfoFromServer fetchGroupInfoFromServer} | 从服务器获取群组详情。 |
| {@link ChatGroupManager.fetchMemberListFromServer fetchMemberListFromServer} | 从服务器分页获取群组成员。 |
| {@link ChatGroupManager.fetchBlockListFromServer fetchBlockListFromServer} | 从服务器分页获取群组黑名单列表。 |
| {@link ChatGroupManager.fetchMuteListFromServer fetchMuteListFromServer} | 从服务器分页获取群组禁言列表。 |
| {@link ChatGroupManager.fetchAllowListFromServer fetchAllowListFromServer} | 从服务器分页获取群组白名单列表。 |
| {@link ChatGroupManager.isMemberInAllowListFromServer isMemberInAllowListFromServer} | 从服务器查询该用户是否在群组白名单上。 |
| {@link ChatGroupManager.fetchGroupFileListFromServer fetchGroupFileListFromServer} | 从服务器分页获取群共享文件。 |
| {@link ChatGroupManager.fetchAnnouncementFromServer fetchAnnouncementFromServer} | 从服务器获取群组公告。 |
| {@link ChatGroupManager.addMembers addMembers} | 向群组中添加新成员。 |
| {@link ChatGroupManager.inviteUser inviteUser} | 邀请用户加入群组。 |
| {@link ChatGroupManager.removeMembers removeMembers} | 从群组中移除用户。 |
| {@link ChatGroupManager.blockMembers blockMembers} | 将成员加入群组的黑名单列表。 |
| {@link ChatGroupManager.unblockMembers unblockMembers} | 将用户从群组黑名单中移除。 |
| {@link ChatGroupManager.changeGroupName changeGroupName} | 修改群组名称。 |
| {@link ChatGroupManager.changeGroupDescription changeGroupDescription} | 修改群组描述。 |
| {@link ChatGroupManager.leaveGroup leaveGroup} | 主动退出群组。 |
| {@link ChatGroupManager.destroyGroup destroyGroup} | 解散群组。 |
| {@link ChatGroupManager.blockGroup blockGroup} | 屏蔽群消息。 |
| {@link ChatGroupManager.unblockGroup unblockGroup} | 解除屏蔽群消息。 |
| {@link ChatGroupManager.changeOwner changeOwner} | 转移群主权限。 |
| {@link ChatGroupManager.addAdmin addAdmin} | 添加群组管理员。 |
| {@link ChatGroupManager.removeAdmin removeAdmin} | 移除群组管理员权限。 |
| {@link ChatGroupManager.muteMembers muteMembers} | 禁言群组成员。 |
| {@link ChatGroupManager.unMuteMembers unMuteMembers} | 将成员移除群组禁言名单。 |
| {@link ChatGroupManager.muteAllMembers muteAllMembers} | 禁言全体群成员。 |
| {@link ChatGroupManager.unMuteAllMembers unMuteAllMembers} | 解除全体成员禁言。 |
| {@link ChatGroupManager.addAllowList addAllowList} | 将成员加入群组白名单。 |
| {@link ChatGroupManager.removeAllowList removeAllowList} | 从群白名单中移出成员。 |
| {@link ChatGroupManager.uploadGroupSharedFile uploadGroupSharedFile} | 上传群组共享文件。 |
| {@link ChatGroupManager.downloadGroupSharedFile downloadGroupSharedFile} | 下载群共享文件。 |
| {@link ChatGroupManager.removeGroupSharedFile removeGroupSharedFile} | 删除指定群共享文件。 |
| {@link ChatGroupManager.updateGroupAnnouncement updateGroupAnnouncement} | 更新群公告。 |
| {@link ChatGroupManager.updateGroupExtension updateGroupExtension} | 更新群组扩展字段信息。 |
| {@link ChatGroupManager.joinPublicGroup joinPublicGroup} | 加入公开群组。 |
| {@link ChatGroupManager.requestToJoinPublicGroup requestToJoinPublicGroup} | 申请加入群组。 |
| {@link ChatGroupManager.acceptJoinApplication acceptJoinApplication} | 同意入群申请。 |
| {@link ChatGroupManager.declineJoinApplication declineJoinApplication} | 拒绝用户的入群申请。 |
| {@link ChatGroupManager.acceptInvitation acceptInvitation} | 接受入群邀请。 |
| {@link ChatGroupManager.declineInvitation declineInvitation} | 拒绝入群邀请。 |
| {@link ChatGroupManager.setMemberAttribute setMemberAttribute} | 设置单个群成员的自定义属性。 |
| {@link ChatGroupManager.fetchMemberAttributes fetchMemberAttributes} | 获取单个群成员所有自定义属性。 |
| {@link ChatGroupManager.fetchMembersAttributes fetchMembersAttributes} | 根据指定的属性 key 获取多个群成员的自定义属性。 |
| {@link ChatGroupManager.fetchJoinedGroupCount fetchJoinedGroupCount} | 获取已加入的群组数目。 |
| {@link ChatGroupManager.addGroupListener addGroupListener} | 添加群组监听器。 |
| {@link ChatGroupManager.removeGroupListener removeGroupListener} | 移除群组监听器。 |
| {@link ChatGroupManager.removeAllGroupListener removeAllGroupListener} | 清除群组监听器。 |

| Event | Description |
| :----- | :---------- |
| {@link ChatGroupEventListener.onInvitationReceived onInvitationReceived} | 当前用户收到入群邀请的回调。 |
| {@link ChatGroupEventListener.onRequestToJoinReceived onRequestToJoinReceived} | 对端用户接收群组申请的回调。 |
| {@link ChatGroupEventListener.onRequestToJoinAccepted onRequestToJoinAccepted} | 对端用户接受当前用户发送的群组申请的回调。 |
| {@link ChatGroupEventListener.onRequestToJoinDeclined onRequestToJoinDeclined} | 对端用户拒绝群组申请的回调。 |
| {@link ChatGroupEventListener.onInvitationAccepted onInvitationAccepted} | 当前用户收到对端用户同意入群邀请触发的回调。 |
| {@link ChatGroupEventListener.onInvitationDeclined onInvitationDeclined} | 当前用户收到群组邀请被拒绝的回调。 |
| {@link ChatGroupEventListener.onMemberRemoved onMemberRemoved} | 当前用户被移出群组时的回调。 |
| {@link ChatGroupEventListener.onDestroyed onDestroyed} | 当前用户收到群组被解散的回调。 |
| {@link ChatGroupEventListener.onAutoAcceptInvitation onAutoAcceptInvitation} | 当前用户自动同意入群邀请的回调。 |
| {@link ChatGroupEventListener.onMuteListAdded onMuteListAdded} | 有成员被禁言回调。 |
| {@link ChatGroupEventListener.onMuteListRemoved onMuteListRemoved} | 有成员被解除禁言的回调。 |
| {@link ChatGroupEventListener.onAdminAdded onAdminAdded} | 成员设置为管理员的回调。 |
| {@link ChatGroupEventListener.onAdminRemoved onAdminRemoved} | 取消成员的管理员权限的回调。 |
| {@link ChatGroupEventListener.onOwnerChanged onOwnerChanged} | 转移群主权限的回调。 |
| {@link ChatGroupEventListener.onMemberJoined onMemberJoined} | 新成员加入群组的回调。 |
| {@link ChatGroupEventListener.onMemberExited onMemberExited} | 群组成员主动退出回调。 |
| {@link ChatGroupEventListener.onAnnouncementChanged onAnnouncementChanged} | 群公告更新回调。 |
| {@link ChatGroupEventListener.onSharedFileAdded onSharedFileAdded} | 群组添加共享文件回调。 |
| {@link ChatGroupEventListener.onSharedFileDeleted onSharedFileDeleted} | 群组删除共享文件回调。 |
| {@link ChatGroupEventListener.onAllowListAdded onAllowListAdded} | 成员加入群组白名单回调。 |
| {@link ChatGroupEventListener.onAllowListRemoved onAllowListRemoved} | 成员移出群组白名单回调。 |
| {@link ChatGroupEventListener.onAllGroupMemberMuteStateChanged onAllGroupMemberMuteStateChanged} | 全员禁言状态变化回调。 |
| {@link ChatGroupEventListener.onDetailChanged onDetailChanged} | 群组详情变更回调。群组所有成员会收到该事件。 |
| {@link ChatGroupEventListener.onStateChanged onStateChanged} | 群组状态变更回调。群组所有成员会收到该事件。 |
| {@link ChatGroupEventListener.onMemberAttributesChanged onMemberAttributesChanged} | 群组成员属性变化通知。 |
## ChatRoomManager
| Method | Description |
| :----- | :---------- |
| {@link ChatRoomManager.setNativeListener setNativeListener} | 聊天室管理类，负责聊天室加入和退出、聊天室列表获取以及成员权限管理等。 |
| {@link ChatRoomManager.addRoomListener addRoomListener} | 注册聊天室监听器。 |
| {@link ChatRoomManager.removeRoomListener removeRoomListener} | 移除聊天室监听器。 |
| {@link ChatRoomManager.removeAllRoomListener removeAllRoomListener} | 移除所有聊天室监听器。 |
| {@link ChatRoomManager.joinChatRoom joinChatRoom} | 加入聊天室。 |
| {@link ChatRoomManager.joinChatRoomEx joinChatRoomEx} | 加入聊天室。 |
| {@link ChatRoomManager.leaveChatRoom leaveChatRoom} | 退出聊天室。 |
| {@link ChatRoomManager.fetchPublicChatRoomsFromServer fetchPublicChatRoomsFromServer} | 从服务器分页获取公开聊天室。 |
| {@link ChatRoomManager.fetchChatRoomInfoFromServer fetchChatRoomInfoFromServer} | 从服务器获取聊天室详情。 |
| {@link ChatRoomManager.getChatRoomWithId getChatRoomWithId} | 根据聊天室 ID 从本地数据库获取聊天室。 |
| {@link ChatRoomManager.createChatRoom createChatRoom} | 创建聊天室。 |
| {@link ChatRoomManager.destroyChatRoom destroyChatRoom} | 解散聊天室。 |
| {@link ChatRoomManager.changeChatRoomSubject changeChatRoomSubject} | 修改聊天室名称。 |
| {@link ChatRoomManager.changeChatRoomDescription changeChatRoomDescription} | 修改聊天室描述信息。 |
| {@link ChatRoomManager.fetchChatRoomMembers fetchChatRoomMembers} | 获取聊天室成员用户 ID 列表。 |
| {@link ChatRoomManager.muteChatRoomMembers muteChatRoomMembers} | 将聊天室中指定成员禁言。 |
| {@link ChatRoomManager.unMuteChatRoomMembers unMuteChatRoomMembers} | 取消对指定聊天室成员的禁言。 |
| {@link ChatRoomManager.changeOwner changeOwner} | 转让聊天室所有者权限。 |
| {@link ChatRoomManager.addChatRoomAdmin addChatRoomAdmin} | 添加聊天室管理员。 |
| {@link ChatRoomManager.removeChatRoomAdmin removeChatRoomAdmin} | 移除聊天室管理员权限。 |
| {@link ChatRoomManager.fetchChatRoomMuteList fetchChatRoomMuteList} | 分页从服务器获取聊天室禁言名单。 |
| {@link ChatRoomManager.removeChatRoomMembers removeChatRoomMembers} | 将成员移出聊天室。 |
| {@link ChatRoomManager.blockChatRoomMembers blockChatRoomMembers} | 将指定成员加入聊天室黑名单。 |
| {@link ChatRoomManager.unBlockChatRoomMembers unBlockChatRoomMembers} | 将指定用户从聊天室黑名单中移除。 |
| {@link ChatRoomManager.fetchChatRoomBlockList fetchChatRoomBlockList} | 从服务器获取黑名单列表。 |
| {@link ChatRoomManager.updateChatRoomAnnouncement updateChatRoomAnnouncement} | 更新聊天室公告。 |
| {@link ChatRoomManager.fetchChatRoomAnnouncement fetchChatRoomAnnouncement} | 从服务器获取聊天室公告内容。 |
| {@link ChatRoomManager.fetchChatRoomAllowListFromServer fetchChatRoomAllowListFromServer} | 从服务器获取白名单列表。 |
| {@link ChatRoomManager.isMemberInChatRoomAllowList isMemberInChatRoomAllowList} | 查询指定成员是否在聊天室白名单中。 |
| {@link ChatRoomManager.addMembersToChatRoomAllowList addMembersToChatRoomAllowList} | 将成员加入聊天室白名单。 |
| {@link ChatRoomManager.removeMembersFromChatRoomAllowList removeMembersFromChatRoomAllowList} | 将聊天室成员从白名单中移除。 |
| {@link ChatRoomManager.muteAllChatRoomMembers muteAllChatRoomMembers} | 禁言聊天室所有成员。 |
| {@link ChatRoomManager.unMuteAllChatRoomMembers unMuteAllChatRoomMembers} | 解除聊天室全员禁言。 |
| {@link ChatRoomManager.fetchChatRoomAttributes fetchChatRoomAttributes} | 从服务器获取聊天室数据。 |
| {@link ChatRoomManager.addAttributes addAttributes} | 设置聊天室自定义属性。 |
| {@link ChatRoomManager.removeAttributes removeAttributes} | 删除聊天室自定义属性。 |

| Event | Description |
| :----- | :---------- |
| {@link ChatRoomEventListener.onDestroyed onDestroyed} | 聊天室解散的回调。 |
| {@link ChatRoomEventListener.onMemberJoined onMemberJoined} | 聊天室加入新成员回调。 |
| {@link ChatRoomEventListener.onMemberExited onMemberExited} | 聊天室成员主动退出回调。 |
| {@link ChatRoomEventListener.onMemberRemoved onMemberRemoved} | 聊天室成员被移除回调。 |
| {@link ChatRoomEventListener.onMuteListAdded onMuteListAdded} | 有成员被禁言回调。 |
| {@link ChatRoomEventListener.onMuteListAddedV2 onMuteListAddedV2} | 增加禁言成员时候回调。 |
| {@link ChatRoomEventListener.onMuteListRemoved onMuteListRemoved} | 有成员从禁言列表中移除回调。 |
| {@link ChatRoomEventListener.onAdminAdded onAdminAdded} | 有成员设置为聊天室管理员的回调。 |
| {@link ChatRoomEventListener.onAdminRemoved onAdminRemoved} | 移除聊天室管理员权限的回调。 |
| {@link ChatRoomEventListener.onOwnerChanged onOwnerChanged} | 转移聊天室的所有权的回调。 |
| {@link ChatRoomEventListener.onAnnouncementChanged onAnnouncementChanged} | 聊天室公告更新回调。 |
| {@link ChatRoomEventListener.onAllowListAdded onAllowListAdded} | 有成员被加入聊天室白名单的回调。 |
| {@link ChatRoomEventListener.onAllowListRemoved onAllowListRemoved} | 有成员被移出聊天室白名单的回调。 |
| {@link ChatRoomEventListener.onAllChatRoomMemberMuteStateChanged onAllChatRoomMemberMuteStateChanged} | 聊天室全员禁言状态变化回调。 |
| {@link ChatRoomEventListener.onSpecificationChanged onSpecificationChanged} | 聊天室详情变更回调。聊天室所有成员会收到该事件。 |
| {@link ChatRoomEventListener.onAttributesUpdated onAttributesUpdated} | 聊天室自定义属性（key-value）更新回调。聊天室所有成员会收到该事件。 |
| {@link ChatRoomEventListener.onAttributesRemoved onAttributesRemoved} | 聊天室自定义属性（key-value）移除回调。聊天室所有成员会收到该事件。 |
## ChatPresenceManager
| Method | Description |
| :----- | :---------- |
| {@link ChatPresenceManager.setNativeListener setNativeListener} | 在线状态管理器类。 |
| {@link ChatPresenceManager.addPresenceListener addPresenceListener} | 添加在线状态监听器。 |
| {@link ChatPresenceManager.removePresenceListener removePresenceListener} | 移除在线状态监听器。 |
| {@link ChatPresenceManager.removeAllPresenceListener removeAllPresenceListener} | 清除所有在线状态监听器。 |
| {@link ChatPresenceManager.publishPresence publishPresence} | 发布自定义在线状态。 |
| {@link ChatPresenceManager.subscribe subscribe} | 订阅指定用户的在线状态。 |
| {@link ChatPresenceManager.unsubscribe unsubscribe} | 取消订阅指定用户的在线状态。 |
| {@link ChatPresenceManager.fetchSubscribedMembers fetchSubscribedMembers} | 分页查询当前用户订阅了哪些用户的在线状态。 |
| {@link ChatPresenceManager.fetchPresenceStatus fetchPresenceStatus} | 查询指定用户的当前在线状态。 |

| Event | Description |
| :----- | :---------- |
| {@link ChatPresenceEventListener.onPresenceStatusChanged onPresenceStatusChanged} | 收到被订阅用户的在线状态发生变化。 |
## ChatPushManager
| Method | Description |
| :----- | :---------- |
| {@link ChatPushManager.setNativeListener setNativeListener} | 消息推送设置管理类。 |
| {@link ChatPushManager.setSilentModeForConversation setSilentModeForConversation} | 设置指定会话的消息推送模式。 |
| {@link ChatPushManager.removeSilentModeForConversation removeSilentModeForConversation} | 清除指定会话的消息推送设置。 |
| {@link ChatPushManager.fetchSilentModeForConversation fetchSilentModeForConversation} | 获取指定会话的离线推送设置。 |
| {@link ChatPushManager.setSilentModeForAll setSilentModeForAll} | 设置 app 的离线推送模式。 |
| {@link ChatPushManager.fetchSilentModeForAll fetchSilentModeForAll} | 获取 app 的离线推送设置。 |
| {@link ChatPushManager.fetchSilentModeForConversations fetchSilentModeForConversations} | 获取指定的多个会话的离线推送设置。 |
| {@link ChatPushManager.setPreferredNotificationLanguage setPreferredNotificationLanguage} | 设置推送通知的首选语言。 |
| {@link ChatPushManager.fetchPreferredNotificationLanguage fetchPreferredNotificationLanguage} | 获取推送通知的首选语言。 |
| {@link ChatPushManager.updatePushNickname updatePushNickname} | 修改推送通知中显示的消息发送方的昵称。 |
| {@link ChatPushManager.updatePushDisplayStyle updatePushDisplayStyle} | 修改推送通知的展示方式。 |
| {@link ChatPushManager.fetchPushOptionFromServer fetchPushOptionFromServer} | 从服务器获取推送配置。 |
| {@link ChatPushManager.selectPushTemplate selectPushTemplate} | 选择离线推送模板，通知服务器。 |
| {@link ChatPushManager.fetchSelectedPushTemplate fetchSelectedPushTemplate} | 获取当前推送模板的名称。 |
## ChatUserInfoManager
| Method | Description |
| :----- | :---------- |
| {@link ChatUserInfoManager.updateOwnUserInfo updateOwnUserInfo} | 修改当前用户的信息。 |
| {@link ChatUserInfoManager.fetchUserInfoById fetchUserInfoById} | 获取指定用户的用户属性。 |
| {@link ChatUserInfoManager.fetchOwnInfo fetchOwnInfo} | 从服务器获取当前用户的用户属性信息。 |
## ChatMessage
| Method | Description |
| :----- | :---------- |
| {@link ChatMessage.constructor constructor} | 构造消息。 |
| {@link ChatMessage.createSendMessage createSendMessage} | 构造消息。 |
| {@link ChatMessage.createTextMessage createTextMessage} | 创建一条待发送的文本消息。 |
| {@link ChatMessage.createFileMessage createFileMessage} | 创建一条待发送的文件类型消息。 |
| {@link ChatMessage.createImageMessage createImageMessage} | 创建一条待发送的图片消息。 |
| {@link ChatMessage.createVideoMessage createVideoMessage} | 创建一条待发送的视频消息。 |
| {@link ChatMessage.createVoiceMessage createVoiceMessage} | 创建一条待发送的语音消息。 |
| {@link ChatMessage.createCombineMessage createCombineMessage} | 创建合并类型消息体。 |
| {@link ChatMessage.createLocationMessage createLocationMessage} | 创建一条待发送的位置消息。 |
| {@link ChatMessage.createCmdMessage createCmdMessage} | 创建一条待发送的命令消息。 |
| {@link ChatMessage.createCustomMessage createCustomMessage} | 创建一条待发送的自定义类型消息。 |
| {@link ChatMessage.createReceiveMessage createReceiveMessage} | 创建一条接收消息。 |
| {@link ChatMessage.reactionList reactionList} | 获取 Reaction 列表。 |
| {@link ChatMessage.groupReadCount groupReadCount} | 获取群组消息的已读人数。 |
| {@link ChatMessage.threadInfo threadInfo} | 获取指定子区的详情。 |
| {@link ChatMessage.getPinInfo getPinInfo} | 获取消息的置顶信息。 |
| {@link ChatMessage.messagePriority messagePriority} | 设置消息优先级。仅仅聊天室生效。 |
## ChatConversation
| Method | Description |
| :----- | :---------- |
| {@link ChatConversation.name name} | 获取会话 ID。 |
| {@link ChatConversation.getUnreadCount getUnreadCount} | 获取会话的未读消息数量。 |
| {@link ChatConversation.getMessageCount getMessageCount} | 获取会话的消息数目。 |
| {@link ChatConversation.getMessageCountWithTimestamp getMessageCountWithTimestamp} | 获取会话的消息数目。 |
| {@link ChatConversation.getLatestMessage getLatestMessage} | 获取指定会话的最新消息。 |
| {@link ChatConversation.getLatestReceivedMessage getLatestReceivedMessage} | 获取指定会话中最近接收到的消息。 |
| {@link ChatConversation.setConversationExtension setConversationExtension} | 设置指定会话的自定义扩展信息。 |
| {@link ChatConversation.markMessageAsRead markMessageAsRead} | 标记指定消息为已读。 |
| {@link ChatConversation.markAllMessagesAsRead markAllMessagesAsRead} | 标记所有消息为已读。 |
| {@link ChatConversation.updateMessage updateMessage} | 更新本地数据库的指定消息。 |
| {@link ChatConversation.deleteMessage deleteMessage} | 删除本地数据库中的指定消息。 |
| {@link ChatConversation.deleteMessagesWithTimestamp deleteMessagesWithTimestamp} | 删除消息。 |
| {@link ChatConversation.deleteAllMessages deleteAllMessages} | 删除会话的所有消息。 |
| {@link ChatConversation.getMessagesWithMsgType getMessagesWithMsgType} | 从本地数据库获取会话中的指定用户发送的某些类型的消息。 |
| {@link ChatConversation.getMsgsWithMsgType getMsgsWithMsgType} | 从本地数据库中检索会话中某种类型的消息。 |
| {@link ChatConversation.getMessages getMessages} | 从本地数据库中检索会话中一定数量的消息。 |
| {@link ChatConversation.getMsgs getMsgs} | 从本地数据库中检索会话中指定数量的消息。 |
| {@link ChatConversation.getMessagesWithKeyword getMessagesWithKeyword} | 检索本地数据库中会话中带有关键字的消息。 |
| {@link ChatConversation.getMsgsWithKeyword getMsgsWithKeyword} | 获取指定用户在一定时间段内在会话中发送的消息。 |
| {@link ChatConversation.getMessageWithTimestamp getMessageWithTimestamp} | 获取本地数据库中某个会话在一定时间内发送和接收的消息。 |
| {@link ChatConversation.getMsgWithTimestamp getMsgWithTimestamp} | 检索本地数据库中某个会话在一定时间内发送和接收的消息。 |
| {@link ChatConversation.removeMessagesFromServerWithMsgIds removeMessagesFromServerWithMsgIds} | 从会话中删除消息（从本地存储和服务器）。 |
| {@link ChatConversation.removeMessagesFromServerWithTimestamp removeMessagesFromServerWithTimestamp} | 从会话中删除消息（从本地存储和服务器）。 |
| {@link ChatConversation.getPinnedMessages getPinnedMessages} | 从本地获取会话中的置顶消息。 |
| {@link ChatConversation.fetchPinnedMessages fetchPinnedMessages} | 从服务器获取会话中顶置的消息。 |
| {@link ChatConversation.searchMessages searchMessages} | 搜索本地消息。 |
| {@link ChatConversation.removeMessagesWithTimestamp removeMessagesWithTimestamp} | 移除本地和服务器的消息。和该聊天会话相关的所有消息都将被删除。会话中的其他人的服务器端消息不受影响。不会删除。 |
