# CI 用例对齐 Flutter 记录（2026-11-20）

## 背景

Flutter SDK 的 CI 用例位于 `im_flutter_sdk/example/integration_test/`，共 25 个 Dart 文件、94 个唯一 case。RN 在本轮之前只有 `docs/ci/native-case-mapping.json` 中的 17 个 case，覆盖率明显不足。

本轮以 Flutter 的场景和断言为参考，把能映射到目标 RN SDK 1.21.0（Android 4.25.1 / iOS 4.25.0）公开 API 的用例补进 `example/src/ci/modules/*_cases.ts`。源用例来自 5.1.0，但目标 native 基线不随源版本升级。约束：

- 只补用例，不改 harness、entry、构建脚本或 native。
- RN 仍然只有五个固定 entry：`logged_out`、`logged_in_base`、`logged_in_group`、`logged_in_contact`、`logged_in_user_info`。所有 entry 固定 `autoLoadConversations=true`、`enableChatroomConversation=false`，不允许为某个用例新增第六个 entry。
- 用例编号按模块继续递增；不要复用已删除的编号。
- 用例必须登记到 `docs/ci/native-case-mapping.json`，否则 `check_case_mapping.js` 和 CI 断言都会失败。

## 结果总览

| 模块     | Flutter case | RN 原有 | 原有缺口 | 本次新增 | RN 现在 |  跳过 |
| -------- | -----------: | ------: | -------: | -------: | ------: | ----: |
| APP      |            1 |       1 |        0 |        0 |       1 |     0 |
| AUTH     |            7 |       1 |        6 |        4 |       5 |     2 |
| CONTACT  |           11 |       2 |        9 |       10 |      12 |     0 |
| CONV     |           18 |       3 |       15 |       13 |      16 |     5 |
| GROUP    |           28 |       2 |       26 |       25 |      27 |     1 |
| MSG      |           15 |       1 |       14 |       13 |      14 |     2 |
| PRESENCE |            7 |       2 |        5 |        6 |       8 |     0 |
| ROOM     |            5 |       2 |        3 |        5 |       7 |     0 |
| USERINFO |            2 |       3 |        0 |        0 |       3 |     0 |
| **合计** |       **94** |  **17** |   **78** |   **76** |  **93** | **10** |

说明：

- “原有缺口”按模块数量直接相减，不表示 Flutter 与 RN 的 case 一一同号。
- CONTACT、PRESENCE、ROOM 的新增量大于原有缺口，是因为同时补了 Flutter 侧没有单独编号、但 RN 这边值得覆盖的边界（例如缺失联系人、订阅列表、聊天室成员状态）。
- 76 个新增 case 全部使用 `RN-<PREFIX>-<seq>` 编号，且每个都登记了 entry/module/platforms/nativeRef；目标缺失能力对应的 3 个源编号保留为空洞，不复用。

新增编号范围：

- AUTH：`RN-AUTH-003` ~ `RN-AUTH-007`
- CONTACT：`RN-CONTACT-003` ~ `RN-CONTACT-012`
- CONV：`RN-CONV-004` ~ `RN-CONV-013`、`RN-CONV-017`、`RN-CONV-019` ~ `RN-CONV-021`
- GROUP：`RN-GROUP-003` ~ `RN-GROUP-028`
- MSG：`RN-MSG-002` ~ `RN-MSG-010`、`RN-MSG-012`、`RN-MSG-014` ~ `RN-MSG-016`
- PRESENCE：`RN-PRESENCE-003` ~ `RN-PRESENCE-008`
- ROOM：`RN-ROOM-003` ~ `RN-ROOM-007`

## 跳过的用例

| Flutter case | 计划 RN 编号 | 原因                                                                                                                                                                                   |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FL-AUTH-002  | RN-AUTH-002  | 目标 RN 1.21.0 没有 device-ID 公开 API；`src/` 中不存在 `getCurrentDeviceId`。                                                                                                               |
| FL-CONV-011  | RN-CONV-014  | 断言 `autoLoadConversations=false` 并使用 `getConversationsFromDB` 分页；该选项必须在 init 前设置，五个固定 entry 都是 `true`，不能新增第六个 entry。                                  |
| FL-CONV-012  | RN-CONV-015  | 非法 cursor 的 110 断言同样要求 `autoLoadConversations=false`；在 base entry 下不在文档契约内，且本轮不做设备验证。                                                                    |
| FL-CONV-015  | RN-CONV-018  | pinned-first 的 `getConversationsFromDB` 分页依赖同一个初始化前提。                                                                                                                    |
| FL-MSG-010   | RN-MSG-011   | 需要离线 peer 通过 REST 发群消息，并等待群成员关系；`CiRestFixture` 没有群消息发送和群成员查询能力，无法在允许修改的文件内安全准备。                                                   |
| FL-CONV-013  | RN-CONV-016  | 目标 native 在 `enableChatroomConversation=false` 时发送聊天室消息仍会创建本地 room conversation（Android 实测），与 Flutter 断言相反；该差异属于 native 行为，不在本轮用例内强行改断言。 |
| FL-MSG-012   | RN-MSG-013   | `downloadAttachment` 对本地路径重写为 external app 目录后读取 `.source` 报 ENOENT（Android 实测），属于 native 下载路径问题；上传路径已由 RN-MSG-012 覆盖。                            |
| source AUTH-007 | RN-AUTH-007 | 目标没有 source 依赖的 data-sync bitmask/callback 契约，已移除该专测同步事件的 case。 |
| source CONV-011 | RN-CONV-011 | 目标没有批量 `deleteConversations` 公开能力，不能用循环单删冒充，已移除。 |
| source GROUP-015 | RN-GROUP-015 | 目标没有等价 `updateGroupConfigs` 公开能力，已移除。 |

因此 `RN-AUTH-002/007`、`RN-CONV-011/014/015/016/018`、`RN-GROUP-015`、`RN-MSG-011/013` 这些编号是故意留空的，不要复用。

## 覆盖要点

- AUTH：登出/重登恢复、重复登录 200、未登录空用户/空 token 的平台错误码；data-sync 专测因目标无公开能力移除。
- CONTACT：带/不带会话删除、黑名单增删查、未登录负例、缺失联系人、备注读写与恢复。
- CONV：扩展字段、latest/lastReceived、更新/删除、过滤、排序、置顶、未读、本地+服务端删除、会话标记；依赖特殊初始化的分页、聊天室语义和批量删除按上表留空。
- GROUP：建群/销毁/邀请确认、名称/描述/扩展/公告/头像/名片、配置、成员/管理员/成员信息/属性/黑名单/禁言/白名单、全员禁言、转让/退群/公开群、共享文件上传下载。目标 native 本地成员缓存在清空 namecard 后可能仍返回旧值（Android 实测），GROUP-014 以服务端成员列表作为清空的权威读回，代码内有注释说明。
- MSG：发送最终回调、导入/更新、关键词/选项搜索、聚合、服务端历史、文件/图片上传、置顶、reaction、未登录/空接收方/缺失消息负例；下载因 native 路径问题跳过。
- PRESENCE：发布/查询/订阅/取消订阅/订阅列表；登录态用已配置的离线 peer 做订阅目标。
- ROOM：加入/重进、公告、成员移除、黑名单、禁言、管理员升降级。

## 验证

- `yarn typecheck`：通过（exit 0）。
- `yarn eslint example/src/ci/modules/*_cases.ts`：通过（exit 0）。
- `npx prettier --check example/src/ci/modules/*_cases.ts docs/ci/native-case-mapping.json`：通过。
- `node scripts/ci/check_case_mapping.js`：通过，93 个 case 与 mapping 一致。
- `yarn test:ci-scripts`：36/36 通过。
- Android/iOS 设备回归：本轮当前环境未运行，不能以源分支或历史 run 标识代替目标 1.21.0 证据；保持 `not-run`。

本轮没有修改目标 SDK `src/`、Android/iOS wrapper 或 native 依赖；没有提交代码。设备与远程 workflow 尚未验证。

- `RN-MSG-002` 原先等待“本地联系人包含 peer”；目标 RN 1.21.0 没有公开 data-sync bitmask，且 iOS 冷启动本地库没有该联系人。已移除该本地联系人前置，保留 REST 好友关系准备和消息发送回调断言。
