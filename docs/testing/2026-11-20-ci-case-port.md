# CI 用例对齐 Flutter 记录（2026-11-20）

## 背景

Flutter SDK 的 CI 用例位于 `im_flutter_sdk/example/integration_test/`，共 25 个 Dart 文件、94 个唯一 case。RN 在本轮之前只有 `docs/ci/native-case-mapping.json` 中的 17 个 case，覆盖率明显不足。

本轮以 Flutter 的场景和断言为参考，把能映射到 RN 5.1.0 公开 API 的用例补进 `example/src/ci/modules/*_cases.ts`。约束：

- 只补用例，不改 harness、entry、构建脚本或 native。
- RN 仍然只有五个固定 entry：`logged_out`、`logged_in_base`、`logged_in_group`、`logged_in_contact`、`logged_in_user_info`。所有 entry 固定 `autoLoadConversations=true`、`enableChatroomConversation=false`，不允许为某个用例新增第六个 entry。
- 用例编号按模块继续递增；不要复用已删除的编号。
- 用例必须登记到 `docs/ci/native-case-mapping.json`，否则 `check_case_mapping.js` 和 CI 断言都会失败。

## 结果总览

| 模块     | Flutter case | RN 原有 | 原有缺口 | 本次新增 | RN 现在 |  跳过 |
| -------- | -----------: | ------: | -------: | -------: | ------: | ----: |
| APP      |            1 |       1 |        0 |        0 |       1 |     0 |
| AUTH     |            7 |       1 |        6 |        5 |       6 |     1 |
| CONTACT  |           11 |       2 |        9 |       10 |      12 |     0 |
| CONV     |           18 |       3 |       15 |       14 |      17 |     4 |
| GROUP    |           28 |       2 |       26 |       26 |      28 |     0 |
| MSG      |           15 |       1 |       14 |       13 |      14 |     2 |
| PRESENCE |            7 |       2 |        5 |        6 |       8 |     0 |
| ROOM     |            5 |       2 |        3 |        5 |       7 |     0 |
| USERINFO |            2 |       3 |        0 |        0 |       3 |     0 |
| **合计** |       **94** |  **17** |   **78** |   **79** |  **96** | **7** |

说明：

- “原有缺口”按模块数量直接相减，不表示 Flutter 与 RN 的 case 一一同号。
- CONTACT、PRESENCE、ROOM 的新增量大于原有缺口，是因为同时补了 Flutter 侧没有单独编号、但 RN 这边值得覆盖的边界（例如缺失联系人、订阅列表、聊天室成员状态）。
- 79 个新增 case 全部使用 `RN-<PREFIX>-<seq>` 编号，且每个都登记了 entry/module/platforms/nativeRef。

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
| FL-AUTH-002  | RN-AUTH-002  | RN 5.1.0 没有 device-ID 公开 API；`src/` 中不存在 `getCurrentDeviceId`。                                                                                                               |
| FL-CONV-011  | RN-CONV-014  | 断言 `autoLoadConversations=false` 并使用 `getConversationsFromDB` 分页；该选项必须在 init 前设置，五个固定 entry 都是 `true`，不能新增第六个 entry。                                  |
| FL-CONV-012  | RN-CONV-015  | 非法 cursor 的 110 断言同样要求 `autoLoadConversations=false`；在 base entry 下不在文档契约内，且本轮不做设备验证。                                                                    |
| FL-CONV-015  | RN-CONV-018  | pinned-first 的 `getConversationsFromDB` 分页依赖同一个初始化前提。                                                                                                                    |
| FL-MSG-010   | RN-MSG-011   | 需要离线 peer 通过 REST 发群消息，并等待群成员关系；`CiRestFixture` 没有群消息发送和群成员查询能力，无法在允许修改的文件内安全准备。                                                   |
| FL-CONV-013  | RN-CONV-016  | RN 5.1.0 在 `enableChatroomConversation=false` 时发送聊天室消息仍会创建本地 room conversation（Android 实测），与 Flutter 断言相反；该差异属于 native 行为，不在本轮用例内强行改断言。 |
| FL-MSG-012   | RN-MSG-013   | `downloadAttachment` 对本地路径重写为 external app 目录后读取 `.source` 报 ENOENT（Android 实测），属于 native 下载路径问题；上传路径已由 RN-MSG-012 覆盖。                            |

因此 `RN-AUTH-002`、`RN-CONV-014/015/018`、`RN-CONV-016`、`RN-MSG-011`、`RN-MSG-013` 这七个编号是故意留空的，不要复用。

## 覆盖要点

- AUTH：登出/重登恢复、重复登录 200、显式 `Conversations` 同步事件、未登录空用户/空 token 的平台错误码；AUTH-007 适配了“entry 已登录”的实际前置，先登出再触发同步。
- CONTACT：带/不带会话删除、黑名单增删查、未登录负例、缺失联系人、备注读写与恢复。
- CONV：扩展字段、latest/lastReceived、更新/删除、分页、过滤、批量删除、排序、置顶、未读、本地+服务端删除、会话标记；FL-CONV-013 因 native 仍创建本地 room conversation 而跳过。
- GROUP：建群/销毁/邀请确认、名称/描述/扩展/公告/头像/名片、配置、成员/管理员/成员信息/属性/黑名单/禁言/白名单、全员禁言、转让/退群/公开群、共享文件上传下载。5.1.0 本地成员缓存在清空 namecard 后可能仍返回旧值（Android 实测），GROUP-014 以服务端成员列表作为清空的权威读回，代码内有注释说明。
- MSG：发送最终回调、导入/更新、关键词/选项搜索、聚合、服务端历史、文件/图片上传、置顶、reaction、未登录/空接收方/缺失消息负例；下载因 native 路径问题跳过。
- PRESENCE：发布/查询/订阅/取消订阅/订阅列表；登录态用已配置的离线 peer 做订阅目标。
- ROOM：加入/重进、公告、成员移除、黑名单、禁言、管理员升降级。

## 验证

- `yarn typecheck`：通过（exit 0）。
- `yarn eslint example/src/ci/modules/*_cases.ts`：通过（exit 0）。
- `npx prettier --check example/src/ci/modules/*_cases.ts docs/ci/native-case-mapping.json`：通过。
- `node scripts/ci/check_case_mapping.js`：通过，96 个 case 与 mapping 一致。
- `yarn test:ci-scripts`：36/36 通过。
- Android 设备回归（模拟器 emulator-5554）：
  - `logged_out`：23/23 通过，run `20261119231916`。
  - `logged_in_contact`：6/6 通过，run `20261119232047`。
  - `logged_in_group`：24/24 通过，run `20261119232156`（GROUP-014 按上述服务端读回调整后通过）。
  - `logged_in_base`：41/41 通过，run `20261119233105`。
  - `logged_in_user_info`：2/2 通过，run `20261119233229`。

本轮没有修改 harness、entry、构建脚本或 native，也没有提交代码；iOS 未做设备回归。
