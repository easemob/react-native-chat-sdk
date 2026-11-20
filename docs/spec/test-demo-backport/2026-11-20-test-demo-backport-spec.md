# 5.1.0 测试与 Demo 整体回迁到 1.21.0：规格

- 状态：用户已审阅通过；定时 CI 范围已确认；正在进行 P1 基线复核。
- 日期：2026-11-20。
- [实施计划](../../plan/test-demo-backport/2026-11-20-test-demo-backport-plan.md)
- [进度与恢复入口](../../plan/test-demo-backport/2026-11-20-test-demo-backport-progress.md)

## 1. 目标与已确认原则

将 `5.1.0` 已有的三类设备测试、Demo 及配套工作流整体搬到 `1.21.0`，再在原文件中适配版本差异，使目标分支直接复用现有测试架构和用例。

三类设备测试指 CI 设备回归、单设备 JSON API 脚本、多设备协同；Jest 单元测试和契约测试作为配套资产一并处理。

用户已明确：

1. 先整体搬迁，再集中适配；不逐例重新实现。
2. 不重新设计测试架构，不另建通用兼容层，不为了迁移创造另一套文件和用例。
3. 不兼容部分可以修改或移除。源分支已有、目标缺少的文件直接复制，属于搬迁。
4. `.github/workflows/` 必须从 `5.1.0` 一并迁入。
5. 先完成 spec、plan、进度记录供用户审阅；用户看完后，再安装并使用指定的 `grill-me` 审查方案，处理结论后进入实施。
6. 验证失败必须先判定原因：缺少目标能力的测试才移除，接口变化在原测试/脚本中适配；若确认是 SDK 的 TypeScript、iOS wrapper 或 Android wrapper 缺陷，记录证据、影响和待修复项，不为迁就 SDK 错误而修改测试用例。

## 2. 固定基线

| 项目 | 基线 |
| --- | --- |
| 源分支 / 提交 | `5.1.0` / `2fa8397f4fb8880e677f78ab16d45ba81aec0b15` |
| 目标分支 / 起始提交 | `1.21.0` / `0219a9ad07d91341baca3c4d388f224f7b14a052` |
| 工作目录 | `react-native-chat-sdk/.worktree/1.21.0` |
| 源参考目录 | `react-native-chat-sdk/.worktree/5.1.0` |
| 目标 SDK / native 声明 | RN SDK `1.21.0`；Android `4.25.1`；iOS CocoaPods `~> 4.25.0`，可选 SPM 最低 `4.25.0` |
| JS 工具链 | 两分支现有 React Native `0.83.10`、TypeScript `5.9`、Yarn `4.14.1`；本次无升级需求 |
| 源 CI 用例 | 96 条：未登录 23、base 41、group 24、contact 6、user info 2 |
| 源多设备场景 | 13 个 YAML/JSON 配对场景 |

以上数量是迁移输入，不是目标通过数量。复制时使用固定提交的受 Git 跟踪文件，排除源 worktree 中的未提交内容。后续分支移动时先检查差异，在进度记录中明确是否更新基线，不能混用多个源快照。

## 3. 搬迁范围

| 范围 | 源资产与处理 |
| --- | --- |
| Demo 与应用内测试 | 整体迁入 `example/src/`，保留原目录布局、页面、registry、auto、ci、agent 及其测试；在原文件中适配 |
| 单设备脚本 | 整体迁入 `example/ci/`，按目标公开能力修改或移除脚本/步骤；更新默认执行路径 |
| 多设备协同 | 整体迁入 `example/multi_cases/`、`example/target-rn.yaml`、`example/multi-tool.json`；沿用外部 `im-test-orchestrator` |
| Jest | 整体迁入 `src/__tests__/` 后按目标契约适配，恢复目标仍适用的旧接口测试，避免源版本删 API 时连带丢失覆盖 |
| 主机工具 | 整体迁入 `scripts/ci/`，以及新增命令依赖的 `scripts/env-gettoken.js` |
| GitHub 工作流 | 整体迁入 `.github/workflows/`；最终为源分支的 `ci.yml`、`ci-device.yml`，再做目标构建适配 |
| 配套配置 | 迁入相关 `package.json` scripts、Babel 环境变量内联、忽略规则；核对 `.github/actions/setup/action.yml` 及工具链配置依赖 |
| 说明文档 | 迁入 `docs/ci/`、`docs/testing/` 及其必要设计引用，修正版本、数量、入口、限制；更新 AGENTS 中的测试/CI 操作说明 |
| Demo 原生工程 | 保留目标原生依赖、版本和签名配置；从源迁入运行测试确实需要的工程设置，再验证双端构建 |

整体搬迁以测试/Demo 资产为单位，不是合并整个 `5.1.0` 分支。`src/` 下非测试 SDK 实现、`modules/` 原生实现、发布配置和目标已有平版报告不被源版本覆盖。凭据、本地配置、构建产物、日志、依赖目录不参与复制。

优先在迁入的现有文件内完成改动；除本次明确要求的管理文档外，不另造运行框架、兼容包或重复测试集。

## 4. 工作流迁移要求

- `ci.yml` 沿用源质量检查和双端构建结构；`ci-device.yml` 沿用双端各一次构建、各一条登录/未登录测试通道的 6 个 job。
- 源 `ci.yml` 为 PR 与手动触发；`ci-device.yml` 的迁移保留手动触发和 checkout 行为，不写死 `5.1.0`。本次不额外修改默认分支以实现 `1.21.0` 的每日 schedule；远程定时调度不属于本次回迁范围。
- 删除已被源架构替代的 `device-smoke.yml`、`single-account-nightly.yml`，同步移除旧专属 `smoke_local.sh`、`nightly_local.sh`、`write_single_account_config.sh` 和 `no_login_smoke.json`、`single_account.json`；清理悬空引用。
- 迁移闭环必须覆盖 workflow → setup → package scripts → runner → device driver → assertion → case mapping → App/Babel 启动模式。
- 目标已有 `pod install --repo-update` 属于有说明依据的构建适配，整体复制后保留这项目标差异；不照搬源 SPM 锁定结果或本地签名信息。
- 登录通道沿用 `rn-single-account` 环境和 `E2E_APP_KEY`、`E2E_USER_ID`、`E2E_REST_API`、`E2E_CLIENT_ID`、`E2E_CLIENT_SECRET`。沿用运行时 token、临时配置权限和清理机制，旧密码变量不作为新 CI 的输入。
- 远程环境准入、凭据配置、分支上的工作流可发现性与实际调度行为，作为远程验证前置单独核查。迁入 YAML 不代表 GitHub 已执行成功；本轮不触发远程工作流或修改仓库设置。

审查补充：GitHub 的 schedule 只在默认分支运行，原样迁入 `1.21.0` 不产生每日运行。本次按用户确认，以分支工作流迁移和手动运行能力为边界，不额外修改默认分支实现每日自动测试。远程实际配置仍在执行阶段核查，但不触发远程工作流或修改仓库设置。

官方行为依据：`https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule`（2026-11-20 查阅）。

## 5. 版本适配规则

每项迁移资产标记为「直接复用」「原位适配」「移除」，另记验证状态。适配/移除要能定位源用例、目标文件或 case ID，并说明旧版 API/契约依据；记录集中放在进度文档，不另开发登记工具。

| 已确认差异 | 处理方向 |
| --- | --- |
| `ChatDataSyncType`、`dataSyncType`、`onDataSyncStart/Finish` 在目标不存在 | 保留 5 个 entry 的组织方式；原位调整初始化、登录等待和数据就绪判断，使用目标可观察条件及超时；移除专测新同步契约的断言；显式配置 `autoLogin:false` 避免历史登录态干扰 |
| 群创建 `configs` / `ChatGroupConfigs` 与旧版 `options` / `ChatGroupOptions` | 按旧参数和枚举适配；没有等价能力的 `updateGroupConfigs` 测试移除 |
| 在线设备查询/踢设备的旧参数默认使用密码 | 使用 token 时显式传 `isPassword:false`，检查 Demo、agent 和用例中的所有调用 |
| 本地会话分页接口名称及参数变化 | 使用目标 `fetchConversationsFromDB(cursor, pageSize)`；保留目标要求的初始化前提 |
| 批量删除、新排序/未读语义 | 只有旧能力能保持测试意图时才适配；不能用循环单删冒充批量 API 契约验证 |
| 消息回执类型、方法、事件发生变化 | 按旧版 `sendMessageReadAck`、群回执和 `onMessagesRead` 等真实契约适配，不能仅改名称或伪造新事件 |
| 续 token、普通推送、连接事件变化 | 按目标 `renewAgoraToken`、`updatePushConfig` 和旧事件接口核实并适配；保留目标仍支持的密码登录、推送入口与相应测试 |
| mapping、脚本默认值、报告和文档写入源版本 | 更新目标实际基线和有效路径；原场景名中的引入版本可保留作为来源，不能冒充当前运行 SDK 版本 |

源文档中的「entry 不得修改」针对日常增加用例。本次用户已明确授权跨版本适配，因此允许在原 entry 中改初始化参数，但不增加另一套 entry 或测试架构。

审查落实的适配要点：

- `loginForCi` 不能只去掉同步事件等待后改为检查连接。目标已有 `fetchAllContacts`、`fetchJoinedGroupsFromServer`；在原 helper/用例中显式加载，并用原 `waitForCi` 验证所需本地状态，包含分页和联系人恢复流程。若用例本身测自动同步，则不能用手动刷新冒充该契约通过，应按旧版能力改写测试意图或记录移除。
- 现有 `run_quality.sh` 必须纳入 example 的 ci/agent Jest 和 `test:ci-scripts` 两个现成测试入口，不新增测试框架。
- `auto_report.js` 根据 `port_5_0_0` 文件名强制检查新同步事件，并输出源版本已知崩溃结论。迁移时原位修正这些规则及默认路径；只改报告标题或 SDK 版本不足以完成适配。

目标确实缺少能力可以移除测试；目标声明支持而执行失败则记录为失败/缺陷候选，不能用移除或放宽断言制造通过。比如源 wrapper 对「更新不存在消息」返回 `500` 的改动，需要核实目标契约与实现，不能直接将源修复一起搬入，也不能仅按当前返回倒推期望值。需要 SDK 业务修复时单独报告并确认范围。

## 6. 多设备范围与现有限制

继续使用现有 agent、协议和外部编排器，优先在 RN 的现有 registry/listeners/canonical 文件内适配。确需修改或移除场景时，记录为 `1.21.0` 分支差异，不修改源分支、Flutter 用例或编排器来配合本次回迁。

源分支记录仅 Android 的 message-delivery、presence、group-member-join 三个场景完成端到端验收；iOS reverse 编排尚不支持，message-recall 暂停，group-namecard 有已知问题，工具 pin 仍为空。迁移保留并准确说明这些限制，不扩展本次任务为新编排器开发。

源 native 5.1.0 的 delivered 回执例外不能直接视为 4.25.x 的事实。目标相关回调是否可用须验证，再决定对应场景适配与记录。来源验证结果仅作背景，不能算目标验收证据。

## 7. 验收标准

1. **来源完整**：三类测试、Demo、工具和工作流有固定来源；每个源 CI case/多设备场景均能对账为保留、适配或有原因的移除。JSON 脚本删改步骤同样有记录。
2. **结构复用**：沿用原目录和执行入口；新增到目标分支的测试文件来自源资产，没有另起框架或兼容层。
3. **静态与主机验证**：类型检查、lint、完整 Jest（包括 example 内 ci/agent 测试）、脚本自测、case mapping、一致性/路径检查和库构建通过；工作流 YAML 与调用链有效。
4. **设备验证**：Android/iOS Demo 能构建，普通 UI 初始化/登录/API 调用可用；目标支持的 5 个 CI entry 和适配后的单设备脚本有各平台运行结果；多设备仅按现有 Android 能力验证适用场景。
5. **结果可信**：fail、blocked、not-run 与 pass 分开；零用例、缺失用例、清理失败不能记通过。缺设备/账号时保留明确的未验收状态，不以编译成功替代设备回归。
6. **CI 可追溯**：本地验证与远程 GitHub 运行分别记录；若远程未运行，最终明确标注，不声称 CI 全绿。
7. **目标基线完整**：SDK 版本、native 依赖及公开接口保持目标分支基线；原生工程仅包含必要的测试运行适配。
8. **可恢复**：每阶段更新计划状态与进度记录，保留最后成功检查点、失败命令/证据和下一步；中断后不需要依赖聊天记录推测状态。

所有适用验证完成才能标记「迁移已验收」。若存在环境阻塞，可分别标记「代码已迁移、设备/远程验证未完成」，不能把整项任务勾为完成。

## 8. 本轮交付与后续顺序

用户已审阅文档并授权继续。指定 `grill-me` 已从 `mattpocock/skills` 的 `skills/productivity/grill-me` 安装到用户级 skills；其实际指令为调用 `grilling`，本次按该流程审查。事实性修正已回填，定时 CI 范围按“迁移分支工作流并支持手动运行，不新增默认分支 schedule”执行。

当前尚未开始测试/Demo/工作流搬迁，未提交或推送。已进入 P1 基线复核，不重复确认已经通过的整体搬迁方案。
