# React Native 5.1.0 平版验收报告（2026-11-10）

目标：native iOS 5.0.0 → 5.1.0 / Android SDK_5.0.0 → SDK_5.1.0；React Native 5.0.0 → 5.1.0。

开发分支：`5.1.0`，基于 `5.x@9610de7`；worktree：`react-native-chat-sdk/.worktree/5.1.0`。**用户已确认本次升级并授权提交，尚未推送。平版实现已获用户认可；Android 新增正反向脚本通过，iOS 运行验证仍因启动缺库未完成。**

完整差异见 [01-api-diff.md](01-api-diff.md)，契约见 [02-contract.md](02-contract.md)，实现见 [03-implementation.md](03-implementation.md)，验证证据见 [04-verification.md](04-verification.md)。

## 二维对照

✅ 表示代码与 native 公开契约一致；运行覆盖以验证记录为准，不表示所有业务场景已验证。

| 变更项 | iOS 源 | Android 源 | TypeScript | Android Wrapper | iOS Wrapper | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| conversation_page | 新增本地分页 | 新增异步本地分页 | getConversationsFromDB + ChatCursorResult 映射 | 异步透传 + 既有 cursor helper | completion + 既有 cursor helper | ✅ Android 正向分页/逆向游标通过；iOS 待运行 |
| options_chatroom_conversation | 新属性，默认 NO | 新 setter/getter，默认 false | enableChatroomConversation 默认 false | 双向 JSON 映射 | 双向 JSON 映射 | ✅ 实现；收发行为待测 |
| options_auto_load | 既有自动加载开关 | 既有自动加载开关 | autoLoadConversations 默认 true | 映射 setAutoLoadAllConversations | 映射 autoLoadConversations | ✅ 分页必需配套 |
| group_invite_confirm | 既有 configs.IsInviteNeedConfirm | 新 isInviteNeedConfirm | 复用 configs.inviteNeedConfirm | 新增真实 getter 序列化 | 既有实现 | ✅ Android 真实群 true/false/更新已核对；空配置差异仍保留 |
| multi_device_group_update | 既有 34 | 新增 34 | 既有枚举/映射；修正文档 | 既有整数事件透传 | 既有整数事件透传 | ✅；多设备业务触发未测 |
| options_data_sync_default | 默认 Conversations | 默认从 NONE 改 CONVERSATIONS | 保持 undefined，文档更新 | 不覆盖 native 默认 | 不覆盖 native 默认 | ✅ |
| options_sync_ws_host | 删除 | 删除 setter/getter | 从未封装 | 无残留 | 无残留 | ✅ skip |
| options_sync_ws_port | 删除 | 删除 setter/getter | 从未封装 | 无残留 | 无残留 | ✅ skip |
| options_brand_domain | 新属性 | 新 setter/getter | 不暴露 | 不设置 | 不设置 | ✅ skip，KI-107 |
| image_thumbnail_secret | 新标废弃，未删除 | 已废弃，未删除 | 5.0 已删旧字段 | 本次不新增封装 | 本次不新增封装 | ✅ skip；废弃时间不同 |
| search_keyword_limits | 已有 120/120/5 | 注释修正为 120/120/5 | 既有注释一致 | 无需变化 | 无需变化 | ✅ skip |

## 已完成验证

- typecheck、lint、循环依赖、SDK JS/类型构建全部通过。
- 现有 Jest：19 suites / 117 tests 全过；没有修改断言。
- Android example 编译成功；现有无登录冒烟 init + 7 steps 通过。新增正向 15/15、逆向 2/2 通过；临时资源清理成功，字段人工核对无异常。
- iOS SPM 已解析 5.1.0，example **编译成功**；运行时因 App 未嵌入 HyphenateChat.framework 崩溃，现有冒烟未进入脚本。
- 常量、dispatch、参数与返回 JSON、版本号逐项静态核验通过。

## 未匹配清单与问题

1. Android isInviteNeedConfirm 在底层 groupSetting 为 null 时返回 true；iOS 从 configs 读取。wrapper 保留 native 值，不自行补默认或过滤。本次 Android 真实群创建、服务端查询及 true→false 更新均核对正常；未覆盖底层 groupSetting=null 特殊状态。
2. iOS thumbnailSecretKey 本轮才废弃；Android 早已废弃。RN 5.0 已移除旧公开属性，本轮无删除动作。
3. GROUP_UPDATE(34) 与 GROUP_METADATA_CHANGED(52) 语义不同，前者为群信息，后者为群成员自定义属性；已删除旧的「Android 只有 52」说明。
4. 旧版缺失消息群回执问题：Android 5.1 源码有空消息防护；本轮未运行该路径，未改回执 wrapper/错误码。需对照 Flutter 已有结论，不能宣布历史问题关闭。
5. iOS SPM 启动缺库：DYLD 找不到 `@rpath/HyphenateChat.framework/HyphenateChat`；App 包同时未含 aosl.framework。已向用户同步并询问 Flutter 是否同类问题，暂不添加嵌入补丁或切换集成方式。
6. Skill 的 hook 配置已安装；无法由工具接口证明本会话已获 hook 信任，采用每阶段手动 gate 并留痕。

## 已确认范围与剩余验证

- 新增两个 `example/ci/port_5_1_0_{positive,negative}.json` 脚本；只用现有 success/errorCode，补必要的群详情 API 注册。先跑后记录异常，未修改测试架构。
- Android 17 个步骤全部满足预期，无新增失败或已证实的 native 缺陷；报告与人工字段核对见 [04-verification.md](04-verification.md)。调用通过不等于覆盖所有字段与排序规则。
- Flutter 参考文档及平版目录已核对，本次群配置与非法游标结果一致；Flutter 的运行验证使用 CocoaPods，不能作为 RN SPM 启动问题已解决的证据。
- 多账号/多设备协作测试按用户要求排除。聊天室会话开关本轮只随初始化传入 false，收发行为未测；未为非法页大小虚构错误码。
- iOS SPM 缺库仍待后续修复范围确认；本轮没有修改集成方案，新增 iOS 用例未运行。本次按用户确认统一提交，尚未推送。
