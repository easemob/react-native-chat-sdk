# 三端数据对象映射表

- 日期：2026-05-25
- 范围：TypeScript `src/common`、iOS `modules/objc/dispatch/ExtSdkToJson.h` / `.m`、Android `modules/java/com/chatsdk/dispatch/ExtSdkHelper.java`
- 用途：为“三端数据类型对齐测试”提供对象级映射输入。

## 1. 说明

本文档先解决“哪些 TypeScript 数据对象需要和哪些 iOS/Android native 对象对齐”的问题。

对象映射以当前 RN wrapper 转换层为准，不直接以整个 native SDK 全量对象为准。后续字段级测试应基于本映射表解析字段、类型和可选性。

Native SDK 源码参考路径：

- iOS：`/Users/asterisk/Codes/easemob/emclient-ios`
- Android：`/Users/asterisk/Codes/easemob/emclient-android`

## 2. 对象映射表

| TypeScript | iOS | Android |
| --- | --- | --- |
| `ChatOptions` | `EMOptions` | `EMOptions` |
| `ChatPushConfig` | 无独立 native model | 无独立 native model |
| `ChatRTCTokenInfo` | 无独立 native model | `EMRTCTokenInfo` |
| `ChatError` / `ChatException` | `EMError` | `HyphenateException` / `JSONException` |
| `ChatContact` | `EMContact` | `EMContact` |
| `ChatUserInfo` | `EMUserInfo` | `EMUserInfo` |
| `ChatTranslateLanguage` | `EMTranslateLanguage` | `EMLanguage` |
| `ChatDeviceInfo` | `EMDeviceConfig` | `EMDeviceInfo` |
| `ChatPresence` | `EMPresence` | `EMPresence` |
| `ChatRoom` | `EMChatroom` | `EMChatRoom` |
| `ChatConversation` | `EMConversation` | `EMConversation` |
| `ChatConversationFetchOptions` | `EMConversationFilter` | `EMConversationFilter` |
| `ChatGroup` | `EMGroup` | `EMGroup` |
| `ChatGroupOptions` | `EMGroupOptions` | `EMGroupOptions` |
| `ChatGroupSharedFile` | `EMGroupSharedFile` | `EMMucSharedFile` |
| `ChatGroupMessageAck` | `EMGroupMessageAck` | `EMGroupReadAck` |
| `ChatGroupInfo` | 没有对应类型 | `EMGroupInfo` |
| `ChatGroupMember` | `EMGroupMemberInfo` | `EMGroupMemberInfo` |
| `ChatMessage` | `EMChatMessage` | `EMMessage` |
| `ChatMessageBody` | `EMMessageBody` | `EMMessageBody` |
| `ChatTextMessageBody` | `EMTextMessageBody` | `EMTextMessageBody` |
| `ChatLocationMessageBody` | `EMLocationMessageBody` | `EMLocationMessageBody` |
| `ChatFileMessageBody` | `EMFileMessageBody` | `EMNormalFileMessageBody` |
| `ChatImageMessageBody` | `EMImageMessageBody` | `EMImageMessageBody` |
| `ChatVideoMessageBody` | `EMVideoMessageBody` | `EMVideoMessageBody` |
| `ChatVoiceMessageBody` | `EMVoiceMessageBody` | `EMVoiceMessageBody` |
| `ChatCmdMessageBody` | `EMCmdMessageBody` | `EMCmdMessageBody` |
| `ChatCustomMessageBody` | `EMCustomMessageBody` | `EMCustomMessageBody` |
| `ChatCombineMessageBody` | `EMCombineMessageBody` | `EMCombineMessageBody` |
| `ChatMessagePinInfo` | `EMMessagePinInfo` | `EMMessagePinInfo` |
| `ChatFetchMessageOptions` | `EMFetchServerMessagesOption` | `EMFetchMessageOption` |
| `ChatRecalledMessageInfo` | `EMRecallMessageInfo` | `EMRecallMessageInfo` |
| `ChatMessageReaction` | `EMMessageReaction` | `EMMessageReaction` |
| `ChatReactionOperation` | `EMMessageReactionOperation` | `EMMessageReactionOperation` |
| `ChatMessageReactionEvent` | `EMMessageReactionChange` | `EMMessageReactionChange` |
| `ChatMessageThread` | `EMChatThread` | `EMChatThread` |
| `ChatMessageThreadEvent` | `EMChatThreadEvent` | `EMChatThreadEvent` |
| `ChatSilentModeTime` | `EMSilentModeTime` | `EMSilentModeTime` |
| `ChatSilentModeParam` | `EMSilentModeParam` | `EMSilentModeParam` |
| `ChatSilentModeResult` | `EMSilentModeResult` | `EMSilentModeResult` |
| `ChatPushOption` | `EMPushOptions` | `EMPushConfigs` |
| `ChatStreamChunk` | `EMStreamChunk` | `EMStreamChunk` |
| `ChatCursorResult<T>` | `EMCursorResult` | `EMCursorResult` |
| `ChatPageResult<T>` | `EMPageResult` | `EMPageResult` |

## 3. 映射说明

- `ChatPushConfig` 两端 wrapper 都直接读取 TS map 字段，没有独立 native SDK 数据模型。
- `ChatRTCTokenInfo` 在 Android 对应 `EMRTCTokenInfo`；iOS wrapper 直接从 completion 参数组装 map。
- `ChatError` / `ChatException` 在 Android wrapper 中对应多种错误来源，包括 `HyphenateException`、`JSONException` 和手动 `code` / `description` map。
- `ChatTranslateLanguage`、`ChatDeviceInfo`、`ChatRoom`、`ChatGroupSharedFile`、`ChatGroupMessageAck`、`ChatMessage`、`ChatFileMessageBody`、`ChatFetchMessageOptions`、`ChatPushOption` 存在 iOS/Android native 类名差异。
- `ChatCursorResult<T>` 和 `ChatPageResult<T>` 是泛型容器，元素类型需结合具体 API 判断。
- `ChatImageMessageBody` 的缩略图字段是后续字段级对齐重点。

## 4. 需人工确认

| TypeScript 对象 | 当前线索 | 需确认问题 |
| --- | --- | --- |
| `ChatGroupInfo` | Android 有 `EMGroupInfo`；iOS wrapper 未在 `ExtSdkToJson.h` / `.m` 中发现 `EMGroupInfo` 转换入口。 | 人工已确认：iOS 没有对应对象。 |
| `ChatRTCTokenInfo` | Android 有 `EMRTCTokenInfo`；iOS wrapper 直接从 completion 参数组装 map。 | 人工已确认：iOS 没有对应对象。 |
| `ChatPushConfig` | 两端 wrapper 都直接读取 TS map 字段。 | 人工已确认：iOS 和 android 都没有对应对象。不需要对比属性。 |

## 5. 暂不纳入对象映射

以下导出项不作为第一阶段三端数据对象映射目标：

- enum：例如 `ChatMessageType`、`ChatConversationType`、`ChatGroupStyle`、`ChatAreaCode`。它们应进入枚举/常量对齐范围，而不是对象字段映射范围。
- callback interface：例如 `ChatMessageStatusCallback`、`ChatGroupFileStatusCallback`。
- 工具或日志对象：例如 `ChatLog`、`PrintFunctionType`、`chatlog`。
- 只在 TS 层辅助构造或包装的类型，除非 wrapper 转换层存在明确 native 对象或字段 map。

## 6. 后续使用规则

- 三端数据类型对齐测试应先读取本文档中的映射表，再做字段级解析和断言。
- 测试不通过时必须打印具体对象、字段、三端类型和可选性差异。
- 不得为了通过测试而修改合理测试用例。
- 不得用 allowlist 掩盖真实问题；确需跳过时，必须在本文档中写明对象、字段和原因。
- 正式代码如何修改由维护者手动决策。
