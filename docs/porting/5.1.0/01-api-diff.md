# 5.1.0 公开 API 差异（2026-11-10）

## 范围与版本证据

- iOS：`5.0.0` (`f8f506ccb009db38d47280ab713a65e468287f4b`) → `5.1.0` (`e88b1dcc9af41e57fa3d219986addfdc800367a4`)，仅公开头文件。
- Android：`SDK_5.0.0` (`8025ecb767e72a5c4623fab457ed269011e773d6`) → `SDK_5.1.0` (`a8db682f400e36032c22d675b77fe77d86fbb7cf`)，检查根包监听器与公开 Java 类，排除 adapter/core 实现。
- `git tag -l '5.0*' / '5.1*'` 与 Android 对应前缀列表均仅有上述两个 tag；区间没有 patch tag，不存在跳版。
- 目标：从 `5.x@9610de7` 创建 `5.1.0`，worktree `.worktree/5.1.0`；开工 `git status --short --branch` 仅输出 `## 5.1.0`，工作区干净。

## iOS / Android 配对清单

| id | 类型 | 领域 | iOS 源签名 | Android 源签名 | 决策 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| conversation_page | new_api | conversation | `getConversationsFromDBWithCursor:pageSize:completion:` | `asyncGetConversationsFromDB(String,int,EMValueCallBack<EMCursorResult<EMConversation>>)` | include | implemented |
| options_chatroom_conversation | new_property | client | `BOOL enableChatroomConversation` | `setEnableChatroomConversation(boolean)` / `isEnableChatroomConversation()` | include；默认 false | implemented |
| options_auto_load | prerequisite | client | `BOOL autoLoadConversations`（已有） | `setAutoLoadAllConversations(boolean)` / `isAutoLoadAllConversations()`（已有） | include；分页前置条件，RN 原未封装；默认 true | implemented |
| group_invite_confirm | new_getter | group | `EMGroup.configs.IsInviteNeedConfirm`（已有） | `EMGroup.isInviteNeedConfirm()` | include；补 Android 群返回的 configs.inviteNeedConfirm | implemented |
| multi_device_group_update | new_enum | group | `EMMultiDevicesEventGroupUpdate = 34`（已有） | `EMMultiDeviceListener.GROUP_UPDATE = 34` | include；RN 已有枚举和映射，更新平台说明 | implemented |
| options_data_sync_default | default_change | client | `dataSyncType` 默认 Conversations（已有） | `setDataSyncType(EnumSet<EMDataSyncType>)` 默认从 NONE 改 CONVERSATIONS | include；保留 undefined 直通 native，仅更新说明 | implemented |
| options_sync_ws_host | removed_property | client | 删除 `syncDataWSHost` | 删除 `setSyncDataWebSocketServer(String)` / `getSyncDataWebSocketServer()` | skip；RN 从未暴露，无残留 | skipped |
| options_sync_ws_port | removed_property | client | 删除 `syncDataWSPort` | 删除 `setSyncDataWebSocketPort(int)` / `getSyncDataWebSocketPort()` | skip；RN 从未暴露，无残留 | skipped |
| options_brand_domain | new_property | client | `BOOL useAgoraChatDomain` | `setUseAgoraChatDomain(boolean)` / `getUseAgoraChatDomain()`（另有 @hide 配置判断） | skip；KI-107 内部品牌开关，环信不设置 | skipped |
| image_thumbnail_secret | deprecated_property | chat | `thumbnailSecretKey` 新增 deprecated，替代 secretKey | `getThumbnailSecret/setThumbnailSecret` 已废弃 | skip；RN 5.0.0 已删除 thumbnailSecret，单列废弃项 | skipped |
| search_keyword_limits | documentation | chat | `EMMessageSearchOption.keywordList`（已有 1–120、总计 120、最多 5） | `setKeywordList(List<String>)` 注释从 512/1024 修正为 120/120 | skip；RN 注释已为 120/120/5 | skipped |

## 未匹配与需要验证的差异

1. group_invite_confirm：Android 新 getter 在 groupSetting 为 null 时返回 true；iOS 从 configs 读取。桥接直接使用 native 结果，不构造额外默认值。真实群对象两端语义需要运行验证。
2. image_thumbnail_secret：废弃时间不一致（本轮仅 iOS 新标记），双方均保留 native 属性；RN 已删除旧字段，不新增封装。
3. multi_device_group_update：Android 本轮才补 34，52 仍表示群成员自定义属性变化；RN 两个枚举值保持独立，不能把 34 合并到 52。
4. Android 的缺失消息群回执崩溃修复、history cache、NTP/token 时间校正与推送竞态变化没有公开签名增量，不新增 RN API。历史回执问题需对照 Flutter 验证结论，不能据源码修复推断测试通过。

## 门禁证据

- `git diff --stat 5.0.0 5.1.0 -- newSDK/HyphenateSDK`：4 个公开头文件变化（IEMChatManager、EMOptions、EMOptions+PrivateDeploy、EMImageMessageBody）。
- `git diff SDK_5.0.0 SDK_5.1.0 -- hyphenatechatsdk/src/com/hyphenate`：根包 EMMultiDeviceListener 已覆盖；EMFetchMessageOption 新 isSave 为包私有、EMSessionManager 为包私有、EMClient VERSION 为版本常量，其余变化为实现，均不新增封装。
- `rg 'syncDataWS|syncDataWs' src modules` 无匹配；`ChatMessageSearchOption.ts` 已标 120/120/5；`ChatEvents.ts` 已有 34 与 52 独立映射。

- 手动执行 `porting_guard.sh gate react-native <worktree>`：exit=0，stdout/stderr 均为空。
