# 5.1.0 测试与 Demo 回迁：进度与恢复入口

- [规格](../../spec/test-demo-backport/2026-11-20-test-demo-backport-spec.md)
- [实施计划](2026-11-20-test-demo-backport-plan.md)
- 当前阶段：P7 阶段交付，P1 基线复核、P2 整体搬迁、P3 适配、P4 文档/工作流核对和 P5 主机验证已完成；P6 设备与远程验证未运行。
- 当前已修改范围：测试、Demo、workflow、CI 工具、说明文档及任务工作日志；SDK `src/`、`modules/`、发布配置和源 SPM 锁定结果未覆盖。
- 下一步：如具备设备/账号与远程授权，继续运行 P6；在此之前保持设备和远程结果为 `not-run`，不把主机通过替代设备通过。
- 最后更新：2026-11-20。

## 1. 恢复时先读这里

1. 阅读 AGENTS、本文件、spec 和 plan；以本文件的「当前阶段」判断执行位置。
2. 在目标 worktree 检查 `git status --short`、当前分支、HEAD 和差异；未提交文件也是当前任务状态，不得 reset 或全量重拷贝。
3. 对照下表确认源快照与目标起点；HEAD 与起点不同不代表错误，要先判断期间提交和用户改动。
4. 查看阶段表、迁移差异表及验证记录，确认哪些只是搬入、哪些已适配、哪些已验证。
5. 从明确的下一步继续。若状态与文件不符，先说明差异并校准记录，不凭聊天记忆覆盖文件。

| 项目 | 固定值 / 初始状态 |
| --- | --- |
| 工作目录 | `/Users/asterisk/Codes/zuoyu_rn/react-native-chat-sdk/.worktree/1.21.0` |
| 目标分支 | `1.21.0` |
| 目标起点 | `0219a9ad07d91341baca3c4d388f224f7b14a052` |
| 固定源 | `5.1.0` @ `2fa8397f4fb8880e677f78ab16d45ba81aec0b15` |
| 起始工作区 | 目标干净；源存在未跟踪 `.codex/`，排除在搬迁外 |
| 源规模 | CI 96 个 case；多设备 13 个场景；两分支 SDK Jest 各 19 个测试文件 |
| 源验证资料 | 仅作参考，不能作为本分支运行证据 |
| 当前提交/推送 | 本任务尚未提交、推送 |

## 2. 阶段检查点

| 阶段 | 状态 | 当前证据 / 下一步 |
| --- | --- | --- |
| P0 文档与审查 | 已完成 | 用户确认按分支工作流迁移和手动运行，不新增默认分支 schedule |
| P1 基线复核 | 已完成 | 固定 SHA、工作区、文件集合、工具可用性和目标基线已核对 |
| P2 整体搬迁 | 已完成 | 按批准路径从固定源提交搬入；目标 SDK/native 和 SPM 锁定结果未覆盖 |
| P3a 公共适配 | 已完成 | 移除目标不存在的 data-sync、批量会话删除、群配置更新、群回执等依赖；目标接口按原位调用适配 |
| P3b CI/Jest | 已完成 | 96→93 个映射 case（移除 3 个无等价能力编号并保留编号空洞）；25 suites / 214 tests 通过 |
| P3c 脚本/多设备 | 已完成 | 单设备 JSON 按目标 registry 对账；移除两个 `deleteConversations` 工单脚本；多设备资产保留并记录已知限制 |
| P4 工作流/工程/文档 | 已完成 | workflow 仅 `ci.yml`、手动 `ci-device.yml`；目标 native 4.25.x、签名和锁文件未被源覆盖；文档已更新 |
| P5 主机验证 | 已完成 | prepare、typecheck、lint、Jest、CI 脚本、mapping、循环依赖、shell/YAML、quality gate、diff check 均通过 |
| P6 设备/远程验证 | 未运行 | 设备、账号、编排器与 GitHub 环境尚未检查 |
| P7 交付 | 已完成（阶段交付） | 迁移/适配清单、验证结果、限制和最终范围已同步；P6 未运行不等同于整项设备验收通过 |

## 3. 已确认决策与审查

| 日期 | 决策 | 来源 |
| --- | --- | --- |
| 2026-11-20 | 整体搬迁现成资产，再原位适配；不重新设计、另造兼容层或重复用例 | 用户明确纠正迁移方式 |
| 2026-11-20 | `.github/workflows/` 同样从 `5.1.0` 搬迁 | 用户明确补充范围 |
| 2026-11-20 | 先交付 spec/plan/进度记录，用户看完后再安装并使用 `grill-me` | 用户指定后续顺序 |
| 2026-11-20 | 验证失败先区分能力缺失、接口差异、SDK 缺陷和环境阻塞；确认是 TypeScript/iOS wrapper/Android wrapper SDK 缺陷时记录证据，不修改测试掩盖问题 | 用户明确执行约束 |
| 2026-11-20 | 定时 CI 采用分支工作流迁移和手动运行范围，不额外修改默认分支实现每日 `1.21.0` 调度 | 用户确认无其他问题并授权开始 |

### grill-me 审查记录（2026-11-20）

- 安装来源：`mattpocock/skills`，路径 `skills/productivity/grill-me`，安装器默认 main 快照；未记录上游提交号。
- 安装位置：`/Users/asterisk/.codex/skills/grill-me/SKILL.md`，SHA-256：`caaf8b8de1684f96e26b28f3c29189db5c89cce4b73e1c93d86164f66ef88637`。
- 该 skill 实际内容要求调用 `grilling`；按其委托读取 `/Users/asterisk/.agents/skills/grilling/SKILL.md` 并执行审查。不是擅自替换指定 skill。
- 已核实并回填：旧版数据加载/本地就绪必须保留有效断言；quality 补入现成 example Jest/脚本自测命令；报告中源 5.x 专用规则需要原位适配。
- 外部编排器已找到：`/Users/asterisk/Codes/zuoyu/im-test-orchestrator`，HEAD `537aa6c50c191ca63779048a44e61f1a7d7d896c`，工作区干净，Dart 入口和 package_config 存在；没有运行工具或验证设备，不能记通过。空 pin 不阻塞当前机器定位。
- 定时 CI 范围已确认：只迁移分支工作流并支持手动选 `1.21.0` 运行，不额外修改默认分支实现每天自动测 `1.21.0`。GitHub schedule 的默认分支限制已核实。
- 已确认原则不重问：整体搬迁、原位适配、可移除确实不支持能力、保护目标 SDK/native、保留源多设备支持限制，以及 SDK 缺陷不得通过修改测试掩盖。

## 4. 搬迁与适配记录

实施时在本节维护一份记录，直接填写具体路径、case ID 或脚本步骤；直接复用的同类文件可按目录/列表批量记，适配和移除必须能逐项追溯。保留源 case ID/场景名，移除编号不重用。

| 资产 / case ID | 来源 | 处理结论 | 目标改动或移除理由 | 验证状态 |
| --- | --- | --- | --- | --- |
| `example/src/`、`example/ci/`、`example/multi_cases/`、`src/__tests__/`、`scripts/ci/`、`.github/workflows/` | 固定源 `5.1.0@2fa8397f` | 已搬入并完成适配 | 目标特有 smoke/nightly 资产按源删除清单受控移除；SDK/native 未覆盖 | 主机验证通过 |

工作流搬迁结果：已迁入 `ci.yml`、`ci-device.yml`；已移除旧 `device-smoke.yml`、`single-account-nightly.yml` 及专属脚本/JSON。目标原生构建适配（含 `pod install --repo-update`）仍在 P4 核对。

数量对账：

| 资产 | 源输入 | 直接复用 | 适配 | 移除 | 待处理 |
| --- | ---: | ---: | ---: | ---: | ---: |
| CI case | 96 | 0 | 93 | 3 | 0 |
| 多设备场景 | 13 | 13 | 0 | 0 | 0 |
| 单设备 JSON 脚本/步骤 | 5 个版本/工单 JSON | 5 个保留脚本 | 按 registry/API 原位适配 | 2 个批量删除工单 JSON | 0 |

这里统计迁移处理结果；pass/fail/blocked/not-run 的运行数量另记，不混为同一指标。

## 5. 验证与阻塞记录

| 平台 / 范围 | 命令 / 运行标识 | 结果 | 证据位置 | 下一步 |
| --- | --- | --- | --- | --- |
| 文档 | 3 个文件、6 个内部链接及空白检查；`git diff --check`；只读一致性检查 | pass | 本组文档；新增文件另做内容检查，未运行 SDK 测试 | 用户审阅 |
| 静态 / Jest / 脚本 | `yarn prepare`; `yarn typecheck`; `yarn lint`; `yarn test --no-watchman --runInBand`; `yarn test:ci-scripts`; `node scripts/ci/check_case_mapping.js`; `yarn check:circular:dpdm`; shell/YAML parse; `bash scripts/ci/run_quality.sh`; `git diff --check` | pass（25 suites/214 tests；36/36 CI script tests） | — | — |
| Android / iOS 构建与单设备 | 未运行 | not-run | — | 需要设备、账号和原生工具链 |
| Android 多设备 | 未运行 | not-run | — | P6，先核实环境和适用场景 |
| iOS 多设备 | 源编排器尚不支持 | 范围外限制 | 源多设备文档 | 本次不开发新编排链路 |
| GitHub 工作流 | 未触发 | not-run | — | 本地验证后按授权核查远程执行 |

后续每次失败写清：实际命令、平台、退出码/用例、已确认原因或假设、下一步。证据用项目相对路径或远程运行链接，注明 `artifacts/` 等本地证据是否仅在当前机器可用；不记录账号、token、secret 或未脱敏日志。

P1/P2 验证记录：目标基线 `yarn typecheck`、`yarn lint`、全量 Jest（19 suites / 122 tests）和 `yarn check:circular:dpdm` 均通过，`git diff --check` 通过。搬入后 `yarn lint` 通过、`node scripts/ci/check_case_mapping.js` 通过、`yarn test:ci-scripts` 36/36 通过；搬入后 `yarn typecheck` 失败，完整 Jest 为 22/25 suites、196/205 tests 通过，失败集中在迁入的事件/模型测试及目标不存在的 5.x API。该结果是适配输入，不是 SDK 缺陷结论。

当前未决事项：设备回归、iOS/Android Demo 构建和远程 GitHub workflow 尚未运行。当前没有把主机测试失败归因成 SDK 缺陷；目标明确缺失的 API 已按用户规则移除并记录。

### 已适配/移除的目标差异

- `ChatDataSyncType`、`dataSyncType`、`onDataSyncStart/Finish`：目标 1.21.0 没有公开能力；保留固定 entry，登录后用 `isConnected`、`fetchAllContacts`、`fetchJoinedGroupsFromServer` 等目标 API 准备状态。
- `updateGroupConfigs`、`deleteConversations`、群消息回执 API、`clearConversationUnreadMessageCount`：目标公开 registry/SDK 没有等价 API；移除对应步骤/工单 JSON，不用循环单删或改断言伪造覆盖。
- `getConversationsFromDB`：脚本 registry 名称保留来源命名，内部调用目标 `fetchConversationsFromDB(cursor, pageSize)`。
- `renewToken`：脚本 registry/API 名称改为目标 `renewAgoraToken`；设备管理调用显式 `isPassword:false`。
- agent registry 的 `ChatGroupOptions` 构造改为依赖注入，避免单测加载 native module；这是测试隔离适配，不改 SDK。

## 6. 过程记录

- 2026-11-20：完成两分支文档/代码只读分析，固定来源与目标起点；确认整体搬迁和 workflows 范围，编写本组文档。代码迁移与测试执行均未开始。
- 2026-11-20：完成文档链接、空白及一致性检查；澄清可先交付带未验收项的阶段结果，但设备/远程验证未完成不能标记整项验收通过。此检查不替代用户审阅后的 `grill-me` 审查。
- 2026-11-20 12:07：用户通过文档并要求继续；已安装并使用指定 `grill-me` 及其委托 `grilling`，完成事实审查和文档修正，待用户明确定时 CI 范围。尚未开始搬迁或执行测试。
- 2026-11-20：用户确认验证失败的归因规则和 SDK 缺陷处理方式，并授权开始任务；定时 CI 按分支工作流迁移和手动运行范围执行，进入 P1 基线复核。
- 2026-11-20：P1 完成；固定源/目标提交一致，源规模复核为 96 个 CI case、13 个多设备场景；目标基线 typecheck、lint、Jest 122/122、循环依赖检查通过。
- 2026-11-20：P2 完成；从固定源提交按批准路径搬入测试、Demo、工具、说明文档和 workflows，未覆盖 SDK `src/`、`modules/`、发布配置或源 SPM 锁定结果。
- 2026-11-20：P2 后首轮验证显示 mapping 通过、CI 脚本自测 36/36、lint 通过；typecheck 和部分 Jest 因 5.x API 与 1.21.0 差异失败，进入 P3 归因和适配。
- 2026-11-20：完成 P3/P4；CI 用例、Demo agent、单设备脚本和文档按目标 1.21.0/4.25.x 适配。目标缺失能力的测试已移除，未修改 SDK `src/`、Android/iOS wrapper 或 native 依赖。
- 2026-11-20：主机验证全部通过：typecheck、lint、25 suites/214 tests、36/36 CI script tests、mapping、循环依赖、YAML 和 diff check；设备回归与远程 workflow 保持 not-run。
- 2026-11-20：收尾核对完成；补记 `yarn prepare`、shell/YAML 检查和 `run_quality.sh` 均通过，计划复选框与本进度同步，最终范围检查未发现 SDK/native、锁文件、凭据或构建产物被改动；设备、真实单设备脚本和远程 workflow 仍保持 `not-run`。

维护方式：上方当前状态随进度更新；本节按时间追加重要检查点、阻塞、用户纠正和交接信息。每次阶段结束或准备中断时写明「已完成什么、剩什么、下一步从哪里继续」，不积累重复命令流水。
