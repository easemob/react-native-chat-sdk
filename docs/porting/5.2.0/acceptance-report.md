# React Native 5.2.0 平版验收报告（2026-11-25）

目标：native iOS 5.1.0 → 5.2.0 / Android SDK_5.1.0 → SDK_5.2.1；React Native 5.1.0 → 5.2.0。

开发分支：`5.2.0`，基于 `5.x@3db01ff`；worktree：`react-native-chat-sdk/.worktree/5.2.0`。**全部代码未提交；Java / ObjC 改动尚无编译证据，原生构建与设备验证由用户在自己的网络环境执行（见 [04-verification.md](04-verification.md)）。**

完整差异见 [01-api-diff.md](01-api-diff.md)，契约见 [02-contract.md](02-contract.md)，实现见 [03-implementation.md](03-implementation.md)，验证见 [04-verification.md](04-verification.md)。

## 二维对照

✅ 表示代码与 native 公开契约一致，且 JS 侧门禁通过；⚠️ 表示 Wrapper 改动尚未经原生编译与设备运行，不能视为已验证。

| 变更项                                   | iOS 源                                                       | Android 源                                                  | TypeScript                                                         | Android Wrapper                     | iOS Wrapper                                         | 状态                                                          |
| ---------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| msg_type_multibody / msg_content_type    | `EMMessageBodyTypeMultiBody`、`contentType`                  | `Type.MULTIBODY`、`getContentType()`                        | `ChatMessageType.MULTIBODY`；`contentType` getter 由 `bodies` 推导 | 不上线该类型串                      | 不上线该类型串                                      | ✅ TS；⚠️ Wrapper 待构建                                      |
| msg_bodies                               | `bodies` 读写                                                | `getBodies()`                                               | `bodies` 自有字段，唯一数据源                                      | `toJson` 输出 `bodies` + `body`     | `toJsonObject` 输出 `bodies` + `body`               | ✅ TS；⚠️ 待构建                                              |
| msg_set_bodies / msg_append_body         | `setBodies:` / `appendBody:`                                 | `setBodies` / `appendBody`                                  | 映射为 `bodies` 赋值 / `push`，不另建方法                          | 不调用 `appendBody`                 | 不调用 `appendBody:`                                | ✅ 语言风格映射                                               |
| msg_create_with_bodies                   | `initWithConversationID:bodies:ext:`                         | `createMultiBodySendMessage(to, bodies)`                    | `createSendMessage` 的 `body` / `bodies` 二选一                    | 多体走 `createMultiBodySendMessage` | 首个 body 初始化后 `msg.bodies = bodies` 并校验数量 | ✅ TS；⚠️ 待构建；iOS 未直接用 `bodies:` 初始化器，见未匹配项 |
| msg_body_first_semantics                 | `body` = 首个；`setBody:` 替换整体                           | `getBody()` 首个；`setBody` 替换整体                        | `body` 访问器（get 首个，set 替换为 `[v]`）                        | `fromJson` 兼容仅 `body`            | `fromJsonObject` 兼容仅 `body`                      | ✅ TS；⚠️ 待构建                                              |
| mergeMessage（基线调查新增）             | —                                                            | `setBody` 会把多体折叠                                      | —                                                                  | `setBodies(msg.getBodies())`        | `dbMsg.bodies = msg.bodies`                         | ⚠️ 必改项，待设备验证（`RN-MSG-017`）                         |
| msg_body_limit_20                        | 超 20 个 → `MESSAGE_INVALID`                                 | 同                                                          | 不校验                                                             | 不拦截                              | 不拦截                                              | ✅ 以 native 为准                                             |
| msg_multibody_progress_doc               | 消息级进度、结果只回调一次                                   | 逐 body 下载                                                | `ChatManager` 四个方法注释                                         | 无                                  | 无                                                  | ✅                                                            |
| client_connection_state（含枚举）        | `connectionState`（Connected=0/Disconnected=1/Connecting=2） | `getConnectionState()`（DISCONNECTED/CONNECTING/CONNECTED） | `getConnectionState()` + `ChatConnectionState` 字符串枚举          | 显式 `switch` 映射为字符串          | 显式 `switch` 映射，`default` 为 disconnected       | ✅ TS；⚠️ 待构建；两端数值序不同已消化在映射层                |
| client_is_connected_deprecated           | `__deprecated_msg`                                           | `@Deprecated`                                               | 保留并 `@deprecated`                                               | 压制废弃告警                        | 压制废弃告警                                        | ✅                                                            |
| options_disconnect_notify_threshold      | `disconnectNotifyThreshold` 默认 10                          | `set/getDisconnectNotifyThreshold` 默认 10                  | `ChatOptions` 字段，默认 10                                        | 双向序列化                          | 双向序列化                                          | ✅ TS；⚠️ 待构建                                              |
| options_enable_chatroom_conversation_doc | 语义改为"列表是否包含聊天室会话"                             | 同                                                          | 注释同步                                                           | 无变化                              | 无变化                                              | ✅                                                            |
| conn_listener_deferred_disconnect_doc    | 无头文件变化                                                 | 注释                                                        | `ChatConnectEventListener` 注释                                    | 无变化                              | 无变化；`Connecting` 不经 delegate                  | ✅                                                            |
| options_use_push_in_background           | 无                                                           | 新增（默认 false）                                          | 不暴露                                                             | 不设置                              | —                                                   | ✅ skip（已决 UM-1）；见行为变化                              |
| 其余内部变更                             | —                                                            | —                                                           | —                                                                  | —                                   | —                                                   | ✅ skip                                                       |

## 已完成验证

- typecheck、lint、循环依赖、`bob build`、案例映射检查、`git diff --check`、`gate` 全部通过。
- Jest：26 suites / 221 tests 通过，其中新增 8 个 `ChatMessage` 用例；既有断言未修改。
- 契约逐字抽查：五处方法常量、ObjC 值 2041 唯一、`disconnectNotifyThreshold` 与 `bodies` 在 TS / Java / ObjC 一致、版本号四处一致。
- example 新增 `RN-MSG-017`、`RN-AUTH-001` / `RN-APP-001` 新断言、`getConnectionState` 与多体发送的手测入口；另补充三类测试：CI `RN-MSG-018`（双文本体真实发送）、单设备 `testing/single/cases/port_5_2_0_{positive,negative}.json`（含空 `bodies` 反向）、多设备 `5.2.0-multi-message-multibody-positive`（采用 Flutter 仓的文件，两端一致；orchestrator 的 `agent-contract.md` 待补）；图片多体不做自动化。
- 设备实测（2026-11-25）：CI 回归 Android 98/98、iOS 98/98；单设备 Android 2/2 脚本通过；多设备 Android 双模拟器 1/1 通过（bob 收到的 `bodies` 顺序一致）。iOS 单设备、iOS 多设备与手测入口未运行，详见 [04-verification.md](04-verification.md)。

## 未匹配清单与待决事项

1. **部分设备验证未做**：Android Java、iOS ObjC 已编译并通过 CI 回归；仍未运行 iOS 单设备、iOS 多设备与手测入口。必测项见 04。
2. **多体消息构造失败的错误形态待决**：iOS 构造期返回 nil，Android 在发送期报错，两端时机不同。当前 wrapper 把 `null` / `nil` 交给既有 `checkMessageParams`，会得到错误码 1（`The message does not exist.`），描述并不贴切。是否为此新增更明确的错误码，属于接口决策，需要你确认；设备验证时必须覆盖这条路径（防止崩溃）。
3. **iOS 未使用 `initWithConversationID:bodies:ext:`**：为让 `from` / `to` / `conversationId` 的处理与单体一致，采用首个 body 初始化再赋 `bodies` 的方式，并校验数量。行为应与直接用 `bodies:` 初始化等价，但这是我的判断，需构建后验证。
4. **UM-2 类型组合**：iOS 在写入时即拒绝多体消息含 `cmd` / `combine`；Android 公开 Java 层没有该校验，规则在共享 core，源码无法确认两端一致。RN 不过滤，以 native 为准。
5. **UM-7 翻译**：iOS 对复合消息直接返回 `MESSAGE_INVALID`；Android 透传 core，结果未验证。RN 不拦截。
6. **UM-8 阈值边界**：Android 文档称 `≤0` 关闭延迟，iOS 头文件未说明；TS 注释只写双端交集（秒、默认 10），不描述 `≤0`。
7. **`body` 不再是自有属性（行为变化）**：`JSON.stringify(message)` 只含 `bodies`，不含 `body`。设计依赖 RN 桥只序列化自有可枚举属性；单元测试只证明了 JSON 层面，真实桥靠 `RN-MSG-017` 验证。已写入 CHANGELOG。
8. **Android 后台断连行为变化（行为变化）**：native 5.2.x 仅在 `usePushInBackground` 开启且已绑定推送 token 时后台断连（退后台 10 秒），默认 `false`，旧行为（FCM 类型退后台约 3 分钟断连）不再默认发生。RN 按已决方案不暴露该开关，已写入 CHANGELOG。
9. **5.1.0 的 CHANGELOG 旧表述**：5.1.0 条目写的是 `enableChatroomConversation` 用于"收发聊天室消息时创建会话"，与 5.2.0 native 的新语义不符。历史条目未改，5.2.0 条目已说明新语义。
10. **cpp 登记滞后（KI-105）**：`modules/cpp/common/ExtSdkMethodType.*` 只有 148 项，TS 有 259 项，`isConnected`、`getToken` 都未登记。仅按规范补了本次新增项，不作契约依据。
11. **契约文档的一处更正**：02 曾写"用 `yarn doc:overview:*` 重新生成概览"，该脚本不存在，概览是手写表，已更正并手工补行。

## 工作区状态

所有改动均**未提交**，也未推送、未打 tag。提交信息需用英文；打 tag 由你决定。
