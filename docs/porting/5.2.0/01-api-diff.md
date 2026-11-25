# 01 - 公开 API Diff：native iOS 5.1.0 → 5.2.0 / Android 5.1.0 → 5.2.1（React Native 平版）

- 源仓库 iOS：`/Users/asterisk/Codes/zuoyu_native/emclient-ios`，`refs/tags/5.1.0..refs/tags/5.2.0`
- 源仓库 Android：`/Users/asterisk/Codes/zuoyu_native/emclient-android`，`refs/tags/SDK_5.1.0..refs/tags/SDK_5.2.1`
- diff 范围：iOS `newSDK/HyphenateSDK/` 公开头文件（排除 `*+Internal.h` / `*+Private.h`）；Android `hyphenatechatsdk/src/com/hyphenate/` 公开类（`adapter/`、`core/` 除外）
- 版本区间核对（`git tag` 列表）：
  - iOS：`5.0.0 5.1.0 5.2.0`，5.1.0 → 5.2.0 之间无中间 tag，单跳覆盖，无跳版（公开头文件 14 个文件）。
  - Android：`SDK_5.0.0 SDK_5.1.0 SDK_5.2.0 SDK_5.2.1`，分两跳逐一覆盖：`SDK_5.1.0→SDK_5.2.0`（公开类 13 个文件）、`SDK_5.2.0→SDK_5.2.1`（仅 `EMClient.VERSION` 常量 1 行，无公开 API 变更）。
- 目标平台：react-native（`react-native-chat-sdk`，worktree `.worktree/5.2.0`，分支 `5.2.0` 基于 `5.x`@`3db01ff`）
- 本次版本主线：**多消息体（复合消息）**、**连接状态三态 `connectionState`**、**断开通知延迟阈值 `disconnectNotifyThreshold`**。

## 变更清单

决策取值：`include` 平版 / `skip` 不平版 / `defer` 待用户决策（见未匹配清单）。状态：`pending` → `implemented`（代码就位，静态与 JS 门禁通过）→ `verified`（原生构建与设备运行通过）。

### 多消息体（领域：chat）

| id | 类型 | iOS 源签名 | Android 源签名 | 决策 | 状态 |
|---|---|---|---|---|---|
| `msg_type_multibody` | new_enum | `EMMessageBody.h`：`EMMessageBodyTypeMultiBody`（仅用于 `contentType`，非具体 body 类型） | `EMMessage.Type.MULTIBODY`（`getType()` 在 bodies>1 时返回） | include（RN 形态见 UM-5） | implemented |
| `msg_bodies` | new_property | `EMChatMessage.h`：`@property (nonatomic, strong) NSArray<EMMessageBody *> *bodies`（读写，首元素即 `body`） | `EMMessage.getBodies()`（返回不可变 `List<EMMessageBody>`） | include | implemented |
| `msg_content_type` | new_property | `EMChatMessage.h`：`@property (nonatomic, readonly) EMMessageBodyType contentType`（多 body → `MultiBody`；单 body → 该 body 类型；无 body → `Text`） | `EMMessage.getContentType()`（等价 `getType()`） | include | implemented |
| `msg_set_bodies` | new_api | `setBodies:`（`bodies` 属性 setter，整体校验，失败不修改并打日志） | `EMMessage.setBodies(List<EMMessageBody>)`（空/含 null → 打日志返回） | include（RN 映射为 `ChatMessage.bodies` 字段赋值，不另建方法，见 02 契约） | implemented |
| `msg_append_body` | new_api | `- (void)appendBody:(EMMessageBody *)body`（追加后整体校验） | `EMMessage.appendBody(EMMessageBody)`（`emaObject.addBody` + 追加 `bodyList`；类型组合在发送准入时校验，不在追加时校验，见 UM-2/UM-6） | include（RN 映射为对 `ChatMessage.bodies` 数组 `push`，不另建方法，见 02 契约） | implemented |
| `msg_create_with_bodies` | new_api | `- (instancetype)initWithConversationID:bodies:ext:` | `static EMMessage.createMultiBodySendMessage(String to, List<EMMessageBody> bodies)` | include | implemented |
| `msg_body_first_semantics` | behavior | `body` 语义改为"首个消息体 = `bodies[0]`"；`setBody:` 改为整体替换为单元素列表 | `getBody()` 返回 `bodyList[0]`；`setBody` 整体替换；`addBody` 新增同步追加 Java 侧 `bodyList`（写 `emaObject` 为既有行为） | include（RN 单 `body` 字段语义保持，文档注明首个） | implemented |
| `msg_body_limit_20` | behavior | 发送时 `bodies.count > 20` → `EMErrorMessageInvalid`，描述 `body count exceeds configured limit 20` | 同：`EMError.MESSAGE_INVALID`，`body count exceeds configured limit 20` | include（RN 不拦截，错误码以 native 为准，见"通用平版规则"） | implemented |
| `msg_multibody_progress_doc` | doc_only | `IEMChatManager.h`：`sendMessage` / `downloadMessageThumbnail` / `downloadMessageAttachment` / `downloadMessageBigImage`（语义：多附件进度为消息级 0–100 加权聚合；各 body 类型下载行为表；结果按请求只回调一次，任一失败终止剩余） | `EMChatManager`：下载按 body 逐个处理（`checkContentAttachmentExist(..., bodyIndex)`），多 body 时本地文件名加 `body_<i>_` 前缀；`UriUtils.getMessageAttachmentLocalPath` 增 `bodyIndex` 参数 | include（仅 TS 注释同步，无签名变化） | implemented |

### 连接状态（领域：client）

| id | 类型 | iOS 源签名 | Android 源签名 | 决策 | 状态 |
|---|---|---|---|---|---|
| `client_connection_state` | new_api | `EMClient.h`：`@property (nonatomic, readonly) EMConnectionState connectionState`（未初始化返回 `Disconnected`） | `EMClient.getConnectionState()` → `EMConnectionState`（未初始化/已登出/未知值 → `DISCONNECTED`） | include（RN 形态见 UM-3） | implemented |
| `client_connection_state_enum` | new_enum | `EMClientDelegate.h`：`EMConnectionState` 新增 `EMConnectionConnecting = 2`（`Connected = 0`，`Disconnected = 1`） | 新增 `chat/EMConnectionState`：`DISCONNECTED`(0) / `CONNECTING`(1) / `CONNECTED`(2) | include（**两端数值序不同**，见 UM-3） | implemented |
| `client_is_connected_deprecated` | deprecated | `isConnected` 标记 `__deprecated_msg("Use -connectionState instead")` | `isConnected()` 标记 `@Deprecated` | include（已决 UM-4：保留 `ChatClient.isConnected()`，加 `@deprecated` 指向 `getConnectionState()`） | implemented |
| `conn_listener_deferred_disconnect_doc` | doc_only | 无头文件变化（行为见 `EMOptions.disconnectNotifyThreshold` 文档） | `EMConnectionListener` 注释：可恢复断开在阈值内不回调 `onDisconnected`，致命错误立即回调；UI 展示连接状态请用 `getConnectionState()` | include（`ChatConnectEventListener` 注释同步；事件签名不变） | implemented |
| `options_disconnect_notify_threshold` | new_option | `EMOptions.h`：`@property (nonatomic) NSInteger disconnectNotifyThreshold`（默认 10，单位秒） | `EMOptions.setDisconnectNotifyThreshold(int seconds)` / `getDisconnectNotifyThreshold()`（默认 10；≤0 关闭延迟立即上报） | include | implemented |
| `options_enable_chatroom_conversation_doc` | doc_only | `EMOptions.h`：`enableChatroomConversation` 语义由"是否创建聊天室会话"改为"获取本地会话列表时是否包含聊天室会话"（不控制创建/存储，不影响收发） | `EMOptions.setEnableChatroomConversation` 注释同改 | include（`ChatOptions.enableChatroomConversation` 注释同步，字段与默认值不变） | implemented |

### 不平版 / 内部变更

| id | 类型 | 说明 | 决策 | 状态 |
|---|---|---|---|---|
| `options_use_push_in_background` | new_option（**仅 Android**） | `EMOptions.setUsePushInBackground(boolean)` / `isUsePushInBackground()`（默认 false；true 且推送 token 已绑定时，退后台约 10s 断开长连接，离线消息走推送）。iOS 头文件无对应项 | skip（已决 UM-1：不暴露，仅 CHANGELOG 提示） | implemented |
| `push_helper_is_push_token_bound` | new_api（仅 Android） | `EMPushHelper.isPushTokenBound()`；RN 全仓未封装 `EMPushHelper`（grep 无匹配） | skip（RN 无该层入口，且为 `usePushInBackground` 的内部判据） | implemented（无代码） |
| `android_background_disconnect_behavior` | behavior（仅 Android） | `EMSmartHeartBeat`：后台断连判据由"推送类型为 FCM，退后台 3 分钟"改为"`usePushInBackground` 开启且推送 token 已绑定，退后台 10 秒" | skip（无公开 API；升级后后台断连行为变化，写入 CHANGELOG 提示，见 UM-1） | implemented（无代码） |
| `client_version_const` | internal | `EMClient.VERSION` 5.1.0 → 5.2.1 | skip | implemented（无代码） |
| `ios_internal_changes` | internal | `EMChatMessage+Private.h` 新增 `refreshBodiesFromCore`；`EMConversation.mm` 删除私有 `updateConversationExtToDB`（头文件全仓 grep 无声明）；`EMHTTPRequest.mm`、`EMStringUtil.mm` 实现层调整；`EMClient.mm` 把 `disconnectNotifyThreshold` 写入 chatConfigs | skip（非公开 API） | implemented（无代码） |
| `android_internal_changes` | internal | `EMSmartHeartBeat`、`UriUtils.getMessageAttachmentLocalPath(msg, bodyIndex, ...)`（`util` 工具类）、`EMAChatClient` / `EMAChatConfig` / `EMAChatManager`（`adapter/`）、`EMChatConfigPrivate`（`core/`） | skip（内部实现/JNI 适配层，非公开 diff 范围） | implemented（无代码） |
| `android_5_2_1_version_only` | internal | `SDK_5.2.0→SDK_5.2.1`：仅 `EMClient.VERSION = "5.2.1"` | skip | implemented（无代码） |

## 已核实事实

- iOS `EMConnectionListener.mm` 只会向 delegate 回调 `connectionStateDidChange:` 的 `Connected` / `Disconnected` 两值（行 27、56；`EMClient.mm:2325`）；`Connecting` 只通过 `connectionState` 属性读取到。因此 RN 现有 `ExtSdkClientWrapper.m` 的"非 Connected 即 onDisconnected"逻辑**不会**因新枚举值产生误报，无需改动事件通路。
- RN 基线无 `useAgoraChatDomain`（KI-107，对内品牌开关不平版），本次 native 无新增同类项。
- `ChatOptions.enableChatroomConversation` 在 RN 已存在（TS / Java / ObjC 三处），本次仅注释语义变化。

## 未匹配清单（交验收报告第二轮，过程中不暂停、不擅自取舍）

| id | 疑点 | 现状与建议 |
|---|---|---|
| UM-1 | `usePushInBackground` 仅 Android 有，iOS 无对应；且 Android 后台断连行为随之变化（旧：FCM 类型自动断，新：须显式开启 + token 已绑定） | 选项 A：`ChatOptions` 新增 Android-only 字段（iOS 忽略）；选项 B：不暴露，仅 CHANGELOG 提示行为变化。**已决（2026-11-25）：选项 B，不暴露。** |
| UM-2 | 复合消息的 body 类型组合约束：iOS 在写入时（`init` / `setBodies:` / `appendBody:`，`EMValidateBodiesForWrite`）即拒绝 `bodies.count > 1` 且含 `CMD` / `COMBINE`，失败时返回 nil 或不修改并打日志；Android 公开 Java 层无此校验，文档称"数量上限和类型组合由发送准入校验"，具体规则在共享 core，**公开源码无法验证**与 iOS 是否一致 | RN wrapper 不加过滤（以 native 为准）。两端失败时机/形态不同（iOS 构造期 nil、Android 发送期报错），实机验证时需分别覆盖；差异进验收报告 |
| UM-3 | `ConnectionState` 取值序两端不同（iOS `Connected=0, Disconnected=1, Connecting=2`；Android `DISCONNECTED=0, CONNECTING=1, CONNECTED=2`）；RN 既有 `isConnected()` 为 `Promise<boolean>`，无三态类型 | 契约须定：TS 枚举取值（建议字符串或 TS 自有数值）+ 两端 wrapper 显式映射，不透传原生整数。**已决：字符串枚举 `ChatConnectionState`，新方法 `getConnectionState`，两端 wrapper 显式映射。** |
| UM-4 | native 废弃 `isConnected`，但 RN `ChatClient.isConnected()` 被 `ChatManager.ts:2857/2911` 内部使用 | 建议保留不删（native 未删除，"删除跟随 native"不适用）；**已决：保留并加 `@deprecated`。** |
| UM-5 | 多消息体在 RN 的公开形态：`ChatMessage` 现为单 `body: ChatMessageBody`；`ChatMessageType` 无 `MULTIBODY`；JSON 现仅 `body` key（Java `ExtSdkHelper.fromJson` 读 `json.getJSONObject("body")`，ObjC `ExtSdkToJson.m:703`） | 契约须定：`bodies` JSON key 与 `body` 并存策略、`ChatMessage.bodies` / `contentType` 字段、`createSendMessage` 多 body 入口、`ChatMessageType.MULTIBODY` 取值。**已决：向后兼容方案，保留 `body`（= 首个），新增 `bodies` / `contentType`。** |
| UM-6 | 两端"构造/修改多 body"的校验时机不同：iOS 每次写入都整体校验并失败即拒（构造返回 nil）；Android `createMultiBodySendMessage` 对空列表/含 null 返回 `null`，其余约束推迟到发送 | RN native 侧一律用"完整 bodies 列表整体构造消息"（`createMultiBodySendMessage` / `initWithConversationID:bodies:ext:`），不在 wrapper 里调用 `appendBody`；构造失败（iOS nil / Android null）的错误返回形态需在契约中定死，避免 NPE/崩溃（改过 wrapper 后错误路径必须实测） |
| UM-7 | iOS `translateMessage` 对复合消息直接返回 `MESSAGE_INVALID`（`Composite messages do not support translation`），Android Java 层（`EMChatManager.translateMessage`）无对应判断，直接透传 core，复合消息的结果由 core 决定（未验证） | RN 不拦截，错误以 native 为准；差异记入验收报告 |
| UM-8 | `disconnectNotifyThreshold` 边界：Android 文档明确 ≤0 关闭延迟，iOS 头文件未说明 ≤0 行为 | RN 透传；`ChatOptions` 注释按双端交集书写，边界差异进验收报告 |
