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

---

# 补录（2026-09-24）：iOS PushKit 回移实现

对应 `06-pushkit-backport.md` 与 `02-contract.md` 的「补录」节。契约冻结后实施，**只加不删**。

## TS 层（`src/`）

| 文件 | 改动 |
|---|---|
| `src/__internal__/Consts.ts:24-25` | 新增 `MTbindPushKitToken = 'bindPushKitToken'`、`MTunbindPushKitToken = 'unbindPushKitToken'`，置于 `MTrenewToken` 之后（ChatClient methods 段） |
| `src/common/ChatOptions.ts` | 新增 `apnsCertName?: string`（:128）、`pushKitCertName?: string`（:134），置于 `isAutoDownload` 与 `pushConfig` 之间；5 处同步 = 字段声明 + 构造 params（:340-341）+ 构造赋值（:393-394）+ `withAppId` params（:444-445）+ `withAppKey` params（:495-496）；注释为英文 TypeDoc，明确「仅 iOS」「仅初始化可设置」 |
| `src/ChatClient.ts` | `react-native` 导入增加 `Platform`（:3）；常量导入增加两个 key（:50-51）；`updatePushConfig` 之后新增 `bindPushKitToken({ deviceToken })` 与 `unbindPushKitToken()`（:962-1010 区域），实现与 5.0.0 逐字一致（`Platform.OS !== 'ios'` 提前 return） |
| `src/ChatClient.ts`（注释） | `updatePushConfig` 的 TypeDoc 增加一条 **Note**：该方法保留向后兼容；iOS 上 `ChatPushConfig.deviceId` 是运行时写入的 APNs 证书名，会覆盖初始化时设置的 `ChatOptions.apnsCertName`，两处只配一处。行为零变化，仅信息告知（D-1 裁决的落地方式） |

## iOS wrapper（`modules/objc/`）

| 文件 | 改动 |
|---|---|
| `common/ExtSdkMethodTypeObjc.h` | 两个 key 常量加在 `ExtSdkMethodKeyRenewToken` 后（:22-24，带 `// 2026-09-24 1.21.0` 分组注释）；两个 Value 常量加在文件末尾 1026 之后：`ExtSdkMethodKeyBindPushKitTokenValue = 1027`、`ExtSdkMethodKeyUnbindPushKitTokenValue = 1028` |
| `common/ExtSdkMethodTypeObjc.m` | methodMap 在 `ExtSdkMethodKeyRenewToken` 后加两条映射 |
| `dispatch/ExtSdkDispatch.m` | `ExtSdkMethodKeyUpdatePushConfigValue` case 后加两个 dispatch case |
| `dispatch/ExtSdkClientWrapper.h` | `updatePushConfig` 声明后加两个方法声明 |
| `dispatch/ExtSdkClientWrapper.m` | 实现两个方法：`bindPushKitToken` 取 `param[@"deviceToken"]`，以 `(NSData *)` 转型传给 `registerPushKitToken:completion:`；`unbindPushKitToken` 调 `unRegisterPushKitTokenWithCompletion:`。两者 completion 均走 `onResult:withMethodType:withError:withParams:nil`。证书名**只读初始化选项**，不从请求取 |
| `dispatch/ExtSdkToJson.m` | `EMOptions (Json)` fromJson 在 `pushConfig` 映射后加两行（`apnsCertName`、`pushKitCertName`，均带 `length > 0` 判空）；toJson 在 `data[@"pushConfig"]` 后加两行对称回写 |

## Android wrapper（`modules/java/`）

| 文件 | 改动 |
|---|---|
| `common/ExtSdkMethodType.java` | 两个常量加在 `renewToken` 后（:23-25） |
| `dispatch/ExtSdkDispatch.java` | `updatePushConfig` case 后加两个 case（带注释说明「iOS-only，注册路由以保持跨端 key 契约一致，TS 侧由 `Platform.OS` 守卫」） |
| `dispatch/ExtSdkClientWrapper.java` | 新增 `import com.hyphenate.EMError`；新增两个方法返回 `ExtSdkWrapper.onError(result, EMError.OPERATION_UNSUPPORTED, "PushKit is only supported on iOS")` |

## cpp 透传层（`modules/cpp/common/`）

- `ExtSdkMethodType.h` / `.cpp`：两个常量加在 `getCurrentUser` 后。该层整体滞后（连 `isConnected` / `updatePushConfig` 都没有，KI-105），按仓库 AGENTS.md 规范补齐新 key 即可，不作为契约对齐依据。

## example（`example/`）

| 文件 | 改动 |
|---|---|
| `src/auto/auto_mode.ts` | `CHAT_OPTIONS_KEYS` 追加 `'apnsCertName'`、`'pushKitCertName'`（脚本驱动可注入证书名） |
| `src/registry/apis/client.ts` | **新建**：注册 `ChatClient.bindPushKitToken`（参数模板 `{ deviceToken }`）与 `ChatClient.unbindPushKitToken`（无参数） |
| `src/registry/index.ts` | 导入并展开 `clientApis`，`ALL_APIS` 中排在 `chatApis` 之后 |

## 文档收尾

- `CHANGELOG.md` / `CHANGELOG.zh.md`：`## 1.21.0` 段追加两条（两个 `ChatOptions` 属性 + 两个 `ChatClient` 方法），中英同步。
- 版本号**未改**：`package.json` 与 example 三处已是 `1.21.0`，本次是补充项而非新版本发布。

## ⚠️/❌ 汇总

- ⚠️ ObjC `Value` 编号取 **1027/1028**（接在 push 段已用的最大号 1026 之后）。该文件按功能段分段编号（client 段 1xx、chat 段 5xx、userinfo 段 11xx、push 段 10xx），接 push 段续号与本仓库 5.0.0 的取号方式（119/120 接在 client 段末尾）不同但都属段内续号，全文件 grep 无撞号。
- ⚠️ `updatePushConfig` 的 TypeDoc 新增一条 Note（行为未变，仅文档）；若用户认为 1.21.0 的注释也应完全不动，可回退这一条。
- 无 ❌ 项。

## 遗留

- D-1（证书名两处配置的取舍说明）已在 `updatePushConfig` 注释与 `06-pushkit-backport.md` UM-3 落地，行为保持旧路径优先，待用户确认表述。
- D-2（iOS `renewToken` dispatch 缺失）**本次未修**，进验收报告待用户裁决。
- 阶段四验证与双端构建在 `04-verification.md` 记录。
