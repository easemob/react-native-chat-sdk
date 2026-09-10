# 01 - 公开 API Diff：native 4.24.1 → 4.25.0（React Native 平版）

- 源仓库 iOS：`/Users/asterisk/Codes/zuoyu_native/emclient-ios`，`refs/tags/4.24.1..refs/tags/4.25.0`
- 源仓库 Android：`/Users/asterisk/Codes/zuoyu_native/emclient-android`，`refs/tags/SDK_4.24.1..refs/tags/SDK_4.25.0`
- diff 范围：iOS `newSDK/HyphenateSDK/` 公开头文件（排除 `*+Internal.h`）；Android `hyphenatechatsdk/src/com/hyphenate/` 公开类（`adapter/`、`core/` 除外）
- 版本区间核对：`git tag` 列表中 4.24.1 → 4.25.0 之间无中间小版本 tag，单跳覆盖，无跳版
- 目标平台：react-native（`react-native-chat-sdk`，worktree `.worktree/1.21.0`，分支 `1.21.0` 基于 `dev`）

## iOS 变更清单

| id | 类型 | 领域 | iOS 源签名 | 决策 | 状态 |
|---|---|---|---|---|---|
| `chat_get_conversations_from_db_with_cursor` | new_api | conversation | `IEMChatManager.h`：`- (void)getConversationsFromDBWithCursor:(nullable NSString *)cursor pageSize:(NSInteger)pageSize completion:(void (^)(EMCursorResult<EMConversation *> * _Nullable result, EMError * _Nullable error))completionBlock` | include | pending |
| `options_enable_chatroom_conversation` | new_option | client | `EMOptions.h`：`@property(nonatomic) BOOL enableChatroomConversation;`（默认 NO） | include | pending |
| `options_use_agora_chat_domain` | new_option | client | `EMOptions.h`：`@property (nonatomic) BOOL useAgoraChatDomain;`（裸属性，无文档注释） | **skip**（KI-107：native 对内品牌开关，不面向终端用户；Flutter 4.25.0 平版评审已确认不移植） | implemented（无代码） |
| `options_sync_data_ws_removed` | removed | client | `EMOptions+PrivateDeploy.h`：删除 `syncDataWSHost` / `syncDataWSPort` 两个私有部署属性 | skip（RN 从未暴露，全仓 grep `syncData` 无匹配，无操作） | implemented（无代码） |
| `userinfo_fetch_subscribed_gender_fix` | bugfix | userinfo | `EMUserInfoManager.mm`：`fetchSubscribedUsers` 补 `gender` 赋值并修复漏 `addObject` | skip（实现层 bugfix，非公开 API 变更；RN 侧 `ChatUserInfo` 已有 `gender` 字段，反序列化不受影响） | implemented（无代码） |
| `client_token_corrected_time` | internal | client | `EMClient.mm`：token 过期计算改用 `getCorrectedTimestampMs`（NTP 校正时间） | skip（内部实现） | implemented（无代码） |

## Android 变更清单

| id | 类型 | 领域 | Android 源签名 | 决策 | 状态 |
|---|---|---|---|---|---|
| `chat_async_get_conversations_from_db` | new_api | conversation | `EMChatManager.java`：`public void asyncGetConversationsFromDB(final String cursor, final int pageSize, final EMValueCallBack<EMCursorResult<EMConversation>> callback)` | include（与 iOS `chat_get_conversations_from_db_with_cursor` 同一条） | pending |
| `options_enable_chatroom_conversation` | new_option | client | `EMOptions.java`：`setEnableChatroomConversation(boolean)` / `isEnableChatroomConversation()`（默认 false） | include | pending |
| `options_use_agora_chat_domain` | new_option | client | `EMOptions.java`：`setUseAgoraChatDomain(boolean)` / `getUseAgoraChatDomain()` / `@hide isUseAgoraChatDomainConfigured()`（`Boolean` 三态） | **skip**（KI-107，同上） | implemented（无代码） |
| `options_sync_data_ws_removed` | removed | client | `EMOptions.java`：删除 `setSyncDataWebSocketServer` / `getSyncDataWebSocketServer` / `setSyncDataWebSocketPort` / `getSyncDataWebSocketPort` 及私有字段 | skip（RN 从未暴露，无操作） | implemented（无代码） |
| `search_keyword_limit_doc` | doc_only | chat | `EMMessageSearchOption.setKeywordList` 注释：关键词长度上限 512→120、总长 1024→120 | skip（仅注释变化；RN `ChatMessageSearchOption.ts` 注释未写长度上限，无操作） | implemented（无代码） |
| `client_token_corrected_time` | internal | client | `EMClient.java` / `EMSessionManager.java`：token 过期计算改用 `getCorrectedTimestampMs` | skip（内部实现） | implemented（无代码） |
| `cloud_timeout_unit_fix` | internal | cloud | `HttpClientConfig.getTimeout` 秒→毫秒换算内移 | skip（内部实现，`cloud/` 非公开 diff 范围，仅顺带确认无公开签名变化） | implemented（无代码） |

## 未匹配清单

| id | 疑点 | 处理 |
|---|---|---|
| UM-1 | `useAgoraChatDomain` 双端形态不一致（iOS 裸 `BOOL` 无文档 vs Android `Boolean` 三态 + `@hide`） | **已闭环**：KI-107 / Flutter 4.25.0 平版评审确认——native 对内品牌开关，跨平台 SDK 不暴露（国内 easemob 不设置走缺省，海外 agora 侧内部固定 true）。RN 侧零代码。 |
| UM-2 | 新 API `getConversationsFromDBWithCursor` 的前置条件（iOS `EMOptions.autoLoadConversations=NO` / Android `setAutoLoadAllConversations(false)`）在 RN 基线无入口（`src/` 全仓 grep `autoLoad` 无匹配） | 沿用 Flutter 4.25.0 平版评审结论（UM-2 保留）：**衍生新增 `ChatOptions.autoLoadConversations`**（默认 true，与 native 一致），与新 API 一并平版；文档强调开启自动加载时分页加载失去意义。native 双端 4.24.1 基线已具备该选项，不构成对 4.25.0 新能力的额外依赖。 |
| UM-3 | Android `asyncGetConversationsFromDB` 结果过滤了 chatThread 会话（`conv.isChatThread()` 跳过），iOS 端实现未见对应过滤（diff 只到公开头文件，实现未读） | 记入验收报告，交用户确认是否需对齐；RN 平版照双端各自公开语义透传，不擅自抹平。 |

## 备注

- Flutter 4.25.0 平版（`/Users/asterisk/Codes/zuoyu_flutter/im_flutter_sdk/.worktree/4.25.0`，`docs/porting/4.25.0/`）已完成并评审闭环，本次 RN 平版沿用其全部评审结论（`useAgoraChatDomain` 不移植、`autoLoadConversations` 衍生新增保留、公开方法名 `fetchConversationsFromDB`）。
- 目标平台公开方法名沿用 Flutter 侧与 RN 既有命名习惯（如 `fetchPinnedConversationsFromServerWithCursor`）：TS 公开方法 `fetchConversationsFromDB`，方法名 key `getConversationsFromDBWithCursor`。
