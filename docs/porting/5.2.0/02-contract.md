# 02 - 跨端契约与基线结论：native iOS 5.2.0 / Android 5.2.1（React Native 平版）

- 依据：`01-api-diff.md`（变更清单 + 未匹配清单）。契约冻结后三层（TS / Android wrapper / iOS wrapper）才并行/依次实现。
- 用户已确认的决策（2026-11-25）：
  - **UM-5 多消息体**：向后兼容方案——保留 `body`（= 首个），新增 `bodies` / `contentType`，`ChatMessageType` 新增 `MULTIBODY`。
  - **UM-3 连接状态**：字符串枚举 `ChatConnectionState`（`'connected' | 'connecting' | 'disconnected'`），新方法 `getConnectionState`，两端 wrapper 显式映射、不透传原生整数。
  - **UM-4 `isConnected`**：保留，加 `@deprecated` 指向 `getConnectionState()`，行为不变。
  - **UM-1 `usePushInBackground`**：不暴露为 `ChatOptions` 字段，仅 CHANGELOG 提示 Android 后台断连行为变化。

## 一、基线结论

| 项 | 结论 |
|---|---|
| 目标仓库 / 分支 | `react-native-chat-sdk`，worktree `.worktree/5.2.0`，分支 `5.2.0`，基于 `5.x`@`3db01ff`（与本地及 asterisk / easemob 两个远端的 `5.x`、`5.1.0` 同一提交）；开工时 `git status` 干净 |
| native 依赖 bump | Android `android/build.gradle`：`hyphenate-chat:5.1.0 → 5.2.1`；iOS `ChatSdk.podspec` 两处 `5.1.0 → 5.2.0`（SPM `minimumVersion` 与 `s.dependency '~> 5.2.0'`）。互核一致（见下方命令输出）。依赖版本两端可不一致，现状即如此 |
| 其他版本引用同步 | `docs/ci/native-case-mapping.json` 的 `nativeBaseline`（项目文档要求升级 native 基线时同步）；`AGENTS.md` 的 native 版本描述；`scripts/ci/test_check_case_mapping.js` 里的 `nativeBaseline` 是测试夹具字符串，不是基线声明，**不改** |
| 已知问题清单（`known-issues.md`）命中项 | KI-105（cpp `ExtSdkMethodType` 滞后）：按仓库规范补 `getConnectionState`，不作契约依据；KI-107（`useAgoraChatDomain`）：本次 native 无新增同类项，RN 零代码；KI-108/109：5.0.0 已处理，本次无新增；KI-110（CocoaPods 停更）：podspec 已是 SPM + CocoaPods 双路径，本次只改版本；KI-111：本次裁决不涉及"迁移到替代 API"；KI-112：契约明确 wrapper 不加过滤（见 §二.A 校验策略） |
| hooks | 本会话 harness（Cursor）无 hooks 机制，走"无 hooks 能力"档：`gate` 作为每阶段必跑命令并附输出；`pre`（提交拦截）靠纪律——**不执行任何 git 提交类命令，代码保持未提交** |
| `mergeMessage` 塌缩风险 | 基线调查发现的 native 既有逻辑必改项（不在 01 变更清单内），见 §二.A4 |

## 二、契约

### A. 多消息体（领域：message）

**A1. 线上 JSON（message 对象）**

| 方向 | 规则 |
|---|---|
| native → JS（所有返回/事件里的 message，由 `ExtSdkMessageHelper.toJson` / `EMChatMessage (Json) toJsonObject` 产出） | 新增 `bodies`：`[bodyJson, ...]`，长度 ≥ 1，元素 JSON 与现有单 body JSON **完全相同**（`type` 取值沿用 `txt`/`img`/`loc`/`video`/`voice`/`file`/`cmd`/`custom`/`combine`）。保留 `body` = `bodies[0]`（旧键不删）。**线上不出现 `multibody` 类型字符串**，`contentType` 不上线，由 TS 按 `bodies` 推导 |
| JS → native（`fromJson` / `fromJsonObject`） | TS 实例只发 `bodies`（见 §A3）。native 读取优先级：`bodies` 为非空数组 → 用 `bodies`；缺省或空 → 回退读 `body`（兼容手写原始 JSON，如 example 脚本、`$step.<id>` 回传） |

**A2. native 侧构造规则（fromJson）**

| 情形 | Android | iOS |
|---|---|---|
| 单 body（`bodies.length == 1` 或仅 `body`） | 现有路径不变：`EMMessage.createSendMessage(Type.X)` + `addBody` | 现有路径不变：`initWithConversationID:from:to:body:ext:` |
| 多 body（`bodies.length > 1`） | `EMMessage.createMultiBodySendMessage(to, bodyList)`，其余字段（direction/from/to/status/…）沿用现有赋值段；**不**再调用 `addBody` | 仍用公开初始化器 `initWithConversationID:from:to:body:ext:`（首个 body，保证 `from`/`to`/`conversationId` 处理与单 body 一致），随后 `msg.bodies = bodies`，并校验 `msg.bodies.count == bodies.count` |
| 构造失败（含 iOS 校验未通过导致 count 不符、Android 返回 `null`） | `fromJson` 返回 `null` | `fromJsonObject` 返回 `nil` |
| 失败后的错误返回 | 沿用既有"消息无效"路径（`checkMessageParams` → 错误码 1 `The message does not exist.`），**不新造错误码**；因 `null`/`nil` 不拦截会 NPE/崩溃，属于"native 无法自保"，进验收报告待决策清单（UM-2/UM-6） | 同左 |
| 数量上限（20）/ 类型组合（iOS 拒绝多 body 含 `cmd`/`combine`） | **wrapper 不拦截**，成功/失败与错误码以 native 为准（`MESSAGE_INVALID` / `body count exceeds configured limit 20`） | 同左 |

**A3. TypeScript 公开形态（`src/common/ChatMessage.ts`）**

- `bodies: ChatMessageBody[]`：自有字段，**唯一数据源**；构造时若入参无 `bodies` 则取 `[params.body]`；元素经 `ChatMessage.getBody` 转强类型。
- `body`：改为类访问器——`get` 返回 `bodies[0]`，`set(v)` 将 `bodies` 整体替换为 `[v]`（对应 native `setBody` 语义）。理由：仓库自身 CI 用例存在 `message.body = new ChatTextMessageBody(...)` 后再 `updateMessage` 的用法（`example/src/ci/modules/conversation_cases.ts:416`、`message_cases.ts:516`），`body` 与 `bodies` 若是两个独立字段会被 native 优先读 `bodies` 而悄悄失效。访问器在类体内定义，不可枚举，不会随 RN 桥序列化，故 JS→native 只携带 `bodies`。
- `contentType`（只读 getter）：`bodies.length > 1` → `ChatMessageType.MULTIBODY`；否则 `bodies[0].type`；无 body 时返回 `ChatMessageType.TXT`（对齐 iOS 兜底）。
- `ChatMessageType` 新增 `MULTIBODY = 'multibody'`（仅用作 `contentType` 取值，不是 body 类型，不进 `ChatMessageTypeFromString`）。
- `ChatMessage.createSendMessage` 入参改为 `{ body: ChatMessageBody; bodies?: never } | { bodies: ChatMessageBody[]; body?: never }`（二选一，保持类型层面必填）与既有公共可选参数的交叉类型；既有 `createXxxSendMessage` 静态方法不变。
- native `appendBody` / `setBodies` / `getContentType` 的映射：`bodies.push(...)`、`bodies = [...]`、`contentType`（语言风格映射，记入验收报告；不另建方法）。
- TS 不做数量/类型组合校验（不擅自添加过滤）。

**A4. native 既有逻辑必改项（基线调查发现）**

| 位置 | 问题 | 改动 |
|---|---|---|
| Java `ExtSdkWrapper.mergeMessage` 末行 `dbMsg.setBody(msg.getBody())`；ObjC `ExtSdkWrapper.m` `dbMsg.body = msg.body` | 5.2.0 起 `setBody` 把 db 消息整体替换为单 body；经 `updateChatMessage` / `updateConversationMessage` 更新多 body 消息会被**塌缩成首个 body** | Java 改 `dbMsg.setBodies(msg.getBodies())`；ObjC 改 `dbMsg.bodies = msg.bodies` |
| Java `ExtSdkMessageHelper.toJson` 的 `switch (message.getType())` | 多 body 时 `getType()` 返回 `MULTIBODY`，无 case → **`body` 键丢失** | 去掉按 `getType()` 的 switch，统一 `bodies` = `message.getBodies()` 逐个 `ExtSdkMessageBodyHelper.bodyToJson`，`body` = `bodyToJson(message.getBody())`（该 helper 已覆盖 9 种 body） |
| `ExtSdkWrapper.mergeMessageBody`（Java/ObjC） | 全仓无调用点（仅定义/声明） | 不改（死代码，不顺手清理，超出本次范围） |
| `getConversationFromMessage`（Java 用 `getType() != CMD`，ObjC 用 `body.type != Cmd`） | 多 body 时 Java 为 `MULTIBODY != CMD` → 创建会话；iOS 不允许多 body 含 cmd | 不改 |
| `EMSearchServerMessageResult`（Java `ExtSdkHelper.java:1344`、ObjC `ExtSdkToJson.m:1651`） | 独立类，有自己的 `getBody()`，非 `EMMessage` | 不改 |
| `modifyMsgBody`（Java `ExtSdkChatManagerWrapper.java:1333`、ObjC `:1207`） | native `modifyMessage` 入参仍是单 body | 不改 |

**A5. 事件 / 方法常量**：多消息体**无新增方法 key、无新增事件**（发送、下载、更新等既有方法透传同一 message JSON）。

### B. 连接状态（领域：client）

| 契约项 | 取值 |
|---|---|
| 方法名 key | `getConnectionState`（`MTgetConnectionState`）；无请求参数 |
| 返回包装 | `{ getConnectionState: 'connected' \| 'connecting' \| 'disconnected' }`（字符串），经 `onSuccess/onResult` 按方法名包装 |
| Android 映射 | `EMClient.getConnectionState()` → `switch`：`CONNECTED→"connected"`、`CONNECTING→"connecting"`、`DISCONNECTED→"disconnected"`（显式映射，不用 `ordinal()`/`name()`） |
| iOS 映射 | `EMClient.sharedClient.connectionState` → `switch`：`EMConnectionConnected→@"connected"`、`EMConnectionConnecting→@"connecting"`、`EMConnectionDisconnected→@"disconnected"`，`default→@"disconnected"` |
| TS | `ChatConnectionState` 枚举（`CONNECTED='connected'`、`CONNECTING='connecting'`、`DISCONNECTED='disconnected'`）定义并导出于 `src/ChatClient.ts`（枚举并入使用它的业务文件，5.0.0 起规则）；`ChatClient.getConnectionState(): Promise<ChatConnectionState>`，错误经 `checkErrorFromResult` |
| `isConnected` | 方法/行为不变，TS 注释加 `@deprecated Use {@link getConnectionState} instead.`；`ChatManager.ts` 内部两处调用不改 |
| 事件 | 不变。已核实 iOS native 只向 delegate 回调 `Connected`/`Disconnected`（`EMConnectionListener.mm:27,56`），`Connecting` 仅出现在 `connectionState` 属性，RN 现有 `onConnected`/`onDisconnected` 通路无需改动 |
| `ChatConnectEventListener` 注释 | 同步 native 语义：可恢复断开在 `disconnectNotifyThreshold` 秒内不回调 `onDisconnected`，致命错误立即回调；展示连接状态用 `getConnectionState()`（仅注释，签名不变） |
| 常量登记（五处） | `src/__internal__/Consts.ts`；`modules/java/.../ExtSdkMethodType.java`；`modules/objc/common/ExtSdkMethodTypeObjc.h`（key `ExtSdkMethodKeyGetConnectionState` + `ExtSdkMethodKeyGetConnectionStateValue = 2041`，当前最大值 2040）+ `.m` methodMap；`modules/cpp/common/ExtSdkMethodType.{h,cpp}`；分发：`ExtSdkDispatch.java` 加 case、`ExtSdkDispatch.m` 加 case；Wrapper：`ExtSdkClientWrapper.{java,h,m}` |

### C. `disconnectNotifyThreshold`（领域：client / options）

| 契约项 | 取值 |
|---|---|
| JSON key | `disconnectNotifyThreshold`（`ChatOptions`，number，单位秒，默认 `10`） |
| TS | `ChatOptions` 新增字段与构造参数（与 `enableChatroomConversation` 同样的三处：字段声明、构造入参、两个 `Partial` 入参类型），默认 `10`；注释按双端交集写：单位秒，默认 10，可恢复断开在阈值内恢复则不回调 `onDisconnected`；**不**描述 ≤0 行为（Android 文档称关闭延迟，iOS 头文件未说明，见 UM-8） |
| Android | `ExtSdkHelper` options `fromJson`：`if (json.has("disconnectNotifyThreshold")) options.setDisconnectNotifyThreshold(json.getInt(...))`；`toJson`：`options.getDisconnectNotifyThreshold()` |
| iOS | `ExtSdkToJson.m` options `fromJsonObject`：`options.disconnectNotifyThreshold = [... integerValue]`；`toJsonObject`：`@(self.disconnectNotifyThreshold)` |

### D. 仅文档/注释变更（无契约键）

- `ChatOptions.enableChatroomConversation` 注释改为"获取本地会话列表时是否包含聊天室会话；不控制会话创建/存储，不影响聊天室消息收发"，默认值与字段不变。
- 附件上传/下载进度为**消息级**（多附件按文件大小加权聚合为单一 0–100 进度）、下载结果按请求只回调一次（任一失败终止剩余）：补入 `ChatManager` 的 `sendMessage` / `downloadAttachment` / `downloadThumbnail` / `downloadBigImage` 注释（TypeDoc 英文）。

### E. 不做项（已确认）

- `usePushInBackground`、`EMPushHelper.isPushTokenBound`、`useAgoraChatDomain`：不平版（见 01）。
- 不新增 `appendBody()` / `setBodies()` / `createMultiBodySendMessage()` 等独立 TS 方法（见 §A3 映射）。

## 三、收尾项约定（阶段三必做）

- 版本号：`package.json` `version` → `5.2.0`，运行 `yarn gen:version_file`（`src/version.ts` 不手改）；`example/package.json` `version`、`example/android/app/build.gradle` `versionName`、iOS `MARKETING_VERSION`（Debug/Release 两处）同步 `5.2.0`，`versionCode` / `CURRENT_PROJECT_VERSION` 递增。
- CHANGELOG 中英两份：native 升级句式（iOS 5.2.0 / Android 5.2.1）、新增多消息体、`getConnectionState`、`disconnectNotifyThreshold`、`isConnected` 废弃、`enableChatroomConversation` 语义说明；并注明 **Android 后台断连行为变化**（旧：FCM 类型自动在后台约 3 分钟断连；新：native 需显式开启 `usePushInBackground` 且推送 token 已绑定，RN 本次不暴露该开关）。
- `docs/rn_api_overview.{md,zh.md}`：仓库没有生成脚本（`package.json` 无 `doc:overview:*`），该文档为手写方法表，仅在 `isConnected` 行后补 `getConnectionState` 一行并标注 `isConnected` 已废弃。主仓 `dev` 工作区有一个与本任务无关的未提交改动 `docs/rn_api_overview.zh.md`，本 worktree 不受影响。

## 四、门禁证据

版本互核（阶段二门禁）：

```text
android/build.gradle:91:  implementation 'io.hyphenate:hyphenate-chat:5.2.1'
ChatSdk.podspec:53:      requirement: { kind: 'upToNextMinorVersion', minimumVersion: '5.2.0' },
ChatSdk.podspec:57:    s.dependency 'HyphenateChat', '~> 5.2.0'
```

`porting_guard.sh gate`（`echo '{}' | bash .../hooks/porting_guard.sh gate react-native <worktree>`）：无输出，退出码 0（通过）。契约要素在实现后于阶段四再用 grep 逐字抽查。
