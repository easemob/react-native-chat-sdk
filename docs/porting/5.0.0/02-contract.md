# 5.0.0 平版 · 阶段二：基线调查与跨端契约（React Native）

- 目标仓库：`/Users/asterisk/Codes/zuoyu_rn/react-native-chat-sdk`，worktree `.worktree/5.0.0`，分支 `5.0.0`（从 dev/1.20.0 切出）
- RN 目标版本号：**5.0.0**（本次起与 native 版本号同步）
- native 依赖：iOS `HyphenateChat` 4.24.1 → **5.0.0**；Android `io.hyphenate:hyphenate-chat` 4.24.1 → **5.0.0**
- 输入：`01-api-diff.md`（171 条，include 70 / defer 101 / skip 0）、双端迁移指南、基线调查报告

## 1. 基线调查结论（要点，证据见调查记录）

- 桥接架构：TS `Native._callMethod(MTxxx, {[MTxxx]: {...}})` → 单一 TurboModule `callMethod` → Java/ObjC `ExtSdkDispatch` → 各 `ExtSdk{Domain}Wrapper`；返回统一 `{<方法名 key>: object}`；事件为聚合 key + `params.type` 判别（ChatManager 消息事件除外：每个 MTon* 单独 addListener）。
- 常量四处同步：`src/__internal__/Consts.ts`、`modules/java/.../ExtSdkMethodType.java`、`modules/objc/common/ExtSdkMethodTypeObjc.{h,m}`、`modules/cpp/common/ExtSdkMethodType.{h,cpp}`（cpp 按仓库规范补齐，不作契约依据）。
- 契约测试强制（`src/__tests__/contract/`）：TS MT* ⊆ Java ⊆ ObjC；ObjC key 必须在 methodMap 有条目；`MTon*` ⊆ iOS `supportedEvents`；**`stripDeprecated` 剔除含 `// deprecated` 的行**——删除接口时三层同步删常量，或标 deprecated 豁免。
- 已存在可复用资产：`ExtSdkGroupMemberInfoHelper`（Java，key：`memberId/joinedTimestamp/role/namecard/nickname/avatarUrl`）与对应 ObjC category；`fetchJoinedGroupCount` 底层 `asyncGetJoinedGroupsCountFromServer` / `getJoinedGroupsCountFromServerWithCompletion:` 在双端 5.0.0 均存活（已 git grep 核实）→ 该 API 不动；`getUnreadMessageCount` RN 已有 → defer 项 N6 无动作。
- 版本现状：`package.json` 1.20.0；example 三处 1.20.0（`example/package.json`、`example/android/app/build.gradle:93` versionName、`project.pbxproj` MARKETING_VERSION ×2）；CHANGELOG 中英双份，首条固定句式记 native 依赖升级。

## 2. 已知问题清单浏览结论

| 条目 | 命中？ | 处理 |
| --- | --- | --- |
| KI-101 podspec/SPM 版本不一致 | 命中风险项 | 本次 bump 两处同步改为 5.0.0，已互核一致 |
| KI-105 cpp 常量文件滞后 | 命中 | 按仓库规范补齐 cpp 三处同步，不作契约对齐依据 |
| KI-107 `useAgoraChatDomain` 对内开关 | 未命中 | diff 双端均未出现该项，skip 条数 0；如实现期发现则不平版 |
| KI-001/002/003/106 | 验证期事项 | 阶段四实机验证时遵守（505 环境限制、脚本 timeout、消息 round-trip、注册名核对） |

## 3. native 依赖 bump 记录与 hooks

### 3.1 bump（本阶段第一步，已完成）

| 位置 | 旧 | 新 |
| --- | --- | --- |
| `ChatSdk.podspec:53` SPM `minimumVersion` | `4.24.1` | `5.0.0` |
| `ChatSdk.podspec:57` CocoaPods `s.dependency 'HyphenateChat'` | `~> 4.24.1` | `~> 5.0.0` |
| `android/build.gradle:91` | `io.hyphenate:hyphenate-chat:4.24.1` | `io.hyphenate:hyphenate-chat:5.0.0` |

互核命令输出（2026-09-15）：

```text
$ grep -n 'minimumVersion\|s.dependency' ChatSdk.podspec && grep -n 'hyphenate-chat' android/build.gradle
53:      requirement: { kind: 'upToNextMinorVersion', minimumVersion: '5.0.0' },
57:    s.dependency 'HyphenateChat', '~> 5.0.0'
91:  implementation 'io.hyphenate:hyphenate-chat:5.0.0'
```

发布状态（2026-09-16 已全部确认）：Android Maven `io.hyphenate:hyphenate-chat:5.0.0` 已由阶段四真实构建实证；iOS CocoaPods trunk 与 SPM 仓库均已发布 HyphenateChat 5.0.0（用户确认远端）。无需走本地依赖编译验证流程。

### 3.2 hooks

当前 harness（Kimi Code）hooks 事件契约与 skill 自带 Codex 契约（PreToolUse/Stop + stdin JSON 字段）不一致，盲接有误拦风险 → 按 skill「无 hooks 能力的 agent」档执行**流程强制**：

- `gate` 列为每阶段门禁必跑命令，输出原样附进阶段产物（本节与 03/04 均附）。
- `pre` 靠纪律自约束：不主动执行 git 提交类命令；验收报告标注代码「未提交」状态。

阶段二 gate 留痕：

```text
$ echo '{}' | bash /Users/asterisk/Codes/zuoyu_rn/.agents/skills/platform-sdk-porting-v2/hooks/porting_guard.sh gate react-native /Users/asterisk/Codes/zuoyu_rn/react-native-chat-sdk/.worktree/5.0.0
（无输出）gate_exit=0
```

## 4. 跨端契约（冻结）

通则：方法名 key（MT 值）、参数 JSON key、返回 JSON key、事件名与负载 key 在 TS / Java / ObjC 三处**逐字一致**；新 MT 常量四处（含 cpp）同步；新事件聚合 key 进 iOS `supportedEvents`。以下只列 include 70 条中需要契约要素的项；纯删除项列在 §5 删除清单（无新契约）。

### 4.1 client（登录与设备管理）

| 项 | 契约 |
| --- | --- |
| `MTlogin` 保留 | 仅 token 登录。TS 删除 `login()` 与 `loginWithAgoraToken()`；保留 `loginWithToken(userId, token)`。wrapper 删除 isPassword 分支，固定调 token 登录；payload 其余 key 不变 |
| 设备管理三方法 | TS 签名改为 `getLoggedInDevicesFromServer(userId, token)`、`kickDevice(userId, token, resource)`、`kickAllDevices(userId, token)`（删 `isPassword` 参数）。MT key 不变（`getLoggedInDevicesFromServer`/`kickDevice`/`kickAllDevices`）。payload key：`password` → **`token`**，其余 key（`username`/`resource`）不变。wrapper 改调 token 版 native API（iOS `getLoggedInDevicesFromServerWithUserId:token:completion:` 等；Android `fetchLoggedInDevicesFromServerWithToken`/`kickDeviceWithToken`/`kickAllDevicesWithToken`） |
| `MTonUserDidLoginFromOtherDevice` | 已是 deprecated 豁免状态，5.0 双端旧回调均删 → 三层同步删除该常量与接线；保留 `MTonUserDidLoginFromOtherDeviceWithInfo` |
| `renewAgoraToken` | native 异步 `renewToken` 双端存活 → wrapper 不动。**用户裁决（2026-09-16）：TS 公开方法改名 `renewToken`**（参数 `agoraToken`→`token`），MT 常量三层本已是 `renewToken` 不动 |

新增事件（挂连接监听组 `ChatConnectEventListener`，聚合方式同现有 `MTonConnected` 等：每事件独立 MT key、独立 addListener）：

| MT 常量（值逐字） | 事件负载 JSON | TS listener 方法 | native 来源 |
| --- | --- | --- | --- |
| `MTonDataSyncStart = 'onDataSyncStart'` | `{type: number}`（掩码值，见 4.2 枚举） | `onDataSyncStart?(type: ChatDataSyncType)` | iOS `syncDataStartWithType:`；Android `onDataSyncStart(EMDataSyncType)`（wrapper 用 `getValue()` 转 int） |
| `MTonDataSyncFinish = 'onDataSyncFinish'` | `{type: number, errorCode: number}`（0=成功；iOS 取 `error.code`，无错为 0） | `onDataSyncFinish?(type: ChatDataSyncType, errorCode: number)` | iOS `syncDataFinished:type:`；Android `onDataSyncFinish(EMDataSyncType, int)` |
| `MTonDatabaseOpened = 'onDatabaseOpened'` | `{username: string, errorCode: number}`（iOS `error?.code ?? 0`；Android 恒 0） | `onDatabaseOpened?(username: string, errorCode: number)` | iOS `onDatabaseOpened:username:`；Android `onDatabaseOpened(String)` |

三个 MTon* 均须进 `ExtSdkApiObjcRN.mm` `supportedEvents`。

连接事件收敛（用户裁决 2026-09-20，取代本节"每事件独立 MT key"通则中涉及强制下线回调的部分）：

- `ChatConnectEventListener` 的 8 个服务器强制下线回调（`onAppActiveNumberReachLimit`、`onUserDidLoginFromOtherDeviceWithInfo`、`onUserDidRemoveFromServer`、`onUserDidForbidByServer`、`onUserDidChangePassword`、`onUserDidLoginTooManyDevice`、`onUserKickedByOtherDevice`、`onUserAuthenticationFailed`）全部删除，统一为 `onDisconnected?(errorCode?: number, info?: { deviceName?: string; ext?: string })`；新增 `ChatDisconnectErrorCode` 枚举（2/8/202/206/207/213/214/216/217/220/305，值与 native `EMError` 一致）。
- 事件负载统一为 `{errorCode?: number, deviceName?: string, ext?: string}`，`deviceName`/`ext` 仅 206 携带。MT key 仅保留 `MTonDisconnected`，8 个被删事件的 MT 常量在 TS/Java/ObjC 三层同步删除（含 dispatch 的 "no implement" stub 与 `supportedEvents`）。
- Android wrapper：`onDisconnected(int)` 直接透传 code（206 跳过，由 `onLogout(int, EMLoginExtensionInfo)` 合并 deviceName/ext 后发同一 `onDisconnected` 事件）；`onLogout` 仅处理 206，修掉"每次强制下线都多发一次 WithInfo 空参数事件"的双发问题。5.0.0 源码确认 `onDisconnected(int)` 对所有码无条件触发、`onLogout` 对 8/206/207/213/214/216/217/220/305 九个码额外触发。
- iOS wrapper：`userAccountDidForcedToLogout:` 透传 `aError.code`；`userAccountDidRemoveFromServer`→207、`userDidForbidByServer`→305、`userAccountDidLoginFromOtherDeviceWithInfo:`→206+info（补 nil 保护）；`connectionStateDidChange(NO)` 发无码断开，用 `forcedLogoutPending` 标志吞掉强制下线后重复的断开回调。
- 平台差异（写进枚举注释）：8/213/220 仅 Android 可达；网络断开 iOS 无码、Android 为 2；202 在 5.0.0 双端基本无触发源（保留码位）；token 过期登出不走 `onDisconnected`，仅 `onTokenDidExpire`。

### 4.2 options（ChatOptions）

- 删除属性：`autoLogin`、`requireAck`、`enableAutoSyncContacts`（含构造函数参数与 wrapper fromJson/toJson 对应 key `autoLogin`/`requireAck`/`enableAutoSyncContacts`）。
- 新增属性 `dataSyncType`：

```ts
export enum ChatDataSyncType {
  None = 0,
  Conversations = 1,   // 1 << 0
  Contacts = 2,        // 1 << 1
  JoinedGroups = 4,    // 1 << 2
}
// ChatOptions.dataSyncType?: ChatDataSyncType（数值掩码，用法 ChatDataSyncType.Conversations | ChatDataSyncType.Contacts）
```

JSON key：`dataSyncType`（int 掩码）。iOS wrapper 直接赋 `EMOptions.dataSyncType`；Android wrapper 用 `EMDataSyncType.fromNativeMask(int)` 转 `EnumSet`。**掩码位值双端一致（1/2/4），无映射问题**。默认值差异已在迁移文档注明（iOS 默认 Conversations，Android 默认 NONE），RN 不主动设默认值、遵循 native 默认 ⚠️。
- `areaCode`：TS 接口不变（`ChatAreaCode` 数值）。Android wrapper `setAreaCode(int)` 5.0.0 已删 → 改为 int→`EMOptions.AreaCode` 枚举映射（CN=1/NA=2/EU=4/AS=8/JP=16/IN=32/GLOB=-1，switch 实现）；iOS 无变化。

### 4.3 已读回执体系（message/chat，本次最大改动块）

**删除**（三层同步删，含 MT 常量、TS 方法、wrapper 方法、dispatch case）：`MTackMessageRead`、`MTackGroupMessageRead`、`MTackConversationRead`、`MTmarkAllChatMsgAsRead`、`MTmarkMessageAsRead`、`MTmarkAllMessagesAsRead`、`MTasyncFetchGroupAcks`、`MTgroupAckCount`；对应 TS 方法 `sendMessageReadAck`/`sendGroupMessageReadAck`/`sendConversationReadAck`/`markAllConversationsAsRead`/`markMessageAsRead`/`markAllMessagesAsRead`/`fetchGroupAcks`/`groupAckCount`。

**删除事件**：`MTonMessagesRead`、`MTonGroupMessageRead`、`MTonConversationHasRead`、`MTonReadAckForGroupMessageUpdated` 及 `ChatMessageEventListener` 的 `onMessagesRead`/`onGroupMessageRead`/`onConversationRead`；wrapper 删除对应 native 回调的注册与发射。（`onReadReceiptForGroupMessageUpdated` 在 native 5.0.0 **不存在**，迁移文档说法错误，不平版——交叉验证矛盾 1。）

**新增 API**：

| TS 方法 | MT key（值逐字） | 请求 payload（内层） | 返回 payload | 备注 |
| --- | --- | --- | --- | --- |
| `sendMessageReadReceipts(msgIds: string[]): Promise<void>` | `sendMessageReadReceipts` | `{msg_ids: string[]}` | 无 | wrapper 按 msgId 逐个查库取消息对象后调 native 批量接口；约束写进注释：≤50 条、同一会话、仅 `isNeedReadReceipt=true` 的消息生效 |
| `clearConversationUnreadMessageCount(convId: string): Promise<void>` | `clearConversationUnreadMessageCount` | `{convId: string}` | 无 | 只清本地未读数+同步多设备，不发已读回执 |
| `clearAllConversationUnreadMessageCount(): Promise<void>` | `clearAllConversationUnreadMessageCount` | `{}` | 无 | 同上 |
| `getGroupMessageReadReceipts(msgIds: string[]): Promise<ChatMessageReadReceipt[]>` | `getGroupMessageReadReceipts` | `{msg_ids: string[]}` | `{getGroupMessageReadReceipts: [{...receipt}]}` | ≤20 条、同一会话 |
| `fetchGroupMessageReadReceipts(msgId, groupId, cursor?, pageSize?): Promise<ChatCursorResult<ChatGroupReadReceipt>>` | `fetchGroupMessageReadReceipts` | `{msg_id, group_id, receipt_id, pageSize}` | `{fetchGroupMessageReadReceipts: {cursor, list, totalCount?}}` | 替代 `fetchGroupAcks`；Android 5.0 无 groupId 参数（wrapper 收下不用）⚠️；`totalCount` 仅 iOS 有，TS 侧 optional ⚠️ |

**新增事件**：`MTonMessageReadReceipts = 'onMessageReadReceipts'`，负载 `{receipts: [{...}]}`；ChatManager 按消息事件惯例单独 addListener；`ChatMessageEventListener.onMessageReadReceipts?(receipts: ChatMessageReadReceipt[])`。进 iOS `supportedEvents`。

**新增/改名模型**：

```ts
// 新增 src/common/ChatMessageReadReceipt.ts（native JSON → 构造）
class ChatMessageReadReceipt { msgId: string; convId: string; isPeerReceipt: boolean; readCount: number; }
// JSON keys：msg_id / conv_id / isPeerReceipt / readCount

// 改名 src/common/ChatGroup.ts 内 ChatGroupMessageAck → ChatGroupReadReceipt
class ChatGroupReadReceipt { msgId: string; ackId: string; from: ChatGroupMemberInfo; count: number; timestamp: number; }
// JSON keys：msg_id / ack_id / from / count / timestamp（content 删除；from 由 string 变为对象）

// 新增 ChatGroupMemberInfo（复用既有 wrapper 序列化 key）：memberId / joinedTimestamp / role / namecard? / nickname? / avatarUrl?
// TS 字段同名；role 用既有 ChatGroupPermissionType 枚举转换路径
```

**ChatMessage 属性改名（JSON key 同步改）**：

| 旧（TS 属性 / JSON key） | 新（TS 属性 / JSON key） | 双端 wrapper 映射 |
| --- | --- | --- |
| `hasReadAck` / `hasReadAck` | `isPeerRead` / `isPeerRead` | iOS `isPeerRead`；Android `isPeerRead()`。只读：fromJson 不再 set（setter 已包私有/只读） |
| `hasRead` / `hasRead` | `isRead` / `isRead` | **直接映射，双端均不取反** ⚠️ Android 旧代码 `!message.isUnread()` 必须删（语义反转点，交叉验证 N2）；iOS `isRead` 本就正向 |
| `needGroupAck` / `needGroupAck` | `isNeedReadReceipt` / `isNeedReadReceipt` | iOS `isNeedReadReceipt`；Android `isNeedReadReceipt()` / `setIsNeedReadReceipt()`（**唯一保留的公开 setter**，fromJson 保留该 set） |
| `groupAckCount` / `groupAckCount` | `groupReadReceiptCount` / `groupReadReceiptCount` | iOS `groupReadReceiptCount`；Android `readReceiptCount()`。只读 |

### 4.4 群组配置模型重构（group）

- **删除** TS `ChatGroupStyle` 枚举与 `ChatGroupOptions` 类；删除已 deprecated 的 `createGroup()`（旧签名）。
- **新增**：

```ts
class ChatGroupConfigs {
  maxCount: number;            // 默认 200
  inviteNeedConfirm: boolean;
  ext?: string;
  isPublic: boolean;           // 默认 false
  joinApprovalRequired: boolean;
  allowInvites: boolean;
}
// JSON keys（双端 wrapper 逐字一致）：maxCount / inviteNeedConfirm / ext / isPublic / joinApprovalRequired / allowInvites

enum ChatGroupConfigsType {   // 掩码位序以 iOS 为准绳
  AllowInvites = 1,           // 1<<0
  MaxUsers = 2,               // 1<<1
  InviteNeedConfirm = 4,      // 1<<2
  JoinApprovalRequired = 8,   // 1<<3
  IsPublic = 16,              // 1<<4
  Ext = 32,                   // 1<<5
}
```

⚠️ Android 枚举位序与 iOS **不同**（IS_PUBLIC=1<<0…）：iOS wrapper 直接透传掩码；**Android wrapper 必须逐位映射**到 `EnumSet<EMGroupConfigsType>`，不得直接 `toNativeMask`。

- `ChatGroup.options?: ChatGroupOptions` → **`ChatGroup.configs?: ChatGroupConfigs`**；JSON key `options` → **`configs`**。wrapper 群序列化改写：iOS 读 `EMGroup.settings`（EMGroupConfigs）；Android 用 `EMGroup` 各 getter（`isPublic()`/`isJoinApprovalRequired()`/`isMemberAllowToInvite()`/`getMaxUserCount()` 等，实现期按 5.0.0 可用 getter 核对）。`isDisabled` 保留在 `ChatGroup` 顶层（来自 `EMGroup.isDisabled`，不属于 configs）。
- `createGroupEx(params)`：参数 `options?: ChatGroupOptions` → `configs?: ChatGroupConfigs`；payload 内层 key `options` → `configs`（其余 key `groupName/groupAvatar/desc/inviteMembers/inviteReason` 不变，avatar 双端已通）。MT key `createGroup` 不变。
- **新增** `updateGroupConfigs`：

| TS 方法 | MT key | payload | 返回 |
| --- | --- | --- | --- |
| `updateGroupConfigs(groupId: string, types: ChatGroupConfigsType, configs: ChatGroupConfigs): Promise<ChatGroup>` | `updateGroupConfigs` | `{group_id: string, types: number(掩码), configs: {...}}` | `{updateGroupConfigs: {...group json}}` |

- **删除**：`fetchPublicGroupsFromServer`（`MTgetPublicGroupsFromServer`）、`fetchJoinedGroupsFromServer`（`MTgetJoinedGroupsFromServer`）及对应 wrapper 方法。
- **事件**：`onRequestToJoinDeclined` 负载增加 `applicant`（双端 5.0 回调均带申请者 ID；iOS `joinGroupRequestDidDecline:reason:decliner:applicant:` / Android `onRequestToJoinDeclined(..., applicant)`）。旧单成员回调（`userDidJoinGroup:user:`/`onMemberJoined` 单参版等）native 已删，wrapper 若仍有残留注册一并清除（RN 自 4.15 起已用多成员版，预期无 TS 改动）。

### 4.5 会话（conversation）

- **删除服务端拉取**：`fetchAllConversations`（`MTgetConversationsFromServer`）、`fetchConversationsFromServerWithPage`（Consts.ts:109 对应常量）、`fetchConversationsFromServerWithCursor`（`MTgetConversationsFromServerWithCursor`）、`fetchPinnedConversationsFromServerWithCursor`（Consts.ts:118 对应常量）及 wrapper 方法。
- **删除** `MTfetchHistoryMessages`（旧分页 API 的 deprecated TS 方法 `fetchHistoryMessages`）；`fetchHistoryMessagesByOptions`（`MTfetchHistoryMessagesByOptions`）保留（4.24.1 已是新 API）。
- `conversation_name_avatar`：双端 5.0 新增 `conversationName`/`conversationAvatar`。RN 已有 TS 侧 `ChatConversation.name()` 异步 helper → 决策：**wrapper 会话 toJson 增加 key `name`/`avatar`**（iOS 调 `conversationName`/`conversationAvatar` 方法，Android 调 `getConversationName()`/`getConversationAvatar()`），TS `ChatConversation` 新增只读属性 `displayName?`/`displayAvatar?`（避开与既有 `name()` 方法冲突）⚠️ 命名映射记验收报告；既有 `name()` 方法不动。
- 会话列表回调迁移（iOS `EMConversationDelegate` 独立协议）：RN 事件层无感知（现有 `MTonConversationChanged` 等不变），仅 iOS wrapper 注册位置改为 `addConversationDelegate:delegateQueue:`；Android 仍 `EMConversationListener`。实现期核对。

### 4.6 联系人（contact）

- **删除**：`getAllContactsFromServer`（`MTgetAllContactsFromServer`）、`fetchAllContacts`（`MTfetchAllContacts`）、`fetchContacts`（`MTfetchContacts`）及 wrapper 方法；保留本地 `getAllContactsFromDB`。
- **删除事件**：`ChatContactEventListener.onContactSyncStart`/`onContactSyncFinish`；wrapper 停止发射这两个 type（`onContactChanged` 聚合 key 保留，其余 type 不变）。替代路径 = 4.1 的连接级 `onDataSyncStart/Finish`（type 含 Contacts 位）。

### 4.7 聊天室（room）

- 删除：`createChatRoom`（`MTcreateChatRoom`）、`destroyChatRoom`（`MTdestroyChatRoom`）三层。**用户裁决（2026-09-16）：`getAllChatRooms` 三端删除不保留**（TS 公开方法本不存在，清残余 MT 常量；Java/objc wrapper、dispatch、常量全删）。其余 room API 不动。

### 4.8 其他 include 项处理备忘

| 项 | 决策 |
| --- | --- |
| `chat_modify_message`（加 ext 参数） | TS `modifyMessage(msgId, body, ext?)` 增加可选 `ext`；payload 增加 key `ext`（可选）；wrapper 解析并调四参 native 版。MT key `modifyMessage` 不变 |
| `chat_report_message` | 三层删除 `MTreportMessage` 与 `reportMessage` |
| `client_statistics_module` | RN 三层均无 → 无动作（核对后关闭） |
| `multidevice 事件 65/66` | TS 多设备事件枚举增加 `ConversationUnreadMessageCountCleared = 65`、`AllConversationUnreadMessageCountCleared = 66`（事件 int 透传链路不变，仅枚举与注释） |
| `error_contact_add_faild_typo` | RN 按数值 code 映射错误（`ChatError.code`），iOS 枚举改名值不变 → 无动作（阶段三 grep 核实后关闭） |
| `chat_get_unread_message_count`（N6） | RN 已有 `getUnreadMessageCount` → 无动作；统计范围行为变化写进 CHANGELOG ⚠️ |
| `client_auto_login_behavior` 行为变化 | RN 无自动登录代码路径 → 无动作；行为变化写 CHANGELOG |

## 5. 删除清单汇总（三层同步删除的 MT 常量）

client：`MTcreateAccount`、`MTloginWithAgoraToken`、`MTisLoggedInBefore`、`MTonUserDidLoginFromOtherDevice`（本已 deprecated）
chat/message：`MTackMessageRead`、`MTackGroupMessageRead`、`MTackConversationRead`、`MTmarkAllChatMsgAsRead`、`MTmarkMessageAsRead`、`MTmarkAllMessagesAsRead`、`MTasyncFetchGroupAcks`、`MTgroupAckCount`、`MTreportMessage`、`MTfetchHistoryMessages`、`MTonMessagesRead`、`MTonGroupMessageRead`、`MTonConversationHasRead`、`MTonReadAckForGroupMessageUpdated`
conversation：`MTgetConversationsFromServer`、`MTgetConversationsFromServerWithCursor`、Consts.ts:109/118 对应的分页/置顶常量
group：`MTgetJoinedGroupsFromServer`、`MTgetPublicGroupsFromServer`
contact：`MTgetAllContactsFromServer`、`MTfetchAllContacts`、`MTfetchContacts`
room：`MTcreateChatRoom`、`MTdestroyChatRoom`

新增 MT 常量：`sendMessageReadReceipts`、`clearConversationUnreadMessageCount`、`clearAllConversationUnreadMessageCount`、`getGroupMessageReadReceipts`、`fetchGroupMessageReadReceipts`、`updateGroupConfigs`、`onDataSyncStart`、`onDataSyncFinish`、`onDatabaseOpened`、`onMessageReadReceipts`。

删除纪律：能三层同步删净的直接删；有外部引用风险或需保留兼容的一律按仓库契约测试惯例标 `// deprecated` 豁免（默认选「删净」，5.0.0 是主版本，不留兼容层）。

## 6. defer 项处理原则（101 条不实施，进验收报告待用户决策）

- iOS 群组/联系人/push 同步方法批量删除（约 45 条）：RN 只用异步封装，**预期无需处理**，实现期如编译暴露残留引用再个案清除并记录。
- Android 独有变更（30 条）：逐条核对 RN 是否封装（如 `getDeviceInfo` 不平版、`asyncDeleteConversations` RN 未封装等），核对结果写进 03-implementation.md。
- 实现期因 bump 5.0.0 导致的**编译强制改动**（wrapper 引用了已删 native API）不受 defer 限制，必须改通，逐条记录。

## 7. 待决策（2026-09-16 用户已全部裁决，结果记录于验收报告 §5）

1. ~~`renewAgoraToken` 是否改名 `renewToken`~~ → **裁决：改名**，已实施。
2. ~~`ChatMessage.hasReadAck→isPeerRead` 等四个属性改名~~ → **裁决：接受**。
3. ~~`fetchGroupMessageReadReceipts` 跨端差异~~ → **裁决：接受，TS 保持现状**。
4. ~~defer 101 条逐条确认~~ → **裁决：按默认批量通过「无需处理」**。
5. ~~`dataSyncType` 双端默认值不一致~~ → **裁决：接受，RN 不设显式默认**。

追加裁决（同批）：
- **`autoLoginDidCompleteWithError:`（iOS）**：契约层面**标记作废、本条目不删除**（用户裁决：契约暂时保留标记）；实现层 iOS wrapper 已删除该 delegate 及其派发的 `activeNumbersReachLimitation`（native 5.0.0 已无触发源，`userDidForbidByServer` 有独立 delegate 保留）。副作用：TS 事件 `onAppActiveNumberReachLimit` 自此仅 Android 可触发（Android wrapper 由断连错误码 8 触发，native 错误码仍存活）——保留该事件，跨端差异写入 CHANGELOG。（2026-09-20 更新：此裁决已被"连接事件收敛"取代——`onAppActiveNumberReachLimit` 连同其余 7 个强制下线回调全部删除，统一为 `onDisconnected(errorCode)`，见 §4.1 末尾。）
- **RN 自身 deprecated API 17 处一并删除**；`ChatAreaCode`/`ChatDataSyncType` 枚举并入 `ChatOptions.ts`；`fetchConversationsByOptions` 的 `EMConversationFilter` 残留（iOS Json category）删除。
