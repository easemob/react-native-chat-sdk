# 5.0.0 平版 · 阶段三：分层实现记录（React Native）

- 契约依据：`02-contract.md`（已冻结）；变更清单：`01-api-diff.md`
- 实施方式：契约冻结后三个子代理并行（TS 层 / Android wrapper+cpp / iOS wrapper），文件边界互斥；主代理负责收尾（版本号、CHANGELOG、example/ci 脚本、AGENTS.md 滞后条目）与全量静态验证。
- 子代理模型：与主代理同级（kimi-code/k3）。

## 1. 各层实施摘要

### TypeScript 层（src/**、example/src/**）

- `Consts.ts`：删 26 个 MT 常量（契约 §5 全清单）；新增 10 个（值逐字按契约）。
- `ChatClient.ts`：删 `login`/`loginWithAgoraToken`/`createAccount`/`isLoginBefore`；设备管理三方法改 token 鉴权（payload key `password`→`token`）；新增 `onDataSyncStart`/`onDataSyncFinish`/`onDatabaseOpened` 三事件订阅与分发；删 `MTonUserDidLoginFromOtherDevice` 接线。
- `ChatManager.ts`：删 14 个旧方法；新增 5 个（`sendMessageReadReceipts`/`clearConversationUnreadMessageCount`/`clearAllConversationUnreadMessageCount`/`getGroupMessageReadReceipts`/`fetchGroupMessageReadReceipts`，约束写进 TypeDoc）；`modifyMessageBody` 加 `ext?`；事件订阅删 4 加 `onMessageReadReceipts`。
- 模型：新增 `ChatMessageReadReceipt`/`ChatGroupMemberInfo`/`ChatDataSyncType`；`ChatGroupMessageAck`→`ChatGroupReadReceipt`（`from` 变 `ChatGroupMemberInfo`，删 `content`）；删 `ChatGroupStyle`/`ChatGroupOptions`，新增 `ChatGroupConfigs`+`ChatGroupConfigsType`（位序 1/2/4/8/16/32 以 iOS 为准绳）；`ChatGroup.options`→`configs`，`isDisabled` 提升顶层；`ChatMessage` 四属性改名（`isPeerRead`/`isRead`/`isNeedReadReceipt`/`groupReadReceiptCount`）；`ChatConversation` 加 `displayName?`/`displayAvatar?`；`ChatCursorResult` 加 `totalCount?`；`ChatOptions` 删 3 属性加 `dataSyncType`。
- `ChatGroupManager.ts`：`createGroupEx` 参数/payload `options`→`configs`；新增 `updateGroupConfigs`；删 `createGroup`/`fetchJoinedGroupsFromServer`/`fetchPublicGroupsFromServer`。
- `ChatContactManager.ts`/`ChatRoomManager.ts`：按契约删方法与事件分支。`ChatEvents.ts`：listener 接口同步增删；多设备事件枚举加 65/66。
- `index.ts` 三行新导出；单测同步更新（models/ChatManager.events/ChatClient 用例）。

### Android wrapper（modules/java/** + modules/cpp/common）

- 常量：删 31 / 新增 10；dispatch case 同步；cpp 常量同步（cpp 为 Java 子集）。
- Client：login 固定 token；设备管理三方法调 token 版（`getLoggedInDevicesFromServer` 编译强制改异步 `fetchLoggedInDevicesFromServerWithToken`）；连接监听器新增三数据同步事件发射；删 `onLogout(int,String)` override。
- Chat：删 11 个旧方法；新增 5 个（`msg_ids` 逐个查库取消息对象后调批量接口）；消息监听器改 `onMessageReadReceipts`；会话监听器删 `onConversationRead`。
- 序列化（ExtSdkHelper）：消息四 key 改名——**`isRead` 直接映射不取反（旧 `!isUnread()` 已删，N2 语义反转点已处理）**；fromJson 仅保留 `setIsNeedReadReceipt`（其余 setter 已包私有）；`ExtSdkGroupAckHelper`→`EMGroupReadReceipt`，新增 `ExtSdkMessageReadReceiptHelper`；`ExtSdkGroupOptionsHelper`→`ExtSdkGroupConfigsHelper`（六 key）；群 toJson `options`→`configs`；options 删 3 key 加 `dataSyncType`（`fromNativeMask`）；`areaCode` 改 int→`AreaCode` 枚举映射（含 GLOB(-1) 兜底）。
- Group：createGroup 改 configs；`updateGroupConfigs` **逐位掩码映射**到 `EnumSet<EMGroupConfigsType>`（未直接 toNativeMask，Android 位序不同）；删服务端拉取两方法；`getJoinedGroups` 删 `loadAllGroups()` 调用（编译强制，5.0 已包私有）。
- Contact/Room：按契约删方法；`removeChatRoomListener`→`removeChatRoomChangeListener`（编译强制）。
- **已用真实 `hyphenate-chat:5.0.0` AAR（Maven Central）离线 javac 编译验证通过，0 error**。

### iOS wrapper（modules/objc/**）

- 常量四层（h key/value、m methodMap、dispatch case、supportedEvents）同步删 29 / 增 10。
- Client：login 固定 `loginWithUsername:token:completion:`；设备管理三方法 token 版；新增三数据同步回调发射；删旧多端登录回调。
- Chat：删 10+ 旧方法；新增 5 个（`fetchGroupMessageReadReceipts` 返回 `{cursor,list,totalCount}`）；delegate 改 `onMessageReadReceipts:`；**`conversationListDidUpdate:` 迁移到 `EMConversationDelegate` 协议**，注册改 `addConversationDelegate:delegateQueue:`。
- 序列化（ExtSdkToJson）：消息四 key 改名，fromJson 仅留 `isNeedReadReceipt`；`EMGroupMessageAck (Json)`→`EMGroupReadReceipt (Json)`，新增 `EMMessageReadReceipt (Json)`；`EMGroupOptions (Json)`→`EMGroupConfigs (Json)`；群 toJson `options`→`configs`（读 `EMGroup.settings`）；EMOptions 删 3 加 `dataSyncType`；EMConversation toJson 加 `name`/`avatar`。
- Group：`updateGroupConfigs` 掩码直传（iOS 位序与契约一致）；删单成员版加入/离开回调。
- 编译强制改动 5 处（mergeMessage 只读属性、resendMessage→sendMessage、updateImPushStyle 改 completion 版、删 getGroupsWithoutPushNotification wrapper、群 toJson 删 noticeEnable/style/isMemberOnly key）。

## 2. ⚠️ 推断项汇总（随验收报告上交）

1. TS `modifyMessageBody` 加 `ext`（契约写的方法名是 `modifyMessage`，现存承载方法是 `modifyMessageBody`）；`modifyMsgBody` 本就带 ext 不动。
2. `loginWithToken` payload 保留 `isPassword: false` key（wrapper 忽略）。
3. `ChatGroupMemberInfo.role` 直接 int 赋值（镜像 `ChatGroupMember` 既有做法，避免循环引用）。
4. `fetchGroupMessageReadReceipts` 默认 `pageSize ?? 20`、`cursor ?? ''`（照既有分页惯例）。
5. `removeMessagesFromServerWithMsgIds/WithTimestamp` 的 `isLoginBefore()` 守卫改为 `isConnected()`（原方法已删）。
6. `ChatGroup.isDisabled` JSON key 假设为顶层 `isDisabled`。
7. Android 群 toJson `configs.inviteNeedConfirm` 不下发（`EMGroup` 5.0.0 无该 getter）；TS 侧按 optional 容忍。
8. Android options toJson 补 `dataSyncType`（对称推断）；iOS login payload key 仍为 `pwdOrToken`（与 TS 核对一致）。
9. 聊天室 `onMuteListAdded` 事件仅余 Map 版（`muteKVs`），旧 `mutes`/`expireTime` 负载不再下发（native 行为变化）。
10. iOS `autoLoginDidCompleteWithError:` wrapper 实现成无触发源死代码（可编译）；`onAppActiveNumberReachLimit` 无触发源。
11. 群成员事件此后只发数组版 `{members:[...]}`（单成员版回调 native 已删）。
12. `EMConversationFilter (Json)` category（ObjC）无调用方但保留（native 类仍存在，不影响编译）。

## 3. 契约空白的裁决记录

- **`fetchConversationsByOptions`**：底层 native 接口双端全删且无替代 → 主代理裁决**三层删净**（含 TS 方法、MT 常量、dispatch case、wrapper stub、`ChatConversationFetchOptions` 模型类）。已执行完毕，grep 三层零残留。
- **`getAllChatRooms`**：仅 Android native 删除、iOS 保留 → 跨端分歧不进契约，Android wrapper 降级为报错 `"getAllChatRooms is not supported by the native SDK."`（MT/dispatch 保留），iOS 正常。**进待决策清单**。

## 4. 主代理收尾

- `package.json` version 1.20.0→5.0.0；`yarn gen:version_file` 重新生成 `src/version.ts`（VERSION='5.0.0'）。
- example 三处版本：example/package.json 5.0.0、versionName "5.0.0"（versionCode 2→3）、MARKETING_VERSION 5.0.0 ×2（CURRENT_PROJECT_VERSION 2→3）。
- CHANGELOG.md / CHANGELOG.zh.md 双语 5.0.0 条目（首条 native 依赖升级，含全部 breaking change 说明）。
- `example/ci/no_login_smoke.json`/`single_account.json`/`port_4_24_1.json`：替换已删 API 引用（→ getAllConversations/getAllContacts/getJoinedGroups/searchMessagesFromServer），移除 init 块中 `autoLogin` key。⚠️ no_login_smoke 中 contact/group 本地读步骤的 `errorCode: 201` 预期为推断值，阶段四跑 `smoke_local.sh` 实证校准。
- AGENTS.md 滞后条目：HyphenateChat 4.18.1→5.0.0；demo2 引用改为 API tester 现状描述。

## 5. 静态检查（主代理亲自执行，2026-09-15）

| 检查项 | 结果 |
| --- | --- |
| `yarn typecheck` | ✅ 0 error |
| `yarn lint` | ✅ 通过 |
| `yarn check:circular:dpdm` | ✅ no circular dependency |
| `yarn test --no-watchman` | ✅ 19 suites / 110 tests 全过（含 contract：TS⊆Java⊆ObjC、methodMap、supportedEvents 全对齐） |

阶段三 gate 留痕：

```text
$ echo '{}' | bash /Users/asterisk/Codes/zuoyu_rn/.agents/skills/platform-sdk-porting-v2/hooks/porting_guard.sh gate react-native /Users/asterisk/Codes/zuoyu_rn/react-native-chat-sdk/.worktree/5.0.0
（无输出）gate_exit=0
```

## 6. 变更清单状态回填口径

- include 70 条：已实现（含编译强制改动），逐条状态在验收报告二维表中呈现。
- defer 101 条：按契约 §6 原则核对——iOS 群组/联系人/push 同步删除、Android 独有条目等，RN 封装层核对结果逐条列入验收报告（多数为「RN 未封装，无需处理」）。
- skip 0 条。

## 7. 第二轮：审查决策落实（2026-09-16）

用户审查验收报告后给出裁决（见 acceptance-report.md §3/§5），本轮按裁决落实，三层各一个子代理并行实施：

**TS 层：**
- `ChatClient.renewAgoraToken` → `renewToken(token)`（TypeDoc 去 Agora 化；native 载荷键 `agora_token` 保留，Java wrapper 仍读该键）。
- `ChatAreaCode`/`ChatDataSyncType` 独立文件删除，枚举并入 `src/common/ChatOptions.ts`（index.ts 经 `export * from './common/ChatOptions'` 带出）。
- RN 自身 17 处 `@deprecated` 全部删除（事件 3、方法 12、属性 2、构造入口 1 类），连带删除 Consts.ts 死常量 6 个（`MTmodifyMessage`/`MTgetAllChatRooms`/`MTonMessagesRecalled`/`MTonMessageReadAck`/`MTonMessageDeliveryAck`/`MTonMessageStatusChanged`）；`ChatOptions` 公开构造函数私有化（入口只剩 `withAppKey`/`withAppId`）；example 两处 `new ChatOptions(...)` 改工厂方法。
- 行为变化 TypeDoc 注释（决策 a7）：`ChatManager.getUnreadCount`（统计收窄口径与替代累加方案）、`ChatManager.getMessage`（不再自动标已读）。
- `getAllChatRooms`：TS 公开方法本不存在，删除残余死常量 `MTgetAllChatRooms`。

**Android + cpp 层：**
- `getAllChatRooms` 删净（ExtSdkMethodType.java / ExtSdkDispatch.java case / ExtSdkChatRoomManagerWrapper.java 方法 / cpp ExtSdkMethodType.h/.cpp）。
- EMConversationFilter：Android 侧零残留（无 helper 文件）。
- 聊天室禁言事件：wrapper 已是 Map 版（`muteKVs`），与 native `EMChatRoomChangeListener.onMuteListAdded(String, Map)` 一致，无旧负载残留。
- **决策 a5 已关闭（用户复审裁决 2026-09-16，未改代码）**：初裁「Android searchMsgFromDB 已作废、迁移 asyncSearchMsgFromDB」前提不成立——native 5.0.0 仅删除 `EMConversation#searchMsgFromDB(..., EMMessageSearchScope)` 一个同步重载（其异步版 wrapper 早已使用）；其余 5 个同步调用点对应重载在 5.0.0 均存活且未标 `@Deprecated`，且 `EMChatManager` 不存在任何 `asyncSearchMsgFromDB`、EMConversation 也无对应异步重载——没有可迁移的异步版本。用户复审确认保持现状，不做任何改动。
- `yarn example build:android` BUILD SUCCESSFUL。

**iOS 层：**
- `getAllChatRooms` 删净（key/Value/methodMap/dispatch case/wrapper .h+.m/supportedEvents 清单，共 6 文件）。
- `EMConversationFilter (Json)` category 删除（ExtSdkToJson.h import+声明、.m 实现，无其他调用方）。
- `autoLoginDidCompleteWithError:` 删除（native 证据：EMClientDelegate sdk-5.0 已删此方法）；`activeNumbersReachLimitation` 无其他触发源一并删除；`userDidForbidByServer` 保留（native EMClientDelegate.h:103 独立 delegate 仍在）。
- EMConversation toJsonObject 的 name/avatar 加 nil 防护（nil 则不放 key，与 TS optional 语义一致；native EMConversation.h:253/:261 `_Nullable` 佐证）。
- 全部 11 个 wrapper 的 .h/.m 声明实现程序化比对，零残留。
- `yarn example build:ios` 成功（SPM 路径）。

**主代理裁决（记录待用户确认）：** `onAppActiveNumberReachLimit` 事件**保留**——Android 触发路径仍存活（native 错误码 8 `APP_ACTIVE_NUMBER_REACH_LIMITATION` 在 5.0.0 存在，wrapper 由 `onDisconnected(8)` 触发），iOS 无触发源；跨端差异已写 CHANGELOG。
