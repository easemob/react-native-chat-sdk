# 5.2.0 实现记录（2026-11-25）

依据：[02-contract.md](02-contract.md)。代码位于 worktree 分支 `5.2.0`，**全部未提交**。

## 实现覆盖

| id | 结果 |
| --- | --- |
| msg_type_multibody / msg_content_type | implemented：`ChatMessageType.MULTIBODY`；`ChatMessage.contentType` 只读 getter，由 `bodies` 推导，不上线 |
| msg_bodies / msg_set_bodies / msg_append_body | implemented：`ChatMessage.bodies` 自有字段；赋值即 `setBodies`，`push` 即 `appendBody`，不另建方法 |
| msg_create_with_bodies | implemented：`createSendMessage` 入参 `body` 与 `bodies` 二选一；Android 走 `createMultiBodySendMessage(to, bodies)`，iOS 先用首个 body 构造再 `msg.bodies = bodies` 并校验数量 |
| msg_body_first_semantics | implemented：`body` 改为访问器（get 返回 `bodies[0]`，set 替换为 `[v]`）；线上 JSON 保留 `body` 键（= `bodies[0]`） |
| msg_body_limit_20 / UM-2 | implemented（无代码）：wrapper 与 TS 均不校验数量和类型组合，以 native 为准 |
| msg_multibody_progress_doc | implemented：`ChatManager` 的 `sendMessage` / `downloadAttachment` / `downloadThumbnail` / `downloadBigImage` 注释 |
| client_connection_state / enum | implemented：`ChatClient.getConnectionState()` + `ChatConnectionState` 字符串枚举；两端 wrapper 显式 `switch` 映射，不透传原生整数；常量 key `getConnectionState`，ObjC 值 2041 |
| client_is_connected_deprecated | implemented：保留并加 `@deprecated`；两端 wrapper 压制 native 废弃告警 |
| conn_listener_deferred_disconnect_doc / options_disconnect_notify_threshold | implemented：`ChatOptions.disconnectNotifyThreshold`（默认 10）；两端 options 双向序列化；`ChatConnectEventListener` 注释 |
| options_enable_chatroom_conversation_doc | implemented：注释语义改写，字段与默认值不变 |
| options_use_push_in_background / 其余内部项 | skip：不暴露；CHANGELOG 提示 Android 后台断连行为变化 |

## 基线调查发现、必须同步修改的既有逻辑（不在 01 变更清单内）

| 位置 | 原因 | 改动 |
| --- | --- | --- |
| Java `ExtSdkWrapper.mergeMessage` / ObjC `ExtSdkWrapper.m` `mergeMessage` | 5.2.0 起 `setBody` 把消息整体替换为单 body，经 `updateChatMessage` / `updateConversationMessage` 更新多体消息会折叠成首个 body | 改为 `setBodies(msg.getBodies())` / `dbMsg.bodies = msg.bodies` |
| Java `ExtSdkHelper` message `toJson` | 原按 `getType()` 分支，多体消息返回 `MULTIBODY` 无分支，`body` 键丢失 | 统一输出 `bodies`，`body` = 首个 |
| TS `ChatMessage` | TS 目标 ESNext，类字段为 define 语义，保留 `body` 字段声明会遮蔽原型访问器 | 移除字段声明，访问器定义在类体 |

## 改动文件

- TS：`ChatClient.ts`、`ChatEvents.ts`、`ChatManager.ts`（仅注释）、`common/ChatMessage.ts`、`common/ChatOptions.ts`、`__internal__/Consts.ts`
- Android：`ExtSdkMethodType.java`、`ExtSdkDispatch.java`、`ExtSdkClientWrapper.java`、`ExtSdkHelper.java`、`ExtSdkWrapper.java`
- iOS：`ExtSdkMethodTypeObjc.{h,m}`、`ExtSdkDispatch.m`、`ExtSdkClientWrapper.{h,m}`、`ExtSdkToJson.m`、`ExtSdkWrapper.m`
- C++：`ExtSdkMethodType.{h,cpp}`（KI-105：cpp 登记 148 项而 TS 有 259 项，早已不是完整镜像；仅按规范补本次新增项）
- 测试与 example：`src/__tests__/unit/ChatMessage.test.ts`（8 个新用例）；`example/src/ci/modules/message_cases.ts`（新增 `RN-MSG-017`）、`auth_cases.ts`（`RN-AUTH-001` 加 `getConnectionState` 断言）、`app_cases.ts`（`disconnectNotifyThreshold` 默认值）、`auto/auto_mode.ts`（options 白名单）、`registry/apis/{chat,client}.ts`（多体发送、`getConnectionState` 手测入口）；`docs/ci/native-case-mapping.json`（登记 `RN-MSG-017`，`nativeBaseline` 同步）
- 版本与文档：`package.json`、`example/package.json`、Android `versionName` / `versionCode 5`、iOS `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION 5`、`android/build.gradle`、`ChatSdk.podspec`、`AGENTS.md`、双语 `CHANGELOG`、双语 `rn_api_overview`（见 02 §三的更正）

`src/version.ts`、`modules/cpp/CMakeLists.txt`、`example/src/env.ts` 由 `yarn prepare` 生成，未手改。未修改 `modules/*/flutter/`。

## 阶段三门禁

| 命令 | 结果 |
| --- | --- |
| yarn typecheck | exit 0 |
| yarn lint | exit 0 |
| yarn test --no-watchman | exit 0，26 suites / 221 tests 通过（含 8 个新增用例，既有断言未改动） |
| yarn check:circular:dpdm | exit 0，无循环依赖 |
| yarn bob build | exit 0 |
| node scripts/ci/check_case_mapping.js | OK |
| git diff --check | exit 0 |
