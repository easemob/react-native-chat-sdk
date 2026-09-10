# 03 - 实现记录：React Native 1.21.0

实施方式：契约（02-contract.md）冻结后，三个实现 subagent 并行（TS 层 / Android wrapper+cpp / iOS wrapper），版本号与 CHANGELOG 由主 agent 统一收尾。subagent 与主 agent 使用同一模型（harness 同进程实例，满足同级别模型要求）。全程无 git add/commit。

## 变更清单状态

| id | 决策 | 状态 |
|---|---|---|
| `chat_get_conversations_from_db_with_cursor` / `chat_async_get_conversations_from_db` | include | implemented |
| `options_enable_chatroom_conversation` | include | implemented |
| `options_auto_load_conversations`（UM-2 衍生） | include | implemented |
| `options_use_agora_chat_domain` | skip（KI-107） | implemented（无代码，全仓 grep 零残留） |
| `options_sync_data_ws_removed` / `search_keyword_limit_doc` / `userinfo_fetch_subscribed_gender_fix` / `client_token_corrected_time` / `cloud_timeout_unit_fix` | skip（无 RN 操作） | implemented（无代码） |

## 改动明细

### TypeScript（subagent-1，`yarn typecheck` / `yarn lint` 通过）

- `src/__internal__/Consts.ts:120-121`：`MTgetConversationsFromDBWithCursor`（按 prettier 折行，与同文件长常量格式一致）。
- `src/ChatManager.ts`：:42 import；:3517-3556 新增 `fetchConversationsFromDB(cursor?, pageSize?)`，照 `fetchPinnedConversationsFromServerWithCursor` 模式；TypeDoc 含前置条件（`autoLoadConversations=false` 及原因）、排序规则、pageSize [1,100]、无效 cursor 抛 `ChatError`（INVALID_PARAM）。
- `src/common/ChatOptions.ts`：`enableChatroomConversation`（默认 false）与 `autoLoadConversations`（默认 true）各 5 处同步（声明 :281-296 / 构造 params :352-353 / 赋值 :407-409 / withAppId :452-453 / withAppKey :501-502）。
- `example/src/registry/apis/chat.ts:47-58`：ApiCall 注册表新增 `ChatManager.fetchConversationsFromDB` 条目。
- `example/src/auto/auto_mode.ts:198-199`：`CHAT_OPTIONS_KEYS` 追加 `'enableChatroomConversation'`、`'autoLoadConversations'`。

### Android wrapper + cpp（subagent-2）

- `modules/java/com/chatsdk/common/ExtSdkMethodType.java:107`：常量 `getConversationsFromDBWithCursor`。
- `modules/java/com/chatsdk/dispatch/ExtSdkDispatch.java:860-862`：case 分发。
- `modules/java/com/chatsdk/dispatch/ExtSdkChatManagerWrapper.java:1075-1092`：`getConversationsFromDBWithCursor`，调 `asyncGetConversationsFromDB(cursor, pageSize, callback)`（**参数顺序 (cursor, pageSize) 已经 native `SDK_4.25.0` 源码核实**，与 pinned API 相反）；`ExtSdkCursorResultHelper.toJson` 序列化。
- `modules/java/com/chatsdk/dispatch/ExtSdkHelper.java`：fromJson :373-375（`// 2026-09-10 4.25.0` 分组）+ toJson :422-423；setter/getter 名（`setEnableChatroomConversation`/`isEnableChatroomConversation`、`setAutoLoadAllConversations`/`isAutoLoadAllConversations`）已经 native 源码核实。
- `modules/cpp/common/ExtSdkMethodType.h:72` / `.cpp:66`：补常量（KI-105 背景，仓库规范要求）。

### iOS wrapper（subagent-3）

- `modules/objc/common/ExtSdkMethodTypeObjc.h:116`（key 常量）+ `:517`（Value 枚举 **546**）。
- `modules/objc/common/ExtSdkMethodTypeObjc.m:342`：methodMap 映射。
- `modules/objc/dispatch/ExtSdkDispatch.m:1023-1027`：case 分发。
- `modules/objc/dispatch/ExtSdkChatManagerWrapper.h:174-176` 声明 + `.m:1009-1024` 实现：`getConversationsFromDBWithCursor:pageSize:completion:`（pageSize `NSInteger`，用 `integerValue`，已经 native `refs/tags/4.25.0` 头文件核实）。
- `modules/objc/dispatch/ExtSdkToJson.m`：toJson :1274-1276 + fromJson :1336-1338（`// 2026-09-10 4.25.0` 分组），`enableChatroomConversation` / `autoLoadConversations` 属性名已经 native 头文件核实。

### 版本与文档收尾（主 agent）

- native 依赖 bump（阶段二已完成）：`android/build.gradle:91` → 4.25.0；`ChatSdk.podspec:53`（SPM）与 `:57`（CocoaPods）→ 4.25.0。
- `package.json` version → 1.21.0；`yarn gen:version_file` 重新生成 `src/version.ts`（1.21.0）。
- example 三处：`example/package.json` → 1.21.0；`example/android/app/build.gradle` versionName 1.21.0 / versionCode 3；`project.pbxproj` MARKETING_VERSION 1.21.0（:270/:297）/ CURRENT_PROJECT_VERSION 3（:262/:290）。
- `CHANGELOG.md` / `CHANGELOG.zh.md`：新增 `## 1.21.0`（native 升级句 + `fetchConversationsFromDB` + 两个新 `ChatOptions` 属性）。
- 仓库 `AGENTS.md` 滞后条目更新：`HyphenateChat 4.18.1` → 4.25.0；`example/src/demo2/` 两处失效引用改为 API tester/registry 现状描述。

## ⚠️/❌ 汇总

- ⚠️ iOS Value 枚举编号取 **546** 而非契约字面"全文件 max+1"：该文件按 section 分段编号（ChatManager 段 5xx，全文件 max 2029 属其他段），段内已用最大 545，取段内续号 546，全文件 grep 无撞号。符合文件实际惯例，予以采纳。
- ⚠️ TS 常量按 prettier 折行（契约文本为单行），语义等同。
- 无 ❌ 项。

## 遗留

- UM-3（Android 过滤 chatThread 会话，iOS 未见对应说明）照双端各自语义透传，进验收报告待用户确认。
- example 双端构建 + 契约要素 grep 抽查在阶段四执行。
