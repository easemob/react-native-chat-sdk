# 5.1.0 基线与桥接契约（2026-11-10）

依据：[01-api-diff.md](01-api-diff.md)。开发分支 `5.1.0` 基于 `5.x@9610de7`；开工状态干净，本阶段仅新增任务文档、日志、hook 与依赖 bump，没有其他任务改动。

## 依赖与已知问题

- `ChatSdk.podspec` 的 SPM minimumVersion 与 CocoaPods dependency、`android/build.gradle` 的 Maven 坐标均改为 5.1.0。
- 复用既有桥接架构、EMCursorResult 双端 helper 和 TS ChatCursorResult，三者已支持 conversation。
- 已核对 KI-105：本次常量同时补 C++；KI-107：环信不设置品牌开关；KI-108/109：保留既有 token 登录流程；KI-110：双端构建验证优先使用既有 iOS SPM 路径；KI-112：新 wrapper 不做参数过滤、重排或错误码改写。
- `.codex/hooks.json` 已按 skill 模板安装；当前工具接口无法证明会话动态加载 hook，因此每阶段手动执行 gate 作为强制替代，不声称 hook 已获信任。默认不提交。

## 冻结契约

| 项目 | TS / JSON | Android | iOS |
| --- | --- | --- | --- |
| 本地会话分页 | `ChatManager.getConversationsFromDB(params: {cursor?: string; pageSize?: number}): Promise<ChatCursorResult<ChatConversation>>` | `asyncGetConversationsFromDB(cursor,pageSize,callback)` | `getConversationsFromDBWithCursor:pageSize:completion:` |
| 方法 key | `getConversationsFromDB`，请求 `{getConversationsFromDB:{cursor,pageSize}}` | dispatch 同 key | dispatch 同 key |
| 分页默认值 | `cursor ?? ''`、`pageSize ?? 20`，遵循 RN 既有分页习惯 | 读取显式 cursor/pageSize，不做范围拦截 | 同左 |
| 返回 | `{getConversationsFromDB:{cursor,list:[conversation JSON]}}`；TS map 为 ChatConversation；totalCount 如 native 提供则保留 | ExtSdkCursorResultHelper | EMCursorResult (Json) |
| 自动加载 | `ChatOptions.autoLoadConversations: boolean`，构造参数 optional，默认 true；withAppKey/withAppId 都支持 | JSON autoLoadConversations → setAutoLoadAllConversations / isAutoLoadAllConversations | JSON autoLoadConversations → autoLoadConversations |
| 聊天室会话 | `ChatOptions.enableChatroomConversation: boolean`，构造参数 optional，默认 false | JSON enableChatroomConversation → setEnableChatroomConversation / isEnableChatroomConversation | JSON enableChatroomConversation → enableChatroomConversation |
| 群配置 | `ChatGroup.configs.inviteNeedConfirm`，既有结构不改 | 补 configs.put 从 isInviteNeedConfirm 取值 | 既有 IsInviteNeedConfirm 映射不改 |
| 多设备事件 | 既有 onMultiDeviceEvent 聚合事件及 group 事件分发；34 → GROUP_UPDATE、52 → GROUP_METADATA_CHANGED | native event 整数原样传递 | 同左；无需新增事件 key |
| 数据同步默认值 | dataSyncType 保留 undefined，不覆盖 native 默认；注释说明双端 5.1 默认 Conversations | native 默认 CONVERSATIONS | native 默认 Conversations |

## 配套

- example 注册 getConversationsFromDB，auto_mode 初始化白名单补两个开关。
- 新增测试前/出现测试失败时与用户确认，并对照用户指定的 Flutter 升级结果；不调整失败断言来掩盖 native 差异。
- 尚未进行 git add/commit/push；包版本、双语 CHANGELOG、example 三处版本与构建号在阶段三统一更新。

## 门禁结果

- 三处 native 依赖 grep 均为 5.1.0（podspec:53/57、build.gradle:91）。
- 手动 `porting_guard.sh gate react-native <worktree>`：exit=0，stdout/stderr 为空。
- 已安装 hook 配置并告知信任方式；当前会话采用手动门禁。
