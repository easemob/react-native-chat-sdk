# 5.0.0 平版 · 验收报告（供人类审查决策）

## 1. 任务概述

- **任务**：环信 React Native SDK 主版本平版——native 依赖 iOS `HyphenateChat` 4.24.1 → 5.0.0、Android `io.hyphenate:hyphenate-chat` 4.24.1 → 5.0.0；RN 自身版本 1.20.0 → **5.0.0**（本次起与 native 版本号同步）。
- **工作位置**：仓库 `react-native-chat-sdk`，worktree `.worktree/5.0.0`，分支 `5.0.0`（从 dev/1.20.0 切出）。
- **代码状态**：5.0.0 平版主体及自动报告器已提交；`fetchGroupMessageReadReceipts` 崩溃修复暂缓，当前无对应代码改动。
- **依据文档**（同目录）：
  - `01-api-diff.md` —— 双端对照总变更清单 171 条（include 70 / defer 101 / skip 0）+ 未匹配清单 34 条 + 迁移文档交叉验证。本报告不重复粘贴签名全量，逐条引用其 id。
  - `02-contract.md` —— 跨端契约（已冻结），含 §5 删除清单、§6 defer 处理原则、§7 待决策 5 条。
  - `03-implementation.md` —— 实现记录，含 §2 推断项 12 条、§3 契约空白裁决 2 条、§5 静态检查结果。

## 2. 二维对照表（171 条全量）

列说明：iOS 源 / Android 源 = 01-api-diff.md 双端签名列结论（有/无）；三个实现列按 03-implementation.md 填写；状态：✅ 一致 / ⚠️ 有疑问（附说明）/ ⏸️ 待决策（defer 项）/ ❌ 缺失。分区按 01-api-diff.md 章节组织，保留原 id。

### client（include 16 / defer 10）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| client_register_account | 有 | 有 | 已实现（删 createAccount） | 已实现（删） | 已实现（删） | ✅ |
| client_fetch_token_with_password | 有 | 有 | 已实现（删） | 已实现（删） | 已实现（删） | ✅ |
| client_login_with_password | 有 | 有 | 已实现（删 login，loginWithToken 固定 token） | 已实现（删 isPassword 分支） | 已实现（固定 token 登录） | ⚠️ loginWithToken payload 保留 `isPassword: false`、iOS payload key 仍为 `pwdOrToken`（推断 2/8） |
| client_login_with_agora_token | 有 | 有 | 已实现（删 loginWithAgoraToken） | 已实现（删） | 已实现（删） | ✅ |
| client_service_check | 有 | 有 | 已实现 | 已实现 | 已实现 | ✅ |
| client_check_type | 有 | 有 | 已实现 | 已实现 | 已实现 | ✅ |
| client_auto_login_state_query | 有 | 有 | 已实现（删 isLoginBefore） | 已实现（删） | 已实现（删） | ⚠️ 原 `isLoginBefore()` 守卫改为 `isConnected()`（推断 5） |
| client_auto_login_behavior | 有（行为） | 有 | 无动作（RN 无自动登录路径） | 无动作 | 无动作 | ✅ 行为变化已写 CHANGELOG |
| client_statistics_manager | 有 | 有 | 无封装（核对关闭） | 无封装 | 无封装 | ✅ |
| statistics_module | 有 | 有 | 无封装（核对关闭） | 无封装 | 无封装 | ✅ |
| client_get_logged_in_devices_with_password | 有 | 有 | 已实现（改 token 鉴权） | 已实现（编译强制改异步 `fetchLoggedInDevicesFromServerWithToken`） | 已实现（token 版） | ✅ |
| client_kick_device_with_password | 有 | 有 | 已实现（改 token 鉴权） | 已实现（token 版） | 已实现（token 版） | ✅ |
| client_kick_all_devices_with_password | 有 | 有 | 已实现（改 token 鉴权） | 已实现（token 版） | 已实现（token 版） | ✅ |
| client_delegate_sync_data_start | 有 | 有 | 已实现（新增 onDataSyncStart） | 已实现 | 已实现 | ✅ |
| client_delegate_sync_data_finished | 有 | 有 | 已实现（新增 onDataSyncFinish） | 已实现 | 已实现 | ✅ |
| client_delegate_on_database_opened | 有 | 有 | 已实现（新增 onDatabaseOpened） | 已实现（errorCode 恒 0） | 已实现 | ✅ |
| client_login_with_username_token_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| client_get_device_config | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| client_delegate_auto_login_did_complete | 有 | 无 | 未实施 | 未实施 | 已删除（用户裁决：契约标作废保留条目；实现层删除 delegate 死代码，native 5.0.0 已无此方法） | ✅ |
| client_delegate_user_account_did_login_from_other_device | 有 | 无 | 已实现（MTonUserDidLoginFromOtherDevice 三层删） | 已实现 | 已实现 | ✅ 该常量本已 deprecated 豁免，本次删净 |
| client_renew_token_no_callback_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ RN 仅用异步 renewToken |
| client_get_logged_in_devices_token_sync_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| client_fetch_logged_in_devices_with_token_new | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| client_is_database_opened_new | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| client_get_device_info_new | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ 疑似内部方法暴露，建议不平版 |
| client_version_bump | 无 | 有 | 不涉及 | 未实施 | 未实施 | ⏸️ RN 自身版本号已另行 bump 5.0.0 |

### options（include 5 / defer 4）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| options_data_sync_type_enum | 有 | 有 | 已实现（新增 ChatDataSyncType） | 已实现（fromNativeMask） | 已实现（直传掩码） | ⚠️ 双端默认值不一致（iOS Conversations / Android NONE），RN 不设默认（待决策 5） |
| options_data_sync_type | 有 | 有 | 已实现（ChatOptions.dataSyncType） | 已实现 | 已实现 | ⚠️ Android options toJson 补 `dataSyncType` 为对称推断（推断 8） |
| options_is_auto_login | 有 | 有 | 已实现（删 autoLogin） | 已实现（删 key） | 已实现（删 key） | ✅ |
| options_enable_require_read_ack | 有 | 有 | 已实现（删 requireAck） | 已实现（删 key） | 已实现（删 key） | ✅ |
| options_enable_auto_sync_contacts | 有 | 有 | 已实现（删 enableAutoSyncContacts） | 已实现（删 key） | 已实现（删 key） | ✅ |
| options_report_server_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| options_area_code_int_removed | 无 | 有 | 未实施（TS 接口不变） | 已实现（int→AreaCode 枚举映射，含 GLOB(-1) 兜底） | 不涉及 | ⚠️ 编译强制：Android `setAreaCode(int)` 已删，wrapper 必须改映射（a8） |
| options_area_code_enum_new | 无 | 有 | 未实施 | 已实现（同上枚举映射） | 不涉及 | ⚠️ 同上，随上一条一并处理 |
| options_set_area_code_param_changed | 无 | 有 | 未实施 | 已实现（同上） | 不涉及 | ⚠️ 同上 |

### multidevice（include 2 / defer 0；01 领域列计入 client）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| multidevice_event_conversation_unread_message_count_cleared | 有 | 有 | 已实现（枚举加 65） | 不涉及（int 透传） | 不涉及（int 透传） | ✅ |
| multidevice_event_all_conversation_unread_message_count_cleared | 有 | 有 | 已实现（枚举加 66） | 不涉及（int 透传） | 不涉及（int 透传） | ✅ |

### chat（含已读回执体系；include 20 / defer 15）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| chat_fetch_conversations_from_server | 有 | 有 | 已实现（删 fetchAllConversations 等） | 已实现（删） | 已实现（删） | ✅ |
| chat_get_pinned_conversations_from_server | 有 | 有 | 已实现（删） | 已实现（删） | 已实现（删） | ✅ |
| chat_get_conversations_with_cursor_filter | 有 | 有 | 已实现（fetchConversationsByOptions 三层删净） | 已实现（删 stub） | 已实现（删） | ⚠️ 契约空白裁决：底层双端全删无替代，含 `ChatConversationFetchOptions` 模型一并删净（03 §3） |
| chat_modify_message | 有 | 有 | 已实现（modifyMessageBody 加 `ext?`） | 已实现（四参版） | 已实现（四参版） | ⚠️ 契约写 `modifyMessage`，实际承载方法是 `modifyMessageBody`（推断 1） |
| chat_send_message_read_ack | 有 | 有 | 已实现（删） | 已实现（删） | 已实现（删） | ✅ |
| chat_send_group_message_read_ack | 有 | 有 | 已实现（删） | 已实现（删） | 已实现（删） | ✅ |
| chat_send_message_read_receipts | 有 | 有 | 已实现（新增，约束 ≤50 条/同会话写进 TypeDoc） | 已实现（msg_ids 逐个查库后调批量接口） | 已实现 | ✅ |
| chat_ack_conversation_read | 有 | 有 | 已实现（删） | 已实现（删） | 已实现（删） | ✅ |
| chat_clear_conversation_unread_message_count | 有 | 有 | 已实现（新增） | 已实现 | 已实现 | ✅ |
| chat_clear_all_conversation_unread_message_count | 有 | 有 | 已实现（新增） | 已实现 | 已实现 | ✅ |
| chat_get_group_message_read_receipts | 有 | 有 | 已实现（新增，≤20 条/同会话） | 已实现 | 已实现 | ✅ |
| chat_fetch_history_messages | 有 | 有 | 已实现（删 MTfetchHistoryMessages；ByOptions 版保留） | 已实现（删） | 已实现（删） | ✅ |
| chat_fetch_group_message_read_receipts | 有 | 有 | 已实现（新增，替代 fetchGroupAcks） | 已实现 | 已实现（返回含 totalCount） | ⚠️ `totalCount` 仅 iOS 返回、`groupId` Android 忽略（待决策 3）；默认 `pageSize ?? 20`、`cursor ?? ''` 为推断（推断 4） |
| chat_report_message | 有 | 有 | 已实现（删 reportMessage） | 已实现（删） | 已实现（删） | ✅ |
| chat_mark_all_conversations_as_read | 有 | 有 | 已实现（删） | 已实现（删） | 已实现（删） | ✅ |
| chat_delegate_messages_did_read | 有 | 有 | 已实现（删 onMessagesRead） | 已实现（删） | 已实现（删） | ✅ |
| chat_delegate_group_message_did_read | 有 | 有 | 已实现（删 onGroupMessageRead） | 已实现（删） | 已实现（删） | ✅ |
| chat_delegate_group_message_ack_has_changed | 有 | 有 | 已实现（删 MTonReadAckForGroupMessageUpdated） | 已实现（删） | 已实现（删） | ⚠️ 迁移文档误称改名为 `onReadReceiptForGroupMessageUpdated`（5.0.0 源码不存在），按源码直接删除，群已读更新由 onMessageReadReceipts 承载（矛盾 1） |
| chat_delegate_on_conversation_read | 有 | 有 | 已实现（删 onConversationRead） | 已实现（删） | 已实现（删） | ✅ |
| chat_delegate_on_message_read_receipts | 有 | 有 | 已实现（新增 onMessageReadReceipts） | 已实现 | 已实现（进 supportedEvents） | ✅ |
| chat_get_unread_message_count | 有 | 无 | 已有封装（无动作） | 无动作 | 无动作 | ⏸️ 行为变化（统计范围收窄）已写 CHANGELOG |
| chat_import_conversations | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| chat_resend_message | 有 | 无 | 未实施 | 不涉及 | 已实现（resendMessage→sendMessage，编译强制） | ⚠️ defer 项被编译强制触及，已记录 |
| chat_load_messages_with_type | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| chat_load_messages_with_keyword_legacy | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| chat_load_messages_with_keyword_scope | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| chat_delete_messages_before | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| chat_delegate_conversation_list_did_update | 有 | 无 | 无动作（事件层无感知） | 不涉及 | 已实现（迁 EMConversationDelegate，注册改 addConversationDelegate:queue:） | ⚠️ defer 项被编译强制触及：iOS 回调迁移新协议，RN 事件不变 |
| chat_add_conversation_delegate | 有 | 无 | 未实施 | 未实施 | 已实现（复用于上条注册） | ⏸️ delegate 参数 `_Nullable` 标注疑点保留（i3） |
| conversation_delegate_protocol | 有 | 无 | 未实施 | 不涉及 | 已实现（同上迁移） | ⏸️ 同上 |
| chat_load_all_conversations_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| chat_update_participant_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| chat_async_fetch_history_messages_new | 无 | 有 | 未实施（RN 已有等价 ByOptions 版） | 未实施 | 未实施 | ⏸️ |
| chat_async_delete_conversations_new | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| msg_listener_on_message_recalled_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |

### message / conversation 模型（include 8 / defer 10）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| message_is_peer_read | 有 | 有 | 已实现（hasReadAck→isPeerRead） | 已实现（只读） | 已实现（只读） | ✅ |
| message_is_read | 有 | 有 | 已实现（hasRead→isRead） | 已实现（**直接映射不取反**，旧 `!isUnread()` 已删） | 已实现 | ✅ Android 语义反转点（N2）已按契约处理，用户复核确认无误 |
| message_is_need_read_receipt | 有 | 有 | 已实现（needGroupAck→isNeedReadReceipt） | 已实现（唯一保留 setter） | 已实现 | ✅ |
| message_group_read_receipt_count | 有 | 有 | 已实现（groupAckCount→groupReadReceiptCount） | 已实现（readReceiptCount()） | 已实现 | ✅ |
| conversation_name_avatar | 有 | 有 | 已实现（新增 displayName?/displayAvatar?，避开既有 name() 方法） | 已实现（toJson 加 name/avatar） | 已实现（toJson 加 name/avatar） | ✅ 命名映射已记录 |
| conversation_mark_message_as_read | 有 | 有 | 已实现（删 markMessageAsRead/markAllMessagesAsRead） | 已实现（删） | 已实现（删） | ✅ |
| group_read_receipt_type | 有 | 有 | 已实现（ChatGroupMessageAck→ChatGroupReadReceipt，from 变对象、删 content） | 已实现（ExtSdkGroupAckHelper 改写） | 已实现 | ⚠️ `ChatGroupMemberInfo.role` 直接 int 赋值（推断 3） |
| message_read_receipt_type | 有 | 有 | 已实现（新增 ChatMessageReadReceipt） | 已实现（新增 Helper） | 已实现（新增 Json category） | ✅ |
| message_get_reaction | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| file_message_body_init_with_data | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| file_message_body_init_with_local_path | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| image_message_body_init_with_data | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| stream_chunk_sequence_number | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| conversation_get_message_param_changed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ getMessage 不再自动标已读（行为变化 4） |
| conversation_search_msg_scope_sync_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| message_create_txt_send_message_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| message_get_user_name_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| message_get_recaller_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |

### group（include 12 / defer 45）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| group_options_type | 有 | 有 | 已实现（删 ChatGroupOptions） | 已实现（Helper 改 Configs） | 已实现 | ✅ |
| group_style_enum | 有 | 有 | 已实现（删 ChatGroupStyle） | 已实现 | 已实现（toJson 删 style key） | ✅ |
| group_configs_type | 有 | 有 | 已实现（新增 ChatGroupConfigs；ChatGroup.options→configs，isDisabled 提升顶层） | 已实现（六 key） | 已实现（读 EMGroup.settings） | ⚠️ `isDisabled` JSON key 假设为顶层（推断 6）；Android `configs.inviteNeedConfirm` 无 getter 不下发（推断 7） |
| group_configs_type_enum | 有 | 有 | 已实现（位序 1/2/4/8/16/32 以 iOS 为准绳） | 已实现（**逐位掩码映射**，未直接 toNativeMask） | 已实现（掩码直传） | ✅ 双端位序不同已处理 |
| group_create_group | 有 | 有 | 已实现（删旧 createGroup） | 已实现（configs 版） | 已实现（configs 版） | ✅ |
| group_create_group_with_avatar | 有 | 有 | 已实现（createGroupEx 参数 options→configs） | 已实现 | 已实现 | ✅ |
| group_update_group_configs | 有 | 有 | 已实现（新增 updateGroupConfigs） | 已实现 | 已实现 | ✅ |
| group_get_public_groups_from_server | 有 | 有 | 已实现（删 fetchPublicGroupsFromServer） | 已实现（删） | 已实现（删） | ✅ |
| group_get_joined_groups_from_server | 有 | 有 | 已实现（删 fetchJoinedGroupsFromServer） | 已实现（删；另删 loadAllGroups 调用） | 已实现（删） | ✅ |
| group_delegate_join_request_declined | 有 | 有 | 已实现（onRequestToJoinDeclined 负载加 applicant） | 已实现（删旧回调） | 已实现（删旧回调） | ✅ |
| group_delegate_user_did_join_group | 有 | 有 | 无动作（自 4.15 用多成员版） | 已实现（清残留注册） | 已实现（删单成员版回调） | ✅ |
| group_delegate_user_did_leave_group | 有 | 有 | 无动作（同上） | 已实现（清残留注册） | 已实现（删单成员版回调） | ✅ |
| group_settings_property | 有 | 无 | 已实现（随 group_configs_type 一并改 configs） | 已实现 | 已实现（读 EMGroup.settings） | ✅ 虽 defer 但实现期已被 configs 重构覆盖 |
| group_is_push_notification_enabled | 有 | 无 | 未实施 | 未实施 | 已实现（toJson 删 noticeEnable key，编译强制） | ⚠️ defer 项被编译强制触及 |
| group_search_public_group | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_get_groups_without_push_notification | 有 | 无 | 未实施 | 未实施 | 已实现（删 wrapper，编译强制） | ⚠️ defer 项被编译强制触及 |
| group_get_group_specification_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_get_group_member_list_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_get_group_blacklist_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_get_group_mute_list_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_get_group_file_list_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_get_group_white_list_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_is_member_in_white_list_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_get_group_announcement_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_add_occupants_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_remove_occupants_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_block_occupants_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_unblock_occupants_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_change_group_subject_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_change_description_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_leave_group_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_destroy_group_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_block_group_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_unblock_group_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_update_group_owner_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_add_admin_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_remove_admin_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_mute_members_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_unmute_members_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_mute_all_members_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_unmute_all_members_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_add_white_list_members_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_remove_white_list_members_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_remove_group_shared_file_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_update_group_announcement_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_update_group_ext_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_join_public_group_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_apply_join_public_group | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ 新名 4.24.1 已有，RN 无改动需求 |
| group_accept_join_application | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ 同上 |
| group_decline_join_application | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ 同上 |
| group_accept_invitation_from_group_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_decline_invitation_from_group | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ 新名 4.24.1 已有 |
| group_is_member_only_renamed | 无 | 有 | 未实施 | 已实现（toJson 删 isMemberOnly key，编译强制） | 已实现（同上） | ⚠️ defer 项被编译强制触及 |
| group_get_users_new | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ iOS `users` 4.24.1 已有（N1）；RN 若已封装则双端均无需动 |
| group_get_from_server_fetch_members_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| group_load_all_groups_removed | 无 | 有 | 未实施 | 已实现（getJoinedGroups 删 loadAllGroups() 调用，编译强制：5.0 已包私有） | 不涉及 | ⚠️ defer 项被编译强制触及 |
| group_async_upload_shared_file_overload_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |

### contact（include 5 / defer 8）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| contact_get_all_contacts_from_server | 有 | 有 | 已实现（删 getAllContactsFromServer） | 已实现（删） | 已实现（删） | ✅ 双端命名不对称，已按语义配对（N7） |
| contact_get_contacts_from_server_with_cursor | 有 | 有 | 已实现（删 fetchContacts） | 已实现（删） | 已实现（删） | ✅ |
| contact_get_contacts_string_list_from_server | 有 | 有 | 已实现（删 fetchAllContacts） | 已实现（删） | 已实现（删） | ✅ |
| contact_delegate_on_friend_sync_start | 有 | 有 | 已实现（删 onContactSyncStart） | 已实现（停发） | 已实现（停发） | ✅ 替代路径 = 连接级 onDataSyncStart/Finish |
| contact_delegate_on_friend_sync_finished | 有 | 有 | 已实现（删 onContactSyncFinish） | 已实现（停发） | 已实现（停发） | ✅ |
| contact_add_contact_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| contact_get_blacklist_from_server_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| contact_add_user_to_blacklist_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| contact_remove_user_from_blacklist_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| contact_accept_invitation_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| contact_decline_invitation_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| contact_get_self_ids_on_other_platform_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| contact_save_black_list | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |

### room（include 2 / defer 5）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| room_create_chatroom | 有 | 有 | 已实现（删 createChatRoom） | 已实现（删） | 已实现（删） | ✅ |
| room_destroy_chatroom | 有 | 有 | 已实现（删 destroyChatRoom） | 已实现（删） | 已实现（删） | ✅ |
| room_get_all_chat_rooms_removed | 无 | 有 | 已删除（残余 MT 常量清理；TS 公开方法本不存在） | 已删除 | 已删除 | ✅ 用户裁决：三端删除不保留 |
| room_fetch_from_server_fetch_members_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ |
| room_remove_chat_room_listener_removed | 无 | 有 | 不涉及 | 已实现（改调 removeChatRoomChangeListener，编译强制） | 不涉及 | ⚠️ defer 项被编译强制触及 |
| room_listener_on_member_joined_2arg_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ RN 已用三参版 |
| room_listener_on_mute_list_added_removed | 无 | 有 | 未实施 | 未实施 | 未实施 | ⏸️ 注意：onMuteListAdded 仅余 Map 版（muteKVs），旧 mutes/expireTime 负载不再下发（推断 9） |

### push（include 0 / defer 3）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| push_update_push_display_style_sync | 有 | 无 | 未实施 | 不涉及 | 已实现（updateImPushStyle 改 completion 版，编译强制） | ⚠️ defer 项被编译强制触及 |
| push_update_push_display_name_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |
| push_get_push_options_from_server_sync | 有 | 无 | 未实施 | 未实施 | 未实施 | ⏸️ |

### error code（include 0 / defer 1）

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| error_contact_add_faild_typo | 有 | 无 | 无动作（RN 按数值 code 映射） | 无动作 | 无动作 | ⏸️ 值 1000 不变，grep 核实后关闭 |

**统计**：✅ 61 / ⚠️ 23 / ⏸️ 87 / ❌ 0，合计 171。按决策拆分：include 70 = ✅59 + ⚠️11；defer 101 = ⏸️87 + ⚠️12 + ✅2（两条 defer 因实现期被覆盖而关闭：`client_delegate_user_account_did_login_from_other_device` 本已 deprecated 本次三层删净、`group_settings_property` 随 configs 重构一并实现）。

## 3. 未匹配 / 疑点清单（34 条全量，压缩表述）

来自 iOS 清单（i1-i17）：

| 编号 | 现象（压缩） | 处理 / 建议 |
| --- | --- | --- |
| i1 | `EMGroup.users` 非 5.0.0 新增，iOS 迁移文档误列 | **已关闭（用户裁决 2026-09-16）**：忽略，用户将上报 native；RN 不动 |
| i2 | `sendMessageReadReceipts` 注释与签名不符（注释多出 aConversationId/aResult） | **已关闭**：以签名为准，RN 回调只暴露整体 error |
| i3 | `addConversationDelegate` delegate 参数 `_Nullable` 疑标注疏漏 | **已关闭（用户裁决）**：忽略，用户将上报 iOS；RN 按 `_Nonnull` 语义处理 |
| i4 | 大量「5.0.0 替代 API」实际 4.24.1 已存在（20+ 个） | 已关闭：结论性说明，RN 工作以删旧封装为主 |
| i5 | `joinGroupRequestDidReceive` 仅位置移动 | 已关闭：无 API 变化 |
| i6 | `getBlackList` 仅格式调整 | 已关闭：无 API 变化 |
| i7 | 7 个 completion 方法仅位置移动/标注微调 | 已关闭：无 API 变化 |
| i8 | `EMErrorContactAddFaild→Failed` 拼写修正文档未提 | **已关闭（用户裁决）**：RN 按数值映射无需修改；Flutter 若未用数值，5.0.0 版本调整为数值（Flutter 侧事项，非本任务） |
| i9 | iOS 同步 `renewToken:` 5.0.0 保留，与文档一致 | **已关闭（用户裁决）**：已了解。后续只有 token 登录；example 登录改造与 token 获取脚本经用户复审裁决（2026-09-16）**本次不需要处理** |
| i10 | 本地读取替代接口（getAllConversations 等）均未变 | 已关闭：作为 RN 迁移目标接口确认 |
| i11 | `EMClientDelegate.h` import 改 EMOptions.h | 已关闭：对 RN 无直接影响 |
| i12 | `EM_DEPRECATED_IOS` 宏改为忽略参数 | 已关闭：内部工程调整 |
| i13 | 聊天室仅删创建/解散，迁移文档一致 | **已关闭（用户裁决）**：已了解——SDK 不再有创建/解散聊天室能力，今后只能通过 REST API 操作。RN 侧 `createChatRoom`/`destroyChatRoom` 已删 |
| i14 | `EMGroupManagerListener.h` 删旧 delegate 转发 | 已关闭：无额外公开 API |
| i15 | `conversationName`/`conversationAvatar` 是实例方法而非属性 | **用户裁决**：name/avatar 可以为空，native iOS 的写法不对、Android 根本没有写（native 侧问题用户知悉）。RN 行动：TS 侧 `displayName`/`displayAvatar` 已为 optional；iOS wrapper toJson 加 nil 防护（本轮实施） |
| i16 | 4.24.2 侧分支 hotfix 不在 5.0.0 主线 | 保留提示：若 RN 曾基于 4.24.2 平版需注意该 hotfix 在 5.0.0 不存在 |
| i17 | `EMChatMessage+Private.h` +2 行（内部头） | 保留提示：RN iOS 原生层若直接引用 Private 头需另行核对 |

来自 Android 清单（a1-a10）：

| 编号 | 现象（压缩） | 处理 / 建议 |
| --- | --- | --- |
| a1 | `onReadReceiptForGroupMessageUpdated` 源码不存在，文档误称改名 | **已关闭**：以源码为准不平版该回调，群已读更新由 onMessageReadReceipts 承载 |
| a2 | 文档称删 4 个 `asyncFetchConversationsFromServer` 重载，实际 3 个 | 已关闭：以源码为准按 3 个收录 |
| a3 | `EMClient#getDeviceInfo()` 疑似内部 API 暴露 | **已关闭（用户裁决）**：不平版 |
| a4 | `toNativeMask`/`fromNativeMask` 为 public 但语义属内部 JNI 工具 | **已关闭（用户裁决）**：不平版 |
| a5 | `searchMsgFromDB(..., searchScope)` 同步重载删除文档未指明 | **已关闭（用户复审裁决 2026-09-16）**：初裁「迁移 asyncSearchMsgFromDB」前提经 native 源码核实不成立——5 个同步调用点对应重载在 5.0.0 均存活且未标废弃，`EMChatManager`/`EMConversation` 均无 `asyncSearchMsgFromDB` 可迁移——保持现状不改代码（详见 03-implementation.md 决策落实记录） |
| a6 | createGroup 无 avatar 重载删除文档未明确 | **已关闭（用户裁决）**：原描述有误——三端实现均使用 `groupAvatar` 字段，无 `avatar` 字段问题 |
| a7 | 行为变化 5 项（未读数收窄、getMessage 不标已读、保活移除、推送 Token 判断、前后台检测） | **用户裁决**：需要在注释里说明 → 本轮在对应 TS API 的 TypeDoc 中补行为变化注释（未读数收窄、getMessage 不再自动标已读；后三项对 RN 封装无 API 影响） |
| a8 | `AreaCode` 旧 int 常量 7 个全删，文档只提 setAreaCode 签名变化 | **已关闭（用户裁决）**：修改已确认无误（Android wrapper 枚举映射含 GLOB(-1) 兜底） |
| a9 | `EMLoginExtensionInfo` 未变化 | 已关闭：无变化确认 |
| a10 | 根包其余文件 diff 为空；presence/thread/userinfo/push 无签名变化 | 已关闭：无变化确认 |

配对新发现跨端不对齐（N1-N7）：

| 编号 | 现象（压缩） | 处理 / 建议 |
| --- | --- | --- |
| N1 | 群成员合并列表接口双端引入版本不同（iOS 4.24.1 已有 / Android 5.0.0 新增） | **已关闭（用户裁决）**：Android 没有 `users`，该字段不添加 |
| N2 | `isRead` 双端变化不对等（Android 改名且取值取反） | **已关闭（用户复审裁决 2026-09-16）**：Android 改名后为 `isRead()`（另有 `isPeerRead()`），RN 当前实现直接映射不取反，用户确认无误 |
| N3 | iOS 批量删群组同步方法 36 条，Android 对应全部保留 | ⏸️ 全部 defer，RN 只用异步封装，建议批量确认「无需处理」 |
| N4 | iOS 删 push 同步方法 3 条，Android push 零变化 | ⏸️ 全部 defer；其中 updateImPushStyle 已被编译强制改 completion 版 |
| N5 | 输入文件统计口径不一致（自称 105/82，实际 150/107 行） | 已关闭：统计一律按合并后实际条目（171） |
| N6 | `getUnreadMessageCount` iOS 新增 / Android 仅行为变化 | **已关闭**：RN 已有封装无动作，行为变化已写 CHANGELOG |
| N7 | contact 服务端拉取接口双端命名不对称 | **已关闭**：按返回类型语义配对，contact 三条 include 已实现 |

## 4. 问题清单

### 4.1 推断项（03 §2，12 条）

1. `modifyMessageBody` 加 `ext`（契约写的方法名是 `modifyMessage`）；`modifyMsgBody` 本就带 ext 不动。
2. `loginWithToken` payload 保留 `isPassword: false` key（wrapper 忽略）。
3. `ChatGroupMemberInfo.role` 直接 int 赋值（镜像 `ChatGroupMember` 既有做法，避免循环引用）。
4. `fetchGroupMessageReadReceipts` 默认 `pageSize ?? 20`、`cursor ?? ''`（照既有分页惯例）。
5. `removeMessagesFromServerWithMsgIds/WithTimestamp` 的 `isLoginBefore()` 守卫改为 `isConnected()`。
6. `ChatGroup.isDisabled` JSON key 假设为顶层 `isDisabled`。
7. Android 群 toJson `configs.inviteNeedConfirm` 不下发（`EMGroup` 5.0.0 无该 getter）；TS 侧按 optional 容忍。**用户补充：该字段原在 `EMGroupOptions`，5.0.0 改名为 `EMGroupConfigs`——与 RN 侧 configs 重构一致，无追加动作。**
8. Android options toJson 补 `dataSyncType`（对称推断）；iOS login payload key 仍为 `pwdOrToken`。
9. 聊天室 `onMuteListAdded` 仅余 Map 版（`muteKVs`），旧 `mutes`/`expireTime` 负载不再下发（native 行为变化）。**更新（2026-09-16）：用户在 iOS wrapper 手动删除了旧版 `chatroomMuteListDidUpdate:addedMutedMembers:muteExpire:` 回调实现；Android wrapper 确认本就只发 Map 版。**
10. iOS `autoLoginDidCompleteWithError:` wrapper 实现成无触发源死代码（可编译）；`onAppActiveNumberReachLimit` 无触发源。**更新（用户裁决）：iOS delegate 已删（契约条目标作废保留）；`onAppActiveNumberReachLimit` 经复查 Android 仍有触发源（`onDisconnected(8)`，native 错误码 8 存活），事件保留，仅 iOS 失效，已写 CHANGELOG。**
11. 群成员事件此后只发数组版 `{members:[...]}`（单成员版回调 native 已删）。**更新（2026-09-16 复查）：native 双端 5.0.0 群组/聊天室成员回调均只保留数组版（iOS `EMGroupManagerDelegate`/`EMChatroomManagerDelegate` 单成员版已删或废弃，Android `EMGroupChangeListener`/`EMChatRoomChangeListener` 同样）；RN 旧版单成员事件 `onMemberJoined`/`onMemberExited`/聊天室旧 `onMuteListAdded` 本轮已随 deprecated 清理删除，dispatch 中旧 `type` 分支同步移除。**
12. ~~`EMConversationFilter (Json)` category（ObjC）无调用方但保留~~ → **已删除（用户裁决）**：ExtSdkToJson.h/.m 的 category 与 import 一并移除，无调用方。

### 4.2 契约空白裁决（03 §3，2 条）

- **`fetchConversationsByOptions`**：底层 native 双端全删且无替代 → 裁决三层删净（TS 方法、MT 常量、dispatch case、wrapper stub、`ChatConversationFetchOptions` 模型类），grep 三层零残留。**更新（用户裁决 2026-09-16）：残余 `EMConversationFilter` 相关内容也不需要——iOS `EMConversationFilter (Json)` category（ExtSdkToJson.h/.m）已删除；Android 侧核查零残留。**
- **`getAllChatRooms`**：~~仅 Android native 删除、iOS 保留 → Android wrapper 降级为报错~~ → **用户裁决（2026-09-16）：三端删除不保留**。已实施：TS 残余 MT 常量清理（公开方法本不存在），Java wrapper/dispatch/常量、objc key/Value/methodMap/dispatch/wrapper/supportedEvents、cpp 常量全部删净。

### 4.3 实现期编译强制改动要点（超出 defer「预期无动作」范围，必须改通）

- Android 3 处：`getLoggedInDevicesFromServer` 改异步 `fetchLoggedInDevicesFromServerWithToken`；`getJoinedGroups` 删 `loadAllGroups()` 调用（5.0 已包私有）；`removeChatRoomListener`→`removeChatRoomChangeListener`。另有 `setAreaCode(int)` 删除 → 改 `AreaCode` 枚举映射（含 GLOB(-1) 兜底）。
- iOS 5 处：mergeMessage 只读属性适配；resendMessage→sendMessage；updateImPushStyle 改 completion 版；删 getGroupsWithoutPushNotification wrapper；群 toJson 删 noticeEnable/style/isMemberOnly key。
- Android wrapper 已用真实 `hyphenate-chat:5.0.0` AAR（Maven Central）离线 javac 编译验证通过，0 error；iOS 侧编译验证已在阶段四完成（example SPM 路径构建成功，见 04-verification.md §2）。

### 4.4 native 5.0.0 仍保留但标记废弃的 API 清单（用户要求单独列举）

来源：native 仓库 5.0.0 分支头文件/源码中的废弃标注（iOS `__deprecated_msg`、Android `@Deprecated`）。这些是**标记作废但尚未删除**的 API（与「已删除」区分）；RN 封装策略：已废弃变体一律不平版/已删除，统一走替代 API。

**iOS（sdk-5.0，公开 6 条）：**

| native API | 替代 | RN 处理 |
| --- | --- | --- |
| `EMConversation loadMessagesWithKeyword:timestamp:count:fromUser:searchDirection:scope:completion:`（单 `fromUser` 版） | `fromUsers`（数组）版 | RN 未封装单 fromUser 版，无需动作 |
| `EMFetchServerMessagesOption.from` 属性 | `fromIds` | RN 模型只暴露 `fromIds`，无需动作 |
| `EMChatroom.muteList` 属性 | `muteMembers` | RN `ChatRoom.muteList` 对应项本轮随 deprecated 清理删除，用 `muteKVList` |
| `EMChatroomManagerDelegate userDidJoinChatroom:user:` | `userDidJoinChatroom:user:ext:` | RN 事件走 ext 版负载，无需动作 |
| `EMChatroomManagerDelegate chatroomMuteListDidUpdate:addedMutedMembers:muteExpire:` | Map 版回调 | RN iOS wrapper 已由用户手动删除该回调实现 |
| `EMMultiDevicesDelegate multiDevicesUndisturbEventNotifyFormOtherDeviceData:` | `multiDevicesConversationEvent:conversationId:conversationType:` | RN 未封装该旧回调，无需动作 |

内部（非公开 API，仅记录）：`EMManager init`（Helper/EMManager.h:32，内部基类）。

**Android（SDK_5.0.0，公开 4 条）：**

| native API | 替代 | RN 处理 |
| --- | --- | --- |
| `EMChatManager.downloadAttachment(EMMessage)` | `downloadAttachment(EMMessage, EMCallBack)` | RN 未封装无回调版（Promise 封装本就等价回调版），无需动作 |
| `EMChatManager.downloadThumbnail(EMMessage)` | `downloadThumbnail(EMMessage, EMCallBack)` | 同上 |
| `EMImageMessageBody.setThumbnailSecret` / `getThumbnailSecret` | `setSecret` / `getSecret` | RN `ChatFileMessageBody.thumbnailSecret` 本轮随 deprecated 清理删除，用 `secret` |
| `EMImageMessageBody.isSendOriginalImage` | `isOriginalImage` | RN 未封装该方法，无需动作 |

内部/工具（RN 未封装，仅记录）：`EasyUtils.isAppRunningForeground`（util）、adapter 包 `EMAChatManagerListener`/`EMAGroupManagerListenerInterface` 各 1-2 处（内部适配层）。

注：Android 5.0.0 本次**无新增废弃**——4.x 的 `@Deprecated` 大多直接删除（见变更清单 removed 条目），上表为 5.0.0 中仍存活的废弃标注全量。

## 5. 用户决策记录（2026-09-16 已全部裁决）

1. **`renewAgoraToken` → `renewToken`**：**已裁决——改名**。native 只有 `renewToken`，TS 公开方法同步改名（参数 `agoraToken`→`token`），MT 常量三层本已是 `renewToken` 无需动。本轮实施。
2. **`ChatMessage` 四属性改名**（hasReadAck→isPeerRead 等）：**已裁决——接受**该 breaking change 进 5.0.0（阶段三已实施）。
3. **`fetchGroupMessageReadReceipts` 跨端差异**：**已裁决——接受**，TS 保持现状（`totalCount` optional、`groupId` Android 忽略）。
4. **defer 101 条**：**已裁决——按默认批量通过**「无需处理」（其中已被实现期编译强制改动的 7 条维持实现结果）。
5. **`dataSyncType` 双端默认值不一致**：**已裁决——接受**，RN 不设显式默认，遵循 native。
6. **`getAllChatRooms`**：**已裁决——三端删除，不保留**（替代原 Android 降级报错方案）。本轮实施。
7. **`no_login_smoke` 预期值**：已实证关闭（见下）。

另：用户追加的通用裁决——
- **4.x→5.x 主版本允许 API 移除**：native 删除的 RN 同步删除（不标记作废）；**RN 自身 deprecated API 本次一并删除**（17 处 @deprecated，均已有替代 API）。本轮实施。
- **native 标记作废（未删除）的 API 单独列举**：见 §4.4。
- **`ChatAreaCode`/`ChatDataSyncType` 枚举归位**：不放独立文件，移入使用者文件 `ChatOptions.ts`。本轮实施。
- **不再提供自动登录流程**：5.0.0 起由使用者自行模拟（已写 CHANGELOG，example auto_mode 注释已说明）。
- **iOS 从 5.0.0 起默认 SPM 集成，继续支持 CocoaPods**：文档同步（docs/spm.md、AGENTS.md）。
- **example 登录改造与 token 获取脚本**：**用户复审裁决（2026-09-16）：本次不需要处理**。example 在阶段三已改为 token 登录（LoginPage/auto_mode）。
- **a5 `searchMsgFromDB`（复审裁决 2026-09-16）**：已关闭——保持现状，不做迁移（前提核实见 §3 a5 行与 03-implementation.md）。
- **N2 `isRead`（复审裁决 2026-09-16）**：已关闭——当前实现（直接映射不取反）确认无误。
- **CocoaPods / SPM 发布状态（复审裁决 2026-09-16）**：用户确认 HyphenateChat 5.0.0 已发布到 CocoaPods trunk 与 SPM 远端；阶段四 iOS 验证走的 SPM 路径仅为当时 trunk 未发布的临时路径，podspec `~> 5.0.0` 可直接走默认 CocoaPods 路径。

## 6. 验证结果

详见同目录 `04-verification.md`（2026-09-16 实测）。摘要：

| 验证项 | 结果 | 备注 |
| --- | --- | --- |
| `yarn typecheck` / `yarn lint` / `check:circular:dpdm` / `yarn test --no-watchman` | ✅ | 19 suites / 110 tests 全过（含 TS⊆Java⊆ObjC 契约测试）；lint 初跑 1 个 prettier 格式错误已修复复跑通过 |
| example 构建（Android） | ✅ | 真实 Maven `hyphenate-chat:5.0.0` AAR，BUILD SUCCESSFUL |
| example 构建（iOS） | ✅（SPM 路径） | 验证时 CocoaPods trunk 无 5.0.0，走 SPM 集成路径完成；**2026-09-16 用户确认 CocoaPods 与 SPM 远端均已发布 5.0.0**，默认 CocoaPods 路径可用 |
| 无登录冒烟（Android / iOS，各 init+7 步） | ✅ | 双端全绿；contact 步初跑跨端分歧（getAllContacts：Android error 3 / iOS 空成功），已校准为 `addContact` 步骤，复测双端一致 201 |
| 契约要素 grep 抽查（MT 常量四层、事件 supportedEvents、消息四 key、isRead 取反、掩码映射、版本号对齐、CHANGELOG） | ✅ | 见 04-verification.md §4 |
| 登录态功能验证（群已读回执、设备管理、dataSync 事件等） | ❌ 部分不通过 | 2026-09-18 单账号 21 步复验：Android 19 passed / 1 crashed / 1 not-run；iOS 20 passed / 1 failed。dataSync 三事件两端已观察；双账号回执事件仍未执行 |
| 阶段四门禁（porting_guard.sh gate） | ✅ | exit=0 无输出 |

**第二轮（审查决策落实，2026-09-16）验证：**

| 验证项 | 结果 | 备注 |
| --- | --- | --- |
| `yarn typecheck` / `yarn lint` / `check:circular:dpdm` / `yarn test --no-watchman` | ✅ | 三轮改动（TS 17 处 deprecated 删除 + renewToken 改名 + 枚举归位；Android getAllChatRooms 删净；iOS getAllChatRooms/filter/autoLoginDidComplete 删除 + nil 防护）后复跑全绿，110 tests |
| example 构建（Android） | ✅ | 子代理改动后 `yarn example build:android` BUILD SUCCESSFUL |
| example 构建（iOS） | ✅ | 子代理改动后 `yarn example build:ios` 成功（SPM 路径） |
| 无登录冒烟（Android / iOS） | ✅ | 第二轮改动后双端复测全绿（init + 7 步） |
| 门禁复跑 | ✅ | exit=0 无输出 |

**第三轮（可追溯运行报告与错误路径复验，2026-09-18）：**

| 验证项 | Android | iOS | 结论 |
| --- | --- | --- | --- |
| 21 步登录态脚本 | 19 passed / 1 crashed / 1 not-run | 20 passed / 1 failed | 正向 API 与两个批量缺失消息错误路径通过；分页缺失消息行为不一致 |
| `fetchGroupMessageReadReceipts` 传本地不存在的 msgId | native `NullPointerException`，进程终止 | 空成功 `{cursor:"", totalCount:0, list:[]}` | ❌ 修复暂缓；最终错误码已裁决双端统一为 110 |
| 三个 dataSync 事件 | 均观察到 | 均观察到 | ✅ |
| `onMessageReadReceipts` / `ChatGroupMemberInfo` | 未覆盖 | 未覆盖 | ⏭️ 需要双账号 |

权威本地证据：Android `build/reports/5.0.0/20260918070127-android-emulator-5554/`，iOS `build/reports/5.0.0/20260918070518-ios-4BEA133B-4B24-430F-96FC-924632C2CF53/`，跨端对比 `build/reports/5.0.0/comparison-20260918071059.md`。这些目录被 Git 忽略，仅脱敏结论进入本报告。

## 7. 第三轮决策与遗留项（2026-09-18）

1. **缺失消息错误码统一**：用户已裁决 iOS/Android 最终统一为 `INVALID_PARAM`（110）；`fetchGroupMessageReadReceipts` 的 Android 崩溃、iOS 空成功及三个回执 API 的统一实现本轮暂缓。
2. **消息 JSON 既有跨端字段差异**：报告发现 `body.targetLanguageCodes`、`receiverList` 仅 Android 返回；不属于本次 5.0.0 新增字段，建议先标记为既有差异，不在本轮顺手扩 scope，除非用户要求统一。
3. **双账号验证**：`onMessageReadReceipts` 和非空 `ChatGroupMemberInfo` 仍需协调第二账号读取群消息后复验。
4. **正向/反向用例拆分**：用户确认将 5.0.0 单账号脚本拆为 positive/negative 两条路径；报告目录结构与双端对比逻辑不变。已知会令 Android native 崩溃的 `fetchGroupMessageReadReceipts` 缺失消息用例暂不执行，只在报告中持续记录；双账号脚本暂不考虑。
5. **反向用例新增发现**：双端对非法群成员、不存在群、缺失修改消息、空会话 ID 和设备管理无效 token 的错误码一致；两个批量回执 API 均仍返回 110，符合预期。`renewToken("")` 在 Android 返回 104、iOS 却成功；核对 iOS native 5.0.0 源码确认其空 token 分支构造错误后未立即返回。本轮仅记录，不修改 RN wrapper 或 native 行为。

## 8. 第四轮决策：项目侧移除多集群支持（2026-09-21）

用户裁决：产品支持多种集群，但项目实现侧不做「多选」——`example/config.local.json` 只描述当前要跑的那一个环境，`restApi` / `appKey` / `clientId` / `clientSecret` 提到顶层，换环境＝直接改/换这个文件。需要多套环境时，使用者自行在 Git 外维护 `config.ngi.json` / `config.ebs.json` 这类副本（不入库、敏感信息人工管理，`.gitignore` 已加 `example/config.*.json` 兜底），用哪套就复制为 `config.local.json`。已移除：`yarn env:use`（含 `scripts/env-use.js`）、`env.ts.<cluster>` 缓存、`clusters` / `defaultCluster` / 每条资源的 `cluster` 字段、集群级 chatOptions 合并；`env-gettoken.js` 改为直接写 `example/src/env.ts` 且必填字段缺失即 fail fast。**保留私有化部署字段**（`enablePrivateConfig` + server 字段，描述「这一个环境是不是私有化」，与选集群无关）。旧格式配置会得到一句明确的迁移报错。与 Flutter 侧 `ece93914` 同一裁决。详见 `04-verification.md` 第 11 节。
