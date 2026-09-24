# 02 - 基线调查与跨端契约：React Native 1.21.0

基线：`react-native-chat-sdk` worktree `.worktree/1.21.0`，分支 `1.21.0`（基于 `dev` @ 3d8f454），开工前 `git status` 干净。
目标平台版本号：**1.21.0**（用户指定，与 native 版本号无关；当前包版本 1.20.0）。
先例：Flutter 4.25.0 平版已评审闭环（`/Users/asterisk/Codes/zuoyu_flutter/im_flutter_sdk/.worktree/4.25.0/docs/porting/4.25.0/`），本契约沿用其全部评审结论。

## 基线调查结论（关键事实）

- 桥接：单一 TurboModule `callMethod(method, args)`；TS → `ExtSdkApiRN`/`ExtSdkApiObjcRN` → Dispatch switch → 各 Wrapper。
- 模板 API：`fetchPinnedConversationsFromServerWithCursor`（key `getPinnedConversationsFromServerWithCursor`）全链路齐备，新 API 照此模式。
- `ChatCursorResult<T>` 模型已存在（`src/common/ChatCursorResult.ts`），native 序列化 `{cursor, list}`（Java `ExtSdkCursorResultHelper.toJson` / ObjC `EMCursorResult toJsonObject` category）。
- `ChatOptions` 每个布尔字段 5 处同步：字段声明、构造 params、构造赋值、`withAppId` params、`withAppKey` params（`src/common/ChatOptions.ts`）。
- Options native 链路：Java `ExtSdkHelper.java` fromJson（`if (json.has(...))` 单行，按版本注释分组）/ toJson；ObjC `ExtSdkToJson.m` EMOptions (Json) category fromJson/toJson。
- 无 native options 读回 API（`getOptions` 不存在），toJson 仅用于对称完整性。
- cpp 常量层（`modules/cpp/common/ExtSdkMethodType.{h,cpp}`）为字符串透传子集，历史新 key 未同步（KI-105）；本次按仓库 AGENTS.md 规范补齐新 key。
- example ApiCall 注册表：`example/src/registry/apis/chat.ts`（模板：`fetchConversationsFromServerWithCursor` 条目）。
- auto 模式 init options 白名单：`example/src/auto/auto_mode.ts` `CHAT_OPTIONS_KEYS`（:157-198）。

## 已知问题清单核对（references/known-issues.md）

- **KI-107 命中**：`useAgoraChatDomain` 不移植（对内品牌开关），本契约 C 节无此项，实施者不得添加。
- KI-105 命中：cpp 常量滞后问题已知，本次新 key 按规范补齐。
- KI-001（505 服务端功能未开通）：本次新 API 均为本地能力，不依赖服务端开通，不命中。
- 其余条目为 Flutter/旧版本特定，不命中。

## Hooks 安装（阶段二门禁项）

本 harness（Kimi Code）无 Codex 式 hooks 机制，按 skill「钩子」节第 3 档（流程强制）执行：

- `gate` 列为每阶段门禁必跑命令，输出原样附进各阶段产物。
- `pre`（提交拦截）无机械替代：本任务用户已明确"不提交"，全程不执行 `git add`/`git commit`。

阶段二 gate 输出（2026-09-10，实施前基线）：

```json
{"decision": "block", "reason": "平版门禁检查未过（修复后再收尾；确认为合理差异时，说明理由后可结束）：key 在 TS(Consts) 有、Java(ExtSdkMethodType) 缺失: updateAPNsPushToken ；key 在 TS(Consts) 有、ObjC(ExtSdkMethodTypeObjc) 缺失: getNoDisturbUsersFromServer onMessageStatusChanged updateCurrentUserNick updateFCMPushToken updateHMSPushToken ；"}
```

基线 block 项核查：6 个 key 全部在 `Consts.ts` 标注 `// deprecated`（`updateCurrentUserNick` :13、`onMessageStatusChanged` :148、`getNoDisturbUsersFromServer` :298、`updateHMSPushToken` :300、`updateFCMPushToken` :301、`updateAPNsPushToken` :302），契约测试经 `stripDeprecated` 剔除故全绿；gate 脚本未剔除 deprecated 属脚本覆盖范围差异。**判定为合理差异**，非本次平版引入，不处理。

## native 依赖 bump（阶段二第一步，已完成）

| 位置 | 旧 | 新 |
|---|---|---|
| `android/build.gradle:91` | `io.hyphenate:hyphenate-chat:4.24.1` | `4.25.0` |
| `ChatSdk.podspec:53`（SPM `minimumVersion`） | `4.24.1` | `4.25.0` |
| `ChatSdk.podspec:57`（CocoaPods `s.dependency`） | `~> 4.24.1` | `~> 4.25.0` |

注：4.25.0 尚未发布到 maven/CocoaPods，编译验证走本地依赖覆盖（`scripts/rn-local-deps.sh`，改动不提交）；上述远程依赖声明是交付形态，正常保留。

## 契约（冻结）

### C1 新 API：`fetchConversationsFromDB`（本地数据库分页获取会话）

- 方法名 key（三端逐字一致）：**`getConversationsFromDBWithCursor`**
- TS（`src/ChatManager.ts`，紧邻 `fetchPinnedConversationsFromServerWithCursor` 之后）：
  - 签名：`public async fetchConversationsFromDB(cursor?: string, pageSize?: number): Promise<ChatCursorResult<ChatConversation>>`
  - 包装：`Native._callMethod(MTgetConversationsFromDBWithCursor, { [MTgetConversationsFromDBWithCursor]: { cursor: cursor ?? '', pageSize: pageSize ?? 20 } })`
  - 返回：`r[MTgetConversationsFromDBWithCursor]` → `new ChatCursorResult<ChatConversation>({ cursor, list, opt: { map: (param) => new ChatConversation(param) } })`
  - 常量：`src/__internal__/Consts.ts` 加 `MTgetConversationsFromDBWithCursor = 'getConversationsFromDBWithCursor'`（放会话分组）
  - TypeDoc 英文注释必须含：前置条件（调用前需将 `ChatOptions.autoLoadConversations` 设为 `false`；开启自动加载时 SDK 初始化即全量加载会话，分页加载失去意义）、排序规则（置顶倒序 > 最新消息服务器时间倒序 > 会话 ID 倒序不区分大小写）、pageSize [1,100]、无效 cursor 抛 `ChatError`（INVALID_PARAM）
- Android：
  - `ExtSdkMethodType.java`：加常量 `getConversationsFromDBWithCursor`
  - `ExtSdkDispatch.java`：switch 加 case → `ExtSdkChatManagerWrapper.getInstance().getConversationsFromDBWithCursor(jsonParams, methodType, callback)`
  - `ExtSdkChatManagerWrapper.java`：`String cursor = param.optString("cursor"); int pageSize = param.optInt("pageSize");` 调 **`asyncGetConversationsFromDB(cursor, pageSize, callback)`——注意 native 参数顺序是 (cursor, pageSize)，与 pinned API 的 (pageSize, cursor) 相反**；回调 `ExtSdkWrapper.onSuccess(result, channelName, ExtSdkCursorResultHelper.toJson(...))` / `onError`
- iOS：
  - `ExtSdkMethodTypeObjc.h`：加 key 常量 + `...Value` 枚举值（取现有最大 Value +1，实施时 grep 确认无撞号）
  - `ExtSdkMethodTypeObjc.m`：methodMap 加映射
  - `ExtSdkDispatch.m`：switch 加 case
  - `ExtSdkChatManagerWrapper.h/.m`：声明+实现；`NSString *cursor = param[@"cursor"]; NSInteger pageSize = [param[@"pageSize"] integerValue];` 调 `getConversationsFromDBWithCursor:cursor pageSize:pageSize completion:`；completion 中 `onResult:withMethodType:withError:withParams:[ret toJsonObject]`
- cpp：`modules/cpp/common/ExtSdkMethodType.h/.cpp` 同步加 key（仓库 AGENTS.md 规范；KI-105 背景）
- 返回包装（双端一致）：`{getConversationsFromDBWithCursor: {cursor: string, list: [...]}}`
- 无新事件。

### C2 新配置：`ChatOptions.enableChatroomConversation`（聊天室消息建会话）

- TS 字段 `enableChatroomConversation: boolean`，默认 `false`；5 处同步（声明/构造 params/构造赋值/withAppId params/withAppKey params）
- JSON key：**`enableChatroomConversation`**
- Android：`ExtSdkHelper.java` fromJson 加 `if (json.has("enableChatroomConversation")) { options.setEnableChatroomConversation(json.getBoolean("enableChatroomConversation")); }`；toJson 加 `data.put("enableChatroomConversation", options.isEnableChatroomConversation());`
- iOS：`ExtSdkToJson.m` fromJson 加 `if (aJson[@"enableChatroomConversation"]) { options.enableChatroomConversation = [aJson[@"enableChatroomConversation"] boolValue]; }`；toJson 加 `data[@"enableChatroomConversation"] = @(self.enableChatroomConversation);`
- 版本分组注释：`// 2026-09-10 4.25.0`（Java/ObjC 两侧）

### C3 衍生新配置：`ChatOptions.autoLoadConversations`（UM-2，Flutter 评审已确认保留）

- 背景：C1 前置条件要求关闭自动加载，RN 基线无入口（grep `autoLoad` 无匹配）；native 双端 4.24.1 已具备（Android `setAutoLoadAllConversations` / iOS `EMOptions.autoLoadConversations`）
- TS 字段 `autoLoadConversations: boolean`，默认 **`true`**（与 native 默认一致）；5 处同步
- JSON key：**`autoLoadConversations`**
- Android：fromJson `if (json.has("autoLoadConversations")) { options.setAutoLoadAllConversations(json.getBoolean("autoLoadConversations")); }`；toJson `data.put("autoLoadConversations", options.isAutoLoadAllConversations());`
- iOS：fromJson `if (aJson[@"autoLoadConversations"]) { options.autoLoadConversations = [aJson[@"autoLoadConversations"] boolValue]; }`；toJson `data[@"autoLoadConversations"] = @(self.autoLoadConversations);`
- 注释强调：使用 `fetchConversationsFromDB` 前须设为 `false` 及原因
- 版本分组注释同 C2

### C4 明确不做（防盗版）

- `useAgoraChatDomain`：**不移植**（KI-107，对内品牌开关；国内 easemob 不设置走缺省，海外 agora 侧内部固定 true）。任何层不得出现该 key。
- `syncDataWSHost`/`syncDataWSPort`（iOS）、`set/getSyncDataWebSocketServer/Port`（Android）删除：RN 从未暴露，无操作。
- `search_keyword_limit_doc`（关键词上限注释 512→120）：RN 注释未写上限，无操作。

### C5 收尾项（主 agent 负责，不拆分）

- 版本号：`package.json` `version` → `1.21.0`；`yarn gen:version_file` 重新生成 `src/version.ts`
- example 三处：`example/package.json` version → `1.21.0`；`example/android/app/build.gradle` versionName → `1.21.0`、versionCode 2→3；`project.pbxproj` MARKETING_VERSION → `1.21.0`（Debug/Release 两处）、CURRENT_PROJECT_VERSION 2→3（两处）
- CHANGELOG 双语新增 `## 1.21.0`：native 升级句（沿用 "Dependent native SDKs are upgraded to versions (iOS 4.25.0 and Android 4.25.0)"）+ `fetchConversationsFromDB` + `ChatOptions` 两个新配置
- 仓库 `AGENTS.md` 滞后条目顺手更新：`HyphenateChat 4.18.1` → `4.25.0`；`example/src/demo2/` 引用已失效（demo2 已删）按现状修正
- example 注册表：`example/src/registry/apis/chat.ts` 加 `ChatManager.fetchConversationsFromDB` 条目（照 `fetchConversationsFromServerWithCursor` 模板）
- `example/src/auto/auto_mode.ts` `CHAT_OPTIONS_KEYS` 加 `'enableChatroomConversation'`、`'autoLoadConversations'`（脚本驱动验证需要注入 `autoLoadConversations:false`）

## 遗留疑点（进验收报告）

- UM-3：Android `asyncGetConversationsFromDB` 过滤 chatThread 会话，iOS 公开头文件未见对应说明；RN 照双端各自语义透传，不抹平，交用户确认。
- gate 脚本对 deprecated key 的误报（6 个存量 key），属脚本与契约测试口径差异，建议后续修正脚本（非本次范围）。

---

# 补录（2026-09-24）：iOS PushKit 回移的跨端契约

对应 `06-pushkit-backport.md`。**只加不删**：`pushConfig` / `ChatPushConfig` / `updatePushConfig` 原样保留，`bindDeviceToken` 不引入。

## 阶段二门禁

### 基线核查（开工前）

- 分支 `1.21.0`，基线 commit `7acbd07`；`git status` 干净（仅本文件为新增未跟踪）。
- native 依赖已就位，无需 bump，各处互核一致：`ChatSdk.podspec:53` SPM `minimumVersion: '4.25.0'`、`:57` CocoaPods `~> 4.25.0`、`android/build.gradle:91` `io.hyphenate:hyphenate-chat:4.25.1`。
- 基线测试：`yarn test --no-watchman` → **19 suites / 121 tests 全通过**（本 worktree 首次安装依赖 `yarn install`，exit 0）。

### gate 输出（无 hooks 能力 harness，流程强制替代机器强制）

命令：`echo '{}' | bash /Users/asterisk/Codes/zuoyu_rn/.agents/skills/platform-sdk-porting-v2/hooks/porting_guard.sh gate react-native /Users/asterisk/Codes/zuoyu_rn/react-native-chat-sdk/.worktree/1.21.0`

输出：**（无输出，空）** = 门禁通过，无 block 项。

> 与 `02-contract.md` 原有记录中「6 个 deprecated key 误报」的差异说明：本次 gate 无输出。原记录中的 block 项来自阶段二实施前的旧基线（当时脚本口径不同，且 `RenewToken` 等 key 尚未补齐），现基线已无该现象，gate 干净。

## C6 iOS PushKit 回移要素（逐项定死）

### C6.1 初始化选项：`ChatOptions.apnsCertName` / `ChatOptions.pushKitCertName`

- TS 字段：`apnsCertName?: string`、`pushKitCertName?: string`，**可选、无默认值**（与 native `NSString *` 可为 nil 对齐；与 5.0.0 逐字一致）
- 放置位置：`src/common/ChatOptions.ts` 中 `isAutoDownload` 与 `pushConfig` 之间（5.0.0 同一位置）
- 5 处同步（本仓库既有规矩）：字段声明、构造 params、构造赋值、`withAppId` params、`withAppKey` params
- JSON key：**`apnsCertName`**、**`pushKitCertName`**（顶层，与 5.0.0 及 Flutter 一致）
- iOS：`ExtSdkToJson.m` 的 `EMOptions (Json)` `fromJson` 增加
  `if (aJson[@"apnsCertName"]) { options.apnsCertName = aJson[@"apnsCertName"]; }`、
  `if (aJson[@"pushKitCertName"]) { options.pushKitCertName = aJson[@"pushKitCertName"]; }`；
  `toJson` 增加 `data[@"apnsCertName"] = self.apnsCertName;`、`data[@"pushKitCertName"] = self.pushKitCertName;`（对称完整性）
- Android：**不做映射**（native Android 无该能力）。`ExtSdkHelper.java` 不动。
- 版本分组注释：iOS 的 `fromJson`/`toJson` 加 `// 2026-09-24 1.21.0` 风格注释（沿用文件现有分组注释习惯）
- 注释语义（英文 TypeDoc）：仅 iOS 生效；仅在 `ChatClient.init` 时设置，运行时不修改

### C6.2 方法：`bindPushKitToken` / `unbindPushKitToken`

| 要素 | 取值 |
|---|---|
| TS 公开签名 | `bindPushKitToken(params: { deviceToken: string }): Promise<void>`；`unbindPushKitToken(): Promise<void>` |
| 方法名 key | `bindPushKitToken` / `unbindPushKitToken`（逐字，五处同步：`Consts.ts`、`ExtSdkMethodType.java`、`ExtSdkMethodTypeObjc.h`、`ExtSdkMethodTypeObjc.m`、`ExtSdkMethodType.{h,cpp}`） |
| 请求参数 key | `deviceToken`（string） |
| TS 请求包装 | `Native._callMethod(MTbindPushKitToken, { [MTbindPushKitToken]: { deviceToken } })`；解绑 `Native._callMethod(MTunbindPushKitToken)` 无内层参数 |
| 返回结构 | `onResult` 包装 `{bindPushKitToken: nil}`，TS `ChatClient.checkErrorFromResult(r)` |
| 非 iOS 行为 | TS `Platform.OS !== 'ios'` → 直接 `return`（静默 no-op）；`ChatClient.ts` 需从 `react-native` 引入 `Platform`（现为 `import { type EventSubscription, NativeEventEmitter }`） |
| 位置 | `src/ChatClient.ts`，紧跟 `updatePushConfig` 之后 |

### C6.3 iOS 侧

| 层 | 动作 |
|---|---|
| `ExtSdkMethodTypeObjc.h` | 在 `ExtSdkMethodKeyUpdatePushConfig` 附近加两个 key 常量；enum 加 `BindPushKitTokenValue = 1027`、`UnbindPushKitTokenValue = 1028`（1.21.0 现有 max = `ExtSdkMethodKeyGetPushTemplateValue = 1026`，不冲突） |
| `ExtSdkMethodTypeObjc.m` | methodMap 加两条映射 |
| `ExtSdkDispatch.m` | `updatePushConfig` case 后加两个 case |
| `ExtSdkClientWrapper.h` | `updatePushConfig` 声明后加两个方法声明 |
| `ExtSdkClientWrapper.m` | 实现：`deviceToken` 十六进制字符串 → `NSData`（与 5.0.0 同法）→ `[EMClient.sharedClient registerPushKitToken:...completion:]` / `unRegisterPushKitTokenWithCompletion:`，completion 里 `onResult:withMethodType:aChannelName withError:aError withParams:nil` |

### C6.4 Android 侧（仅注册路由，不实现能力）

| 层 | 动作 |
|---|---|
| `ExtSdkMethodType.java` | 加两个常量 |
| `ExtSdkDispatch.java` | `updatePushConfig` case 后加两个 case |
| `ExtSdkClientWrapper.java` | 两个方法返回 `ExtSdkWrapper.onError(result, EMError.OPERATION_UNSUPPORTED, "PushKit is only supported on iOS")`（`EMError.OPERATION_UNSUPPORTED = 111`，已核实 native 4.25.1 `hyphenatechatsdk/src/com/hyphenate/EMError.java:220`） |
| `ExtSdkHelper.java` | 不动 |

理由：契约测试强制「TS `MT*` 值 ⊆ Java 常量值」；Android 注册同名 key 才能在两端保持方法名契约一致。实际调用被 TS 的 `Platform.OS` 守卫拦住。

### C6.5 明确不做

- **不删除** `ChatOptions.pushConfig` / `src/common/ChatPushConfig.ts` / `ChatClient.updatePushConfig`（兼容性硬要求）。
- **不新增** `ChatClient.bindDeviceToken`（属 5.0.0 的 break 动作，不回移）。
- **不引入** 证书名优先级逻辑：`updatePushConfig` 的 iOS 旧路径（运行时写 `apnsCertName`）原样保留。
- **不移植** native 同步变体 `bindPushKitToken:` / `unBindPushKitToken`（语义重复且阻塞线程）。
- **不修** iOS `renewToken` dispatch 缺失（D-2，待用户裁决）。

### C6.6 收尾项（主 agent 负责）

- example：`example/src/auto/auto_mode.ts` 的 `CHAT_OPTIONS_KEYS` 加 `'apnsCertName'`、`'pushKitCertName'`；新建 `example/src/registry/apis/client.ts` 注册 `ChatClient.bindPushKitToken`、`ChatClient.unbindPushKitToken`，并在 `example/src/registry/index.ts` 接入 `clientApis`。
- CHANGELOG 双语：`## 1.21.0` 段落追加两条（两个 `ChatOptions` 属性 + 两个 `ChatClient` 方法），中文版同步。
- 版本号：`package.json` 已是 `1.21.0`，example 三处已是 1.21.0 —— **不动**（本次是补充项，非新版本发布）。
