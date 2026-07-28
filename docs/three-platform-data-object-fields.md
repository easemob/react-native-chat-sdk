# 三端数据对象属性对齐表

- 日期：2026-05-26
- 范围：TypeScript `src/common` class、iOS native SDK 公开属性 + `ExtSdkToJson`、Android native SDK getter/setter + `ExtSdkHelper`
- 前置映射：`docs/three-platform-data-object-mapping.md`
- 前置判定规则：`docs/three-platform-value-normalization-rules.md`

## 1. 判定口径

本文档只记录 TypeScript class 和 iOS/Android native 对象的字段契约，不对比 manager 异步请求方法，不展开 enum 值域。

字段结论分为：

- 字段对应：TS 字段是否能明确对应到 iOS/Android 字段。
- 可选性结论：三端字段是否都允许缺失/空值，或都要求必填。
- 类型结论：三端基础类型是否一致。enum 只记录为 enum 类型，具体值域放到 enum 对齐文档。

只有一种情况进入“待确认”：无法判断三端字段名是否表示同一个属性。

TypeScript 侧以 class 属性声明为主，同时记录 constructor 是否把缺失值默认成 `''`、`0`、`false`。如果 TS 属性声明为必填，但 constructor 入参可缺失并默认化，则视为“TS 对外属性不可选，输入缺失语义被默认值合并”。

## 2. 已整理对象

已整理对象：

- `ChatOptions`
- `ChatFileMessageBody`
- `ChatImageMessageBody`
- `ChatVideoMessageBody`
- `ChatVoiceMessageBody`
- `ChatTextMessageBody`
- `ChatLocationMessageBody`
- `ChatCmdMessageBody`
- `ChatCustomMessageBody`
- `ChatCombineMessageBody`
- `ChatFetchMessageOptions`
- `ChatUserInfo`
- `ChatContact`
- `ChatRoom`
- `ChatConversation`
- `ChatConversationFetchOptions`
- `ChatGroup`
- `ChatGroupOptions`
- `ChatGroupSharedFile`
- `ChatGroupMessageAck`
- `ChatGroupInfo`
- `ChatGroupMember`
- `ChatMessage`
- `ChatMessagePinInfo`
- `ChatRecalledMessageInfo`
- `ChatMessageReaction`
- `ChatReactionOperation`
- `ChatMessageReactionEvent`
- `ChatMessageThread`
- `ChatMessageThreadEvent`
- `ChatSilentModeTime`
- `ChatSilentModeParam`
- `ChatSilentModeResult`
- `ChatPushOption`
- `ChatStreamChunk`
- `ChatCursorResult<T>`
- `ChatPageResult<T>`
- `ChatTranslateLanguage`
- `ChatDeviceInfo`
- `ChatPresence`
- `ChatRTCTokenInfo`
- `ChatError` / `ChatException`

## 3. 字段对齐结论

### 3.1 文件消息体公共字段

适用对象：`ChatFileMessageBody`、`ChatImageMessageBody`、`ChatVideoMessageBody`、`ChatVoiceMessageBody`、`ChatCombineMessageBody`。

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `localPath` | `localPath` | `getLocalUrl()` / `setLocalUrl` | 明确 | 一致 | 一致 | TS 必填；iOS init 参数 nullable 但对象路径字段按字符串处理；Android 构造依赖本地 URI。 |
| `secret` | `secretKey` | `getSecret()` / `setSecret` | 明确 | 不一致 | 一致 | TS class 属性必填且缺省为 `''`；iOS/Android 为可为空字符串引用。TS 合并了未设置和空字符串。 |
| `remotePath` | `remotePath` | `getRemoteUrl()` / `setRemoteUrl` | 明确 | 不一致 | 一致 | TS class 属性必填且缺省为 `''`；native 字段可为空。 |
| `fileStatus` | `downloadStatus` | `downloadStatus()` / `setDownloadStatus` | 明确 | 一致 | enum，值域另文对齐 | TS 缺省走 `ChatDownloadStatusFromNumber(-1)`；native 为下载状态 enum。 |
| `fileSize` | `fileLength` | `getFileSize()` / `setFileLength` | 明确 | 一致 | 一致 | TS number；iOS `long long`；Android `long`。 |
| `displayName` | `displayName` | `getFileName()` / `setFileName` | 明确 | 不一致 | 一致 | TS class 属性必填且缺省为 `''`；iOS init 参数 nullable，Android setter/getter 为 nullable string。 |

### 3.2 `ChatImageMessageBody`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `sendOriginalImage` | `compressionRatio` / `isOriginalImage` | `isSendOriginalImage()` / `setSendOriginalImage` | 明确 | 不一致 | 一致 | TS 必填 boolean，缺省 `false`；Android boolean 缺省 `false`；iOS wrapper 用 `compressionRatio` 表达，缺失和 false 都变成压缩发送。 |
| `thumbnailLocalPath` | `thumbnailLocalPath` | `thumbnailLocalPath()` / `setThumbnailLocalPath` | 明确 | 不一致 | 一致 | TS 属性必填，但 constructor 入参可缺失；当前 TS 未用 `?? ''`，缺失输入会写入 `undefined`。iOS/Android 缩略图本地路径可为空。 |
| `thumbnailRemotePath` | `thumbnailRemotePath` | `getThumbnailUrl()` / `setThumbnailUrl` | 明确 | 不一致 | 一致 | TS 属性必填且缺省 `''`；native 字段可为空。 |
| `thumbnailSecret` | `thumbnailSecretKey` | `getThumbnailSecret()` / `setThumbnailSecret` | 明确 | 不一致 | 一致 | TS 属性必填且缺省 `''`；native 字段可为空。 |
| `thumbnailStatus` | `thumbnailDownloadStatus` | `thumbnailDownloadStatus()` / `setThumbnailDownloadStatus` | 明确 | 一致 | enum，值域另文对齐 | 三端都有缩略图下载状态。 |
| `width` | `size.width` | `getWidth()` / `setThumbnailSize` | 明确 | 一致 | 一致 | TS number；iOS `CGFloat`；Android `int`。 |
| `height` | `size.height` | `getHeight()` / `setThumbnailSize` | 明确 | 一致 | 一致 | TS number；iOS `CGFloat`；Android `int`。 |
| `isGif` | `isGif` | `isGif()` / `setGif` | 明确 | 不一致 | 一致 | TS 属性声明可选，但 constructor 总是写入 boolean，缺省 `false`；native 是 boolean。 |

### 3.3 `ChatVideoMessageBody`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `duration` | `duration` | `getDuration()` | 明确 | 一致 | 一致 | TS number；iOS/Android int。 |
| `thumbnailLocalPath` | `thumbnailLocalPath` | `getLocalThumbUri()` / `setLocalThumb` | 明确 | 不一致 | 一致 | TS 属性必填且缺省 `''`；iOS 显式 nullable；Android 可传 null/空 URI。 |
| `thumbnailRemotePath` | `thumbnailRemotePath` | `getThumbnailUrl()` / `setThumbnailUrl` | 明确 | 不一致 | 一致 | TS 属性必填且缺省 `''`；iOS nullable；Android string 可为空。 |
| `thumbnailSecret` | `thumbnailSecretKey` | `getThumbnailSecret()` / `setThumbnailSecret` | 明确 | 不一致 | 一致 | TS 属性必填且缺省 `''`；iOS nullable；Android string 可为空。 |
| `thumbnailStatus` | `thumbnailDownloadStatus` | `thumbnailDownloadStatus()` / `setThumbnailDownloadStatus` | 明确 | 一致 | enum，值域另文对齐 | 三端都有缩略图下载状态。 |
| `width` | `thumbnailSize.width` | `getThumbnailWidth()` / `setThumbnailSize` | 明确 | 一致 | 一致 | TS 字段名是 `width`，实际对应视频缩略图宽度。 |
| `height` | `thumbnailSize.height` | `getThumbnailHeight()` / `setThumbnailSize` | 明确 | 一致 | 一致 | TS 字段名是 `height`，实际对应视频缩略图高度。 |

### 3.4 `ChatVoiceMessageBody`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `duration` | `duration` | `getLength()` | 明确 | 一致 | 一致 | TS number；iOS/Android int。 |

其他文件字段见 3.1。

### 3.5 `ChatTextMessageBody`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `content` | `text` | `getMessage()` / `setMessage` | 明确 | 一致 | 一致 | TS 必填；iOS init 参数 nullable 但 `text` 属性为 nonnull readonly；Android 构造参数 string。 |
| `targetLanguageCodes` | `targetLanguages` | `getTargetLanguages()` / `setTargetLanguages` | 明确 | 一致 | 一致 | 三端均为可选字符串数组。 |
| `translations` | `translations` | `getTranslations()` | 明确 | 不一致 | 不一致 | TS 是 `any?`；iOS 是 nullable `NSDictionary<NSString*, NSString*>`；Android 是 `List<EMTranslationInfo>`，wrapper 输出为 `Map<String, String>`。TS 类型过宽。 |

### 3.6 `ChatLocationMessageBody`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `address` | `address` | `getAddress()` | 明确 | 不一致 | 一致 | TS 必填；iOS/Android address 可为空。 |
| `latitude` | `latitude` | `getLatitude()` | 明确 | 一致 | 不一致 | TS 是 `string`；iOS/Android 是 `double`。 |
| `longitude` | `longitude` | `getLongitude()` | 明确 | 一致 | 不一致 | TS 是 `string`；iOS/Android 是 `double`。 |

### 3.7 `ChatCmdMessageBody`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `action` | `action` | `action()` | 明确 | 一致 | 一致 | 三端均为必填字符串。 |

Native 还有 `isDeliverOnlineOnly`，当前 TypeScript 对象没有暴露，RN wrapper 也注释了转换，不纳入本轮字段对齐。

### 3.8 `ChatCustomMessageBody`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `event` | `event` | `event()` / `setEvent` | 明确 | 一致 | 一致 | 三端均为字符串事件名。 |
| `params` | `customExt` | `getParams()` / `setParams` | 明确 | 一致 | 一致 | 三端均为可选 `string -> string` map。 |

### 3.9 `ChatCombineMessageBody`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `title` | `title` | `getTitle()` / `setTitle` | 明确 | 一致 | 一致 | 三端均可为空字符串引用。 |
| `summary` | `summary` | `getSummary()` / `setSummary` | 明确 | 一致 | 一致 | 三端均可为空字符串引用。 |
| `messageIdList` | `messageIdList` | `setMessageList` | 明确 | 不一致 | 一致 | TS 可选；iOS initializer 参数 nonnull 且属性 readonly nonnull；Android 文档要求 list 不为 null 或空。 |
| `compatibleText` | `compatibleText` | `getCompatibleText()` / `setCompatibleText` | 明确 | 一致 | 一致 | 三端均可为空字符串引用。 |

注意：iOS `toJsonObject` 当前注释掉 `messageIdList` 输出，Android `combineBodyToJson` 也未输出 `messageIdList`。这不是字段对应不确定，而是输出方向缺失。

### 3.10 `ChatFetchMessageOptions`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `from` | `from` | `setFrom` | 明确 | 一致 | 一致 | 三端均可选，且 native 已 deprecated。 |
| `senders` | `fromIds` | `setFromIds` | 明确 | 一致 | 一致 | TS `Array<string>?`；iOS `NSArray<NSString*>* _Nullable`；Android `List<String>` 可不调用 setter。 |
| `msgTypes` | `msgTypes` | `setMsgTypes` | 明确 | 一致 | enum，值域另文对齐 | TS `ChatMessageType[]?`；native 是消息类型 enum 数组/list。 |
| `startTs` | `startTime` | `setStartTime` | 明确 | 不一致 | 一致 | native 默认值语义为 `-1` 可忽略；TS 构造参数必填。 |
| `endTs` | `endTime` | `setEndTime` | 明确 | 不一致 | 一致 | native 默认值语义为 `-1` 可忽略；TS 构造参数必填。 |
| `direction` | `direction` | `setDirection` | 明确 | 不一致 | enum，值域另文对齐 | native 有默认 `UP`；TS 构造参数必填。 |
| `needSave` | `isSave` | `setIsSave` | 明确 | 不一致 | 一致 | native 默认 `false`；TS 构造参数必填。 |

### 3.11 `ChatUserInfo`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `userId` | `userId` | `getUserId()` / `setUserId` | 明确 | 不一致 | 一致 | TS 必填；iOS/Android userId 字段可为空。 |
| `nickName` | `nickname` | `getNickname()` / `setNickname` | 明确 | 一致 | 一致 | 三端可选字符串。 |
| `avatarUrl` | `avatarUrl` | `getAvatarUrl()` / `setAvatarUrl` | 明确 | 一致 | 一致 | 三端可选字符串。 |
| `mail` | `mail` | `getEmail()` / `setEmail` | 明确 | 一致 | 一致 | 三端可选字符串。 |
| `phone` | `phone` | `getPhoneNumber()` / `setPhoneNumber` | 明确 | 一致 | 一致 | 三端可选字符串。 |
| `gender` | `gender` | `getGender()` / `setGender` | 明确 | 一致 | 一致 | 三端数字，native 默认 0。 |
| `sign` | `sign` | `getSignature()` / `setSignature` | 明确 | 一致 | 一致 | 三端可选字符串。 |
| `birth` | `birth` | `getBirth()` / `setBirth` | 明确 | 一致 | 一致 | 三端可选字符串。 |
| `ext` | `ext` | `getExt()` / `setExt` | 明确 | 一致 | 一致 | 三端可选字符串。 |

### 3.12 `ChatContact`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `userId` | `userId` | `getUsername()` | 明确 | 一致 | 一致 | 三端联系人 ID 必填。 |
| `remark` | `remark` | `getRemark()` / `setRemark` | 明确 | 不一致 | 一致 | TS 必填；iOS remark nullable；Android remark 可为 null，wrapper 输出时 null 不写 key。 |

### 3.13 `ChatMessagePinInfo`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `pinTime` | `pinTime` | `pinTime()` | 明确 | 一致 | 一致 | TS number；iOS `NSInteger`；Android `long`。 |
| `operatorId` | `operatorId` | `operatorId()` | 明确 | 不一致 | 一致 | TS 必填；iOS nonnull；Android 在 `emaObject == null` 时可返回 null。正常 native 对象路径一致。 |

### 3.14 `ChatRecalledMessageInfo`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `recalledMessageId` | `recallMessageId` | `getRecallMessageId()` | 明确 | 一致 | 一致 | 三端必填字符串。 |
| `recalledMessage` | `recallMessage` | `getRecallMessage()` | 明确 | 一致 | 一致 | 三端可选消息对象。 |
| `recalledBy` | `recallBy` | `getRecallBy()` | 明确 | 一致 | 一致 | 三端必填字符串。 |
| `recalledExt` | `ext` | `getExt()` | 明确 | 一致 | 一致 | 三端可选字符串。 |
| `recalledConvId` | `conversationId` | `getConversationId()` | 明确 | 不一致 | 一致 | TS 可选；iOS `conversationId` nonnull；Android 字段可为空且 wrapper 仅非 null 输出。 |

### 3.15 `ChatMessageReactionEvent`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `convId` | `conversationId` | `getConversionID()` 输出 `conversationId` | 明确 | 一致 | 一致 | native 输出字段名为 `conversationId`；`ChatManager` 转成 TS `convId`。 |
| `msgId` | `messageId` | `getMessageId()` 输出 `messageId` | 明确 | 一致 | 一致 | native 输出字段名为 `messageId`；`ChatManager` 转成 TS `msgId`。 |
| `reactions` | `reactions` | `getMessageReactionList()` 输出 `reactions` | 明确 | 一致 | 一致 | 三端为 reaction 数组。 |
| `operations` | `operations` | `getOperations()` 输出 `operations` | 明确 | 一致 | 一致 | 三端为 operation 数组。 |

### 3.16 `ChatOptions`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `appKey` | `appkey` / `optionsWithAppkey` | `getAppKey()` / `setAppKey` | 明确 | 一致 | 一致 | TS 允许通过 `withAppId` 不传 `appKey`；native 初始化也允许 appKey/appId 二选一。 |
| `appId` | `appId` / `optionsWithAppId` | `getAppId()` / `setAppId` | 明确 | 一致 | 一致 | TS 允许通过 `withAppKey` 不传 `appId`；native 初始化也允许 appKey/appId 二选一。 |
| `autoLogin` | `isAutoLogin` | `getAutoLogin()` / `setAutoLogin` | 明确 | 一致 | 一致 | 三端 boolean，TS 缺省 `true`。 |
| `debugModel` | `enableConsoleLog` | 无输出字段 | 明确 | 不一致 | 一致 | iOS 双向转换；Android `fromJson` 不读取，`toJson` 注释未输出。 |
| `logTag` | 无字段 | 无字段 | 明确无对应 | 不一致 | 不一致 | TS 仅本层字段，native options 未对应。 |
| `logTimestamp` | 无字段 | 无字段 | 明确无对应 | 不一致 | 不一致 | TS 仅本层字段，native options 未对应。 |
| `acceptInvitationAlways` | `autoAcceptFriendInvitation` | `getAcceptInvitationAlways()` / `setAcceptInvitationAlways` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `autoAcceptGroupInvitation` | `autoAcceptGroupInvitation` | `autoAcceptGroupInvitations()` / `setAutoAcceptGroupInvitation` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `requireAck` | `enableRequireReadAck` | `getRequireAck()` / `setRequireAck` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `requireDeliveryAck` | `enableDeliveryAck` | `getRequireDeliveryAck()` / `setRequireDeliveryAck` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `deleteMessagesAsExitGroup` | `deleteMessagesOnLeaveGroup` | `deleteMessagesOnLeaveGroup()` / `setDeleteMessagesAsExitGroup` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `deleteMessagesAsExitChatRoom` | `deleteMessagesOnLeaveChatroom` | `deleteMessagesOnLeaveChatroom()` / `setDeleteMessagesAsExitChatRoom` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `isChatRoomOwnerLeaveAllowed` | `canChatroomOwnerLeave` | `canChatroomOwnerLeave()` / `allowChatroomOwnerLeave` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `sortMessageByServerTime` | `sortMessageByServerTime` | `isSortMessageByServerTime()` / `setSortMessageByServerTime` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `usingHttpsOnly` | `usingHttpsOnly` | `getUsingHttpsOnly()` / `setUsingHttpsOnly` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `serverTransfer` | `isAutoTransferMessageAttachments` | `getAutoTransferMessageAttachments()` / `setAutoTransferMessageAttachments` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `isAutoDownload` | `autoDownloadThumbnail` | `getAutodownloadThumbnail()` / `setAutoDownloadThumbnail` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `pushConfig` | `apnsCertName` | `EMPushConfig` builder | 明确 | 一致 | 不一致 | TS 是 `ChatPushConfig` map；iOS 只使用 `deviceId` 写 APNs 证书名；Android 使用 `manufacturer` + `deviceId` 构造 push config。 |
| `enableDNSConfig` | `enableDnsConfig` | `getEnableDNSConfig()` / `enableDNSConfig` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `dnsUrl` | `dnsURL` | `getDnsUrl()` / `setDnsUrl` | 明确 | 不一致 | 一致 | TS 输出 key 是 `dnsUrl`；iOS `fromJsonObject` 读取 `dnsURL`，与 TS key 不一致；Android 读取 `dnsUrl`。 |
| `restServer` | `restServer` | `getRestServer()` / `setRestServer` | 明确 | 一致 | 一致 | 三端 string。 |
| `imServer` | `chatServer` | `getImServer()` / `setIMServer` | 明确 | 一致 | 一致 | 三端 string。 |
| `imPort` | `chatPort` | `getImPort()` / `setImPort` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `enableTLS` | `enableTLSConnection` | `isEnableTLSConnection()` / `setEnableTLSConnection` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `messagesReceiveCallbackIncludeSend` | `includeSendMessageInMessageListener` | `isIncludeSendMessageInMessageListener()` / `setIncludeSendMessageInMessageListener` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `regardImportMessagesAsRead` | `regardImportMessagesAsRead` | `regardImportedMsgAsRead()` / `setRegardImportedMsgAsRead` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `areaCode` | `area` | `getAreaCode()` / `setAreaCode` | 明确 | 一致 | enum，值域另文对齐 | 三端区域码。 |
| `enableEmptyConversation` | `loadEmptyConversations` | `isLoadEmptyConversations()` / `setLoadEmptyConversations` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `customDeviceName` | `customDeviceName` | `getCustomDeviceName()` / `setCustomDeviceName` | 明确 | 一致 | 一致 | 三端可选 string。 |
| `customOSType` | `customOSType` | `getCustomOSPlatform()` / `setCustomOSPlatform` | 明确 | 一致 | 一致 | 三端可选 number/int。 |
| `useReplacedMessageContents` | `useReplacedMessageContents` | `isUseReplacedMessageContents()` / `setUseReplacedMessageContents` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `loginExtraInfo` | `loginExtensionInfo` | `getLoginCustomExt()` / `setLoginCustomExt` | 明确 | 一致 | 一致 | 三端可选 string。 |
| `workPathCopiable` | `workPathCopiable` | 无字段 | 明确 | 不一致 | 一致 | iOS 特有，Android 无对应字段。 |
| `uikitVersion` | `uiKitVersion` 未被 wrapper 转换 | `getUIKitVersion()` / `setUIKitVersion` | 明确 | 不一致 | 一致 | iOS/Android native 都有字段；iOS wrapper 未读写该 TS 字段，Android wrapper 双向转换。 |
| `webSocketServer` | `webSocketServer` | `getWebSocketServer()` / `setWebSocketServer` | 明确 | 一致 | 一致 | 三端可选 string。 |
| `webSocketPort` | `webSocketPort` | `getWebSocketPort()` / `setWebSocketPort` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `dohVendor` | `dohVendor` | `getDohVendor()` / `setDohVendor` | 明确 | 不一致 | 一致 | TS 缺省 `1`；Android native 缺省 `-1`，iOS wrapper 缺失时按 `0` 写入。 |

### 3.17 `ChatRoom`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `roomId` | `chatroomId` 输出 `roomId` | `getId()` 输出 `roomId` | 明确 | 一致 | 一致 | 三端聊天室 ID。 |
| `roomName` | `subject` 输出 `roomName` | `getName()` 输出 `roomName` | 明确 | 一致 | 一致 | 三端可选/可为空 string。 |
| `description` | `description` | `getDescription()` | 明确 | 一致 | 一致 | 三端可选/可为空 string。 |
| `owner` | `owner` | `getOwner()` | 明确 | 不一致 | 一致 | TS 必填；native 字段可为空字符串引用。 |
| `announcement` | `announcement` | `getAnnouncement()` | 明确 | 一致 | 一致 | 三端可选/可为空 string。 |
| `memberCount` | `occupantsCount` | `getMemberCount()` | 明确 | 一致 | 不一致 | TS 是可选 `string`；iOS/Android 是整数。 |
| `maxUsers` | `maxOccupantsCount` | `getMaxUsers()` | 明确 | 一致 | 不一致 | TS 是可选 `string`；iOS/Android 是整数。 |
| `adminList` | `adminList` | `getAdminList()` | 明确 | 一致 | 一致 | 三端可选 string array。 |
| `memberList` | `memberList` | `getMemberList()` | 明确 | 一致 | 一致 | 三端可选 string array。 |
| `blockList` | `blacklist` | `getBlacklist()` | 明确 | 一致 | 一致 | 三端可选 string array。 |
| `muteList` | `muteList` | `getMuteList()` keys | 明确 | 一致 | 一致 | TS deprecated array；Android 从 map key 派生 array。 |
| `muteKVList` | `muteList` with expire time | `getMuteList()` | 明确 | 一致 | 一致 | 三端为 userId 到过期时间的 map。 |
| `isAllMemberMuted` | `isMuteAllMembers` | `isAllMemberMuted()` | 明确 | 一致 | 一致 | 三端可选 boolean。 |
| `isInWhitelist` | `isInWhitelist` | `isInWhitelist()` | 明确 | 一致 | 一致 | 三端可选 boolean。 |
| `createTimestamp` | `createTimestamp` | `getCreateTimestamp()` | 明确 | 一致 | 一致 | 三端可选 number/long。 |
| `muteExpireTimestamp` | `muteExpireTimestamp` | `getMuteExpireTimestamp()` | 明确 | 一致 | 一致 | 三端可选 number/long。 |
| `permissionType` | `permissionType` | `getChatRoomPermissionType()` | 明确 | 一致 | enum，值域另文对齐 | 三端都有聊天室权限类型。 |

### 3.18 `ChatConversation`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `convId` | `conversationId` 输出 `convId` | `conversationId()` 输出 `convId` | 明确 | 一致 | 一致 | 三端会话 ID。 |
| `convType` | `type` 输出 `convType` | `getType()` 输出 `convType` | 明确 | 一致 | enum，值域另文对齐 | 三端会话类型。 |
| `isChatThread` | `isChatThread` | `isChatThread()` | 明确 | 一致 | 一致 | TS 默认 `false`；native boolean。 |
| `ext` | `ext` | `getExtField()` 转 map 输出 `ext` | 明确 | 一致 | 不一致 | TS `any?`；iOS `NSDictionary`；Android ext 是 JSON string，wrapper 转 map。 |
| `isPinned` | `isPinned` | `isPinned()` | 明确 | 一致 | 一致 | TS 可选并默认 `false`；native boolean。 |
| `pinnedTime` | `pinnedTime` | `getPinnedTime()` | 明确 | 一致 | 一致 | TS 可选并默认 `0`；native long/int64。 |
| `marks` | `marks` | `marks()` | 明确 | 一致 | enum array，值域另文对齐 | Android wrapper 仅 `marks() != null` 时输出。 |
| `remindType` | `disturbType` 输出 `remindType` | `pushRemindType()` 输出 `remindType` | 明确 | 不一致 | enum，值域另文对齐 | TS 可选但 constructor 默认 `ALL`；native 字段总是输出提醒类型。 |

### 3.19 `ChatConversationFetchOptions`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `pageSize` | `pageSize` | `getPageSize()` / `setPageSize` | 明确 | 一致 | 一致 | 三端可选 number/int；默认工厂方法会填 20。 |
| `cursor` | wrapper helper `getCursor` | wrapper helper `cursor` | 明确 | 一致 | 一致 | native `EMConversationFilter` 本体没有 cursor 属性，RN wrapper 在 filter 外单独读取。 |
| `pinned` | wrapper helper `getPinned` | wrapper helper `pinned` | 明确 | 一致 | 一致 | native `EMConversationFilter` 本体没有 pinned 属性，RN wrapper 在 filter 外单独读取。 |
| `mark` | `mark` | `getMark()` / `setMark` | 明确 | 一致 | enum，值域另文对齐 | 三端会话标记类型。 |

### 3.20 `ChatGroup`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `groupId` | `groupId` | `getGroupId()` | 明确 | 一致 | 一致 | 三端群组 ID。 |
| `groupName` | `groupName` | `getGroupName()` | 明确 | 不一致 | 一致 | TS 必填并默认 `''`；native 可为空字符串引用。 |
| `groupAvatar` | `groupAvatar` | `getGroupAvatar()` | 明确 | 不一致 | 一致 | TS 必填并默认 `''`；native 可为空字符串引用。 |
| `description` | `description` | `getDescription()` | 明确 | 不一致 | 一致 | TS 必填并默认 `''`；native 可为空字符串引用。 |
| `owner` | `owner` | `getOwner()` | 明确 | 不一致 | 一致 | TS 必填并默认 `''`；native 可为空字符串引用。 |
| `announcement` | `announcement` | `getAnnouncement()` | 明确 | 不一致 | 一致 | TS 必填并默认 `''`；native 可为空字符串引用。 |
| `memberCount` | `occupantsCount` | `getMemberCount()` | 明确 | 一致 | 一致 | TS number 默认 `0`；native int。 |
| `memberList` | `memberList` | `getMembers()` | 明确 | 不一致 | 一致 | TS 必填并默认 `[]`；native list 可为空。 |
| `adminList` | `adminList` | `getAdminList()` | 明确 | 不一致 | 一致 | TS 必填并默认 `[]`；native list 可为空。 |
| `blockList` | `blacklist` | `getBlackList()` | 明确 | 不一致 | 一致 | TS 必填并默认 `[]`；native list 可为空。 |
| `muteList` | `muteList` | `getMuteList()` | 明确 | 不一致 | 一致 | TS 必填并默认 `[]`；native list 可为空。 |
| `messageBlocked` | `isBlocked` | `isMsgBlocked()` | 明确 | 一致 | 一致 | TS boolean 默认 `false`；native boolean。 |
| `isAllMemberMuted` | `isMuteAllMembers` | `isAllMemberMuted()` | 明确 | 一致 | 一致 | TS boolean 默认 `false`；native boolean。 |
| `permissionType` | `permissionType` | `getGroupPermissionType()` | 明确 | 一致 | enum，值域另文对齐 | 三端群权限类型。 |
| `options` | `settings` 输出 `options` | group option map 输出 `options` | 明确 | 一致 | 一致 | TS 可选；native settings/options 可为空。 |
| `maxCount` getter | `settings.maxUsers` | `getMaxUserCount()` | 明确 | 一致 | 一致 | TS 派生字段，不是独立输入字段。 |

### 3.21 `ChatGroupOptions`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `style` | `style` | `style` | 明确 | 不一致 | enum，值域另文对齐 | TS constructor 用 truthy 判断，输入 `0` 会被改成默认 `PublicJoinNeedApproval`；native 可以表达 style `0`。 |
| `maxCount` | `maxUsers` | `maxUsers` | 明确 | 一致 | 一致 | TS number 默认 `200`；native int。 |
| `inviteNeedConfirm` | `IsInviteNeedConfirm` | `inviteNeedConfirm` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `ext` | `ext` | `extField` | 明确 | 一致 | 一致 | 三端可选 string。 |
| `isDisabled` | `EMGroup.isDisabled` 输出在 group `options` | `EMGroup.isDisabled()` 输出在 group `options` | 明确 | 不一致 | 一致 | `EMGroupOptions` 创建对象本体没有该字段；只在 `EMGroup.options` 输出中出现。 |

### 3.22 `ChatGroupSharedFile`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `fileId` | `fileId` | `getFileId()` | 明确 | 一致 | 一致 | 三端 string。 |
| `name` | `fileName` 输出 `name` | `getFileName()` 输出 `name` | 明确 | 一致 | 一致 | 三端 string。 |
| `owner` | `fileOwner` 输出 `owner` | `getFileOwner()` 输出 `owner` | 明确 | 一致 | 一致 | 三端 string。 |
| `createTime` | `createdAt` | `getFileUpdateTime()` | 明确 | 一致 | 一致 | 三端 number/long。 |
| `fileSize` | `fileSize` | `getFileSize()` | 明确 | 一致 | 一致 | 三端 number/long。 |

### 3.23 `ChatGroupMessageAck`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `msg_id` | `messageId` 输出 `msg_id` | `getMsgId()` 输出 `msg_id` | 明确 | 一致 | 一致 | 三端 string。 |
| `ack_id` | `readAckId` 输出 `ack_id` | `getAckId()` 输出 `ack_id` | 明确 | 一致 | 一致 | 三端 string。 |
| `from` | `from` | `getFrom()` | 明确 | 一致 | 一致 | 三端 string。 |
| `count` | `readCount` 输出 `count` | `getCount()` 输出 `count` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `timestamp` | `timestamp` | `getTimestamp()` | 明确 | 一致 | 一致 | 三端 number/long。 |
| `content` | `content` | `getContent()` | 明确 | 一致 | 一致 | 三端可选 string；TS constructor 当前从 `ext.content` 读取，native 输出 key 是 `content`。 |

### 3.24 `ChatGroupInfo`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `groupId` | 无对应对象 | `getGroupId()` | 明确 | 不一致 | 一致 | 映射表已确认 iOS 没有对应对象；Android 与 TS 一致。 |
| `groupName` | 无对应对象 | `getGroupName()` | 明确 | 不一致 | 一致 | 映射表已确认 iOS 没有对应对象；Android 与 TS 一致。 |

### 3.25 `ChatGroupMember`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `memberId` | `userId` 输出 `memberId` | `getMemberId()` 输出 `memberId` | 明确 | 一致 | 一致 | 三端 string。 |
| `joinedTimestamp` | `joinedTimestamp` | `getJoinTime()` 输出 `joinedTimestamp` | 明确 | 一致 | 一致 | 三端 number/long。 |
| `role` | `role` | `getRole()` | 明确 | 一致 | enum，值域另文对齐 | 三端群权限类型。 |

### 3.26 `ChatMessage`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `msgId` | `messageId` 输出 `msgId` | `getMsgId()` 输出 `msgId` | 明确 | 一致 | 一致 | TS 缺省生成本地 ID；native messageId string。 |
| `localMsgId` | 无输出字段 | 无输出字段 | 明确无对应 | 不一致 | 不一致 | TS constructor 忽略 `params.localMsgId`，总是用 `localTime.toString()`；native wrapper 不输出该字段。 |
| `conversationId` | `conversationId` | `conversationId()` | 明确 | 不一致 | 一致 | TS 必填属性并默认 `''`；native 可为空字符串引用。Android `fromJson` 不直接设置 `conversationId`。 |
| `from` | `from` | `getFrom()` / `setFrom` | 明确 | 不一致 | 一致 | TS 必填属性并默认 `''`；native 可为空字符串引用，iOS 缺失时用当前用户。 |
| `to` | `to` | `getTo()` / `setTo` | 明确 | 不一致 | 一致 | TS 必填属性并默认 `''`；native 可为空字符串引用。 |
| `localTime` | `localTime` | `localTime()` / `setLocalTime` | 明确 | 一致 | 一致 | 三端 number/long。 |
| `serverTime` | `timestamp` 输出 `serverTime` | `getMsgTime()` 输出 `serverTime` | 明确 | 一致 | 一致 | 三端 number/long。 |
| `hasDeliverAck` | `isDeliverAcked` | `isDelivered()` | 明确 | 一致 | 一致 | 三端 boolean。Android `fromJson` 注释未设置 delivered。 |
| `hasReadAck` | `isReadAcked` | `isAcked()` / `setAcked` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `needGroupAck` | `isNeedGroupAck` | `isNeedGroupAck()` / `setIsNeedGroupAck` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `groupAckCount` | `groupAckCount` | `groupAckCount()` / `setGroupAckCount` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `hasRead` | `isRead` | `!isUnread()` / `setUnread` | 明确 | 一致 | 一致 | 三端 boolean，Android 语义取反输出。 |
| `chatType` | `chatType` | `getChatType()` / `setChatType` | 明确 | 一致 | enum，值域另文对齐 | 三端消息会话类型。 |
| `direction` | `direction` | `direct()` / `setDirection` | 明确 | 一致 | enum/string，值域另文对齐 | TS 使用 `'send'` / `'rec'` 字符串，wrapper 三端按字符串转换。 |
| `status` | `status` | `status()` / `setStatus` | 明确 | 一致 | enum，值域另文对齐 | 三端消息状态。 |
| `attributes` | `ext` 输出 `attributes` | `ext()` 输出 `attributes` | 明确 | 不一致 | 不一致 | TS `Record<string, any>` 并默认 `{}`；iOS 输出空 map；Android 仅 ext 非空时输出，且属性值类型受 native 支持限制。 |
| `body` | `body` | `getBody()` | 明确 | 一致 | 一致 | 具体 body 字段见 3.1-3.9。 |
| `isChatThread` | `isChatThreadMessage` | `isChatThreadMessage()` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `isOnline` | `onlineState` | `isOnlineState()` | 明确 | 一致 | 一致 | TS 默认 `true`；native boolean。 |
| `priority` | `priority` | `setPriority` 输入、无输出字段 | 明确 | 不一致 | enum，值域另文对齐 | TS 私有可设置；iOS 输入/输出都有；Android 输入可设置但输出注释未写出。 |
| `deliverOnlineOnly` | `deliverOnlineOnly` | `isDeliverOnlineOnly()` / `deliverOnlineOnly` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `receiverList` | `receiverList` | `receiverList()` / `setReceiverList` | 明确 | 不一致 | 一致 | TS 可选；iOS 输出字段可为 nil；Android 仅 list 非空时输出，空列表和未设置被合并。 |
| `isBroadcast` | `broadcast` | `isBroadcast()` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `isContentReplaced` | `isContentReplaced` | `isContentReplaced()` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `streamChunk` | `streamChunk` | `getStreamChunk()` | 明确 | 一致 | 一致 | 三端可选 `ChatStreamChunk` / `EMStreamChunk`。 |

### 3.27 `ChatMessageReaction`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `reaction` | `reaction` | `getReaction()` | 明确 | 一致 | 一致 | 三端 string。 |
| `count` | `count` | `getUserCount()` 输出 `count` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `isAddedBySelf` | `isAddedBySelf` | `isAddedBySelf()` | 明确 | 一致 | 一致 | 三端 boolean。 |
| `userList` | `userList` | `getUserList()` | 明确 | 一致 | 一致 | 三端 string array。 |

### 3.28 `ChatReactionOperation`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `userId` | `userId` | `getUserId()` | 明确 | 一致 | 一致 | 三端 string。 |
| `reaction` | `reaction` | `getReaction()` | 明确 | 一致 | 一致 | 三端 string。 |
| `operate` | `operate` | `getOperation().ordinal()` | 明确 | 一致 | enum，值域另文对齐 | 三端 reaction 操作类型。 |

### 3.29 `ChatMessageThread`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `threadId` | `threadId` | `getChatThreadId()` | 明确 | 一致 | 一致 | 三端 string。 |
| `threadName` | `threadName` | `getChatThreadName()` | 明确 | 不一致 | 一致 | TS 必填；Android wrapper 仅非 null 时输出；iOS 字段可为空字符串引用。 |
| `owner` | `owner` | `getOwner()` | 明确 | 一致 | 一致 | 三端 string。 |
| `msgId` | `messageId` 输出 `msgId` | `getMessageId()` 输出 `msgId` | 明确 | 一致 | 一致 | 三端父消息 ID。 |
| `parentId` | `parentId` | `getParentId()` | 明确 | 一致 | 一致 | 三端群组 ID。 |
| `memberCount` | `membersCount` | `getMemberCount()` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `msgCount` | `messageCount` | `getMessageCount()` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `createAt` | `createAt` | `getCreateAt()` | 明确 | 一致 | 一致 | 三端 number/long。 |
| `lastMessage` | `lastMessage` | `getLastMessage()` | 明确 | 一致 | 一致 | 三端可选消息对象。 |

### 3.30 `ChatMessageThreadEvent`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `from` | `from` | `getFrom()` | 明确 | 一致 | 一致 | 三端 string。 |
| `type` | `type` | `getType()` | 明确 | 一致 | enum，值域另文对齐 | TS enum 有 `User_Removed`，但 `ChatMessageThreadOperationFromNumber` 未处理值 `5`。 |
| `thread` | `chatThread` 输出 `thread` | `getChatThread()` 输出 `thread` | 明确 | 不一致 | 一致 | TS 必填并直接 `new ChatMessageThread(params.thread)`；Android wrapper 仅非 null 输出。 |

### 3.31 `ChatSilentModeTime`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `hour` | `hours` 输出 `hour` | `getHour()` 输出 `hour` | 明确 | 一致 | 一致 | 三端 number/int，TS 默认 `0`。 |
| `minute` | `minutes` 输出 `minute` | `getMinute()` 输出 `minute` | 明确 | 一致 | 一致 | 三端 number/int，TS 默认 `0`。 |

### 3.32 `ChatSilentModeParam`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `paramType` | `paramType` | `getParamType()` / constructor type | 明确 | 一致 | enum，值域另文对齐 | 三端参数类型。 |
| `remindType` | `remindType` | `getRemindType()` / `setRemindType` | 明确 | 一致 | enum，值域另文对齐 | 三端可选提醒类型。 |
| `startTime` | `silentModeStartTime` | `getSilentModeStartTime()` | 明确 | 一致 | 一致 | 三端可选 `SilentModeTime`。 |
| `endTime` | `silentModeEndTime` | `getSilentModeEndTime()` | 明确 | 一致 | 一致 | 三端可选 `SilentModeTime`。 |
| `duration` | `silentModeDuration` | `getSilentModeDuration()` | 明确 | 一致 | 一致 | 三端可选 number/int。 |

### 3.33 `ChatSilentModeResult`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `expireTimestamp` | `expireTimestamp` | `getExpireTimestamp()` | 明确 | 不一致 | 一致 | TS 可选；iOS 总是输出；Android 仅非 0 时输出。 |
| `conversationType` | `conversationType` | `getConversationType()` | 明确 | 不一致 | enum，值域另文对齐 | TS 必填；Android 仅非 null 时输出。 |
| `conversationId` | `conversationID` 输出 `conversationId` | `getConversationId()` 输出 `conversationId` | 明确 | 不一致 | 一致 | TS 必填；Android 仅非 null 时输出。 |
| `remindType` | `remindType` | `getRemindType()` | 明确 | 一致 | enum，值域另文对齐 | 三端可选提醒类型。 |
| `startTime` | `silentModeStartTime` | `getSilentModeStartTime()` | 明确 | 一致 | 一致 | 三端可选 `SilentModeTime`。 |
| `endTime` | `silentModeEndTime` | `getSilentModeEndTime()` | 明确 | 一致 | 一致 | 三端可选 `SilentModeTime`。 |

### 3.34 `ChatPushOption`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `displayStyle` | `displayStyle` | `getDisplayStyle()` | 明确 | 一致 | enum，值域另文对齐 | 三端可选/可读取推送展示类型。 |
| `displayName` | `displayName` | `getDisplayNickname()` 输出 `displayName` | 明确 | 一致 | 一致 | 三端可选 string。 |

### 3.35 `ChatStreamChunk`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `status` | `status` | `getStatus()` | 明确 | 一致 | enum，值域另文对齐 | 三端流式消息片段状态。 |
| `errorCode` | `errorCode` | `getErrorCode()` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `finishReason` | `finishReason` | `getFinishReason()` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `text` | `text` | `getText()` | 明确 | 不一致 | 一致 | TS 必填；native string 可为空。 |
| `customType` | `customType` | `getCustomType()` | 明确 | 一致 | 一致 | 三端可选 string。 |

### 3.36 `ChatCursorResult<T>`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `cursor` | `cursor` | `getCursor()` | 明确 | 不一致 | 一致 | TS 必填 string；native cursor 可为空字符串引用。 |
| `list` | `list` | `getData()` 输出 `list` | 明确 | 一致 | 一致 | TS 可选并在 constructor 内默认成 `[]`；native list 可为空。 |

### 3.37 `ChatPageResult<T>`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `pageCount` | `count` | `getPageCount()` 输出 `count` | 明确 | 一致 | 一致 | native wrapper 输出 key `count`；TS manager 层创建 `ChatPageResult` 时映射为 `pageCount`。 |
| `list` | `list` | `getData()` 输出 `list` | 明确 | 一致 | 一致 | TS 可选并在 constructor 内默认成 `[]`；native list 可为空。 |

### 3.38 `ChatTranslateLanguage`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `code` | `languageCode` 输出 `code` | `LanguageCode` 输出 `code` | 明确 | 一致 | 一致 | 三端 string。 |
| `name` | `languageName` 输出 `name` | `LanguageName` 输出 `name` | 明确 | 一致 | 一致 | 三端 string。 |
| `nativeName` | `languageNativeName` 输出 `nativeName` | `LanguageLocalName` 输出 `nativeName` | 明确 | 一致 | 一致 | 三端 string。 |

### 3.39 `ChatDeviceInfo`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `resource` | `resource` | `getResource()` | 明确 | 不一致 | 一致 | TS 必填；iOS nullable；Android getter string 可为空。 |
| `deviceUUID` | `deviceUUID` | `getDeviceUUID()` | 明确 | 不一致 | 一致 | TS 必填；iOS nullable；Android getter string 可为空。 |
| `deviceName` | `deviceName` | `getDeviceName()` | 明确 | 不一致 | 一致 | TS 必填；iOS nullable；Android getter string 可为空。 |

### 3.40 `ChatPresence`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `publisher` | `publisher` | `getPublisher()` | 明确 | 一致 | 一致 | 三端 string。 |
| `statusDescription` | `statusDescription` | `getExt()` 输出 `statusDescription` | 明确 | 不一致 | 一致 | TS 必填；iOS nullable；Android ext string 可为空。 |
| `lastTime` | `lastTime` | `getLatestTime()` 输出 `lastTime` | 明确 | 一致 | 不一致 | TS 是 string；iOS/Android 是整数时间戳。 |
| `expiryTime` | `expirytime` 输出 `expiryTime` | `getExpiryTime()` 输出 `expiryTime` | 明确 | 一致 | 不一致 | TS 是 string；iOS/Android 是整数时间戳。 |
| `statusDetails` | `statusDetails` array 转 map | `getStatusList()` | 明确 | 一致 | 一致 | TS `Map<string, number>`；wrapper 输出 `Record<string, number>` 后 TS constructor 转 Map。 |

### 3.41 `ChatRTCTokenInfo`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `rtcToken` | completion 参数 `aToken` 输出 `rtcToken` | `getRtcToken()` 输出 `rtcToken` | 明确 | 一致 | 一致 | iOS 无独立 native model，但 wrapper 输出字段与 TS 一致。 |
| `expireTimeStamp` | completion 参数 `expiredTs` 输出 `expireTimeStamp` | `getExpireTimeStamp()` 输出 `expireTimeStamp` | 明确 | 一致 | 一致 | 三端 number/long。 |
| `uid` | completion 参数 `rtcUId` 输出 `uid` | `getUid()` 输出 `uid` | 明确 | 一致 | 一致 | 三端 number/int。 |

### 3.42 `ChatError` / `ChatException`

| TS 字段 | iOS 字段 | Android 字段 | 字段对应 | 可选性结论 | 类型结论 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `code` | `code` | `code` | 明确 | 一致 | 一致 | 三端 number/int。 |
| `description` | `errorDescription` 输出 `description` | `description` | 明确 | 一致 | 一致 | 三端 string。Android JSON exception helper 还会输出 `message`，TS class 没有该字段。 |

## 4. 已明确不一致项

以下不是待确认项，已经可以从源码判定为不一致：

| 对象 | 字段 | 不一致类型 | 结论 |
| --- | --- | --- | --- |
| 文件消息体公共字段 | `secret` / `remotePath` / `displayName` | 可选性 | TS 必填属性并默认 `''`，native 可为空。 |
| `ChatImageMessageBody` | `sendOriginalImage` | 可选性 | TS/default 和 native wrapper 都会把缺失合并为 `false`，不能区分未设置和 false。 |
| `ChatImageMessageBody` | `thumbnailLocalPath` / `thumbnailRemotePath` / `thumbnailSecret` | 可选性 | TS 必填属性，native 可为空。 |
| `ChatImageMessageBody` | `isGif` | 可选性 | TS 声明可选，但 constructor 实际默认写入 `false`。 |
| `ChatVideoMessageBody` | `thumbnailLocalPath` / `thumbnailRemotePath` / `thumbnailSecret` | 可选性 | TS 必填属性并默认 `''`，native 可为空。 |
| `ChatTextMessageBody` | `translations` | 类型 | TS `any` 过宽，native 是 string-string 翻译结构。 |
| `ChatLocationMessageBody` | `address` | 可选性 | TS 必填，native 可为空。 |
| `ChatLocationMessageBody` | `latitude` / `longitude` | 类型 | TS 是 `string`，native 是 `double`。 |
| `ChatCombineMessageBody` | `messageIdList` | 可选性 | TS 可选，native 创建合并消息要求非空列表。 |
| `ChatFetchMessageOptions` | `startTs` / `endTs` / `direction` / `needSave` | 可选性 | TS 必填，native 有默认值语义。 |
| `ChatUserInfo` | `userId` | 可选性 | TS 必填，native userId 可为空。 |
| `ChatContact` | `remark` | 可选性 | TS 必填，native 可为空。 |
| `ChatRecalledMessageInfo` | `recalledConvId` | 可选性 | TS 可选，iOS nonnull，Android 可为空。 |
| `ChatOptions` | `debugModel` | 可选性 | TS/iOS 有字段；Android wrapper 不读取也不输出。 |
| `ChatOptions` | `logTag` / `logTimestamp` | 字段缺失 | TS 有字段；iOS/Android native options 无对应字段。 |
| `ChatOptions` | `pushConfig` | 类型 | TS 是 map；iOS 只使用 `deviceId` 写 APNs 证书名；Android 用 `manufacturer` 和 `deviceId` 构造 push config。 |
| `ChatOptions` | `dnsUrl` | 字段名 | TS/Android 使用 `dnsUrl`；iOS `fromJsonObject` 读取 `dnsURL`。 |
| `ChatOptions` | `workPathCopiable` | 字段缺失 | iOS 特有，Android 无对应字段。 |
| `ChatOptions` | `uikitVersion` | 可选性 | iOS/Android native 都有字段；iOS wrapper 未读写该 TS 字段，Android wrapper 双向转换。 |
| `ChatOptions` | `dohVendor` | 默认值 | TS 缺省 `1`；Android native 缺省 `-1`；iOS 缺失时按 `0` 写入。 |
| `ChatRoom` | `owner` | 可选性 | TS 必填；native 可为空字符串引用。 |
| `ChatRoom` | `memberCount` / `maxUsers` | 类型 | TS 是可选 `string`；native 是整数。 |
| `ChatConversation` | `ext` | 类型 | TS `any?`；iOS 是 dictionary；Android ext 是 JSON string 并由 wrapper 转 map。 |
| `ChatConversation` | `remindType` | 可选性 | TS 声明可选但 constructor 默认 `ALL`；native 总是输出提醒类型。 |
| `ChatGroup` | `groupName` / `groupAvatar` / `description` / `owner` / `announcement` | 可选性 | TS 必填并默认 `''`；native 可为空字符串引用。 |
| `ChatGroup` | `memberList` / `adminList` / `blockList` / `muteList` | 可选性 | TS 必填并默认 `[]`；native list 可为空。 |
| `ChatGroupOptions` | `style` | 可选性 | TS constructor 用 truthy 判断，输入 `0` 会被改成默认值；native 可以表达 style `0`。 |
| `ChatGroupOptions` | `isDisabled` | 字段归属 | `EMGroupOptions` 创建对象本体没有该字段；只在 `EMGroup.options` 输出中出现。 |
| `ChatGroupInfo` | `groupId` / `groupName` | 平台缺失 | iOS 没有对应对象；Android 与 TS 一致。 |
| `ChatGroupMessageAck` | `content` | 字段名 | native 输出 key 是 `content`；TS constructor 当前从 `ext.content` 读取。 |
| `ChatMessage` | `localMsgId` | 字段缺失 | TS 有字段但 native wrapper 不输出；TS constructor 也忽略 `params.localMsgId`。 |
| `ChatMessage` | `conversationId` / `from` / `to` | 可选性 | TS 必填并默认 `''`；native 可为空字符串引用。 |
| `ChatMessage` | `attributes` | 可选性/类型 | TS 默认 `{}` 且类型为 `any` map；iOS 输出空 map；Android 仅 ext 非空时输出。 |
| `ChatMessage` | `priority` | 可选性 | TS/iOS 支持输入输出；Android 支持输入但 wrapper 输出注释未写出。 |
| `ChatMessage` | `receiverList` | 可选性 | TS 可选；Android 仅非空 list 输出，空列表和未设置被合并。 |
| `ChatMessageThread` | `threadName` | 可选性 | TS 必填；Android wrapper 仅非 null 时输出；iOS 字段可为空字符串引用。 |
| `ChatMessageThreadEvent` | `thread` | 可选性 | TS 必填；Android wrapper 仅非 null 时输出。 |
| `ChatMessageThreadEvent` | `type` | 转换方法 | TS enum 有 `User_Removed`，但 `ChatMessageThreadOperationFromNumber` 未处理值 `5`。 |
| `ChatSilentModeResult` | `expireTimestamp` / `conversationType` / `conversationId` | 可选性 | TS 中 conversation 字段必填；Android wrapper 仅非 null/非 0 时输出；iOS 总是输出。 |
| `ChatStreamChunk` | `text` | 可选性 | TS 必填；native string 可为空。 |
| `ChatCursorResult<T>` | `cursor` | 可选性 | TS 必填；native cursor 可为空字符串引用。 |
| `ChatDeviceInfo` | `resource` / `deviceUUID` / `deviceName` | 可选性 | TS 必填；iOS nullable；Android getter string 可为空。 |
| `ChatPresence` | `statusDescription` | 可选性 | TS 必填；iOS nullable；Android ext string 可为空。 |
| `ChatPresence` | `lastTime` / `expiryTime` | 类型 | TS 是 string；iOS/Android 是整数时间戳。 |

## 5. 字段对应关系待确认

当前已整理对象中没有字段对应关系待确认项。

后续如果出现无法判断是否为同一属性的字段，只放在这里；可选性和类型不进入待确认。

## 6. 待继续对象

当前映射表内 class 已完成第一轮字段级对齐。

后续工作：

- 枚举值和值转换方法另文对齐。
- 自动化脚本应以本文档和 `docs/three-platform-data-object-mapping.md` 为输入；测试失败时打印对象、字段、TS/iOS/Android 的类型和可选性差异。
